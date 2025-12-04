import { useState } from "react";
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
  useFacebookPageInfo,
  useFacebookPagePosts,
  useFacebookPages,
  useFacebookPostInsights,
  useFacebookSyncInsights,
} from "@/features/meta/hooks/useMetaData";

function FacebookInsightsPage() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const {
    data: pagesData,
    isLoading: isLoadingPages,
    error: pagesError,
  } = useFacebookPages();

  const {
    data: pageInfoData,
    isLoading: isLoadingPageInfo,
    error: pageInfoError,
  } = useFacebookPageInfo(selectedPageId || undefined);

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useFacebookPagePosts(selectedPageId || undefined);

  const {
    data: postInsightsData,
    isLoading: isLoadingPostInsights,
    error: postInsightsError,
  } = useFacebookPostInsights(selectedPostId || undefined);

  const {
    mutate: syncFacebook,
    isPending: isSyncingFacebook,
  } = useFacebookSyncInsights();

  const pages = pagesData?.pages ?? [];
  const posts = postsData?.posts ?? [];

  const handleSyncFacebook = () => {
    if (!selectedPageId) return;
    syncFacebook({ pageId: selectedPageId });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-xl">Facebook Insights</span>
              <span className="text-xs text-muted-foreground">
                Drill into Facebook page performance, posts and engagement.
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
                  <BreadcrumbPage>Facebook Insights</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Select Facebook Page</CardTitle>
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
                    No Facebook pages found for this Meta connection.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={selectedPageId ?? ""}
                      onChange={(e) =>
                        setSelectedPageId(e.target.value || null)
                      }
                    >
                      <option value="">Select a page</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!selectedPageId || isSyncingFacebook}
                        onClick={handleSyncFacebook}
                      >
                        {isSyncingFacebook ? "Syncing..." : "Sync Facebook Insights"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPageId && (
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Page Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPageInfo ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : pageInfoError ? (
                      <p className="text-sm text-red-500">
                        {(pageInfoError as Error).message ||
                          "Failed to load page info."}
                      </p>
                    ) : pageInfoData?.page ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Name: </span>
                          {pageInfoData.page.name}
                        </div>
                        <div>
                          <span className="font-medium">Fans: </span>
                          {pageInfoData.page.fan_count.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Category: </span>
                          {pageInfoData.page.category_list?.[0]?.name ?? "—"}
                        </div>
                        {pageInfoData.page.link && (
                          <div>
                            <span className="font-medium">Link: </span>
                            <a
                              href={pageInfoData.page.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                            >
                              View on Facebook
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No page info available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPosts ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : postsError ? (
                      <p className="text-sm text-red-500">
                        {(postsError as Error).message ||
                          "Failed to load posts."}
                      </p>
                    ) : posts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No posts found for this page.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Message</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="w-[140px] text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {posts.map((post) => (
                              <TableRow key={post.id}>
                                <TableCell className="max-w-xs truncate">
                                  {post.message || "(no message)"}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    post.created_time
                                  ).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  {post.permalink_url && (
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <a
                                        href={post.permalink_url}
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
                                    onClick={() => setSelectedPostId(post.id)}
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
              open={!!selectedPostId}
              onOpenChange={(open) => !open && setSelectedPostId(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post Insights</DialogTitle>
                  <DialogDescription>
                    Engagement metrics for the selected Facebook post.
                  </DialogDescription>
                </DialogHeader>
                {isLoadingPostInsights ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : postInsightsError ? (
                  <p className="text-sm text-red-500">
                    {(postInsightsError as Error).message ||
                      "Failed to load post insights."}
                  </p>
                ) : !postInsightsData?.insights?.length ? (
                  <p className="text-sm text-muted-foreground">
                    No insights available for this post.
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {postInsightsData.insights.map((metric) => (
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

export default FacebookInsightsPage;



