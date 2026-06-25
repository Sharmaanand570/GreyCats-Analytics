import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface GoogleAdsSummaryStepProps {
  onNavigateToStep?: (stepId: number) => void;
  campaignType?: string;
}

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex p-4">
    <div className="w-[220px] text-[13px] text-blue-700 font-medium shrink-0">{label}</div>
    <div className="flex-1 text-[13px] text-slate-800">
      {value ?? <span className="text-slate-400 italic">Not set</span>}
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-6">
    <h2 className="text-[14px] font-medium text-slate-800 mb-3">{title}</h2>
    <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">{children}</div>
  </div>
);

export default function GoogleAdsSummaryStep({ campaignType = "Search", onNavigateToStep }: GoogleAdsSummaryStepProps) {
  const { payload } = useCampaignWizardContext();

  const ads = payload.ads ?? [];
  const allKeywords: any[] = payload.keywords ?? [];
  const posKeywords = allKeywords.filter((k: any) => !k.negative);
  const rsa = ads[0]?.responsiveSearchAd;
  const headlines = rsa?.headlines?.filter((h: any) => h.text?.trim()) ?? [];
  const descriptions = rsa?.descriptions?.filter((d: any) => d.text?.trim()) ?? [];
  const finalUrl = ads[0]?.finalUrls?.[0];
  const budgetAmount = payload.budgetAmount ?? 0;
  const targetCpa = payload.targetCpa;

  // ── Validation ──────────────────────────────────────────────────────────────
  const errors: { msg: string; step: number }[] = [];
  const warnings: string[] = [];

  if (!finalUrl) errors.push({ msg: "No Final URL set in your ad", step: 5 });
  if (headlines.length < 3) errors.push({ msg: `Add at least 3 headlines (you have ${headlines.length})`, step: 5 });
  if (descriptions.length < 2) errors.push({ msg: `Add at least 2 descriptions (you have ${descriptions.length})`, step: 5 });
  if (posKeywords.length === 0) errors.push({ msg: "No keywords added — your ads won't serve", step: 5 });
  if (budgetAmount <= 0) errors.push({ msg: "Budget must be greater than zero", step: 7 });

  if (headlines.length < 5) warnings.push("Add 5+ headlines for better ad strength");
  if ((payload.assetExtensions?.sitelinks ?? []).length === 0) warnings.push("Add sitelinks to improve click-through rate by up to 15%");
  if (!payload.trackingUrlTemplate) warnings.push("No tracking template — conversion tracking may be incomplete");
  if (targetCpa && budgetAmount < targetCpa * 10)
    warnings.push(`Budget (₹${budgetAmount}) is less than 10× target CPA (₹${targetCpa}) — may limit performance`);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const networkLabel = () => {
    const parts = ["Google Search"];
    if (payload.networks?.searchPartners) parts.push("Search Partners");
    if (payload.networks?.displayNetwork) parts.push("Display Network");
    return parts.join(", ");
  };

  const bidLabel = () => {
    if (payload.targetCpa) return `Target CPA: ₹${payload.targetCpa.toFixed(2)}`;
    if (payload.targetRoas) return `Target ROAS: ${payload.targetRoas}%`;
    if (payload.targetImpressionShare)
      return `Target Impression Share: ${payload.targetImpressionShare.locationFractionMicros / 10000}% — ${payload.targetImpressionShare.location}`;
    switch (payload.biddingFocus) {
      case "CLICKS": return `Maximise clicks${payload.maxCpcBidLimit ? ` (max CPC: ₹${payload.maxCpcBidLimit})` : ""}`;
      case "IMPRESSION_SHARE": return "Target impression share";
      case "CONVERSION_VALUE": return "Maximise conversion value";
      default: return "Maximise conversions";
    }
  };

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined;

  const isVideo = campaignType === "Video";
  const sitelinks = payload.assetExtensions?.sitelinks ?? [];
  const callouts = payload.assetExtensions?.callouts ?? [];
  const snippets = payload.assetExtensions?.structuredSnippets ?? [];
  const calls = payload.assetExtensions?.calls ?? [];

  return (
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <h1 className="text-[24px] font-normal text-slate-800 mb-2">Review your campaign</h1>
      <p className="text-[13px] text-slate-600 mb-6">Check that everything looks right before publishing.</p>

      {/* Critical errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-[13px] font-semibold text-red-700">Fix these before publishing</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {errors.map(e => (
              <div key={e.msg} className="flex items-center gap-3 ml-6">
                <span className="text-[13px] text-red-700">• {e.msg}</span>
                {onNavigateToStep && (
                  <button
                    onClick={() => onNavigateToStep(e.step)}
                    className="text-[12px] text-red-600 font-medium hover:underline shrink-0"
                  >
                    Fix it →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[13px] font-semibold text-amber-700">Recommendations</span>
          </div>
          {warnings.map(w => (
            <div key={w} className="text-[13px] text-amber-700 ml-6">• {w}</div>
          ))}
        </div>
      )}

      {/* All clear */}
      {errors.length === 0 && warnings.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-4 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-[13px] font-medium text-emerald-700">Campaign looks great — ready to publish!</span>
        </div>
      )}

      {/* Campaign Settings */}
      <Section title="Campaign settings">
        <Row label="Campaign name" value={payload.name} />
        <Row label="Campaign type" value={campaignType} />
        <Row label="Status on launch" value={payload.status === "ENABLED" ? "Active" : "Paused"} />
        <Row label="Networks" value={networkLabel()} />
        <Row
          label="Locations"
          value={
            payload.locations?.type === "ALL" ? "All countries and territories" :
            payload.locations?.type === "US_CA" ? "United States & Canada" : "Custom"
          }
        />
        <Row label="Languages" value={(payload.languages ?? []).join(", ") || "English"} />
        <Row label="Start date" value={fmtDate(payload.startDate) ?? "Immediately"} />
        <Row label="End date" value={fmtDate(payload.endDate) ?? "No end date"} />
        {payload.trackingUrlTemplate && <Row label="Tracking template" value={payload.trackingUrlTemplate} />}
        {payload.finalUrlSuffix && <Row label="Final URL suffix" value={payload.finalUrlSuffix} />}
        {payload.broadMatchEnabled !== undefined && (
          <Row label="Broad match" value={payload.broadMatchEnabled ? "Enabled (recommended)" : "Disabled"} />
        )}
        {payload.adRotation && (
          <Row label="Ad rotation" value={payload.adRotation === "OPTIMIZE" ? "Optimise" : "Do not optimise"} />
        )}
        {payload.dynamicSearchAds?.domain && (
          <Row label="Dynamic Search Ads" value={`${payload.dynamicSearchAds.domain} · ${payload.dynamicSearchAds.language} · ${payload.dynamicSearchAds.targetingSource}`} />
        )}
        {(payload.brandRestrictions ?? []).length > 0 && (
          <Row label="Brand restrictions" value={(payload.brandRestrictions ?? []).join(", ")} />
        )}
        {payload.automaticallyCreatedAssets && (
          <Row
            label="Auto-created assets"
            value={[
              payload.automaticallyCreatedAssets.textEnabled ? "Text" : null,
              payload.automaticallyCreatedAssets.finalUrlExpansionEnabled ? "Final URL expansion" : null,
            ].filter(Boolean).join(", ") || "Disabled"}
          />
        )}
      </Section>

      {/* Bidding */}
      <Section title="Bidding">
        <Row label="Bid strategy" value={bidLabel()} />
        {payload.onlyNewCustomers && <Row label="Customer acquisition" value="Only bid for new customers" />}
      </Section>

      {/* Keywords & Ads (Search only) */}
      {!isVideo && (
        <Section title="Keywords & Ads">
          <Row label="Ad group" value={payload.adGroups?.[0]?.name || "Ad Group 1"} />
          <Row label="Keywords" value={`${posKeywords.length} keyword${posKeywords.length !== 1 ? "s" : ""}`} />
          {posKeywords.slice(0, 5).map((k: any, i: number) => (
            <Row key={i} label="" value={<span className="text-slate-600">[{k.matchType}] {k.text}</span>} />
          ))}
          {posKeywords.length > 5 && <Row label="" value={<span className="text-slate-400 text-[12px]">+{posKeywords.length - 5} more keywords</span>} />}
          <Row label="Final URL" value={finalUrl} />
          {(rsa?.path1 || rsa?.path2) && (
            <Row label="Display path" value={[rsa?.path1, rsa?.path2].filter(Boolean).join(" / ")} />
          )}
          <Row label="Headlines" value={`${headlines.length} / 15 added`} />
          <Row label="Descriptions" value={`${descriptions.length} / 4 added`} />
        </Section>
      )}

      {/* Video */}
      {isVideo && (
        <Section title="Video ad">
          <Row label="Video ID" value={ads[0]?.videoAd?.videoId} />
          <Row label="Format" value={ads[0]?.videoAd?.format} />
          <Row label="Final URL" value={finalUrl} />
        </Section>
      )}

      {/* Asset Extensions */}
      {(sitelinks.length > 0 || callouts.length > 0 || snippets.length > 0 || calls.length > 0) && (
        <Section title="Asset extensions">
          {sitelinks.length > 0 && <Row label="Sitelinks" value={`${sitelinks.length} added`} />}
          {callouts.length > 0 && <Row label="Callouts" value={callouts.map((c: any) => c.text).join(", ")} />}
          {snippets.length > 0 && <Row label="Structured snippets" value={`${snippets.length} added`} />}
          {calls.length > 0 && <Row label="Calls" value={calls.map((c: any) => `${c.countryCode} ${c.phoneNumber}`).join(", ")} />}
        </Section>
      )}

      {/* Budget */}
      <Section title="Budget">
        <Row label="Budget type" value={payload.budgetType === "TOTAL" ? "Campaign total" : "Average daily"} />
        <Row label="Amount" value={`₹${budgetAmount.toFixed(2)}`} />
      </Section>
    </div>
  );
}


