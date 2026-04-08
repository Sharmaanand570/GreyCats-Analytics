import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkedinAnalytics, useLinkedinSync, useLinkedinPosts } from "@/features/linkedin/hooks/useLinkedin";
import { useClient } from "@/hooks/useClients";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, TrendingUp, HandMetal, MessageCircle, Share2, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClientContext } from "@/context/ClientContext";

export default function LinkedinDetailPage() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const { currentClient } = useClientContext();
    
    const parsedClientId = clientId ? parseInt(clientId) : currentClient?.id;
    const { mutate: syncLinkedin, isPending: isSyncing } = useLinkedinSync();

    // We don't have a profile endpoint in backend guide, so we rely on the integration record
    const { data: clientData } = useClient(parsedClientId || null);
    const linkedinIntegration = clientData?.integrations?.find(i => i.integrationType === 'linkedin');
    const accountName = linkedinIntegration?.accountName || "LinkedIn Page";

    const { data: postsData, isLoading: isLoadingPosts, error: postsError } = useLinkedinPosts();

    const handleSync = () => {
        syncLinkedin(
            {},
            {
                onSuccess: () => {
                    toast.success("LinkedIn data synced successfully.");
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to sync LinkedIn data.");
                }
            }
        );
    };

    // Fetch analytics for the last 30 days
    const endDateObj = new Date();
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - 30);
    
    // YYYY-MM-DD
    const startDateStr = startDateObj.toISOString().split('T')[0];
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const { 
        data: analyticsData, 
        isLoading: isLoadingAnalytics, 
        error: analyticsError 
    } = useLinkedinAnalytics(startDateStr, endDateStr);

    const formatNumber = (num?: number) => {
        if (num === undefined) return "—";
        return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Calculate sum of metrics
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let latestFollowers: number | undefined = undefined;
    let chartData: any[] = [];

    if (analyticsData?.success && analyticsData.analytics) {
        chartData = Object.keys(analyticsData.analytics).sort().map(dateKey => {
            const dayData = analyticsData.analytics[dateKey];
            totalImpressions += (dayData["linkedin.impressions"] || 0);
            totalClicks += (dayData["linkedin.clicks"] || 0);
            totalLikes += (dayData["linkedin.likes"] || 0);
            totalComments += (dayData["linkedin.comments"] || 0);
            totalShares += (dayData["linkedin.shares"] || 0);
            if (dayData["linkedin.followers"] !== undefined) {
                latestFollowers = dayData["linkedin.followers"];
            }
            return {
                date: dateKey,
                impressions: dayData["linkedin.impressions"] || 0,
                clicks: dayData["linkedin.clicks"] || 0,
            };
        });
    }

    return (
        <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] shadow-sm flex flex-col">
                {/* Header */}
                <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-6 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0A66C2]/10 rounded-lg border border-[#0A66C2]/20">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 text-[#0A66C2] fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </div>
                        <div>
                            <h1 className="font-semibold text-xl text-zinc-900 leading-none">
                                LinkedIn Analytics
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Explore LinkedIn page growth and engagement metrics
                            </p>
                        </div>
                    </div>
                    {(linkedinIntegration || analyticsData?.success) && (
                        <div className="flex items-center">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleSync} 
                                disabled={isSyncing}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? "Syncing..." : "Sync Data"}
                            </Button>
                        </div>
                    )}
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
                                <BreadcrumbPage className="font-medium text-foreground">LinkedIn</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        
                        {/* Selected Account Warning */}
                        {!linkedinIntegration && !analyticsData?.success && !isLoadingAnalytics && (
                            <div className="p-6 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-md text-center text-sm">
                                No LinkedIn account connection found. Please connect an account.
                            </div>
                        )}
                        
                        {/* Profile & Top Stats */}
                        {isLoadingAnalytics ? (
                            <div className="grid gap-6 md:grid-cols-4">
                                <Skeleton className="h-32 col-span-1" />
                                <Skeleton className="h-32 col-span-3" />
                            </div>
                        ) : analyticsError ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm flex gap-3 items-center">
                                <Eye className="w-5 h-5 text-red-500" />
                                {(analyticsError as Error).message || "Failed to load LinkedIn analytics. Ensure the account is connected."}
                            </div>
                        ) : (linkedinIntegration || analyticsData?.success) && (
                            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                                {/* Profile Card */}
                                <Card className="border shadow-sm flex flex-col justify-center">
                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        <div className="h-20 w-20 rounded bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center border border-[#0A66C2]/20 mb-4 shadow-sm text-2xl font-bold">
                                            {accountName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <h2 className="text-xl font-bold text-zinc-900">{accountName}</h2>
                                        <p className="text-zinc-500 font-medium">LinkedIn Page</p>
                                    </CardContent>
                                </Card>

                                {/* Top Metrics Card */}
                                <Card className="border shadow-sm flex flex-col justify-center">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Performance Summary</CardTitle>
                                        <CardDescription>Last 30 Days Overview</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex flex-col">
                                            <p className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-zinc-400" /> Impressions
                                            </p>
                                            <h3 className="text-2xl font-bold text-zinc-900">{formatNumber(totalImpressions)}</h3>
                                        </div>
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex flex-col">
                                            <p className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
                                                <HandMetal className="w-4 h-4 text-zinc-400" /> Clicks
                                            </p>
                                            <h3 className="text-2xl font-bold text-zinc-900">{formatNumber(totalClicks)}</h3>
                                        </div>
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex flex-col">
                                            <p className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> Likes
                                            </p>
                                            <h3 className="text-2xl font-bold text-zinc-900">{formatNumber(totalLikes)}</h3>
                                        </div>
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex flex-col">
                                            <p className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4 text-zinc-400" /> Comments
                                            </p>
                                            <h3 className="text-2xl font-bold text-zinc-900">{formatNumber(totalComments)}</h3>
                                        </div>
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex flex-col">
                                            <p className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
                                                <Share2 className="w-4 h-4 text-zinc-400" /> Shares
                                            </p>
                                            <h3 className="text-2xl font-bold text-zinc-900">{formatNumber(totalShares)}</h3>
                                        </div>
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex flex-col">
                                            <p className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-zinc-400" /> Followers
                                            </p>
                                            <h3 className="text-2xl font-bold text-zinc-900">{formatNumber(latestFollowers)}</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Audience Growth Chart */}
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-zinc-500" />
                                    Impressions History
                                </CardTitle>
                                <CardDescription>Daily impressions over the last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingAnalytics ? (
                                    <Skeleton className="w-full h-[350px]" />
                                ) : analyticsError ? (
                                    <div className="w-full h-[350px] flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                                        Failed to load chart data.
                                    </div>
                                ) : chartData.length === 0 ? (
                                    <div className="w-full h-[350px] flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg text-zinc-500 text-sm">
                                        No historical impressions data available.
                                    </div>
                                ) : (
                                    <div className="w-full h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tickMargin={10}
                                                    tick={{ fontSize: 12, fill: "#71717A" }}
                                                    tickFormatter={formatDate}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    tick={{ fontSize: 12, fill: "#71717A" }}
                                                    tickFormatter={formatNumber}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    labelFormatter={formatDate}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="impressions" 
                                                    name="Impressions"
                                                    stroke="#0A66C2" 
                                                    strokeWidth={3}
                                                    dot={false}
                                                    activeDot={{ r: 6, fill: "#0A66C2" }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Recent Posts Section */}
                        { (linkedinIntegration || analyticsData?.success) && (
                            <div className="pt-2">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-zinc-500" />
                                    Recent Posts
                                </h3>
                                {isLoadingPosts ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-48 w-full hidden lg:block" />
                                    </div>
                                ) : postsError ? (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                                        Failed to load recent posts.
                                    </div>
                                ) : !postsData?.data || postsData.data.length === 0 ? (
                                    <div className="w-full h-[320px] flex flex-col items-center justify-center p-8 text-center bg-zinc-50/30 border-2 border-dashed border-zinc-200 rounded-2xl group transition-all duration-500 hover:bg-white hover:border-zinc-300">
                                        <div className="w-16 h-16 bg-white shadow-lg border border-zinc-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <MessageCircle className="w-8 h-8 text-zinc-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-zinc-900 mb-2">No Recent Activity</h3>
                                        <p className="text-sm text-zinc-500 max-w-[280px] mb-8 font-medium leading-relaxed">
                                            We couldn't find any recent posts for this LinkedIn page. Try syncing your data or schedule a new post.
                                        </p>
                                        <div className="flex gap-3">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="rounded-lg font-bold"
                                                onClick={() => navigate('/blog/scheduler')}
                                            >
                                                Go to Scheduler
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="rounded-lg font-bold bg-zinc-900 text-white"
                                                onClick={() => window.location.reload()}
                                            >
                                                Sync Data
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {postsData.data.map((post, idx) => (
                                            <Card key={post.id || idx} className="border shadow-sm overflow-hidden flex flex-col hover:border-zinc-300 transition-colors">
                                                {post.mediaUrl && (
                                                    <div className="w-full h-32 bg-zinc-100 overflow-hidden">
                                                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <CardContent className="p-4 flex-1 flex flex-col">
                                                    <p className="text-xs text-zinc-400 mb-2">
                                                        {post.createdAt || post.publishedAt ? new Date(post.createdAt || post.publishedAt!).toLocaleDateString() : "Recent"}
                                                    </p>
                                                    <p className="text-sm text-zinc-700 line-clamp-3 mb-4 flex-1">
                                                        {post.text || post.commentary || post.localizedText || post.body || post.content || "No text available for this post"}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-zinc-500 pt-3 border-t">
                                                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-zinc-400" /> {formatNumber(post.impressions || 0)}</span>
                                                        <span className="flex items-center gap-1.5">
                                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current text-zinc-400"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> 
                                                            {formatNumber(post.likes || 0)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-zinc-400" /> {formatNumber(post.comments || 0)}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

