// @ts-nocheck - Legacy page, replaced by MetaBusinessDetailPage.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useFacebookPages,
  useInstagramBusinessAccount,
  useInstagramMedia,
  useInstagramMediaInsights,
  useInstagramProfile,
  useInstagramSyncInsights,
} from "@/features/meta/hooks/useMetaData";
import { Instagram, Users, Image as ImageIcon, Video, BarChart2, ExternalLink, RefreshCw, LayoutGrid } from "lucide-react";

function InstagramInsightsPage() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  const {
    data: pagesData,
    isLoading: isLoadingPages,
    error: pagesError,
  } = useFacebookPages();

  const {
    data: businessData,
    isLoading: isLoadingBusiness,
    error: businessError,
  } = useInstagramBusinessAccount(selectedPageId || undefined);

  const igBusinessId = useMemo(
    () => businessData?.instagramBusinessAccount?.id ?? null,
    [businessData]
  );

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useInstagramProfile(igBusinessId || undefined);

  const {
    data: mediaData,
    isLoading: isLoadingMedia,
    error: mediaError,
  } = useInstagramMedia(igBusinessId || undefined);

  const {
    data: mediaInsightsData,
    isLoading: isLoadingMediaInsights,
    error: mediaInsightsError,
  } = useInstagramMediaInsights(selectedMediaId || undefined);

  const {
    mutateAsync: syncInstagram,
    isPending: isSyncingInstagram,
  } = useInstagramSyncInsights();

  const pages = pagesData?.pages ?? [];
  const media = mediaData?.media ?? [];

  const handleSyncInstagram = async () => {
    if (!igBusinessId) return;
    try {
      await syncInstagram({ igBusinessId });
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] shadow-sm flex flex-col">
        {/* Header */}
        <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-6 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-pink-50 rounded-lg border border-pink-100">
              <Instagram className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-zinc-900 leading-none">
                Instagram Insights
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5">
                Explore Instagram profile and media performance
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link to="/data-sources/meta-ads">
                Back to Overview
              </Link>
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="w-full px-6 py-3 border-b bg-zinc-50/40">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to="/data-sources" className="text-muted-foreground hover:text-foreground">
                  Data Sources
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink to="/data-sources/meta-ads" className="text-muted-foreground hover:text-foreground">
                  Meta Ads
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground">Instagram</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Selection Card */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                <div>
                  <CardTitle className="text-base font-semibold">Select Facebook Page</CardTitle>
                  <CardDescription>Choose the Facebook page linked to your Instagram Business account</CardDescription>
                </div>
                {igBusinessId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSyncingInstagram}
                    onClick={handleSyncInstagram}
                    className="ml-auto flex-shrink-0"
                  >
                    {isSyncingInstagram ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                        Sync Insights
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {isLoadingPages ? (
                  <Skeleton className="h-10 w-full max-w-sm" />
                ) : pagesError ? (
                  <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
                    {(pagesError as Error).message || "Failed to load Facebook pages."}
                  </div>
                ) : pages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No Facebook pages found. Connect a page in Meta Business Suite first.
                  </p>
                ) : (
                  <div className="max-w-sm">
                    <Select
                      value={selectedPageId ?? ""}
                      onValueChange={(val) => setSelectedPageId(val || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPageId && (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border shadow-sm h-full">
                    <CardHeader className="pb-3 border-b bg-zinc-50/40">
                      <CardTitle className="text-base font-semibold">Instagram Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {isLoadingBusiness ? (
                        <div className="space-y-3">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : businessError ? (
                        <p className="text-sm text-red-500">
                          {(businessError as Error).message || "Failed to load Instagram business account."}
                        </p>
                      ) : !igBusinessId ? (
                        <div className="p-4 bg-amber-50 text-amber-800 rounded-md text-sm border border-amber-200">
                          This Facebook page is not linked to an Instagram business account.
                        </div>
                      ) : isLoadingProfile ? (
                        <div className="space-y-3">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : profileError ? (
                        <p className="text-sm text-red-500">
                          {(profileError as Error).message || "Failed to load Instagram profile."}
                        </p>
                      ) : profileData?.profile ? (
                        <div className="space-y-2">
                          <div className="p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                              <Instagram className="w-3.5 h-3.5" /> Handle
                            </p>
                            <p className="font-semibold text-lg">@{profileData.profile.username}</p>
                          </div>
                          <div className="p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                              <LayoutGrid className="w-3.5 h-3.5" /> Total Media
                            </p>
                            <p className="font-medium text-lg">{profileData.profile.media_count.toLocaleString()}</p>
                          </div>
                          <div className="p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                              <Users className="w-3.5 h-3.5" /> Account Type
                            </p>
                            <p className="font-medium capitalize">{profileData.profile.account_type.toLowerCase().replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No profile data available.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Media Table */}
                <div className="lg:col-span-2">
                  <Card className="border shadow-sm h-full flex flex-col">
                    <CardHeader className="pb-3 border-b bg-zinc-50/40">
                      <CardTitle className="text-base font-semibold">Media</CardTitle>
                      <CardDescription>Recent posts and performance</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                      {isLoadingMedia ? (
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : mediaError ? (
                        <div className="p-8 text-center text-sm text-red-500">
                          {(mediaError as Error).message || "Failed to load media."}
                        </div>
                      ) : media.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No media found for this Instagram account.
                        </div>
                      ) : (
                        <div className="overflow-x-auto max-h-[600px]">
                          <Table>
                            <TableHeader className="bg-zinc-50 sticky top-0 z-10">
                              <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Caption</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead className="w-[120px] text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {media.map((item) => (
                                <TableRow key={item.id} className="group">
                                  <TableCell>
                                    {item.media_type === 'VIDEO' ? (
                                      <Video className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] lg:max-w-md">
                                    <p className="truncate font-medium text-sm">
                                      {item.caption || <span className="italic text-muted-foreground">No caption</span>}
                                    </p>
                                  </TableCell>
                                  <TableCell className="text-xs font-medium text-muted-foreground">
                                    {item.media_type.replace(/_/g, ' ')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {item.permalink && (
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                          <a href={item.permalink} target="_blank" rel="noreferrer" title="View on Instagram">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                                        onClick={() => setSelectedMediaId(item.id)}
                                        title="View Insights"
                                      >
                                        <BarChart2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <Dialog
              open={!!selectedMediaId}
              onOpenChange={(open) => !open && setSelectedMediaId(null)}
            >
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="p-1.5 bg-pink-50 rounded-md">
                      <BarChart2 className="w-4 h-4 text-pink-600" />
                    </div>
                    Media Insights
                  </DialogTitle>
                  <DialogDescription>
                    Performance metrics for the selected Instagram media.
                  </DialogDescription>
                </DialogHeader>
                {isLoadingMediaInsights ? (
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : mediaInsightsError ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded text-sm">
                    Failed to load media insights.
                  </div>
                ) : !mediaInsightsData?.insights?.length ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No insights available for this media.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                    {mediaInsightsData.insights.map((metric) => (
                      <div key={metric.name} className="p-3 border rounded-lg bg-zinc-50/50">
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                          {metric.name.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-zinc-900">
                            {metric.values?.[0]?.value?.toLocaleString() ?? "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstagramInsightsPage;


