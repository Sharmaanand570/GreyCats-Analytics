import { useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RsaDescription,
  RsaHeadline,
} from "../../API/googleAdsManagerApi";

type Props = {
  finalUrl: string;
  path1?: string;
  path2?: string;
  headlines: RsaHeadline[];
  descriptions: RsaDescription[];
};

// Render the rotation by respecting pin positions. Returns up to 3 headlines
// and up to 2 descriptions for the visible preview slot.
function pickRotation<T extends { text: string; pin: string }>(
  items: T[],
  slots: number
): T[] {
  const result: T[] = Array(slots).fill(null) as unknown as T[];
  const used = new Set<number>();

  // First pass — honor pinned items.
  items.forEach((item, idx) => {
    if (!item.text.trim()) return;
    const match = /POSITION_(\d)/.exec(item.pin);
    if (!match) return;
    const pos = Number(match[1]) - 1;
    if (pos >= 0 && pos < slots && !result[pos]) {
      result[pos] = item;
      used.add(idx);
    }
  });

  // Second pass — fill remaining slots with unpinned (or already-used) items.
  let cursor = 0;
  for (const item of items) {
    if (cursor >= slots) break;
    if (!item.text.trim()) continue;
    while (cursor < slots && result[cursor]) cursor++;
    if (cursor >= slots) break;
    if (used.has(items.indexOf(item))) continue;
    result[cursor] = item;
    cursor++;
  }

  return result.filter(Boolean);
}

function getDomain(url: string): string {
  if (!url) return "example.com";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return "example.com";
  }
}

// ─── Google Ad Card ─────────────────────────────────────────────────────────
// Renders one ad result card matching Google's current visual design.

function GoogleAdCard({
  domain,
  displayUrl,
  headlineText,
  descText,
  compact = false,
}: {
  domain: string;
  displayUrl: string;
  headlineText: string;
  descText: string;
  compact?: boolean;
}) {
  const initial = (domain[0] ?? "A").toUpperCase();
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-[#dfe1e5] font-[Arial,sans-serif]",
        compact ? "p-3" : "p-4"
      )}
    >
      {/* Favicon row */}
      <div className="flex items-center gap-2 mb-1">
        {/* Favicon circle */}
        <div
          className="flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "#4285F4" }}
        >
          {initial}
        </div>
        <div className="leading-tight">
          <div className="text-[14px] text-[#202124] font-normal truncate max-w-[240px]">
            {domain}
          </div>
          <div className="text-[12px] text-[#4d5156] truncate max-w-[240px]">
            {displayUrl}
          </div>
        </div>
      </div>

      {/* Sponsored badge */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="inline-flex items-center border border-[#70757a] rounded-sm px-[3px] py-[0px] text-[11px] font-normal text-[#70757a] leading-tight">
          Sponsored
        </span>
      </div>

      {/* Headline */}
      <div
        className={cn(
          "text-[#1a0dab] hover:underline cursor-pointer leading-snug font-normal",
          compact ? "text-[18px]" : "text-[20px]"
        )}
      >
        {headlineText || (
          <span className="text-[#9aa0a6] italic text-[15px]">
            Your headline appears here
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className={cn(
          "text-[#4d5156] mt-1 leading-snug font-normal",
          compact ? "text-[13px]" : "text-[14px]"
        )}
      >
        {descText || (
          <span className="text-[#9aa0a6] italic">
            Your descriptions appear here. Add at least 2 to give Google more
            options to rotate.
          </span>
        )}
      </p>
    </div>
  );
}

export function AdPreviewPanel({
  finalUrl,
  path1,
  path2,
  headlines,
  descriptions,
}: Props) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  const previewHeadlines = useMemo(
    () => pickRotation(headlines, 3),
    [headlines]
  );
  const previewDescriptions = useMemo(
    () => pickRotation(descriptions, 2),
    [descriptions]
  );

  const domain = getDomain(finalUrl);
  const displayUrl = [domain, path1, path2].filter(Boolean).join(" › ");

  const headlineText = previewHeadlines
    .map((h) => h.text.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" | ");

  const descText = previewDescriptions
    .map((d) => d.text.trim())
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-3">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setView("desktop")}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
            view === "desktop"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          )}
        >
          <Monitor className="w-3.5 h-3.5" />
          Desktop
        </button>
        <button
          type="button"
          onClick={() => setView("mobile")}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
            view === "mobile"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          )}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile
        </button>
      </div>

      {view === "desktop" ? (
        /* ── Desktop: Mock SERP chrome ── */
        <div className="rounded-xl border border-slate-200 bg-[#f8f9fa] overflow-hidden shadow-sm">
          {/* Search bar chrome */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#dfe1e5]">
            {/* Google G icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <div className="flex-1 flex items-center bg-white border border-[#dfe1e5] rounded-full px-4 h-9 shadow-sm">
              <span className="text-[13px] text-[#202124] font-normal truncate">
                {domain.replace("www.", "")} products
              </span>
            </div>
          </div>
          {/* Results area */}
          <div className="px-4 pt-3 pb-4">
            <div className="text-[12px] text-[#70757a] mb-3">
              About 1,240,000,000 results (0.32 seconds)
            </div>
            <GoogleAdCard
              domain={domain}
              displayUrl={displayUrl}
              headlineText={headlineText}
              descText={descText}
            />
          </div>
        </div>
      ) : (
        /* ── Mobile: Phone chrome ── */
        <div className="max-w-[340px] mx-auto">
          <div className="rounded-[20px] border-2 border-slate-300 bg-[#f8f9fa] overflow-hidden shadow-md">
            {/* Mobile status bar */}
            <div className="bg-white px-3 pt-2 pb-1 flex items-center gap-2">
              <div className="text-[10px] text-slate-400 font-mono">9:41</div>
              <div className="flex-1 flex items-center bg-[#f1f3f4] rounded-full px-3 h-7 gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[11px] text-[#70757a] truncate">
                  {domain.replace("www.", "")}
                </span>
              </div>
            </div>
            {/* Mobile results */}
            <div className="px-3 pt-2 pb-4">
              <div className="text-[10px] text-[#70757a] mb-2">
                About 1.2B results
              </div>
              <GoogleAdCard
                domain={domain}
                displayUrl={displayUrl}
                headlineText={headlineText}
                descText={descText}
                compact
              />
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 leading-relaxed">
        Google rotates headlines and descriptions to find the best combinations.
        Pinning fixes an asset to a specific position.
      </p>
    </div>
  );
}
