import { useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FileCheck2,
  Globe,
  Goal,
  Languages,
  ListChecks,
  Loader2,
  MapPin,
  Network,
  Target,
  Type,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { parseKeywords, LANGUAGE_OPTIONS, DAY_LABELS, type WizardFormState } from "./types";
import type { GoogleAdsPublishJob } from "../../API/googleAdsManagerApi";

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
  step?: number;
};

export const validateWizard = (form: WizardFormState): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!form.customerId) {
    issues.push({
      level: "error",
      message: "No Google Ads account selected.",
      step: 0,
    });
  }
  if (!form.objective) {
    issues.push({ level: "error", message: "Pick a campaign objective.", step: 0 });
  }
  if (!form.campaignType) {
    issues.push({ level: "error", message: "Pick a campaign type.", step: 0 });
  }
  if (!form.campaignName.trim()) {
    issues.push({ level: "error", message: "Campaign name is required.", step: 1 });
  }
  if (form.campaignType === "SEARCH" && form.networks.length === 0) {
    issues.push({
      level: "error",
      message: "Search campaigns must target at least one network.",
      step: 1,
    });
  }
  if (
    form.locationMode === "CUSTOM" &&
    form.locations.filter((l) => !l.excluded).length === 0
  ) {
    issues.push({
      level: "error",
      message: "Add at least one included location.",
      step: 1,
    });
  }
  if (form.budgetAmount <= 0) {
    issues.push({
      level: "error",
      message: "Budget must be greater than 0.",
      step: 2,
    });
  }
  if (
    (form.biddingFocus === "CONVERSIONS" ||
      form.biddingFocus === "CONVERSION_VALUE") &&
    !form.conversionActionId
  ) {
    issues.push({
      level: "error",
      message: "A conversion action is required for this bidding focus.",
      step: 2,
    });
  }

  if (form.campaignType === "SEARCH") {
    if (!form.adGroupName.trim()) {
      issues.push({ level: "error", message: "Ad group name is required.", step: 3 });
    }
    const keywords = parseKeywords(form.keywordsText);
    if (keywords.length === 0) {
      issues.push({ level: "error", message: "Add at least one keyword.", step: 3 });
    }
    // RSA creative validation
    if (!form.rsaFinalUrl.trim()) {
      issues.push({ level: "error", message: "Final URL is required.", step: 4 });
    }
    const headlines = form.rsaHeadlines.filter((h) => h.text.trim());
    const descriptions = form.rsaDescriptions.filter((d) => d.text.trim());
    if (headlines.length < 3) {
      issues.push({
        level: "error",
        message: `Add at least 3 headlines (currently ${headlines.length}).`,
        step: 4,
      });
    }
    if (descriptions.length < 2) {
      issues.push({
        level: "error",
        message: `Add at least 2 descriptions (currently ${descriptions.length}).`,
        step: 4,
      });
    }
    headlines.forEach((h, i) => {
      if (h.text.length > 30) {
        issues.push({
          level: "warning",
          message: `Headline ${i + 1} exceeds 30 characters.`,
          step: 4,
        });
      }
    });
  }

  if (form.campaignType === "DISPLAY") {
    if (!form.displayFinalUrl.trim()) {
      issues.push({ level: "error", message: "Final URL is required.", step: 4 });
    }
    if (!form.displayBusinessName.trim()) {
      issues.push({
        level: "error",
        message: "Business name is required for Display ads.",
        step: 4,
      });
    }
    if (!form.displayLongHeadline.trim()) {
      issues.push({
        level: "error",
        message: "Long headline is required for Display ads.",
        step: 4,
      });
    }
    if (
      form.displayImages.filter((i) => i.aspect === "LANDSCAPE").length === 0
    ) {
      issues.push({
        level: "error",
        message: "Add at least one landscape (1.91:1) image.",
        step: 4,
      });
    }
    if (form.displayImages.filter((i) => i.aspect === "SQUARE").length === 0) {
      issues.push({
        level: "error",
        message: "Add at least one square (1:1) image.",
        step: 4,
      });
    }
  }

  return issues;
};

function PublishProgress({ job }: { job: GoogleAdsPublishJob }) {
  const steps =
    job.steps && job.steps.length > 0
      ? job.steps
      : // Synthesize a basic progress list when backend hasn't told us yet.
        [
          { key: "budget", label: "Creating Campaign Budget", status: "RUNNING" as const },
          { key: "campaign", label: "Setting up Campaign and Targeting", status: "PENDING" as const },
          { key: "adgroup", label: "Creating Ad Group", status: "PENDING" as const },
          { key: "assets", label: "Uploading Assets & Creating Ads", status: "PENDING" as const },
        ];

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Loader2 className="w-4 h-4 animate-spin text-[#1A73E8]" />
        Publishing to Google Ads — Job{" "}
        <span className="font-mono text-xs">{job.jobId}</span>
      </div>
      <div className="space-y-2">
        {steps.map((s) => (
          <div key={s.key} className="flex items-start gap-2.5">
            <div
              className={cn(
                "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                s.status === "DONE" && "bg-emerald-500",
                s.status === "RUNNING" && "bg-[#1A73E8]",
                s.status === "FAILED" && "bg-rose-500",
                s.status === "PENDING" && "bg-slate-300"
              )}
            >
              {s.status === "DONE" && <Check className="w-2.5 h-2.5 text-white" />}
              {s.status === "RUNNING" && (
                <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
              )}
              {s.status === "FAILED" && (
                <AlertCircle className="w-2.5 h-2.5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "text-xs font-semibold",
                  s.status === "DONE" && "text-slate-600 line-through",
                  s.status === "RUNNING" && "text-slate-900",
                  s.status === "FAILED" && "text-rose-700",
                  s.status === "PENDING" && "text-slate-500"
                )}
              >
                {s.label}
              </div>
              {s.message && (
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  {s.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Props = {
  form: WizardFormState;
  publishError?: string | null;
  job?: GoogleAdsPublishJob | null;
};

export function Step6Review({ form, publishError, job }: Props) {
  const issues = useMemo(() => validateWizard(form), [form]);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  const parsedKeywords = useMemo(
    () => parseKeywords(form.keywordsText),
    [form.keywordsText]
  );

  const languageLabels = form.languageIds
    .map((id) => LANGUAGE_OPTIONS.find((o) => o.value === id)?.label ?? id)
    .join(", ");

  const locationSummary =
    form.locationMode === "ALL_COUNTRIES"
      ? "All countries and territories"
      : form.locationMode === "LOCAL_COUNTRY"
        ? "Your country (default)"
        : `${form.locations.filter((l) => !l.excluded).length} included · ${form.locations.filter((l) => l.excluded).length} excluded`;

  return (
    <div className="space-y-6 w-full">
      {/* Validation summary */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-3">
          {errors.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-900">
                <AlertCircle className="w-4 h-4" />
                {errors.length} issue{errors.length === 1 ? "" : "s"} blocking publish
              </div>
              <ul className="space-y-1 text-xs text-rose-800 leading-relaxed">
                {errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4" />
                {warnings.length} warning{warnings.length === 1 ? "" : "s"}
              </div>
              <ul className="space-y-1 text-xs text-amber-800 leading-relaxed">
                {warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                    {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Publish error banner */}
      {publishError && !job && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold text-rose-900">
              Publish failed
            </div>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              {publishError}
            </p>
          </div>
        </div>
      )}

      {/* Job progress */}
      {job && <PublishProgress job={job} />}

      {/* Summary accordions */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <FileCheck2 className="w-5 h-5 text-emerald-500" />
          Campaign summary
        </div>
        <Accordion type="multiple" defaultValue={["campaign", "creative"]}>
          {/* Campaign */}
          <AccordionItem value="campaign">
            <AccordionTrigger className="text-sm font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <Goal className="w-4 h-4 text-slate-400" />
                Campaign
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-1.5 text-xs text-slate-600">
              <SummaryRow label="Name" value={form.campaignName || "—"} />
              <SummaryRow label="Objective" value={form.objective} />
              <SummaryRow label="Type" value={form.campaignType.replace("_", " ")} />
              {form.campaignType === "SEARCH" && (
                <SummaryRow
                  label="Networks"
                  value={form.networks.join(", ") || "—"}
                />
              )}
              <SummaryRow label="Start Date" value={form.campaignStartDate || "—"} />
              <SummaryRow label="End Date" value={form.campaignEndDate || "Run indefinitely"} />
              <SummaryRow
                label="Ad Rotation"
                value={form.adRotation === "OPTIMIZE" ? "Optimize: Prefer best performing ads" : "Rotate indefinitely"}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Targeting */}
          <AccordionItem value="targeting">
            <AccordionTrigger className="text-sm font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-slate-400" />
                Targeting & Schedule
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-1.5 text-xs text-slate-600">
              <SummaryRow
                label="Locations"
                icon={<Globe className="w-3 h-3" />}
                value={locationSummary}
              />
              {form.locationMode === "CUSTOM" && form.locations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {form.locations.map((l) => (
                    <Badge
                      key={l.id}
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold",
                        l.excluded
                          ? "border-rose-200 text-rose-700"
                          : "border-blue-200 text-[#1A73E8]"
                      )}
                    >
                      <MapPin className="w-2.5 h-2.5 mr-1" />
                      {l.name}
                    </Badge>
                  ))}
                </div>
              )}
              <SummaryRow
                label="Languages"
                icon={<Languages className="w-3 h-3" />}
                value={languageLabels || "—"}
              />
              <SummaryRow
                label="Schedule"
                icon={<Clock className="w-3 h-3" />}
                value={
                  form.adSchedule.length === 0
                    ? "Run 24/7"
                    : `${form.adSchedule.length} block${form.adSchedule.length === 1 ? "" : "s"}`
                }
              />
              {form.adSchedule.length > 0 && (
                <ul className="pl-1 space-y-0.5">
                  {form.adSchedule.map((b, i) => (
                    <li key={i} className="text-[11px] text-slate-500">
                      {b.days.map((d) => DAY_LABELS[d]).join(", ")} ·{" "}
                      {b.startHour}:00 – {b.endHour}:00
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Bidding */}
          <AccordionItem value="bidding">
            <AccordionTrigger className="text-sm font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-slate-400" />
                Bidding & Budget
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-1.5 text-xs text-slate-600">
              <SummaryRow label="Focus" value={form.biddingFocus.replace(/_/g, " ")} />
              <SummaryRow
                label="Strategy"
                value={form.bidStrategy.replace(/_/g, " ")}
              />
              {form.setTargetCpa && (
                <SummaryRow
                  label="Target CPA"
                  value={`$${form.targetCpa.toFixed(2)}`}
                />
              )}
              {form.setTargetRoas && (
                <SummaryRow
                  label="Target ROAS"
                  value={`${form.targetRoasPercent}%`}
                />
              )}
              {form.setMaxCpc && (
                <SummaryRow
                  label="Max CPC"
                  value={`$${form.maxCpc.toFixed(2)}`}
                />
              )}
              {form.biddingFocus === "IMPRESSION_SHARE" && (
                <>
                  <SummaryRow
                    label="Impression Share Location"
                    value={form.targetImpressionShareLocation.replace(/_/g, " ")}
                  />
                  <SummaryRow
                    label="Target Share"
                    value={`${form.targetImpressionSharePercent}%`}
                  />
                  <SummaryRow
                    label="Max CPC limit"
                    value={form.targetImpressionShareMaxCpc > 0 ? `$${form.targetImpressionShareMaxCpc.toFixed(2)}` : "No limit"}
                  />
                </>
              )}
              {form.conversionActionId && (
                <SummaryRow
                  label="Conversion action"
                  icon={<Target className="w-3 h-3" />}
                  value={form.conversionActionId}
                />
              )}
              <SummaryRow
                label="Customer Acquisition"
                value={form.customerAcquisition ? (form.acquisitionOptimizeNew ? "Bid only for new customers" : "Bid higher for new customers") : "Bid for all customers"}
              />
              <SummaryRow
                label="Budget"
                value={`$${form.budgetAmount.toFixed(2)} · ${form.budgetType === "DAILY" ? "daily" : "total"}`}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Ad group / keywords */}
          {form.campaignType === "SEARCH" && (
            <AccordionItem value="adgroup">
              <AccordionTrigger className="text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-slate-400" />
                  Ad Group & Keywords
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-xs text-slate-600">
                <SummaryRow label="Ad group" value={form.adGroupName} />
                <SummaryRow
                  label="Keywords"
                  value={`${parsedKeywords.length} total`}
                />
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {parsedKeywords.slice(0, 20).map((k, i) => (
                    <Badge
                      key={`${k.text}-${i}`}
                      variant="outline"
                      className="text-[10px] font-semibold"
                    >
                      {k.matchType === "EXACT" && "["}
                      {k.matchType === "PHRASE" && '"'}
                      {k.text}
                      {k.matchType === "EXACT" && "]"}
                      {k.matchType === "PHRASE" && '"'}
                    </Badge>
                  ))}
                  {parsedKeywords.length > 20 && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      +{parsedKeywords.length - 20} more
                    </span>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Creative */}
          <AccordionItem value="creative">
            <AccordionTrigger className="text-sm font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-slate-400" />
                Creative
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3.5 text-xs text-slate-600">
              {form.campaignType === "DISPLAY" ? (
                <div className="space-y-2">
                  <SummaryRow label="Final URL" value={form.displayFinalUrl || "—"} />
                  <SummaryRow label="Business name" value={form.displayBusinessName} />
                  <SummaryRow label="Long headline" value={form.displayLongHeadline} />
                  <SummaryRow
                    label="Images"
                    value={`${form.displayImages.length} · ${form.displayLogos.length} logos`}
                  />
                  <SummaryRow
                    label="Headlines / Descriptions"
                    value={`${form.displayHeadlines.filter(Boolean).length} / ${form.displayDescriptions.filter(Boolean).length}`}
                  />
                  <SummaryRow label="CTA" value={form.displayCta.replace("_", " ")} />
                  <SummaryRow
                    label="Format Enhancements"
                    value={[
                      form.displayEnhance && "Asset enhancement",
                      form.displayAutoVideo && "Auto video",
                      form.displayNative && "Native formats",
                    ]
                      .filter(Boolean)
                      .join(", ") || "None"}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <SummaryRow label="Final URL" value={form.rsaFinalUrl || "—"} />
                  <SummaryRow
                    label="Display paths"
                    value={[form.rsaPath1, form.rsaPath2].filter(Boolean).join(" / ") || "—"}
                  />
                  <SummaryRow
                    label="Headlines / Descriptions"
                    value={`${form.rsaHeadlines.filter((h) => h.text.trim()).length} / ${form.rsaDescriptions.filter((d) => d.text.trim()).length}`}
                  />
                  <SummaryRow
                    label="Sitelinks"
                    value={`${form.rsaSitelinks.filter((s: any) => s.text.trim() && s.url.trim()).length} added`}
                  />
                  <SummaryRow
                    label="Callouts"
                    value={`${form.rsaCallouts.filter(Boolean).length} added`}
                  />
                  {form.rsaSnippetsValues.filter(Boolean).length > 0 && (
                    <SummaryRow
                      label="Structured Snippets"
                      value={`${form.rsaSnippetsHeader}: ${form.rsaSnippetsValues.filter(Boolean).join(", ")}`}
                    />
                  )}
                  {form.rsaCallPhoneNumber.trim() && (
                    <SummaryRow
                      label="Call Extension"
                      value={`${form.rsaCallCountryCode} ${form.rsaCallPhoneNumber}`}
                    />
                  )}
                </div>
              )}

              {/* URL Options (Shared) */}
              {(form.trackingTemplate || form.finalUrlSuffix || form.customParameters.length > 0) && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ad URL Options</div>
                  {form.trackingTemplate && <SummaryRow label="Tracking Template" value={form.trackingTemplate} />}
                  {form.finalUrlSuffix && <SummaryRow label="Final URL Suffix" value={form.finalUrlSuffix} />}
                  {form.customParameters.length > 0 && (
                    <SummaryRow
                      label="Custom Params"
                      value={form.customParameters.map((p: any) => `{${p.key}: ${p.value}}`).join(", ")}
                    />
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 border-b border-slate-100 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 inline-flex items-center gap-1.5 shrink-0">
        {icon}
        {label}
      </span>
      <span className="text-xs text-slate-700 font-semibold text-right break-words max-w-[60%]">
        {value}
      </span>
    </div>
  );
}
