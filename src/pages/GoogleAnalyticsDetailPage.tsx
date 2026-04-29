import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SiGoogleanalytics } from "react-icons/si";
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
  useGoogleAnalyticsSummary,
  useGoogleAnalyticsTopPages,
  useGoogleAnalyticsTrends,
  useGoogleAnalyticsMeta,
  useGoogleProperties,
  useGoogleSelectProperty,
} from "@/features/YouTube/hooks/google/useGoogleAnalyticsData";
import { useRemoveAccount } from "@/hooks/useIntegrations";
import { useClient } from "@/hooks/useClients";
import { useClients } from "@/hooks/useClients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  MousePointer2,
  TrendingUp,
  Eye,
  Percent,
  Loader2,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { PlatformNotConnected } from "@/components/PlatformNotConnected";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function GoogleAnalyticsDetailPage() {
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState<"sessions" | "users" | "views">("sessions");

  // Parse clientId from URL or default to null
  const selectedClientId = clientIdParam ? Number(clientIdParam) : null;

  // Fetch all clients for selector
  const { data: clients } = useClients();
  const { data: client } = useClient(selectedClientId);

  // Handle client selection - update URL
  const handleClientChange = (newClientId: string) => {
    navigate(`/data-sources/google-analytics/${newClientId}`);
  };

  const {
    data: propertiesData,
    isLoading: isLoadingProperties,
    error: propertiesError,
  } = useGoogleProperties(selectedClientId || 0);
  const {
    mutate: selectProperty,
    isPending: isSelectingProperty,
  } = useGoogleSelectProperty();

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useGoogleAnalyticsSummary(selectedClientId || 0);

  const {
    data: trendsData,
    isLoading: isLoadingTrends,
    error: trendsError,
  } = useGoogleAnalyticsTrends(selectedClientId || 0);

  const {
    data: topPagesData,
    isLoading: isLoadingTopPages,
    error: topPagesError,
  } = useGoogleAnalyticsTopPages(selectedClientId || 0);

  const {
    data: metaData,
    error: metaError,
  } = useGoogleAnalyticsMeta(selectedClientId || 0);

  const removeAccount = useRemoveAccount();
  const handleDisconnect = async () => {
    if (!client?.integrations || !selectedClientId) return;

    // Find the GA integration
    const integration = client.integrations.find(i => i.integrationType === 'google-analytics');
    if (!integration) return;

    try {
      await removeAccount.mutateAsync({
        clientId: selectedClientId,
        integrationType: 'google-analytics',
        accountId: integration.accountId
      });
    } catch {
      // handled in hook
    }
  };

  const trends = trendsData?.trends ?? [];
  const topPages = topPagesData?.topPages ?? [];
  const summary = summaryData?.summary;

  const trendsChartData = useMemo(() => trends.map((point) => {
    const date = point.date;
    const label =
      date && date.length === 8
        ? `${date.slice(4, 6)}/${date.slice(6, 8)}`
        : date;
    return {
      label,
      sessions: point.sessions || 0,
      activeUsers: point.activeUsers || 0,
      pageViews: point.pageViews || 0,
    };
  }), [trends]);

  const metricConfig = {
    sessions: { label: "Sessions", dataKey: "sessions", color: "#000000", icon: MousePointer2 },
    users: { label: "Users", dataKey: "activeUsers", color: "#71717a", icon: Users },
    views: { label: "Page Views", dataKey: "pageViews", color: "#18181b", icon: Eye },
  };

  const currentConfig = metricConfig[activeMetric];

  const hasIntegration = !!client?.integrations?.some(
    (i: any) => i.integrationType === "google-analytics"
  );
  const isConnected = !metaError && !!metaData?.property;
  const noPropertySelected =
    !!metaError &&
    metaError.message.toLowerCase().includes("no ga4 property selected");

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
                    <BreadcrumbLink onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 hover:text-slate-800 transition-colors font-medium text-xs">Data Sources</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-slate-300" />
                  <BreadcrumbItem>
                    <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider">Google Analytics</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-400 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative p-3.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-xl shadow-orange-900/10 ring-1 ring-white/20">
                    <SiGoogleanalytics className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Google Analytics</h1>
                  <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Website Traffic & Audience Insights</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <DataSyncBanner compact={true} />
              <div className="w-[280px]">
                <Select value={selectedClientId?.toString() || ""} onValueChange={handleClientChange}>
                  <SelectTrigger className="h-10 bg-white border-slate-200 shadow-sm rounded-xl transition-all focus:ring-slate-200 font-medium text-slate-700">
                    <SelectValue placeholder="Select Client Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()} className="font-medium cursor-pointer rounded-lg m-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-zinc-800" />
                          {client.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                className="h-10 rounded-xl px-4 shadow-sm text-xs font-bold uppercase"
                onClick={handleDisconnect}
                isLoading={removeAccount.isPending}
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="w-full px-8 py-4 space-y-8">
            {!selectedClientId ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-100 rounded-[32px] bg-white">
                <div className="p-4 bg-zinc-50 rounded-2xl mb-4">
                  <BarChart3 className="h-10 w-10 text-zinc-300" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">No Client Selected</h3>
                <p className="text-sm text-zinc-500 mt-2 max-w-xs leading-relaxed">
                  Please select a client from the dropdown above to view their Google Analytics performance metrics.
                </p>
              </div>
            ) : client && !hasIntegration ? (
              <PlatformNotConnected
                platformName="Google Analytics"
                icon={<SiGoogleanalytics className="h-10 w-10 text-orange-500" />}
                clientName={client.name}
              />
            ) : (
              <>
                {(summaryError || trendsError || topPagesError || metaError) && (
                  <div className="p-4 border border-red-100 bg-red-50/50 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-xs font-bold text-red-800 uppercase tracking-widest">
                      {summaryError && <p>Analytics Summary Error: {summaryError.message}</p>}
                      {trendsError && <p>Trends Data Error: {trendsError.message}</p>}
                    </div>
                  </div>
                )}

                {isConnected ? (
                  <>
                    {/* ── Summary Bento Cards ───────────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: "Total Sessions", value: summary?.totalSessions ?? 0, icon: MousePointer2, color: "text-blue-600", colorBg: "bg-blue-50", loading: isLoadingSummary },
                        { label: "Total Users", value: summary?.totalUsers ?? 0, icon: Users, color: "text-violet-600", colorBg: "bg-violet-50", loading: isLoadingSummary },
                        { label: "Total Views", value: summary?.totalViews ?? 0, icon: Eye, color: "text-emerald-600", colorBg: "bg-emerald-50", loading: isLoadingSummary },
                        { label: "Bounce Rate", value: summary?.avgBounceRate ?? 0, icon: Percent, color: "text-orange-600", colorBg: "bg-orange-50", loading: isLoadingSummary, suffix: "%", fixed: 1 },
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          className="group p-6 bg-white border border-zinc-100 rounded-[28px] transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50/30"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{item.label}</span>
                            <div className={cn("p-2 rounded-xl ring-1 ring-zinc-50", item.colorBg)}>
                              <item.icon className={cn("h-4 w-4", item.color)} />
                            </div>
                          </div>
                          {item.loading ? (
                            <Skeleton className="h-9 w-24 rounded-lg" />
                          ) : (
                            <div className="flex flex-col">
                              <div className="text-3xl font-bold tracking-tight text-zinc-900">
                                {item.fixed !== undefined ? item.value.toFixed(item.fixed) : item.value.toLocaleString()}
                                {item.suffix}
                              </div>
                              <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Last 30 Days</p>
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
                            Traffic Trends
                          </h2>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Daily engagement analysis</p>
                        </div>

                        <Tabs value={activeMetric} onValueChange={(v: any) => setActiveMetric(v)} className="w-auto">
                          <TabsList className="bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/50">
                            <TabsTrigger value="sessions" className="rounded-xl px-5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 transition-all uppercase tracking-widest">Sessions</TabsTrigger>
                            <TabsTrigger value="users" className="rounded-xl px-5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 transition-all uppercase tracking-widest">Users</TabsTrigger>
                            <TabsTrigger value="views" className="rounded-xl px-5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 transition-all uppercase tracking-widest">Views</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="h-[320px] w-full">
                        {isLoadingTrends ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 text-zinc-300 animate-spin" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Compiling Data...</span>
                          </div>
                        ) : trendsChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="label" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                              />
                              <Tooltip 
                                content={({ active, payload, label }: any) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-zinc-950 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentConfig.color }} />
                                          <p className="text-sm font-bold text-white">
                                            {currentConfig.label}: {payload[0].value.toLocaleString()}
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
                                dataKey={currentConfig.dataKey}
                                stroke={currentConfig.color}
                                strokeWidth={4}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0, fill: currentConfig.color }}
                                animationDuration={1500}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 opacity-60">
                            <BarChart3 className="h-10 w-10 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No Traffic Data Available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Top Performing Pages ───────────────────────────────────── */}
                    <div className="bg-white border border-zinc-100 rounded-[32px] p-8 transition-all hover:border-zinc-200">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-zinc-400" />
                            Top Performing Pages
                          </h3>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">High conversion & traffic hubs</p>
                        </div>
                      </div>

                      {isLoadingTopPages ? (
                        <div className="space-y-4">
                          <Skeleton className="h-10 w-full rounded-xl" />
                          <Skeleton className="h-10 w-full rounded-xl" />
                          <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                      ) : topPagesError ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <AlertCircle className="h-8 w-8 mb-3 text-red-200" />
                          <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Analytics Data Sync Error</p>
                        </div>
                      ) : topPages.length > 0 ? (
                        <div className="overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent border-b border-zinc-50">
                                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Page Path</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Title</TableHead>
                                <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0">Views</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {topPages.slice(0, 10).map((page: any) => (
                                <TableRow key={page.pagePath} className="group border-b border-zinc-50/50 hover:bg-zinc-50/50 transition-colors">
                                  <TableCell className="py-4 px-0">
                                    <div className="flex items-center gap-2 max-w-[180px] lg:max-w-md">
                                      <span className="truncate text-sm font-semibold text-zinc-900" title={page.pagePath}>
                                        {page.pagePath}
                                      </span>
                                      <ChevronRight className="h-3 w-3 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-0">
                                    <span className="text-sm text-zinc-500 font-medium truncate max-w-[150px] inline-block">
                                      {page.pageTitle || "Untitled Page"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right py-4 px-0">
                                    <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-zinc-50 rounded-lg text-xs font-bold text-zinc-900 ring-1 ring-zinc-100">
                                      {page.views.toLocaleString()}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-40">
                          <TrendingUp className="h-10 w-10 mb-4" />
                          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">No Page Activity Found</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : noPropertySelected ? (
                  <div className="max-w-2xl mx-auto p-12 bg-white border border-zinc-100 rounded-[32px] text-center">
                    <div className="p-4 bg-orange-50 rounded-2xl inline-block mb-6">
                      <SiGoogleanalytics className="h-10 w-10 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900">Select GA4 Property</h3>
                    <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                      This client is connected to Google Analytics, but no GA4 property has been selected for reporting.
                    </p>
                    
                    <div className="mt-8 space-y-4 max-w-md mx-auto">
                      {isLoadingProperties ? (
                        <Skeleton className="h-12 w-full rounded-xl" />
                      ) : propertiesError ? (
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
                          Failed to load properties: {propertiesError.message}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <select
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                            onChange={(e) => {
                              const property = propertiesData!.properties.find((p) => p.id === e.target.value);
                              if (!property) return;
                              selectProperty({
                                clientId: selectedClientId!,
                                body: { propertyId: property.id, propertyName: property.displayName },
                              });
                            }}
                            defaultValue=""
                            disabled={isSelectingProperty}
                          >
                            <option value="" disabled>Choose a property...</option>
                            {propertiesData!.properties.map((p) => (
                              <option key={p.id} value={p.id}>{p.displayName} ({p.accountName})</option>
                            ))}
                          </select>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                            Reports will activate immediately after selection.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-100 rounded-[32px] bg-white opacity-60">
                    <AlertCircle className="h-10 w-10 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-widest">Connection Active</h3>
                    <p className="text-xs text-zinc-500 mt-2 font-bold uppercase tracking-widest">Select a GA4 property to reveal insights</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleAnalyticsDetailPage;


