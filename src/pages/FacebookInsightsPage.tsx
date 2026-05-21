// @ts-nocheck - Modernized page with 3-column premium UI
import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useFacebookPageInfo,
  useFacebookPostInsights,
  useFacebookPagePosts,
  useFacebookSyncInsights,
} from "@/features/meta/hooks/useMetaData";
import { useClient } from "@/hooks/useClients";
import { 
  ThumbsUp, 
  Tag, 
  Calendar, 
  MessageSquare, 
  BarChart2, 
  RefreshCw, 
  Users, 
  Globe, 
  Building2, 
  ExternalLink as ExternalLinkIcon,
  ArrowUpRight,
  Share2,
  MessageCircle,
  BarChart3
} from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function FacebookInsightsPage() {
  const params = useParams<{ clientId?: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : null;
  const navigate = useNavigate();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { data: clientData, isLoading: isLoadingClient } = useClient(clientId);

  const pages = useMemo(() => {
    const rawAccounts = clientData?.metaBusinessAccounts ?? [];
    return rawAccounts.map((acc: any) => ({
      id: acc.metaAccount?.pageId,
      name: acc.metaAccount?.pageName || "Unknown Page",
      databaseId: acc.metaAccountId ?? acc.id,
    }));
  }, [clientData]);

  const isLoadingPages = isLoadingClient;

  // Auto-select the first page if none is selected
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const databaseId = selectedPage?.databaseId;

  const {
    data: pageInfoData,
    isLoading: isLoadingPageInfo,
  } = useFacebookPageInfo(databaseId);

  const {
    data: postsData,
    isLoading: isLoadingPosts,
  } = useFacebookPagePosts(databaseId);

  const {
    mutateAsync: syncFacebook,
    isPending: isSyncingFacebook,
  } = useFacebookSyncInsights();

  const posts = postsData?.posts ?? [];
  const selectedPost = posts.find(p => p.id === selectedPostId) || posts[0];

  useEffect(() => {
    if (posts.length > 0 && !selectedPostId) {
      setSelectedPostId(posts[0].id);
    }
  }, [posts, selectedPostId]);

  const handleSyncFacebook = async () => {
    if (!selectedPageId || !clientId) return;
    try {
      await syncFacebook({ clientId, body: { pageId: selectedPageId } });
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-[#fafafa]">
      <div className="w-full h-full flex flex-col">
        {/* --- 1. Top Navigation & Header --- */}
        <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm">
          <div className="flex flex-col gap-2 relative">
            <Breadcrumb>
              <BreadcrumbList className="text-xs font-medium text-slate-400">
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources/meta-business">Facebook</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900 font-bold">Facebook Insights</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1877F2] flex items-center justify-center shadow-[0_8px_16px_rgba(24,119,242,0.2)]">
                <SiFacebook className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Facebook Insights
                  <Badge variant="outline" className="bg-blue-50 text-[#1877F2] border-blue-100 rounded-full text-[10px] uppercase tracking-widest font-bold h-5">Organic</Badge>
                </h1>
                <p className="text-sm text-slate-500 font-medium">Page performance & organic post engagement</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-64">
                <Select
                    value={selectedPageId ?? ""}
                    onValueChange={(val) => setSelectedPageId(val || null)}
                >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-100 hover:bg-slate-50 transition-all px-4">
                        <SelectValue placeholder="Select Page..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-[20px] shadow-2xl border-slate-100 p-2">
                        {pages.map((page) => (
                            <SelectItem key={page.id} value={page.id} className="rounded-lg py-2 px-3 cursor-pointer">
                                <span className="font-bold text-xs">{page.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/data-sources/meta-business")}
              className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all px-6"
            >
              Back to Overview
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
          {/* --- 2. Summary Bar --- */}
          <section className="relative">
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden">
              <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Followers</p>
                            <p className="text-lg font-black text-slate-900 leading-none">
                                {isLoadingPageInfo ? "..." : (pageInfoData?.page?.fan_count?.toLocaleString() || "0")}
                            </p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Category</p>
                            <p className="text-lg font-black text-slate-900 leading-none">
                                {isLoadingPageInfo ? "..." : (pageInfoData?.page?.category_list?.[0]?.name || "Business")}
                            </p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Status</p>
                            <p className="text-lg font-black text-slate-900 leading-none flex items-center gap-2">
                                LIVE <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <Button
                        onClick={handleSyncFacebook}
                        disabled={isSyncingFacebook}
                        className="h-11 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold shadow-sm transition-all"
                    >
                        {isSyncingFacebook ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Sync Data
                    </Button>
                    {pageInfoData?.page?.link && (
                        <Button asChild variant="default" className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg shadow-slate-900/10">
                            <a href={pageInfoData.page.link} target="_blank" rel="noreferrer">
                                Visit Page <ArrowUpRight className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                    )}
                </div>
              </div>
            </Card>
          </section>

          {/* --- 3. 3-Column Content Layout --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
            {/* Column 1: Recent Posts Grid */}
            <Card className="lg:col-span-4 border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[32px] overflow-hidden flex flex-col">
              <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between py-5 px-6">
                <div>
                  <CardTitle className="text-sm font-black tracking-tight">Recent Posts</CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-lg bg-slate-50 text-slate-500 border-none px-2.5 py-0.5 font-bold text-[10px]">{posts.length}</Badge>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {isLoadingPosts ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {posts.map((post) => {
                      const img = post.full_picture || post.attachments?.data?.[0]?.media?.image?.src;
                      return (
                        <div 
                          key={post.id}
                          onClick={() => setSelectedPostId(post.id)}
                          className={cn(
                            "aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 group relative",
                            selectedPostId === post.id ? "border-blue-500 shadow-lg" : "border-transparent hover:border-slate-200"
                          )}
                        >
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                              <SiFacebook className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column 2: Selected Post Preview */}
            <Card className="lg:col-span-5 border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden flex flex-col">
               {selectedPost ? (
                 <>
                   <div className="flex-1 bg-slate-50 relative overflow-hidden group">
                     { (selectedPost.full_picture || selectedPost.attachments?.data?.[0]?.media?.image?.src) ? (
                        <img 
                            src={selectedPost.full_picture || selectedPost.attachments?.data?.[0]?.media?.image?.src} 
                            alt="" 
                            className="w-full h-full object-contain" 
                        />
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-slate-300">
                            <SiFacebook className="w-24 h-24 mb-6 opacity-20" />
                            <p className="font-bold text-lg">Post Content Unavailable</p>
                        </div>
                     )}
                     <div className="absolute top-6 left-6 flex items-center gap-2">
                        <Badge className="bg-white/80 backdrop-blur-md border-none text-slate-900 font-bold px-3 py-1 rounded-full shadow-sm">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
                            {format(new Date(selectedPost.created_time), "MMM d, yyyy")}
                        </Badge>
                     </div>
                   </div>
                   <div className="p-8 border-t border-slate-50">
                     <p className="text-slate-700 font-medium leading-relaxed">
                       {selectedPost.message || selectedPost.description || selectedPost.story || "No caption available for this post."}
                     </p>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-300 mb-6">
                        <BarChart3 className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">No Post Selected</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Choose a post from the grid to see detailed analysis.</p>
                 </div>
               )}
            </Card>

            {/* Column 3: Performance Analytics */}
            <Card className="lg:col-span-3 border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[32px] overflow-hidden flex flex-col">
              <CardHeader className="border-b border-slate-50 py-5 px-6">
                <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-500" />
                    Performance Analytics
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Facebook Post</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {selectedPostId ? (
                   <PostInsightsDetail 
                        postId={selectedPostId} 
                        databaseId={databaseId} 
                        selectedPost={selectedPost}
                   />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                        <BarChart2 className="w-6 h-6" />
                     </div>
                     <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Select a post to view breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal UI Components ---

function PostInsightsDetail({ postId, databaseId, selectedPost }: any) {
  const { isLoading } = useFacebookPostInsights(postId, databaseId);

  if (isLoading) return <div className="space-y-6 pt-4"><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-24 w-full rounded-2xl" /></div>;

  // Manual fallback for engagement from post object if available
  const likes = selectedPost?.likes?.summary?.total_count || 0;
  const comments = selectedPost?.comments?.summary?.total_count || 0;
  const shares = selectedPost?.shares?.count || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Engagement Breakdown</h5>
        <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Likes</span>
                </div>
                <span className="text-lg font-black text-slate-900">{likes.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Comments</span>
                </div>
                <span className="text-lg font-black text-slate-900">{comments.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-rose-100 transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Shares</span>
                </div>
                <span className="text-lg font-black text-slate-900">{shares.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="pt-6">
        <Button asChild variant="outline" className="w-full h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all">
            <a href={selectedPost?.permalink_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                <SiFacebook className="w-4 h-4 text-[#1877F2]" />
                View Official Post <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </a>
        </Button>
      </div>
    </div>
  );
}

export default FacebookInsightsPage;
