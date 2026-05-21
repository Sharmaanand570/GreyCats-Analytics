"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { SiMeta } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  TrendingUp,
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  Filter,
  Sparkles,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Loader2,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useUpdateCampaign,
  useUpdateCampaignStatus,
} from "@/features/meta/hooks/useMetaAdsManager";
import type { CampaignStatus } from "@/features/meta/API/metaAdsManagerApi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { useMetaAdsMeta, useMetaAdsSummary, useMetaAdsCampaigns, useMetaAdsTrends } from "@/features/meta/hooks/useMetaAdsData";
import { useClients, useClient } from "@/hooks/useClients";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import { PlatformNotConnected } from "@/components/PlatformNotConnected";
import { AlertCircle, RefreshCw } from "lucide-react";

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
    PAUSED: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Paused" },
    ARCHIVED: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500", label: "Archived" },
  };
  const normalizedStatus = status ? status.toUpperCase() : "ACTIVE";
  const variant = variants[normalizedStatus] || variants.ACTIVE;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variant.bg} ${variant.text} transition-all duration-200`}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant.dot} animate-pulse`} />
      {variant.label}
    </div>
  );
};

const BentoMetricCard = ({ title, value, icon, color = "zinc", subValue }: any) => {
  const colorMap: any = {
    blue: { text: "text-blue-600", bg: "bg-blue-50" },
    emerald: { text: "text-emerald-600", bg: "bg-emerald-50" },
    violet: { text: "text-violet-600", bg: "bg-violet-50" },
    amber: { text: "text-amber-600", bg: "bg-amber-50" },
    rose: { text: "text-rose-600", bg: "bg-rose-50" },
    zinc: { text: "text-zinc-600", bg: "bg-zinc-50" },
  };
  const c = colorMap[color] || colorMap.zinc;

  return (
    <Card className="rounded-[28px] border-zinc-100 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50/30">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{value}</h3>
            </div>
            {subValue && (
              <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{subValue}</p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-2xl ring-1 ring-zinc-100", c.bg)}>
            <div className={cn("w-4 h-4", c.text)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-800 p-4 rounded-xl shadow-xl text-slate-50 min-w-[200px]">
        <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300">{entry.name}</span>
              </div>
              <span className="font-mono font-medium">
                {entry.name.includes('Spend') || entry.name.includes('CPC') ? '₹' : ''}
                {entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ErrorState = ({ title, message, onRetry, className }: any) => (
  <div className={`flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center shadow-sm ${className}`}>
    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
      <AlertCircle className="w-6 h-6 text-rose-500" />
    </div>
    <h3 className="text-slate-900 font-semibold mb-1">{title || "Sync Issue Detected"}</h3>
    <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
      {message || "We encountered an error while fetching this data from Meta. This might be temporary."}
    </p>
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onRetry}
      className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Retry Fetch
    </Button>
  </div>
);

// --- Main Page ---

function MetaDetailPage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  // Initialize from URL so the page shows the client the user came from,
  // not the first client in the list.
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    clientIdParam ? Number(clientIdParam) : null
  );

  // Default to Dec 1, 2025 - Dec 31, 2025 as requested
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 11, 1),
    to: new Date(2025, 11, 31),
  });

  const { data: clientsData } = useClients();
  const clients = clientsData || [];
  const { data: clientData } = useClient(selectedClientId);
  
  useEffect(() => {
    if (clientData) {
      console.log("DEBUG - Client Data:", clientData);
      console.log("DEBUG - Integrations:", clientData.integrations);
      console.log("DEBUG - Meta Business Accounts:", clientData.metaBusinessAccounts);
    }
  }, [clientData]);

  const hasMetaAdsIntegration = useMemo(() => {
    const hasIntegration = !!clientData?.integrations?.some(
      (i: any) => 
        i.integrationType === "meta-ads" || 
        i.integrationType === "meta_ads" || 
        i.integrationType === "meta-business" || 
        i.integrationType === "meta_business" ||
        i.integrationType === "meta_facebook" ||
        i.integrationType === "meta_instagram"
    ) || (clientData?.metaBusinessAccounts && clientData.metaBusinessAccounts.length > 0);
    
    console.log("DEBUG - hasMetaAdsIntegration:", hasIntegration);
    return hasIntegration;
  }, [clientData]);

  // Sync with URL param; fall back to first client only when no param present
  useEffect(() => {
    if (clientIdParam) {
      const parsed = Number(clientIdParam);
      if (!Number.isNaN(parsed) && parsed !== selectedClientId) {
        setSelectedClientId(parsed);
      }
    } else if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clientIdParam, clients, selectedClientId]);

  // Format dates for API
  const apiParams = {
    startDate: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
    endDate: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
  };

  const { 
    data: metaData, 
    isLoading: isLoadingMeta, 
    isError: isErrorMeta, 
    error: errorMeta,
    refetch: refetchMeta
  } = useMetaAdsMeta(selectedClientId || 0, apiParams);
  
  const { 
    data: summaryData, 
    isLoading: isLoadingSummary, 
    isError: isErrorSummary, 
    error: errorSummary,
    refetch: refetchSummary
  } = useMetaAdsSummary(selectedClientId || 0, apiParams);
  
  const { 
    data: campaignsData, 
    isLoading: isLoadingCampaigns, 
    isError: isErrorCampaigns, 
    error: errorCampaigns,
    refetch: refetchCampaigns
  } = useMetaAdsCampaigns(selectedClientId || 0, apiParams);
  
  const { 
    data: trendsData, 
    isLoading: isLoadingTrends, 
    isError: isErrorTrends, 
    error: errorTrends,
    refetch: refetchTrends
  } = useMetaAdsTrends(selectedClientId || 0, apiParams);

  const campaigns = summaryData?.campaigns || [];
  const allCampaigns = campaignsData?.campaigns || [];
  const trends = trendsData?.trends || [];
  const meta = metaData?.summary;
  const accountName = metaData?.accountName || "Meta Ads Account";

  // DEBUG: Console the Meta Ads response for verification
  useEffect(() => {
    if (isLoadingMeta || isLoadingSummary || isLoadingCampaigns || isLoadingTrends) {
      console.log("META_ADS_LOADING_STATE:", { 
        isLoadingMeta, 
        isLoadingSummary, 
        isLoadingCampaigns, 
        isLoadingTrends,
        selectedClientId,
        apiParams
      });
    }
    
    if (metaData) console.log("META_ADS_META_RESPONSE:", metaData);
    if (summaryData) console.log("META_ADS_SUMMARY_RESPONSE:", summaryData);
    
    if (allCampaigns && allCampaigns.length > 0) {
      console.log("META_ADS_CAMPAIGNS_TABLE_RESPONSE:", allCampaigns);
    }
  }, [allCampaigns, isLoadingMeta, isLoadingSummary, isLoadingCampaigns, isLoadingTrends, metaData, summaryData, selectedClientId, apiParams]);

  // Use meta summary if it has values, otherwise aggregate from campaigns.
  // Prefer summaryData.campaigns; fall back to allCampaigns from /campaigns endpoint.
  const sourceForAggregation = (campaigns.length > 0 ? campaigns : allCampaigns) as any[];
  const sumOf = (key: string) => sourceForAggregation.reduce((s, c) => s + (Number(c?.[key]) || 0), 0);

  const totalSpend = meta?.spend || sumOf("spend");
  const totalImpressions = meta?.impressions || sumOf("impressions");
  const totalClicks = meta?.clicks || sumOf("clicks");
  const avgCTR = meta?.ctr || (totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0);
  const avgCPM = meta?.cpm || (totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0);

  // Check for "No Meta Ads account assigned to this client." error
  const getAxiosErrorMsg = (err: any) => err?.response?.data?.message || err?.message;
  
  const anyErrorMsg = getAxiosErrorMsg(errorMeta) || 
                      getAxiosErrorMsg(errorSummary) || 
                      getAxiosErrorMsg(errorCampaigns) || 
                      getAxiosErrorMsg(errorTrends);

  const isNoAccountAssigned = anyErrorMsg === "No Meta Ads account assigned to this client.";

  const { mutate: changeStatus, isPending: isUpdatingStatus, variables: statusVars } =
    useUpdateCampaignStatus();
  const { mutate: editCampaign, isPending: isEditingCampaign } = useUpdateCampaign();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [editBudgetType, setEditBudgetType] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [editBudget, setEditBudget] = useState("");

  const setStatus = (campaignId: string, status: CampaignStatus) => {
    if (!selectedClientId) return;
    changeStatus({ campaignId, status, clientId: selectedClientId });
  };

  const openEdit = (campaign: { id: string; name: string }) => {
    setEditTarget(campaign);
    setEditName(campaign.name);
    setEditBudgetType("DAILY");
    setEditBudget("");
  };

  const submitEdit = () => {
    if (!editTarget || !selectedClientId) return;
    const payload: { name?: string; dailyBudget?: number; lifetimeBudget?: number } = {};
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== editTarget.name) payload.name = trimmedName;
    const budgetNum = Number(editBudget);
    if (editBudget && budgetNum > 0) {
      if (editBudgetType === "DAILY") payload.dailyBudget = budgetNum;
      else payload.lifetimeBudget = budgetNum;
    }
    if (Object.keys(payload).length === 0) {
      setEditTarget(null);
      return;
    }
    editCampaign(
      { campaignId: editTarget.id, payload, clientId: selectedClientId },
      { onSuccess: () => setEditTarget(null) }
    );
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
                    <BreadcrumbLink onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 hover:text-slate-800 transition-colors font-medium text-xs">Data Sources</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-slate-300" />
                  <BreadcrumbItem>
                    <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider">Meta Ads</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative p-3.5 bg-gradient-to-br from-[#0866FF] to-blue-700 rounded-2xl shadow-xl shadow-blue-900/10 ring-1 ring-white/20">
                    <SiMeta className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meta Ads</h1>
                  <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">{accountName || "Campaign Insights"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DataSyncBanner compact={true} />
              <div className="w-[280px]">
                <Select
                  value={selectedClientId?.toString()}
                  onValueChange={(v: string) => {
                    const next = Number(v);
                    if (next === selectedClientId) return;
                    // URL is the single source of truth — the reconcile effect
                    // below picks up the new param and updates selectedClientId,
                    // which retriggers all the useQuery hooks.
                    navigate(`/data-sources/meta-ads/${next}`);
                  }}
                >
                  <SelectTrigger className="h-10 bg-white border-slate-200 shadow-sm rounded-xl transition-all focus:ring-slate-200 font-medium text-slate-700">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
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
               <DateRangePicker value={date} onChange={setDate} />
               <Button
                 onClick={() =>
                   navigate(
                     selectedClientId
                       ? `/data-sources/meta-ads/wizard/${selectedClientId}`
                       : "/data-sources/meta-ads/wizard"
                   )
                 }
                 disabled={!selectedClientId}
                 className="h-10 rounded-xl px-5 gap-2 font-bold bg-gradient-to-r from-[#0866FF] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md disabled:opacity-50"
               >
                 <Sparkles className="w-4 h-4" />
                 Create Ad
               </Button>
            </div>
          </div>

      {/* Main Content */}
      {selectedClientId && clientData && !hasMetaAdsIntegration ? (
        <PlatformNotConnected
          platformName="Meta Ads"
          icon={<SiMeta className="h-10 w-10 text-blue-500" />}
          clientName={clientData.name}
        />
      ) : isNoAccountAssigned ? (
        <PlatformNotConnected
          platformName="Meta Ads"
          icon={<SiMeta className="h-10 w-10 text-blue-500" />}
          clientName={clientData?.name}
        />
      ) : (
          <div className="w-full px-8 py-4 space-y-8">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {isLoadingMeta || isLoadingSummary ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[140px] rounded-[28px]" />)}
              </>
            ) : (isErrorMeta || isErrorSummary) ? (
              <ErrorState 
                title="Metrics Unavailable"
                message={((errorMeta as any)?.message || (errorSummary as any)?.message || "Failed to load summary stats.")}
                onRetry={() => {
                  refetchMeta();
                  refetchSummary();
                }}
                className="col-span-full rounded-[32px]"
              />
            ) : (
              <>
                <BentoMetricCard
                  title="Total Spend"
                  value={`₹${totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  icon={<DollarSign />}
                  color="emerald"
                />
                <BentoMetricCard
                  title="Impressions"
                  value={totalImpressions.toLocaleString('en-IN')}
                  icon={<Eye />}
                  color="blue"
                />
                <BentoMetricCard
                  title="Clicks"
                  value={totalClicks.toLocaleString('en-IN')}
                  icon={<MousePointerClick />}
                  color="violet"
                />
                <BentoMetricCard
                  title="Avg CTR"
                  value={`${avgCTR.toFixed(2)}%`}
                  icon={<Target />}
                  color="amber"
                />
                <BentoMetricCard
                  title="Avg CPM"
                  value={`₹${avgCPM.toFixed(2)}`}
                  icon={<TrendingUp />}
                  color="rose"
                />
              </>
            )}
          </div>

          {/* Performance Trends Chart */}
          <Card className="rounded-[32px] border-zinc-100 shadow-sm overflow-hidden hover:border-zinc-200 transition-all duration-500 bg-white">
            <CardHeader className="border-b border-zinc-50 py-6 px-8 flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-zinc-900 tracking-tight uppercase flex items-center gap-3">
                   <TrendingUp className="h-6 w-6 text-blue-500" />
                   Performance Trends
                </CardTitle>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Daily Breakdown Analysis</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingTrends ? (
                <Skeleton className="h-96 w-full rounded-xl bg-slate-50" />
              ) : isErrorTrends ? (
                <ErrorState 
                  title="Trend Chart Unavailable"
                  message={(errorTrends as any)?.message}
                  onRetry={() => refetchTrends()}
                  className="h-96 border-none shadow-none"
                />
              ) : trends.length > 0 ? (
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        tickFormatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="spend"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSpend)"
                        name="Spend (₹)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorImpressions)"
                        name="Impressions"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <div className="p-4 rounded-full bg-slate-100 mb-3">
                    <Filter className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="font-medium">No trend data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card className="rounded-[32px] border-zinc-100 shadow-sm overflow-hidden hover:border-zinc-200 transition-all duration-500 bg-white">
            <CardHeader className="border-b border-zinc-50 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-black text-zinc-900 tracking-tight uppercase flex items-center gap-3">
                  <Target className="h-6 w-6 text-emerald-500" />
                  Active Campaigns
                </CardTitle>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Detailed Ad Performance</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingCampaigns ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : isErrorCampaigns ? (
                <div className="p-12">
                  <ErrorState 
                    title="Campaign Data Unavailable"
                    message={(errorCampaigns as any)?.message}
                    onRetry={() => refetchCampaigns()}
                    className="border-none shadow-none"
                  />
                </div>
              ) : allCampaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="font-semibold text-slate-500 pl-6 h-12">Campaign Name</TableHead>
                        <TableHead className="font-semibold text-slate-500 h-12">Status</TableHead>
                        <TableHead className="font-semibold text-slate-500 h-12">Objective</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">Spend</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">Impressions</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">Clicks</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">Likes</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">CTR</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right pr-6 h-12">CPC</TableHead>
                        <TableHead className="w-[50px] h-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allCampaigns.map((campaign: any) => (
                        <TableRow key={campaign.id} className="hover:bg-slate-50/80 transition-colors border-slate-100 group">
                          <TableCell className="font-medium text-slate-900 pl-6 py-4">
                            <div className="flex flex-col">
                              <span>{campaign.name}</span>
                              <span className="text-xs text-slate-400 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">ID: {campaign.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <StatusBadge status={campaign.status} />
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm py-4">
                            <Badge variant="outline" className="font-normal text-slate-500 border-slate-200 bg-white capitalize">
                              {campaign.objective.replace('OUTCOME_', '').toLowerCase().replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-700 py-4">₹{campaign.spend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right text-slate-600 py-4">{campaign.impressions.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right text-slate-600 py-4">{campaign.clicks.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right text-slate-600 py-4">{(campaign.likes || 0).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right py-4">
                            <div className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                              {campaign.ctr.toFixed(2)}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-600 pr-6 py-4">₹{campaign.cpc.toFixed(2)}</TableCell>
                          <TableCell className="py-4">
                            {(() => {
                              const normalized = (campaign.status || "ACTIVE").toUpperCase();
                              const isArchived = normalized === "ARCHIVED" || normalized === "DELETED";
                              const isPaused = normalized === "PAUSED";
                              const isBusyForRow =
                                isUpdatingStatus && statusVars?.campaignId === campaign.id;
                              return (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                      disabled={isBusyForRow}
                                    >
                                      {isBusyForRow ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200 shadow-lg">
                                    {isPaused || isArchived ? (
                                      <DropdownMenuItem
                                        onSelect={() => setStatus(campaign.id, "ACTIVE")}
                                      >
                                        <Play className="w-4 h-4 mr-2 text-emerald-600" />
                                        Resume
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onSelect={() => setStatus(campaign.id, "PAUSED")}
                                      >
                                        <Pause className="w-4 h-4 mr-2 text-amber-600" />
                                        Pause
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      disabled={isArchived}
                                      onSelect={() =>
                                        openEdit({ id: campaign.id, name: campaign.name })
                                      }
                                    >
                                      <Pencil className="w-4 h-4 mr-2 text-slate-600" />
                                      Quick Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={isArchived || !selectedClientId}
                                      onSelect={() =>
                                        navigate(
                                          `/data-sources/meta-ads/wizard/${selectedClientId}/edit/${campaign.id}`
                                        )
                                      }
                                    >
                                      <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                                      Full Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-rose-600 focus:text-rose-700"
                                      disabled={isArchived}
                                      onSelect={() =>
                                        setDeleteTarget({ id: campaign.id, name: campaign.name })
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-medium text-lg">No campaigns found</h3>
                  <p className="text-slate-500 mt-1">There are no active campaigns for this client.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
        </div>
      </div>

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open && !isEditingCampaign) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit campaign</DialogTitle>
            <DialogDescription>
              Update the campaign name or change its budget. Leave a field blank to keep the
              current value. You can only update the budget type the campaign was created with.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-campaign-name" className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Campaign Name
              </Label>
              <Input
                id="edit-campaign-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Budget Type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(["DAILY", "LIFETIME"] as const).map((t) => {
                  const isActive = editBudgetType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditBudgetType(t)}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-sm font-bold transition-all",
                        isActive
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {t === "DAILY" ? "Daily" : "Lifetime"}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Must match the type the campaign was created with — Meta won't let you switch.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-campaign-budget" className="text-xs font-bold uppercase tracking-widest text-slate-600">
                New {editBudgetType === "DAILY" ? "Daily" : "Lifetime"} Budget
              </Label>
              <Input
                id="edit-campaign-budget"
                type="number"
                min={1}
                step={0.5}
                placeholder="Leave blank to keep current"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
              <p className="text-[11px] text-slate-400">
                Enter in standard decimal (e.g. 25.50). Billed in the ad account's currency.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={isEditingCampaign}
              className="h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={submitEdit}
              disabled={isEditingCampaign}
              className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2"
            >
              {isEditingCampaign && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  This will permanently delete <span className="font-semibold text-slate-900">{deleteTarget.name}</span> on Meta. Spend and historical data stay in reports, but the campaign can't be reactivated.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-400"
              onClick={() => {
                if (deleteTarget) {
                  setStatus(deleteTarget.id, "DELETED");
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MetaDetailPage;