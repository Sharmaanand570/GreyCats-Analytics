import { useMemo } from "react";
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
  useGoogleConsoleBilling,
  useGoogleConsoleBillingAccounts,
  useGoogleConsoleDisconnect,
  useGoogleConsoleProjects,
  useGoogleConsoleReconnect,
} from "@/features/YouTube/hooks/google/useGoogleConsoleData";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

function GoogleConsoleDetailPage() {
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useGoogleConsoleProjects();

  const {
    data: billingData,
    isLoading: isLoadingBilling,
    error: billingError,
  } = useGoogleConsoleBilling(1);

  const {
    data: billingAccountsData,
    isLoading: isLoadingAccounts,
    error: billingAccountsError,
  } = useGoogleConsoleBillingAccounts();

  const {
    mutateAsync: reconnectConsole,
    isPending: isReconnecting,
  } = useGoogleConsoleReconnect();

  const {
    mutateAsync: disconnectConsole,
    isPending: isDisconnecting,
  } = useGoogleConsoleDisconnect();

  const tokenExpired =
    projectsError &&
    projectsError.message.includes(
      "Google token expired or permissions revoked"
    );

  const projectsSummary = useMemo(
    () => ({
      count: projectsData?.count ?? 0,
      skipped: projectsData?.skipped ?? 0,
    }),
    [projectsData]
  );

  const billingSummary = useMemo(
    () => ({
      inserted: billingData?.inserted ?? 0,
      skipped: billingData?.skipped ?? 0,
      window: billingData?.window,
    }),
    [billingData]
  );

  const billingAccounts = billingAccountsData?.accounts ?? [];

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

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex items-center gap-3">
              <FaGoogle className="text-2xl text-[#4285F4]" />
              <span className="font-medium text-xl">
                Google Console Overview
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
                  <BreadcrumbPage>Google Console</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6">
            {tokenExpired && (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-4 text-sm text-destructive space-y-1">
                  <p>
                    Google Console token expired or permissions were revoked.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click <span className="font-semibold">Reconnect</span> to
                    re-authorize access.
                  </p>
                </CardContent>
              </Card>
            )}

            {(projectsError && !tokenExpired) ||
              billingError ||
              billingAccountsError ? (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-3 text-sm text-destructive space-y-1">
                  {projectsError && !tokenExpired && (
                    <p>Failed to load projects: {projectsError.message}</p>
                  )}
                  {billingError && (
                    <p>Failed to load billing data: {billingError.message}</p>
                  )}
                  {billingAccountsError && (
                    <p>
                      Failed to load billing accounts:{" "}
                      {billingAccountsError.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Projects
                  </CardTitle>
                  <CardDescription>
                    Total Google Cloud projects discovered for this account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-2xl font-semibold">
                        {projectsSummary.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Skipped: {projectsSummary.skipped.toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Latest Billing Window
                  </CardTitle>
                  <CardDescription>
                    Usage pulled from BigQuery for the selected period.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBilling ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : billingSummary.window ? (
                    <div className="space-y-2 text-sm">
                      <p className="text-xs text-muted-foreground">
                        Window
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(billingSummary.window.start),
                          "PP"
                        )}{" "}
                        –{" "}
                        {format(
                          new Date(billingSummary.window.end),
                          "PP"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Inserted rows:{" "}
                        <span className="font-medium">
                          {billingSummary.inserted.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Skipped rows:{" "}
                        <span className="font-medium">
                          {billingSummary.skipped.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No billing data available yet. Trigger a sync from the
                      backend to populate this section.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing Accounts</CardTitle>
                <CardDescription>
                  Google Cloud billing accounts linked to this integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAccounts ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : billingAccountsError ? (
                  <p className="text-sm text-destructive">
                    Failed to load billing accounts: {billingAccountsError.message}
                  </p>
                ) : billingAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No billing accounts have been detected for this Google Cloud
                    connection.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Billing Account ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingAccounts.map((account) => (
                          <TableRow key={account.billingAccountId}>
                            <TableCell className="font-mono text-xs">
                              {account.billingAccountId}
                            </TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  account.open
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {account.open ? "Open" : "Closed"}
                              </span>
                            </TableCell>
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


