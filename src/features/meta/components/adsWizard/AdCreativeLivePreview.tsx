import { useState } from "react";
import {
  Monitor,
  Smartphone,
  RectangleHorizontal,
  Tv2,
  X,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  Send,
  Bookmark,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Forward,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CTA_OPTIONS, type WizardState } from "./types";
import { useMetaAccounts } from "@/features/meta/hooks/useMetaData";

type Props = {
  form: WizardState;
  clientId?: number | null;
};

const SURFACES = [
  { value: "feeds", icon: Monitor, label: "Feeds" },
  { value: "stories", icon: RectangleHorizontal, label: "Stories" },
  { value: "reels", icon: Smartphone, label: "Reels" },
  { value: "in-stream", icon: Tv2, label: "In-stream" },
] as const;

type Surface = (typeof SURFACES)[number]["value"];

const truncateUrl = (url: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  }
};

export function AdCreativeLivePreview({ form, clientId }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [surface, setSurface] = useState<Surface>("feeds");

  const { data: accountsData } = useMetaAccounts((clientId ?? 0) as number);
  const pages = accountsData?.pages ?? [];
  const page = pages.find(
    (p) => p.pageId === (form.adSet.pageId ?? form.campaign.pageId)
  );
  const pageName = page?.name || "Your Page";
  const igHandle = form.ad.instagramAccountId
    ? form.ad.instagramAccountId.replace(/^@/, "")
    : pageName.toLowerCase().replace(/\s+/g, ".");

  const primaryText = form.ad.primaryTexts[0] ?? "";
  const headline = form.ad.headlines[0] ?? "";
  const description = form.ad.descriptions[0] ?? "";
  const imageUrl = form.ad.images[0] ?? "";
  const videoUrl = form.ad.videos[0] ?? "";
  const videoThumb = form.ad.videoThumbnailUrl ?? "";
  const cta =
    CTA_OPTIONS.find((o) => o.value === form.ad.callToAction)?.label ??
    "Learn More";
  const displayDomain =
    form.ad.displayLink || truncateUrl(form.ad.websiteUrl || "");
  const isCarousel = form.ad.format === "CAROUSEL";
  const isVideo = !!videoUrl;
  const heroMedia = imageUrl || videoThumb;

  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 bg-white rounded-t-[20px]">
        {/* Toggle button */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only"
              id="ad-preview-toggle-checkbox"
            />
            <div className={cn(
              "w-[50px] h-[26px] rounded-full transition-colors duration-200 border flex items-center px-[3px]",
              enabled 
                ? "bg-[#0969da] border-[#0969da]" 
                : "bg-white border-[#d0d7de]"
            )}>
              <div className={cn(
                "w-[18px] h-[18px] rounded-full transition-transform duration-200 shadow-sm",
                enabled 
                  ? "bg-white translate-x-[26px]" 
                  : "bg-[#24292f]"
              )} />
            </div>
          </div>
          <span className="text-[14px] font-semibold text-[#24292f]">Ad preview</span>
        </label>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-[34px] rounded-lg border-[#d0d7de] bg-white px-3.5 text-[13px] font-semibold text-[#24292f] hover:bg-[#f6f8fa] active:bg-[#f0f2f5] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#57606a]" />
            Advanced preview
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-[34px] px-2.5 rounded-lg border-[#d0d7de] bg-white hover:bg-[#f6f8fa] active:bg-[#f0f2f5] transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Forward className="w-3.5 h-3.5 text-[#57606a]" />
            <ChevronDown className="w-3 h-3 text-[#57606a]" />
          </Button>
        </div>
      </div>

      {enabled && (
        <div className="px-5 pb-5 pt-4 space-y-4">
          {/* Surface tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
            {SURFACES.map((s) => {
              const Icon = s.icon;
              const active = surface === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSurface(s.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                    active
                      ? "border-[#1877F2]/40 bg-[#1877F2]/6 text-[#1877F2]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
            {/* "Verifying" pill — mirrors Meta's "Verifying your changes" badge */}
            <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>

          {/* Info banner — mirrors Meta's "You can now see more variations…" */}
          <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
            <span className="text-amber-500 text-xs">★</span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              You can now see more variations of your ad in previews
            </p>
          </div>

          {/* Preview cards — side-by-side */}
          {surface === "feeds" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                  Facebook Feed
                </p>
                <FacebookFeedPreview
                  pageName={pageName}
                  primaryText={primaryText}
                  imageUrl={heroMedia}
                  isVideo={isVideo}
                  displayDomain={displayDomain}
                  headline={headline}
                  description={description}
                  cta={cta}
                  isCarousel={isCarousel}
                  carouselCards={form.ad.carouselCards}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                  Instagram Feed
                </p>
                <InstagramFeedPreview
                  handle={igHandle}
                  imageUrl={heroMedia}
                  isVideo={isVideo}
                  primaryText={primaryText}
                  cta={cta}
                  isCarousel={isCarousel}
                  carouselCards={form.ad.carouselCards}
                />
              </div>
            </div>
          )}

          {surface === "stories" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                  Facebook Stories
                </p>
                <StoryPreview
                  handle={pageName}
                  imageUrl={heroMedia}
                  isVideo={isVideo}
                  cta={cta}
                  platform="facebook"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                  Instagram Stories
                </p>
                <StoryPreview
                  handle={igHandle}
                  imageUrl={heroMedia}
                  isVideo={isVideo}
                  cta={cta}
                  platform="instagram"
                />
              </div>
            </div>
          )}

          {surface === "reels" && (
            <div className="flex justify-center">
              <div className="w-full max-w-[220px] space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                  Instagram Reels
                </p>
                <ReelsPreview
                  handle={igHandle}
                  imageUrl={heroMedia}
                  isVideo={isVideo}
                  primaryText={primaryText}
                  cta={cta}
                />
              </div>
            </div>
          )}

          {surface === "in-stream" && (
            <div className="flex justify-center">
              <div className="w-full space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                  In-stream Video
                </p>
                <InStreamPreview
                  pageName={pageName}
                  imageUrl={heroMedia}
                  isVideo={isVideo}
                  headline={headline}
                  cta={cta}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Facebook Feed                                                */
/* ─────────────────────────────────────────────────────────── */

function FacebookFeedPreview({
  pageName,
  primaryText,
  imageUrl,
  isVideo,
  displayDomain,
  headline,
  description,
  cta,
  isCarousel,
  carouselCards,
}: {
  pageName: string;
  primaryText: string;
  imageUrl: string;
  isVideo: boolean;
  displayDomain: string;
  headline: string;
  description: string;
  cta: string;
  isCarousel: boolean;
  carouselCards: { imageUrl: string; headline?: string; description?: string; link: string }[];
}) {
  const [cardIdx, setCardIdx] = useState(0);
  const cards = carouselCards.length > 0 ? carouselCards : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm text-[13px]">
      {/* Page header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0a5ed8] flex items-center justify-center shrink-0 shadow-sm">
            <FacebookIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 truncate leading-tight">
              {pageName}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <span>Sponsored</span>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 6l1.5 1.5L8 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <MoreHorizontal className="w-4 h-4" />
          <X className="w-4 h-4" />
        </div>
      </div>

      {/* Primary text */}
      {primaryText && (
        <div className="px-3 pb-2">
          <p className="text-[12px] text-slate-800 leading-snug whitespace-pre-wrap line-clamp-3">
            {primaryText}
          </p>
        </div>
      )}

      {/* Carousel or single media */}
      {isCarousel && cards.length > 0 ? (
        <div className="relative">
          <MediaTile
            imageUrl={cards[cardIdx]?.imageUrl ?? ""}
            isVideo={false}
            className="aspect-square bg-slate-100"
          />
          {/* Nav arrows */}
          {cards.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCardIdx((i) => Math.max(0, i - 1))}
                disabled={cardIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow border border-slate-200 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => setCardIdx((i) => Math.min(cards.length - 1, i + 1))}
                disabled={cardIdx === cards.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow border border-slate-200 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCardIdx(i)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === cardIdx ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
          {/* Card link rail */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-900 truncate">
                {cards[cardIdx]?.headline || "Card headline"}
              </div>
              {cards[cardIdx]?.description && (
                <div className="text-[10px] text-slate-500 truncate">
                  {cards[cardIdx].description}
                </div>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 ml-2 text-[11px] font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded px-2.5 py-1 transition-colors"
            >
              {cta}
            </button>
          </div>
        </div>
      ) : (
        <>
          <MediaTile
            imageUrl={imageUrl}
            isVideo={isVideo}
            className="aspect-[1.91/1] bg-slate-100"
          />
          {/* Link rail */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#f0f2f5] border-t border-slate-200">
            <div className="min-w-0 flex-1">
              {displayDomain && (
                <div className="text-[10px] uppercase text-slate-500 font-medium truncate">
                  {displayDomain}
                </div>
              )}
              <div className="text-[12px] font-bold text-slate-900 truncate leading-tight">
                {headline || "Your headline shows here"}
              </div>
              {description && (
                <div className="text-[11px] text-slate-500 truncate">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded px-2.5 py-1.5 transition-colors whitespace-nowrap"
            >
              {cta}
            </button>
          </div>
        </>
      )}

      {/* Reaction bar */}
      <div className="px-3 py-2 border-t border-slate-100">
        {/* Like count */}
        <div className="flex items-center gap-1 mb-1.5">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1877F2] text-white text-[8px]">
            👍
          </span>
          <span className="text-[11px] text-slate-500">You and 24 others</span>
          <span className="ml-auto text-[11px] text-slate-500">3 comments</span>
        </div>
        <div className="flex items-center justify-around border-t border-slate-100 pt-1">
          <ReactionBtn icon={<ThumbsUp className="w-3.5 h-3.5" />} label="Like" />
          <ReactionBtn icon={<MessageCircle className="w-3.5 h-3.5" />} label="Comment" />
          <ReactionBtn icon={<Share2 className="w-3.5 h-3.5" />} label="Share" />
        </div>
      </div>
    </div>
  );
}

function ReactionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-[#1877F2] px-2 py-1 rounded transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Instagram Feed                                               */
/* ─────────────────────────────────────────────────────────── */

function InstagramFeedPreview({
  handle,
  imageUrl,
  isVideo,
  primaryText,
  cta,
  isCarousel,
  carouselCards,
}: {
  handle: string;
  imageUrl: string;
  isVideo: boolean;
  primaryText: string;
  cta: string;
  isCarousel: boolean;
  carouselCards: { imageUrl: string }[];
}) {
  const [cardIdx, setCardIdx] = useState(0);
  const cards = carouselCards.length > 0 ? carouselCards : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Profile header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* IG gradient ring */}
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4] shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-slate-900 truncate leading-tight">
              {handle}
            </div>
            <div className="text-[10px] text-slate-500">Sponsored</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <MoreHorizontal className="w-4 h-4" />
          <X className="w-4 h-4" />
        </div>
      </div>

      {/* Media — carousel or single */}
      {isCarousel && cards.length > 0 ? (
        <div className="relative">
          <MediaTile
            imageUrl={cards[cardIdx]?.imageUrl ?? ""}
            isVideo={false}
            className="aspect-square bg-slate-100"
          />
          {cards.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCardIdx((i) => Math.max(0, i - 1))}
                disabled={cardIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30"
              >
                <ChevronLeft className="w-3 h-3 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => setCardIdx((i) => Math.min(cards.length - 1, i + 1))}
                disabled={cardIdx === cards.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3 text-slate-700" />
              </button>
              {/* Dot counter top-right */}
              <div className="absolute top-2 right-3 bg-black/50 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                {cardIdx + 1}/{cards.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <MediaTile
          imageUrl={imageUrl}
          isVideo={isVideo}
          className="aspect-square bg-slate-100"
        />
      )}

      {/* Action row */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <div className="flex items-center gap-3 text-slate-800">
          <Heart className="w-[18px] h-[18px]" />
          <MessageCircle className="w-[18px] h-[18px]" />
          <Send className="w-[18px] h-[18px]" />
        </div>
        <Bookmark className="w-[18px] h-[18px] text-slate-800" />
      </div>

      {/* Like count */}
      <div className="px-3 text-[11px] font-semibold text-slate-900 pb-1">
        127 likes
      </div>

      {/* Caption */}
      {primaryText && (
        <div className="px-3 pb-2">
          <p className="text-[11px] text-slate-800 leading-snug">
            <span className="font-bold mr-1">{handle}</span>
            <span className="line-clamp-2">{primaryText}</span>
          </p>
        </div>
      )}

      {/* CTA strip — full-width button */}
      <div className="px-3 pb-3 pt-1">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md py-1.5 border border-slate-200 transition-colors"
        >
          {cta}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Stories mock (both platforms)                               */
/* ─────────────────────────────────────────────────────────── */

function StoryPreview({
  handle,
  imageUrl,
  isVideo,
  cta,
  platform,
}: {
  handle: string;
  imageUrl: string;
  isVideo: boolean;
  cta: string;
  platform: "facebook" | "instagram";
}) {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm aspect-[9/16] bg-slate-900 max-w-[200px] mx-auto">
      {/* Background media */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      )}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="w-10 h-10 text-white/80" />
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute top-2 left-2 right-2 flex gap-0.5">
        <div className="h-0.5 flex-1 bg-white rounded-full" />
        <div className="h-0.5 flex-1 bg-white/30 rounded-full" />
        <div className="h-0.5 flex-1 bg-white/30 rounded-full" />
      </div>

      {/* Profile row */}
      <div className="absolute top-5 left-3 right-3 flex items-center gap-2">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          platform === "instagram"
            ? "p-[1.5px] bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4]"
            : "bg-[#1877F2]"
        )}>
          <div className={cn(
            "w-full h-full rounded-full flex items-center justify-center",
            platform === "instagram" && "bg-slate-900"
          )}>
            {platform === "instagram"
              ? <InstagramIcon className="w-3.5 h-3.5 text-white" />
              : <FacebookIcon className="w-3.5 h-3.5 text-white" />
            }
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-white truncate">{handle}</div>
          <div className="text-[9px] text-white/70">Sponsored</div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-white/70 ml-auto" />
        <X className="w-4 h-4 text-white/70" />
      </div>

      {/* Swipe-up CTA */}
      <div className="absolute bottom-4 left-3 right-3 flex flex-col items-center gap-2">
        <div className="w-4 h-px bg-white/60" />
        <div className="text-[9px] text-white/70">Swipe up</div>
        <button
          type="button"
          className="w-full text-[10px] font-bold bg-white/90 text-slate-900 rounded-full py-1.5"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Reels mock                                                   */
/* ─────────────────────────────────────────────────────────── */

function ReelsPreview({
  handle,
  imageUrl,
  isVideo,
  primaryText,
  cta,
}: {
  handle: string;
  imageUrl: string;
  isVideo: boolean;
  primaryText: string;
  cta: string;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm aspect-[9/16] bg-slate-900 max-w-[220px] mx-auto">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-75"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950" />
      )}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="w-10 h-10 text-white/70" />
        </div>
      )}

      {/* Right action rail */}
      <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1 text-white">
          <Heart className="w-5 h-5" />
          <span className="text-[9px]">2.4k</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
          <MessageCircle className="w-5 h-5" />
          <span className="text-[9px]">84</span>
        </div>
        <Send className="w-5 h-5 text-white" />
        <MoreHorizontal className="w-5 h-5 text-white" />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-6 h-6 rounded-full p-[1.5px] bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4]">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
              <InstagramIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-white truncate">{handle}</span>
          <span className="text-[9px] text-white/60 ml-1">· Sponsored</span>
        </div>
        {primaryText && (
          <p className="text-[10px] text-white/80 line-clamp-2 mb-2">{primaryText}</p>
        )}
        <button
          type="button"
          className="w-full text-[10px] font-bold bg-white/90 text-slate-900 rounded py-1"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* In-stream Video                                              */
/* ─────────────────────────────────────────────────────────── */

function InStreamPreview({
  pageName,
  imageUrl,
  isVideo,
  headline,
  cta,
}: {
  pageName: string;
  imageUrl: string;
  isVideo: boolean;
  headline: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-black overflow-hidden shadow-sm">
      {/* Video region */}
      <div className="relative aspect-video bg-slate-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-75"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white/30" />
          </div>
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white/70" />
          </div>
        )}
        {/* Ad badge */}
        <div className="absolute top-2 left-2 bg-[#FFFF00] text-black text-[9px] font-black px-1.5 py-0.5 rounded-sm">
          Ad
        </div>
        {/* Skip button */}
        <div className="absolute bottom-2 right-2 text-[9px] text-white/80 border border-white/30 rounded px-1.5 py-0.5">
          Skip in 3s ›
        </div>
      </div>
      {/* Ad info strip */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1c1c]">
        <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
          <FacebookIcon className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-white truncate">{pageName}</div>
          <div className="text-[10px] text-white/50">{headline || "Sponsored"}</div>
        </div>
        <button
          type="button"
          className="shrink-0 text-[10px] font-bold bg-[#1877F2] text-white rounded px-2.5 py-1 whitespace-nowrap"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Shared media tile                                            */
/* ─────────────────────────────────────────────────────────── */

function MediaTile({
  imageUrl,
  isVideo,
  className,
}: {
  imageUrl: string;
  isVideo: boolean;
  className?: string;
}) {
  if (!imageUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400",
          className
        )}
      >
        <svg className="w-8 h-8 opacity-30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
        <span className="text-[9px] font-bold uppercase tracking-widest">No media</span>
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <PlayCircle className="w-12 h-12 text-white/90 drop-shadow" />
        </div>
      )}
    </div>
  );
}
