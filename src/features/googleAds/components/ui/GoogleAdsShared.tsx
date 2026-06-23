import { cn } from "@/lib/utils";
import React from "react";
import { AlertCircle, SearchX, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CampaignStatus,
  AdGroupStatus,
  AdStatus,
  KeywordStatus,
  KeywordMatchType,
  AdStrength,
  ApprovalStatus,
  CampaignType,
} from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// CURRENCY / NUMBER FORMATTERS
// ─────────────────────────────────────────────────────────────

export function fmtCurrency(value: number | undefined, currency = "INR") {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function fmtNumber(value: number | undefined) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

export function fmtPercent(value: number | undefined, alreadyPercent = false) {
  if (value === undefined || value === null) return "—";
  const v = alreadyPercent ? value : value * 100;
  return `${v.toFixed(2)}%`;
}

export function fmtRoas(value: number | undefined) {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(2)}x`;
}

export function fmtMicros(micros: number | undefined, currency = "INR") {
  if (micros === undefined || micros === null) return "—";
  return fmtCurrency(micros / 1_000_000, currency);
}

// ─────────────────────────────────────────────────────────────
// STATUS BADGES
// ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  ENABLED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PAUSED:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  REMOVED:
    "bg-red-50 text-red-600 ring-1 ring-red-200",
};

const STATUS_DOT: Record<string, string> = {
  ENABLED: "bg-emerald-500",
  PAUSED: "bg-amber-400",
  REMOVED: "bg-red-400",
};

type GenericStatus = CampaignStatus | AdGroupStatus | AdStatus | KeywordStatus;

interface StatusBadgeProps {
  status: GenericStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label =
    status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          STATUS_DOT[status] ?? "bg-slate-400"
        )}
      />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// MATCH TYPE CHIP
// ─────────────────────────────────────────────────────────────

const MATCH_TYPE_STYLES: Record<KeywordMatchType, string> = {
  BROAD: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  PHRASE: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  EXACT: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const MATCH_TYPE_LABELS: Record<KeywordMatchType, string> = {
  BROAD: "Broad",
  PHRASE: "Phrase",
  EXACT: "Exact",
};

interface MatchTypeChipProps {
  matchType: KeywordMatchType;
  className?: string;
}

export function MatchTypeChip({ matchType, className }: MatchTypeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
        MATCH_TYPE_STYLES[matchType],
        className
      )}
    >
      {MATCH_TYPE_LABELS[matchType]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// AD STRENGTH INDICATOR
// ─────────────────────────────────────────────────────────────

const AD_STRENGTH_CONFIG: Record<
  AdStrength,
  { label: string; color: string; fill: number }
> = {
  EXCELLENT: { label: "Excellent", color: "text-emerald-600", fill: 5 },
  GOOD: { label: "Good", color: "text-blue-600", fill: 4 },
  AVERAGE: { label: "Average", color: "text-amber-600", fill: 3 },
  POOR: { label: "Poor", color: "text-red-500", fill: 2 },
  PENDING: { label: "Pending", color: "text-slate-400", fill: 1 },
  UNSPECIFIED: { label: "—", color: "text-slate-400", fill: 0 },
};

interface AdStrengthMeterProps {
  strength: AdStrength;
  className?: string;
}

export function AdStrengthMeter({ strength, className }: AdStrengthMeterProps) {
  const cfg = AD_STRENGTH_CONFIG[strength] ?? AD_STRENGTH_CONFIG.UNSPECIFIED;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-3 rounded-sm transition-colors",
              i <= cfg.fill
                ? cfg.color.replace("text-", "bg-")
                : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <span className={cn("text-[11px] font-semibold", cfg.color)}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APPROVAL STATUS BADGE
// ─────────────────────────────────────────────────────────────

const APPROVAL_STYLES: Record<ApprovalStatus, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  PENDING_REVIEW: "bg-amber-50 text-amber-700",
  UNDER_REVIEW: "bg-blue-50 text-blue-700",
  DISAPPROVED: "bg-red-50 text-red-600",
  UNSPECIFIED: "bg-slate-100 text-slate-500",
};

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  APPROVED: "Approved",
  PENDING_REVIEW: "Pending review",
  UNDER_REVIEW: "Under review",
  DISAPPROVED: "Disapproved",
  UNSPECIFIED: "—",
};

export function ApprovalStatusBadge({
  status,
  className,
}: {
  status: ApprovalStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md",
        APPROVAL_STYLES[status],
        className
      )}
    >
      {APPROVAL_LABELS[status]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// CAMPAIGN TYPE BADGE
// ─────────────────────────────────────────────────────────────

const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  SEARCH: "Search",
  DISPLAY: "Display",
  SHOPPING: "Shopping",
  PERFORMANCE_MAX: "Performance Max",
  DEMAND_GEN: "Demand Gen",
  VIDEO: "Video",
  APP: "App",
  SMART: "Smart",
};

export function CampaignTypeBadge({
  type,
  className,
}: {
  type: CampaignType | string;
  className?: string;
}) {
  const label =
    CAMPAIGN_TYPE_LABELS[type as CampaignType] ?? type;
  return (
    <span
      className={cn(
        "inline-flex text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600",
        className
      )}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// QUALITY SCORE DISPLAY
// ─────────────────────────────────────────────────────────────

export function QualityScoreDisplay({
  score,
  className,
}: {
  score?: number;
  className?: string;
}) {
  if (score === undefined || score === null) {
    return <span className="text-slate-400 text-sm">—</span>;
  }
  const color =
    score >= 7
      ? "text-emerald-600 bg-emerald-50"
      : score >= 4
      ? "text-amber-600 bg-amber-50"
      : "text-red-600 bg-red-50";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
        color,
        className
      )}
    >
      {score}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// LOADING SKELETON ROWS
// ─────────────────────────────────────────────────────────────

export function TableSkeletonRows({
  rows = 6,
  cols,
  columns,
}: {
  rows?: number;
  cols?: number;
  columns?: number;
}) {
  const actualCols = columns ?? cols ?? 8;
  return (
    <>
      {[...Array(rows)].map((_, r) => (
        <tr key={r} className="border-b border-slate-100 last:border-0">
          {[...Array(actualCols)].map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className="h-4 rounded" style={{ width: `${60 + ((r + c) % 3) * 20}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        {React.isValidElement(icon) ? icon : (icon ? React.createElement(icon as React.ElementType, { className: "w-7 h-7 text-slate-400" }) : <SearchX className="w-7 h-7 text-slate-400" />)}
      </div>
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ERROR STATE
// ─────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-red-700 mb-1">Error</h3>
      <p className="text-xs text-slate-500 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NO CONNECTION STATE
// ─────────────────────────────────────────────────────────────

export function NoConnectionState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <WifiOff className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">
        Not connected
      </h3>
      <p className="text-xs text-slate-500 max-w-xs">
        Connect your Google Ads account to start managing campaigns here.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// METRIC CELL — right-aligned value with optional highlight
// ─────────────────────────────────────────────────────────────

export function MetricCell({
  value,
  highlight = false,
  className,
}: {
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-right text-sm tabular-nums",
        highlight
          ? "font-bold text-slate-900"
          : "text-slate-600 font-medium",
        className
      )}
    >
      {value}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────
// TABLE TOOLBAR (Filters / Search / Columns / Download)
// ─────────────────────────────────────────────────────────────

interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  title?: string;
  count?: React.ReactNode;
  searchTerm?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  leftActions,
  rightActions,
  title,
  count,
  searchTerm,
  actions,
  children,
}: TableToolbarProps) {
  const actualSearchValue = searchValue !== undefined ? searchValue : (searchTerm ?? "");
  const actualOnSearchChange = onSearchChange ?? ((_v: string) => {});
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-white">
      <div className="flex items-center gap-3 flex-1">
        {title && (
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-slate-800">{title}</h2>
            {count !== undefined && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
        )}
        {leftActions}
        {(onSearchChange !== undefined || searchTerm !== undefined) && (
          <div className="relative max-w-xs flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={actualSearchValue}
            onChange={(e) => actualOnSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors placeholder:text-slate-400"
          />
          </div>
        )}
        {children}
      </div>
      {(rightActions || actions) && (
        <div className="flex items-center gap-2 shrink-0">{rightActions}{actions}</div>
      )}
    </div>
  );
}
