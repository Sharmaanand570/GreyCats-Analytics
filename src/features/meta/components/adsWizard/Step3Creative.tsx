import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  Trash2,
  AlertCircle,
  Info,
  LayoutGrid,
  FileText,
  UserSquare,
  Users,
  Languages as LanguagesIcon,
  Calendar,
  BarChart3,
  Tag,
  Globe,
  ExternalLink,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  X,
  Edit2,
  Sliders,
  Contrast,
  Play,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useMetaAccounts } from "@/features/meta/hooks/useMetaData";
import { AdCreativeLivePreview } from "./AdCreativeLivePreview";
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
  | `card-video-${number}`
  | `variant-${number}`;

const isVideoFile = (file: File) =>
  file.type.startsWith("video/") ||
  /\.(mp4|mov|m4v|webm)$/i.test(file.name);
const isCaptionsFile = (file: File) =>
  /\.(srt|vtt)$/i.test(file.name) || file.type === "text/vtt" || file.type === "application/x-subrip";

const MOCK_ACCOUNT_IMAGES = [
  { url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500", name: "untitled", size: "1440 × 628" }
];

const MOCK_INSTAGRAM_IMAGES = [
  { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", name: "dual_gummies", size: "1350 × 1688" },
  { url: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500", name: "golden_vape", size: "1350 × 1687" },
  { url: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500", name: "pure_nostalgia", size: "1350 × 1688" },
  { url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500", name: "orange_vape", size: "1350 × 1688" },
  { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500", name: "electric_blue", size: "1328 × 2360" },
  { url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500", name: "pink_gummies", size: "1350 × 1687" },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500", name: "summer_beach", size: "1328 × 2360" },
  { url: "https://images.unsplash.com/photo-1471897458574-0f3851804949?w=500", name: "product_aesthetic", size: "1350 × 1687" },
  { url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500", name: "yellow_abstract", size: "1170 × 2080" },
  { url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500", name: "berry_supplement", size: "1350 × 1688" },
];

const MOCK_PAGE_IMAGES = [
  { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", name: "dual_gummies", size: "1350 × 1688" },
  { url: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500", name: "golden_vape", size: "1350 × 1687" },
  { url: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500", name: "pure_nostalgia", size: "1350 × 1688" },
  { url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500", name: "orange_vape", size: "1350 × 1688" },
  { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500", name: "electric_blue", size: "1328 × 2360" },
  { url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500", name: "pink_gummies", size: "1350 × 1687" },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500", name: "summer_beach", size: "1328 × 2360" },
  { url: "https://images.unsplash.com/photo-1471897458574-0f3851804949?w=500", name: "product_aesthetic", size: "1350 × 1687" },
  { url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500", name: "yellow_abstract", size: "1170 × 2080" },
  { url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500", name: "berry_supplement", size: "1350 × 1688" },
];

type Step3Props = StepProps & { showAllErrors?: boolean; clientId?: number | null };

export function Step3Creative({ form, setForm, showAllErrors, clientId }: Step3Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFor, setUploadingFor] = useState<UploadTarget | null>(null);
  const [progress, setProgress] = useState(0);
  // Pulled here so the Identity card can show the Facebook Page dropdown.
  const { data: accountsData } = useMetaAccounts((clientId ?? 0) as number);
  const pages = accountsData?.pages ?? [];
  // We share one hidden <input type="file"> across all upload sites — the
  // currently-clicked target is stashed here so we know where the resulting URL belongs.
  const pendingTargetRef = useRef<UploadTarget | null>(null);

  // Currently-selected carousel card in Meta's "Select a card to edit" picker.
  // Clamped on render so removing cards never leaves it pointing past the end.
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);



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
    const isVideoTarget =
      target === "video" ||
      (typeof target === "string" && target.startsWith("card-video-"));
    if (isVideoTarget && !isVideoFile(file)) {
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
      (typeof target === "string" &&
        ((target.startsWith("card-") && !target.startsWith("card-video-")) ||
          target.startsWith("variant-")));
    if (isImageTarget && !file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    // Pre-flight size check. The backend / Meta will reject oversize uploads
    // anyway — failing here saves a long progress bar that ends in a 4xx.
    const cap =
      isVideoTarget
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
        if (showMediaLibrary) {
          setSelectedLibraryImage(url);
        }
      } else if (target === "video") {
        setForm((f) => ({ ...f, ad: { ...f.ad, videos: [url] } }));
        if (showMediaLibrary) {
          setSelectedLibraryImage(url);
        }
      } else if (target === "video-thumb") {
        setForm((f) => ({ ...f, ad: { ...f.ad, videoThumbnailUrl: url } }));
      } else if (target === "captions") {
        setForm((f) => ({ ...f, ad: { ...f.ad, captionsUrl: url } }));
      } else if (typeof target === "string" && target.startsWith("card-video-")) {
        const idx = Number(target.slice("card-video-".length));
        setForm((f) => ({
          ...f,
          ad: {
            ...f.ad,
            carouselCards: f.ad.carouselCards.map((c, i) =>
              i === idx ? { ...c, videoUrl: url } : c
            ),
          },
        }));
      } else if (typeof target === "string" && target.startsWith("card-")) {
        const idx = Number(target.slice("card-".length));
        setForm((f) => ({
          ...f,
          ad: {
            ...f.ad,
            carouselCards: f.ad.carouselCards.map((c, i) =>
              i === idx ? { ...c, imageUrl: url } : c
            ),
          },
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
  const addCard = (mediaType: "IMAGE" | "VIDEO" = "IMAGE") =>
    setForm((f) => {
      if (f.ad.carouselCards.length >= MAX_CAROUSEL_CARDS) return f;
      return {
        ...f,
        ad: {
          ...f.ad,
          carouselCards: [...f.ad.carouselCards, blankCarouselCard(mediaType)],
        },
      };
    });

  const removeCard = (idx: number) =>
    setForm((f) => ({
      ...f,
      ad: {
        ...f.ad,
        carouselCards: f.ad.carouselCards.filter((_, i) => i !== idx),
      },
    }));

  const updateCard = (idx: number, patch: Partial<CarouselCard>) =>
    setForm((f) => ({
      ...f,
      ad: {
        ...f.ad,
        carouselCards: f.ad.carouselCards.map((c, i) =>
          i === idx ? { ...c, ...patch } : c
        ),
      },
    }));

  const isCarousel = form.ad.format === "CAROUSEL";
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const isVideo = form.ad.format === "SINGLE_IMAGE_VIDEO" && mediaType === "VIDEO";
  const isAbTest = form.ad.publishMode === "AB_TEST";
  const isAwareness = form.campaign.objective === "OUTCOME_AWARENESS";

  // Auto-default to Carousel format for Awareness campaigns
  useEffect(() => {
    if (isAwareness && form.ad.format !== "CAROUSEL" && form.ad.publishMode !== "AB_TEST") {
      setForm((f) => ({ ...f, ad: { ...f.ad, format: "CAROUSEL" } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAwareness]);

  // Creative test setup modal states
  const [showTestSetup, setShowTestSetup] = useState(false);
  const [testAdsCount, setTestAdsCount] = useState(2);
  const [testAdsBudget, setTestAdsBudget] = useState(200);
  const [testAdsDuration, setTestAdsDuration] = useState("7 days");
  const [testAdsMetric, setTestAdsMetric] = useState("Cost per purchase");

  // Media Selector Modal states
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedLibraryImage, setSelectedLibraryImage] = useState<string | null>(null);
  const [activeLibraryTab, setActiveLibraryTab] = useState<"all" | "account" | "instagram" | "page">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaSetupMode, setMediaSetupMode] = useState<"MANUAL" | "CATALOGUE">("MANUAL");
  const [showAdSetupAdvanced, setShowAdSetupAdvanced] = useState(false);
  const [useDisplayLink, setUseDisplayLink] = useState(!!form.ad.displayLink);

  // Carousel Card Media Library modal states (Awareness)
  const [showCarouselMediaModal, setShowCarouselMediaModal] = useState(false);
  const [carouselMediaModalType, setCarouselMediaModalType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [selectedCarouselLibraryImages, setSelectedCarouselLibraryImages] = useState<string[]>([]);
  const [activeCarouselLibraryTab, setActiveCarouselLibraryTab] = useState<"all" | "account" | "instagram" | "page">("all");
  const [carouselSearchQuery, setCarouselSearchQuery] = useState("");

  const handleConfirmTestSetup = () => {
    // Generate copied variants from original ad
    const baseVariant: AdVariant = {
      adHeadline: form.ad.headlines[0] || "",
      adText: form.ad.primaryTexts[0] || "",
      description: form.ad.descriptions[0] || "",
      imageUrl: form.ad.images[0] || "",
      ctaButton: form.ad.callToAction || "LEARN_MORE",
    };
    
    // Create copies matching desired count
    const nextVariants: AdVariant[] = Array.from({ length: testAdsCount }, () => ({ ...baseVariant }));
    
    setForm((f) => ({
      ...f,
      ad: {
        ...f.ad,
        publishMode: "AB_TEST",
        adVariants: nextVariants,
        creativeTestingEnabled: true,
      }
    }));
    setShowTestSetup(false);
  };

  const handleCancelTestSetup = () => {
    setShowTestSetup(false);
  };

  const handleConfirmMedia = () => {
    if (!selectedLibraryImage) return;
    setForm((f) => {
      if (mediaType === "IMAGE") {
        return {
          ...f,
          ad: {
            ...f.ad,
            images: [selectedLibraryImage],
            videos: [""],
          },
        };
      } else {
        return {
          ...f,
          ad: {
            ...f.ad,
            videos: [selectedLibraryImage],
            images: [""],
          },
        };
      }
    });
    setShowMediaLibrary(false);
  };

  /** Opens the carousel card media picker for Awareness ads */
  const openCarouselMediaModal = (type: "IMAGE" | "VIDEO") => {
    setCarouselMediaModalType(type);
    setSelectedCarouselLibraryImages([]);
    setActiveCarouselLibraryTab("all");
    setCarouselSearchQuery("");
    setShowCarouselMediaModal(true);
  };

  const toggleCarouselImage = (url: string) => {
    setSelectedCarouselLibraryImages((prev) => {
      const remaining = MAX_CAROUSEL_CARDS - form.ad.carouselCards.length;
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (prev.length >= remaining) return prev; // cap at remaining slots
      return [...prev, url];
    });
  };

  const handleConfirmCarouselMedia = () => {
    if (selectedCarouselLibraryImages.length === 0) return;
    setForm((f) => {
      const newCards = selectedCarouselLibraryImages.map((url) => ({
        imageUrl: carouselMediaModalType === "IMAGE" ? url : "",
        videoUrl: carouselMediaModalType === "VIDEO" ? url : "",
        headline: "",
        description: "",
        link: "",
        mediaType: carouselMediaModalType,
      }));
      const merged = [...f.ad.carouselCards, ...newCards].slice(0, MAX_CAROUSEL_CARDS);
      return { ...f, ad: { ...f.ad, carouselCards: merged } };
    });
    setSelectedCardIdx(Math.max(0, form.ad.carouselCards.length));
    setShowCarouselMediaModal(false);
  };

  // Event modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [draftEvent, setDraftEvent] = useState<{
    title: string;
    timeMode: "START" | "END";
    startsAt?: string;
    endsAt?: string;
    notifications?: string;
  }>({
    title: "",
    timeMode: "START",
    notifications: "1 day before, 15 minutes before and at start time"
  });

  const openEventModal = () => {
    if (form.ad.eventDetails) {
      setDraftEvent({
        title: form.ad.eventDetails.title || "",
        timeMode: form.ad.eventDetails.timeMode || "START",
        startsAt: form.ad.eventDetails.startsAt,
        endsAt: form.ad.eventDetails.endsAt,
        notifications: form.ad.eventDetails.notifications || "1 day before, 15 minutes before and at start time",
      });
    } else {
      setDraftEvent({
        title: "",
        timeMode: "START",
        notifications: "1 day before, 15 minutes before and at start time",
      });
    }
    setShowEventModal(true);
  };

  const handleConfirmEvent = () => {
    setForm((f) => ({
      ...f,
      ad: {
        ...f.ad,
        eventDetails: {
          title: draftEvent.title,
          timeMode: draftEvent.timeMode,
          startsAt: draftEvent.timeMode === "START" ? draftEvent.startsAt : undefined,
          endsAt: draftEvent.timeMode === "END" ? draftEvent.endsAt : undefined,
          notifications: draftEvent.notifications,
        },
      },
    }));
    setShowEventModal(false);
  };

  // Field-level error flags. `showAllErrors` lights up everything required
  // when the user mashes Continue with empty fields; otherwise we only complain
  // about URLs the user typed that don't parse.
  const adTextRequiredMiss = showAllErrors && !(form.ad.primaryTexts[0] || "").trim();
  const adHeadlineRequiredMiss = !isAbTest && !isCarousel && showAllErrors && !(form.ad.headlines[0] || "").trim();
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 space-y-6">
        <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden bg-white">
      <div className="px-8 py-6 bg-white border-b border-slate-100 rounded-t-[24px]">
        <div className="flex items-center gap-2">
          <Contrast className="w-5 h-5 text-[#0062ff] fill-[#0062ff]/10" />
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Ad creative</h2>
        </div>
        <p className="text-[13px] text-slate-500 mt-1">
          Select and optimise your ad text, media and enhancements.
        </p>

        {/* Set up creative Dropdown */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={mediaType}
              onValueChange={(val) => {
                setMediaType(val as any);
                setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO", publishMode: "SINGLE_AD" } }));
                setSelectedLibraryImage(val === "IMAGE" ? form.ad.images[0] || null : form.ad.videos[0] || null);
                setShowMediaLibrary(true);
              }}
            >
              <SelectTrigger className="w-[180px] h-[36px] border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 bg-white rounded-lg shadow-sm flex items-center justify-between px-3 text-[13px] transition-colors">
                <SelectValue placeholder="Set up creative" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    Image ad
                  </span>
                </SelectItem>
                <SelectItem value="VIDEO">
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-slate-500 fill-slate-500" />
                    Video ad
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning box if no media is selected */}
          {((form.ad.format === "SINGLE_IMAGE_VIDEO" && !form.ad.images[0]?.trim() && !form.ad.videos[0]?.trim()) ||
            (form.ad.format === "CAROUSEL" && form.ad.carouselCards.every(card => !card.imageUrl.trim()))) && (
            <div className="mt-2.5 p-3 rounded-lg border border-slate-100 bg-[#f8fafc] flex items-center gap-2.5 animate-in fade-in duration-200">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <p className="text-[13px] font-medium text-slate-700">
                Please specify an image to run with this ad.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-2 divide-y divide-slate-100">

        {/* Ad name — top of Step 3 in Meta's UI */}
        <FormSection
          title="Ad name"
          description="A label for this ad. Won't be shown to people who see your ad."
          icon={Tag}
        >
          <div className="flex items-center gap-3">
            <Input
              value={form.ad.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, ad: { ...f.ad, name: e.target.value } }))
              }
              placeholder="New Ad"
              className="h-11 rounded-xl border-slate-200 bg-white flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 whitespace-nowrap"
            >
              Create template
            </Button>
          </div>
        </FormSection>

        {/* Partnership ad — toggle in the header right-slot */}
        <FormSection
          title="Partnership ad"
          description="Run ads with creators, brands and other businesses. These ads leverage signals from both profiles to improve campaign performance."
          icon={Users}
          rightSlot={
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {form.ad.isPartnershipAd ? "On" : "Off"}
              </span>
              <Switch
                checked={form.ad.isPartnershipAd}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ad: { ...f.ad, isPartnershipAd: e.target.checked },
                  }))
                }
              />
            </div>
          }
        >
          <p className="text-xs text-slate-500">
            <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              About partnership ads
            </a>
          </p>
          {form.ad.isPartnershipAd && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Partnership ad code
              </label>
              <Input
                value={form.ad.partnershipAdCode ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ad: { ...f.ad, partnershipAdCode: e.target.value },
                  }))
                }
                placeholder="Paste the code shared by the creator or brand"
                className="h-11 rounded-xl border-slate-200 bg-white"
              />
            </div>
          )}
        </FormSection>

        {/* Identity — Facebook Page (required), Instagram, Threads, Branding */}
        <FormSection
          title="Identity"
          description="The profiles and branding that will be used in your ad."
          icon={UserSquare}
        >
          {/* Facebook Page */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              <span className="text-rose-500">*</span> Facebook Page
            </label>
            <Select
              value={form.adSet.pageId ?? form.campaign.pageId ?? ""}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  campaign: { ...f.campaign, pageId: v },
                  adSet: { ...f.adSet, pageId: v },
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Select a Facebook Page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map((p) => (
                  <SelectItem key={p.pageId} value={p.pageId}>
                    <div className="flex items-center gap-2">
                      <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instagram profile */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-500" /> Instagram profile
            </label>
            <Select
              value={form.ad.instagramAccountId ?? "vapeguru"}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  ad: { ...f.ad, instagramAccountId: v === "none" ? undefined : v },
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Select an Instagram profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select an Instagram profile</SelectItem>
                <SelectItem value="vapeguru">
                  <div className="flex items-center gap-2">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                    <span>__vapeguru__</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Threads profile */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Threads profile
            </label>
            <div className="flex items-center gap-2">
              <Select
                value={form.ad.threadsProfileId ?? "none"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    ad: { ...f.ad, threadsProfileId: v === "none" ? undefined : v },
                  }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white flex-1">
                  <SelectValue placeholder="Select a Threads profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a Threads profile</SelectItem>
                  <SelectItem value="vapeguru">__vapeguru__</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-400">or</span>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 whitespace-nowrap"
              >
                Create profile
              </Button>
            </div>
          </div>

          {/* Branding callout matching Screenshot 1 */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
              Branding
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500">
              Set brand defaults for this ad and future ads.
            </p>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 shadow-sm mt-1">
              <span className="text-xs font-bold text-slate-600">Inactive</span>
              <Button variant="outline" className="h-9 px-3 rounded-lg border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50" disabled>
                Add branding
              </Button>
            </div>
          </div>
        </FormSection>

        <FormSection title="Ad setup" description="Select how you want to run this ad and what it should look like." icon={LayoutGrid}>
          {/* Create ad dropdown — Meta's static "Create ad" header */}
          <div className="space-y-2">
            <Select value="CREATE_AD" onValueChange={() => {}}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREATE_AD">Create ad</SelectItem>
                <SelectItem value="USE_EXISTING_POST">Use existing post</SelectItem>
                <SelectItem value="USE_CREATIVE_HUB_MOCKUP">Use Creative Hub mockup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media setup Radio select block */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Media setup
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMediaSetupMode("MANUAL")}
                className={cn(
                  "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                  mediaSetupMode === "MANUAL"
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                    mediaSetupMode === "MANUAL"
                      ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                      : "border-slate-300"
                  )}
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">Manual upload</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Choose images or videos to build your ad creative.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMediaSetupMode("CATALOGUE")}
                className={cn(
                  "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                  mediaSetupMode === "CATALOGUE"
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                    mediaSetupMode === "CATALOGUE"
                      ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                      : "border-slate-300"
                  )}
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Advantage+ catalogue ads
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Drive sales by showing relevant product media from your catalogue.{" "}
                    <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                      About Advantage+ catalogue ads
                    </a>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Format Selection Radio block */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Format
            </label>
            <p className="text-[11px] text-slate-500">
              Choose an ad creative layout.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMediaType("IMAGE");
                  setForm((f) => ({ ...f, ad: { ...f.ad, format: "SINGLE_IMAGE_VIDEO", publishMode: "SINGLE_AD" } }));
                }}
                className={cn(
                  "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                  form.ad.format === "SINGLE_IMAGE_VIDEO"
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                    form.ad.format === "SINGLE_IMAGE_VIDEO"
                      ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                      : "border-slate-300"
                  )}
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">Single image or video</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    One image or video, or a slideshow of multiple images.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, ad: { ...f.ad, format: "CAROUSEL", publishMode: "SINGLE_AD" } }))}
                className={cn(
                  "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                  form.ad.format === "CAROUSEL"
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                    form.ad.format === "CAROUSEL"
                      ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                      : "border-slate-300"
                  )}
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">Carousel</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Two or more scrollable images or videos.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Format selection has changed info warning block matching Screenshot 2 */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm mt-2">
            <Info className="w-4 h-4 shrink-0 text-slate-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">Format selection has changed</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Format display options in ad creative is the new way to show your ad in collection formats. You now have the flexibility to show your ad in multiple formats that you choose.{" "}
                <a className="font-bold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  About format display options.
                </a>
              </p>
            </div>
          </div>

          {/* Multi-advertiser ads */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-2">
            <Checkbox
              checked={!!form.ad.multiAdvertiserAds}
              onCheckedChange={(v) =>
                setForm((f) => ({
                  ...f,
                  ad: { ...f.ad, multiAdvertiserAds: !!v },
                }))
              }
              className="mt-0.5"
            />
            <div>
              <div className="text-sm font-bold text-slate-900">Multi-advertiser ads</div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Your ad can appear with others in the same ad unit to help promote discoverability. Your ad creative may be resized or cropped.{" "}
                <a className="text-blue-600 hover:underline font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                  About multi-advertiser ads
                </a>
              </p>
            </div>
          </label>

          {/* Collapsible Ad Setup settings */}
          <button
            type="button"
            onClick={() => setShowAdSetupAdvanced((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 mt-2"
          >
            {showAdSetupAdvanced ? "Hide settings" : "Show more settings"}
          </button>
        </FormSection>

        {/* Destination — High fidelity matching Screenshot 3 for Sales campaigns */}
        <FormSection
          title="Destination"
          description="Where you send people after they click your ad."
          icon={Globe}
        >
          <p className="text-xs text-slate-500">
            <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              About destinations
            </a>
          </p>

          {/* Main destination Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Main destination
            </label>
            <Select
              value={form.ad.destinationKind ?? "WEBSITE"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, ad: { ...f.ad, destinationKind: v as any } }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Select a destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="INSTANT_EXPERIENCE">Instant Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Website-specific fields */}
          {(form.ad.destinationKind ?? "WEBSITE") === "WEBSITE" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                  <span className="text-rose-500">*</span> Website URL
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={form.ad.websiteUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ad: { ...f.ad, websiteUrl: e.target.value } }))
                    }
                    placeholder="Enter the URL that people visit after your ad"
                    className={cn(
                      "h-11 rounded-xl border-slate-200 bg-white flex-1 text-sm placeholder:text-slate-400",
                      adLinkUrlInvalid && "border-rose-300"
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (form.ad.websiteUrl) {
                        window.open(form.ad.websiteUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    disabled={!form.ad.websiteUrl || adLinkUrlInvalid}
                    className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 whitespace-nowrap gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Preview URL
                  </Button>
                </div>
                {adLinkUrlInvalid && (
                  <FieldError message="Enter a full URL starting with http:// or https://" />
                )}

                {/* URL parameters moved-to-tracking callout matching Screenshot 3 */}
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm mt-1 animate-in fade-in duration-200">
                  <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      URL parameters have been moved to <span className="font-bold text-slate-800">Tracking</span>{" "}
                      so that you can manage them in one place.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("tracking-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Go to Tracking
                    </button>
                  </div>
                </div>
              </div>

              {/* Use a display link checkbox */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
                    checked={useDisplayLink}
                    onCheckedChange={(v) => {
                      setUseDisplayLink(!!v);
                      if (!v) {
                        setForm((f) => ({ ...f, ad: { ...f.ad, displayLink: undefined } }));
                      }
                    }}
                  />
                  <span className="text-sm font-semibold text-slate-700 select-none">
                    Use a display link
                  </span>
                </label>

                {useDisplayLink && (
                  <div className="space-y-2 pl-6 animate-in slide-in-from-top-1 duration-150">
                    <Input
                      value={form.ad.displayLink ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ad: { ...f.ad, displayLink: e.target.value } }))
                      }
                      placeholder="Enter the link that you want to show on your ad"
                      className="h-11 rounded-xl border-slate-200 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Personalised destinations widget */}
              <div className="space-y-3 pt-4 border-t border-slate-100 mt-2">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Personalised destinations
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Send people to the experience most likely to result in a conversion after they've clicked your ad.
                </p>
                <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50 shadow-sm mt-1">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">Turned off</span>
                    <p className="text-[11px] text-slate-500">
                      Optimise website destination, Browser add-ons
                    </p>
                  </div>
                  <Button variant="outline" className="h-9 px-3.5 rounded-lg border-slate-200 text-xs font-bold text-blue-600 hover:bg-slate-50 active:bg-slate-100 shadow-sm bg-white">
                    Edit
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Instant Experience picker */}
          {form.ad.destinationKind === "INSTANT_EXPERIENCE" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Instant Experience
              </label>
              <Input
                value={form.ad.instantExperienceId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ad: { ...f.ad, instantExperienceId: e.target.value },
                  }))
                }
                placeholder="Select or paste an Instant Experience ID"
                className="h-11 rounded-xl border-slate-200 bg-white"
              />
            </div>
          )}
        </FormSection>

        <FormSection title="Ad creative" description="Select and optimise your ad text, media and enhancements." icon={FileText}>

        {/* ── Awareness-specific creative block ── */}
        {isAwareness && !isAbTest && (() => {
          const cards = form.ad.carouselCards;
          const atMax = cards.length >= MAX_CAROUSEL_CARDS;
          const tooFew = cards.length < MIN_CAROUSEL_CARDS;
          const safeIdx = Math.min(selectedCardIdx, Math.max(cards.length - 1, 0));
          const card = cards[safeIdx];
          const canRemoveCard = cards.length > MIN_CAROUSEL_CARDS;
          const cardIsVideo = card?.mediaType === "VIDEO";
          const cardImageMissAw = !!card && showAllErrors && !card.imageUrl.trim() && !cardIsVideo;
          const cardImageBadUrlAw = !!card && urlInvalid(card.imageUrl);
          const cardVideoMissAw = !!card && showAllErrors && cardIsVideo && !(card.videoUrl ?? "").trim();
          const cardVideoBadUrlAw = !!card && urlInvalid(card.videoUrl ?? "");
          const cardLinkMissAw = !!card && showAllErrors && !card.link.trim();
          const cardLinkBadUrlAw = !!card && urlInvalid(card.link);
          return (
            <div className="space-y-4">
              {/* Header: cards counter */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Carousel cards
                  <Info className="w-3 h-3 text-slate-400" aria-hidden />
                </label>
                <p className="text-[12px] text-slate-500">
                  {cards.length} of {MAX_CAROUSEL_CARDS} cards added
                </p>
              </div>

              {/* "Add at least two cards" info banner */}
              {tooFew && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-[12px] text-slate-700">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  Add at least {MIN_CAROUSEL_CARDS} cards.
                </div>
              )}

              {/* Add cards split-dropdown + card selector */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={atMax}
                      className="h-10 rounded-lg border-slate-200 font-bold text-slate-700 px-3 gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add cards
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 bg-white">
                    <DropdownMenuItem
                      onSelect={() => {
                        if (atMax) return;
                        openCarouselMediaModal("IMAGE");
                      }}
                    >
                      <ImageIcon className="w-4 h-4 text-slate-500 mr-2" />
                      Add image cards
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        if (atMax) return;
                        openCarouselMediaModal("VIDEO");
                      }}
                    >
                      <Film className="w-4 h-4 text-slate-500 mr-2" />
                      Add video cards
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select
                  value={cards.length > 0 ? String(safeIdx) : ""}
                  onValueChange={(v) => setSelectedCardIdx(Number(v))}
                  disabled={cards.length === 0}
                >
                  <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white flex-1 text-[13px]">
                    <SelectValue placeholder="Select a card to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.map((c, idx) => (
                      <SelectItem key={idx} value={String(idx)}>
                        <span className="flex items-center gap-2">
                          {c.mediaType === "VIDEO" ? (
                            <Film className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          Card {idx + 1}
                          {idx === 0 && (
                            <span className="text-[10px] text-slate-400">(thumbnail)</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Map card checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={!!form.ad.showMapCard}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, ad: { ...f.ad, showMapCard: !!v } }))
                  }
                />
                <span className="text-[13px] text-slate-700 flex items-center gap-1.5">
                  Add a map card showing your business location
                  <Info className="w-3 h-3 text-slate-400" aria-hidden />
                </span>
              </label>

              {/* Per-card editor */}
              {card && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                      {cardIsVideo ? (
                        <Film className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      Card {safeIdx + 1}
                      {safeIdx === 0 && (
                        <span className="ml-1 text-[10px] font-medium normal-case text-slate-400">
                          (thumbnail in feed previews)
                        </span>
                      )}
                    </span>
                    {canRemoveCard && (
                      <button
                        type="button"
                        onClick={() => {
                          removeCard(safeIdx);
                          setSelectedCardIdx((i) => Math.max(0, Math.min(i, cards.length - 2)));
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {cardIsVideo ? (
                    <>
                      <VideoSlot
                        videoUrl={card.videoUrl ?? ""}
                        isUploading={uploadingFor === `card-video-${safeIdx}`}
                        progress={progress}
                        onUploadClick={() => triggerUpload(`card-video-${safeIdx}`)}
                        onClear={() => updateCard(safeIdx, { videoUrl: "" })}
                        onUrlChange={(v) => updateCard(safeIdx, { videoUrl: v })}
                        hasError={cardVideoMissAw || cardVideoBadUrlAw}
                      />
                      {cardVideoMissAw && <FieldError message="Card video is required." />}
                      {!cardVideoMissAw && cardVideoBadUrlAw && (
                        <FieldError message="Enter a full URL starting with http:// or https://" />
                      )}
                    </>
                  ) : (
                    <>
                      <ImageSlot
                        imageUrl={card.imageUrl}
                        isUploading={uploadingFor === `card-${safeIdx}`}
                        progress={progress}
                        onUploadClick={() => triggerUpload(`card-${safeIdx}`)}
                        onClear={() => updateCard(safeIdx, { imageUrl: "" })}
                        onUrlChange={(v) => updateCard(safeIdx, { imageUrl: v })}
                        hasError={cardImageMissAw || cardImageBadUrlAw}
                      />
                      {cardImageMissAw && <FieldError message="Card image is required." />}
                      {!cardImageMissAw && cardImageBadUrlAw && (
                        <FieldError message="Enter a full URL starting with http:// or https://" />
                      )}
                    </>
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
                          updateCard(safeIdx, { headline: e.target.value.slice(0, CARD_HEADLINE_MAX) })
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
                          updateCard(safeIdx, { description: e.target.value.slice(0, CARD_DESCRIPTION_MAX) })
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
                      onChange={(e) => updateCard(safeIdx, { link: e.target.value })}
                      placeholder="https://www.yourwebsite.com/product"
                      className={cn(
                        "h-10 rounded-xl border-slate-200 mt-1",
                        (cardLinkMissAw || cardLinkBadUrlAw) && "border-rose-300"
                      )}
                    />
                    {cardLinkMissAw && (
                      <p className="text-[11px] text-rose-600 mt-1">Destination URL is required.</p>
                    )}
                    {!cardLinkMissAw && cardLinkBadUrlAw && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        Enter a full URL starting with http:// or https://
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400">
                Minimum {MIN_CAROUSEL_CARDS} cards, maximum {MAX_CAROUSEL_CARDS}. Each card needs
                media and a destination URL.
              </p>

              {/* Primary Text */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
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
                  placeholder="Tell people what your ad is about"
                  rows={3}
                  className={cn(
                    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200",
                    adTextRequiredMiss && "border-rose-300"
                  )}
                />
                {adTextRequiredMiss && <FieldError message="Primary text is required." />}
                <p className="text-xs text-slate-400">Shown above the carousel — applies to all cards.</p>
              </div>

              {/* Call to action */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5" /> Call to action
                  <Info className="w-3 h-3 text-slate-400" aria-hidden />
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
                {form.ad.callToAction === "NO_BUTTON" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-700">
                    <Info className="w-4 h-4 text-slate-500 shrink-0" />
                    Your ads on Facebook, Instagram and WhatsApp will use the 'Learn more' call to action.
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">The same button renders on every card.</p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Required-fields callout (non-awareness) */}
        {!isAwareness && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            One of the following is required: image, video, website URL, template link, text or
            offer. Complete the fields to publish.
          </p>
        </div>
        )}
        {/* In AB_TEST mode the existing shared/single/carousel/video sections
            are hidden — each variant brings its own creative below. */}
        {!isAbTest && !isAwareness && (
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
            <Info className="w-3 h-3 text-slate-400" aria-hidden />
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
          {form.ad.callToAction === "NO_BUTTON" ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-700">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              Your ads on Facebook, Instagram and WhatsApp will use the 'Learn more' call to action.
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              {isCarousel
                ? "The same button renders on every card."
                : "The clickable button under your ad."}
            </p>
          )}
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

            {/* Destination URL moved to the Destination card above. */}

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

        {/* Carousel cards — Meta-parity: header counter, empty-state banner,
            "Add cards" split dropdown, "Select a card to edit" picker, and a
            single editor for the selected card (image or video). */}
        {isCarousel && (() => {
          const cards = form.ad.carouselCards;
          const atMax = cards.length >= MAX_CAROUSEL_CARDS;
          const tooFew = cards.length < MIN_CAROUSEL_CARDS;
          // Clamp on render so removals never strand the picker on a missing index.
          const safeIdx = Math.min(selectedCardIdx, Math.max(cards.length - 1, 0));
          const card = cards[safeIdx];
          const canRemove = cards.length > MIN_CAROUSEL_CARDS;
          const cardIsVideo = card?.mediaType === "VIDEO";
          const cardImageMiss = !!card && showAllErrors && !card.imageUrl.trim() && !cardIsVideo;
          const cardImageBadUrl = !!card && urlInvalid(card.imageUrl);
          const cardVideoMiss = !!card && showAllErrors && cardIsVideo && !(card.videoUrl ?? "").trim();
          const cardVideoBadUrl = !!card && urlInvalid(card.videoUrl ?? "");
          const cardLinkMiss = !!card && showAllErrors && !card.link.trim();
          const cardLinkBadUrl = !!card && urlInvalid(card.link);
          return (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Carousel cards
                  <Info className="w-3 h-3 text-slate-400" aria-hidden />
                </label>
                <p className="text-[12px] text-slate-500">
                  {cards.length} of {MAX_CAROUSEL_CARDS} cards added
                </p>
              </div>

              {tooFew && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-[12px] text-slate-700">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  Add at least {MIN_CAROUSEL_CARDS} cards.
                </div>
              )}

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={atMax}
                      className="h-10 rounded-lg border-slate-200 font-bold text-slate-700 px-3 gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add cards
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 bg-white">
                    <DropdownMenuItem
                      onSelect={() => {
                        if (atMax) return;
                        addCard("IMAGE");
                        setSelectedCardIdx(cards.length);
                      }}
                    >
                      <ImageIcon className="w-4 h-4 text-slate-500 mr-2" />
                      Add image cards
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        if (atMax) return;
                        addCard("VIDEO");
                        setSelectedCardIdx(cards.length);
                      }}
                    >
                      <Film className="w-4 h-4 text-slate-500 mr-2" />
                      Add video cards
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select
                  value={cards.length > 0 ? String(safeIdx) : ""}
                  onValueChange={(v) => setSelectedCardIdx(Number(v))}
                  disabled={cards.length === 0}
                >
                  <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white flex-1 text-[13px]">
                    <SelectValue placeholder="Select a card to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.map((c, idx) => (
                      <SelectItem key={idx} value={String(idx)}>
                        <span className="flex items-center gap-2">
                          {c.mediaType === "VIDEO" ? (
                            <Film className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          Card {idx + 1}
                          {idx === 0 && (
                            <span className="text-[10px] text-slate-400">
                              (thumbnail)
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={!!form.ad.showMapCard}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, ad: { ...f.ad, showMapCard: !!v } }))
                  }
                />
                <span className="text-[13px] text-slate-700 flex items-center gap-1.5">
                  Add a map card showing your business location
                  <Info className="w-3 h-3 text-slate-400" aria-hidden />
                </span>
              </label>

              {card && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                      {cardIsVideo ? (
                        <Film className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      Card {safeIdx + 1}
                      {safeIdx === 0 && (
                        <span className="ml-1 text-[10px] font-medium normal-case text-slate-400">
                          (thumbnail in feed previews)
                        </span>
                      )}
                    </span>
                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => {
                          removeCard(safeIdx);
                          setSelectedCardIdx((i) => Math.max(0, Math.min(i, cards.length - 2)));
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {cardIsVideo ? (
                    <>
                      <VideoSlot
                        videoUrl={card.videoUrl ?? ""}
                        isUploading={uploadingFor === `card-video-${safeIdx}`}
                        progress={progress}
                        onUploadClick={() => triggerUpload(`card-video-${safeIdx}`)}
                        onClear={() => updateCard(safeIdx, { videoUrl: "" })}
                        onUrlChange={(v) => updateCard(safeIdx, { videoUrl: v })}
                        hasError={cardVideoMiss || cardVideoBadUrl}
                      />
                      {cardVideoMiss && <FieldError message="Card video is required." />}
                      {!cardVideoMiss && cardVideoBadUrl && (
                        <FieldError message="Enter a full URL starting with http:// or https://" />
                      )}
                    </>
                  ) : (
                    <>
                      <ImageSlot
                        imageUrl={card.imageUrl}
                        isUploading={uploadingFor === `card-${safeIdx}`}
                        progress={progress}
                        onUploadClick={() => triggerUpload(`card-${safeIdx}`)}
                        onClear={() => updateCard(safeIdx, { imageUrl: "" })}
                        onUrlChange={(v) => updateCard(safeIdx, { imageUrl: v })}
                        hasError={cardImageMiss || cardImageBadUrl}
                      />
                      {cardImageMiss && <FieldError message="Card image is required." />}
                      {!cardImageMiss && cardImageBadUrl && (
                        <FieldError message="Enter a full URL starting with http:// or https://" />
                      )}
                    </>
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
                          updateCard(safeIdx, {
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
                          updateCard(safeIdx, {
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
                      onChange={(e) => updateCard(safeIdx, { link: e.target.value })}
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
              )}

              <p className="text-xs text-slate-400">
                Minimum {MIN_CAROUSEL_CARDS} cards, maximum {MAX_CAROUSEL_CARDS}. Each
                card needs media and a destination URL. Headlines and descriptions are
                optional; they fall back to the ad-level values.
              </p>
            </div>
          );
        })()}
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" /> Ad Variants
                  </label>
                  <span
                    className={cn(
                      "text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full border",
                      form.ad.adVariants.length >= MAX_VARIANTS
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-slate-50 text-slate-500 border-slate-100"
                    )}
                  >
                    {form.ad.adVariants.length} / {MAX_VARIANTS}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTestAdsCount(form.ad.adVariants.length || 2);
                    setShowTestSetup(true);
                  }}
                  className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 active:bg-slate-100 shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Creative test setup
                </Button>
              </div>

              <div className="space-y-3">
                {form.ad.adVariants.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-8 flex flex-col items-center text-center space-y-3.5 animate-in fade-in duration-200">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">No creative test set up yet</h4>
                      <p className="text-xs text-slate-500 max-w-[280px]">
                        Create test ads by copying your original creative to compare variations.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        const currentDailyBudget = form.adSet.dailyBudget || form.campaign.dailyBudget || 200;
                        setTestAdsBudget(Math.round(currentDailyBudget * 0.2) || 40);
                        setTestAdsCount(2);
                        setShowTestSetup(true);
                      }}
                      className="h-9 rounded-lg font-bold bg-[#0969da] hover:bg-blue-700 text-white px-5 text-xs shadow-sm"
                    >
                      Set up test
                    </Button>
                  </div>
                ) : (
                  form.ad.adVariants.map((variant, idx) => {
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
                  })
                )}
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

        {/* Creative testing */}
        <FormSection
          title="Creative testing"
          description="Compare up to 5 different versions of your creative in a test that helps ensure delivery to new test ads."
          icon={Layers}
        >
          <p className="text-xs text-slate-500">
            <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              About creative testing
            </a>
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const currentDailyBudget = form.adSet.dailyBudget || form.campaign.dailyBudget || 200;
              setTestAdsBudget(Math.round(currentDailyBudget * 0.2) || 40);
              setTestAdsCount(form.ad.adVariants.length > 0 ? form.ad.adVariants.length : 2);
              setShowTestSetup(true);
            }}
            className="h-10 rounded-lg border-slate-200 font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm"
          >
            {form.ad.creativeTestingEnabled ? "Test set up" : "Set up test"}
          </Button>
        </FormSection>

        {/* Event details */}
        <FormSection
          title="Event details"
          description="Include event details for your ad. Your ad will display a title, start or end time, and a reminder button so that your audience can get reminders about the event."
          icon={Calendar}
          rightSlot={
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Optional
            </span>
          }
        >
          {form.ad.eventDetails ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 shadow-sm">
                <div>
                  <div className="text-[13px] font-bold text-slate-800">
                    {form.ad.eventDetails.title || "Untitled event"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {form.ad.eventDetails.timeMode === "START" && form.ad.eventDetails.startsAt && `Starts: ${new Date(form.ad.eventDetails.startsAt).toLocaleString()}`}
                    {form.ad.eventDetails.timeMode === "END" && form.ad.eventDetails.endsAt && `Ends: ${new Date(form.ad.eventDetails.endsAt).toLocaleString()}`}
                    {(!form.ad.eventDetails.startsAt && !form.ad.eventDetails.endsAt) && "Time not set"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={openEventModal} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => setForm(f => ({...f, ad: {...f.ad, eventDetails: undefined}}))} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={openEventModal}
              className="h-10 rounded-lg border-slate-200 font-bold text-slate-700"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Add event
            </Button>
          )}
        </FormSection>

        {/* Languages */}
        <FormSection
          title="Languages"
          description="Add your own translations or automatically translate your ad to reach people in more languages."
          icon={LanguagesIcon}
          rightSlot={
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {form.ad.languages?.enabled ? "On" : "Off"}
              </span>
              <Switch
                checked={!!form.ad.languages?.enabled}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ad: {
                      ...f.ad,
                      languages: {
                        ...(f.ad.languages ?? {}),
                        enabled: e.target.checked,
                      },
                    },
                  }))
                }
              />
            </div>
          }
        >
          <p className="text-xs text-slate-500">
            <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              Learn more
            </a>
          </p>
          {form.ad.languages?.enabled && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                checked={!!form.ad.languages?.auto}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    ad: {
                      ...f.ad,
                      languages: {
                        ...(f.ad.languages ?? { enabled: true }),
                        auto: !!v,
                      },
                    },
                  }))
                }
                className="mt-0.5"
              />
              <span className="text-sm text-slate-800">
                Automatically translate this ad's text using Meta's translation model.
              </span>
            </label>
          )}
        </FormSection>

        {/* Tracking */}
        <div id="tracking-section">
          <FormSection
            title="Tracking"
            description="Choose conversion events to track. This ad account's selected conversion dataset will be tracked by default."
            icon={BarChart3}
          >
          {/* Website events */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!form.ad.websiteEvents}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, ad: { ...f.ad, websiteEvents: !!v } }))
                }
              />
              <span className="text-sm font-bold text-slate-900">Website events</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </label>
          </div>

          {/* App events */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!form.ad.trackingAppEvents}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, ad: { ...f.ad, trackingAppEvents: !!v } }))
                }
              />
              <span className="text-sm font-bold text-slate-900">App events</span>
            </label>
          </div>

          {/* Offline events */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!form.ad.offlineEvents}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, ad: { ...f.ad, offlineEvents: !!v } }))
                }
              />
              <span className="text-sm font-bold text-slate-900">Offline events</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </label>
          </div>

          {/* URL parameters */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              URL parameters <Info className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <Input
              value={form.ad.urlParameters ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, ad: { ...f.ad, urlParameters: e.target.value } }))
              }
              placeholder="key1=value1&key2=value2"
              className="h-11 rounded-xl border-slate-200 bg-white font-mono text-xs"
            />
            <a className="text-xs font-bold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              Build a URL parameter
            </a>
          </div>

          {/* Third-party reporting tools */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Third-party reporting tools
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Meta purchases may not be included in your Google reporting. Connect your account to
              measure actions on ads that send people to your website or shop.{" "}
              <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                Learn more
              </a>
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  ad: { ...f.ad, thirdPartyReportingConnected: !f.ad.thirdPartyReportingConnected },
                }))
              }
              className="h-10 rounded-lg border-slate-200 font-bold text-slate-700"
            >
              {form.ad.thirdPartyReportingConnected ? "Connected" : "Connect"}
            </Button>
          </div>
        </FormSection>
        </div>
      </div>
        </Card>
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-8 self-start space-y-4">
        <AdCreativeLivePreview form={form} clientId={clientId} />
      </div>

      {/* Creative test setup modal */}
      {showTestSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]" 
            onClick={handleCancelTestSetup}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 relative">
              <h3 className="text-lg font-bold text-slate-900 leading-none">
                Creative test setup
              </h3>
              <p className="text-[13px] text-slate-500 leading-normal mt-2 pr-6">
                We'll create new test ads by copying your original ad. You can update the creative for each one after you've confirmed your test setup.
              </p>
              <button
                type="button"
                onClick={handleCancelTestSetup}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Field 1: How many test ads */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block">
                  How many test ads do you want to create?
                </label>
                <p className="text-xs text-slate-500">
                  Select 2 to 5. Your test ads will be compared alongside existing ads to find the best combination.
                </p>
                <div className="w-full">
                  <Select
                    value={testAdsCount.toString()}
                    onValueChange={(v) => setTestAdsCount(Number(v))}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white font-semibold text-slate-700 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Field 2: Budget */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block">
                  How much of your budget should go to test ads?
                </label>
                <p className="text-xs text-slate-500">
                  Your campaign currently has a ₹{(form.campaign.dailyBudget || 1000).toFixed(2)} daily budget.
                </p>
                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1 w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xs">
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={testAdsBudget}
                      onChange={(e) => setTestAdsBudget(Number(e.target.value))}
                      className="h-11 rounded-lg border-slate-200 pl-6 pr-12 font-semibold text-slate-700 w-full"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] tracking-wider">
                      INR
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  We'll aim to spend an average of ₹{testAdsBudget.toFixed(2)} per day across test ads. If your campaign only includes test ads, they may receive more of the campaign budget.
                </p>
              </div>

              {/* Field 3: Duration */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block">
                  How long should the test run?
                </label>
                <p className="text-xs text-slate-500">
                  Your test will run for this many days or until your ad set has ended.
                </p>
                <div className="w-full">
                  <Select
                    value={testAdsDuration}
                    onValueChange={setTestAdsDuration}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white font-semibold text-slate-700 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 days">3 days</SelectItem>
                      <SelectItem value="5 days">5 days</SelectItem>
                      <SelectItem value="7 days">7 days</SelectItem>
                      <SelectItem value="14 days">14 days</SelectItem>
                      <SelectItem value="30 days">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Field 4: Performance Metric */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="text-[13px] font-bold text-slate-700 block">
                    How do you want to compare performance?
                  </label>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="w-full">
                  <Select
                    value={testAdsMetric}
                    onValueChange={setTestAdsMetric}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white font-semibold text-slate-700 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cost per purchase">Cost per purchase</SelectItem>
                      <SelectItem value="Cost per post engagement">Cost per post engagement</SelectItem>
                      <SelectItem value="Cost per click (CPC)">Cost per click (CPC)</SelectItem>
                      <SelectItem value="Cost per 1,000 people reached">Cost per 1,000 people reached</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelTestSetup}
                className="h-10 rounded-lg border-slate-200 font-bold text-slate-700 bg-white hover:bg-slate-100 px-5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmTestSetup}
                className="h-10 rounded-lg font-bold bg-[#0969da] hover:bg-blue-700 text-white px-6"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Set up your creative (Media Selector) modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]" 
            onClick={() => setShowMediaLibrary(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="border-b border-slate-100 flex justify-between items-start shrink-0 pr-6">
              <div className="flex flex-1">
                {/* Left column sidebar header */}
                <div className="w-[220px] bg-slate-50/50 border-r border-slate-100 pb-2 px-6 pt-5">
                  <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Set up your creative
                  </h3>
                </div>
                {/* Right content header */}
                <div className="flex-1 px-6 pt-5 pb-2">
                  <h3 className="text-[15px] font-bold text-slate-900 leading-none flex items-center gap-2">
                    Media
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Select or upload the media your want to use for your ad. You can select one image or video.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaLibrary(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors mt-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Content Area */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Left Sidebar Steps */}
              <div className="w-[220px] bg-slate-50/50 border-r border-slate-100 p-5 flex flex-col gap-4 font-semibold text-[13px] shrink-0">
                <div className="flex items-center gap-3 text-[#0969da] border-l-2 border-[#0969da] pl-3 py-1 bg-blue-50/50 -ml-5">
                  <div className="w-5 h-5 rounded-full border-4 border-[#0969da] bg-white flex items-center justify-center shrink-0 shadow-sm" />
                  <span className="font-bold">Media</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 pl-3.5 py-1">
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                  <span>Crop</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 pl-3.5 py-1">
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                  <span>Text</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 pl-3.5 py-1">
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                  <span>Image generation</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 pl-3.5 py-1">
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                  <span>Translation</span>
                </div>
              </div>

              {/* Right Content Body */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white">
                {/* Toolbar */}
                <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 gap-4">
                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/40">
                    {["all", "account", "instagram", "page"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveLibraryTab(tab as any)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all",
                          activeLibraryTab === tab
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                            : "text-slate-500 hover:text-slate-700 bg-transparent"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Search and Action buttons */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search media"
                        className="h-[34px] w-[200px] pl-9 pr-3 rounded-lg border-slate-200 text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-[34px] w-[34px] p-0 rounded-lg border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 bg-white shadow-sm shrink-0"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => triggerUpload(mediaType === "IMAGE" ? "main" : "video")}
                      className="h-[34px] rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4 text-slate-500" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Galleries Area */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-hide">
                  {/* Account images */}
                  {(activeLibraryTab === "all" || activeLibraryTab === "account") && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-widest">
                          Account images
                        </span>
                        <a className="text-[11px] font-semibold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                          See all
                        </a>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {MOCK_ACCOUNT_IMAGES.map((img, idx) => {
                          const isSelected = selectedLibraryImage === img.url;
                          return (
                            <div 
                              key={idx}
                              onClick={() => setSelectedLibraryImage(img.url)}
                              className={cn(
                                "group relative border-2 rounded-xl overflow-hidden cursor-pointer bg-slate-50 flex flex-col transition-all shadow-sm aspect-square",
                                isSelected 
                                  ? "border-[#0969da] ring-2 ring-blue-100" 
                                  : "border-slate-100 hover:border-slate-300"
                              )}
                            >
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 backdrop-blur-[2px] text-white p-1 rounded text-[9px] font-mono leading-none truncate text-center opacity-90">
                                {img.name} <br /> {img.size}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Instagram images */}
                  {(activeLibraryTab === "all" || activeLibraryTab === "instagram") && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-widest">
                          Instagram images
                        </span>
                        <a className="text-[11px] font-semibold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                          See all
                        </a>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {MOCK_INSTAGRAM_IMAGES.filter(img => img.name.toLowerCase().includes(searchQuery.toLowerCase())).map((img, idx) => {
                          const isSelected = selectedLibraryImage === img.url;
                          return (
                            <div 
                              key={idx}
                              onClick={() => setSelectedLibraryImage(img.url)}
                              className={cn(
                                "group relative border-2 rounded-xl overflow-hidden cursor-pointer bg-slate-50 flex flex-col transition-all shadow-sm aspect-square",
                                isSelected 
                                  ? "border-[#0969da] ring-2 ring-blue-100" 
                                  : "border-slate-100 hover:border-slate-300"
                              )}
                            >
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 backdrop-blur-[2px] text-white p-1 rounded text-[9px] font-mono leading-none truncate text-center opacity-90">
                                {img.name} <br /> {img.size}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Page images */}
                  {(activeLibraryTab === "all" || activeLibraryTab === "page") && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-slate-700 uppercase tracking-widest">
                            Page images
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 select-none">
                            Vapeguru
                          </span>
                        </div>
                        <a className="text-[11px] font-semibold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                          See all
                        </a>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {MOCK_PAGE_IMAGES.filter(img => img.name.toLowerCase().includes(searchQuery.toLowerCase())).map((img, idx) => {
                          const isSelected = selectedLibraryImage === img.url;
                          return (
                            <div 
                              key={idx}
                              onClick={() => setSelectedLibraryImage(img.url)}
                              className={cn(
                                "group relative border-2 rounded-xl overflow-hidden cursor-pointer bg-slate-50 flex flex-col transition-all shadow-sm aspect-square",
                                isSelected 
                                  ? "border-[#0969da] ring-2 ring-blue-100" 
                                  : "border-slate-100 hover:border-slate-300"
                              )}
                            >
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 backdrop-blur-[2px] text-white p-1 rounded text-[9px] font-mono leading-none truncate text-center opacity-90">
                                {img.name} <br /> {img.size}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500">
                <span>{selectedLibraryImage ? "1" : "0"} selected Media from you</span>
                <span>0 selected Media from AI</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaLibrary(false)}
                  className="h-10 rounded-lg border-slate-200 font-bold text-slate-700 bg-white hover:bg-slate-100 px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmMedia}
                  disabled={!selectedLibraryImage}
                  className="h-10 rounded-lg font-bold bg-[#0969da] hover:bg-blue-700 text-white px-6 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Carousel Card Media Library Modal (Awareness "Select up to 10 images") ── */}
      {showCarouselMediaModal && (() => {
        const remaining = MAX_CAROUSEL_CARDS - form.ad.carouselCards.length;
        const filterImages = (list: typeof MOCK_ACCOUNT_IMAGES) =>
          list.filter((img) => img.name.toLowerCase().includes(carouselSearchQuery.toLowerCase()));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]"
              onClick={() => setShowCarouselMediaModal(false)}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">
                    Select up to {remaining} {carouselMediaModalType === "IMAGE" ? "image" : "video"}{remaining !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {selectedCarouselLibraryImages.length} selected · {remaining - selectedCarouselLibraryImages.length} remaining
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCarouselMediaModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toolbar: tabs + search + upload */}
              <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/40">
                  {(["all", "account", "instagram", "page"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCarouselLibraryTab(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all",
                        activeCarouselLibraryTab === tab
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                          : "text-slate-500 hover:text-slate-700 bg-transparent"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {/* Search + Upload */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      value={carouselSearchQuery}
                      onChange={(e) => setCarouselSearchQuery(e.target.value)}
                      placeholder="Search media"
                      className="h-[34px] w-[180px] pl-9 pr-3 rounded-lg border-slate-200 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[34px] w-[34px] p-0 rounded-lg border-slate-200 flex items-center justify-center text-slate-500 bg-white shadow-sm shrink-0"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => triggerUpload(carouselMediaModalType === "IMAGE" ? "main" : "video")}
                    className="h-[34px] rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Gallery */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-hide min-h-0">
                {/* Account images */}
                {(activeCarouselLibraryTab === "all" || activeCarouselLibraryTab === "account") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Account images</span>
                        <span className="text-[10px] text-slate-400">Showing first {MOCK_ACCOUNT_IMAGES.length} image{MOCK_ACCOUNT_IMAGES.length !== 1 ? "s" : ""}</span>
                      </div>
                      <a className="text-[11px] font-semibold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>See all</a>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {filterImages(MOCK_ACCOUNT_IMAGES).map((img, idx) => {
                        const isSel = selectedCarouselLibraryImages.includes(img.url);
                        const selIdx = selectedCarouselLibraryImages.indexOf(img.url);
                        const canSelect = isSel || selectedCarouselLibraryImages.length < remaining;
                        return (
                          <div
                            key={idx}
                            onClick={() => canSelect && toggleCarouselImage(img.url)}
                            className={cn(
                              "group relative border-2 rounded-xl overflow-hidden bg-slate-50 flex flex-col transition-all shadow-sm aspect-square",
                              isSel ? "border-[#0969da] ring-2 ring-blue-100" : canSelect ? "border-slate-100 hover:border-slate-300 cursor-pointer" : "border-slate-100 opacity-50 cursor-not-allowed"
                            )}
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                            {isSel && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0969da] border-2 border-white flex items-center justify-center shadow">
                                <span className="text-white text-[9px] font-black">{selIdx + 1}</span>
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white p-1 rounded text-[8px] font-mono leading-none text-center truncate opacity-80">
                              {img.size}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instagram images */}
                {(activeCarouselLibraryTab === "all" || activeCarouselLibraryTab === "instagram") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Instagram images</span>
                        <span className="text-[10px] text-slate-400">Showing first {MOCK_INSTAGRAM_IMAGES.length} images</span>
                      </div>
                      <a className="text-[11px] font-semibold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>See all</a>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {filterImages(MOCK_INSTAGRAM_IMAGES).map((img, idx) => {
                        const isSel = selectedCarouselLibraryImages.includes(img.url);
                        const selIdx = selectedCarouselLibraryImages.indexOf(img.url);
                        const canSelect = isSel || selectedCarouselLibraryImages.length < remaining;
                        return (
                          <div
                            key={idx}
                            onClick={() => canSelect && toggleCarouselImage(img.url)}
                            className={cn(
                              "group relative border-2 rounded-xl overflow-hidden bg-slate-50 flex flex-col transition-all shadow-sm aspect-square",
                              isSel ? "border-[#0969da] ring-2 ring-blue-100" : canSelect ? "border-slate-100 hover:border-slate-300 cursor-pointer" : "border-slate-100 opacity-50 cursor-not-allowed"
                            )}
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                            {isSel && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0969da] border-2 border-white flex items-center justify-center shadow">
                                <span className="text-white text-[9px] font-black">{selIdx + 1}</span>
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white p-1 rounded text-[8px] font-mono leading-none text-center truncate opacity-80">
                              {img.size}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Page images */}
                {(activeCarouselLibraryTab === "all" || activeCarouselLibraryTab === "page") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Page images</span>
                        <span className="text-[10px] text-slate-400">Showing first {MOCK_PAGE_IMAGES.length} images</span>
                      </div>
                      <a className="text-[11px] font-semibold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>See all</a>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {filterImages(MOCK_PAGE_IMAGES).map((img, idx) => {
                        const isSel = selectedCarouselLibraryImages.includes(img.url);
                        const selIdx = selectedCarouselLibraryImages.indexOf(img.url);
                        const canSelect = isSel || selectedCarouselLibraryImages.length < remaining;
                        return (
                          <div
                            key={idx}
                            onClick={() => canSelect && toggleCarouselImage(img.url)}
                            className={cn(
                              "group relative border-2 rounded-xl overflow-hidden bg-slate-50 flex flex-col transition-all shadow-sm aspect-square",
                              isSel ? "border-[#0969da] ring-2 ring-blue-100" : canSelect ? "border-slate-100 hover:border-slate-300 cursor-pointer" : "border-slate-100 opacity-50 cursor-not-allowed"
                            )}
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                            {isSel && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0969da] border-2 border-white flex items-center justify-center shadow">
                                <span className="text-white text-[9px] font-black">{selIdx + 1}</span>
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white p-1 rounded text-[8px] font-mono leading-none text-center truncate opacity-80">
                              {img.size}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-[12px] font-semibold text-slate-500">
                  {selectedCarouselLibraryImages.length} selected
                  {selectedCarouselLibraryImages.length > 0 && ` · ${remaining - selectedCarouselLibraryImages.length} slots remaining`}
                </span>
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCarouselMediaModal(false)}
                    className="h-10 rounded-lg border-slate-200 font-bold text-slate-700 bg-white hover:bg-slate-100 px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmCarouselMedia}
                    disabled={selectedCarouselLibraryImages.length === 0}
                    className="h-10 rounded-lg font-bold bg-[#0969da] hover:bg-blue-700 text-white px-6 disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Event Setup Modal ── */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]" 
            onClick={() => setShowEventModal(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-[15px] font-bold text-slate-900">Add event</h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <p className="text-[13px] text-slate-600 -mt-2">Create a new event for your ad.</p>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block">Event name</label>
                <div className="relative">
                  <Input
                    value={draftEvent.title}
                    onChange={(e) => setDraftEvent(prev => ({...prev, title: e.target.value.slice(0, 70)}))}
                    placeholder="Give your event a name"
                    className="h-11 rounded-lg border-slate-200 pr-12 text-[13px]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                    {draftEvent.title.length}/70
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[13px] font-bold text-slate-700 block mb-2">Event time</label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      draftEvent.timeMode === "START" ? "border-[#0969da]" : "border-slate-300 group-hover:border-slate-400"
                    )}>
                      {draftEvent.timeMode === "START" && <div className="w-2 h-2 rounded-full bg-[#0969da]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-slate-800 leading-none">Add start time</div>
                    <div className="text-[11px] text-slate-500 mt-1">We'll send notifications before and during the event.</div>
                  </div>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={draftEvent.timeMode === "START"}
                    onChange={() => setDraftEvent(prev => ({...prev, timeMode: "START"}))}
                  />
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      draftEvent.timeMode === "END" ? "border-[#0969da]" : "border-slate-300 group-hover:border-slate-400"
                    )}>
                      {draftEvent.timeMode === "END" && <div className="w-2 h-2 rounded-full bg-[#0969da]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-slate-800 leading-none">Add end time</div>
                    <div className="text-[11px] text-slate-500 mt-1">We'll send notifications before the event has ended.</div>
                  </div>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={draftEvent.timeMode === "END"}
                    onChange={() => setDraftEvent(prev => ({...prev, timeMode: "END"}))}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block">
                  {draftEvent.timeMode === "START" ? "Event start time" : "Event end time"}
                </label>
                <div className="flex gap-3">
                  <Input
                    type="datetime-local"
                    value={draftEvent.timeMode === "START" ? (draftEvent.startsAt || "") : (draftEvent.endsAt || "")}
                    onChange={(e) => {
                      if (draftEvent.timeMode === "START") {
                        setDraftEvent(prev => ({...prev, startsAt: e.target.value}));
                      } else {
                        setDraftEvent(prev => ({...prev, endsAt: e.target.value}));
                      }
                    }}
                    className="h-11 flex-1 rounded-lg border-slate-200 text-[13px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[13px] font-bold text-slate-700 block">
                  Select when to send notifications
                </div>
                <div className="text-[11px] text-slate-500 -mt-1">
                  We'll send notifications based on the {draftEvent.timeMode === "START" ? "start" : "end"} time.
                </div>
                <Select
                  value={draftEvent.notifications}
                  onValueChange={(v) => setDraftEvent(prev => ({...prev, notifications: v}))}
                >
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white text-[13px] font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 day before, 15 minutes before and at start time">1 day before, 15 minutes before and at start time</SelectItem>
                    <SelectItem value="1 hour before, 15 minutes before and at start time">1 hour before, 15 minutes before and at start time</SelectItem>
                    <SelectItem value="15 minutes before and at start time">15 minutes before and at start time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEventModal(false)}
                className="h-9 rounded-lg border-slate-200 font-bold text-slate-700 bg-white hover:bg-slate-50 px-5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmEvent}
                className="h-9 rounded-lg font-bold bg-[#bfddfe] text-blue-700 hover:bg-[#0969da] hover:text-white transition-colors px-6"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
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
