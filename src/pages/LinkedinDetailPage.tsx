import { useNavigate, useParams } from "react-router-dom";
import { useState, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Skeleton } from "@/components/ui/skeleton";
import { useLinkedinAnalytics, useLinkedinSync, useLinkedinPosts } from "@/features/linkedin/hooks/useLinkedin";
import { useClient } from "@/hooks/useClients";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, TrendingUp, MessageCircle, Share2, Users, RefreshCw, ArrowUpRight, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClientContext } from "@/context/ClientContext";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/DateRangePicker";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformNotConnected } from "@/components/PlatformNotConnected";

// ── BentoMetricCard ──────────────────────────────────────────────────────────

type MetricCardProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
    isLoading?: boolean;
    color?: "blue" | "violet" | "emerald" | "orange" | "rose" | "zinc" | "indigo" | "amber";
};

function BentoMetricCard({ label, value, icon, isLoading, color = "blue" }: MetricCardProps) {
    const colorMap = {
        blue: { text: "text-blue-600", bg: "bg-blue-50" },
        violet: { text: "text-violet-600", bg: "bg-violet-50" },
        emerald: { text: "text-emerald-600", bg: "bg-emerald-50" },
        orange: { text: "text-orange-600", bg: "bg-orange-50" },
        rose: { text: "text-rose-600", bg: "bg-rose-50" },
        zinc: { text: "text-zinc-600", bg: "bg-zinc-50" },
        indigo: { text: "text-indigo-600", bg: "bg-indigo-50" },
        amber: { text: "text-amber-600", bg: "bg-amber-50" },
    };
    const c = colorMap[color];

    return (
        <div className="group p-6 bg-white border border-zinc-100 rounded-[28px] transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50/30">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
                <div className={cn("p-2 rounded-xl ring-1 ring-zinc-50", c.bg)}>
                    <div className={cn("h-4 w-4", c.text)}>{icon}</div>
                </div>
            </div>
            {isLoading ? (
                <Skeleton className="h-9 w-24 rounded-lg" />
            ) : (
                <div className="flex flex-col">
                    <div className="text-3xl font-bold tracking-tight text-zinc-900">{value}</div>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Selected Range</p>
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

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

    const { data: clientData } = useClient(parsedClientId || null);
    const linkedinIntegration = clientData?.integrations?.find(i => i.integrationType === 'linkedin');
    const accountName = linkedinIntegration?.accountName || "LinkedIn Page";

    const { data: postsData, isLoading: isLoadingPosts } = useLinkedinPosts();

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

    const startDateStr = date?.from ? format(date.from, "yyyy-MM-dd") : format(subDays(new Date(), 30), "yyyy-MM-dd");
    const endDateStr = date?.to ? format(date.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    
    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics
    } = useLinkedinAnalytics(startDateStr, endDateStr);

    const formatNumber = (num?: number) => {
        if (num === undefined) return "—";
        return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let latestFollowers: number | undefined = undefined;
    let chartData: any[] = [];

    const [activeMetric, setActiveMetric] = useState<'impressions' | 'clicks'>('impressions');
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const postsRef = useRef<HTMLDivElement>(null);

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
                        <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
                        {payload[0].name}: <span className="text-zinc-900">{formatNumber(payload[0].value)}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-0 md:p-0 space-y-0">
             <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <div className="w-full h-full flex flex-col">
                    {/* --- 1. Top Navigation Bar --- */}
                    <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm rounded-t-[32px] mb-6">
                        <div className="flex flex-col gap-2 relative">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 hover:text-slate-800 transition-colors font-medium text-xs">Data Sources</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="text-slate-300" />
                                    <BreadcrumbItem>
                                        <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider">LinkedIn Analytics</span>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            
                            <div className="flex items-center gap-5">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                    <div className="relative p-3.5 bg-gradient-to-br from-[#0A66C2] to-blue-800 rounded-2xl shadow-xl shadow-blue-900/10 ring-1 ring-white/20">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 text-white fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">LinkedIn</h1>
                                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">{accountName}</p>
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

                    {/* Content Section */}
                    <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar space-y-10">
                        {parsedClientId && clientData && !linkedinIntegration ? (
                            <PlatformNotConnected
                                platformName="LinkedIn"
                                icon={<svg viewBox="0 0 24 24" aria-hidden="true" className="w-10 h-10 text-[#0A66C2] fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                                clientName={clientData.name}
                            />
                        ) : <>
                        {/* Profile & Stats Bento Grid */}
                        <div className="grid gap-6 md:grid-cols-[380px_1fr]">
                            {/* Profile Card */}
                            <div className="group relative p-10 bg-white border border-zinc-100 rounded-[32px] flex flex-col items-center text-center transition-all duration-500 hover:border-zinc-300 hover:bg-zinc-50/30 overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <svg viewBox="0 0 24 24" className="w-32 h-32 fill-current text-zinc-900"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </div>
                                
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                                    <div className="relative h-28 w-28 rounded-[28px] bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center shadow-2xl text-4xl font-black transform group-hover:rotate-2 transition-transform duration-500 ring-1 ring-white/20">
                                        {accountName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-2xl shadow-xl border border-zinc-100">
                                        <div className="h-5 w-5 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-2">{accountName}</h2>
                                <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] bg-zinc-100/50 px-4 py-1.5 rounded-full border border-zinc-50">LinkedIn Authority</p>
                                
                                <div className="mt-10 pt-10 border-t border-zinc-100 w-full grid grid-cols-2 gap-4">
                                    <div className="text-left p-4 rounded-2xl bg-zinc-50/50">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-bold text-zinc-900">Connected</span>
                                        </div>
                                    </div>
                                    <div className="text-left p-4 rounded-2xl bg-zinc-50/50">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Last Sync</p>
                                        <span className="text-xs font-bold text-zinc-900">{format(new Date(), "HH:mm")} Today</span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <BentoMetricCard 
                                    label="Impressions" 
                                    value={formatNumber(totalImpressions)} 
                                    icon={<Eye className="h-4 w-4" />} 
                                    color="blue"
                                    isLoading={isLoadingAnalytics}
                                />
                                <BentoMetricCard 
                                    label="Clicks" 
                                    value={formatNumber(totalClicks)} 
                                    icon={<BarChart3 className="h-4 w-4" />} 
                                    color="violet"
                                    isLoading={isLoadingAnalytics}
                                />
                                <BentoMetricCard 
                                    label="Likes" 
                                    value={formatNumber(totalLikes)} 
                                    icon={<TrendingUp className="h-4 w-4" />} 
                                    color="emerald"
                                    isLoading={isLoadingAnalytics}
                                />
                                <BentoMetricCard 
                                    label="Comments" 
                                    value={formatNumber(totalComments)} 
                                    icon={<MessageCircle className="h-4 w-4" />} 
                                    color="indigo"
                                    isLoading={isLoadingAnalytics}
                                />
                                <BentoMetricCard 
                                    label="Shares" 
                                    value={formatNumber(totalShares)} 
                                    icon={<Share2 className="h-4 w-4" />} 
                                    color="amber"
                                    isLoading={isLoadingAnalytics}
                                />
                                <BentoMetricCard 
                                    label="Followers" 
                                    value={formatNumber(latestFollowers)} 
                                    icon={<Users className="h-4 w-4" />} 
                                    color="rose"
                                    isLoading={isLoadingAnalytics}
                                />
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div ref={chartRef} className="bg-white border border-zinc-100 rounded-[32px] p-8 transition-all hover:border-zinc-200 duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-3 uppercase">
                                        <TrendingUp className="h-6 w-6 text-blue-500" />
                                        Growth Trends
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 italic">Daily Volume Analysis & Engagement Velocity</p>
                                </div>
                                <Tabs value={activeMetric} onValueChange={(val: any) => setActiveMetric(val)}>
                                    <TabsList className="bg-zinc-100 rounded-xl p-1">
                                        <TabsTrigger value="impressions" className="rounded-lg text-[10px] font-black uppercase tracking-wider px-6">Impressions</TabsTrigger>
                                        <TabsTrigger value="clicks" className="rounded-lg text-[10px] font-black uppercase tracking-wider px-6">Clicks</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            
                            <div className="w-full h-[400px]">
                                {isLoadingAnalytics ? (
                                    <Skeleton className="w-full h-full rounded-[24px]" />
                                ) : chartData.length === 0 ? (
                                    <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-[32px] text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                        Syncing Historical Data...
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#000" stopOpacity={0.08}/>
                                                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f1f1" />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tickMargin={20}
                                                tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 700 }}
                                                tickFormatter={formatDate}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false}
                                                tickMargin={20}
                                                tick={{ fontSize: 10, fill: "#a1a1aa", fontWeight: 700 }}
                                                tickFormatter={formatNumber}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f1f1', strokeWidth: 2 }} />
                                            <Area 
                                                type="monotone" 
                                                dataKey={activeMetric} 
                                                stroke="#18181b" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorMetric)"
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Activity Feed Section */}
                        <div ref={postsRef} className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-3 uppercase">
                                        <MessageCircle className="h-6 w-6 text-indigo-500" />
                                        Activity Feed
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Recent updates from {accountName}</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-10 px-5 border-zinc-100 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white rounded-xl transition-all group"
                                    onClick={() => navigate('/blog/scheduler')}
                                >
                                    Manage Posts
                                    <ArrowUpRight className="ml-2 w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Button>
                            </div>

                            {isLoadingPosts ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton key={i} className="h-80 rounded-[32px]" />
                                    ))}
                                </div>
                            ) : !postsData?.data || postsData.data.length === 0 ? (
                                <div className="w-full flex flex-col items-center justify-center py-24 bg-white border border-zinc-50 rounded-[40px]">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-[28px] flex items-center justify-center mb-6">
                                        <MessageCircle className="w-8 h-8 text-zinc-200" />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-400 tracking-widest uppercase">No Recent Activity Found</p>
                                </div>
                            ) : (
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {postsData.data.map((post, idx) => (
                                        <div key={post.id || idx} className="group bg-white rounded-[32px] overflow-hidden flex flex-col border border-zinc-100 hover:border-zinc-300 transition-all duration-500">
                                            {post.mediaUrl && (
                                                <div className="relative w-full aspect-video bg-zinc-50 overflow-hidden">
                                                    <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ExternalLink className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-8 flex-1 flex flex-col">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0A66C2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">
                                                        {post.createdAt || post.publishedAt ? format(new Date(post.createdAt || post.publishedAt!), "dd MMM yyyy") : "Published"}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-zinc-600 leading-relaxed line-clamp-3 mb-8 flex-1">
                                                    {post.text || post.commentary || "A moment shared on LinkedIn..."}
                                                </p>
                                                <div className="flex items-center gap-6 pt-6 border-t border-zinc-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Reach</span>
                                                        <span className="text-sm font-black text-zinc-900">{formatNumber(post.impressions || 0)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Engaged</span>
                                                        <span className="text-sm font-black text-zinc-900">{formatNumber((post.likes || 0) + (post.comments || 0))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>}
                    </div>
                </div>
             </div>
        </div>
    );
}
