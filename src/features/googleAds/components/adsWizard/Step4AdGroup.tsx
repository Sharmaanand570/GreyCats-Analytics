import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { parseKeywords, type StepProps } from "./types";
import { useGoogleAdsKeywordIdeas } from "../../hooks/useGoogleAdsManager";

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

const MATCH_TYPE_BADGE: Record<string, string> = {
  BROAD: "bg-slate-100 text-slate-700",
  PHRASE: "bg-blue-100 text-[#1A73E8]",
  EXACT: "bg-emerald-100 text-emerald-700",
};

export function Step4AdGroup({ form, setForm, clientId, showAllErrors }: StepProps) {
  // The wizard renders Step 4 only for SEARCH campaigns. Defensive guard
  // for direct navigation.
  const isSearch = form.campaignType === "SEARCH";

  const parsed = useMemo(() => parseKeywords(form.keywordsText), [form.keywordsText]);
  const hasGroupError = !!showAllErrors && !form.adGroupName.trim();
  const hasKeywordError = !!showAllErrors && parsed.length === 0;

  const [ideaUrl, setIdeaUrl] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [pickedIdeas, setPickedIdeas] = useState<Set<string>>(new Set());

  const { mutateAsync: fetchIdeas, isPending, data: ideas } = useGoogleAdsKeywordIdeas();

  const togglePicked = (text: string) => {
    setPickedIdeas((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };

  const addPickedIdeas = () => {
    if (pickedIdeas.size === 0) return;
    const existing = new Set(parsed.map((k) => k.text.toLowerCase()));
    const fresh = Array.from(pickedIdeas).filter(
      (t) => !existing.has(t.toLowerCase())
    );
    if (fresh.length === 0) return;
    const appended = form.keywordsText.trim().length
      ? `${form.keywordsText}\n${fresh.join("\n")}`
      : fresh.join("\n");
    setForm((f) => ({ ...f, keywordsText: appended }));
    setPickedIdeas(new Set());
  };

  const triggerIdeas = async () => {
    const seed = ideaUrl.trim() || ideaDescription.trim();
    if (!seed) return;
    await fetchIdeas({
      payload: {
        url: ideaUrl.trim() || undefined,
        description: ideaDescription.trim() || undefined,
        locationIds: form.locations.filter((l) => !l.excluded).map((l) => l.id),
        languageId: form.languageIds[0],
      },
      params: {
        clientId,
        customerId: form.customerId || undefined,
      },
    });
  };

  if (!isSearch) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-3 max-w-2xl mx-auto">
        <Sparkles className="w-8 h-8 text-[#1A73E8]" />
        <h3 className="text-base font-bold text-slate-900">
          No keyword setup for {form.campaignType.replace("_", " ")}
        </h3>
        <p className="text-xs text-slate-500 max-w-md">
          {form.campaignType === "PERFORMANCE_MAX"
            ? "Performance Max uses Google AI to discover signals across all networks — no manual keywords needed."
            : "Display campaigns target placements and audiences, not keywords. Continue to set up creatives."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Ad Group name */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          Ad group name
        </div>
        <p className="text-xs text-slate-500">
          Group keywords by theme. You can add more ad groups later in Google Ads.
        </p>
        <Input
          value={form.adGroupName}
          onChange={(e) => setForm((f) => ({ ...f, adGroupName: e.target.value }))}
          placeholder="Ad Group 1"
          className={cn(
            "h-11 rounded-xl border-slate-200 bg-white w-full sm:w-[360px]",
            hasGroupError && "border-rose-400 focus-visible:ring-rose-300"
          )}
        />
        {hasGroupError && <FieldError message="Ad group name is required." />}
      </div>

      {/* Keyword ideas helper */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          Get keyword ideas
        </div>
        <p className="text-xs text-slate-500">
          Paste a landing page URL or describe what you're advertising — Google
          will suggest relevant keywords.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Landing page URL
            </label>
            <Input
              value={ideaUrl}
              onChange={(e) => setIdeaUrl(e.target.value)}
              placeholder="https://myshop.com/product"
              className="h-10 rounded-lg border-slate-200 bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Or describe your product
            </label>
            <Input
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              placeholder="Premium hiking backpacks for women"
              className="h-10 rounded-lg border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={triggerIdeas}
            disabled={
              isPending ||
              (!ideaUrl.trim() && !ideaDescription.trim())
            }
            className="h-10 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold px-4 gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate ideas
              </>
            )}
          </Button>
        </div>

        {ideas && ideas.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {ideas.length} suggestion{ideas.length === 1 ? "" : "s"}
              </span>
              {pickedIdeas.size > 0 && (
                <Button
                  type="button"
                  onClick={addPickedIdeas}
                  className="h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add {pickedIdeas.size} selected
                </Button>
              )}
            </div>
            <div className="max-h-[260px] overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/30">
              {ideas.map((idea) => {
                const checked = pickedIdeas.has(idea.text);
                return (
                  <label
                    key={idea.text}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white",
                      checked && "bg-white"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => togglePicked(idea.text)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {idea.text}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        {idea.avgMonthlySearches !== undefined && (
                          <span>
                            {idea.avgMonthlySearches.toLocaleString()} mo. searches
                          </span>
                        )}
                        {idea.competition && (
                          <span className="uppercase tracking-wider">
                            {idea.competition} competition
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Keyword entry */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          Keywords
        </div>
        <p className="text-xs text-slate-500">
          One keyword per line. Use Google's match-type syntax:
        </p>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className={cn("px-2 py-0.5 rounded font-bold uppercase tracking-wider", MATCH_TYPE_BADGE.BROAD)}>
            keyword
          </span>
          <span className="text-slate-500">broad match</span>
          <span className="text-slate-300">·</span>
          <span className={cn("px-2 py-0.5 rounded font-bold uppercase tracking-wider", MATCH_TYPE_BADGE.PHRASE)}>
            "keyword"
          </span>
          <span className="text-slate-500">phrase match</span>
          <span className="text-slate-300">·</span>
          <span className={cn("px-2 py-0.5 rounded font-bold uppercase tracking-wider", MATCH_TYPE_BADGE.EXACT)}>
            [keyword]
          </span>
          <span className="text-slate-500">exact match</span>
        </div>

        <Textarea
          value={form.keywordsText}
          onChange={(e) => setForm((f) => ({ ...f, keywordsText: e.target.value }))}
          rows={8}
          placeholder={`running shoes\n"trail running shoes"\n[mens running shoes size 10]`}
          className={cn(
            "rounded-xl border-slate-200 bg-white font-mono text-sm",
            hasKeywordError && "border-rose-400 focus-visible:ring-rose-300"
          )}
        />

        {parsed.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {parsed.length} keyword{parsed.length === 1 ? "" : "s"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsed.slice(0, 50).map((k, i) => (
                <span
                  key={`${k.text}-${i}`}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200 bg-white"
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      k.matchType === "EXACT" && "bg-emerald-500",
                      k.matchType === "PHRASE" && "bg-[#1A73E8]",
                      k.matchType === "BROAD" && "bg-slate-400"
                    )}
                  />
                  {k.text}
                </span>
              ))}
              {parsed.length > 50 && (
                <span className="text-[11px] text-slate-400 font-semibold">
                  +{parsed.length - 50} more
                </span>
              )}
            </div>
          </div>
        )}

        {hasKeywordError && <FieldError message="Add at least one keyword." />}

        {parsed.length > 0 && (
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, keywordsText: "" }))}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
