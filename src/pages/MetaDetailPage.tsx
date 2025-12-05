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
import { Loader2 } from "lucide-react";

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
        console.log(pages);
      await syncFacebook({ pageId: pages[0].id });
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-3 lg:py-0">
            <div className="flex items-center gap-3">
              <SiMeta className="text-2xl text-[#0081FB]" />
              <span className="font-medium text-xl">
                Meta Ads & Insights Overview
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/data-sources/meta-facebook">Facebook Insights</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/data-sources/meta-instagram">
                  Instagram Insights
                </Link>
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
                  <BreadcrumbLink to="/data-sources">
                    Data Sources
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Meta Ads</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6">
            {tokenError && (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-4 text-sm text-destructive space-y-1">
                  <p>Meta token expired or permissions were revoked.</p>
                  <p className="text-xs text-muted-foreground">
                    Click <span className="font-semibold">Reconnect</span> to
                    re-authorize access.
                  </p>
                </CardContent>
              </Card>
            )}

            {(accountsError && !tokenError) ||
              campaignsError ||
              insightsError ||
              pagesError ||
              savedError ||
              dailyError ? (
              <Card className="border border-destructive/40 bg-destructive/5">
                <CardContent className="py-3 text-sm text-destructive space-y-1">
                  {accountsError && !tokenError && (
                    <p>Failed to load ad accounts: {accountsError.message}</p>
                  )}
                  {campaignsError && (
                    <p>Failed to load campaigns: {campaignsError.message}</p>
                  )}
                  {insightsError && (
                    <p>
                      Failed to load campaign insights: {insightsError.message}
                    </p>
                  )}
                  {pagesError && (
                    <p>Failed to load Facebook pages: {pagesError.message}</p>
                  )}
                  {savedError && (
                    <p>Failed to load saved insights: {savedError.message}</p>
                  )}
                  {dailyError && (
                    <p>Failed to load daily history: {dailyError.message}</p>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Ad Accounts</CardTitle>
                  <CardDescription>
                    Meta ad accounts connected to this integration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAccounts ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : accounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No ad accounts found. Ensure Meta is connected and has
                      permissions.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Account ID</TableHead>
                            <TableHead>Name</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.map((account: MetaAccount) => (
                            <TableRow
                              key={account.id}
                              className={
                                selectedAccountId === account.account_id
                                  ? "bg-muted/60"
                                  : ""
                              }
                              onClick={() => {
                                setSelectedAccountId(account.account_id);
                                setSelectedCampaignId(null);
                              }}
                            >
                              <TableCell className="font-mono text-xs">
                                {account.account_id}
                              </TableCell>
                              <TableCell>{account.name}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facebook Pages</CardTitle>
                  <CardDescription>
                    Pages available for syncing organic insights.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPages ? (
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : pages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No Facebook pages found. Connect a business page in Meta
                      Business Suite.
                    </p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">
                        {pages[0].name}{" "}
                        {pages[0].instagram_business_account?.id && (
                          <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700">
                            IG linked
                          </span>
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncFacebook}
                        disabled={isSyncingFacebook}
                      >
                        {isSyncingFacebook ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          "Sync Facebook & Instagram Insights"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedAccountId && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaigns</CardTitle>
                  <CardDescription>
                    Campaigns for ad account {selectedAccountId}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCampaigns ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No campaigns found for this account.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaigns.map((campaign: MetaCampaign) => (
                            <TableRow
                              key={campaign.id}
                              className={
                                selectedCampaignId === campaign.id
                                  ? "bg-muted/60"
                                  : ""
                              }
                              onClick={() => setSelectedCampaignId(campaign.id)}
                            >
                              <TableCell>{campaign.name}</TableCell>
                              <TableCell className="capitalize">
                                {campaign.status.toLowerCase()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedCampaignId && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Insights</CardTitle>
                  <CardDescription>
                    Performance snapshot for campaign {selectedCampaignId}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingInsights ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ) : insights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No insights available for this campaign.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Impressions
                        </p>
                        <p className="text-lg font-semibold">
                          {Number(insights[0].impressions || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Clicks
                        </p>
                        <p className="text-lg font-semibold">
                          {Number(insights[0].clicks || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Spend
                        </p>
                        <p className="text-lg font-semibold">
                          ${Number(insights[0].spend || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          CPC
                        </p>
                        <p className="text-lg font-semibold">
                          ${Number(insights[0].cpc || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Saved Insights</CardTitle>
                <CardDescription>
                  Most recently saved organic insights from Facebook and
                  Instagram.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSaved ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                    ) : savedInsights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No saved insights available yet.
                  </p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {savedInsights
                        .slice(0, 4)
                        .map((item: MetaSavedInsight, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border rounded-lg px-3 py-2"
                          >
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                              {item.platform}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Insights object
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily History</CardTitle>
                <CardDescription>
                  Stored daily aggregates across platforms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDaily ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : dailyHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No daily history available.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Metrics</TableHead>
                        </TableRow>
                      </TableHeader>
                        <TableBody>
                          {dailyHistory
                            .slice(0, 10)
                            .map((item: MetaDailyHistoryItem, index: number) => (
                              <TableRow key={`${item.platform}-${index}`}>
                                <TableCell className="text-xs">
                                  {new Date(item.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-xs capitalize">
                                  {item.platform}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {Object.keys(item.metrics || {}).length} fields
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

export default MetaDetailPage;


