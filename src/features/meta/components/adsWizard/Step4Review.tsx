import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Facebook as FacebookIcon,
  Wallet,
  MapPin,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Target,
  Users,
  LayoutGrid,
  MousePointerClick,
  ShieldAlert,
  CalendarClock,
  Type,
  Ban,
  Crosshair,
  Layers,
  Sparkles,
  UserSquare,
} from "lucide-react";
import {
  CONVERSION_EVENT_OPTIONS,
  CTA_OPTIONS,
  DETAILED_TARGETING_OPTIONS,
  OBJECTIVE_OPTIONS,
  PLACEMENT_OPTIONS,
  SPECIAL_AD_CATEGORY_OPTIONS,
  type WizardState,
} from "./types";

const formatDateTime = (iso: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

type Props = {
  form: WizardState;
  publishError: string | null;
};

const Field = ({
  icon,
  label,
  value,
  empty,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  empty?: boolean;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 mt-0.5 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </div>
      <div
        className={
          empty ? "text-sm text-slate-300 italic" : "text-sm font-semibold text-slate-900"
        }
      >
        {value}
      </div>
    </div>
  </div>
);

export function Step4Review({ form, publishError }: Props) {
  // "Empty targeting" means no included filters at all — Meta will fall back
  // to its broad default (entire US for the ad account region). We count every
  // bucket that narrows the audience: locations, interests, detailed
  // targeting, and custom audiences.
  const targetingEmpty =
    form.adSet.locations.length === 0 &&
    form.adSet.interests.length === 0 &&
    form.adSet.detailedTargeting.length === 0 &&
    form.adSet.customAudiences.length === 0;

  return (
    <div className="space-y-6">
      {publishError && (
        <Card className="rounded-[20px] border-rose-200 bg-rose-50">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-rose-900">Meta rejected this ad</div>
              <div className="text-sm text-rose-700 mt-0.5">{publishError}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Info */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Review & Publish</h2>
          <p className="text-sm text-slate-500 mt-1">
            Double-check everything below. Publishing sends this ad to Meta immediately.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-900 text-white rounded-full px-3 py-1 font-bold text-xs uppercase tracking-wider">
            Draft Mode
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Identity & Campaign Settings */}
        <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden bg-white">
          <div className="px-6 py-4 bg-slate-50/30 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" /> identity & settings
            </h3>
          </div>
          <CardContent className="p-6 space-y-1">
            <Field
              icon={<Briefcase className="w-4 h-4" />}
              label="Ad Account"
              value={
                form.campaign.accountId
                  ? form.campaign.accountId.startsWith("act_")
                    ? form.campaign.accountId
                    : `act_${form.campaign.accountId}`
                  : "—"
              }
              empty={!form.campaign.accountId}
            />
            <Field
              icon={<FacebookIcon className="w-4 h-4" />}
              label="Facebook Page"
              value={form.campaign.pageId || "—"}
              empty={!form.campaign.pageId}
            />
            <Field
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Campaign Name"
              value={form.campaign.name || "—"}
              empty={!form.campaign.name}
            />
            <Field
              icon={<Target className="w-4 h-4" />}
              label="Objective"
              value={
                OBJECTIVE_OPTIONS.find((o) => o.value === form.campaign.objective)?.label ??
                form.campaign.objective
              }
            />
            {((form.campaign.specialAdCategories && form.campaign.specialAdCategories[0]) || "NONE") !== "NONE" && (
              <Field
                icon={<ShieldAlert className="w-4 h-4" />}
                label="Special Ad Category"
                value={
                  SPECIAL_AD_CATEGORY_OPTIONS.find((o) => o.value === ((form.campaign.specialAdCategories && form.campaign.specialAdCategories[0]) || "NONE"))?.label ??
                  ((form.campaign.specialAdCategories && form.campaign.specialAdCategories[0]) || "NONE")
                }
              />
            )}
            <Field
              icon={<Wallet className="w-4 h-4" />}
              label="Budget"
              value={
                (form.campaign.isCboEnabled ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY")) === "LIFETIME"
                  ? `${(form.campaign.isCboEnabled ? form.campaign.lifetimeBudget ?? 0 : form.adSet.lifetimeBudget ?? 0).toFixed(2)} lifetime`
                  : `${(form.campaign.isCboEnabled ? form.campaign.dailyBudget ?? 0 : form.adSet.dailyBudget ?? 0).toFixed(2)} / day`
              }
            />
            {(form.adSet.scheduleStart || form.adSet.scheduleEnd) && (
              <Field
                icon={<CalendarClock className="w-4 h-4" />}
                label="Schedule"
                value={
                  <span>
                    {form.adSet.scheduleStart ? formatDateTime(form.adSet.scheduleStart) : "Now"}
                    <span className="text-slate-400 mx-2">→</span>
                    {form.adSet.scheduleEnd ? formatDateTime(form.adSet.scheduleEnd) : "No end date"}
                  </span>
                }
              />
            )}
            {form.campaign.objective === "OUTCOME_SALES" && (
              <Field
                icon={<Crosshair className="w-4 h-4" />}
                label="Conversion Tracking"
                value={
                  form.adSet.pixelId && form.adSet.conversionEvent ? (
                    <span>
                      Pixel <span className="font-mono text-xs text-slate-500">{form.adSet.pixelId}</span>
                      <span className="text-slate-400 mx-2">·</span>
                      {CONVERSION_EVENT_OPTIONS.find((o) => o.value === form.adSet.conversionEvent)?.label ??
                        form.adSet.conversionEvent}
                    </span>
                  ) : (
                    "Not configured"
                  )
                }
                empty={!form.adSet.pixelId || !form.adSet.conversionEvent}
              />
            )}
          </CardContent>
        </Card>

        {/* Section 2: Target Audience */}
        <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden bg-white">
          <div className="px-6 py-4 bg-slate-50/30 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" /> target audience
            </h3>
          </div>
          <CardContent className="p-6 space-y-1">
            <Field
              icon={<MapPin className="w-4 h-4" />}
              label="Locations"
              value={
                form.adSet.locations.length === 0 ? (
                  "Default: entire US"
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {form.adSet.locations.map((l) => (
                      <Badge
                        key={l.key}
                        variant="outline"
                        className={
                          l.excluded
                            ? "rounded-full bg-rose-50 border-rose-100 text-rose-700 text-[11px] flex items-center gap-1"
                            : "rounded-full bg-blue-50 border-blue-100 text-blue-700 text-[11px]"
                        }
                      >
                        {l.excluded && <Ban className="w-3 h-3" />}
                        {l.name}
                      </Badge>
                    ))}
                  </div>
                )
              }
              empty={targetingEmpty}
            />
            <Field
              icon={<Heart className="w-4 h-4" />}
              label="Interests"
              value={
                form.adSet.interests.length === 0 ? (
                  "None"
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {form.adSet.interests.map((i) => (
                      <Badge
                        key={i.id}
                        variant="outline"
                        className={
                          i.excluded
                            ? "rounded-full bg-rose-50 border-rose-100 text-rose-700 text-[11px] flex items-center gap-1"
                            : "rounded-full bg-violet-50 border-violet-100 text-violet-700 text-[11px]"
                        }
                      >
                        {i.excluded && <Ban className="w-3 h-3" />}
                        {i.name}
                      </Badge>
                    ))}
                  </div>
                )
              }
              empty={form.adSet.interests.length === 0}
            />
            {form.adSet.detailedTargeting.length > 0 && (
              <Field
                icon={<Sparkles className="w-4 h-4" />}
                label="Detailed Targeting"
                value={
                  <div className="flex flex-wrap gap-1.5">
                    {form.adSet.detailedTargeting.map((item) => {
                      const typeLabel =
                        DETAILED_TARGETING_OPTIONS.find((o) => o.value === item.type)?.label ??
                        item.type;
                      return (
                        <Badge
                          key={`${item.type}:${item.id}`}
                          variant="outline"
                          className="rounded-full bg-amber-50 border-amber-100 text-amber-700 text-[11px]"
                        >
                          {item.name}
                          <span className="ml-1 text-amber-400 text-[9px] uppercase">
                            {typeLabel}
                          </span>
                        </Badge>
                      );
                    })}
                  </div>
                }
              />
            )}
            {form.adSet.customAudiences.length > 0 && (
              <Field
                icon={<UserSquare className="w-4 h-4" />}
                label="Custom Audiences"
                value={
                  <div className="flex flex-wrap gap-1.5">
                    {form.adSet.customAudiences.map((a) => (
                      <Badge
                        key={a.id}
                        variant="outline"
                        className={
                          a.excluded
                            ? "rounded-full bg-rose-50 border-rose-100 text-rose-700 text-[11px] flex items-center gap-1"
                            : "rounded-full bg-emerald-50 border-emerald-100 text-emerald-700 text-[11px]"
                        }
                      >
                        {a.excluded && <Ban className="w-3 h-3" />}
                        {a.name}
                        <span className={a.excluded ? "ml-1 text-rose-400 text-[9px] uppercase" : "ml-1 text-emerald-400 text-[9px] uppercase"}>
                          {a.audienceType}
                        </span>
                      </Badge>
                    ))}
                  </div>
                }
              />
            )}
            <Field
              icon={<Users className="w-4 h-4" />}
              label="Age Range"
              value={
                form.adSet.ageMax === 65
                  ? `${form.adSet.ageMin} – 65+`
                  : `${form.adSet.ageMin} – ${form.adSet.ageMax}`
              }
            />
            <Field
              icon={<Users className="w-4 h-4" />}
              label="Gender"
              value={form.adSet.genders[0] === "ALL" ? "All genders" : form.adSet.genders[0] === "MEN" ? "Men" : "Women"}
            />
            <Field
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Placements"
              value={
                form.adSet.manualPlatforms.length === 0 ? (
                  "Auto (Meta decides)"
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {form.adSet.manualPlatforms.map((p) => (
                      <Badge
                        key={p}
                        variant="outline"
                        className="rounded-full bg-slate-100 border-slate-200 text-slate-700 text-[11px]"
                      >
                        {PLACEMENT_OPTIONS.find((o) => o.value === p)?.label ?? p}
                      </Badge>
                    ))}
                  </div>
                )
              }
            />
          </CardContent>
        </Card>

      </div>

      {/* Section 3: Creative Setup */}
      <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden bg-white">
        <div className="px-6 py-4 bg-slate-50/30 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" /> ad creative setup
          </h3>
        </div>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Field
              icon={<Layers className="w-4 h-4" />}
              label="Publish Mode"
              value={
                form.ad.publishMode === "AB_TEST"
                  ? `A/B Test (${form.ad.adVariants.length} variants)`
                  : "Single Ad"
              }
            />
            {form.ad.publishMode !== "AB_TEST" && (
              <Field
                icon={<Layers className="w-4 h-4" />}
                label="Ad Format"
                value={
                  form.ad.format === "CAROUSEL"
                    ? `Carousel (${form.ad.carouselCards.length} cards)`
                    : form.ad.format === "SINGLE_IMAGE_VIDEO"
                      ? "Video"
                      : "Single Image"
                }
              />
            )}
            {form.ad.publishMode !== "AB_TEST" && form.ad.format !== "CAROUSEL" && (
              <Field
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Headline"
                value={(form.ad.headlines[0] || "") || "—"}
                empty={!(form.ad.headlines[0] || "")}
              />
            )}
            {form.ad.publishMode !== "AB_TEST" && (
              <Field
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Primary Text"
                value={(form.ad.primaryTexts[0] || "") || "—"}
                empty={!(form.ad.primaryTexts[0] || "")}
              />
            )}
            {form.ad.publishMode !== "AB_TEST" && form.ad.format !== "CAROUSEL" && (form.ad.descriptions[0] || "").trim() && (
              <Field
                icon={<Type className="w-4 h-4" />}
                label="Description"
                value={(form.ad.descriptions[0] || "")}
              />
            )}
            {form.ad.format !== "CAROUSEL" && (
              <Field
                icon={<LinkIcon className="w-4 h-4" />}
                label="Destination URL"
                value={form.ad.websiteUrl || "—"}
                empty={!form.ad.websiteUrl}
              />
            )}
            {form.ad.publishMode !== "AB_TEST" && (
              <Field
                icon={<MousePointerClick className="w-4 h-4" />}
                label="CTA Button"
                value={CTA_OPTIONS.find((o) => o.value === form.ad.callToAction)?.label ?? form.ad.callToAction}
              />
            )}
          </div>

          <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Media Preview
            </div>

            {form.ad.publishMode !== "AB_TEST" && form.ad.format === "SINGLE_IMAGE_VIDEO" && (
              <div className="space-y-3">
                {(form.ad.videos[0] || "") ? (
                  <div className="space-y-2">
                    <video
                      src={(form.ad.videos[0] || "")}
                      controls
                      preload="metadata"
                      poster={form.ad.videoThumbnailUrl || undefined}
                      className="rounded-xl max-h-56 bg-black w-full"
                      onError={(e) => {
                        (e.target as HTMLVideoElement).style.display = "none";
                      }}
                    />
                    <div className="font-mono text-[11px] text-slate-500 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {(form.ad.videos[0] || "")}
                    </div>
                    {form.ad.videoThumbnailUrl && (
                      <div className="text-[11px] text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-50 flex items-center gap-2">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 shrink-0">Thumbnail:</span>
                        <span className="font-mono truncate">{form.ad.videoThumbnailUrl}</span>
                      </div>
                    )}
                    {form.ad.captionsUrl && (
                      <div className="text-[11px] text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-50 flex items-center gap-2">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 shrink-0">Captions:</span>
                        <span className="font-mono truncate">{form.ad.captionsUrl}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-400">
                    No video uploaded
                  </div>
                )}
              </div>
            )}

            {form.ad.publishMode !== "AB_TEST" && form.ad.format === "CAROUSEL" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.ad.carouselCards.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50/30 overflow-hidden shadow-sm"
                  >
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={`Card ${i + 1}`}
                        className="w-full h-28 object-cover bg-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-28 bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
                        No image
                      </div>
                    )}
                    <div className="p-3 space-y-1">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Card {i + 1}
                      </div>
                      {c.headline && (
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {c.headline}
                        </div>
                      )}
                      {c.description && (
                        <div className="text-[10px] text-slate-500 truncate">
                          {c.description}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {c.link || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {form.ad.publishMode !== "AB_TEST" && form.ad.format === "SINGLE_IMAGE_VIDEO" && (
              <div className="space-y-3">
                {(form.ad.images[0] || "") ? (
                  <div className="space-y-2">
                    <img
                      src={(form.ad.images[0] || "")}
                      alt="Ad preview"
                      className="rounded-xl max-h-56 object-cover w-full border border-slate-100 bg-slate-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="font-mono text-[11px] text-slate-500 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {(form.ad.images[0] || "")}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-400">
                    No image uploaded
                  </div>
                )}
              </div>
            )}

            {form.ad.publishMode === "AB_TEST" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.ad.adVariants.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50/30 overflow-hidden shadow-sm"
                  >
                    {v.imageUrl ? (
                      <img
                        src={v.imageUrl}
                        alt={`Variant ${String.fromCharCode(65 + i)}`}
                        className="w-full h-28 object-cover bg-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-28 bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
                        No image
                      </div>
                    )}
                    <div className="p-3 space-y-1">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Variant {String.fromCharCode(65 + i)}
                      </div>
                      {v.adHeadline && (
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {v.adHeadline}
                        </div>
                      )}
                      {v.adText && (
                        <div className="text-[10px] text-slate-500 line-clamp-2">
                          {v.adText}
                        </div>
                      )}
                      <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                        CTA: {CTA_OPTIONS.find((o) => o.value === v.ctaButton)?.label ?? v.ctaButton}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
