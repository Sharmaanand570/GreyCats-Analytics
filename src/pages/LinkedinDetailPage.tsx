import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkedinAnalytics, useLinkedinSync, useLinkedinPosts } from "@/features/linkedin/hooks/useLinkedin";
import { useClient } from "@/hooks/useClients";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, TrendingUp, MessageCircle, Share2, Users, RefreshCw, ArrowUpRight, BarChart3, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClientContext } from "@/context/ClientContext";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/DateRangePicker";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

export default function LinkedinDetailPage() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const { currentClient } = useClientContext();
    
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    
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

    // Fetch analytics for the selected date range
    const startDateStr = date?.from ? format(date.from, "yyyy-MM-dd") : format(subDays(new Date(), 30), "yyyy-MM-dd");
    const endDateStr = date?.to ? format(date.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    
    // YYYY-MM-DD
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

    const [activeMetric, setActiveMetric] = useState<'impressions' | 'clicks'>('impressions');
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const metricsRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const postsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoadingAnalytics && analyticsData?.success) {
            const ctx = gsap.context(() => {
                const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
                
                tl.from(headerRef.current, { y: -20, opacity: 0 })
                  .from(metricsRef.current?.children || [], { 
                    y: 30, 
                    opacity: 0, 
                    stagger: 0.1,
                    clearProps: "all"
                  }, "-=0.4")
                  .from(chartRef.current, { y: 30, opacity: 0 }, "-=0.6")
                  .from(postsRef.current, { y: 30, opacity: 0 }, "-=0.6");
            }, containerRef);
            return () => ctx.revert();
        }
    }, [isLoadingAnalytics, analyticsData]);

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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md border border-zinc-200 p-4 rounded-xl shadow-xl">
                    <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">{formatDate(label)}</p>
                    <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0A66C2]"></span>
                        {payload[0].name}: <span className="text-[#0A66C2]">{formatNumber(payload[0].value)}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col overflow-x-hidden bg-slate-50">
            <div className="w-full h-full flex flex-col">
                {/* Header */}
                <div ref={headerRef} className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-zinc-800 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                            <div className="relative p-3.5 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl shadow-xl shadow-zinc-900/10 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7 text-white fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs font-medium">
                                                Data Sources
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="text-slate-300" />
                                        <BreadcrumbItem>
                                            <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-xs tracking-wide">LinkedIn Analytics</span>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-2xl text-slate-900 tracking-tight leading-none">
                                    LinkedIn Analytics
                                </h1>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Data
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <DateRangePicker value={date} onChange={setDate} />
                        {(linkedinIntegration || analyticsData?.success) && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleSync} 
                                disabled={isSyncing}
                                className="h-10 px-4 bg-white hover:bg-slate-50 border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm transition-all duration-200 flex items-center gap-2 group"
                            >
                                <RefreshCw className={`w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? "Syncing..." : "Refresh Data"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-10">
                        
                        {/* Selected Account Warning */}
                        {!linkedinIntegration && !analyticsData?.success && !isLoadingAnalytics && (
                            <div className="p-6 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-md text-center text-sm">
                                No LinkedIn account connection found. Please connect an account.
                            </div>
                        )}
                        
                        {/* Profile & Top Stats */}
                        {isLoadingAnalytics ? (
                            <div className="grid gap-6 md:grid-cols-4">
                                <Skeleton className="h-40 rounded-3xl" />
                                <Skeleton className="h-40 rounded-3xl col-span-3" />
                            </div>
                        ) : analyticsError ? (
                            <div className="p-8 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-3xl flex flex-col items-center text-center gap-4">
                                <div className="p-3 bg-red-100 rounded-2xl">
                                    <Eye className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900 mb-1">Analytics Error</h3>
                                    <p className="text-sm text-red-600/80">{(analyticsError as Error).message || "Failed to load LinkedIn analytics. Ensure the account is connected."}</p>
                                </div>
                            </div>
                        ) : (linkedinIntegration || analyticsData?.success) && (
                            <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
                                {/* Profile Card */}
                                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl rounded-[32px] group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <svg viewBox="0 0 24 24" className="w-20 h-20 fill-current text-zinc-800"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </div>
                                    <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
                                        <div className="relative mb-6">
                                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center shadow-2xl text-3xl font-black transform group-hover:rotate-3 transition-transform duration-300">
                                                {accountName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-xl shadow-lg border border-zinc-100">
                                                <div className="h-4 w-4 bg-zinc-800 rounded-md" />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">{accountName}</h2>
                                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-2 bg-zinc-100 px-3 py-1 rounded-full">LinkedIn Page</p>
                                    </CardContent>
                                </Card>

                                {/* Metrics Cluster */}
                                <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {[
                                        { label: "Impressions", value: totalImpressions, icon: Eye, color: "blue" },
                                        { label: "Clicks", value: totalClicks, icon: BarChart3, color: "violet" },
                                        { label: "Likes", value: totalLikes, icon: (props: any) => <svg {...props} viewBox="0 0 24 24" aria-hidden="true" className="fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>, color: "emerald" },
                                        { label: "Comments", value: totalComments, icon: MessageCircle, color: "indigo" },
                                        { label: "Shares", value: totalShares, icon: Share2, color: "amber" },
                                        { label: "Followers", value: latestFollowers, icon: Users, color: "rose" }
                                    ].map((m, idx) => {
                                        const CardIcon = m.icon;
                                        const colorGradients: Record<string, string> = {
                                            blue: "from-blue-500/10 to-blue-600/5 border-blue-100 text-blue-600",
                                            emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-100 text-emerald-600",
                                            violet: "from-violet-500/10 to-violet-600/5 border-violet-100 text-violet-600",
                                            amber: "from-amber-500/10 to-amber-600/5 border-amber-100 text-amber-600",
                                            rose: "from-rose-500/10 to-rose-600/5 border-rose-100 text-rose-600",
                                            indigo: "from-indigo-500/10 to-indigo-600/5 border-indigo-100 text-indigo-600",
                                        };
                                        const activeColor = colorGradients[m.color] || colorGradients.blue;

                                        return (
                                            <div key={idx} className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-default">
                                                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <div className={cn("p-2.5 rounded-xl bg-gradient-to-br bg-opacity-10", activeColor)}>
                                                        {CardIcon && <CardIcon className="w-5 h-5" />}
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <p className="text-sm font-medium text-slate-500 mb-1 tracking-wide uppercase text-[11px]">{m.label}</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{formatNumber(m.value)}</h3>
                                                        {idx < 2 && (
                                                            <div className="flex items-center gap-0.5 text-emerald-600">
                                                                <ArrowUpRight className="w-3 h-3 font-bold" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">
                                                            {idx === 5 ? "Latest" : "Last 30 days"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Chart Section */}
                        <Card ref={chartRef} className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-slate-800">Growth Trends</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">Daily volume of {activeMetric} for the selected period</p>
                                        </div>
                                    </div>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        {(['impressions', 'clicks'] as const).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setActiveMetric(m)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200",
                                                    activeMetric === m 
                                                      ? "bg-white text-slate-900 shadow-sm" 
                                                      : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isLoadingAnalytics ? (
                                    <Skeleton className="w-full h-[400px] rounded-3xl" />
                                ) : chartData.length === 0 ? (
                                    <div className="w-full h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-[32px] text-zinc-400 text-sm font-medium italic">
                                        Waiting for historical data sync...
                                    </div>
                                ) : (
                                    <div className="w-full h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.15}/>
                                                        <stop offset="95%" stopColor="#0A66C2" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f1f1" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tickMargin={20}
                                                    tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 700 }}
                                                    tickFormatter={formatDate}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false}
                                                    tickMargin={20}
                                                    tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 700 }}
                                                    tickFormatter={formatNumber}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey={activeMetric} 
                                                    name={activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
                                                    stroke="#0A66C2" 
                                                    strokeWidth={4}
                                                    fillOpacity={1} 
                                                    fill="url(#colorMetric)"
                                                    animationDuration={2000}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Recent Posts Section */}
                        {(linkedinIntegration || analyticsData?.success) && (
                            <div ref={postsRef} className="pt-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Activity Feed</h3>
                                            <p className="text-sm text-slate-500 mt-1">Recent updates and engagement from your LinkedIn page</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 group"
                                        onClick={() => navigate('/blog/scheduler')}
                                    >
                                        Manage Posts
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Button>
                                </div>
                                {isLoadingPosts ? (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <Skeleton className="h-[400px] rounded-[32px]" />
                                        <Skeleton className="h-[400px] rounded-[32px]" />
                                        <Skeleton className="h-[400px] rounded-[32px] hidden lg:block" />
                                    </div>
                                ) : postsError ? (
                                    <div className="p-8 bg-zinc-50 rounded-[32px] border border-zinc-100 text-center">
                                        <p className="text-zinc-500 font-medium">Unable to fetch activity feed at this time.</p>
                                    </div>
                                ) : !postsData?.data || postsData.data.length === 0 ? (
                                    <div className="w-full h-[400px] flex flex-col items-center justify-center p-12 text-center bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] group">
                                        <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mb-8 border border-zinc-100 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                            <MessageCircle className="w-10 h-10 text-zinc-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">Silent Waves</h3>
                                        <p className="text-zinc-500 max-w-[320px] mb-10 font-medium leading-relaxed">
                                            Your LinkedIn page seems quiet. Start the conversation with your first post!
                                        </p>
                                        <Button 
                                            size="lg"
                                            className="rounded-2xl px-10 font-black tracking-widest uppercase text-xs bg-zinc-900 text-white hover:shadow-xl transition-all duration-300"
                                            onClick={() => navigate('/blog/scheduler')}
                                        >
                                            Compose Post
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {postsData.data.map((post, idx) => (
                                            <div key={post.id || idx} className="group bg-white rounded-[32px] overflow-hidden flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 border-none">
                                                {post.mediaUrl ? (
                                                    <div className="relative w-full aspect-video bg-zinc-100 overflow-hidden">
                                                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <ExternalLink className="w-8 h-8 text-white opacity-80" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full p-8 pb-0">
                                                        <div className="w-full h-1 bg-gradient-to-r from-[#0A66C2] to-transparent rounded-full opacity-20" />
                                                    </div>
                                                )}
                                                <div className="p-8 flex-1 flex flex-col">
                                                    <div className="flex items-center justify-between mb-5">
                                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A66C2] bg-blue-50 px-3 py-1 rounded-full">
                                                            <Calendar className="w-3 h-3" />
                                                            {post.createdAt || post.publishedAt ? new Date(post.createdAt || post.publishedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently Published"}
                                                        </span>
                                                    </div>
                                                    <p className="text-base font-medium text-zinc-700 leading-relaxed line-clamp-4 flex-1 mb-8">
                                                        {post.text || post.commentary || post.localizedText || post.body || "A moment shared on LinkedIn..."}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                                                        <div className="flex items-center gap-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Reach</span>
                                                                <span className="text-sm font-black text-zinc-900">{formatNumber(post.impressions || 0)}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Engage</span>
                                                                <span className="text-sm font-black text-zinc-900">{formatNumber((post.likes || 0) + (post.comments || 0) + (post.shares || 0))}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center -space-x-2">
                                                            {[1, 2, 3].map(i => (
                                                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                                    {i === 1 ? <Eye className="w-3 h-3" /> : i === 2 ? <MessageCircle className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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

