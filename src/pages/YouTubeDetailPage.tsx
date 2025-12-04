import { useEffect, useMemo, useState } from "react";
import {
  useYouTubeAnalytics,
  useYouTubeChannel,
  useYouTubePerVideoAnalytics,
  useYouTubeReconnect,
  useYouTubeDisconnect,
  useYouTubeSync,
  useYouTubeVideos,
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
import { Loader2, RefreshCw, Youtube } from "lucide-react";
import { FaYoutube } from "react-icons/fa6";
import { format, formatDistanceToNow, formatISO, subDays } from "date-fns";

type DateRangeOption = "7" | "30" | "90";

const analyticsRanges: { label: string; value: DateRangeOption }[] = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

const getDateRange = (days: number) => {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  return {
    from: formatISO(startDate, { representation: "date" }),
    to: formatISO(endDate, { representation: "date" }),
  };
};

const buildChartData = (series?: Array<Record<string, unknown>>) => {
  if (!series) return [];
  return series.map((point, index) => {
    const date =
      typeof point.date === "string"
        ? point.date
        : `Point ${index + 1}`;

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
  const [analyticsRange, setAnalyticsRange] = useState<DateRangeOption>("7");
  const [videosPage, setVideosPage] = useState(1);
  const [videosSearch, setVideosSearch] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const analyticsParams = useMemo(() => {
    const range = getDateRange(Number(analyticsRange));
    return range;
  }, [analyticsRange]);

  const videoParams = useMemo(
    () => ({
      page: videosPage,
      pageSize: 10,
      search: videosSearch || undefined,
    }),
    [videosPage, videosSearch]
  );

  const {
    data: channelData,
    isLoading: isLoadingChannel,
    error: channelError,
  } = useYouTubeChannel();

  const {
    mutateAsync: syncYouTube,
    isPending: isSyncing,
  } = useYouTubeSync();
  const {
    mutateAsync: reconnectYouTube,
    isPending: isReconnecting,
  } = useYouTubeReconnect();
  const {
    mutateAsync: disconnectYouTube,
    isPending: isDisconnecting,
  } = useYouTubeDisconnect();

  const {
    data: videosData,
    isLoading: isLoadingVideos,
    error: videosError,
  } = useYouTubeVideos(videoParams);

  useEffect(() => {
    if (!selectedVideoId && videosData?.items?.length) {
      setSelectedVideoId(videosData.items[0].videoId);
    }
  }, [videosData, selectedVideoId]);

  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useYouTubeAnalytics(analyticsParams);

  const {
    data: perVideoAnalytics,
    isLoading: isLoadingPerVideoAnalytics,
    error: perVideoAnalyticsError,
  } = useYouTubePerVideoAnalytics(
    selectedVideoId
      ? {
          videoId: selectedVideoId,
          from: analyticsParams.from,
          to: analyticsParams.to,
        }
      : undefined
  );

  const handleSync = async () => {
    try {
      await syncYouTube();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReconnect = async () => {
    try {
      await reconnectYouTube();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectYouTube();
    } catch (error) {
      console.error(error);
    }
  };

  const channelSnippet = channelData?.channel?.snippet;
  const channelStats = channelData?.channel?.statistics;
  const channelTitle =
    channelSnippet?.title || channelData?.channel?.title || "YouTube Channel";
  const channelDescription =
    channelSnippet?.description || channelData?.channel?.description || "";
  const channelCustomUrl =
    channelSnippet?.customUrl || channelData?.channel?.customUrl;
  const channelId = channelData?.channel?.id || "N/A";
  const channelPublishedAt =
    channelSnippet?.publishedAt || channelData?.channel?.publishedAt;

  const analyticsChartData = buildChartData(analyticsData?.series);
  const perVideoChartData = buildChartData(perVideoAnalytics?.series);

  const subscriberCount = Number(channelStats?.subscriberCount || 0);
  const videoCount = Number(channelStats?.videoCount || 0);
  const viewCount = Number(channelStats?.viewCount || 0);

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex items-center gap-3">
              <FaYoutube className="text-2xl text-red-600" />
              <span className="font-medium text-xl">YouTube Overview</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Manual Sync
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReconnect}
                disabled={isReconnecting}
              >
                {isReconnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  "Reconnect"
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
            </div>
          </div>

          <div className="w-full px-5 pt-4">
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

          <div className="w-full px-5 py-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Channel Information</CardTitle>
                  <CardDescription>
                    Details about your connected YouTube channel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingChannel ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : channelError ? (
                    <div className="text-destructive">
                      <p className="font-semibold">
                        Failed to load channel information
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {channelError.message}
                      </p>
                    </div>
                  ) : channelData?.channel ? (
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border">
                          {channelSnippet?.thumbnails?.high?.url ? (
                            <img
                              src={channelSnippet.thumbnails.high.url}
                              alt={channelTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500">
                              <Youtube className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {channelTitle}
                            </h3>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                              Connected
                            </span>
                          </div>
                          {channelCustomUrl && (
                            <p className="text-sm text-muted-foreground">
                              {channelCustomUrl}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Channel ID: {channelId}
                          </p>
                          {channelPublishedAt && (
                            <p className="text-xs text-gray-500">
                              Since {format(new Date(channelPublishedAt), "PPP")}
                              {" • "}
                              {formatDistanceToNow(
                                new Date(channelPublishedAt),
                                { addSuffix: true }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      {channelDescription && (
                        <p className="text-sm text-gray-600 max-w-2xl">
                          {channelDescription}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No channel information available.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingChannel ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Subscribers</p>
                        <p className="text-2xl font-semibold">
                          {subscriberCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="text-2xl font-semibold">
                          {viewCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Videos</p>
                        <p className="text-2xl font-semibold">
                          {videoCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {analyticsError && (
              <Card className="border border-destructive/50 bg-destructive/5">
                <CardContent className="py-4 text-sm text-destructive">
                  Failed to load analytics: {analyticsError.message}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Channel Analytics</CardTitle>
                  <CardDescription>
                    Performance trend for the selected date range.
                  </CardDescription>
                </div>
                <Select
                  value={analyticsRange}
                  onValueChange={(value) =>
                    setAnalyticsRange(value as DateRangeOption)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyticsRanges.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <Skeleton className="h-64 w-full" />
                ) : analyticsChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                    No analytics data available for this range.
                  </div>
                ) : (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsChartData}>
                        <defs>
                          <linearGradient id="youtubeAnalytics" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => [
                            value.toLocaleString(),
                            "Metric",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#ff4d4f"
                          strokeWidth={2}
                          fill="url(#youtubeAnalytics)"
                          dot={false}
                          activeDot={{ r: 4, fill: "#ff4d4f" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {videosError && (
              <Card className="border border-destructive/50 bg-destructive/5">
                <CardContent className="py-4 text-sm text-destructive">
                  Failed to load videos: {videosError.message}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Videos</CardTitle>
                    <CardDescription>
                      Recently synced videos from your channel.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search videos..."
                      value={videosSearch}
                      onChange={(event) => {
                        setVideosSearch(event.target.value);
                        setVideosPage(1);
                      }}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingVideos ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : videosData?.items?.length ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground border-b">
                            <th className="py-2 pr-4 font-medium">Title</th>
                            <th className="py-2 pr-4 font-medium">Published</th>
                            <th className="py-2 pr-4 font-medium">Views</th>
                            <th className="py-2 pr-4 font-medium">Likes</th>
                            <th className="py-2 pr-4 font-medium">Comments</th>
                            <th className="py-2 pr-4 font-medium">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {videosData.items.map((video) => (
                            <tr
                              key={video.videoId}
                              className="border-b last:border-b-0"
                            >
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-3">
                                  {video.thumbnails ? (
                                    <img
                                      src={
                                        video.thumbnails.high?.url ||
                                        video.thumbnails.medium?.url ||
                                        video.thumbnails.default?.url
                                      }
                                      alt={video.title}
                                      className="w-14 h-9 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="w-14 h-9 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                      N/A
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {video.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {video.videoId}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {format(new Date(video.publishedAt), "PP")}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {(video.viewCount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {(video.likeCount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {(video.commentCount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {video.durationISO || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {videosData.totalPages > 1 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Page {videosData.page} of {videosData.totalPages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVideosPage((prev) => Math.max(1, prev - 1))}
                            disabled={videosPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setVideosPage((prev) =>
                                Math.min(videosData.totalPages, prev + 1)
                              )
                            }
                            disabled={videosPage >= videosData.totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No videos found for this channel.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Per-Video Analytics</CardTitle>
                  <CardDescription>
                    Deep dive into performance for a single video.
                  </CardDescription>
                </div>
                <Select
                  value={selectedVideoId ?? ""}
                  onValueChange={(value) => setSelectedVideoId(value)}
                  disabled={!videosData?.items?.length}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select video" />
                  </SelectTrigger>
                  <SelectContent>
                    {videosData?.items?.map((video) => (
                      <SelectItem key={video.videoId} value={video.videoId}>
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
                  <Skeleton className="h-64 w-full" />
                ) : !selectedVideoId ? (
                  <p className="text-sm text-muted-foreground">
                    Select a video to view detailed analytics.
                  </p>
                ) : perVideoChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                    No analytics data available for this video.
                  </div>
                ) : (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={perVideoChartData}>
                        <defs>
                          <linearGradient
                            id="youtubePerVideo"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#2563eb"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2563eb"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => [
                            value.toLocaleString(),
                            "Metric",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fill="url(#youtubePerVideo)"
                          dot={false}
                          activeDot={{ r: 4, fill: "#2563eb" }}
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

export default YouTubeDetailPage;

