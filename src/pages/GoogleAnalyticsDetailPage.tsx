import { useMemo } from "react";
import { SiGoogleanalytics } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGoogleAnalyticsSummary,
  useGoogleAnalyticsTopPages,
  useGoogleAnalyticsTrends,
  useGoogleAnalyticsMeta,
  useGoogleDisconnect,
  useGoogleReconnect,
} from "@/features/YouTube/hooks/google/useGoogleAnalyticsData";
import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function GoogleAnalyticsDetailPage() {
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useGoogleAnalyticsSummary();

  const {
    data: trendsData,
    isLoading: isLoadingTrends,
    error: trendsError,
  } = useGoogleAnalyticsTrends();

  const {
    data: topPagesData,
    isLoading: isLoadingTopPages,
    error: topPagesError,
  } = useGoogleAnalyticsTopPages();

  const {
    data: metaData,
    error: metaError,
  } = useGoogleAnalyticsMeta();

  const {
    mutateAsync: reconnectGoogle,
    isPending: isReconnecting,
  } = useGoogleReconnect();

  const {
    mutateAsync: disconnectGoogle,
    isPending: isDisconnecting,
  } = useGoogleDisconnect();

  const handleReconnect = async () => {
    try {
      await reconnectGoogle();
    } catch {
      // handled in hook
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogle();
    } catch {
      // handled in hook
    }
  };

  const trends = trendsData?.trends ?? [];
  const topPages = topPagesData?.topPages ?? [];
  const summary = summaryData?.summary;

  const trendsChartData = useMemo( () => trends.map((point) => {
        const date = point.date;
        const label =
          date && date.length === 8
            ? `${date.slice(6, 8)}/${date.slice(4, 6)}`
            : date;
        return {
          label,
          sessions: point.sessions,
          activeUsers: point.activeUsers,
          pageViews: point.pageViews,
        };
      }),
    [trends]
  );

  const isConnected = !metaError && !!metaData?.property;

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex items-center gap-3">
              <SiGoogleanalytics className="text-2xl" style={{ color: "#F4B400" }} />
              <span className="font-medium text-xl">
                Google Analytics Overview
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                  <BreadcrumbPage>Google Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6">
            {(summaryError || trendsError || topPagesError || metaError) && (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-3 text-sm text-destructive space-y-1">
                  {summaryError && (
                    <p>Failed to load summary: {summaryError.message}</p>
                  )}
                  {trendsError && (
                    <p>Failed to load trends: {trendsError.message}</p>
                  )}
                  {topPagesError && (
                    <p>Failed to load top pages: {topPagesError.message}</p>
                  )}
                  {metaError && (
                    <p>Failed to load analytics meta: {metaError.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {isConnected ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Total Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <p className="text-2xl font-semibold">
                        {summary?.totalSessions?.toLocaleString() ?? 0}
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <p className="text-2xl font-semibold">
                        {summary?.totalUsers?.toLocaleString() ?? 0}
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <p className="text-2xl font-semibold">
                        {summary?.totalViews?.toLocaleString() ?? 0}
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Avg. Bounce Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <p className="text-2xl font-semibold">
                        {summary
                          ? `${summary.avgBounceRate.toFixed(1)}%`
                          : "0.0%"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-4 text-sm text-muted-foreground">
                  Google Analytics is not connected or has no active property.
                  Reconnect and select a property to see metrics.
                </CardContent>
              </Card>
            )}

            {/* GA4 Properties UI intentionally omitted per latest requirements */}

            {isConnected && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Trends (Sessions)</CardTitle>
                    <CardDescription>
                      Daily sessions for the connected Google Analytics property.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTrends ? (
                      <Skeleton className="h-64 w-full" />
                    ) : trendsChartData.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                        No trend data available.
                      </div>
                    ) : (
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trendsChartData}>
                            <defs>
                              <linearGradient
                                id="gaSessions"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#2563EB"
                                  stopOpacity={0.35}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#2563EB"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              formatter={(value: number) => [
                                value.toLocaleString(),
                                "Sessions",
                              ]}
                            />
                            <Area
                              type="monotone"
                              dataKey="sessions"
                              stroke="#2563EB"
                              strokeWidth={2}
                              fill="url(#gaSessions)"
                              dot={false}
                              activeDot={{ r: 4, fill: "#2563EB" }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages by Views</CardTitle>
                    <CardDescription>
                      Pages with the highest number of views.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTopPages ? (
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : topPagesError ? (
                      <p className="text-sm text-destructive">
                        Failed to load top pages: {topPagesError.message}
                      </p>
                    ) : topPages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No top page data available.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Page Path</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topPages.map((page) => (
                              <TableRow key={page.pagePath}>
                                <TableCell>{page.pagePath}</TableCell>
                                <TableCell>{page.pageTitle || "Untitled"}</TableCell>
                                <TableCell className="text-right">
                                  {page.views.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleAnalyticsDetailPage;


