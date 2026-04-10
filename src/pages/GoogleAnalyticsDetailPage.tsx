import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const navigate = useNavigate();

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
  const noPropertySelected =
    !!metaError &&
    metaError.message.toLowerCase().includes("no ga4 property selected");

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm rounded-t-[32px] mb-6">
            <div className="flex flex-col gap-2 relative">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 hover:text-slate-800 transition-colors font-medium">Data Sources</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-slate-300" />
                  <BreadcrumbItem>
                    <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-sm tracking-wide">Google Analytics</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-zinc-800 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative p-3.5 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl shadow-xl shadow-zinc-900/10 ring-1 ring-white/20">
                    <SiGoogleanalytics className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Google Analytics</h1>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Website traffic and insights</p>
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
                className="h-10 rounded-xl px-4 shadow-sm"
                onClick={handleDisconnect}
                isLoading={removeAccount.isPending}
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="w-full px-5 py-6 space-y-6">

            {!selectedClientId ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Please select a client from the dropdown above to view Google Analytics data.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
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
                ) : noPropertySelected ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Select a GA4 property
                      </CardTitle>
                      <CardDescription>
                        Choose which GA4 property this connection should use for reports.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLoadingProperties ? (
                        <Skeleton className="h-10 w-full" />
                      ) : propertiesError ? (
                        <p className="text-sm text-destructive">
                          Failed to load GA4 properties: {propertiesError.message}
                        </p>
                      ) : (propertiesData?.properties?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No GA4 properties found for this Google account.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <select
                            className="border rounded px-3 py-2 text-sm"
                            onChange={(e) => {
                              const property = propertiesData!.properties.find(
                                (p) => p.id === e.target.value
                              );
                              if (!property) return;
                              selectProperty({
                                clientId: selectedClientId!,
                                body: {
                                  propertyId: property.id,
                                  propertyName: property.displayName,
                                },
                              });
                            }}
                            defaultValue=""
                            disabled={isSelectingProperty}
                          >
                            <option value="" disabled>
                              Select a GA4 property...
                            </option>
                            {propertiesData!.properties.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.displayName} ({p.accountName})
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground">
                            After selecting a property, the summary and trends sections
                            will refresh with data.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-4 text-sm text-muted-foreground">
                      Google Analytics is not connected or has no active property.
                      Reconnect and select a property to see metrics.
                    </CardContent>
                  </Card>
                )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleAnalyticsDetailPage;


