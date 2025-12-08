import { useMemo, useState } from "react";
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
  useGoogleConsoleDisconnect,
  useGoogleConsolePerformance,
  useGoogleConsoleProperties,
  useGoogleConsoleReconnect,
  useGoogleConsoleSelectProperty,
  useGoogleConsoleUnifiedMetrics,
} from "@/features/YouTube/hooks/google/useGoogleConsoleData";
import { Loader2 } from "lucide-react";

function GoogleConsoleDetailPage() {
  const {
    data: propertiesData,
    isLoading: isLoadingProperties,
    error: propertiesError,
  } = useGoogleConsoleProperties();

  console.log("propertiesData", propertiesData);

  const [selectedSiteUrl, setSelectedSiteUrl] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    format(subDays(new Date(), 6), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [dimension, setDimension] = useState<string>("date");
  const [performanceRows, setPerformanceRows] = useState<
    { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[]
  >([]);
  const [performanceError, setPerformanceError] = useState<string | null>(null);

  const unifiedMetricsParams = useMemo(
    () => ({
      integration: "google-search-console",
      metricKey: "google_seo.clicks",
      dimensionType: dimension ? [dimension] : undefined,
      startDate,
      endDate,
    }),
    [dimension, startDate, endDate]
  );

  const {
    data: unifiedMetricsData,
    isLoading: isLoadingUnified,
    error: unifiedError,
  } = useGoogleConsoleUnifiedMetrics(unifiedMetricsParams);

  console.log("unifiedMetricsData", unifiedMetricsData, unifiedError);

  const {
    mutateAsync: selectProperty,
    isPending: isSelectingProperty,
  } = useGoogleConsoleSelectProperty();

  const {
    mutateAsync: reconnectConsole,
    isPending: isReconnecting,
  } = useGoogleConsoleReconnect();

  const {
    mutateAsync: disconnectConsole,
    isPending: isDisconnecting,
  } = useGoogleConsoleDisconnect();

  const {
    mutateAsync: fetchPerformance,
    isPending: isFetchingPerformance,
  } = useGoogleConsolePerformance();

  const tokenExpired =
    (propertiesError &&
      propertiesError.message.toLowerCase().includes("token expired")) ||
    (unifiedError &&
      unifiedError.message.toLowerCase().includes("token expired"));

  const properties = propertiesData?.properties ?? [];
  const selectedProperty = useMemo(
    () => properties.find((p) => p.isSelected),
    [properties]
  );

  const clicksSummary = useMemo(() => {
    const rows = unifiedMetricsData?.rows ?? [];
    if (!rows.length) return { total: 0, days: 0 };

    const filtered = rows.filter(
      (r) =>
        r.integration === "google-search-console" &&
        r.metricKey === "google_seo.clicks" &&
        (!selectedProperty || r.accountId === selectedProperty.siteUrl)
    );

    if (!filtered.length) return { total: 0, days: 0 };

    const total = filtered.reduce((sum, r) => sum + (r.value ?? 0), 0);
    const days = new Set(filtered.map((r) => r.date)).size;
    return { total, days };
  }, [unifiedMetricsData, selectedProperty]);

  const handleReconnect = async () => {
    try {
      await reconnectConsole();
    } catch {
      // handled in hook via toast
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectConsole();
    } catch {
      // handled in hook via toast
    }
  };

  const handleSelectProperty = async (siteUrl: string) => {
    console.log(siteUrl);
    if (!siteUrl) return;
    try {
    const resp =  await selectProperty({ siteUrl });
    console.log(resp);
      setSelectedSiteUrl(siteUrl);
    } catch {
      // toast handled in hook
    }
  };

  const handleFetchPerformance = async () => {
    if (!selectedSiteUrl || !startDate || !endDate) {
      setPerformanceError("Please select a property and date range first.");
      return;
    }

    setPerformanceError(null);
    try {
      const resp = await fetchPerformance({
        siteUrl: selectedSiteUrl,
        startDate,
        endDate,
        dimension,
      });
      setPerformanceRows(resp.rows ?? []);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to fetch Search Console performance data";
      setPerformanceError(msg);
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
            {tokenExpired && (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-4 text-sm text-destructive space-y-1">
                  <p>
                    Google Search Console token expired or permissions were
                    revoked.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click <span className="font-semibold">Reconnect</span> to
                    re-authorize access.
                  </p>
                </CardContent>
              </Card>
            )}

            {(propertiesError && !tokenExpired) || unifiedError ? (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-3 text-sm text-destructive space-y-1">
                  {propertiesError && !tokenExpired && (
                    <p>
                      Failed to load Search Console properties:{" "}
                      {propertiesError.message}
                    </p>
                  )}
                  {unifiedError && (
                    <p>
                      Failed to load SEO metrics: {unifiedError.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : null}

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
                    <div className="space-y-3 text-sm">
                      <select
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={selectedProperty?.siteUrl || ""}
                        onChange={(e) => {
                          handleSelectProperty(e.target.value)
                          console.log(e.target.value);
                        }}
                        disabled={isSelectingProperty}
                      >
                        <option value="" disabled>
                          Select a property...
                        </option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.siteUrl}>
                            {p.siteUrl} ({p.permissionLevel})
                          </option>
                        ))}
                      </select>
                      {selectedProperty && (
                        <p className="text-xs text-muted-foreground">
                          Currently selected:{" "}
                          <span className="font-medium">
                            {selectedProperty.siteUrl}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    SEO Clicks (Cron)
                  </CardTitle>
                  <CardDescription>
                    Aggregated clicks from unified metrics for the selected
                    property.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUnified ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-2xl font-semibold">
                        {clicksSummary.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Days tracked: {clicksSummary.days}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Manual Performance Fetch (Debug)</CardTitle>
                <CardDescription>
                  Run an on-demand Search Console query for a property and date
                  range.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Property</p>
                    <select
                      className="border rounded px-3 py-2 text-sm w-full"
                      value={selectedSiteUrl}
                      onChange={(e) => setSelectedSiteUrl(e.target.value)}
                    >
                      <option value="">Select...</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.siteUrl}>
                          {p.siteUrl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Start date</p>
                    <input
                      type="date"
                      className="border rounded px-3 py-2 text-sm w-full"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">End date</p>
                    <input
                      type="date"
                      className="border rounded px-3 py-2 text-sm w-full"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Dimension</p>
                    <select
                      className="border rounded px-3 py-2 text-sm w-full"
                      value={dimension}
                      onChange={(e) => setDimension(e.target.value)}
                    >
                      <option value="date">date</option>
                      <option value="query">query</option>
                      <option value="page">page</option>
                      <option value="country">country</option>
                      <option value="device">device</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleFetchPerformance}
                    disabled={isFetchingPerformance}
                  >
                    {isFetchingPerformance ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        Fetching...
                      </>
                    ) : (
                      "Fetch Performance"
                    )}
                  </Button>
                </div>

                {performanceError && (
                  <p className="text-sm text-destructive">{performanceError}</p>
                )}

                {performanceRows.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>Impressions</TableHead>
                          <TableHead>CTR</TableHead>
                          <TableHead>Position</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceRows.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{row.keys.join(", ")}</TableCell>
                            <TableCell>{row.clicks}</TableCell>
                            <TableCell>{row.impressions}</TableCell>
                            <TableCell>
                              {(row.ctr * 100).toFixed(2)}%
                            </TableCell>
                            <TableCell>{row.position.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

export default GoogleConsoleDetailPage;

