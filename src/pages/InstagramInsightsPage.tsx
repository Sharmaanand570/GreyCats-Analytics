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
  useFacebookPages,
  useInstagramBusinessAccount,
  useInstagramMedia,
  useInstagramMediaInsights,
  useInstagramProfile,
  useInstagramSyncInsights,
} from "@/features/meta/hooks/useMetaData";

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
console.log("businessData",businessData,businessError,isLoadingBusiness,selectedPageId,pagesData);
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
    mutate: syncInstagram,
    isPending: isSyncingInstagram,
  } = useInstagramSyncInsights();

  const pages = pagesData?.pages ?? [];
  const media = mediaData?.media ?? [];

  console.log("mediaData",mediaData,mediaError,isLoadingMedia,igBusinessId,pages);

  const handleSyncInstagram = () => {
    if (!igBusinessId) return;
    syncInstagram({ igBusinessId });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-xl">Instagram Insights</span>
              <span className="text-xs text-muted-foreground">
                Explore Instagram profile and media performance.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/data-sources/meta-ads">Back to Meta Ads</Link>
              </Button>
            </div>
          </div>

          <div className="w-full px-5 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/data-sources">Data Sources</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/data-sources/meta-ads">Meta Ads</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Instagram Insights</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Linked Facebook Page</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!igBusinessId || isSyncingInstagram}
                  onClick={handleSyncInstagram}
                >
                  {isSyncingInstagram ? "Syncing..." : "Sync Instagram Insights"}
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingPages ? (
                  <Skeleton className="h-10 w-full" />
                ) : pagesError ? (
                  <p className="text-sm text-red-500">
                    {(pagesError as Error).message ||
                      "Failed to load Facebook pages."}
                  </p>
                ) : pages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No Facebook pages found. Connect a page in Meta Business
                    Suite first.
                  </p>
                ) : (
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={selectedPageId ?? ""}
                    onChange={(e) => setSelectedPageId(e.target.value || null)}
                  >
                    <option value="">Select a page</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                )}
              </CardContent>
            </Card>

            {selectedPageId && (
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Instagram Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBusiness ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : businessError ? (
                      <p className="text-sm text-red-500">
                        {(businessError as Error).message ||
                          "Failed to load Instagram business account."}
                      </p>
                    ) : !igBusinessId ? (
                      <p className="text-sm text-muted-foreground">
                        This Facebook page is not linked to an Instagram
                        business account.
                      </p>
                    ) : isLoadingProfile ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    ) : profileError ? (
                      <p className="text-sm text-red-500">
                        {(profileError as Error).message ||
                          "Failed to load Instagram profile."}
                      </p>
                    ) : profileData?.profile ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Username: </span>
                          {profileData.profile.username}
                        </div>
                        <div>
                          <span className="font-medium">Media count: </span>
                          {profileData.profile.media_count}
                        </div>
                        <div>
                          <span className="font-medium">Account type: </span>
                          {profileData.profile.account_type}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No profile data available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMedia ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : mediaError ? (
                      <p className="text-sm text-red-500">
                        {(mediaError as Error).message ||
                          "Failed to load media."}
                      </p>
                    ) : media.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No media found for this Instagram account.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Caption</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="w-[140px] text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {media.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="max-w-xs truncate">
                                  {item.caption || "(no caption)"}
                                </TableCell>
                                <TableCell>{item.media_type}</TableCell>
                                <TableCell className="text-right space-x-2">
                                  {item.permalink && (
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <a
                                        href={item.permalink}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        View
                                      </a>
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedMediaId(item.id)}
                                  >
                                    Insights
                                  </Button>
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
            )}

            <Dialog
              open={!!selectedMediaId}
              onOpenChange={(open) => !open && setSelectedMediaId(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Media Insights</DialogTitle>
                  <DialogDescription>
                    Performance metrics for the selected Instagram media.
                  </DialogDescription>
                </DialogHeader>
                {isLoadingMediaInsights ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : mediaInsightsError ? (
                  <p className="text-sm text-red-500">
                    {(mediaInsightsError as Error).message ||
                      "Failed to load media insights."}
                  </p>
                ) : !mediaInsightsData?.insights?.length ? (
                  <p className="text-sm text-muted-foreground">
                    No insights available for this media.
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {mediaInsightsData.insights.map((metric) => (
                      <div
                        key={metric.name}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium">{metric.name}</span>
                        <span>{metric.values?.[0]?.value ?? "—"}</span>
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


