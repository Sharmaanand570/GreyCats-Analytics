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
  INITIAL_STATE,
  type WizardState,
} from "@/features/meta/components/adsWizard/types";
import {
  useAudiences,
  useCampaignWizardState,
  usePublishAd,
  useUpdateCampaign,
} from "@/features/meta/hooks/useMetaAdsManager";
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
const splitGeoLocations = (locations: WizardState["adSet"]["locations"]) => {
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

const buildPayload = (form: WizardState): PublishAdPayload => {
  const c = form.campaign;
  const s = form.adSet;
  const a = form.ad;

  const { included, excluded } = splitGeoLocations(s.locations);
  const geoIncluded = toGeoBlock(included);
  const geoExcluded = toGeoBlock(excluded);

  const includedInterests = s.interests.filter((i) => !i.excluded).map((i) => ({ id: i.id, name: i.name }));
  const excludedInterests = s.interests.filter((i) => i.excluded).map((i) => ({ id: i.id, name: i.name }));

  const includedAudiences = s.customAudiences.filter((aud) => !aud.excluded).map((aud) => ({ id: aud.id }));
  const excludedAudiences = s.customAudiences.filter((aud) => aud.excluded).map((aud) => ({ id: aud.id }));

  const dtBuckets = {
    behaviors: [] as { id: string; name: string }[],
    demographics: [] as { id: string; name: string }[],
    life_events: [] as { id: string; name: string }[],
    work: [] as { id: string; name: string; type: "employer" | "position" | "industry" }[],
    education: [] as { id: string; name: string; type: "school" | "field_of_study" }[],
  };
  for (const item of s.detailedTargeting) {
    const base = { id: item.id, name: item.name };
    switch (item.type) {
      case "behaviors": dtBuckets.behaviors.push(base); break;
      case "demographics": dtBuckets.demographics.push(base); break;
      case "life_events": dtBuckets.life_events.push(base); break;
      case "work_employers": dtBuckets.work.push({ ...base, type: "employer" }); break;
      case "work_positions": dtBuckets.work.push({ ...base, type: "position" }); break;
      case "education_schools": dtBuckets.education.push({ ...base, type: "school" }); break;
      case "education_majors": dtBuckets.education.push({ ...base, type: "field_of_study" }); break;
    }
  }

  const hasAnyTargeting =
    !!geoIncluded || !!geoExcluded ||
    includedInterests.length > 0 || excludedInterests.length > 0 ||
    dtBuckets.behaviors.length > 0 || dtBuckets.demographics.length > 0 ||
    dtBuckets.life_events.length > 0 || dtBuckets.work.length > 0 ||
    dtBuckets.education.length > 0 || includedAudiences.length > 0 ||
    excludedAudiences.length > 0;

  const isAbTest = a.publishMode === "AB_TEST";
  const isCarousel = !isAbTest && a.format === "CAROUSEL";
  const isVideo = !isAbTest && a.format === "SINGLE_IMAGE_VIDEO" && !!a.videos?.[0];

  const cleanedVariants = a.adVariants?.map((v) => ({
    adHeadline: v.adHeadline,
    adText: v.adText,
    imageUrl: v.imageUrl,
    ctaButton: v.ctaButton as any,
    ...(v.description?.trim() ? { description: v.description.trim() } : {}),
  })) ?? [];

  const cleanedCards = a.carouselCards?.map((cd) => ({
    imageUrl: cd.imageUrl,
    link: cd.link,
    ...(cd.headline?.trim() ? { headline: cd.headline.trim() } : {}),
    ...(cd.description?.trim() ? { description: cd.description.trim() } : {}),
  })) ?? [];

  return {
    accountId: withActPrefix(c.accountId),
    pageId: c.pageId,
    campaignName: c.name,
    publishMode: a.publishMode as any,

    ...(isAbTest
      ? {
          adLink: a.websiteUrl,
          adVariants: cleanedVariants,
        }
      : {
          adText: a.primaryTexts[0] || "",
          ctaButton: a.callToAction as any,
          ...(isCarousel
            ? {
                adType: "CAROUSEL" as const,
                carouselCards: cleanedCards,
              }
            : isVideo
              ? {
                  adType: "VIDEO" as const,
                  adHeadline: a.headlines[0] || "",
                  adLink: a.websiteUrl,
                  videoUrl: a.videos[0] || "",
                  ...(a.videoThumbnailUrl ? { videoThumbnailUrl: a.videoThumbnailUrl } : {}),
                  ...(a.captionsUrl ? { captionsUrl: a.captionsUrl } : {}),
                }
              : {
                  adType: "SINGLE_IMAGE" as const,
                  adHeadline: a.headlines[0] || "",
                  adLink: a.websiteUrl,
                  imageUrl: a.images[0] || "",
                }),
        }),
    objective: c.objective,
    budgetType: (c.isCboEnabled ? (c.lifetimeBudget ? "LIFETIME" : "DAILY") : (s.lifetimeBudget ? "LIFETIME" : "DAILY")) as "LIFETIME" | "DAILY",
    ...(c.isCboEnabled && c.lifetimeBudget ? { lifetimeBudget: c.lifetimeBudget } : {}),
    ...(c.isCboEnabled && c.dailyBudget ? { dailyBudget: c.dailyBudget } : {}),
    ...(s.lifetimeBudget && !c.isCboEnabled ? { lifetimeBudget: s.lifetimeBudget } : {}),
    ...(s.dailyBudget && !c.isCboEnabled ? { dailyBudget: s.dailyBudget } : {}),

    ...(c.specialAdCategories.length > 0 ? { specialAdCategory: c.specialAdCategories[0] } : {}),
    ...(s.scheduleStart ? { startTime: new Date(s.scheduleStart).toISOString() } : {}),
    ...(s.scheduleEnd ? { endTime: new Date(s.scheduleEnd).toISOString() } : {}),
    ...(a.descriptions[0]?.trim() ? { description: a.descriptions[0].trim() } : {}),

    ...(c.objective === "OUTCOME_SALES" && s.pixelId ? { pixelId: s.pixelId } : {}),
    ...(c.objective === "OUTCOME_SALES" && s.conversionEvent ? { conversionEvent: s.conversionEvent as any } : {}),

    // Meta UX parity additions.
    ...(c.campaignSpendingLimit ? { campaignSpendingLimit: c.campaignSpendingLimit } : {}),
    ...(c.abTestEnabled ? { abTestEnabled: true } : {}),
    ...(!c.isCboEnabled && c.budgetRebalanceFlag ? { budgetRebalanceFlag: true } : {}),
    // App promotion: backend reads the App ID from promotedObject.application_id.
    ...(c.objective === "OUTCOME_APP_PROMOTION" && c.ios14CampaignEnabled && c.ios14AppId
      ? { promotedObject: { application_id: c.ios14AppId } }
      : {}),

    // Step 2 ad-set additions.
    ...(s.name ? { adSetName: s.name } : {}),
    ...(s.performanceGoal ? { optimizationGoal: s.performanceGoal } : {}),
    ...(s.costPerResultGoal ? { costPerResultGoal: s.costPerResultGoal } : {}),
    // Frequency control — only sent when user picked Cap mode (Meta's
    // frequency_control_specs expects a max-frequency value).
    ...(s.frequencyControl && s.frequencyControl.mode === "CAP"
      ? {
          frequencyControlSpecs: [
            {
              event: "IMPRESSIONS" as const,
              interval_days: s.frequencyControl.days,
              max_frequency: s.frequencyControl.count,
            },
          ],
        }
      : {}),
    ...(s.dynamicCreative ? { dynamicCreative: true } : {}),

    ...(s.ageMin !== 18 || s.ageMax !== 65 ? { ageRange: { min: s.ageMin, max: s.ageMax } } : {}),
    ...(s.genders[0] !== "ALL" ? { gender: s.genders[0] as any } : {}),
    ...(s.placementStrategy === "MANUAL" && s.manualPlatforms.length > 0 ? { placements: s.manualPlatforms as any[] } : {}),

    targeting: hasAnyTargeting
      ? {
          ...(geoIncluded ? { geo_locations: geoIncluded } : {}),
          ...(geoExcluded ? { excluded_geo_locations: geoExcluded } : {}),
          ...(includedInterests.length ? { interests: includedInterests } : {}),
          ...(excludedInterests.length ? { excluded_interests: excludedInterests } : {}),
          ...(dtBuckets.behaviors.length ? { behaviors: dtBuckets.behaviors } : {}),
          ...(dtBuckets.demographics.length ? { demographics: dtBuckets.demographics } : {}),
          ...(dtBuckets.life_events.length ? { life_events: dtBuckets.life_events } : {}),
          ...(dtBuckets.work.length ? { work: dtBuckets.work } : {}),
          ...(dtBuckets.education.length ? { education: dtBuckets.education } : {}),
          ...(includedAudiences.length ? { custom_audiences: includedAudiences } : {}),
          ...(excludedAudiences.length ? { excluded_custom_audiences: excludedAudiences } : {}),
        }
      : undefined,
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
  const [form, setForm] = useState<WizardState>(INITIAL_STATE);
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

  const { mutateAsync: publish, isPending: isPublishing, error: publishError } =
    usePublishAd();
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
  } = useCampaignWizardState(campaignId, clientId);

  // Prefill the wizard once details arrive in edit mode. The `prefilled` guard
  // prevents user edits from being clobbered if the query refetches.
  useEffect(() => {
    if (isEditMode && campaignDetails && !prefilled) {
      setForm(campaignDetails);
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
      const next = f.adSet.customAudiences.map((a) => {
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
      return changed ? { ...f, adSet: { ...f.adSet, customAudiences: next } } : f;
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
      campaign: { ...f.campaign, accountId: "", pageId: "" },
      adSet: { ...f.adSet, pixelId: "", conversionEvent: "", customAudiences: [] },
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
    (updater: (prev: WizardState) => WizardState) => {
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
      const basics =
        !!form.campaign.accountId &&
        !!form.campaign.pageId &&
        form.campaign.name.trim().length > 0;
      // Budget is set on Step 1 only when CBO is on (campaign-level budget) AND
      // we're on Auction. Reservation has no budget input on Step 1, and when
      // CBO is off the budget moves to the ad-set step.
      const budgetOk =
        form.campaign.buyingType === "RESERVATION"
          ? true
          : form.campaign.isCboEnabled
            ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") === "DAILY"
              ? (form.campaign.dailyBudget ?? 0) >= 1
              : (form.campaign.lifetimeBudget ?? 0) >= 1 && !!form.adSet.scheduleEnd
            : true;
      // Schedule consistency — if both are set, end must be after start.
      // Otherwise Meta rejects the publish (and lifetime budgets become unbillable).
      const scheduleOk =
        !form.adSet.scheduleStart || !form.adSet.scheduleEnd || new Date(form.adSet.scheduleEnd) > new Date(form.adSet.scheduleStart);
      // Sales objective demands a pixel + a conversion event — backend
      // rejects the publish otherwise, so gate it at Step 1.
      const conversionOk =
        form.campaign.objective === "OUTCOME_SALES"
          ? !!form.adSet.pixelId && !!form.adSet.conversionEvent
          : true;
      return basics && budgetOk && scheduleOk && conversionOk;
    }
    if (step === 1) return true; // targeting is optional
    if (step === 2) {
      if (form.ad.publishMode === "AB_TEST") {
        // Shared destination URL + 2–5 variants, each with image + headline + adText.
        if (form.ad.websiteUrl.trim().length === 0) return false;
        if ((form.ad.adVariants || []).length < 2) return false;
        return (form.ad.adVariants || []).every(
          (v) =>
            v.imageUrl.trim().length > 0 &&
            v.adHeadline.trim().length > 0 &&
            v.adText.trim().length > 0
        );
      }
      // SINGLE_AD modes — primary text + CTA are shared and required either way.
      if ((form.ad.primaryTexts[0] || "").trim().length === 0) return false;
      if (form.ad.format === "CAROUSEL") {
        // Need 2–10 cards, each with a non-empty image and link.
        if (form.ad.carouselCards.length < 2) return false;
        return form.ad.carouselCards.every(
          (c) => c.imageUrl.trim().length > 0 && c.link.trim().length > 0
        );
      }
      if (form.ad.format === "SINGLE_IMAGE_VIDEO" && !!form.ad.videos?.[0]) {
        return (
          (form.ad.headlines[0] || "").trim().length > 0 &&
          form.ad.websiteUrl.trim().length > 0 &&
          form.ad.videos[0].trim().length > 0
        );
      }
      // SINGLE_IMAGE — original validation
      return (
        (form.ad.headlines[0] || "").trim().length > 0 &&
        form.ad.websiteUrl.trim().length > 0 &&
        (form.ad.images[0] || "").trim().length > 0
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
    try {
      const result = await publish(buildPayload(form));
      if (result.success) {
        // Saved to Meta — leaving the page is safe.
        setIsDirty(false);
        navigate(clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads");
      } else {
        // HTTP 200 but Meta rejected the ad. usePublishAd shows a toast; we
        // also stash the message so Step 4's banner stays after the toast.
        setSoftFailure(result.message || "Meta rejected the ad");
      }
    } catch {
      // toast + inline review banner handle this
    }
  };

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

  const isSubmitting = isEditMode ? isSavingEdit : isPublishing;
  const submitError = isEditMode ? editError : publishError;
  // Show whichever surfaces first: the hard error from the mutation, or the
  // soft `{success:false,message}` message.
  const reviewError = submitError?.message || softFailure;

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
          <div className={`mx-auto space-y-8 transition-all duration-300 ${step === 2 ? "max-w-7xl w-full" : "max-w-3xl"}`}>
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
                  <Step3Creative
                    form={form}
                    setForm={setFormDirty}
                    showAllErrors={!!showStepErrors[2]}
                    clientId={clientId}
                  />
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
                      {isEditMode ? "Saving…" : "Publishing…"}
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
              <span className="font-semibold text-slate-900">{form.campaign.name || "—"}</span>{" "}
              at{" "}
              <span className="font-semibold text-slate-900">
                {(form.campaign.isCboEnabled ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY")) === "DAILY"
                  ? `${(form.campaign.isCboEnabled ? form.campaign.dailyBudget : form.adSet.dailyBudget)?.toFixed(2)} / day`
                  : `${(form.campaign.isCboEnabled ? form.campaign.lifetimeBudget : form.adSet.lifetimeBudget)?.toFixed(2)} lifetime`}
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
