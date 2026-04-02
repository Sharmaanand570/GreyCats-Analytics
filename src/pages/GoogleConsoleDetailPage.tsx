import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { FaGoogle } from "react-icons/fa6";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useClients } from "@/hooks/useClients";
import {
  useGoogleConsoleTopPages,
  useGoogleConsoleTopQueries,
} from "@/features/YouTube/hooks/google/useGoogleConsoleData";
import { useRemoveAccount } from "@/hooks/useIntegrations";
import { useClientContext } from "../context/ClientContext";
import { useClient } from "@/hooks/useClients";
import {
  MousePointer2,
  Eye,
  Percent,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import { fetchUnifiedAggregate } from "@/features/reports/api/reportingApi";
import { getMetricData } from "@/services/unifiedMetrics.api";

function GoogleConsoleDetailPage() {
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const navigate = useNavigate();
  const { currentClient, setCurrentClient } = useClientContext();

  // Parse clientId from URL or default to current client from context
  const selectedClientId = clientIdParam ? Number(clientIdParam) : currentClient?.id;

  // Fetch all clients for selector
  const { data: clients } = useClients();
  const { data: client } = useClient(selectedClientId || null);

  // Auto-select first GSC-connected client if none selected
  useEffect(() => {
    if (!clients || clients.length === 0) return;

    const gscClient = clients.find((c: any) =>
      c.integrations?.some(
        (i: any) =>
          i.integrationType === "google-search-console" ||
          i.platform === "google-search-console"
      )
    );

    if (!selectedClientId) {
      setCurrentClient(gscClient || clients[0]);
    }

    console.log(
      "[GSC Detail] selectedClientId:",
      selectedClientId,
      "| gscClient:",
      gscClient?.id,
      gscClient?.name
    );
  }, [selectedClientId, clients, setCurrentClient]);

  const handleClientChange = (newClientId: string) => {
    navigate(`/data-sources/google-console/${newClientId}`);
  };

  const clientId = selectedClientId || 0;

  // Check if selected client actually has GSC connected (used for UI validation)
  // const hasGscIntegration = client?.integrations?.some(...) — reserved for future gating

  // ── Date range: last 30 days ─────────────────────────────────────────────
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 30);
    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  }, []);

  const commonAggregateParams = {
    integration: "google-search-console",
    startDate,
    endDate,
    clientId,
  };

  const queryOptions = {
    enabled: !!clientId,
    staleTime: 60 * 1000,
    retry: 1,
  };

  // ── Summary Cards: /api/unified-metrics/aggregate ────────────────────────
  const { data: clicksAgg, isLoading: loadingClicks } = useQuery({
    queryKey: ["gsc-aggregate", "clicks", clientId, startDate, endDate],
    queryFn: () =>
      fetchUnifiedAggregate({ ...commonAggregateParams, metricKey: "google_seo.clicks" }),
    ...queryOptions,
  });

  const { data: impressionsAgg, isLoading: loadingImpressions } = useQuery({
    queryKey: ["gsc-aggregate", "impressions", clientId, startDate, endDate],
    queryFn: () =>
      fetchUnifiedAggregate({
        ...commonAggregateParams,
        metricKey: "google_seo.impressions",
      }),
    ...queryOptions,
  });

  const { data: ctrAgg, isLoading: loadingCtr } = useQuery({
    queryKey: ["gsc-aggregate", "ctr", clientId, startDate, endDate],
    queryFn: () =>
      fetchUnifiedAggregate({ ...commonAggregateParams, metricKey: "google_seo.ctr" }),
    ...queryOptions,
  });

  const { data: positionAgg, isLoading: loadingPosition } = useQuery({
    queryKey: ["gsc-aggregate", "position", clientId, startDate, endDate],
    queryFn: () =>
      fetchUnifiedAggregate({
        ...commonAggregateParams,
        metricKey: "google_seo.position",
      }),
    ...queryOptions,
  });

  const isLoadingSummary =
    loadingClicks || loadingImpressions || loadingCtr || loadingPosition;

  const totalClicks = clicksAgg?.value ?? 0;
  const totalImpressions = impressionsAgg?.value ?? 0;
  const avgCTR = ctrAgg?.value ?? 0;
  const avgPosition = positionAgg?.value ?? 0;

  // ── Line Charts: /api/unified-metrics/data ───────────────────────────────
  const commonChartParams = {
    integration: "google-search-console",
    dateFrom: startDate,
    dateTo: endDate,
    groupBy: "day" as const,
    clientId,
  };

  const { data: clicksChartData, isLoading: loadingClicksChart } = useQuery({
    queryKey: ["gsc-chart", "clicks", clientId, startDate, endDate],
    queryFn: () =>
      getMetricData({ ...commonChartParams, metricKey: "google_seo.clicks" }),
    ...queryOptions,
  });

  const { data: impressionsChartData, isLoading: loadingImpressionsChart } = useQuery({
    queryKey: ["gsc-chart", "impressions", clientId, startDate, endDate],
    queryFn: () =>
      getMetricData({ ...commonChartParams, metricKey: "google_seo.impressions" }),
    ...queryOptions,
  });

  // Merge clicks + impressions series into combined chart data
  const combinedChartData = useMemo(() => {
    const clicksSeries = clicksChartData?.data?.series ?? [];
    const impressionsSeries = impressionsChartData?.data?.series ?? [];

    // Build a map from date → {clicks, impressions}
    const byDate = new Map<string, { date: string; clicks: number; impressions: number }>();

    clicksSeries.forEach((pt: { x: string; y: number }) => {
      byDate.set(pt.x, { date: pt.x, clicks: pt.y, impressions: 0 });
    });

    impressionsSeries.forEach((pt: { x: string; y: number }) => {
      const existing = byDate.get(pt.x);
      if (existing) {
        existing.impressions = pt.y;
      } else {
        byDate.set(pt.x, { date: pt.x, clicks: 0, impressions: pt.y });
      }
    });

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [clicksChartData, impressionsChartData]);

  const isLoadingChart = loadingClicksChart || loadingImpressionsChart;

  // ── Top Pages / Queries (unchanged, uses existing dedicated endpoints) ────
  const {
    data: topPagesData,
    isLoading: isLoadingTopPages,
    error: topPagesError,
    isError: isTopPagesError,
  } = useGoogleConsoleTopPages(clientId, { startDate, endDate });

  const {
    data: topQueriesData,
    isLoading: isLoadingTopQueries,
    error: topQueriesError,
    isError: isTopQueriesError,
  } = useGoogleConsoleTopQueries(clientId, { startDate, endDate });

  const topPages = topPagesData?.topPages ?? (topPagesData as any)?.data?.topPages ?? [];
  const topQueries =
    topQueriesData?.topQueries ?? (topQueriesData as any)?.data?.topQueries ?? [];

  const removeAccount = useRemoveAccount();
  const handleDisconnect = async () => {
    if (!client?.integrations || !selectedClientId) return;
    const integration = client.integrations.find(
      (i) => i.integrationType === "google-search-console"
    );
    if (!integration) return;
    try {
      await removeAccount.mutateAsync({
        clientId: selectedClientId,
        integrationType: "google-search-console",
        accountId: integration.accountId,
      });
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="w-full h-[4.8em] border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex items-center gap-3">
              <FaGoogle className="text-2xl text-[#4285F4]" />
              <span className="font-medium text-xl">
                Google Search Console Overview
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {clients && clients.length > 0 && (
                <Select
                  value={selectedClientId?.toString() || ""}
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <DataSyncBanner compact={true} />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                isLoading={removeAccount.isPending}
              >
                Disconnect
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="w-full px-5 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => navigate(-1)}
                    className="cursor-pointer"
                  >
                    Data Sources
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Google Search Console</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6">
            {!isLoadingSummary &&
              !totalClicks &&
              !totalImpressions && <DataSyncBanner />}

            {/* ── Summary Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Clicks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Clicks
                  </CardTitle>
                  <MousePointer2 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {loadingClicks ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="text-2xl font-bold">
                        {totalClicks.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Impressions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Impressions
                  </CardTitle>
                  <Eye className="h-4 w-4 text-violet-500" />
                </CardHeader>
                <CardContent>
                  {loadingImpressions ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="text-2xl font-bold">
                        {totalImpressions >= 1000
                          ? `${(totalImpressions / 1000).toFixed(2)}K`
                          : totalImpressions.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTR */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average CTR
                  </CardTitle>
                  <Percent className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  {loadingCtr ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="text-2xl font-bold">
                        {(avgCTR * 100).toFixed(2)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Position */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Position
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {loadingPosition ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="text-2xl font-bold">
                        {avgPosition.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Line Chart: Clicks & Impressions Over Time ──────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Clicks &amp; Impressions — Daily
                </CardTitle>
                <CardDescription>
                  Daily trend for the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingChart ? (
                  <Skeleton className="h-64 w-full" />
                ) : combinedChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      data={combinedChartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v: string) => v.slice(5)} // show MM-DD
                      />
                      <YAxis
                        yAxisId="clicks"
                        orientation="left"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="impressions"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(),
                          name === "clicks" ? "Clicks" : "Impressions",
                        ]}
                        labelFormatter={(label: string) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line
                        yAxisId="clicks"
                        type="monotone"
                        dataKey="clicks"
                        stroke="#3b82f6"
                        dot={false}
                        strokeWidth={2}
                        name="Clicks"
                      />
                      <Line
                        yAxisId="impressions"
                        type="monotone"
                        dataKey="impressions"
                        stroke="#8b5cf6"
                        dot={false}
                        strokeWidth={2}
                        name="Impressions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mb-4 opacity-20" />
                    <p>No chart data available for this period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Top Pages / Top Queries ──────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Pages */}
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Top Performing Pages
                    </CardTitle>
                    <CardDescription>
                      Highest traffic pages by clicks
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTopPages ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : isTopPagesError ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertCircle className="h-8 w-8 mb-3 text-red-400" />
                      <p className="text-sm font-medium text-red-600 mb-1">Failed to load top pages</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {topPagesError?.message || "An unexpected error occurred"}
                      </p>
                    </div>
                  ) : topPages.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[40%]">Page URL</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                            <TableHead className="text-right">Impr.</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                            <TableHead className="text-right">Pos.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topPages.map((page: any, idx: number) => (
                            <TableRow key={idx} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2 max-w-md">
                                  <span
                                    className="truncate text-blue-600 hover:underline cursor-pointer"
                                    title={page.page}
                                  >
                                    {page.page.replace(/^https?:\/\/[^/]+/, "")}
                                  </span>
                                  <a
                                    href={page.page}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {page.clicks.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {page.impressions.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {(page.ctr * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {page.position.toFixed(1)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <TrendingUp className="h-8 w-8 mb-4 opacity-20" />
                      <p>No page data available for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Queries */}
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <MousePointer2 className="h-4 w-4" />
                      Top Search Queries
                    </CardTitle>
                    <CardDescription>
                      Keywords driving traffic (last 30 days)
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTopQueries ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : isTopQueriesError ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertCircle className="h-8 w-8 mb-3 text-red-400" />
                      <p className="text-sm font-medium text-red-600 mb-1">Failed to load top queries</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {topQueriesError?.message || "An unexpected error occurred"}
                      </p>
                    </div>
                  ) : topQueries.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[40%]">Query</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                            <TableHead className="text-right">Impr.</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                            <TableHead className="text-right">Pos.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topQueries.map((query: any, idx: number) => (
                            <TableRow key={idx} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {query.query}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {query.clicks.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {query.impressions.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {(query.ctr * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {query.position.toFixed(1)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <MousePointer2 className="h-8 w-8 mb-4 opacity-20" />
                      <p>No query data available for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleConsoleDetailPage;
