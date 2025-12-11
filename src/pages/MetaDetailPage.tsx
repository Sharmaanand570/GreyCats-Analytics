import { useState } from "react";
import { Link } from "react-router-dom";
import { SiMeta } from "react-icons/si";
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
  useFacebookPages,
  useFacebookSyncInsights,
  useMetaAccounts,
  useMetaCampaignInsights,
  useMetaCampaigns,
  useMetaDailyInsights,
  useMetaDisconnect,
  useMetaReconnect,
  useMetaSavedInsights,
} from "@/features/meta/hooks/useMetaData";
import type { MetaAccount, MetaCampaign } from "@/features/meta/API/metaApi";
import type {
  MetaDailyHistoryItem,
  MetaSavedInsight,
} from "@/features/meta/API/metaInsightsApi";
import { Loader2, RefreshCw, Unplug, Eye, MousePointerClick, DollarSign, TrendingUp, ArrowRight, CheckCircle2, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function MetaDetailPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );

  const {
    data: accountsData,
    isLoading: isLoadingAccounts,
    error: accountsError,
  } = useMetaAccounts();

  const {
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    error: campaignsError,
  } = useMetaCampaigns(selectedAccountId);

  const {
    data: campaignInsightsData,
    isLoading: isLoadingInsights,
    error: insightsError,
  } = useMetaCampaignInsights(selectedCampaignId);

  const {
    data: pagesData,
    isLoading: isLoadingPages,
    error: pagesError,
  } = useFacebookPages();

  const {
    data: savedInsightsData,
    isLoading: isLoadingSaved,
    error: savedError,
  } = useMetaSavedInsights();

  const {
    data: dailyInsightsData,
    isLoading: isLoadingDaily,
    error: dailyError,
  } = useMetaDailyInsights();

  const {
    mutateAsync: reconnectMeta,
    isPending: isReconnecting,
  } = useMetaReconnect();

  const {
    mutateAsync: disconnectMeta,
    isPending: isDisconnecting,
  } = useMetaDisconnect();

  const {
    mutateAsync: syncFacebook,
    isPending: isSyncingFacebook,
  } = useFacebookSyncInsights();

  const accounts = accountsData?.accounts ?? [];
  const campaigns = campaignsData?.campaigns ?? [];
  const insights = campaignInsightsData?.insights ?? [];
  const pages = pagesData?.pages ?? [];
  const savedInsights = savedInsightsData?.insights ?? [];
  const dailyHistory = dailyInsightsData?.history ?? [];

  const tokenError =
    accountsError &&
    accountsError.message.toLowerCase().includes("token") &&
    accountsError.message.toLowerCase().includes("expired");

  const handleReconnect = async () => {
    try {
      await reconnectMeta();
    } catch {
      // handled in hook
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMeta();
    } catch {
      // handled in hook
    }
  };

  const handleSyncFacebook = async () => {
    if (!pages.length) return;
    try {
      await syncFacebook({ pageId: pages[0].id });
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] shadow-sm flex flex-col">
        {/* Header */}
        <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-6 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <SiMeta className="text-2xl text-[#0081FB]" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-zinc-900 leading-none">
                Meta Ads & Insights
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5">
                Overview of your ad accounts and organic performance
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border bg-zinc-50/50 p-1">
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium hover:bg-white hover:shadow-sm">
                <Link to="/data-sources/meta-facebook">Facebook Insights</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium hover:bg-white hover:shadow-sm">
                <Link to="/data-sources/meta-instagram">
                  Instagram Insights
                </Link>
              </Button>
            </div>
            <div className="h-6 w-px bg-border mx-1 hidden lg:block" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="h-9"
            >
              {isReconnecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  Reconnect
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="h-9"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Unplug className="w-3.5 h-3.5 mr-2" />
                  Disconnect
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="w-full px-6 py-3 border-b bg-zinc-50/40">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to="/data-sources" className="text-muted-foreground hover:text-foreground">
                  Data Sources
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground">Meta Ads Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Error States */}
            {tokenError && (
              <Card className="border-destructive/40 bg-destructive/5 shadow-none">
                <CardContent className="py-4 text-sm text-destructive space-y-1 flex items-start gap-3">
                  <Unplug className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Meta connection ended</p>
                    <p className="text-destructive/90">Meta token expired or permissions were revoked.</p>
                    <p className="text-xs mt-2 opacity-80">
                      Click <span className="font-semibold underline cursor-pointer" onClick={handleReconnect}>Reconnect</span> above to re-authorize.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {(accountsError && !tokenError) ||
              campaignsError ||
              insightsError ||
              pagesError ||
              savedError ||
              dailyError ? (
              <Card className="border-destructive/40 bg-destructive/5 shadow-none">
                <CardContent className="py-4 text-sm text-destructive list-disc list-inside space-y-1">
                  {accountsError && !tokenError && <li>Failed to load ad accounts: {accountsError.message}</li>}
                  {campaignsError && <li>Failed to load campaigns: {campaignsError.message}</li>}
                  {insightsError && <li>Failed to load campaign insights: {insightsError.message}</li>}
                  {pagesError && <li>Failed to load Facebook pages: {pagesError.message}</li>}
                  {savedError && <li>Failed to load saved insights: {savedError.message}</li>}
                  {dailyError && <li>Failed to load daily history: {dailyError.message}</li>}
                </CardContent>
              </Card>
            ) : null}

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* Left Column: Ad Accounts & Campaigns */}
              <div className="xl:col-span-2 space-y-6">

                {/* Ad Accounts */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3 border-b bg-zinc-50/40">
                    <CardTitle className="text-base font-semibold">Ad Accounts</CardTitle>
                    <CardDescription>Select an account to view campaigns</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoadingAccounts ? (
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : accounts.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No ad accounts found. Ensure proper permissions are granted.
                      </div>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-zinc-50 sticky top-0">
                            <TableRow>
                              <TableHead className="w-[180px]">Account ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead className="w-[100px] text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {accounts.map((account: MetaAccount) => {
                              const isSelected = selectedAccountId === account.account_id;
                              return (
                                <TableRow
                                  key={account.id}
                                  className={cn(
                                    "cursor-pointer transition-colors",
                                    isSelected ? "bg-blue-50/60 hover:bg-blue-50/80" : "hover:bg-zinc-50"
                                  )}
                                  onClick={() => {
                                    setSelectedAccountId(account.account_id);
                                    setSelectedCampaignId(null);
                                  }}
                                >
                                  <TableCell className="font-mono text-xs text-muted-foreground">
                                    {account.account_id}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {account.name}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {isSelected && <ArrowRight className="w-4 h-4 ml-auto text-blue-500" />}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Campaigns */}
                {selectedAccountId && (
                  <Card className="border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <CardHeader className="pb-3 border-b bg-zinc-50/40 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">Campaigns</CardTitle>
                        <CardDescription>Campaigns for account <span className="font-mono text-xs text-foreground bg-zinc-100 px-1.5 py-0.5 rounded">{selectedAccountId}</span></CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {isLoadingCampaigns ? (
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : campaigns.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No campaigns found for this account.
                        </div>
                      ) : (
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader className="bg-zinc-50 sticky top-0">
                              <TableRow>
                                <TableHead>Campaign Name</TableHead>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="w-[80px] text-right"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {campaigns.map((campaign: MetaCampaign) => {
                                const isSelected = selectedCampaignId === campaign.id;
                                const isActive = campaign.status.toUpperCase() === "ACTIVE";
                                return (
                                  <TableRow
                                    key={campaign.id}
                                    className={cn(
                                      "cursor-pointer transition-colors",
                                      isSelected ? "bg-blue-50/60 hover:bg-blue-50/80" : "hover:bg-zinc-50"
                                    )}
                                    onClick={() => setSelectedCampaignId(campaign.id)}
                                  >
                                    <TableCell className="font-medium">{campaign.name}</TableCell>
                                    <TableCell>
                                      <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                                        isActive
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                      )}>
                                        {isActive ? <CheckCircle2 className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                                        <span className="capitalize">{campaign.status.toLowerCase()}</span>
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {isSelected && <ArrowRight className="w-4 h-4 ml-auto text-blue-500" />}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Insights - displayed when a campaign is selected */}
                {selectedCampaignId && (
                  <Card className="border shadow-sm border-blue-100/50 bg-blue-50/30 animate-in fade-in zoom-in-95 duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Campaign Insights
                      </CardTitle>
                      <CardDescription>Performance Metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingInsights ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : insights.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center">No insights available.</p>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-1">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> Impressions
                            </p>
                            <p className="text-2xl font-bold tracking-tight">
                              {Number(insights[0].impressions || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-1">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <MousePointerClick className="w-3.5 h-3.5" /> Clicks
                            </p>
                            <p className="text-2xl font-bold tracking-tight">
                              {Number(insights[0].clicks || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-1">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5" /> Spend
                            </p>
                            <p className="text-2xl font-bold tracking-tight">
                              ${Number(insights[0].spend || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-1">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5" /> CPC
                            </p>
                            <p className="text-2xl font-bold tracking-tight">
                              ${Number(insights[0].cpc || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* Right Column: Facebook Pages & History */}
              <div className="space-y-6">

                {/* Facebook Pages */}
                <Card className="border shadow-sm h-fit">
                  <CardHeader className="pb-3 border-b bg-zinc-50/40">
                    <CardTitle className="text-base font-semibold">Organic Sync</CardTitle>
                    <CardDescription>
                      Connected Facebook Pages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {isLoadingPages ? (
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : pages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No Facebook pages found. Connect a business page in Meta
                        Business Suite.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-zinc-50 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{pages[0].name}</span>
                            {pages[0].instagram_business_account?.id && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-pink-50 text-pink-600 border border-pink-100">
                                IG Linked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate opacity-80">ID: {pages[0].id}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleSyncFacebook}
                          disabled={isSyncingFacebook}
                          className="w-full"
                        >
                          {isSyncingFacebook ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 mr-2" />
                              Sync Insights
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Daily History */}
                <Card className="border shadow-sm h-fit">
                  <CardHeader className="pb-3 border-b bg-zinc-50/40">
                    <CardTitle className="text-base font-semibold">Sync History</CardTitle>
                    <CardDescription>
                      Daily aggregates log
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoadingDaily ? (
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : dailyHistory.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        No history available.
                      </div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-zinc-50 sticky top-0">
                            <TableRow>
                              <TableHead className="w-24 text-xs">Date</TableHead>
                              <TableHead className="text-xs">Platform</TableHead>
                              <TableHead className="text-xs text-right">Data Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dailyHistory
                              .slice(0, 10)
                              .map((item: MetaDailyHistoryItem, index: number) => (
                                <TableRow key={`${item.platform}-${index}`}>
                                  <TableCell className="text-xs py-2">
                                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 capitalize font-medium">
                                    {item.platform}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 text-right text-muted-foreground">
                                    {Object.keys(item.metrics || {}).length}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm h-fit">
                  <CardHeader className="pb-3 border-b bg-zinc-50/40">
                    <CardTitle className="text-base font-semibold">Saved Insights</CardTitle>
                    <CardDescription>Manually saved snapshots</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoadingSaved ? (
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : savedInsights.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        No saved insights.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {savedInsights.slice(0, 5).map((item: MetaSavedInsight, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 text-sm">
                            <span className="font-medium capitalize text-zinc-700">{item.platform}</span>
                            <span className="text-xs text-muted-foreground">Insight Object</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetaDetailPage;


