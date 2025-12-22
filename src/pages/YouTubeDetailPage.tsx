import { useEffect, useMemo, useState } from "react";
import {
  useYouTubeChannel,
  useYouTubePerVideoAnalytics,
  useYouTubeReconnect,
  useYouTubeDisconnect,
  useYouTubeSync,
  useYouTubeVideos,
  useYouTubeSummary,
  useYouTubeTrends,
  useYouTubeTopVideos,
  useYouTubeEngagement,
  useYouTubeWatchTime,
} from "@/features/YouTube/hooks/useYouTubeData";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
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
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import type { YouTubeVideoItem } from "@/features/YouTube/API/youtubeApi";

const buildChartData = (series?: Array<Record<string, unknown>>) => {
  if (!series) return [];
  return series.map((point, index) => {
    const date = point.date as string || `Point ${index + 1}`;

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
  const { clientId } = useParams();
  const numericClientId = Number(clientId);

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
  const { data: summaryData, isLoading: isLoadingSummary } = useYouTubeSummary(numericClientId);

  // 3. Trends
  const { data: trendsData, isLoading: isLoadingTrends } = useYouTubeTrends(numericClientId);

  // 4. Videos List
  const { data: videosData, isLoading: isLoadingVideos, error: videosError } = useYouTubeVideos(numericClientId, videoParams);

  // 5. Engagement
  const { data: engagementData, isLoading: isLoadingEngagement } = useYouTubeEngagement(numericClientId);

  // 6. Top Videos
  const { data: topVideosData, isLoading: isLoadingTopVideos } = useYouTubeTopVideos(numericClientId, {
    metric: "views",
    limit: 5,
    period: "30d"
  });

  // 7. Watch Time
  const { data: watchTimeData, isLoading: isLoadingWatchTime } = useYouTubeWatchTime(numericClientId);

  // Actions
  const { mutateAsync: syncYouTube, isPending: isSyncing } = useYouTubeSync();
  const { mutateAsync: reconnectYouTube, isPending: isReconnecting } = useYouTubeReconnect();
  const { mutateAsync: disconnectYouTube, isPending: isDisconnecting } = useYouTubeDisconnect();

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
      setSelectedVideoId(videosData.videos[0].videoId || videosData.videos[0].id);
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

  const channelSnippet = channelData?.channel?.snippet;
  const channelTitle = channelSnippet?.title || channelData?.channel?.channelTitle || "YouTube Channel";
  const channelDescription = channelSnippet?.description || "";
  const channelCustomUrl = channelSnippet?.customUrl || "";
  const channelId = channelData?.channel?.channelId || "N/A";
  const channelPublishedAt = channelSnippet?.publishedAt;

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="w-full h-[4.8em] border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex items-center gap-3">
              <FaYoutube className="text-2xl text-red-600" />
              <span className="font-medium text-xl">YouTube Analytics</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing} className="gap-2">
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Sync
              </Button>
              <Button variant="secondary" size="sm" onClick={() => reconnectYouTube(numericClientId)} disabled={isReconnecting}>
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => disconnectYouTube(numericClientId)} disabled={isDisconnecting}>
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </div>

          <div className="w-full px-5 pt-4 pb-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>YouTube</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6 overflow-y-auto pb-20">
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
                        <div className="w-16 h-16 rounded-full overflow-hidden border shrink-0">
                          {channelSnippet?.thumbnails?.high?.url ? (
                            <img src={channelSnippet.thumbnails.high.url} alt={channelTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-red-50 flex items-center justify-center"><Youtube className="text-red-500" /></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{channelTitle}</h2>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Connected</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {channelCustomUrl} • ID: {channelId}
                            {channelPublishedAt && ` • Since ${format(new Date(channelPublishedAt), "MMM yyyy")}`}
                          </p>
                          {channelDescription && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{channelDescription}</p>}
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
                icon={<Eye className="w-4 h-4 text-blue-500" />}
                subtext={`Avg ${summary?.averageViewsPerDay?.toLocaleString() ?? 0}/day`}
              />
              <SummaryCard
                title="Subscribers"
                value={summary?.totalSubscribers}
                loading={isLoadingSummary}
                icon={<Users className="w-4 h-4 text-green-500" />}
                subtext="Total Subscribers"
              />
              <SummaryCard
                title="Watch Time (Hrs)"
                value={watchTimeData?.totalWatchTimeHours ? Math.round(Number(watchTimeData.totalWatchTimeHours)) : 0}
                loading={isLoadingWatchTime || isLoadingSummary}
                icon={<Clock className="w-4 h-4 text-amber-500" />}
                subtext="Last 30 Days"
              />
              <SummaryCard
                title="Engagement Rate"
                value={engagement?.engagementRate}
                isString
                loading={isLoadingEngagement}
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
                  ) : (
                    <div className="space-y-4">
                      {topVideosData?.topVideos?.map((video: YouTubeVideoItem, idx: number) => (
                        <div key={video.id || idx} className="flex gap-3 items-start group">
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
                                {video.views?.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {video.likes?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
                          <th className="h-12 px-4 font-medium text-muted-foreground text-right">Views</th>
                          <th className="h-12 px-4 font-medium text-muted-foreground text-right">Likes</th>
                          <th className="h-12 px-4 font-medium text-muted-foreground text-right">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videosData?.videos?.map((video: YouTubeVideoItem) => (
                          <tr key={video.videoId || video.id} className="border-t hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 max-w-[300px]">
                              <div className="flex gap-3">
                                <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden shrink-0">
                                  {video.thumbnails?.default?.url && (
                                    <img src={video.thumbnails.default.url} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium line-clamp-2">{video.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{video.videoId || video.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {format(new Date(video.publishedAt), "MMM d, yyyy")}
                            </td>
                            <td className="p-4 text-right font-medium">
                              {video.viewCount?.toLocaleString() ?? 0}
                            </td>
                            <td className="p-4 text-right text-muted-foreground">
                              {video.likeCount?.toLocaleString() ?? 0}
                            </td>
                            <td className="p-4 text-right text-muted-foreground">
                              {video.commentCount?.toLocaleString() ?? 0}
                            </td>
                          </tr>
                        ))}
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
                    disabled={!videosData?.videos || !videosData.pagination || videosPage >= videosData.pagination.totalPages || isLoadingVideos}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                      <SelectItem key={video.videoId || video.id} value={video.videoId || video.id}>
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <span className="truncate">{video.title}</span>
                        </div>
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
                  <div className="h-[300px] w-full">
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
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorVideo)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
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

function SummaryCard({ title, value, loading, icon, subtext, isString }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">
                  {isString ? value : (value?.toLocaleString() ?? 0)}
                </h3>
              </div>
            )}
            {loading ? <Skeleton className="h-3 w-16 mt-1" /> : <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
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
