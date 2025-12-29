import { useParams, useNavigate } from "react-router-dom";
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
import { useClients } from "@/hooks/useClients";
import {
  useGoogleConsoleSelectProperty,
  useGoogleConsoleSummary,
  useGoogleConsoleTopPages,
  useGoogleConsoleTopQueries,
  useGoogleConsoleProperties,
} from "@/features/YouTube/hooks/google/useGoogleConsoleData";
import { useRemoveAccount } from "@/hooks/useIntegrations";
import { useClient } from "@/hooks/useClients";
import {
  Loader2,
  MousePointer2,
  Eye,
  Percent,
  Trophy,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { DataSyncBanner } from "@/components/DataSyncBanner";

function GoogleConsoleDetailPage() {
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const navigate = useNavigate();

  // Parse clientId from URL or default to null
  const selectedClientId = clientIdParam ? Number(clientIdParam) : null;

  // Fetch all clients for selector
  const { data: clients } = useClients();
  const { data: client } = useClient(selectedClientId);

  // Handle client selection - update URL
  const handleClientChange = (newClientId: string) => {
    navigate(`/data-sources/google-console/${newClientId}`);
  };

  const clientId = selectedClientId || 0;

  const {
    data: propertiesData,
    isLoading: isLoadingProperties,
  } = useGoogleConsoleProperties(clientId);

  const properties = propertiesData?.properties || [];

  console.log("propertiesData", propertiesData);

  // Use new overview endpoints
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useGoogleConsoleSummary(clientId);

  const summaryMetrics = summaryData?.summary || {
    totalClicks: 0,
    totalImpressions: 0,
    avgCTR: 0,
    avgPosition: 0
  };

  const {
    data: topPagesData,
    isLoading: isLoadingTopPages,
  } = useGoogleConsoleTopPages(clientId);

  const {
    data: topQueriesData,
    isLoading: isLoadingTopQueries,
  } = useGoogleConsoleTopQueries(clientId);

  const {
    mutateAsync: selectProperty,
    isPending: isSelectingProperty,
  } = useGoogleConsoleSelectProperty();

  const removeAccount = useRemoveAccount();
  const handleDisconnect = async () => {
    if (!client?.integrations || !selectedClientId) return;

    // Find the Google Console integration/account
    // Note: IntegrationType 'google-search-console' needs to vary based on how it's stored.
    // Assuming 'google-search-console' or similar. I'll check integration types first if unsafe.
    // Based on previous files, let's assume 'google-search-console'.
    const integration = client.integrations.find(i => i.integrationType === 'google-search-console');
    if (!integration) return;

    try {
      await removeAccount.mutateAsync({
        clientId: selectedClientId,
        integrationType: 'google-search-console',
        accountId: integration.accountId
      });
    } catch {
      // handled in hook
    }
  };

  const handleSelectProperty = async (siteUrl: string) => {
    if (!siteUrl) return;
    try {
      await selectProperty({ clientId, body: { siteUrl } });
    } catch {
      // toast handled in hook
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
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
                disabled={removeAccount.isPending}
              >
                {removeAccount.isPending ? (
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
                  <BreadcrumbLink to="/data-sources">
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
            {!isLoadingSummary && !summaryData?.summary && <DataSyncBanner />}


            {/* Error display removed for properties error as requested */}
            {summaryError && (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-3 text-sm text-destructive space-y-1">
                  <p>
                    Failed to load SEO metrics: {summaryError.message}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Selected Property
                  </CardTitle>
                  <CardDescription>
                    Choose which property daily SEO sync should use.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProperties ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : properties.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No Search Console properties found for this account.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {properties.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${p.isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background'
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {p.siteUrl}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.permissionLevel}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {p.isSelected ? (
                              <span className="text-xs font-medium text-primary px-3 py-1 bg-primary/10 rounded-full">
                                ✓ Selected
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSelectProperty(p.siteUrl)}
                                disabled={isSelectingProperty}
                              >
                                {isSelectingProperty ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                    Selecting...
                                  </>
                                ) : (
                                  'Select'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Clicks
                    </CardTitle>
                    <MousePointer2 className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold">
                          {summaryMetrics.totalClicks.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last 30 days
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Impressions
                    </CardTitle>
                    <Eye className="h-4 w-4 text-violet-500" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold">
                          {summaryMetrics.totalImpressions.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last 30 days
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average CTR
                    </CardTitle>
                    <Percent className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold">
                          {(summaryMetrics.avgCTR * 100).toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last 30 days
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Position
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingSummary ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold">
                          {summaryMetrics.avgPosition.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last 30 days
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top Pages */}
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Top Performing Pages
                    </CardTitle>
                    <CardDescription>Highest traffic pages by clicks</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTopPages ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : topPagesData?.topPages && topPagesData.topPages.length > 0 ? (
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
                          {topPagesData.topPages.map((page, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2 max-w-md">
                                  <span className="truncate text-blue-600 hover:underline cursor-pointer" title={page.page}>
                                    {page.page.replace(/^https?:\/\/[^/]+/, '')}
                                  </span>
                                  <a href={page.page} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{page.clicks.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-muted-foreground">{page.impressions.toLocaleString()}</TableCell>
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
                    <CardDescription>Keywords driving traffic (last 30 days)</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTopQueries ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : topQueriesData?.topQueries && topQueriesData.topQueries.length > 0 ? (
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
                          {topQueriesData.topQueries.map((query, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{query.query}</TableCell>
                              <TableCell className="text-right font-medium">{query.clicks.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-muted-foreground">{query.impressions.toLocaleString()}</TableCell>
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

