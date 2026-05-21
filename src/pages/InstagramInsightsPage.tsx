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
  useInstagramMedia,
  useInstagramMediaInsights,
  useInstagramProfile,
  useInstagramSyncInsights,
} from "@/features/meta/hooks/useMetaData";
import { useClient } from "@/hooks/useClients";
import { 
  Instagram, 
  Users, 
  BarChart2, 
  RefreshCw, 
  LayoutGrid,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowUpRight,
  Eye,
  BarChart3,
  Calendar,
  Play
} from "lucide-react";
import { SiInstagram, SiFacebook } from "react-icons/si";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function InstagramInsightsPage() {
  const params = useParams<{ clientId?: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : null;
  const navigate = useNavigate();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  const { data: clientData, isLoading: isLoadingClient } = useClient(clientId);

  const pages = useMemo(() => {
    const rawAccounts = clientData?.metaBusinessAccounts ?? [];
    return rawAccounts.map((acc: any) => ({
      id: acc.metaAccount?.pageId,
      name: acc.metaAccount?.pageName || "Unknown Page",
      instagram_business_account: acc.metaAccount?.instagramBusinessId ? { id: acc.metaAccount?.instagramBusinessId } : undefined,
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
  const accountId = selectedPage?.databaseId;

  const {
    data: profileData,
    isLoading: isLoadingProfile,
  } = useInstagramProfile(clientId as number, accountId);

  const {
    data: mediaData,
    isLoading: isLoadingMedia,
  } = useInstagramMedia(clientId as number, accountId);

  const {
    mutateAsync: syncInstagram,
    isPending: isSyncingInstagram,
  } = useInstagramSyncInsights();

  const media = mediaData?.data ?? [];
  const selectedMedia = media.find(m => m.id === selectedMediaId) || media[0];

  useEffect(() => {
    if (media.length > 0 && !selectedMediaId) {
      setSelectedMediaId(media[0].id);
    }
  }, [media, selectedMediaId]);

  const handleSyncInstagram = async () => {
    if (!accountId) return;
    try {
      await syncInstagram({ accountId });
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
                  <BreadcrumbPage className="text-slate-900 font-bold">Instagram Insights</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-[0_8px_16px_rgba(220,39,67,0.2)]">
                <SiInstagram className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Instagram Insights
                  <Badge variant="outline" className="bg-pink-50 text-[#dc2743] border-pink-100 rounded-full text-[10px] uppercase tracking-widest font-bold h-5">Business</Badge>
                </h1>
                <p className="text-sm text-slate-500 font-medium">Profile analytics & media engagement</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-64">
                <Select
                    value={selectedPageId ?? ""}
                    onValueChange={(val) => setSelectedPageId(val || null)}
                >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-100 hover:bg-slate-50 transition-all px-4">
                        <SelectValue placeholder="Select Account..." />
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
                            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Followers</p>
                                <p className="text-lg font-black text-slate-900 leading-none">
                                    {isLoadingProfile ? "..." : (profileData?.data?.followers_count?.toLocaleString() || "0")}
                                </p>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Media</p>
                                <p className="text-lg font-black text-slate-900 leading-none">
                                    {isLoadingProfile ? "..." : (profileData?.data?.media_count?.toLocaleString() || "0")}
                                </p>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Status</p>
                                <p className="text-lg font-black text-slate-900 leading-none flex items-center gap-2">
                                    LIVE <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            onClick={handleSyncInstagram}
                            disabled={isSyncingInstagram}
                            className="h-11 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold shadow-sm transition-all"
                        >
                            {isSyncingInstagram ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Sync Data
                        </Button>
                        {profileData?.data?.username && (
                            <Button asChild variant="default" className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg shadow-slate-900/10">
                                <a href={`https://instagram.com/${profileData.data.username}`} target="_blank" rel="noreferrer">
                                    Visit Instagram <ArrowUpRight className="w-4 h-4 ml-2" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
          </section>

          {/* --- 3. 3-Column Content Layout --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
            {/* Column 1: Media Grid */}
            <Card className="lg:col-span-4 border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[32px] overflow-hidden flex flex-col">
                <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between py-5 px-6">
                    <div>
                        <CardTitle className="text-sm font-black tracking-tight">Recent Media</CardTitle>
                    </div>
                    <Badge variant="secondary" className="rounded-lg bg-slate-50 text-slate-500 border-none px-2.5 py-0.5 font-bold text-[10px]">{media.length}</Badge>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    {isLoadingMedia ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {media.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => setSelectedMediaId(item.id)}
                                    className={cn(
                                        "aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 group relative",
                                        selectedMediaId === item.id ? "border-pink-500 shadow-lg" : "border-transparent hover:border-slate-200"
                                    )}
                                >
                                    {item.thumbnail_url || item.media_url ? (
                                        <img src={item.thumbnail_url || item.media_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                            <SiInstagram className="w-10 h-10" />
                                        </div>
                                    )}
                                    { (item.media_type === "VIDEO" || item.media_type === "REELS") && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                                <Play className="w-4 h-4 fill-current" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Column 2: Selected Media Preview */}
            <Card className="lg:col-span-5 border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white rounded-[32px] overflow-hidden flex flex-col">
                {selectedMedia ? (
                    <>
                        <div className="flex-1 bg-slate-50 relative overflow-hidden group">
                            {selectedMedia.media_url ? (
                                selectedMedia.media_type === "VIDEO" || selectedMedia.media_type === "REELS" ? (
                                    <video src={selectedMedia.media_url} className="w-full h-full object-contain" muted controls />
                                ) : (
                                    <img src={selectedMedia.media_url} alt="" className="w-full h-full object-contain" />
                                )
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-slate-300">
                                    <SiInstagram className="w-24 h-24 mb-6 opacity-20" />
                                    <p className="font-bold text-lg">Media Content Unavailable</p>
                                </div>
                            )}
                            <div className="absolute top-6 left-6 flex items-center gap-2">
                                <Badge className="bg-white/80 backdrop-blur-md border-none text-slate-900 font-bold px-3 py-1 rounded-full shadow-sm">
                                    <Calendar className="w-3.5 h-3.5 mr-2 text-pink-500" />
                                    {format(new Date(selectedMedia.timestamp), "MMM d, yyyy")}
                                </Badge>
                                <Badge className="bg-pink-500 text-white border-none font-black text-[9px] px-2.5 py-1 rounded-full shadow-sm uppercase tracking-widest">
                                    {selectedMedia.media_type}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-50">
                            <p className="text-slate-700 font-medium leading-relaxed">
                                {selectedMedia.caption || "No caption available for this media."}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center text-pink-300 mb-6">
                            <BarChart3 className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2">No Media Selected</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">Select an item from the feed to view performance.</p>
                    </div>
                )}
            </Card>

            {/* Column 3: Performance Analytics */}
            <Card className="lg:col-span-3 border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[32px] overflow-hidden flex flex-col">
                <CardHeader className="border-b border-slate-50 py-5 px-6">
                    <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-pink-500" />
                        Performance Analytics
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Instagram Media</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {selectedMediaId ? (
                        <MediaInsightsDetail 
                            mediaId={selectedMediaId} 
                            clientId={clientId}
                            accountId={accountId}
                            selectedMedia={selectedMedia}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                                <BarChart2 className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Select media to view breakdown</p>
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

function MediaInsightsDetail({ mediaId, clientId, accountId, selectedMedia }: any) {
  const { data: mediaInsightsData, isLoading } = useInstagramMediaInsights(clientId, accountId, mediaId);

  if (isLoading) return <div className="space-y-6 pt-4"><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-24 w-full rounded-2xl" /></div>;

  const insights = mediaInsightsData?.data?.data || [];
  const findMetric = (name: string) => insights.find((m: any) => m.name === name)?.values?.[0]?.value || 0;

  // Fallback for likes/comments from media object
  const likes = selectedMedia?.like_count || 0;
  const comments = selectedMedia?.comments_count || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Engagement Breakdown</h5>
            <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-pink-100 transition-all duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-pink-500 transition-colors">
                            <Heart className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-600">Likes</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">{likes.toLocaleString()}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-orange-100 transition-all duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-600">Comments</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">{comments.toLocaleString()}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-600">Shares</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">{findMetric('shares').toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div className="pt-8 border-t border-slate-50">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Reach & Discoverability</h5>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Saves</span>
                    <span className="text-sm font-black text-slate-900">{findMetric('saved').toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div className="pt-6">
            <Button asChild variant="outline" className="w-full h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all">
                <a href={selectedMedia?.permalink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                    <SiInstagram className="w-4 h-4 text-[#dc2743]" />
                    View on Instagram <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </a>
            </Button>
        </div>
    </div>
  );
}

export default InstagramInsightsPage;
