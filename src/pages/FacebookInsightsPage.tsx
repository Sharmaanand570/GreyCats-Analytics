import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  useFacebookPageInfo,
  useFacebookPagePosts,
  useFacebookPages,
  useFacebookPostInsights,
  useFacebookSyncInsights,
} from "@/features/meta/hooks/useMetaData";
import { Facebook, ThumbsUp, Tag, ExternalLink, Calendar, MessageSquare, BarChart2, RefreshCw } from "lucide-react";

function FacebookInsightsPage() {
  const params = useParams<{ clientId?: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : null;
  const navigate = useNavigate();
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
  } = useFacebookPostInsights(selectedPostId || undefined, selectedPageId || undefined);

  const {
    mutateAsync: syncFacebook,
    isPending: isSyncingFacebook,
  } = useFacebookSyncInsights();

  const pages = pagesData?.pages ?? [];
  const posts = postsData?.posts ?? [];

  const handleSyncFacebook = async () => {
    if (!selectedPageId || !clientId) return;
    try {
      await syncFacebook({ clientId, body: { pageId: selectedPageId } });
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
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <Facebook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-zinc-900 leading-none">
                Facebook Insights
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5">
                Page performance & post engagement
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
                <BreadcrumbLink onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground cursor-pointer">
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
                <BreadcrumbPage className="font-medium text-foreground">Facebook</BreadcrumbPage>
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
                  <CardDescription>Choose a page to view organic performance</CardDescription>
                </div>
                {/* Sync Button */}
                {selectedPageId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSyncingFacebook}
                    onClick={handleSyncFacebook}
                    className="ml-auto flex-shrink-0"
                  >
                    {isSyncingFacebook ? (
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
                  <p className="text-sm text-muted-foreground">No Facebook pages connected.</p>
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
                {/* Page Info Column */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border shadow-sm h-full">
                    <CardHeader className="pb-3 border-b bg-zinc-50/40">
                      <CardTitle className="text-base font-semibold">Page Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {isLoadingPageInfo ? (
                        <div className="space-y-3">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : pageInfoError ? (
                        <p className="text-sm text-red-500">Failed to load info.</p>
                      ) : pageInfoData?.page ? (
                        <>
                          <div className="p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                              <ThumbsUp className="w-3.5 h-3.5" /> Total Fans
                            </p>
                            <p className="font-semibold text-lg">{pageInfoData.page.fan_count.toLocaleString()}</p>
                          </div>
                          <div className="p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                              <Tag className="w-3.5 h-3.5" /> Category
                            </p>
                            <p className="font-medium text-sm">{pageInfoData.page.category_list?.[0]?.name ?? "—"}</p>
                          </div>
                          {pageInfoData.page.link && (
                            <Button asChild variant="outline" className="w-full justify-between" size="sm">
                              <a href={pageInfoData.page.link} target="_blank" rel="noreferrer">
                                <span className="flex items-center gap-2">
                                  <Facebook className="w-3.5 h-3.5" /> Open Page
                                </span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                              </a>
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No details available.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Posts Column */}
                <div className="lg:col-span-2">
                  <Card className="border shadow-sm h-full flex flex-col">
                    <CardHeader className="pb-3 border-b bg-zinc-50/40">
                      <CardTitle className="text-base font-semibold">Recent Posts</CardTitle>
                      <CardDescription>Latest activity and engagement</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                      {isLoadingPosts ? (
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : postsError ? (
                        <div className="p-8 text-center text-sm text-red-500">
                          {(postsError as Error).message}
                        </div>
                      ) : posts.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No posts found for this page.
                        </div>
                      ) : (
                        <div className="overflow-x-auto max-h-[500px]">
                          <Table>
                            <TableHeader className="bg-zinc-50 sticky top-0">
                              <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Post Message</TableHead>
                                <TableHead className="w-[140px]">Published</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {posts.map((post) => (
                                <TableRow key={post.id} className="group">
                                  <TableCell>
                                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                  </TableCell>
                                  <TableCell className="max-w-[200px] lg:max-w-md">
                                    <p className="truncate font-medium text-sm">
                                      {post.message || <span className="italic text-muted-foreground">No message content</span>}
                                    </p>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(post.created_time).toLocaleDateString()}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {post.permalink_url && (
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                          <a href={post.permalink_url} target="_blank" rel="noreferrer" title="View on Facebook">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => setSelectedPostId(post.id)}
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

            <Dialog open={!!selectedPostId} onOpenChange={(open) => !open && setSelectedPostId(null)}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-md">
                      <BarChart2 className="w-4 h-4 text-blue-600" />
                    </div>
                    Post Insights
                  </DialogTitle>
                  <DialogDescription>
                    Detailed engagement metrics for the selected post.
                  </DialogDescription>
                </DialogHeader>

                {isLoadingPostInsights ? (
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : postInsightsError ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded text-sm">
                    Failed to load insights.
                  </div>
                ) : !postInsightsData?.insights?.length ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No insights data returned from API.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                    {postInsightsData.insights.map((metric) => (
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

export default FacebookInsightsPage;



