import type {
  CampaignDetails,
  FlexibleSpecGroup,
} from "../../API/metaAdsManagerApi";
import {
  INITIAL_FORM_STATE,
  type SelectedDetailedTargeting,
  type SelectedInterest,
  type SelectedLocation,
  type WizardFormState,
} from "./types";

const flattenGeo = (
  block: NonNullable<NonNullable<CampaignDetails["targeting"]>["geo_locations"]> | undefined,
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
  return out;
};

// Collapse Meta's flexible_spec[] (AND of OR-groups) into a single list of
// items per category. The wizard's UI doesn't model AND-groups, so we just
// union everything across groups.
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

const flattenInterests = (
  list: { id: string; name: string }[] | undefined,
  excluded: boolean
): SelectedInterest[] =>
  (list ?? []).map((i) => ({ id: i.id, name: i.name, excluded }));

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
    // The wizard only models employers + positions. "industry" entries get
    // skipped on round trip — preserving them as employers would corrupt the
    // payload when the user re-saves (Meta would reject or mis-target). The
    // user can re-add them via the picker if needed.
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

// Convert a Meta-style CampaignDetails response into the wizard's flat state.
// Targeting may arrive in either the modern flexible_spec format (what GET
// /campaigns/:id returns) or the legacy flat fields — we merge both so the
// adapter is shape-agnostic. Missing fields fall back to INITIAL_FORM_STATE.
export const toWizardFormState = (details: CampaignDetails): WizardFormState => {
  const targeting = details.targeting;

  const includedSpec = collectSpec(targeting?.flexible_spec);
  const excludedSpec = collectSpec(targeting?.exclusions ? [targeting.exclusions] : undefined);

  // The targeting block only returns audience IDs — no name or type. We
  // populate placeholder values here and the wizard page reconciles them
  // against the /audiences list once it loads (see useAudiences effect in
  // MetaAdsWizardPage). Until then the id renders as the label.
  const customAudiences = (targeting?.custom_audiences ?? []).map((a) => ({
    id: a.id,
    name: a.id,
    audienceType: "CUSTOM" as const,
  }));
  const excludedAudiences = (targeting?.excluded_custom_audiences ?? []).map((a) => ({
    id: a.id,
    name: a.id,
    audienceType: "CUSTOM" as const,
    excluded: true,
  }));

  return {
    ...INITIAL_FORM_STATE,
    // Identity + campaign
    accountId: details.accountId ?? "",
    pageId: details.pageId ?? "",
    campaignName: details.name ?? "",
    objective: details.objective ?? INITIAL_FORM_STATE.objective,
    specialAdCategory: details.specialAdCategory ?? INITIAL_FORM_STATE.specialAdCategory,
    // Budget + schedule
    budgetType: details.budgetType ?? (details.lifetimeBudget ? "LIFETIME" : "DAILY"),
    dailyBudget: details.dailyBudget ?? INITIAL_FORM_STATE.dailyBudget,
    lifetimeBudget: details.lifetimeBudget ?? INITIAL_FORM_STATE.lifetimeBudget,
    startTime: details.startTime ?? "",
    endTime: details.endTime ?? "",
    // Sales objective extras
    pixelId: details.pixelId ?? "",
    conversionEvent: details.conversionEvent ?? "",
    // Targeting (flattened from both flexible_spec and legacy flat fields)
    locations: [
      ...flattenGeo(targeting?.geo_locations, false),
      ...flattenGeo(targeting?.excluded_geo_locations, true),
    ],
    interests: [
      ...flattenInterests(includedSpec.interests, false),
      ...flattenInterests(targeting?.interests, false),
      ...flattenInterests(excludedSpec.interests, true),
      ...flattenInterests(targeting?.excluded_interests, true),
    ],
    detailedTargeting: [
      ...flattenDetailedTargeting(includedSpec),
      // Legacy flat fields — covered by collectSpec when flexible_spec is used,
      // but we keep this fallback so older responses still hydrate.
      ...flattenDetailedTargeting({
        behaviors: targeting?.behaviors,
        demographics: targeting?.demographics,
        life_events: targeting?.life_events,
        work: targeting?.work,
        education: targeting?.education,
      }),
    ],
    customAudiences: [...customAudiences, ...excludedAudiences],
    ageMin: details.ageRange?.min ?? INITIAL_FORM_STATE.ageMin,
    ageMax: details.ageRange?.max ?? INITIAL_FORM_STATE.ageMax,
    gender: details.gender ?? INITIAL_FORM_STATE.gender,
    placements: details.placements ?? [],
    // Creative
    adType: details.adType ?? INITIAL_FORM_STATE.adType,
    adHeadline: details.adHeadline ?? "",
    adText: details.adText ?? "",
    description: details.description ?? "",
    adLink: details.adLink ?? "",
    imageUrl: details.imageUrl ?? "",
    ctaButton: details.ctaButton ?? INITIAL_FORM_STATE.ctaButton,
    carouselCards: details.carouselCards ?? [],
    videoUrl: details.videoUrl ?? "",
    videoThumbnailUrl: details.videoThumbnailUrl ?? "",
    captionsUrl: details.captionsUrl ?? "",
  };
};
