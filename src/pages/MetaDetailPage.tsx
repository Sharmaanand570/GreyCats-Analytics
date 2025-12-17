"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  SiMeta,
  SiFacebook,
  SiInstagram
} from "react-icons/si";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import {
  useFacebookPages,
  useFacebookPagePosts,
  useFacebookPostInsights,
  useFacebookSyncInsights,
  useInstagramBusinessAccount,
  useInstagramMedia,
  useInstagramMediaInsights,
  useInstagramSyncInsights,
  useInstagramProfile,
  useMetaAccounts,
  useMetaCampaignInsights,
  useMetaCampaigns,
  useMetaDailyInsights,
  useMetaDisconnect,
  useMetaReconnect,
  useMetaSavedInsights,
  useMetaSyncAds,
} from "@/features/meta/hooks/useMetaData";

import {
  Loader2,
  RefreshCw,
  Unplug,
  Eye,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  History,
  AlertCircle,
  ExternalLink,
  Search,
  MessageCircle,
  ThumbsUp,
  Share2,
  Calendar,
  MoreHorizontal,
  Video,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Utility Components ---

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  subValue,
  color = "blue"
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  subValue?: string;
  color?: "blue" | "green" | "indigo" | "orange";
}) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className={cn("p-2 rounded-lg", colorStyles[color])}>
            <Icon className="w-4 h-4" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center text-xs font-medium px-2 py-1 rounded-full",
              trend >= 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            )}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none">Active</Badge>;
  }
  if (normalized === "paused") {
    return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Paused</Badge>;
  }
  return <Badge variant="secondary" className="text-slate-500 bg-slate-100">{status}</Badge>;
};

// --- Main Page Component ---

function MetaDetailPage() {
  const [activeTab, setActiveTab] = useState("ads");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [syncingPageId, setSyncingPageId] = useState<string | null>(null);

  // Instagram State
  const [selectedIgPageId, setSelectedIgPageId] = useState<string | null>(null);
  const [selectedIgMediaId, setSelectedIgMediaId] = useState<string | null>(null);
  const [syncingIgId, setSyncingIgId] = useState<string | null>(null);

  const [campaignSearch, setCampaignSearch] = useState("");

  // -- Hooks --
  const { data: accountsData, isLoading: isLoadingAccounts, error: accountsError } = useMetaAccounts();
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useMetaCampaigns(selectedAccountId);
  const { data: campaignInsightsData, isLoading: isLoadingInsights } = useMetaCampaignInsights(selectedCampaignId);
  const { data: pagesData, isLoading: isLoadingPages } = useFacebookPages();
  const { data: postsData, isLoading: isLoadingPosts } = useFacebookPagePosts(selectedPageId || undefined, 10);
  const { data: postInsightsData, isLoading: isLoadingPostInsights, error: postInsightsError } = useFacebookPostInsights(selectedPostId || undefined, selectedPageId || undefined);
  const { data: savedInsightsData } = useMetaSavedInsights();
  const { data: dailyInsightsData } = useMetaDailyInsights();
  const { mutateAsync: reconnectMeta, isPending: isReconnecting } = useMetaReconnect();
  const { mutateAsync: disconnectMeta, isPending: isDisconnecting } = useMetaDisconnect();
  const { mutateAsync: syncAds, isPending: isSyncingAds } = useMetaSyncAds();
  const { mutateAsync: syncFacebook, isPending: isSyncingFacebook } = useFacebookSyncInsights();

  // -- Instagram Hooks --
  const { data: igBusinessData } = useInstagramBusinessAccount(selectedIgPageId || undefined);
  const igBusinessId = igBusinessData?.instagramBusinessAccount?.id;

  const { data: igProfileData, isLoading: isLoadingIgProfile } = useInstagramProfile(igBusinessId);
  const { data: igMediaData, isLoading: isLoadingIgMedia } = useInstagramMedia(igBusinessId, 20);
  const { data: igInsightsData, isLoading: isLoadingIgInsights, error: igInsightsError } = useInstagramMediaInsights(igBusinessId, selectedIgMediaId || undefined);
  const { mutateAsync: syncInstagram, isPending: isSyncingInstagram } = useInstagramSyncInsights();

  // -- Data Processing --
  const accounts = accountsData?.accounts ?? [];
  const campaigns = campaignsData?.campaigns ?? [];
  const insights = campaignInsightsData?.insights ?? [];
  const pages = pagesData?.pages ?? [];
  const posts = postsData?.posts ?? [];
  const postInsights = postInsightsData?.insights ?? [];
  const postEngagement = postInsightsData?.engagement;
  const savedInsights = savedInsightsData?.insights ?? [];
  const dailyHistory = dailyInsightsData?.history ?? [];

  // Instagram Data
  const igMedia = igMediaData?.data ?? [];
  const igInsights = igInsightsData?.data?.data ?? [];

  const tokenError = accountsError?.message.toLowerCase().includes("token");

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => c.name.toLowerCase().includes(campaignSearch.toLowerCase()));
  }, [campaigns, campaignSearch]);

  // Auto-select first account
  if (accounts.length > 0 && !selectedAccountId && !isLoadingAccounts) {
    setSelectedAccountId(accounts[0].account_id);
  }

  // Helper to calculate derived metrics safely
  const getDerivedMetrics = () => {
    if (!insights[0]) return { cpm: '0.00', ctr: '0.00' };

    const spend = Number(insights[0].spend || 0);
    const impressions = Number(insights[0].impressions || 0);
    const clicks = Number(insights[0].clicks || 0);

    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      cpm: cpm.toFixed(2),
      ctr: ctr.toFixed(2)
    };
  };

  const derivedMetrics = getDerivedMetrics();

  // Handlers
  const handleReconnect = async () => { try { await reconnectMeta(); } catch { } };
  const handleDisconnect = async () => { try { await disconnectMeta(); } catch { } };

  const handleSyncAds = async () => {
    if (!selectedAccountId) return;
    try {
      await syncAds(selectedAccountId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSyncFacebook = async (pageId: string) => {
    try {
      setSyncingPageId(pageId);
      await syncFacebook({ pageId });
    } catch {
    } finally {
      setSyncingPageId(null);
    }
  };

  const handleSyncInstagram = async (businessId: string) => {
    try {
      setSyncingIgId(businessId);
      await syncInstagram({ igBusinessId: businessId });
    } catch {
    } finally {
      setSyncingIgId(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 min-h-screen font-sans">

      {/* 1. Enhanced Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#0668E1] to-[#004499] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <SiMeta className="text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Meta Ads & Insights</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Data Connected
                  </span>
                  <span className="text-slate-300">|</span>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink href="/data-sources">Sources</BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>Meta</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAds}
                disabled={isSyncingAds || !selectedAccountId}
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
              >
                {isSyncingAds ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2 text-slate-500" />}
                Sync Campaigns
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <Unplug className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto p-6 space-y-8">

          {/* Alert Banner */}
          {tokenError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900">Authentication Required</h4>
                <p className="text-sm text-red-700 mt-1">Your Meta access token has expired. Please reconnect to restore data synchronization.</p>
                <Button size="sm" onClick={handleReconnect} className="mt-3 bg-red-600 hover:bg-red-700 text-white border-none">Reconnect Account</Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">

            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-1">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                <TabsTrigger
                  value="ads"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 text-slate-500 hover:text-slate-800 transition-all font-medium text-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" /> Ads Manager
                </TabsTrigger>
                <TabsTrigger
                  value="organic"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 text-slate-500 hover:text-slate-800 transition-all font-medium text-sm"
                >
                  <Globe className="w-4 h-4 mr-2" /> Facebook
                </TabsTrigger>
                <TabsTrigger
                  value="instagram"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-600 data-[state=active]:border-b-2 data-[state=active]:border-pink-600 rounded-none px-2 py-3 text-slate-500 hover:text-slate-800 transition-all font-medium text-sm"
                >
                  <SiInstagram className="w-4 h-4 mr-2" /> Instagram
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 text-slate-500 hover:text-slate-800 transition-all font-medium text-sm"
                >
                  <History className="w-4 h-4 mr-2" /> Sync History
                </TabsTrigger>
              </TabsList>

              {activeTab === "ads" && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ad Account</span>
                  <Select value={selectedAccountId || ""} onValueChange={(v) => { setSelectedAccountId(v); setSelectedCampaignId(null); }}>
                    <SelectTrigger className="w-[240px] h-9 bg-white border-slate-200">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.account_id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* --- ADS MANAGER TAB --- */}
            <TabsContent value="ads" className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
              <div className="grid grid-cols-12 gap-6 h-[800px]">

                {/* Left Panel: Campaign List */}
                <Card className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col h-full border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-slate-800">Campaigns</CardTitle>
                      <Badge variant="secondary" className="bg-white border text-slate-600">{filteredCampaigns.length}</Badge>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Filter campaigns..."
                        className="pl-9 bg-white border-slate-200 focus-visible:ring-blue-500"
                        value={campaignSearch}
                        onChange={(e) => setCampaignSearch(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    {isLoadingCampaigns ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                      </div>
                    ) : filteredCampaigns.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                        <p>No campaigns found.</p>
                      </div>
                    ) : (
                      <div className="h-full overflow-y-auto">
                        <div className="divide-y divide-slate-100">
                          {filteredCampaigns.map(campaign => {
                            const isSelected = selectedCampaignId === campaign.id;
                            return (
                              <div
                                key={campaign.id}
                                onClick={() => setSelectedCampaignId(campaign.id)}
                                className={cn(
                                  "p-4 cursor-pointer transition-all hover:bg-slate-50 border-l-4",
                                  isSelected ? "bg-blue-50/60 border-l-blue-600" : "border-l-transparent bg-white"
                                )}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={cn("text-sm font-semibold line-clamp-1 pr-2", isSelected ? "text-blue-900" : "text-slate-800")}>
                                    {campaign.name}
                                  </h4>
                                  <StatusBadge status={campaign.status} />
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                  <span>ID: {campaign.id.slice(-6)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right Panel: Insights */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6 overflow-y-auto pr-1">
                  {selectedCampaignId ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                      {/* KPI Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {isLoadingInsights ? (
                          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                        ) : (
                          <>
                            <MetricCard
                              title="Impressions"
                              value={Number(insights[0]?.impressions || 0).toLocaleString()}
                              icon={Eye}
                              color="blue"
                              trend={5.2}
                            />
                            <MetricCard
                              title="Clicks"
                              value={Number(insights[0]?.clicks || 0).toLocaleString()}
                              icon={MousePointerClick}
                              color="indigo"
                              trend={-1.4}
                            />
                            <MetricCard
                              title="Amount Spent"
                              value={`₹${Number(insights[0]?.spend || 0).toFixed(2)}`}
                              icon={DollarSign}
                              color="green"
                              trend={12.5}
                            />
                            <MetricCard
                              title="Cost Per Click"
                              value={`₹${Number(insights[0]?.cpc || 0).toFixed(2)}`}
                              icon={TrendingUp}
                              color="orange"
                              subValue="Avg. across ad sets"
                            />
                          </>
                        )}
                      </div>

                      {/* Detailed Stats Section */}
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Performance Breakdown</CardTitle>
                          <CardDescription>Calculated metrics for the selected campaign</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-lg border overflow-hidden">
                            <Table>
                              <TableHeader className="bg-slate-50">
                                <TableRow>
                                  <TableHead>Metric</TableHead>
                                  <TableHead className="text-right">Value</TableHead>
                                  <TableHead className="w-[100px]">Reference</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[
                                  { label: "CPM (Cost per 1k Imp)", value: `₹${derivedMetrics.cpm}`, goal: 65 },
                                  { label: "CTR (Click Through Rate)", value: `${derivedMetrics.ctr}%`, goal: 90 },
                                ].map((row, i) => (
                                  <TableRow key={i}>
                                    <TableCell className="font-medium">{row.label}</TableCell>
                                    <TableCell className="text-right">{row.value}</TableCell>
                                    <TableCell>
                                      {/* Simulated progress bar for "Goal" context */}
                                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-blue-500 rounded-full"
                                          style={{ width: `${row.goal}%` }}
                                        />
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
                      <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <MousePointerClick className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700">Select a Campaign</h3>
                      <p className="max-w-xs text-center mt-2">Click on a campaign from the left panel to view detailed performance insights.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* --- ORGANIC CONTENT TAB --- */}
            <TabsContent value="organic" className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">

              {/* Pages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingPages ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)
                ) : pages.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed">
                    <p className="text-slate-500">No Facebook Pages found. Check permissions.</p>
                  </div>
                ) : (
                  pages.map((page) => (
                    <Card key={page.id} className="group overflow-hidden border-slate-200 hover:border-blue-300 transition-all hover:shadow-md">
                      <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute -bottom-8 left-6">
                          <Avatar className="w-16 h-16 border-4 border-white shadow-sm">
                            <AvatarFallback className="bg-slate-100 text-blue-700 font-bold text-lg">
                              {page.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {page.instagram_business_account && (
                          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white">
                            <SiInstagram className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-10 px-6 pb-6">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">{page.name}</h3>
                        <div className="flex items-center gap-2 mt-2 mb-6">
                          <Badge variant="secondary" className="font-normal text-xs bg-slate-100 text-slate-500">
                            ID: {page.id}
                          </Badge>
                          <Badge variant="outline" className="font-normal text-xs border-blue-100 text-blue-600 bg-blue-50">
                            <SiFacebook className="w-3 h-3 mr-1" /> Page
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleSyncFacebook(page.id)}
                          disabled={isSyncingFacebook && syncingPageId === page.id}
                          variant="outline"
                          className="w-full border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        >
                          {isSyncingFacebook && syncingPageId === page.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                          Sync Insights
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Posts Section */}
              {pages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Recent Posts & Engagement</h2>
                    <Select value={selectedPageId || ""} onValueChange={(v) => { setSelectedPageId(v); setSelectedPostId(null); }}>
                      <SelectTrigger className="w-[250px] bg-white border-slate-200 shadow-sm">
                        <SelectValue placeholder="Select a Page to view posts" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[700px]">
                    {/* Posts List */}
                    <Card className="xl:col-span-4 h-full flex flex-col border-slate-200 shadow-sm">
                      <CardContent className="p-0 flex-1 overflow-hidden">
                        {!selectedPageId ? (
                          <div className="h-full flex items-center justify-center text-slate-400 p-8 text-center">Select a page above</div>
                        ) : isLoadingPosts ? (
                          <div className="p-4 space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
                        ) : posts.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-slate-400">No posts found</div>
                        ) : (
                          <div className="h-full overflow-y-auto">
                            <div className="divide-y divide-slate-100">
                              {posts.map(post => {
                                const isActive = selectedPostId === post.id;
                                return (
                                  <div
                                    key={post.id}
                                    onClick={() => setSelectedPostId(post.id)}
                                    className={cn(
                                      "p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 items-start group",
                                      isActive ? "bg-blue-50/50" : ""
                                    )}
                                  >
                                    {/* Thumbnail Placeholder */}
                                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-400">
                                      <SiFacebook className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn("text-sm font-medium line-clamp-2", isActive ? "text-blue-700" : "text-slate-700")}>
                                        {post.message || "No caption provided"}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(post.created_time), 'MMM d, yyyy')}
                                      </div>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Post Detail View (Facebook UI Mimic) */}
                    <div className="xl:col-span-8 h-full overflow-y-auto">
                      {selectedPostId ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

                          {/* The Post Preview */}
                          <Card className="h-fit border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 flex items-center justify-between border-b border-slate-50">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-blue-600 text-white font-bold">P</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">Page Name</p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    {format(new Date(posts.find(p => p.id === selectedPostId)?.created_time || new Date()), 'MMMM d')} • <Globe className="w-3 h-3" />
                                  </p>
                                </div>
                              </div>
                              <MoreHorizontal className="text-slate-400 w-5 h-5" />
                            </div>
                            <div className="p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                              {posts.find(p => p.id === selectedPostId)?.message}
                            </div>
                            {/* Image Placeholder area */}
                            <div className="h-64 bg-slate-100 flex items-center justify-center border-y border-slate-100">
                              <span className="text-slate-400 text-sm flex items-center gap-2"><SiFacebook /> Media Content</span>
                            </div>
                            <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-500 border-b border-slate-50">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">👍</div>
                                <span>{postEngagement?.likes || 0}</span>
                              </div>
                              <div className="flex gap-3">
                                <span>{postEngagement?.comments || 0} Comments</span>
                                <span>{postEngagement?.shares || 0} Shares</span>
                              </div>
                            </div>
                            <div className="p-2 flex items-center justify-between">
                              <Button variant="ghost" size="sm" className="flex-1 text-slate-500 gap-2"><ThumbsUp className="w-4 h-4" /> Like</Button>
                              <Button variant="ghost" size="sm" className="flex-1 text-slate-500 gap-2"><MessageCircle className="w-4 h-4" /> Comment</Button>
                              <Button variant="ghost" size="sm" className="flex-1 text-slate-500 gap-2"><Share2 className="w-4 h-4" /> Share</Button>
                            </div>
                          </Card>

                          {/* The Insights Panel */}
                          <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" /> Post Performance
                              </h3>

                              {isLoadingPostInsights ? (
                                <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
                              ) : postInsightsError ? (
                                <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">Failed to load detailed insights.</div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-600 font-semibold uppercase">Reach</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">
                                      {(postInsights.find(m => m.name === 'post_impressions_unique')?.values?.[0]?.value || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <p className="text-xs text-indigo-600 font-semibold uppercase">Clicks</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">
                                      {(postInsights.find(m => m.name === 'post_clicks')?.values?.[0]?.value || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                      <p className="text-sm font-medium text-slate-600">Total Engagement</p>
                                      <span className="text-lg font-bold text-slate-900">
                                        {(postInsights.find(m => m.name === 'post_engaged_users')?.values?.[0]?.value || 0).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500 w-[60%]" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 text-right">Top 15% of your posts</p>
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <a
                                  href={posts.find(p => p.id === selectedPostId)?.permalink_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1"
                                >
                                  View actual post on Facebook <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          Select a post to view preview & insights
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* --- INSTAGRAM TAB --- */}
            <TabsContent value="instagram" className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Instagram Insights</h2>
                  <p className="text-sm text-slate-500">Select a connected Facebook Page to view Instagram performance.</p>
                </div>
                <Select value={selectedIgPageId || ""} onValueChange={(v) => { setSelectedIgPageId(v); setSelectedIgMediaId(null); }}>
                  <SelectTrigger className="w-[300px] bg-white border-slate-200">
                    <SelectValue placeholder="Select Facebook Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map(p => (
                      <SelectItem key={p.id} value={p.id} disabled={!p.instagram_business_account}>
                        <div className="flex items-center justify-between w-full">
                          <span>{p.name}</span>
                          {p.instagram_business_account ? (
                            <Badge variant="secondary" className="ml-2 h-5 text-[10px] bg-pink-50 text-pink-600">Linked</Badge>
                          ) : (
                            <span className="text-xs text-slate-400 ml-2">(Unlinked)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIgPageId && igBusinessId && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[750px]">

                  {/* Left Panel: Media List */}
                  <Card className="xl:col-span-4 h-full flex flex-col border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white font-bold text-xs">
                              IG
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{igProfileData?.data?.username || "Instagram User"}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{igProfileData?.data?.media_count || 0} Posts</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-pink-200 text-pink-700 hover:bg-pink-50"
                          onClick={() => handleSyncInstagram(igBusinessId)}
                          disabled={isSyncingInstagram && syncingIgId === igBusinessId}
                        >
                          {isSyncingInstagram && syncingIgId === igBusinessId ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                          Sync
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                      {isLoadingIgMedia ? (
                        <div className="p-4 space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
                      ) : igMedia.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                          <p>No media found</p>
                        </div>
                      ) : (
                        <div className="h-full overflow-y-auto">
                          <div className="divide-y divide-slate-50">
                            {igMedia.map((item: any) => {
                              const isSelected = selectedIgMediaId === item.id;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => setSelectedIgMediaId(item.id)}
                                  className={cn(
                                    "p-3 cursor-pointer hover:bg-slate-50 transition-all flex gap-3 group border-l-4",
                                    isSelected ? "bg-pink-50/30 border-l-pink-500" : "border-l-transparent"
                                  )}
                                >
                                  <div className="h-16 w-16 bg-slate-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-300">
                                    {item.media_type === 'VIDEO' ? <Video className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                                  </div>
                                  <div className="flex-1 min-w-0 py-1">
                                    <p className={cn("text-xs font-medium line-clamp-2 mb-1.5", isSelected ? "text-pink-900" : "text-slate-700")}>
                                      {item.caption || "No caption"}
                                    </p>
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-slate-500 border-slate-200">
                                      {item.media_type.replace(/_/g, ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Right Panel: Detail & Insights */}
                  <div className="xl:col-span-8 h-full flex flex-col space-y-6 overflow-y-auto">
                    {selectedIgMediaId ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Preview Card */}
                          <Card className="border-slate-200 shadow-sm overflow-hidden h-fit">
                            <div className="p-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                  <SiInstagram className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800">@{igProfileData?.data?.username}</span>
                              </div>
                              <a
                                href={igMedia.find((m: any) => m.id === selectedIgMediaId)?.permalink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                View on IG <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-400">
                              {igMedia.find((m: any) => m.id === selectedIgMediaId)?.media_type === 'VIDEO' ? (
                                <Video className="w-12 h-12" />
                              ) : (
                                <ImageIcon className="w-12 h-12" />
                              )}
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {igMedia.find((m: any) => m.id === selectedIgMediaId)?.caption}
                              </p>
                            </div>
                          </Card>

                          {/* Insights Grid */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-pink-600" /> Performance
                            </h3>

                            {isLoadingIgInsights ? (
                              <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
                            ) : igInsightsError ? (
                              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                                Unable to load insights for this media.
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3">
                                {igInsights.map((metric: any) => (
                                  <div key={metric.name} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-pink-200 transition-colors">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                      {metric.name.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xl font-bold text-slate-900">
                                      {(metric.values?.[0]?.value || 0).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips</h4>
                              <p className="text-xs text-blue-700 leading-relaxed">
                                Instagram insights are only available for business accounts. Some metrics may not be available for older posts.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                          <SiInstagram className="w-8 h-8 text-pink-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Select Media</h3>
                        <p className="max-w-xs text-center mt-2">Select a post or video from the left to view detailed insights.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedIgPageId && !igBusinessId && !isLoadingIgProfile && (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-800">No Instagram Account Linked</h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                    The selected Facebook Page does not have a linked Instagram Business Account. Please link them in Meta Business Suite.
                  </p>
                </div>
              )}

              {!selectedIgPageId && (
                <div className="h-[400px] flex items-center justify-center text-slate-400 border border-slate-200 rounded-xl bg-slate-50/30">
                  <p>Select a Facebook Page above to start.</p>
                </div>
              )}
            </TabsContent>

            {/* --- HISTORY TAB --- */}
            <TabsContent value="history" className="animate-in slide-in-from-bottom-2 fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base">Sync Activity Log</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead>Date</TableHead><TableHead>Platform</TableHead><TableHead className="text-right">Points</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyHistory.length === 0 ? (
                          <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-500">No history available</TableCell></TableRow>
                        ) : (
                          dailyHistory.slice(0, 8).map((h, i) => (
                            <TableRow key={i}>
                              <TableCell>{new Date(h.date).toLocaleDateString()}</TableCell>
                              <TableCell><Badge variant="outline">{h.platform}</Badge></TableCell>
                              <TableCell className="text-right font-mono">{Object.keys(h.metrics || {}).length}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base">Saved Snapshots</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {savedInsights.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No saved snapshots</div>
                      ) : (
                        savedInsights.slice(0, 5).map((s, i) => (
                          <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><BarChart3 className="w-4 h-4" /></div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 capitalize">{s.platform} Report</p>
                                <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default MetaDetailPage;