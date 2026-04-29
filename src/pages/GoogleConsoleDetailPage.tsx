import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { FaGoogle } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  Loader2,
} from "lucide-react";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import { PlatformNotConnected } from "@/components/PlatformNotConnected";
import { cn } from "@/lib/utils";
import { fetchUnifiedAggregate } from "@/features/reports/api/reportingApi";
import { getMetricData } from "@/services/unifiedMetrics.api";

function GoogleConsoleDetailPage() {
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const navigate = useNavigate();
  const { currentClient, setCurrentClient } = useClientContext();
  const [activeMetric, setActiveMetric] = useState<"clicks" | "impressions" | "ctr" | "position">("clicks");

  // Parse clientId from URL or default to current client from context
  const selectedClientId = clientIdParam ? Number(clientIdParam) : currentClient?.id;

  // Fetch all clients for selector
  const { data: clients } = useClients();
  const { data: client } = useClient(selectedClientId || null);

  // Auto-select first GSC-connected client only when neither URL param nor
  // an existing client from context is available. Prevents overriding the
  // client the user navigated from.
  useEffect(() => {
    if (clientIdParam) return;
    if (currentClient) return;
    if (!clients || clients.length === 0) return;

    const gscClient = clients.find((c: any) =>
      c.integrations?.some(
        (i: any) =>
          i.integrationType === "google-search-console" ||
          i.platform === "google-search-console"
      )
    );

    setCurrentClient(gscClient || clients[0]);
  }, [clientIdParam, currentClient, clients, setCurrentClient]);

  const handleClientChange = (newClientId: string) => {
    navigate(`/data-sources/google-console/${newClientId}`);
  };

  const clientId = selectedClientId || 0;

  const hasGscIntegration = !!client?.integrations?.some(
    (i: any) => i.integrationType === "google-search-console" || i.platform === "google-search-console"
  );

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

  const { data: activeChartData, isLoading: loadingChart } = useQuery({
    queryKey: ["gsc-chart", activeMetric, clientId, startDate, endDate],
    queryFn: () =>
      getMetricData({ 
        ...commonChartParams, 
        metricKey: `google_seo.${activeMetric}`,
        aggregation: activeMetric === "position" || activeMetric === "ctr" ? "avg" : "sum"
      }),
    ...queryOptions,
  });

  const chartData = useMemo(() => {
    return activeChartData?.data?.series?.map(pt => ({
      date: pt.x,
      value: pt.y
    })) || [];
  }, [activeChartData]);

  type MetricConfigEntry = {
    label: string;
    color: string;
    icon: any;
    suffix?: string;
    multiply?: number;
    isInverse?: boolean;
  };
  const metricConfig: Record<string, MetricConfigEntry> = {
    clicks: { label: "Clicks", color: "#000000", icon: MousePointer2 },
    impressions: { label: "Impressions", color: "#71717a", icon: Eye },
    ctr: { label: "CTR", color: "#18181b", icon: Percent, suffix: "%", multiply: 100 },
    position: { label: "Position", color: "#3f3f46", icon: Trophy, isInverse: true },
  };

  const currentConfig = metricConfig[activeMetric];

  // ── Top Pages / Queries (unchanged, uses existing dedicated endpoints) ────
  const {
    data: topPagesData,
    isLoading: isLoadingTopPages,
    isError: isTopPagesError,
  } = useGoogleConsoleTopPages(clientId, { startDate, endDate });

  const {
    data: topQueriesData,
    isLoading: isLoadingTopQueries,
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
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] animate-in fade-in slide-in-from-bottom-2 duration-1000">
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
                    <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-sm tracking-wide">Search Console</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative p-3.5 bg-gradient-to-br from-[#4285F4] to-blue-700 rounded-2xl shadow-xl shadow-blue-900/10 ring-1 ring-white/20 flex items-center justify-center">
                     <FaGoogle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Google Search Console</h1>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Search performance and SEO</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <DataSyncBanner compact={true} />
              <div className="w-[280px]">
                {clients && clients.length > 0 && (
                  <Select value={selectedClientId?.toString() || ""} onValueChange={handleClientChange}>
                    <SelectTrigger className="h-10 bg-white border-slate-200 shadow-sm rounded-xl transition-all focus:ring-slate-200 font-medium text-slate-700">
                      <SelectValue placeholder="Select Client Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-zinc-800" />
                            {client.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Button
                variant="destructive"
                className="h-10 rounded-xl px-4 shadow-sm"
                onClick={handleDisconnect}
                isLoading={removeAccount.isPending}
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="w-full px-8 py-6 space-y-8">
            {selectedClientId && client && !hasGscIntegration ? (
              <PlatformNotConnected
                platformName="Google Search Console"
                icon={<FaGoogle className="h-10 w-10 text-blue-500" />}
                clientName={client.name}
              />
            ) : <>
            {!isLoadingSummary && !totalClicks && !totalImpressions && <DataSyncBanner />}

            {/* ── Summary Bento Cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Total Clicks", value: totalClicks, icon: MousePointer2, color: "text-blue-600", colorBg: "bg-blue-50", loading: loadingClicks },
                { label: "Total Impressions", value: totalImpressions, icon: Eye, color: "text-violet-600", colorBg: "bg-violet-50", loading: loadingImpressions, isK: true },
                { label: "Average CTR", value: avgCTR * 100, icon: Percent, color: "text-emerald-600", colorBg: "bg-emerald-50", loading: loadingCtr, suffix: "%" },
                { label: "Avg Position", value: avgPosition, icon: Trophy, color: "text-amber-600", colorBg: "bg-amber-50", loading: loadingPosition, fixed: 1 },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="group p-6 bg-white border border-zinc-100 rounded-[28px] transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{item.label}</span>
                    <div className={cn("p-2 rounded-xl ring-1 ring-zinc-100", item.colorBg)}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                  </div>
                  {item.loading ? (
                    <Skeleton className="h-9 w-24 rounded-lg" />
                  ) : (
                    <div className="flex flex-col">
                      <div className="text-3xl font-bold tracking-tight text-zinc-900">
                        {item.isK && item.value >= 1000 
                          ? `${(item.value / 1000).toFixed(1)}K` 
                          : item.fixed !== undefined ? item.value.toFixed(item.fixed) : item.value.toLocaleString()}
                        {item.suffix}
                      </div>
                      <p className="text-[11px] font-semibold text-zinc-400 mt-1 uppercase tracking-tighter">Last 30 Days</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Line Chart Section ────────────────────────────────────────── */}
            <div className="bg-white border border-zinc-100 rounded-[32px] p-8 transition-all duration-500 hover:border-zinc-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-zinc-400" />
                    Search Performance
                  </h2>
                  <p className="text-sm text-zinc-500 font-medium">Daily trend analysis</p>
                </div>

                <Tabs value={activeMetric} onValueChange={(v: any) => setActiveMetric(v)} className="w-auto">
                  <TabsList className="bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/50">
                    <TabsTrigger value="clicks" className="rounded-xl px-5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 transition-all">Clicks</TabsTrigger>
                    <TabsTrigger value="impressions" className="rounded-xl px-5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 transition-all">Impressions</TabsTrigger>
                    <TabsTrigger value="ctr" className="rounded-xl px-5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 transition-all">CTR</TabsTrigger>
                    <TabsTrigger value="position" className="rounded-xl px-5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 transition-all">Position</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="h-[320px] w-full">
                {loadingChart ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-zinc-300 animate-spin" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Analytics...</span>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        tickFormatter={(v: string) => v.split('-').slice(1).join('/')}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        reversed={currentConfig.isInverse}
                      />
                      <Tooltip 
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-zinc-950 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">{label}</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentConfig.color }} />
                                  <p className="text-sm font-bold text-white">
                                    {currentConfig.label}: {payload[0].value.toLocaleString()}
                                    {currentConfig.suffix}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={currentConfig.color}
                        strokeWidth={4}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: currentConfig.color }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 opacity-60">
                    <TrendingUp className="h-10 w-10 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Trend Data Found</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Top Pages / Top Queries ──────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Pages */}
              <div className="bg-white border border-zinc-100 rounded-[32px] p-8 transition-all hover:border-zinc-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-zinc-400" />
                      Top Performing Pages
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">Highest traffic by clicks</p>
                  </div>
                </div>

                {isLoadingTopPages ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ) : isTopPagesError ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="h-8 w-8 mb-3 text-red-200" />
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Load Failed</p>
                  </div>
                ) : topPages.length > 0 ? (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-zinc-50">
                          <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Page Path</TableHead>
                          <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Clicks</TableHead>
                          <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Pos.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topPages.slice(0, 8).map((page: any, idx: number) => (
                          <TableRow key={idx} className="group border-b border-zinc-50/50 hover:bg-zinc-50/50 transition-colors">
                            <TableCell className="py-4 px-0">
                              <div className="flex items-center gap-2 max-w-[180px] lg:max-w-md">
                                <span className="truncate text-sm font-semibold text-zinc-900" title={page.page}>
                                  {page.page.replace(/^https?:\/\/[^/]+/, "") || "/"}
                                </span>
                                <a href={page.page} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowUpRight className="h-3 w-3 text-zinc-400" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4 px-0 font-bold text-zinc-900">
                              {page.clicks.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right py-4 px-0 text-zinc-400 font-medium lowercase">
                              #{page.position.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <TrendingUp className="h-8 w-8 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">No Data</p>
                  </div>
                )}
              </div>

              {/* Top Queries */}
              <div className="bg-white border border-zinc-100 rounded-[32px] p-8 transition-all hover:border-zinc-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                      <MousePointer2 className="h-4 w-4 text-zinc-400" />
                      Total Search Queries
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">Keywords driving traffic</p>
                  </div>
                </div>

                {isLoadingTopQueries ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ) : isTopQueriesError ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="h-8 w-8 mb-3 text-red-200" />
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Load Failed</p>
                  </div>
                ) : topQueries.length > 0 ? (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-zinc-50">
                          <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Query</TableHead>
                          <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Clicks</TableHead>
                          <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Pos.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topQueries.slice(0, 8).map((query: any, idx: number) => (
                          <TableRow key={idx} className="group border-b border-zinc-50/50 hover:bg-zinc-50/50 transition-colors">
                            <TableCell className="py-4 px-0">
                                <span className="text-sm font-semibold text-zinc-900">{query.query}</span>
                            </TableCell>
                            <TableCell className="text-right py-4 px-0 font-bold text-zinc-900">
                              {query.clicks.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right py-4 px-0 text-zinc-400 font-medium lowercase">
                              #{query.position.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <MousePointer2 className="h-8 w-8 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">No Data</p>
                  </div>
                )}
              </div>
            </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleConsoleDetailPage;
