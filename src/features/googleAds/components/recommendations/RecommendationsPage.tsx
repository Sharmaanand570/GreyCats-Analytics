import { useState, useMemo } from "react";
import {
  Lightbulb,
  CheckCircle,
  // @ts-expect-error unused variable
  XCircle,
  ArrowUpRight,
  Target,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
  // @ts-expect-error unused variable
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  // @ts-expect-error unused variable
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  useRecommendations,
  useApplyRecommendation,
  useDismissRecommendation,
} from "../../hooks/useCampaignManagement";
  // @ts-expect-error unused variable
import { EmptyState, ErrorState, fmtCurrency, fmtNumber } from "../ui/GoogleAdsShared";
import type { RecommendationType, Recommendation } from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────

interface RecommendationsPageProps {
  clientId: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getRecommendationIcon(type: RecommendationType) {
  switch (type) {
    case "KEYWORD":
    case "TEXT_AD":
    case "RESPONSIVE_SEARCH_AD":
    case "SITELINK_EXTENSION":
    case "CALLOUT_EXTENSION":
      return <Lightbulb className="w-5 h-5 text-amber-500" />;
    case "TARGET_CPA_OPT_IN":
    case "TARGET_ROAS_OPT_IN":
    case "MAXIMIZE_CONVERSIONS_OPT_IN":
    case "ENHANCED_CPC_OPT_IN":
      return <Target className="w-5 h-5 text-blue-500" />;
    case "MOVE_UNUSED_BUDGET":
    case "RAISE_TARGET_CPA_BID_TOO_LOW":
      return <Zap className="w-5 h-5 text-emerald-500" />;
    default:
      return <Lightbulb className="w-5 h-5 text-slate-400" />;
  }
}

function getRecommendationCategory(type: RecommendationType) {
  switch (type) {
    case "KEYWORD":
    case "TEXT_AD":
    case "RESPONSIVE_SEARCH_AD":
    case "SITELINK_EXTENSION":
    case "CALLOUT_EXTENSION":
      return "ads_extensions";
    case "TARGET_CPA_OPT_IN":
    case "TARGET_ROAS_OPT_IN":
    case "MAXIMIZE_CONVERSIONS_OPT_IN":
    case "ENHANCED_CPC_OPT_IN":
      return "bidding_budgets";
    case "MOVE_UNUSED_BUDGET":
    case "RAISE_TARGET_CPA_BID_TOO_LOW":
      return "bidding_budgets";
    default:
      return "all";
  }
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function RecommendationsPage({ clientId }: RecommendationsPageProps) {
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading, isError, error } = useRecommendations(clientId);
  const applyMutation = useApplyRecommendation(clientId);
  const dismissMutation = useDismissRecommendation(clientId);

  const recommendations = data?.recommendations ?? [];
  const activeRecommendations = recommendations.filter((r) => !r.dismissed);
  const optScore = data?.accountOptimizationScore ?? 0;

  const filtered = useMemo(() => {
    if (activeTab === "all") return activeRecommendations;
    return activeRecommendations.filter(
      (r) => getRecommendationCategory(r.type) === activeTab
    );
  }, [activeRecommendations, activeTab]);

  const handleApply = (id: string) => {
    applyMutation.mutate(id);
  };

  const handleDismiss = (id: string) => {
    dismissMutation.mutate(id);
  };

  const handleApplyAll = () => {
    if (window.confirm(`Apply all ${filtered.length} recommendations?`)) {
      filtered.forEach((r) => applyMutation.mutate(r.id));
    }
  };

  if (isError) {
    return (
      <ErrorState
        message={(error as Error)?.message ?? "Failed to load recommendations"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
      {/* ── HEADER & SCORE ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recommendations</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Improve your campaigns with customized suggestions.
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 min-w-[300px]">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                strokeDasharray={`${optScore * 100}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-lg font-bold text-slate-800">
              {Math.round(optScore * 100)}%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Optimization Score</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Apply recommendations to increase your score.
            </p>
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All recommendations</TabsTrigger>
          <TabsTrigger value="bidding_budgets">Bidding & budgets</TabsTrigger>
          <TabsTrigger value="ads_extensions">Ads & assets</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── ACTIONS ──────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-slate-700">
            {filtered.length} recommendations found
          </span>
          <Button
            onClick={handleApplyAll}
            disabled={applyMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply all ({filtered.length})
          </Button>
        </div>
      )}

      {/* ── CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-slate-100" />
              <CardContent className="h-32" />
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={CheckCircle}
              title="You're all caught up!"
              description="No recommendations available for this category right now. Keep up the good work."
            />
          </div>
        ) : (
          filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onApply={() => handleApply(rec.id)}
              onDismiss={() => handleDismiss(rec.id)}
              isApplying={applyMutation.isPending && applyMutation.variables === rec.id}
              isDismissing={dismissMutation.isPending && dismissMutation.variables === rec.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  onApply,
  onDismiss,
  isApplying,
  isDismissing,
}: {
  rec: Recommendation;
  onApply: () => void;
  onDismiss: () => void;
  isApplying: boolean;
  isDismissing: boolean;
}) {
  return (
    <Card className="flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {getRecommendationIcon(rec.type)}
            </div>
            <div>
              <CardTitle className="text-base text-slate-900 leading-tight">
                {rec.headline}
              </CardTitle>
              {rec.campaignName && (
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  Campaign: <span className="font-medium text-slate-700">{rec.campaignName}</span>
                </div>
              )}
            </div>
          </div>
          {rec.optimizationScoreImpact && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shrink-0">
              +{Math.round(rec.optimizationScoreImpact * 100)}% opt. score
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1">
        <CardDescription className="text-sm text-slate-600 mb-6">
          {rec.description}
        </CardDescription>

        {/* IMPACT METRICS */}
        {rec.impact && rec.impact.potentialMetrics && rec.impact.baseMetrics && (
          <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Est. Conversions</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 line-through text-sm">
                  {rec.impact.baseMetrics.conversions?.toFixed(1) || 0}
                </span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">
                  {rec.impact.potentialMetrics.conversions?.toFixed(1) || 0}
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">Est. Cost</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 text-sm">
                  {fmtCurrency(rec.impact.baseMetrics.cost || 0)}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-bold">
                  {fmtCurrency(rec.impact.potentialMetrics.cost || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-end gap-3">
        <Button
          variant="ghost"
          onClick={onDismiss}
          disabled={isDismissing || isApplying}
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          {isDismissing ? "Dismissing..." : "Dismiss"}
        </Button>
        <Button
          onClick={onApply}
          disabled={isApplying || isDismissing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isApplying ? "Applying..." : "Apply"}
        </Button>
      </CardFooter>
    </Card>
  );
}
