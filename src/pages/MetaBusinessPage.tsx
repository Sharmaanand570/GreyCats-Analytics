import { useEffect, useState } from "react";
import {
  useFacebookPosts,
  useInstagramMedia,
  useInstagramProfile,
  useMetaBusinessAccounts,
  useMetaBusinessAnalyticsSummary,
  useMetaBusinessDisconnect,
  useMetaBusinessRefreshPage,
  useMetaBusinessSync,
} from "@/features/meta/hooks/useMetaBusinessData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, RefreshCw, Facebook, Instagram } from "lucide-react";
import { format } from "date-fns";

function MetaBusinessPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const {
    data: accountsData,
    isLoading: isLoadingAccounts,
    error: accountsError,
  } = useMetaBusinessAccounts();

  const {
    mutateAsync: syncMeta,
    isPending: isSyncing,
  } = useMetaBusinessSync();

  const {
    mutateAsync: refreshPageToken,
    isPending: isRefreshingPage,
  } = useMetaBusinessRefreshPage();

  const {
    mutateAsync: disconnectAccount,
    isPending: isDisconnecting,
  } = useMetaBusinessDisconnect();

  // Select first account by default
  useEffect(() => {
    if (!selectedAccountId && accountsData?.accounts?.length) {
      setSelectedAccountId(accountsData.accounts[0].id.toString());
    }
  }, [accountsData, selectedAccountId]);

  const accountIdNumber = selectedAccountId ? parseInt(selectedAccountId) : undefined;

  const {
    data: analyticsSummary,
    isLoading: isLoadingSummary,
  } = useMetaBusinessAnalyticsSummary(accountIdNumber);

  const {
    data: facebookPosts,
    isLoading: isLoadingPosts,
  } = useFacebookPosts(accountIdNumber);

  const {
    data: instagramMedia,
    isLoading: isLoadingMedia,
  } = useInstagramMedia(accountIdNumber);

  const {
    data: instagramProfile,
    isLoading: isLoadingIgProfile,
  } = useInstagramProfile(accountIdNumber);

  const handleSync = async () => {
    if (!accountIdNumber) return;
    try {
      await syncMeta({ accountId: accountIdNumber });
    } catch (error) {
      console.error(error);
    }
  };



  const handleRefreshPage = async () => {
    if (!accountIdNumber) return;
    try {
      await refreshPageToken(accountIdNumber);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    if (!accountIdNumber) return;
    try {
      await disconnectAccount(accountIdNumber);
      setSelectedAccountId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedAccount = accountsData?.accounts?.find(
    (acc) => acc.id.toString() === selectedAccountId
  );

  // Prepare chart data from summary if available
  // The summary structure in API definition:
  // summary: { page: { data: [{ name: "page_impressions", values: [...] }] }, ... }
  const pageImpressions = analyticsSummary?.summary?.page?.data?.find(
    (d) => d.name === "page_impressions"
  )?.values;

  const chartData = pageImpressions?.map((item) => ({
    date: item.end_time ? format(new Date(item.end_time), "MMM dd") : "N/A",
    value: item.value,
  })) || [];

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="w-full h-[4.8em] border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white z-10 border-2 border-white">
                  <Facebook size={18} />
                </div>
                <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white z-0 border-2 border-white">
                  <Instagram size={18} />
                </div>
              </div>
              <span className="font-medium text-xl">Meta Business</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {accountsData?.accounts?.length ? (
                <Select
                  value={selectedAccountId || ""}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountsData.accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.pageName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing || !selectedAccountId}
                className="gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sync
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefreshPage}
                disabled={isRefreshingPage || !selectedAccountId}
              >
                {isRefreshingPage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh Token"}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting || !selectedAccountId}
              >
                {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disconnect"}
              </Button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="w-full px-5 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Meta Business</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Content */}
          <div className="w-full px-5 py-6 space-y-6">
            {isLoadingAccounts ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : accountsError ? (
              <div className="text-destructive p-4 border border-destructive/20 rounded-md bg-destructive/5">
                Failed to load accounts: {accountsError.message}
              </div>
            ) : !selectedAccountId ? (
              <div className="text-center py-10 text-muted-foreground">
                No Meta Business accounts connected. Please connect an account.
              </div>
            ) : (
              <>
                {/* Account Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Facebook Page</CardTitle>
                      <Facebook className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedAccount?.pageName}</div>
                      <p className="text-xs text-muted-foreground">
                        ID: {selectedAccount?.pageId}
                      </p>
                      {analyticsSummary?.summary?.page?.data && (
                        <div className="mt-4 text-sm">
                          <span className="text-green-600 font-medium">
                            {analyticsSummary.summary.page.data[0]?.values[0]?.value || 0}
                          </span>
                          <span className="text-muted-foreground ml-1">Impressions (Last 28d)</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Instagram Business</CardTitle>
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                      {selectedAccount?.instagramUsername ? (
                        <>
                          <div className="text-2xl font-bold">@{selectedAccount.instagramUsername}</div>
                          <p className="text-xs text-muted-foreground">
                            ID: {selectedAccount.instagramBusinessId}
                          </p>
                          {isLoadingIgProfile ? (
                            <Skeleton className="h-4 w-20 mt-4" />
                          ) : (
                            <div className="mt-4 flex gap-4 text-sm">
                              <div>
                                <span className="font-bold">{instagramProfile?.profile?.followers_count || 0}</span>
                                <span className="text-muted-foreground ml-1">Followers</span>
                              </div>
                              <div>
                                <span className="font-bold">{instagramProfile?.profile?.media_count || 0}</span>
                                <span className="text-muted-foreground ml-1">Posts</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No Instagram account connected to this Page.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Analytics Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Page Impressions</CardTitle>
                    <CardDescription>
                      Daily page impressions over time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : chartData.length > 0 ? (
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#2563eb"
                              fillOpacity={1}
                              fill="url(#colorImpressions)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No impression data available.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Posts & Media */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Facebook Posts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Facebook Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPosts ? (
                        <div className="space-y-4">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : facebookPosts?.posts?.length ? (
                        <div className="space-y-4">
                          {facebookPosts.posts.slice(0, 5).map((post: any) => (
                            <div key={post.id} className="flex gap-3 border-b pb-3 last:border-0">
                              {post.full_picture && (
                                <img
                                  src={post.full_picture}
                                  alt="Post"
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {post.message || "No caption"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(post.created_time), "PPP")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No recent posts found.</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Instagram Media */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Instagram Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingMedia ? (
                        <div className="space-y-4">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : instagramMedia?.media?.length ? (
                        <div className="grid grid-cols-3 gap-2">
                          {instagramMedia.media.slice(0, 6).map((media) => (
                            <div key={media.id} className="aspect-square relative group">
                              <img
                                src={media.media_url}
                                alt="Instagram Media"
                                className="w-full h-full object-cover rounded-md"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                <span className="text-white text-xs font-medium capitalize">
                                  {media.media_type.toLowerCase().replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No recent media found.</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetaBusinessPage;
