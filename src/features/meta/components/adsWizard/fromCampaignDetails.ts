import type {
  CampaignHierarchicalData,
  FlexibleSpecGroup,
} from "../../API/metaAdsManagerApi";
import {
  INITIAL_STATE,
  type AdFormat,
  type DestinationType,
  type SelectedDetailedTargeting,
  type SelectedLocation,
  type WizardState,
} from "./types";

const flattenGeo = (
  block:
    | {
        countries?: string[];
        cities?: { key: string; name?: string }[];
        regions?: { key: string; name?: string }[];
        zips?: { key: string; name?: string }[];
        custom_locations?: { key: string; name?: string }[];
      }
    | undefined,
  excluded: boolean
): SelectedLocation[] => {
  if (!block) return [];
  const out: SelectedLocation[] = [];
  (block.countries ?? []).forEach((code) => {
    out.push({ key: code, name: code, type: "country", country_code: code, excluded });
  });
  (block.cities ?? []).forEach((c) => {
    out.push({ key: c.key, name: c.name ?? c.key, type: "city", excluded });
  });
  (block.regions ?? []).forEach((r) => {
    out.push({ key: r.key, name: r.name ?? r.key, type: "region", excluded });
  });
  // Note: zips and custom_locations are stored on WizardState directly as arrays of strings.
  return out;
};

const collectSpec = (groups: FlexibleSpecGroup[] | undefined): FlexibleSpecGroup => {
  const merged: Required<FlexibleSpecGroup> = {
    interests: [],
    behaviors: [],
    demographics: [],
    life_events: [],
    work: [],
    education: [],
  };
  (groups ?? []).forEach((g) => {
    if (g.interests) merged.interests.push(...g.interests);
    if (g.behaviors) merged.behaviors.push(...g.behaviors);
    if (g.demographics) merged.demographics.push(...g.demographics);
    if (g.life_events) merged.life_events.push(...g.life_events);
    if (g.work) merged.work.push(...g.work);
    if (g.education) merged.education.push(...g.education);
  });
  return merged;
};

const flattenDetailedTargeting = (spec: FlexibleSpecGroup): SelectedDetailedTargeting[] => {
  const out: SelectedDetailedTargeting[] = [];
  (spec.behaviors ?? []).forEach((b) => out.push({ id: b.id, name: b.name, type: "behaviors" }));
  (spec.demographics ?? []).forEach((d) =>
    out.push({ id: d.id, name: d.name, type: "demographics" })
  );
  (spec.life_events ?? []).forEach((e) =>
    out.push({ id: e.id, name: e.name, type: "life_events" })
  );
  (spec.work ?? []).forEach((w) => {
    if (w.type === "employer") {
      out.push({ id: w.id, name: w.name, type: "work_employers" });
    } else if (w.type === "position") {
      out.push({ id: w.id, name: w.name, type: "work_positions" });
    }
  });
  (spec.education ?? []).forEach((e) => {
    const type = e.type === "school" ? "education_schools" : "education_majors";
    out.push({ id: e.id, name: e.name, type });
  });
  return out;
};

export const toWizardState = (data: CampaignHierarchicalData): WizardState => {
  const { campaign, adSets } = data;
  const adSet = adSets?.[0];
  const ad = adSet?.ads?.[0];
  const creative = ad?.creative;
  const targeting = adSet?.targeting;

  const includedSpec = collectSpec(targeting?.flexible_spec);
  const customAudiences = (targeting?.custom_audiences ?? []).map((a) => ({
    id: a.id,
    name: (a as any).name ?? a.id,
    audienceType: "CUSTOM" as const,
  }));
  const excludedAudiences = (targeting?.excluded_custom_audiences ?? []).map((a) => ({
    id: a.id,
    name: (a as any).name ?? a.id,
    audienceType: "CUSTOM" as const,
    excluded: true,
  }));

  // Ad Format detection
  let format: AdFormat = INITIAL_STATE.ad.format;
  if (creative?.object_story_spec?.link_data?.child_attachments?.length) {
    format = "CAROUSEL";
  } else if (creative?.object_story_spec?.video_data) {
    format = "SINGLE_IMAGE_VIDEO";
  }

  // Placements detection
  const isAdvantagePlusPlacements = data.legacy?.placementStrategy === "ADVANTAGE" || (!adSet?.placement_positions?.length && !adSet?.user_connection_types?.length);
  const manualPlatforms = isAdvantagePlusPlacements ? [] : ((data.legacy as any)?.placements ?? []);

  const legacy = data.legacy as any;

  // Advantage+ objectives carry their budget at the campaign level (CBO).
  const objective = campaign?.objective ?? INITIAL_STATE.campaign.objective;
  const isAdvantagePlusObjective =
    objective === "OUTCOME_LEADS" ||
    objective === "OUTCOME_SALES" ||
    objective === "OUTCOME_APP_PROMOTION";
  const isCbo = campaign?.is_cbo ?? false;
  // App promotion: backend stores app id in promoted_object on the ad set.
  const ios14AppId = (adSet?.promoted_object as any)?.application_id as string | undefined;

  return {
    campaign: {
      ...INITIAL_STATE.campaign,
      accountId: campaign?.account_id ?? "",
      pageId: creative?.object_story_spec?.page_id ?? "",
      name: campaign?.name ?? "",
      buyingType: (campaign?.buying_type === "RESERVED" ? "RESERVATION" : "AUCTION") as any,
      objective,
      specialAdCategories: campaign?.special_ad_categories ?? [],
      isCboEnabled: isCbo,
      // Strategy radio mirrors CBO for Advantage+ objectives; otherwise stays AD_SET.
      budgetStrategy: isAdvantagePlusObjective && isCbo ? "CAMPAIGN" : "AD_SET",
      abTestEnabled:
        campaign?.execution_options?.includes("include_in_ab_test") ??
        campaign?.ab_test_enabled ??
        false,
      campaignSpendingLimit: campaign?.spend_cap ? campaign.spend_cap / 100 : undefined,
      dailyBudget: campaign?.daily_budget ? campaign.daily_budget / 100 : undefined,
      lifetimeBudget: campaign?.lifetime_budget ? campaign.lifetime_budget / 100 : undefined,
      bidStrategy: campaign?.bid_strategy,
      budgetRebalanceFlag: campaign?.budget_rebalance_flag ?? false,
      dsaBeneficiary: campaign?.dsa_beneficiary ?? undefined,
      dsaPayor: campaign?.dsa_payor ?? undefined,
      ios14CampaignEnabled: objective === "OUTCOME_APP_PROMOTION" && !!ios14AppId,
      ios14AppId,
    },
    adSet: {
      ...INITIAL_STATE.adSet,
      name: adSet?.name ?? "",
      destinationType: (adSet?.destination_type as DestinationType) ?? "WEBSITE",
      conversionLocation: adSet?.destination_type ?? "WEBSITE",
      optimizationGoal: adSet?.optimization_goal ?? INITIAL_STATE.adSet.optimizationGoal,
      // Performance goal mirrors optimization_goal (Meta uses the same enum
      // both names refer to). Falls back to the objective's default.
      performanceGoal: (adSet?.optimization_goal as any) ?? INITIAL_STATE.adSet.performanceGoal,
      pageId: (adSet?.promoted_object as any)?.page_id ?? undefined,
      costPerResultGoal: (adSet as any)?.bid_amount
        ? Number((adSet as any).bid_amount) / 100
        : undefined,
      // Hydrate frequency control from the first freq spec, if present.
      frequencyControl: (adSet as any)?.frequency_control_specs?.[0]
        ? {
            mode: "CAP" as const,
            count: (adSet as any).frequency_control_specs[0].max_frequency ?? 2,
            days: (adSet as any).frequency_control_specs[0].interval_days ?? 7,
          }
        : INITIAL_STATE.adSet.frequencyControl,
      billingEvent: adSet?.billing_event ?? INITIAL_STATE.adSet.billingEvent,
      deliveryType: adSet?.pacing_type?.[0]?.toUpperCase(),
      dailyBudget: adSet?.daily_budget ? adSet.daily_budget / 100 : undefined,
      lifetimeBudget: adSet?.lifetime_budget ? adSet.lifetime_budget / 100 : undefined,
      scheduleStart: adSet?.start_time ?? "",
      scheduleEnd: adSet?.end_time ?? undefined,
      useAdvantagePlusAudience: adSet?.targeting_optimization === "expansion_all",
      audienceMode: adSet?.targeting_optimization === "expansion_all" ? "ADVANTAGE_PLUS" : "MANUAL",
      locations: [
        ...flattenGeo(targeting?.geo_locations as any, false),
        ...flattenGeo(targeting?.excluded_geo_locations as any, true),
      ],
      ageMin: targeting?.age_min ?? 18,
      ageMax: targeting?.age_max ?? 65,
      genders: targeting?.genders?.includes(1) && !targeting?.genders?.includes(2) ? ["MEN"] : targeting?.genders?.includes(2) && !targeting?.genders?.includes(1) ? ["WOMEN"] : ["ALL"],
      detailedTargeting: [
        ...flattenDetailedTargeting(includedSpec),
        ...flattenDetailedTargeting({
          behaviors: targeting?.behaviors,
          demographics: targeting?.demographics,
          life_events: targeting?.life_events,
          work: targeting?.work,
          education: targeting?.education,
        }),
      ],
      customAudiences,
      excludedCustomAudiences: excludedAudiences,
      useAdvantagePlusPlacements: isAdvantagePlusPlacements,
      placementStrategy: isAdvantagePlusPlacements ? "ADVANTAGE_PLUS" : "MANUAL",
      manualPlatforms,
      manualPositions: adSet?.placement_positions ?? [],
      dynamicCreative: adSet?.is_dynamic_creative ?? false,
      adSetSpendLimitEnabled: !!(adSet?.daily_min_spend_target || adSet?.daily_spend_cap),
      minDailySpend: adSet?.daily_min_spend_target ? adSet.daily_min_spend_target / 100 : undefined,
      maxDailySpend: adSet?.daily_spend_cap ? adSet.daily_spend_cap / 100 : undefined,
      inventoryFilter: adSet?.brand_safety_content_filter_levels?.[0]?.replace("_INVENTORY", ""),
      blockLists: adSet?.publisher_block_list ?? [],
      contentTypeExclusions: adSet?.content_delivery_preferences?.feed_mobile_component_exclusions ?? [],
    },
    ad: {
      ...INITIAL_STATE.ad,
      name: ad?.name ?? "",
      format,
      publishMode: legacy?.publishMode ?? "SINGLE_AD",
      instagramAccountId: creative?.instagram_actor_id ?? undefined,
      isPartnershipAd: !!creative?.branded_content_sponsor_page_id,
      partnershipAdCode: creative?.branded_content_sponsor_page_id,
      advantageCreative: creative?.degrees_of_freedom_spec?.creative_features_spec?.standard_enhancements?.enroll_status === "OPT_IN",
      primaryTexts: creative?.asset_feed_spec?.bodies?.map((b) => b.text) ?? (creative?.body ? [creative.body] : [""]),
      headlines: creative?.asset_feed_spec?.titles?.map((t) => t.text) ?? (creative?.title ? [creative.title] : [""]),
      descriptions: creative?.asset_feed_spec?.descriptions?.map((d) => d.text) ?? [""],
      callToAction: (creative?.asset_feed_spec?.call_to_action_types?.[0] as any) ?? creative?.call_to_action_type ?? "LEARN_MORE",
      images: [legacy?.imageUrl ?? ""], // Keep legacy mapping for image/video URLs
      videos: [legacy?.videoUrl ?? ""],
      videoThumbnailUrl: legacy?.videoThumbnailUrl ?? "",
      captionsUrl: legacy?.captionsUrl ?? "",
      carouselCards: legacy?.carouselCards ?? [],
      adVariants: legacy?.adVariants ?? [],
      websiteUrl: legacy?.adLink ?? "",
      displayLink: creative?.object_story_spec?.link_data?.caption ?? "",
      urlParameters: creative?.url_tags ?? "",
      trackingAppEvents: !!ad?.tracking_specs?.some((s) => Object.values(s).flat().some((v) => v?.toString().toLowerCase().includes("mobile_app_install"))),
      offlineEvents: !!ad?.tracking_specs?.some((s) => Object.values(s).flat().some((v) => v?.toString().toLowerCase().includes("offline_conversion"))),
      thirdPartyPixelIds: (() => {
        const ids: string[] = [];
        ad?.tracking_specs?.forEach((s) => {
          if (Array.isArray(s.fb_pixel)) ids.push(...(s.fb_pixel as string[]));
        });
        return ids;
      })(),
    },
    adSetId: adSet?.id ?? legacy?.adSetId,
    adId: ad?.id ?? legacy?.adId,
  };
};
