import { useState } from "react";
  // @ts-expect-error unused variable
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Settings,
  Edit2,
  PauseCircle,
  PlayCircle,
  Layers,
  Target,
  FileText,
  Key,
  Users,
  BarChart2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
  // @ts-expect-error unused variable
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useCampaign,
  useEnableCampaign,
  usePauseCampaign,
} from "../../hooks/useCampaignManagement";
import {
  StatusBadge,
  CampaignTypeBadge,
  ErrorState,
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  fmtRoas,
} from "../ui/GoogleAdsShared";
import { CampaignEditDrawer } from "./CampaignEditDrawer";
import { AdGroupsTab } from "../adGroups/AdGroupsTab";
import { KeywordsTab } from "../keywords/KeywordsTab";
import { NegativeKeywordsTab } from "../keywords/NegativeKeywordsTab";
import { SearchTermsTab } from "../keywords/SearchTermsTab";
import { AudiencesTab } from "../audiences/AudiencesTab";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import { GoogleAdsDateRangePicker } from "../GoogleAdsDateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign } from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// TAB CONFIG
// ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "ad-groups", label: "Ad groups", icon: Layers },
  { id: "ads", label: "Ads & extensions", icon: FileText },
  { id: "keywords", label: "Keywords", icon: Key },
  { id: "negative-keywords", label: "Negative keywords", icon: Target },
  { id: "search-terms", label: "Search terms", icon: Target },
  { id: "audiences", label: "Audiences", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

// ─────────────────────────────────────────────────────────────
// METRIC KPI CARD
// ─────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col gap-1",
        highlight && "ring-1 ring-blue-300"
      )}
    >
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={cn("text-xl font-bold", highlight ? "text-blue-700" : "text-slate-900")}>
        {value}
      </span>
      {sub && <span className="text-[11px] text-slate-400">{sub}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERVIEW TAB CONTENT
// ─────────────────────────────────────────────────────────────

function OverviewTab({ campaign }: { campaign: Campaign }) {
  const m = campaign.metrics;
  return (
    <div className="p-6 space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Cost" value={fmtCurrency(m.cost)} highlight />
        <KpiCard label="Impressions" value={fmtNumber(m.impressions)} />
        <KpiCard label="Clicks" value={fmtNumber(m.clicks)} />
        <KpiCard label="CTR" value={fmtPercent(m.ctr)} />
        <KpiCard label="Avg. CPC" value={fmtCurrency(m.averageCpc)} />
        <KpiCard label="Conversions" value={m.conversions.toFixed(2)} />
        <KpiCard label="Conv. rate" value={fmtPercent(m.conversionRate)} />
        <KpiCard label="Cost/conv." value={fmtCurrency(m.costPerConversion)} />
        <KpiCard label="Conv. value" value={fmtCurrency(m.conversionValue)} />
        <KpiCard label="ROAS" value={fmtRoas(m.roas)} />
      </div>

      {/* Campaign details card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Campaign details</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <DetailRow label="Campaign type" value={campaign.campaignType} />
          <DetailRow label="Bid strategy" value={campaign.bidStrategyName ?? campaign.bidStrategyType} />
          {campaign.targetCpa !== undefined && (
            <DetailRow label="Target CPA" value={fmtCurrency(campaign.targetCpa)} />
          )}
          {campaign.targetRoas !== undefined && (
            <DetailRow label="Target ROAS" value={fmtRoas(campaign.targetRoas)} />
          )}
          <DetailRow label="Daily budget" value={fmtCurrency(campaign.budgetAmount) + "/day"} />
          {campaign.startDate && (
            <DetailRow label="Start date" value={campaign.startDate} />
          )}
          {campaign.endDate && (
            <DetailRow label="End date" value={campaign.endDate} />
          )}
          {campaign.optimizationScore !== undefined && (
            <DetailRow
              label="Optimization score"
              value={`${Math.round(campaign.optimizationScore * 100)}%`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS TAB (placeholder)
// ─────────────────────────────────────────────────────────────

function SettingsTab({ campaign, onEdit }: { campaign: Campaign; onEdit: () => void }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Campaign settings</h3>
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 text-xs">
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <DetailRow label="Name" value={campaign.name} />
          <DetailRow label="Status" value={campaign.status} />
          <DetailRow label="Type" value={campaign.campaignType} />
          <DetailRow label="Daily budget" value={fmtCurrency(campaign.budgetAmount) + "/day"} />
          <DetailRow label="Bid strategy" value={campaign.bidStrategyName ?? campaign.bidStrategyType} />
          {campaign.trackingUrlTemplate && (
            <DetailRow label="Tracking template" value={campaign.trackingUrlTemplate} />
          )}
          {campaign.finalUrlSuffix && (
            <DetailRow label="Final URL suffix" value={campaign.finalUrlSuffix} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AUDIENCES PLACEHOLDER
// ─────────────────────────────────────────────────────────────

  // @ts-expect-error unused variable
function AudiencesPlaceholder() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-700">Audience management</h3>
        <p className="text-xs text-slate-400 mt-1">Coming in Phase 2</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CAMPAIGN DETAIL PAGE
// ─────────────────────────────────────────────────────────────

interface GoogleAdsCampaignDetailPageProps {
  clientId: number;
  baseRoute?: string;
}

export function GoogleAdsCampaignDetailPage({
  clientId,
  baseRoute = "/data-sources/google-ads",
}: GoogleAdsCampaignDetailPageProps) {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  // @ts-expect-error unused variable
  const { dateRange } = useGoogleAdsStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, isError, error } = useCampaign(
    clientId,
    campaignId ?? ""
  );
  const enableMutation = useEnableCampaign(clientId);
  const pauseMutation = usePauseCampaign(clientId);

  const campaign = data?.campaign;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-5 gap-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <ErrorState
        message={(error as Error)?.message ?? "Campaign not found"}
        onRetry={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <button
            onClick={() => navigate(`${baseRoute}`)}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Campaigns
          </button>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-[300px]">
            {campaign.name}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                {campaign.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={campaign.status} />
                <CampaignTypeBadge type={campaign.campaignType} />
                <span className="text-xs text-slate-500">
                  {fmtCurrency(campaign.budgetAmount)}/day
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <GoogleAdsDateRangePicker />

            {campaign.status === "PAUSED" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => enableMutation.mutate(campaign.id)}
                disabled={enableMutation.isPending}
                className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <PlayCircle className="w-4 h-4" />
                Enable
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => pauseMutation.mutate(campaign.id)}
                disabled={pauseMutation.isPending}
                className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <PauseCircle className="w-4 h-4" />
                Pause
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="border-b border-slate-200 bg-white px-6">
          <TabsList className="h-auto p-0 bg-transparent gap-1 rounded-none">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "text-sm rounded-none border-b-2 border-transparent px-3 py-3 gap-2 transition-colors",
                  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent",
                  "data-[state=inactive]:text-slate-500 hover:text-slate-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50">
          <TabsContent value="overview" className="m-0 h-full">
            <OverviewTab campaign={campaign} />
          </TabsContent>

          <TabsContent value="ad-groups" className="m-0 h-full">
            <AdGroupsTab
              clientId={clientId}
              campaignId={campaign.id}
              campaignName={campaign.name}
              baseRoute={baseRoute}
            />
          </TabsContent>

          <TabsContent value="ads" className="m-0 h-full">
            <div className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">Ads & Extensions</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select an ad group from the Ad groups tab to view its ads.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="m-0 h-full">
            <KeywordsTab
              clientId={clientId}
              campaignId={campaign.id}
            />
          </TabsContent>

          <TabsContent value="negative-keywords" className="m-0 h-full">
            <NegativeKeywordsTab
              clientId={clientId}
              campaignId={campaign.id}
            />
          </TabsContent>

          <TabsContent value="search-terms" className="m-0 h-full">
            <SearchTermsTab
              clientId={clientId}
              campaignId={campaign.id}
            />
          </TabsContent>

          <TabsContent value="audiences" className="m-0 h-full">
            <AudiencesTab
              clientId={clientId}
              campaignId={campaign.id}
            />
          </TabsContent>

          <TabsContent value="settings" className="m-0 h-full">
            <SettingsTab campaign={campaign} onEdit={() => setEditOpen(true)} />
          </TabsContent>
        </div>
      </Tabs>

      {/* ── Edit Drawer ──────────────────────────────────── */}
      <CampaignEditDrawer
        clientId={clientId}
        campaign={editOpen ? campaign : null}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
