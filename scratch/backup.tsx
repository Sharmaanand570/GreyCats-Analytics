import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiMeta } from "react-icons/si";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Stepper } from "@/features/meta/components/adsWizard/Stepper";
import { Step1Settings } from "@/features/meta/components/adsWizard/Step1Settings";
import { Step2Audience } from "@/features/meta/components/adsWizard/Step2Audience";
import { Step3Creative } from "@/features/meta/components/adsWizard/Step3Creative";
import { Step4Review } from "@/features/meta/components/adsWizard/Step4Review";
import {
  INITIAL_FORM_STATE,
  type WizardFormState,
} from "@/features/meta/components/adsWizard/types";
import { toWizardFormState } from "@/features/meta/components/adsWizard/fromCampaignDetails";
import {
  useAudiences,
  useCampaignDetails,
  useJobStatus,
  useSubmitPublishJob,
  useUpdateCampaign,
} from "@/features/meta/hooks/useMetaAdsManager";
import { TERMINAL_JOB_STATES } from "@/features/meta/API/metaAdsManagerApi";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PublishAdPayload,
  UpdateCampaignPayload,
} from "@/features/meta/API/metaAdsManagerApi";

const TOTAL_STEPS = 4;

// Meta's publish endpoint expects the ad account id prefixed with `act_`.
// The /clients/:id/meta/accounts endpoint returns the bare numeric id, so we
// normalize here in case form.accountId is missing the prefix.
const withActPrefix = (id: string) => (id.startsWith("act_") ? id : `act_${id}`);

// Bucket locations into { included, excluded } by their `excluded` flag,
// then split each bucket by Meta's geo node type (country / city / region).
const splitGeoLocations = (locations: WizardFormState["adSet"]["locations"]) => {
  const bucket = (excluded: boolean) => {
    const list = locations.filter((l) => !!l.excluded === excluded);
    const countries = Array.from(
      new Set(
        list
          .filter((l) => l.type === "country" && l.country_code)
          .map((l) => l.country_code as string)
      )
    );
    const cities = list
      .filter((l) => l.type === "city")
      .map((l) => ({ key: l.key, name: l.name }));
    const regions = list
      .filter((l) => l.type === "region")
      .map((l) => ({ key: l.key, name: l.name }));
    return { countries, cities, regions };
  };
  return { included: bucket(false), excluded: bucket(true) };
};

const toGeoBlock = (g: { countries: string[]; cities: { key: string; name?: string }[]; regions: { key: string; name?: string }[] }) => {
  const empty = !g.countries.length && !g.cities.length && !g.regions.length;
  if (empty) return undefined;
  return {
    ...(g.countries.length ? { countries: g.countries } : {}),
    ...(g.cities.length ? { cities: g.cities } : {}),
    ...(g.regions.length ? { regions: g.regions } : {}),
  };
};

const buildPayload = (form: WizardFormState): PublishAdPayload => {
  const { included, excluded } = splitGeoLocations(form.locations);
  const geoIncluded = toGeoBlock(included);
  const geoExcluded = toGeoBlock(excluded);

  const includedInterests = form.interests.filter((i) => !i.excluded).map((i) => ({ id: i.id, name: i.name }));
  const excludedInterests = form.interests.filter((i) => i.excluded).map((i) => ({ id: i.id, name: i.name }));

  const includedAudiences = form.customAudiences.filter((a) => !a.excluded).map((a) => ({ id: a.id }));
  const excludedAudiences = form.customAudiences.filter((a) => a.excluded).map((a) => ({ id: a.id }));

  // Group detailed targeting by Meta's targeting node. Behaviors / demographics /
  // life_events go as flat arrays; work_* and education_* get bundled into
  // their own arrays with a `type` discriminator.
  const dtBuckets = {
    behaviors: [] as { id: string; name: string }[],
    demographics: [] as { id: string; name: string }[],
    life_events: [] as { id: string; name: string }[],
    work: [] as { id: string; name: string; type: "employer" | "position" | "industry" }[],
    education: [] as { id: string; name: string; type: "school" | "field_of_study" }[],
  };
  for (const item of form.detailedTargeting) {
    const base = { id: item.id, name: item.name };
    switch (item.type) {
      case "behaviors":
        dtBuckets.behaviors.push(base);
        break;
      case "demographics":
        dtBuckets.demographics.push(base);
        break;
      case "life_events":
        dtBuckets.life_events.push(base);
        break;
      case "work_employers":
        dtBuckets.work.push({ ...base, type: "employer" });
        break;
      case "work_positions":
        dtBuckets.work.push({ ...base, type: "position" });
        break;
      case "education_schools":
        dtBuckets.education.push({ ...base, type: "school" });
        break;
      case "education_majors":
        dtBuckets.education.push({ ...base, type: "field_of_study" });
        break;
    }
  }

  const hasAnyTargeting =
    !!geoIncluded ||
    !!geoExcluded ||
    includedInterests.length > 0 ||
    excludedInterests.length > 0 ||
    dtBuckets.behaviors.length > 0 ||
    dtBuckets.demographics.length > 0 ||
    dtBuckets.life_events.length > 0 ||
    dtBuckets.work.length > 0 ||
    dtBuckets.education.length > 0 ||
    includedAudiences.length > 0 ||
    excludedAudiences.length > 0;

  // Only send ageRange if user narrowed from the 18–65 defaults — otherwise
  // let Meta apply its own default and keep the payload minimal.
  const ageRangeChanged = form.ageMin !== 18 || form.ageMax !== 65;

  const isLifetime = form.budgetType === "LIFETIME";
  const isAbTest = form.publishMode === "AB_TEST";
  const isCarousel = !isAbTest && form.format === "CAROUSEL";
  const isVideo = !isAbTest && form.format === "VIDEO";

  const cleanedVariants = form.adVariants.map((v) => ({
    adHeadline: v.adHeadline,
    adText: v.adText,
    imageUrl: v.imageUrl,
    ctaButton: v.ctaButton,
    ...(v.description?.trim() ? { description: v.description.trim() } : {}),
  }));

  // Strip blank optional fields off carousel cards so we don't send empty
  // strings to Meta (which it'll treat as "no fallback" and render literal "").
  const cleanedCards = form.carouselCards.map((c) => ({
    imageUrl: c.imageUrl,
    link: c.link,
    ...(c.headline?.trim() ? { headline: c.headline.trim() } : {}),
    ...(c.description?.trim() ? { description: c.description.trim() } : {}),
  }));

  return {
    accountId: withActPrefix(form.accountId),
    pageId: form.pageId,
    campaignName: form.campaignName,
    publishMode: form.publishMode,
    // Branch creative fields by publish mode + ad type — keeps the payload
    // minimal and unambiguous for the backend's discriminators. In AB_TEST
    // mode, adText/ctaButton live inside each variant; in SINGLE_AD mode
    // they're top-level shared across the single creative.
    ...(isAbTest
      ? {
          adLink: form.websiteUrl,
          adVariants: cleanedVariants,
        }
      : {
          adText: form.primaryTexts[0],
          ctaButton: form.callToAction,
          ...(isCarousel
            ? {
                adType: "CAROUSEL" as const,
                carouselCards: cleanedCards,
              }
            : isVideo
              ? {
                  adType: "VIDEO" as const,
                  adHeadline: form.headlines[0],
                  adLink: form.websiteUrl,
                  videoUrl: form.videos[0],
                  ...(form.videoThumbnailUrl ? { videoThumbnailUrl: form.videoThumbnailUrl } : {}),
                  ...(form.captionsUrl ? { captionsUrl: form.captionsUrl } : {}),
                }
              : {
                  adType: "SINGLE_IMAGE" as const,
                  adHeadline: form.headlines[0],
                  adLink: form.websiteUrl,
                  imageUrl: form.images[0],
                }),
        }),
    objective: form.objective,
    // R2 additions
    budgetType: form.budgetType,
    ...(isLifetime
      ? { lifetimeBudget: form.lifetimeBudget }
      : { dailyBudget: form.dailyBudget }),
    ...(form.specialAdCategory?.[0] !== "NONE"
      ? { specialAdCategory: form.specialAdCategory?.[0] }
      : {}),
    // PR B — advanced adset/campaign fields, all conditionally emitted so a
    // wizard left at defaults still produces a minimal payload.
    ...(form.isCboEnabled ? { isCbo: true } : {}),
    // Only meaningful in CBO mode. Sending it without isCbo:true would be
    // rejected by Meta, so we gate strictly on both flags.
    ...(form.isCboEnabled && form.budgetRebalanceFlag ? { budgetRebalanceFlag: true } : {}),
    ...(form.bidStrategy !== "LOWEST_COST_WITHOUT_CAP"
      ? { bidStrategy: form.bidStrategy }
      : {}),
    ...(form.bidAmount > 0 ? { bidAmount: form.bidAmount } : {}),
    ...(form.dsaBeneficiary.trim() ? { dsaBeneficiary: form.dsaBeneficiary.trim() } : {}),
    ...(form.dsaPayor.trim() ? { dsaPayor: form.dsaPayor.trim() } : {}),
    ...(form.optimizationGoal ? { optimizationGoal: form.optimizationGoal } : {}),
    ...(form.billingEvent ? { billingEvent: form.billingEvent } : {}),
    // attribution_spec is an array of {event_type, window_days}. Expand the
    // single picker into Meta's wire format.
    ...(form.attributionWindow
      ? {
          attributionSpec: (() => {
            switch (form.attributionWindow) {
              case "1d_click":
                return [{ event_type: "CLICK_THROUGH" as const, window_days: 1 }];
              case "7d_click":
                return [{ event_type: "CLICK_THROUGH" as const, window_days: 7 }];
              case "1d_view":
                return [{ event_type: "VIEW_THROUGH" as const, window_days: 1 }];
              case "7d_click_1d_view":
                return [
                  { event_type: "CLICK_THROUGH" as const, window_days: 7 },
                  { event_type: "VIEW_THROUGH" as const, window_days: 1 },
                ];
            }
          })(),
        }
      : {}),
    ...(form.frequencyCapImpressions > 0 && form.frequencyCapIntervalDays > 0
      ? {
          frequencyControlSpecs: [
            {
              event: "IMPRESSIONS" as const,
              interval_days: form.frequencyCapIntervalDays,
              max_frequency: form.frequencyCapImpressions,
            },
          ],
        }
      : {}),
    ...(form.daypartingBlocks.length > 0
      ? {
          adsetSchedule: form.daypartingBlocks.map((b) => ({
            days: b.days,
            hours_start: b.startHour,
            hours_end: b.endHour,
            timezone_type: "USER",
          })),
        }
      : {}),
    ...(form.scheduleStart ? { startTime: new Date(form.scheduleStart).toISOString() } : {}),
    ...(form.scheduleEnd ? { endTime: new Date(form.scheduleEnd).toISOString() } : {}),
    ...(form.descriptions[0].trim() ? { description: form.descriptions[0].trim() } : {}),
    // R3a — pixel + conversion event are only meaningful when objective is SALES
    ...(form.objective === "OUTCOME_SALES" && form.pixelId
      ? { pixelId: form.pixelId }
      : {}),
    ...(form.objective === "OUTCOME_SALES" && form.conversionEvent
      ? { conversionEvent: form.conversionEvent }
      : {}),
    // Tier-1
    ...(ageRangeChanged ? { ageRange: { min: form.ageMin, max: form.ageMax } } : {}),
    ...(form.genders[0] !== "ALL" ? { gender: form.genders[0] } : {}),
    ...(form.manualPlatforms.length > 0 ? { placements: form.manualPlatforms } : {}),
    // PR C — granular placement positions (e.g. "instagram_reels"). When set,
    // backend forwards them as the publisher-platform-specific position arrays.
    ...(form.manualPositions.length > 0
      ? { placementPositions: form.manualPositions }
      : {}),
    // PR E — destination type + commerce/lead-form/dynamic creative
    ...(form.destinationType !== "WEBSITE" ? { destinationType: form.destinationType } : {}),
    ...(form.leadFormId ? { leadFormId: form.leadFormId } : {}),
    ...(form.catalogId ? { catalogId: form.catalogId } : {}),
    ...(form.productSetId ? { productSetId: form.productSetId } : {}),
    ...(form.instantExperienceId
      ? { instantExperienceId: form.instantExperienceId }
      : {}),
    ...(form.phoneNumber.trim() ? { phoneNumber: form.phoneNumber.trim() } : {}),
    ...(form.dynamicCreative ? { dynamicCreative: true } : {}),
    ...(form.urlParameters.trim() ? { urlTags: form.urlParameters.trim() } : {}),
    // PR L — Meta UX parity. Each conditional so the payload stays minimal
    // when the user hasn't touched a field. Field names mirror what backend
    // documented in the integration contract.
    ...(form.campaignSpendingLimit > 0
      ? { campaignSpendingLimit: form.campaignSpendingLimit }
      : {}),
    // A/B test is collected via publishMode === "AB_TEST" already; backend's
    // new abTestEnabled flag is a parallel signal (enroll-in-experiment).
    ...(form.publishMode === "AB_TEST" ? { abTestEnabled: true } : {}),
    // conversionLocation is required when conversionLocation is non-WEBSITE
    // since backend uses it to route to the right destination shape.
    ...(form.conversionLocation && form.conversionLocation !== "WEBSITE"
      ? { conversionLocation: form.conversionLocation }
      : {}),
    // chargedEvent is backend's alias for billingEvent — backend accepts
    // either name; we send chargedEvent going forward.
    ...(form.billingEvent ? { chargedEvent: form.billingEvent } : {}),
    ...(form.deliveryType !== "STANDARD" ? { deliveryType: form.deliveryType } : {}),
    // Ad-set spend limits. Only when the toggle is on AND both values > 0.
    ...(form.adsetSpendLimitEnabled && form.minDailySpend > 0
      ? { adSetSpendLimitMin: form.minDailySpend }
      : {}),
    ...(form.adsetSpendLimitEnabled && form.maxDailySpend > 0
      ? { adSetSpendLimitMax: form.maxDailySpend }
      : {}),
    // Advantage+ audience — sent when user is on the ADVANTAGE_PLUS audience mode.
    ...(form.audienceMode === "ADVANTAGE_PLUS" ? { useAdvantagePlusAudience: true } : {}),
    // Advantage+ placements — when ADVANTAGE strategy is on, omit manual
    // placement selections; backend reads the flag and ignores placements[].
    ...(form.placementStrategy === "ADVANTAGE"
      ? { advantagePlusPlacement: true }
      : {}),
    ...(form.savedAudienceId ? { savedAudienceId: form.savedAudienceId } : {}),
    ...(form.connections.length > 0 ? { connections: form.connections } : {}),
    ...(form.wifiOnly ? { wifiOnly: true } : {}),
    ...(form.inventoryFilter !== "STANDARD"
      ? { inventoryFilter: form.inventoryFilter }
      : {}),
    ...(form.blockLists.length > 0 ? { blockLists: form.blockLists } : {}),
    ...(form.contentTypeExclusions.length > 0
      ? { contentTypeExclusions: form.contentTypeExclusions }
      : {}),
    // Ad / creative — Instagram actor + partnership ad.
    ...(form.instagramAccountId
      ? { instagramActorId: form.instagramAccountId }
      : {}),
    ...(form.isPartnershipAd && form.isPartnershipAdCode.trim()
      ? { partnershipAdCode: form.isPartnershipAdCode.trim() }
      : {}),
    // Dynamic Creative asset feed — multi-text/multi-headline/etc. Only when
    // dynamicCreative is on AND the user provided at least one variation.
    ...(form.dynamicCreative && form.primaryTexts.length > 0
      ? { adTexts: form.primaryTexts.filter((t) => t.trim()) }
      : {}),
    ...(form.dynamicCreative && form.headlines.length > 0
      ? { adHeadlines: form.headlines.filter((t) => t.trim()) }
      : {}),
    ...(form.dynamicCreative && form.descriptions.length > 0
      ? { descriptions: form.descriptions.filter((t) => t.trim()) }
      : {}),
    ...(form.dynamicCreative && form.callToAction
      ? { callToActions: [form.callToAction] }
      : {}),
    ...(form.advantageCreative ? { advantagePlusCreative: true } : {}),
    ...(form.displayLink.trim() ? { displayLink: form.displayLink.trim() } : {}),
    // urlParameters is backend's alias for urlTags. Send the same value under
    // both names so older and newer backend builds both accept it.
    ...(form.urlParameters.trim() ? { urlParameters: form.urlParameters.trim() } : {}),
    ...(form.trackingAppEvents ? { appEvents: true } : {}),
    ...(form.offlineEvents ? { offlineEvents: true } : {}),
    ...(form.thirdPartyPixelIds.length > 0
      ? { thirdPartyPixelIds: form.thirdPartyPixelIds }
      : {}),
    // PR L (post-spec) — promotedObject for APP_PROMOTION. Both fields are
    // required by Meta; backend rejects an APP_PROMOTION campaign without them.
    ...(form.objective === "OUTCOME_APP_PROMOTION" &&
    form.applicationId.trim() &&
    form.objectStoreUrl.trim()
      ? {
          promotedObject: {
            application_id: form.applicationId.trim(),
            object_store_url: form.objectStoreUrl.trim(),
          },
        }
      : {}),
    // Modern targeting shape: AND-of-OR groups via flexible_spec[], with
    // exclusions in a sibling block. The wizard UI doesn't model AND-groups,
    // so every selected item lands in flexible_spec[0]. Geo and custom
    // audiences stay at the top level — Meta keeps them there in both shapes.
    //
    // Backend accepts both legacy flat fields and this modern shape during
    // transition (see backend spec §4.2); we send modern going forward.
    targeting: hasAnyTargeting ||
      form.locales.length > 0 ||
      form.osTargeting.length > 0 ||
      form.devicePlatforms.length > 0 ||
      form.zips.length > 0 ||
      form.customLocations.length > 0
      ? (() => {
          const includedGroup = {
            ...(includedInterests.length ? { interests: includedInterests } : {}),
            ...(dtBuckets.behaviors.length ? { behaviors: dtBuckets.behaviors } : {}),
            ...(dtBuckets.demographics.length
              ? { demographics: dtBuckets.demographics }
              : {}),
            ...(dtBuckets.life_events.length ? { life_events: dtBuckets.life_events } : {}),
            ...(dtBuckets.work.length ? { work: dtBuckets.work } : {}),
            ...(dtBuckets.education.length ? { education: dtBuckets.education } : {}),
          };
          // The wizard only models excluded interests today — no UI exists
          // for excluding behaviors/demographics/etc. If that changes, this
          // is where to add the parallel buckets.
          const exclusions = excludedInterests.length
            ? { interests: excludedInterests }
            : undefined;
          // Merge zips + custom_locations into the existing included-geo block.
          // Meta expects zips as { key, name } pairs and custom_locations as
          // { latitude, longitude, radius, distance_unit }.
          const geoIncludedWithExtras = (geoIncluded ||
            form.zips.length > 0 ||
            form.customLocations.length > 0)
            ? {
                ...(geoIncluded ?? {}),
                ...(form.zips.length > 0
                  ? {
                      zips: form.zips.map((z) => ({
                        key: z,
                        name: z,
                      })),
                    }
                  : {}),
                ...(form.customLocations.length > 0
                  ? {
                      custom_locations: form.customLocations.map((c) => ({
                        latitude: c.lat,
                        longitude: c.lng,
                        radius: c.radiusKm,
                        distance_unit: "kilometer" as const,
                        ...(c.name ? { name: c.name } : {}),
                      })),
                    }
                  : {}),
              }
            : undefined;
          return {
            ...(geoIncludedWithExtras ? { geo_locations: geoIncludedWithExtras } : {}),
            ...(geoExcluded ? { excluded_geo_locations: geoExcluded } : {}),
            ...(Object.keys(includedGroup).length
              ? { flexible_spec: [includedGroup] }
              : {}),
            ...(exclusions ? { exclusions } : {}),
            ...(includedAudiences.length ? { custom_audiences: includedAudiences } : {}),
            ...(excludedAudiences.length
              ? { excluded_custom_audiences: excludedAudiences }
              : {}),
            // PR C — language / OS / device targeting
            ...(form.locales.length > 0 ? { locales: form.locales } : {}),
            ...(form.osTargeting.length > 0 ? { user_os: form.osTargeting } : {}),
            ...(form.devicePlatforms.length > 0
              ? { device_platforms: form.devicePlatforms }
              : {}),
          };
        })()
      : undefined,
    // Spec Alignment Additions
    adSetName: form.name.trim() || form.campaignName.trim(),
    adName: form.name.trim() || form.campaignName.trim(),
    conversionLocation: form.conversionLocation,
    audienceMode: form.audienceMode,
    adsetSpendLimitEnabled: form.adsetSpendLimitEnabled,
    minDailySpend: form.minDailySpend,
    maxDailySpend: form.maxDailySpend,
    partnershipAd: form.isPartnershipAd,
    advantageCreative: form.advantageCreative,
    placementStrategy: form.placementStrategy,
    costPerResultGoal: form.costPerResultGoal,
    messagingApps: form.messagingApps,
  };
};

function MetaAdsWizardPage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam, campaignId: campaignIdParam } = useParams<{
    clientId?: string;
    campaignId?: string;
  }>();
  const clientId = clientIdParam ? Number(clientIdParam) : null;
  const campaignId = campaignIdParam ?? null;
  const isEditMode = !!campaignId;

  const { data: clientsData } = useClients();
  const clients = clientsData || [];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardFormState>(INITIAL_FORM_STATE);
  const [prefilled, setPrefilled] = useState(false);
  // Per-step flag: flipped when the user clicks "Continue" with invalid
  // input so the child step can light up every required-field error at once
  // instead of only the ones the user manually touched.
  const [showStepErrors, setShowStepErrors] = useState<Record<number, boolean>>({});
  // Captures `{ success: false, message }` responses from publish/saveEdit so
  // we can surface them in the Step 4 banner. Mutation `error` is null on
  // 200-with-success-false, so the toast was the only signal until now.
  const [softFailure, setSoftFailure] = useState<string | null>(null);
  // True if the user has changed any field — used to warn before discarding.
  const [isDirty, setIsDirty] = useState(false);
  // Holds the route we're about to navigate to once the user confirms discard.
  const [pendingExit, setPendingExit] = useState<{ to: string } | null>(null);
  // Final publish confirmation — irreversible Meta spend, so confirm first.
  const [confirmPublish, setConfirmPublish] = useState(false);

  // Async publish flow (replaces the legacy synchronous POST /publish):
  // submit job → poll until terminal. Edit mode still uses the sync PUT path
  // because the backend's queue only fronts POST /async-publish.
  const {
    mutateAsync: submitJob,
    isPending: isSubmittingJob,
    error: submitError,
  } = useSubmitPublishJob();
  // jobId is null until submitJob resolves. Once set, useJobStatus starts
  // polling on the backend's recommended cadence and stops on terminal state.
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const {
    data: jobStatus,
    error: jobError,
  } = useJobStatus(activeJobId);
  const {
    mutateAsync: saveEdit,
    isPending: isSavingEdit,
    error: editError,
  } = useUpdateCampaign();

  // Used to reconcile custom-audience names/types after prefill: the campaign
  // details endpoint returns only IDs in targeting.custom_audiences.
  const { data: audiencesData } = useAudiences(clientId);

  const {
    data: campaignDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
  } = useCampaignDetails(campaignId, clientId);

  // Prefill the wizard once details arrive in edit mode. The `prefilled` guard
  // prevents user edits from being clobbered if the query refetches.
  useEffect(() => {
    if (isEditMode && campaignDetails && !prefilled) {
      const next = toWizardFormState(campaignDetails);
      setForm(next);
      setPrefilled(true);
      // Just hydrated from backend — not a user-driven change.
      setIsDirty(false);
    }
  }, [isEditMode, campaignDetails, prefilled]);

  // After prefill (or whenever the audiences list arrives), backfill the
  // human-readable name + correct audienceType onto the customAudiences
  // entries that came from the targeting block (which only has IDs).
  useEffect(() => {
    const list = audiencesData?.audiences;
    if (!list || list.length === 0) return;
    setForm((f) => {
      let changed = false;
      const next = f.customAudiences.map((a) => {
        const match = list.find((x) => x.id === a.id);
        if (!match) return a;
        const wantsName = a.name === a.id;
        const wantsType = a.audienceType !== match.type;
        if (!wantsName && !wantsType) return a;
        changed = true;
        return {
          ...a,
          name: match.name ?? a.name,
          audienceType: match.type,
        };
      });
      return changed ? { ...f, customAudiences: next } : f;
    });
  }, [audiencesData]);

  // Create-mode only: when the user picks a different client from the header,
  // every client-scoped field becomes invalid. Clear them so Step 1's auto-pick
  // effect can populate the new client's defaults. In edit mode we keep the
  // fetched accountId/pageId — switching client mid-edit isn't supported.
  useEffect(() => {
    if (isEditMode) return;
    setForm((f) => ({
      ...f,
      accountId: "", pageId: "",
      pixelId: "", conversionEvent: "", customAudiences: [],
    }));
  }, [clientId, isEditMode]);

  // Browser-level guard against tab close / reload while there are unsaved
  // changes. Modern browsers ignore the message text and show a generic
  // prompt — what matters is returning a truthy value from the handler.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Wrap setForm so any user-driven change flips `isDirty`. We deliberately
  // do NOT flip it in the prefill effect (that's not a user change).
  const setFormDirty = useCallback(
    (updater: (prev: WizardFormState) => WizardFormState) => {
      setForm(updater);
      setIsDirty(true);
    },
    []
  );

  // Funnel every navigation away from the wizard through this guard. If
  // there are unsaved changes we stash the destination and open the confirm
  // dialog; the user picks Discard or Keep editing.
  const navigateGuarded = useCallback(
    (to: string) => {
      if (!isDirty) {
        navigate(to);
        return;
      }
      setPendingExit({ to });
    },
    [isDirty, navigate]
  );

  const handleClientChange = (newClientId: number) => {
    if (newClientId === clientId) return;
    navigateGuarded(`/data-sources/meta-ads/wizard/${newClientId}`);
  };

  const canAdvance = useMemo(() => {
    if (step === 0) {
      // Note: accountId and pageId are intentionally excluded here.
      // When only one ad account / page exists, Step1Settings auto-fills them
      // asynchronously via useEffect after the API call resolves. Blocking
      // canAdvance on those fields caused Continue to stay grey on first load
      // while the API was still in-flight — even after the user typed a valid
      // campaign name. Field-level errors (shown via showAllErrors when the
      // user clicks Continue with them empty) already guard these fields.
      const basics = form.campaignName.trim().length > 0;
      const budgetOk =
        form.budgetType === "DAILY"
          ? form.dailyBudget >= 1
          : form.lifetimeBudget >= 1 && !!form.scheduleEnd;
      // Schedule consistency — if both are set, end must be after start.
      // Otherwise Meta rejects the publish (and lifetime budgets become unbillable).
      const scheduleOk =
        !form.scheduleStart || !form.scheduleEnd || new Date(form.scheduleEnd) > new Date(form.scheduleStart);
      // Sales objective demands a pixel + a conversion event — backend
      // rejects the publish otherwise, so gate it at Step 1.
      const conversionOk =
        form.objective === "OUTCOME_SALES"
          ? !!form.pixelId && !!form.conversionEvent
          : true;
      return basics && budgetOk && scheduleOk && conversionOk;
    }
    if (step === 1) return true; // targeting is optional
    if (step === 2) {
      if (form.publishMode === "AB_TEST") {
        // Shared destination URL + 2–5 variants, each with image + headline + adText.
        if (form.websiteUrl.trim().length === 0) return false;
        if (form.adVariants.length < 2) return false;
        return form.adVariants.every(
          (v) =>
            v.imageUrl.trim().length > 0 &&
            v.adHeadline.trim().length > 0 &&
            v.adText.trim().length > 0
        );
      }
      // SINGLE_AD modes — primary text + CTA are shared and required either way.
      if (form.primaryTexts[0].trim().length === 0) return false;
      if (form.format === "CAROUSEL") {
        // Need 2–10 cards, each with a non-empty image and link.
        if (form.carouselCards.length < 2) return false;
        return form.carouselCards.every(
          (c) => c.imageUrl.trim().length > 0 && c.link.trim().length > 0
        );
      }
      if (form.format === "VIDEO") {
        return (
          form.headlines[0].trim().length > 0 &&
          form.websiteUrl.trim().length > 0 &&
          form.videos[0].trim().length > 0
        );
      }
      // SINGLE_IMAGE — original validation
      return (
        form.headlines[0].trim().length > 0 &&
        form.websiteUrl.trim().length > 0 &&
        form.images[0].trim().length > 0
      );
    }
    return true;
  }, [step, form]);

  const handleBack = () => {
    if (step === 0) {
      navigateGuarded(
        clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads"
      );
      return;
    }
    setStep((s) => s - 1);
  };

  const handleNext = () => {
    if (!canAdvance) {
      // Light up every required-field error on this step so the user can see
      // *why* the Continue button was disabled instead of guessing.
      setShowStepErrors((m) => ({ ...m, [step]: true }));
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handlePublish = async () => {
    setSoftFailure(null);
    setActiveJobId(null);
    // Fresh idempotency key per submit-click. Survives transient network
    // failures (retry with same key returns the cached job) but a full page
    // reload starts a new key — deliberate, since reloads usually mean the
    // user changed their mind.
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const { jobId } = await submitJob({
        payload: buildPayload(form),
        idempotencyKey,
      });
      // Polling takes over from here — see the terminal-state effect below.
      setActiveJobId(jobId);
    } catch {
      // useSubmitPublishJob already toasts the submit failure.
    }
  };

  // Watch the polled job for terminal states and dispatch outcomes:
  //   PUBLISHED       → mark clean, navigate back to campaign list
  //   NEEDS_REVIEW    → success toast, navigate (campaign is queued for approval)
  //   FAILED / PARTIAL → surface error in Step 4 banner so the user can adjust
  useEffect(() => {
    if (!jobStatus || !TERMINAL_JOB_STATES.has(jobStatus.state)) return;
    if (jobStatus.state === "PUBLISHED") {
      toast.success("Ad successfully published to Meta!");
      setIsDirty(false);
      navigate(clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads");
      return;
    }
    if (jobStatus.state === "NEEDS_REVIEW") {
      toast.success("Submitted for approval");
      setIsDirty(false);
      navigate(clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads");
      return;
    }
    // FAILED or PARTIAL — leave the user on Step 4 with an actionable banner.
    // PARTIAL means the campaign exists at Meta but a child entity failed;
    // we annotate so the user knows to clean up in Meta directly.
    const trace = jobStatus.fbtrace_id ? ` (Reference: ${jobStatus.fbtrace_id})` : "";
    const message =
      jobStatus.state === "PARTIAL"
        ? `Campaign created but a child entity failed${trace}. ${jobStatus.lastError ?? ""}`.trim()
        : `${jobStatus.lastError ?? "Meta rejected the ad"}${trace}`;
    setSoftFailure(message);
    // Clear the job id so the user can retry without stale polling state.
    setActiveJobId(null);
  }, [jobStatus, clientId, navigate]);

  const handleSaveEdit = async () => {
    if (!campaignId || !clientId) return;
    setSoftFailure(null);
    const base = buildPayload(form);
    // Backend doc strongly recommends passing the exact adSetId/adId so it
    // knows which child entities to mutate inside the campaign.
    const payload: UpdateCampaignPayload = {
      ...base,
      ...(campaignDetails?.adSetId ? { adSetId: campaignDetails.adSetId } : {}),
      ...(campaignDetails?.adId ? { adId: campaignDetails.adId } : {}),
    };
    try {
      const result = await saveEdit({ campaignId, payload, clientId });
      if (result.success) {
        setIsDirty(false);
        navigate(`/data-sources/meta-ads/${clientId}`);
      } else {
        setSoftFailure(result.message || "Meta rejected the edit");
      }
    } catch {
      // useUpdateCampaign already toasts the error
    }
  };

  // Submit click — for publish we open a confirmation; saveEdit goes straight
  // through since it's an edit to an existing campaign (much less surprising).
  const handleSubmitClick = () => {
    if (isEditMode) {
      handleSaveEdit();
      return;
    }
    setConfirmPublish(true);
  };

  // Publishing is "in flight" from submit-click through terminal poll. We
  // gate the button on (submitting OR active-non-terminal-job).
  const isJobInFlight =
    activeJobId !== null &&
    (!jobStatus || !TERMINAL_JOB_STATES.has(jobStatus.state));
  const isPublishing = isSubmittingJob || isJobInFlight;
  const isSubmitting = isEditMode ? isSavingEdit : isPublishing;
  const errorFromHook = isEditMode ? editError : submitError ?? jobError;
  // Show whichever surfaces first: hook error, polled job's lastError, or
  // the soft `{success:false,message}` set from terminal-state effect above.
  const reviewError = errorFromHook?.message || softFailure;

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-[#fafafa]">
      <div className="w-full h-full flex flex-col">
        {/* Top Bar */}
        <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm">
          <div className="flex flex-col gap-2">
            <Breadcrumb>
              <BreadcrumbList className="text-xs font-medium text-slate-400">
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    to={clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads"}
                  >
                    Meta Ads
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900 font-bold">
                    {isEditMode ? "Edit Ad" : "Create Ad"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0866FF] to-blue-700 flex items-center justify-center shadow-[0_8px_16px_rgba(8,102,255,0.2)]">
                <SiMeta className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  {isEditMode ? "Edit Meta Ad" : "Create Meta Ad"}
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Step {step + 1} of {TOTAL_STEPS} — campaign, ad set, creative, and ad in one flow
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[240px]">
              <Select
                value={clientId?.toString() ?? ""}
                onValueChange={(v) => handleClientChange(Number(v))}
                disabled={isEditMode}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white font-medium text-slate-700 shadow-sm">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-800" />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                navigateGuarded(
                  clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads"
                )
              }
              className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 px-6"
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Stepper */}
            <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm">
              <Stepper current={step} />
            </div>

            {!clientId ? (
              <div className="rounded-[20px] border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
                A client is required to publish ads. Open this wizard from a client's Meta Ads
                page.
              </div>
            ) : isEditMode && (isLoadingDetails || !prefilled) ? (
              isDetailsError ? (
                <div className="rounded-[20px] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
                  Failed to load campaign: {detailsError?.message || "unknown error"}
                </div>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-[60px] rounded-[20px]" />
                  <Skeleton className="h-[300px] rounded-[20px]" />
                </div>
              )
            ) : (
              <>
                {step === 0 && (
                  <Step1Settings
                    form={form}
                    setForm={setFormDirty}
                    clientId={clientId}
                    showAllErrors={!!showStepErrors[0]}
                  />
                )}
                {step === 1 && (
                  <Step2Audience form={form} setForm={setFormDirty} clientId={clientId} />
                )}
                {step === 2 && (
                  <Step3Creative form={form} setForm={setFormDirty} showAllErrors={!!showStepErrors[2]} clientId={clientId} />
                )}
                {step === 3 && <Step4Review form={form} publishError={reviewError} />}
              </>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between sticky bottom-0 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[20px] px-6 py-4 shadow-md">
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 px-5 gap-2"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 0 ? "Exit" : "Back"}
              </Button>

              {step < TOTAL_STEPS - 1 ? (
                <Button
                  onClick={handleNext}
                  // Intentionally NOT disabled when !canAdvance — handleNext
                  // flips showStepErrors so the user sees *why* the step is
                  // incomplete instead of a dead button.
                  className={
                    canAdvance
                      ? "h-11 rounded-xl px-6 gap-2 font-bold bg-slate-900 hover:bg-slate-800"
                      : "h-11 rounded-xl px-6 gap-2 font-bold bg-slate-300 hover:bg-slate-400 text-white cursor-help"
                  }
                  title={canAdvance ? undefined : "Some required fields are missing — click to see them"}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitClick}
                  disabled={!clientId || isSubmitting || (isEditMode && !prefilled)}
                  className="h-11 rounded-xl px-6 gap-2 font-bold bg-gradient-to-r from-[#0866FF] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEditMode
                        ? "Saving…"
                        : jobStatus?.state === "QUEUED"
                          ? "Queued…"
                          : jobStatus?.state === "PUBLISHING"
                            ? "Publishing…"
                            : "Submitting…"}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isEditMode ? "Save changes" : "Publish to Meta"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved-changes guard: opens when the user tries to leave the wizard
          with dirty form state. Confirming discards local changes. */}
      <AlertDialog
        open={pendingExit !== null}
        onOpenChange={(open) => {
          if (!open) setPendingExit(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't {isEditMode ? "saved" : "published"} this ad yet. Leaving now
              will lose every change you've made in this wizard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const to = pendingExit?.to;
                setPendingExit(null);
                setIsDirty(false);
                if (to) navigate(to);
              }}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final publish confirmation. Publishing books real ad spend on Meta
          immediately, so a single misclick is too costly. */}
      <AlertDialog
        open={confirmPublish}
        onOpenChange={(open) => {
          if (!open) setConfirmPublish(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this ad to Meta?</AlertDialogTitle>
            <AlertDialogDescription>
              This sends the campaign to Meta and begins billing under{" "}
              <span className="font-semibold text-slate-900">{form.campaignName || "—"}</span>{" "}
              at{" "}
              <span className="font-semibold text-slate-900">
                {form.budgetType === "DAILY"
                  ? `${form.dailyBudget.toFixed(2)} / day`
                  : `${form.lifetimeBudget.toFixed(2)} lifetime`}
              </span>
              . You can pause it from Meta Ads Manager afterwards, but the publish itself
              can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review again</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmPublish(false);
                handlePublish();
              }}
              className="bg-gradient-to-r from-[#0866FF] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Publish to Meta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MetaAdsWizardPage;
