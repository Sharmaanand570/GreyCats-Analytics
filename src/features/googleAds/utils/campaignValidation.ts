import type { CampaignWizardState } from "../context/CampaignWizardContext";
import type { CampaignType } from "../types/googleAds.types";

export interface ValidationError {
  path: string; // e.g., 'adGroups[0].name'
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateCampaignPayload(payload: CampaignWizardState): ValidationResult {
  const errors: ValidationError[] = [];

  // Core Campaign Validation
  if (!payload.name?.trim()) {
    errors.push({ path: "name", message: "Campaign name is required." });
  }
  if (!payload.budgetAmount || payload.budgetAmount <= 0) {
    errors.push({ path: "budgetAmount", message: "Budget amount must be greater than 0." });
  }

  const type = payload.type as CampaignType;

  // Search Campaign Specific
  if (type === "SEARCH") {
    if (!payload.adGroups || payload.adGroups.length === 0) {
      errors.push({ path: "adGroups", message: "At least one Ad Group is required." });
    } else {
      payload.adGroups.forEach((ag, idx) => {
        if (!ag.name?.trim()) errors.push({ path: `adGroups[${idx}].name`, message: "Ad Group name is required." });
      });
    }

    if (!payload.keywords || payload.keywords.length === 0) {
      errors.push({ path: "keywords", message: "At least one keyword is required for Search campaigns." });
    }

    if (!payload.ads || payload.ads.length === 0) {
      errors.push({ path: "ads", message: "At least one Ad is required." });
    } else {
      payload.ads.forEach((ad, idx) => {
        if (!ad.finalUrls || ad.finalUrls.length === 0) {
          errors.push({ path: `ads[${idx}].finalUrls`, message: "Final URL is required." });
        }
        if (!ad.responsiveSearchAd?.headlines || ad.responsiveSearchAd.headlines.length < 3) {
          errors.push({ path: `ads[${idx}].headlines`, message: "At least 3 headlines are required." });
        }
        if (!ad.responsiveSearchAd?.descriptions || ad.responsiveSearchAd.descriptions.length < 2) {
          errors.push({ path: `ads[${idx}].descriptions`, message: "At least 2 descriptions are required." });
        }
      });
    }
  }

  // Performance Max Specific
  if (type === "PERFORMANCE_MAX") {
    if (!payload.adGroups || payload.adGroups.length === 0) {
      errors.push({ path: "adGroups", message: "At least one Asset Group is required." });
    }

    const logos = payload.assets?.filter(a => a.assetType === "LOGO") || [];
    const images = payload.assets?.filter(a => a.assetType === "IMAGE") || [];
    
    // We expect the UI to stuff these into the first ad or custom structure
    // For MVP, we check basic counts
    if (logos.length < 1) errors.push({ path: "assets.logos", message: "At least 1 Logo is required." });
    if (images.length < 1) errors.push({ path: "assets.images", message: "At least 1 Image is required." });
    
    if (payload.merchantId && !payload.salesCountry) {
      errors.push({ path: "salesCountry", message: "Sales Country is required when using Merchant Center." });
    }
  }

  // Shopping Specific
  if (type === "SHOPPING") {
    if (!payload.merchantId) {
      errors.push({ path: "merchantId", message: "Merchant Center account is required for Shopping campaigns." });
    }
    if (!payload.salesCountry) {
      errors.push({ path: "salesCountry", message: "Sales Country is required for Shopping campaigns." });
    }
    if (!payload.adGroups || payload.adGroups.length === 0) {
      errors.push({ path: "adGroups", message: "At least one Ad Group is required." });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
