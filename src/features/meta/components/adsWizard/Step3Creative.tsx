import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image as ImageIcon,
  Upload,
  Loader2,
  Link as LinkIcon,
  Type,
  AlignLeft,
  MousePointerClick,
  Layers,
  Film,
  Square,
  Plus,
  Trash2,
  AlertCircle,
  LayoutGrid,
  FileText,
} from "lucide-react";
import { uploadBlogMedia } from "@/features/blog/api/blogPostsApi";
import { toast } from "sonner";
import {
  CTA_OPTIONS,
  MAX_CAROUSEL_CARDS,
  MAX_VARIANTS,
  MIN_CAROUSEL_CARDS,
  MIN_VARIANTS,
  blankCarouselCard,
  blankVariant,
  type StepProps,
} from "./types";
import type {
  AdVariant,
  CarouselCard,
  CtaButton,
  PublishMode,
} from "@/features/meta/API/metaAdsManagerApi";
import { cn } from "@/lib/utils";
import { isValidHttpUrl } from "@/lib/url";
import { RequiredMark } from "@/components/ui/required-mark";
import { FormSection } from "./FormSection";

/** Inline field-level error banner (re-used across branches). */
function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

const HEADLINE_MAX = 40;
const TEXT_MAX = 125;
const DESCRIPTION_MAX = 30;
const CARD_HEADLINE_MAX = 40;
const CARD_DESCRIPTION_MAX = 30;

// Per-target file-size caps — keep well under Meta's hard limits so an upload
// that succeeds locally also succeeds at Meta. (Meta caps images at 30 MB,
// videos at 4 GB, captions much smaller — we stay conservative.)
const MAX_IMAGE_BYTES = 30 * 1024 * 1024;       // 30 MB
const MAX_VIDEO_BYTES = 1024 * 1024 * 1024;     // 1 GB
const MAX_CAPTIONS_BYTES = 5 * 1024 * 1024;     // 5 MB
const formatMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(0)} MB`;

// Inline helper — only show the "invalid URL" hint once the field is non-empty.
const urlInvalid = (v: string | undefined | null) => !!v && v.trim().length > 0 && !isValidHttpUrl(v);

type UploadTarget =
  | "main"
  | "video"
  | "video-thumb"
  | "captions"
  | `card-${number}`
  | `variant-${number}`;

const isVideoFile = (file: File) =>
  file.type.startsWith("video/") ||
  /\.(mp4|mov|m4v|webm)$/i.test(file.name);
const isCaptionsFile = (file: File) =>
  /\.(srt|vtt)$/i.test(file.name) || file.type === "text/vtt" || file.type === "application/x-subrip";

type Step3Props = StepProps & { showAllErrors?: boolean };

export function Step3Creative({ form, setForm, showAllErrors }: Step3Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFor, setUploadingFor] = useState<UploadTarget | null>(null);
  const [progress, setProgress] = useState(0);
  // We share one hidden <input type="file"> across all upload sites — the
  // currently-clicked target is stashed here so we know where the resulting URL belongs.
  const pendingTargetRef = useRef<UploadTarget | null>(null);

  // Auto-seed two blank cards the first time the user picks CAROUSEL.
  useEffect(() => {
    if (form.ad.format === "CAROUSEL" && form.ad.carouselCards.length === 0) {
      setForm((f) => ({
        ...f,
        carouselCards: [blankCarouselCard(), blankCarouselCard()],
      }));
    }
  }, [form.ad.format, form.ad.carouselCards.length, setForm]);

  // Auto-seed two blank variants the first time the user picks AB_TEST.
  useEffect(() => {
    if (form.ad.publishMode === "AB_TEST" && form.ad.adVariants.length === 0) {
      setForm((f) => ({ ...f, ad: { ...f.ad, adVariants: [blankVariant(), blankVariant()] } }));
    }
  }, [form.ad.publishMode, form.ad.adVariants.length, setForm]);

  // Switching ad type discards the fields that belong only to the other type
  // so they don't leak into the published payload (and so the review tab
  // doesn't show stale media). We only clear when there's something to clear,
  // avoiding an infinite render loop.
  useEffect(() => {
    if (form.ad.publishMode === "AB_TEST") return;
    if ((form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "IMAGE")) {
      if (form.ad.carouselCards.length > 0 || (form.ad.videos[0] || "") || form.ad.videoThumbnailUrl || form.ad.captionsUrl) {
        setForm((f) => ({
          ...f,
          carouselCards: [],
          videoUrl: "",
          videoThumbnailUrl: "",
          captionsUrl: "",
        }));
      }
    } else if (form.ad.format === "CAROUSEL") {
      if ((form.ad.images[0] || "") || (form.ad.videos[0] || "") || form.ad.videoThumbnailUrl || form.ad.captionsUrl) {
        setForm((f) => ({
          ...f,
          imageUrl: "",
          videoUrl: "",
          videoThumbnailUrl: "",
          captionsUrl: "",
        }));
      }
    } else if ((form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "VIDEO")) {
      if ((form.ad.images[0] || "") || form.ad.carouselCards.length > 0) {
        setForm((f) => ({ ...f, ad: { ...f.ad, images: [""], carouselCards: [] } }));
      }
    }
  }, [
    form.ad.format,
    form.ad.publishMode,
    (form.ad.images[0] || ""),
    (form.ad.videos[0] || ""),
    form.ad.videoThumbnailUrl,
    form.ad.captionsUrl,
    form.ad.carouselCards.length,
    setForm,
  ]);

  const handleFile = async (file: File, target: UploadTarget) => {
    // Per-target file type guard so users get an immediate signal instead of
    // an opaque upload failure.
    if (target === "video" && !isVideoFile(file)) {
      toast.error("Please choose a video file (.mp4, .mov, .m4v, .webm)");
      return;
    }
    if (target === "captions" && !isCaptionsFile(file)) {
      toast.error("Captions must be a .srt or .vtt file");
      return;
    }
    const isImageTarget =
      target === "main" ||
      target === "video-thumb" ||
      (typeof target === "string" && (target.startsWith("card-") || target.startsWith("variant-")));
    if (isImageTarget && !file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    // Pre-flight size check. The backend / Meta will reject oversize uploads
    // anyway — failing here saves a long progress bar that ends in a 4xx.
    const cap =
      target === "video"
        ? MAX_VIDEO_BYTES
        : target === "captions"
          ? MAX_CAPTIONS_BYTES
          : MAX_IMAGE_BYTES;
    if (file.size > cap) {
      toast.error(`File too large (${formatMb(file.size)}) — max ${formatMb(cap)}.`);
      return;
    }

    setUploadingFor(target);
    setProgress(0);
    try {
      const urls = await uploadBlogMedia([file], setProgress);
      const url = urls[0];
      if (!url) return;
      if (target === "main") {
        setForm((f) => ({ ...f, ad: { ...f.ad, images: [url] } }));
      } else if (target === "video") {
        setForm((f) => ({ ...f, ad: { ...f.ad, videos: [url] } }));
      } else if (target === "video-thumb") {
        setForm((f) => ({ ...f, ad: { ...f.ad, videoThumbnailUrl: url } }));
      } else if (target === "captions") {
        setForm((f) => ({ ...f, ad: { ...f.ad, captionsUrl: url } }));
      } else if (typeof target === "string" && target.startsWith("card-")) {
        const idx = Number(target.slice("card-".length));
        setForm((f) => ({
          ...f,
          carouselCards: f.ad.carouselCards.map((c, i) =>
            i === idx ? { ...c, imageUrl: url } : c
          ),
        }));
      } else if (typeof target === "string" && target.startsWith("variant-")) {
        const idx = Number(target.slice("variant-".length));
        setForm((f) => ({
          ...f,
          adVariants: f.ad.adVariants.map((v, i) =>
            i === idx ? { ...v, imageUrl: url } : v
          ),
        }));
      }
      toast.success("Upload complete");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploadingFor(null);
      setProgress(0);
    }
  };

  const triggerUpload = (target: UploadTarget) => {
    pendingTargetRef.current = target;
    if (fileInputRef.current) {
      // Narrow the OS file picker by target type so the user can't pick the wrong thing.
      fileInputRef.current.accept =
        target === "video"
          ? "video/*"
          : target === "captions"
            ? ".srt,.vtt,text/vtt,application/x-subrip"
            : "image/*";
      fileInputRef.current.click();
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = pendingTargetRef.current;
    pendingTargetRef.current = null;
    if (file && target !== null) {
      handleFile(file, target);
    }
    e.target.value = "";
  };

  // Carousel helpers
  const addCard = () =>
    setForm((f) => {
      if (f.ad.carouselCards.length >= MAX_CAROUSEL_CARDS) return f;
      return { ...f, carouselCards: [...f.ad.carouselCards, blankCarouselCard()] };
    });

  const removeCard = (idx: number) =>
    setForm((f) => {
      if (f.ad.carouselCards.length <= MIN_CAROUSEL_CARDS) return f;
      return {
        ...f,
        carouselCards: f.ad.carouselCards.filter((_, i) => i !== idx),
      };
    });

  const updateCard = (idx: number, patch: Partial<CarouselCard>) =>
    setForm((f) => ({
      ...f,
      carouselCards: f.ad.carouselCards.map((c, i) =>
        i === idx ? { ...c, ...patch } : c
      ),
    }));

  const isCarousel = form.ad.format === "CAROUSEL";
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const isVideo = form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "VIDEO";
  const isAbTest = form.ad.publishMode === "AB_TEST";

  // Field-level error flags. `showAllErrors` lights up everything required
  // when the user mashes Continue with empty fields; otherwise we only complain
  // about URLs the user typed that don't parse.
  const adTextRequiredMiss = showAllErrors && !(form.ad.primaryTexts[0] || "").trim();
  const adHeadlineRequiredMiss = !isAbTest && !isCarousel && showAllErrors && !(form.ad.headlines[0] || "").trim();
  const adLinkRequiredMiss =
    (!isCarousel || isAbTest) && showAllErrors && !form.ad.websiteUrl.trim();
  const adLinkUrlInvalid = urlInvalid(form.ad.websiteUrl);
  const imageUrlRequiredMiss =
    !isAbTest && !isCarousel && !isVideo && showAllErrors && !(form.ad.images[0] || "").trim();
  const imageUrlInvalid = urlInvalid((form.ad.images[0] || ""));
  const videoUrlRequiredMiss = !isAbTest && isVideo && showAllErrors && !(form.ad.videos[0] || "").trim();
  const videoUrlInvalid = urlInvalid((form.ad.videos[0] || ""));
  const videoThumbUrlInvalid = urlInvalid(form.ad.videoThumbnailUrl);
  const captionsUrlInvalid = urlInvalid(form.ad.captionsUrl);
  const abTestUrlInvalid = urlInvalid(form.ad.websiteUrl);

  // Variant helpers
  const addVariant = () =>
    setForm((f) => {
      if (f.ad.adVariants.length >= MAX_VARIANTS) return f;
      return { ...f, adVariants: [...f.ad.adVariants, blankVariant()] };
    });

  const removeVariant = (idx: number) =>
    setForm((f) => {
      if (f.ad.adVariants.length <= MIN_VARIANTS) return f;
      return { ...f, adVariants: f.ad.adVariants.filter((_, i) => i !== idx) };
    });

  const updateVariant = (idx: number, patch: Partial<AdVariant>) =>
    setForm((f) => ({
      ...f,
      adVariants: f.ad.adVariants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));

  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden bg-white">
      <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Creative Setup</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose a format and build your ad creative.
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Fields marked <span className="text-rose-500 font-bold">*</span> are required.
        </p>
      </div>

      <div className="px-8 py-2 divide-y divide-slate-100">

        <FormSection title="Ad Format" description="Select how you want to run this ad and what it should look like." icon={LayoutGrid}>
          {/* Publish Mode toggle */}
          <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Publish Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <PublishModeOption
              value="SINGLE_AD"
              current={form.ad.publishMode}
              onClick={() => setForm((f) => ({ ...f, ad: { ...f.ad, publishMode: "SINGLE_AD" } }))}
              icon={<Square className="w-4 h-4" />}
              label="Single Ad"
              hint="One creative to one ad set"
            />
            <PublishModeOption
              value="AB_TEST"
              current={form.ad.publishMode}
              onClick={() => setForm((f) => ({ ...f, ad: { ...f.ad, publishMode: "AB_TEST" } }))}
              icon={<Layers className="w-4 h-4" />}
              label="A/B Test"
              hint={`${MIN_VARIANTS}–${MAX_VARIANTS} variants in one ad set`}
            />
          </div>
          {isAbTest && (
            <p className="text-xs text-slate-400">
              Each variant is a single-image ad sharing the same audience, schedule, and destination URL. Meta serves them in rotation and you compare performance after a few days.
            </p>
          )}
        </div>

        {/* Ad Type toggle — only relevant in single-ad mode */}
        {!isAbTest && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Ad Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <AdTypeOption
                value="image"
                current={form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "IMAGE" ? "image" : form.ad.format === "CAROUSEL" ? "CAROUSEL" : "video"}
                onClick={() => { setMediaType("IMAGE"); setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO" } })); }}
                icon={<Square className="w-4 h-4" />}
                label="Single Image"
                hint="One image, one link"
              />
              <AdTypeOption
                value="CAROUSEL"
                current={form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "IMAGE" ? "image" : form.ad.format === "CAROUSEL" ? "CAROUSEL" : "video"}
                onClick={() => setForm((f) => ({ ...f, ad: { ...f.ad, format: "CAROUSEL" } }))}
                icon={<Layers className="w-4 h-4" />}
                label="Carousel"
                hint={`${MIN_CAROUSEL_CARDS}–${MAX_CAROUSEL_CARDS} swipeable cards`}
              />
              <AdTypeOption
                value="video"
                current={form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "IMAGE" ? "image" : form.ad.format === "CAROUSEL" ? "CAROUSEL" : "video"}
                onClick={() => { setMediaType("VIDEO"); setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO" } })); }}
                icon={<Film className="w-4 h-4" />}
                label="Video"
                hint="One video creative"
              />
            </div>
          </div>
        )}
        </FormSection>

        <FormSection title="Ad Content" description="Provide the text, links, and media for your ad." icon={FileText}>
        {/* In AB_TEST mode the existing shared/single/carousel/video sections
            are hidden — each variant brings its own creative below. */}
        {!isAbTest && (
        <>
        {/* Shared across both ad types — Primary Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" /> Primary Text <RequiredMark />
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {(form.ad.primaryTexts[0] || "").length}/{TEXT_MAX}
            </span>
          </div>
          <textarea
            value={(form.ad.primaryTexts[0] || "")}
            onChange={(e) =>
              setForm((f) => ({ ...f, ad: { ...f.ad, primaryTexts: [e.target.value.slice(0, TEXT_MAX)] } }))
            }
            placeholder="Check out our amazing summer discounts! Up to 50% off on all items."
            rows={3}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200",
              adTextRequiredMiss && "border-rose-300"
            )}
          />
          {adTextRequiredMiss && <FieldError message="Primary text is required." />}
          {isCarousel && (
            <p className="text-xs text-slate-400">
              Shown above the carousel — applies to all cards.
            </p>
          )}
        </div>

        {/* Shared — CTA */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
            <MousePointerClick className="w-3.5 h-3.5" /> Call-to-action button
          </label>
          <Select
            value={form.ad.callToAction}
            onValueChange={(v) => setForm((f) => ({ ...f, ad: { ...f.ad, callToAction: v as CtaButton as any } }))}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
              <SelectValue placeholder="Pick a CTA" />
            </SelectTrigger>
            <SelectContent>
              {CTA_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">
            {isCarousel
              ? "The same button renders on every card."
              : "The clickable button under your ad."}
          </p>
        </div>

        {/* Single image fields */}
        {!isCarousel && (
          <>
            {/* Headline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" /> Headline <RequiredMark />
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(form.ad.headlines[0] || "").length}/{HEADLINE_MAX}
                </span>
              </div>
              <Input
                value={(form.ad.headlines[0] || "")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    adHeadline: e.target.value.slice(0, HEADLINE_MAX),
                  }))
                }
                placeholder="e.g. Huge Summer Sale!"
                className={cn(
                  "h-11 rounded-xl border-slate-200",
                  adHeadlineRequiredMiss && "border-rose-300"
                )}
              />
              {adHeadlineRequiredMiss && <FieldError message="Headline is required." />}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" /> Description
                  <span className="text-[10px] text-slate-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(form.ad.descriptions[0] || "").length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <Input
                value={(form.ad.descriptions[0] || "")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value.slice(0, DESCRIPTION_MAX),
                  }))
                }
                placeholder="e.g. Free shipping on all orders"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            {/* Destination URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" /> Destination URL <RequiredMark />
              </label>
              <Input
                type="url"
                value={form.ad.websiteUrl}
                onChange={(e) => setForm((f) => ({ ...f, ad: { ...f.ad, websiteUrl: e.target.value } }))}
                placeholder="https://www.yourwebsite.com/sale"
                className={cn(
                  "h-11 rounded-xl border-slate-200",
                  (adLinkRequiredMiss || adLinkUrlInvalid) && "border-rose-300"
                )}
              />
              {adLinkRequiredMiss && <FieldError message="Destination URL is required." />}
              {!adLinkRequiredMiss && adLinkUrlInvalid && (
                <FieldError message="Enter a full URL starting with http:// or https://" />
              )}
            </div>

            {/* Media — Image for SINGLE_IMAGE, Video+Thumbnail+Captions for VIDEO */}
            {isVideo ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <Film className="w-3.5 h-3.5" /> Video <RequiredMark />
                  </label>
                  <VideoSlot
                    videoUrl={(form.ad.videos[0] || "")}
                    isUploading={uploadingFor === "video"}
                    progress={progress}
                    onUploadClick={() => triggerUpload("video")}
                    onClear={() => setForm((f) => ({ ...f, ad: { ...f.ad, videos: [""] } }))}
                    onUrlChange={(v) => setForm((f) => ({ ...f, ad: { ...f.ad, videos: [v] } }))}
                    hasError={videoUrlRequiredMiss || videoUrlInvalid}
                  />
                  {videoUrlRequiredMiss && <FieldError message="Video is required." />}
                  {!videoUrlRequiredMiss && videoUrlInvalid && (
                    <FieldError message="Enter a full URL starting with http:// or https://" />
                  )}
                  <p className="text-xs text-slate-400">
                    Backend uploads the video to Meta's <code className="font-mono text-[10px]">/advideos</code> library, then references it in the ad creative. Supports MP4, MOV, M4V, WebM.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" /> Thumbnail
                    <span className="text-[10px] text-slate-400 font-normal normal-case">
                      (optional)
                    </span>
                  </label>
                  <ImageSlot
                    imageUrl={form.ad.videoThumbnailUrl || ""}
                    isUploading={uploadingFor === "video-thumb"}
                    progress={progress}
                    onUploadClick={() => triggerUpload("video-thumb")}
                    onClear={() => setForm((f) => ({ ...f, ad: { ...f.ad, videoThumbnailUrl: "" } }))}
                    onUrlChange={(v) => setForm((f) => ({ ...f, ad: { ...f.ad, videoThumbnailUrl: v } }))}
                    hasError={videoThumbUrlInvalid}
                  />
                  {videoThumbUrlInvalid && (
                    <FieldError message="Enter a full URL starting with http:// or https://" />
                  )}
                  <p className="text-xs text-slate-400">
                    Poster frame shown before the video plays. If omitted, Meta auto-generates one.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" /> Captions
                    <span className="text-[10px] text-slate-400 font-normal normal-case">
                      (optional)
                    </span>
                  </label>
                  <CaptionsSlot
                    captionsUrl={form.ad.captionsUrl || ""}
                    isUploading={uploadingFor === "captions"}
                    progress={progress}
                    onUploadClick={() => triggerUpload("captions")}
                    onClear={() => setForm((f) => ({ ...f, ad: { ...f.ad, captionsUrl: "" } }))}
                    onUrlChange={(v) => setForm((f) => ({ ...f, ad: { ...f.ad, captionsUrl: v } }))}
                    hasError={captionsUrlInvalid}
                  />
                  {captionsUrlInvalid && (
                    <FieldError message="Enter a full URL starting with http:// or https://" />
                  )}
                  <p className="text-xs text-slate-400">
                    Upload a <code className="font-mono text-[10px]">.srt</code> or <code className="font-mono text-[10px]">.vtt</code> file. 85% of Facebook video views happen with sound off — captions matter.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Ad Image <RequiredMark />
                </label>
                <ImageSlot
                  imageUrl={(form.ad.images[0] || "")}
                  isUploading={uploadingFor === "main"}
                  progress={progress}
                  onUploadClick={() => triggerUpload("main")}
                  onClear={() => setForm((f) => ({ ...f, ad: { ...f.ad, images: [""] } }))}
                  onUrlChange={(v) => setForm((f) => ({ ...f, ad: { ...f.ad, images: [v] } }))}
                  largeDropzone
                  hasError={imageUrlRequiredMiss || imageUrlInvalid}
                />
                {imageUrlRequiredMiss && <FieldError message="Ad image is required." />}
                {!imageUrlRequiredMiss && imageUrlInvalid && (
                  <FieldError message="Enter a full URL starting with http:// or https://" />
                )}
              </div>
            )}
          </>
        )}

        {/* Carousel cards */}
        {isCarousel && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> Carousel Cards
              </label>
              <span
                className={
                  form.ad.carouselCards.length >= MAX_CAROUSEL_CARDS
                    ? "text-[10px] font-bold text-amber-600 font-mono"
                    : "text-[10px] font-mono text-slate-400"
                }
              >
                {form.ad.carouselCards.length} / {MAX_CAROUSEL_CARDS}
              </span>
            </div>

            <div className="space-y-3">
              {form.ad.carouselCards.map((card, idx) => {
                const canRemove = form.ad.carouselCards.length > MIN_CAROUSEL_CARDS;
                const cardImageMiss = showAllErrors && !card.imageUrl.trim();
                const cardImageBadUrl = urlInvalid(card.imageUrl);
                const cardLinkMiss = showAllErrors && !card.link.trim();
                const cardLinkBadUrl = urlInvalid(card.link);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                        Card {idx + 1}
                        {idx === 0 && (
                          <span className="ml-2 text-[10px] font-medium normal-case text-slate-400">
                            (thumbnail in feed previews)
                          </span>
                        )}
                      </span>
                      {canRemove && (
                        <button
                          type="button"
                          onClick={() => removeCard(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                          title="Remove card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <ImageSlot
                      imageUrl={card.imageUrl}
                      isUploading={uploadingFor === `card-${idx}`}
                      progress={progress}
                      onUploadClick={() => triggerUpload(`card-${idx}`)}
                      onClear={() => updateCard(idx, { imageUrl: "" })}
                      onUrlChange={(v) => updateCard(idx, { imageUrl: v })}
                      hasError={cardImageMiss || cardImageBadUrl}
                    />
                    {cardImageMiss && <FieldError message="Card image is required." />}
                    {!cardImageMiss && cardImageBadUrl && (
                      <FieldError message="Enter a full URL starting with http:// or https://" />
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Headline (optional)
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(card.headline ?? "").length}/{CARD_HEADLINE_MAX}
                          </span>
                        </div>
                        <Input
                          value={card.headline ?? ""}
                          onChange={(e) =>
                            updateCard(idx, {
                              headline: e.target.value.slice(0, CARD_HEADLINE_MAX),
                            })
                          }
                          placeholder="e.g. Limited Edition"
                          className="h-10 rounded-xl border-slate-200 mt-1"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Description (optional)
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(card.description ?? "").length}/{CARD_DESCRIPTION_MAX}
                          </span>
                        </div>
                        <Input
                          value={card.description ?? ""}
                          onChange={(e) =>
                            updateCard(idx, {
                              description: e.target.value.slice(0, CARD_DESCRIPTION_MAX),
                            })
                          }
                          placeholder="e.g. Just $19.99"
                          className="h-10 rounded-xl border-slate-200 mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> Destination URL <RequiredMark />
                      </label>
                      <Input
                        type="url"
                        value={card.link}
                        onChange={(e) => updateCard(idx, { link: e.target.value })}
                        placeholder="https://www.yourwebsite.com/product"
                        className={cn(
                          "h-10 rounded-xl border-slate-200 mt-1",
                          (cardLinkMiss || cardLinkBadUrl) && "border-rose-300"
                        )}
                      />
                      {cardLinkMiss && (
                        <p className="text-[11px] text-rose-600 mt-1">Destination URL is required.</p>
                      )}
                      {!cardLinkMiss && cardLinkBadUrl && (
                        <p className="text-[11px] text-rose-600 mt-1">
                          Enter a full URL starting with http:// or https://
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addCard}
              disabled={form.ad.carouselCards.length >= MAX_CAROUSEL_CARDS}
              className="w-full h-11 rounded-xl border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add card
            </Button>

            <p className="text-xs text-slate-400">
              Minimum {MIN_CAROUSEL_CARDS} cards, maximum {MAX_CAROUSEL_CARDS}. Each
              card needs an image and a destination URL. Headlines and descriptions are
              optional; they fall back to the ad-level values.
            </p>
          </div>
        )}
        </>
        )}

        {/* A/B test variant editor — shown when publishMode === AB_TEST */}
        {isAbTest && (
          <>
            {/* Shared Destination URL — same for every variant */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" /> Destination URL <RequiredMark />
                <span className="text-[10px] text-slate-400 font-normal normal-case">
                  (shared across all variants)
                </span>
              </label>
              <Input
                type="url"
                value={form.ad.websiteUrl}
                onChange={(e) => setForm((f) => ({ ...f, ad: { ...f.ad, websiteUrl: e.target.value } }))}
                placeholder="https://www.yourwebsite.com/sale"
                className={cn(
                  "h-11 rounded-xl border-slate-200",
                  (!form.ad.websiteUrl.trim() || abTestUrlInvalid) && "border-rose-300"
                )}
              />
              {!form.ad.websiteUrl.trim() && (
                <FieldError message="Required — every variant clicks through to this URL." />
              )}
              {form.ad.websiteUrl.trim() && abTestUrlInvalid && (
                <FieldError message="Enter a full URL starting with http:// or https://" />
              )}
            </div>

            {/* Variant list */}
            <div className="space-y-3">
              {(() => {
                const incomplete = form.ad.adVariants
                  .map((v, i) => {
                    const missing: string[] = [];
                    if (!v.imageUrl.trim()) missing.push("image");
                    if (!v.adHeadline.trim()) missing.push("headline");
                    if (!v.adText.trim()) missing.push("primary text");
                    return missing.length
                      ? { label: String.fromCharCode(65 + i), missing }
                      : null;
                  })
                  .filter((x): x is { label: string; missing: string[] } => x !== null);
                if (incomplete.length === 0) return null;
                return (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">Variants need finishing:</span>{" "}
                      {incomplete
                        .map((v) => `${v.label} (${v.missing.join(", ")})`)
                        .join(" · ")}
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Ad Variants
                </label>
                <span
                  className={
                    form.ad.adVariants.length >= MAX_VARIANTS
                      ? "text-[10px] font-bold text-amber-600 font-mono"
                      : "text-[10px] font-mono text-slate-400"
                  }
                >
                  {form.ad.adVariants.length} / {MAX_VARIANTS}
                </span>
              </div>

              <div className="space-y-3">
                {form.ad.adVariants.map((variant, idx) => {
                  const canRemoveVariant = form.ad.adVariants.length > MIN_VARIANTS;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                          Variant {String.fromCharCode(65 + idx)}
                        </span>
                        {canRemoveVariant && (
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                            title="Remove variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <ImageSlot
                        imageUrl={variant.imageUrl}
                        isUploading={uploadingFor === `variant-${idx}`}
                        progress={progress}
                        onUploadClick={() => triggerUpload(`variant-${idx}`)}
                        onClear={() => updateVariant(idx, { imageUrl: "" })}
                        onUrlChange={(v) => updateVariant(idx, { imageUrl: v })}
                      />

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                            Headline <RequiredMark />
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {variant.adHeadline.length}/{HEADLINE_MAX}
                          </span>
                        </div>
                        <Input
                          value={variant.adHeadline}
                          onChange={(e) =>
                            updateVariant(idx, {
                              adHeadline: e.target.value.slice(0, HEADLINE_MAX),
                            })
                          }
                          placeholder="e.g. Huge Summer Sale!"
                          className="h-10 rounded-xl border-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                            Primary Text <RequiredMark />
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {variant.adText.length}/{TEXT_MAX}
                          </span>
                        </div>
                        <textarea
                          value={variant.adText}
                          onChange={(e) =>
                            updateVariant(idx, {
                              adText: e.target.value.slice(0, TEXT_MAX),
                            })
                          }
                          placeholder="What makes this variant different?"
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              Description (optional)
                            </label>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {(variant.description ?? "").length}/{DESCRIPTION_MAX}
                            </span>
                          </div>
                          <Input
                            value={variant.description ?? ""}
                            onChange={(e) =>
                              updateVariant(idx, {
                                description: e.target.value.slice(0, DESCRIPTION_MAX),
                              })
                            }
                            placeholder="e.g. Free shipping"
                            className="h-10 rounded-xl border-slate-200 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3" /> CTA
                          </label>
                          <Select
                            value={variant.ctaButton}
                            onValueChange={(v) =>
                              updateVariant(idx, { ctaButton: v as CtaButton })
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CTA_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                disabled={form.ad.adVariants.length >= MAX_VARIANTS}
                className="w-full h-11 rounded-xl border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add variant
              </Button>

              <p className="text-xs text-slate-400">
                Minimum {MIN_VARIANTS} variants, maximum {MAX_VARIANTS}. Each variant needs
                an image, headline, and primary text. Meta serves all variants in rotation
                under the same ad set.
              </p>
            </div>
          </>
        )}

        {/* Single shared file input — `accept` is set dynamically by triggerUpload */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileInputChange}
        />
        </FormSection>
      </div>
    </Card>
  );
}

/* ---------- Helpers ---------- */

function PublishModeOption({
  value,
  current,
  onClick,
  icon,
  label,
  hint,
}: {
  value: PublishMode;
  current: PublishMode;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-3 rounded-xl border text-left transition-all flex flex-col gap-1",
        isActive
          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className={cn("text-[10px]", isActive ? "text-slate-300" : "text-slate-400")}>
        {hint}
      </span>
    </button>
  );
}

function AdTypeOption({
  value,
  current,
  onClick,
  icon,
  label,
  hint,
  disabled,
}: {
  value: string;
  current: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-3 rounded-xl border text-left transition-all flex flex-col gap-1",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled && isActive
          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
          : !disabled
            ? "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            : "bg-white text-slate-500 border-slate-200"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span
        className={cn(
          "text-[10px]",
          !disabled && isActive ? "text-slate-300" : "text-slate-400"
        )}
      >
        {hint}
      </span>
    </button>
  );
}

function ImageSlot({
  imageUrl,
  isUploading,
  progress,
  onUploadClick,
  onClear,
  onUrlChange,
  largeDropzone,
  hasError,
}: {
  imageUrl: string;
  isUploading: boolean;
  progress: number;
  onUploadClick: () => void;
  onClear: () => void;
  onUrlChange: (v: string) => void;
  largeDropzone?: boolean;
  hasError?: boolean;
}) {
  if (imageUrl) {
    return (
      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
        <img
          src={imageUrl}
          alt="Ad preview"
          className={cn(
            "w-full object-contain",
            largeDropzone ? "max-h-72" : "max-h-48"
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-slate-100 gap-2">
          <span className="text-xs text-slate-500 font-mono truncate flex-1">
            {imageUrl}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClear}
            className="h-7 text-xs shrink-0"
          >
            Replace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className={cn(
          "w-full border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50",
          largeDropzone ? "p-8" : "p-5",
          hasError && "border-rose-300"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-700">
              Uploading… {progress}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className={largeDropzone ? "w-8 h-8 text-slate-400" : "w-5 h-5 text-slate-400"} />
            <span className={cn("font-semibold text-slate-700", largeDropzone ? "text-sm" : "text-xs")}>
              Click to upload an image
            </span>
            {largeDropzone && (
              <span className="text-xs text-slate-400">PNG, JPG, or WebP</span>
            )}
          </div>
        )}
      </button>
      <Input
        type="url"
        value={imageUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="or paste a public image URL"
        className={cn(
          "h-10 rounded-xl border-slate-200 text-xs",
          hasError && "border-rose-300"
        )}
      />
    </div>
  );
}

function VideoSlot({
  videoUrl,
  isUploading,
  progress,
  onUploadClick,
  onClear,
  onUrlChange,
  hasError,
}: {
  videoUrl: string;
  isUploading: boolean;
  progress: number;
  onUploadClick: () => void;
  onClear: () => void;
  onUrlChange: (v: string) => void;
  hasError?: boolean;
}) {
  if (videoUrl) {
    return (
      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
        <video
          src={videoUrl}
          controls
          preload="metadata"
          className="w-full max-h-72 bg-black"
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = "none";
          }}
        />
        <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-slate-100 gap-2">
          <span className="text-xs text-slate-500 font-mono truncate flex-1">
            {videoUrl}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClear}
            className="h-7 text-xs shrink-0"
          >
            Replace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className={cn(
          "w-full border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 p-8",
          hasError && "border-rose-300"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
            <span className="text-sm font-semibold text-slate-700">
              Uploading… {progress}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Film className="w-8 h-8 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Click to upload a video
            </span>
            <span className="text-xs text-slate-400">MP4, MOV, M4V, or WebM</span>
          </div>
        )}
      </button>
      <Input
        type="url"
        value={videoUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="or paste a public video URL"
        className={cn(
          "h-10 rounded-xl border-slate-200 text-xs",
          hasError && "border-rose-300"
        )}
      />
    </div>
  );
}

function CaptionsSlot({
  captionsUrl,
  isUploading,
  progress,
  onUploadClick,
  onClear,
  onUrlChange,
  hasError,
}: {
  captionsUrl: string;
  isUploading: boolean;
  progress: number;
  onUploadClick: () => void;
  onClear: () => void;
  onUrlChange: (v: string) => void;
  hasError?: boolean;
}) {
  if (captionsUrl) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center gap-3">
        <Type className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-500 font-mono truncate flex-1">
          {captionsUrl}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onClear}
          className="h-7 text-xs shrink-0"
        >
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className={cn(
          "w-full border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 p-5",
          hasError && "border-rose-300"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-700">
              Uploading… {progress}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">
              Click to upload a captions file
            </span>
            <span className="text-[10px] text-slate-400">.srt or .vtt</span>
          </div>
        )}
      </button>
      <Input
        type="url"
        value={captionsUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="or paste a public .srt/.vtt URL"
        className={cn(
          "h-10 rounded-xl border-slate-200 text-xs",
          hasError && "border-rose-300"
        )}
      />
    </div>
  );
}
