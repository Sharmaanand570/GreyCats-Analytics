import { useEffect, useMemo, useState } from "react";
import {
  useYouTubeChannel,
  useYouTubePerVideoAnalytics,
  useYouTubeSync,
  useYouTubeVideos,
  useYouTubeSummary,
  useYouTubeTrends,
  useYouTubeWatchTime,
  useYouTubeEngagement,
  useYouTubeTopVideos,
} from "@/features/YouTube/hooks/useYouTubeData";
import { useRemoveAccount } from "@/hooks/useIntegrations";
import { useClient } from "@/hooks/useClients";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
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
import { Loader2, RefreshCw, Youtube, Eye, ThumbsUp, Clock, Users, TrendingUp } from "lucide-react";
import { FaYoutube } from "react-icons/fa6";
import { format, subDays } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import type { YouTubeVideoItem } from "@/features/YouTube/API/youtubeApi";
import { DateRangePicker } from "@/components/DateRangePicker";
import type { DateRange } from "react-day-picker";

const buildChartData = (series?: Array<Record<string, unknown>>) => {
  if (!series || !Array.isArray(series)) return [];
  return series.map((point) => {
    const date = point.date as string || "";

    const numericEntry = Object.entries(point).find(
      ([key, value]) => key !== "date" && typeof value === "number"
    );

    return {
      date,
      value: numericEntry ? (numericEntry[1] as number) : 0,
    };
  });
};

function YouTubeDetailPage() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const numericClientId = Number(clientId);

  // Default to last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [videosPage, setVideosPage] = useState(1);
  const [videosSearch, setVideosSearch] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const videoParams = useMemo(
    () => ({
      page: videosPage,
      limit: 10,
    }),
    [videosPage]
  );

  // 1. Channel Info
  const { data: channelData, isLoading: isLoadingChannel, error: channelError } = useYouTubeChannel(numericClientId);

  // 2. Summary Stats
  const { data: summaryData, isLoading: isLoadingSummary, error: summaryError } = useYouTubeSummary(numericClientId, dateRange as unknown as any); // Type assertion until hooks fully updated or inferred

  // 3. Trends
  const { data: trendsData, isLoading: isLoadingTrends, error: trendsError } = useYouTubeTrends(numericClientId, dateRange as unknown as any);

  // 4. Videos List
  const { data: videosData, isLoading: isLoadingVideos, error: videosError } = useYouTubeVideos(numericClientId, videoParams);

  // 5. Engagement
  const { data: engagementData, error: engagementError } = useYouTubeEngagement(numericClientId, dateRange as unknown as any);

  // 6. Watch Time
  const { data: watchTimeData, isLoading: isLoadingWatchTime, error: watchTimeError } = useYouTubeWatchTime(numericClientId, dateRange as unknown as any);

  // 7. Top Videos
  const { data: topVideosData, isLoading: isLoadingTopVideos, error: topVideosError } = useYouTubeTopVideos(numericClientId, {
    metric: "views",
    limit: 5,
    period: "30d",
    dateRange: dateRange as unknown as any // Pass dateRange to override/supplement period
  });

  // Actions
  const { mutateAsync: syncYouTube, isPending: isSyncing } = useYouTubeSync();

  const { data: client } = useClient(numericClientId);

  const removeAccount = useRemoveAccount();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!client?.integrations) return;

    // Find the YouTube integration
    const integration = client.integrations.find(i => i.integrationType === 'youtube');
    if (!integration) return;

    try {
      setIsDisconnecting(true);
      await removeAccount.mutateAsync({
        clientId: numericClientId,
        integrationType: 'youtube',
        accountId: integration.accountId
      });
      // Navigation or other state updates will be handled by query invalidation/reactivity
    } catch (error) {
      console.error("Failed to disconnect", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Per Video Analytics
  const {
    data: perVideoAnalytics,
    isLoading: isLoadingPerVideoAnalytics,
    error: perVideoAnalyticsError,
  } = useYouTubePerVideoAnalytics(
    numericClientId,
    selectedVideoId
      ? {
        videoId: selectedVideoId,
      }
      : undefined
  );

  useEffect(() => {
    if (!selectedVideoId && videosData?.videos?.length) {
      setSelectedVideoId(String(videosData.videos[0].id));
    }
  }, [videosData, selectedVideoId]);


  const handleSync = async () => {
    try {
      await syncYouTube(numericClientId);
    } catch (error) {
      console.error(error);
    }
  };

  // Convert dailyMetrics to chart format
  const perVideoChartData = buildChartData(perVideoAnalytics?.analytics?.dailyMetrics as unknown as Array<Record<string, unknown>>);
  const trendsChartData = trendsData?.trends || [];

  const summary = summaryData?.summary;
  const engagement = engagementData?.engagement;

  const channelTitle = channelData?.channel?.channelTitle || "";
  const channelHandle = channelData?.channel?.channelHandle || "";
  const channelId = channelData?.channel?.channelId || "";
  const channelPublishedAt = channelData?.channel?.publishedAt;
  const channelThumb = channelData?.channel?.thumbnails?.high?.url || "";

  // Check if we have any metrics to show in the table
  const hasViews = videosData?.videos?.some(v => v.views !== undefined);
  const hasLikes = videosData?.videos?.some(v => v.likes !== undefined);
  const hasComments = videosData?.videos?.some(v => v.comments !== undefined);


  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          {/* --- 1. Top Navigation Bar --- */}
          <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm rounded-t-[32px] mb-6">
            <div className="flex flex-col gap-2 relative">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 hover:text-slate-800 transition-colors font-medium">Data Sources</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-slate-300" />
                  <BreadcrumbItem>
                    <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-sm tracking-wide">YouTube</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-zinc-800 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative p-3.5 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl shadow-xl shadow-zinc-900/10 ring-1 ring-white/20 flex items-center justify-center">
                    <FaYoutube className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">YouTube Analytics</h1>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Channel performance and audiences</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <DateRangePicker
                value={dateRange}
                onChange={(range: DateRange) => setDateRange(range)}
                className="w-[240px]"
              />
              <DataSyncBanner compact={true} />
              <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing} className="h-10 px-4 rounded-xl font-bold shadow-sm flex items-center gap-2">
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-slate-500" />}
                Sync
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDisconnect} isLoading={isDisconnecting || removeAccount.isPending} className="h-10 rounded-xl px-4 shadow-sm">
                Disconnect
              </Button>
            </div>
          </div>

          <div className="w-full px-5 py-6 space-y-6 overflow-y-auto pb-20">
            {!isLoadingSummary && !summaryData?.summary && <DataSyncBanner />}
            {/* 1. Channel Info & Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Channel Profile */}
              <div className="col-span-1 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Channel Information</CardTitle>
                    <CardDescription>
                      Connected channel details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingChannel ? (
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="w-48 h-5" />
                          <Skeleton className="w-32 h-4" />
                        </div>
                      </div>
                    ) : channelError ? (
                      <div className="text-destructive">Failed to load channel info</div>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden border shrink-0 bg-gray-100">
                          {channelThumb ? (
                            <img src={channelThumb} alt={channelTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Youtube className="text-red-500 w-8 h-8" /></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{channelTitle}</h2>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Connected</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {channelHandle} • ID: {channelId}
                            {channelPublishedAt && ` • Published ${format(new Date(channelPublishedAt), "MMM d, yyyy")}`}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <div>
                              <span className="font-semibold">
                                {(channelData?.channel?.videoCount || summaryData?.summary?.totalVideos || 0).toLocaleString()}
                              </span> Videos
                            </div>
                            <div>
                              <span className="font-semibold">
                                {(channelData?.channel?.viewCount || summaryData?.summary?.totalViews || 0).toLocaleString()}
                              </span> Views
                            </div>
                            <div>
                              <span className="font-semibold">
                                {(channelData?.channel?.subscriberCount || summaryData?.summary?.totalSubscribers || 0).toLocaleString()}
                              </span> Subscribers
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Metrics */}
              <SummaryCard
                title="Total Views"
                value={summary?.totalViews}
                loading={isLoadingSummary}
                error={summaryError}
                icon={<Eye className="w-4 h-4 text-blue-500" />}
                subtext={`Avg ${summary?.averageViewsPerDay?.toLocaleString() ?? 0}/day`}
              />
              <SummaryCard
                title="Subscribers"
                value={summary?.totalSubscribers}
                loading={isLoadingSummary}
                error={summaryError}
                icon={<Users className="w-4 h-4 text-green-500" />}
                subtext="Total Subscribers"
              />
              <SummaryCard
                title="Watch Time (Hrs)"
                value={watchTimeData?.totalWatchTimeHours ? Math.round(Number(watchTimeData.totalWatchTimeHours)) : 0}
                loading={isLoadingWatchTime || isLoadingSummary}
                error={watchTimeError}
                icon={<Clock className="w-4 h-4 text-amber-500" />}
                subtext="Last 30 Days"
              />
              <SummaryCard
                title="Engagement Rate"
                value={engagement?.engagementRate}
                isString={true}
                loading={isLoadingSummary}
                error={engagementError}
                icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
                subtext={`${engagement?.likesPerView ?? 0} Likes/View`}
              />
            </div>

            {/* 2. Trends Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Daily views for the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTrends ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : trendsError ? (
                    <div className="h-[300px] w-full flex items-center justify-center text-destructive">
                      Failed to load trends
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendsChartData}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value: string) => format(new Date(value), "MMM d")}
                            tick={{ fontSize: 12, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="views"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorViews)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Videos */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Top Performing Videos</CardTitle>
                  <CardDescription>Based on views (Last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTopVideos ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : topVideosError ? (
                    <div className="text-destructive text-sm">Failed to load top videos</div>
                  ) : (
                    <div className="space-y-4">
                      {topVideosData?.topVideos?.map((video: YouTubeVideoItem, idx: number) => {
                        return (
                          <div key={video.id} className="flex gap-3 items-start group">
                            <div className="shrink-0 w-24 h-16 rounded-md overflow-hidden bg-gray-100 relative">
                              {video.thumbnails?.default?.url && (
                                <img src={video.thumbnails.default.url} alt="" className="w-full h-full object-cover" />
                              )}
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                                {idx + 1}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                                {video.title}
                              </h4>
                              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {video.views?.toLocaleString() ?? 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {video.likes?.toLocaleString() ?? 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>



            {/* Deep Dive Section */}
            <Card>
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Video Deep Dive</CardTitle>
                  <CardDescription>Detailed daily analytics for a specific video.</CardDescription>
                </div>
                <Select
                  value={selectedVideoId ?? ""}
                  onValueChange={(value) => setSelectedVideoId(value)}
                  disabled={!videosData?.videos?.length}
                >
                  <SelectTrigger className="w-full lg:w-[300px]">
                    <SelectValue placeholder="Select a video to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {videosData?.videos?.map((video: YouTubeVideoItem) => (
                      <SelectItem key={video.id} value={String(video.id)}>
                        {video.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {perVideoAnalyticsError && (
                  <div className="text-sm text-destructive mb-4">
                    Failed to load per-video analytics:{" "}
                    {perVideoAnalyticsError.message}
                  </div>
                )}
                {isLoadingPerVideoAnalytics ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : !selectedVideoId ? (
                  <div className="h-[300px] w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <FaYoutube className="w-10 h-10 mb-2 opacity-20" />
                    <p>Select a video from the dropdown above</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Video Metadata & Totals */}
                    {perVideoAnalytics?.video && perVideoAnalytics.analytics && (
                      <div className="bg-muted/30 rounded-lg p-4 border border-border">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left: Video Thumbnail & Info */}
                          <div className="flex gap-4 md:w-1/3 shrink-0">
                            <div className="w-32 h-20 bg-black/10 rounded-md overflow-hidden shrink-0 border border-border">
                              {perVideoAnalytics.video.thumbnails?.medium?.url && (
                                <img
                                  src={perVideoAnalytics.video.thumbnails.medium.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="space-y-1 overflow-hidden">
                              <h3 className="font-semibold text-sm line-clamp-2" title={perVideoAnalytics.video.title}>
                                {perVideoAnalytics.video.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Published: {format(new Date(perVideoAnalytics.video.publishedAt), "MMM d, yyyy")}
                              </p>
                              <a
                                href={`https://www.youtube.com/watch?v=${perVideoAnalytics.video.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1 mt-1"
                              >
                                View on YouTube <Eye className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          {/* Right: Summary Stats Grid */}
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-background rounded p-3 border shadow-sm">
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Total Views</p>
                              <p className="text-lg font-bold">{perVideoAnalytics.analytics.totalViews?.toLocaleString() ?? 0}</p>
                            </div>
                            <div className="bg-background rounded p-3 border shadow-sm">
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Watch Time</p>
                              <p className="text-lg font-bold">
                                {perVideoAnalytics.analytics.totalWatchTime
                                  ? Math.round(perVideoAnalytics.analytics.totalWatchTime / 60).toLocaleString()
                                  : 0} <span className="text-xs font-normal text-muted-foreground">mins</span>
                              </p>
                            </div>
                            <div className="bg-background rounded p-3 border shadow-sm">
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Likes</p>
                              <p className="text-lg font-bold">{perVideoAnalytics.analytics.totalLikes?.toLocaleString() ?? 0}</p>
                            </div>
                            <div className="bg-background rounded p-3 border shadow-sm">
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Comments</p>
                              <p className="text-lg font-bold">{perVideoAnalytics.analytics.totalComments?.toLocaleString() ?? 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="h-[300px] w-full">
                      <h4 className="text-sm font-medium mb-4 text-muted-foreground">Daily Views Performance</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={perVideoChartData}>
                          <defs>
                            <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value: string) => format(new Date(value), "MMM d")}
                            tick={{ fontSize: 12, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Views"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorVideo)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Videos Table */}
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Video Library</CardTitle>
                  <CardDescription>Manage and track performance of all your videos.</CardDescription>
                </div>
                <Input
                  placeholder="Search videos..."
                  value={videosSearch}
                  onChange={(e) => setVideosSearch(e.target.value)}
                  className="w-full md:w-64"
                />
              </CardHeader>
              <CardContent>
                {isLoadingVideos ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : videosError ? (
                  <div className="text-destructive">Failed to load videos: {videosError.message}</div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f9fafb]">
                        <tr className="text-left">
                          <th className="h-12 px-4 font-medium text-muted-foreground">Video</th>
                          <th className="h-12 px-4 font-medium text-muted-foreground">Published</th>
                          {hasViews && <th className="h-12 px-4 font-medium text-muted-foreground text-right">Views</th>}
                          {hasLikes && <th className="h-12 px-4 font-medium text-muted-foreground text-right">Likes</th>}
                          {hasComments && <th className="h-12 px-4 font-medium text-muted-foreground text-right">Comments</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {videosData?.videos?.map((video: YouTubeVideoItem) => {
                          return (
                            <tr key={video.id} className="border-t hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 max-w-[300px]">
                                <div className="flex gap-3">
                                  <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden shrink-0">
                                    {video.thumbnails?.default?.url && (
                                      <img src={video.thumbnails.default.url} alt="" className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-medium line-clamp-2">{video.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{video.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {video.publishedAt ? format(new Date(video.publishedAt), "MMM d, yyyy") : "-"}
                              </td>
                              {hasViews && (
                                <td className="p-4 text-right font-medium">
                                  {video.views !== undefined ? video.views.toLocaleString() : "-"}
                                </td>
                              )}
                              {hasLikes && (
                                <td className="p-4 text-right text-muted-foreground">
                                  {video.likes !== undefined ? video.likes.toLocaleString() : "-"}
                                </td>
                              )}
                              {hasComments && (
                                <td className="p-4 text-right text-muted-foreground">
                                  {video.comments !== undefined ? video.comments.toLocaleString() : "-"}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {videosData?.videos?.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No videos found matching your criteria.
                      </div>
                    )}
                  </div>
                )}
                {/* Pagination - Simplified for MVP */}
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVideosPage(p => Math.max(1, p - 1))}
                    disabled={videosPage === 1 || isLoadingVideos}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVideosPage(p => p + 1)}
                    disabled={!videosData?.videos || videosPage >= (videosData.pagination?.totalPages || 1) || isLoadingVideos}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, loading, error, icon, subtext, isString, suffix = "" }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : error ? (
              <span className="text-sm text-destructive">Error</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">
                  {isString ? `${value}${suffix}` : (value?.toLocaleString() ?? 0)}
                </h3>
              </div>
            )}
            {loading ? <Skeleton className="h-3 w-16 mt-1" /> : !error && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <div className="p-2 bg-gray-50 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default YouTubeDetailPage;
