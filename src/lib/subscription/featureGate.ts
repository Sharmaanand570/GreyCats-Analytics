import type {
  UserSubscriptionResponse,
  FeatureGateResult,
} from "@/types/subscription.types";

/**
 * Checks whether the user can create a new client given current usage.
 */
export function canCreateClient(
  subscription?: UserSubscriptionResponse
): FeatureGateResult {
  if (!subscription) return { allowed: false, reason: "Subscription data unavailable." };
  const { used, limit } = subscription.usage.clients;
  if (limit === -1) return { allowed: true };
  if (used >= limit) {
    return {
      allowed: false,
      reason: `You've reached your client limit (${used}/${limit}).`,
      upgradeRequired: true,
    };
  }
  return { allowed: true };
}

/**
 * Checks whether the user can connect a new integration.
 */
export function canAddIntegration(
  subscription?: UserSubscriptionResponse
): FeatureGateResult {
  if (!subscription) return { allowed: false, reason: "Subscription data unavailable." };
  const { used, limit } = subscription.usage.integrations;
  if (limit === -1) return { allowed: true };
  if (used >= limit) {
    return {
      allowed: false,
      reason: `You've reached your integration limit (${used}/${limit}).`,
      upgradeRequired: true,
    };
  }
  return { allowed: true };
}

/**
 * Checks whether the user can generate a new report.
 */
export function canGenerateReport(
  subscription?: UserSubscriptionResponse
): FeatureGateResult {
  if (!subscription) return { allowed: false, reason: "Subscription data unavailable." };
  const { used, limit } = subscription.usage.reports;
  if (limit === -1) return { allowed: true };
  if (used >= limit) {
    return {
      allowed: false,
      reason: `You've reached your report limit (${used}/${limit}).`,
      upgradeRequired: true,
    };
  }
  return { allowed: true };
}

/**
 * Checks whether PDF export is available on the current plan.
 */
export function canExportPDF(
  subscription?: UserSubscriptionResponse
): FeatureGateResult {
  if (!subscription) return { allowed: false, reason: "Subscription data unavailable." };
  if (!subscription.plan.features.pdfExport) {
    return {
      allowed: false,
      reason: "PDF export is not available on your current plan.",
      upgradeRequired: true,
    };
  }
  return { allowed: true };
}

/**
 * Checks whether scheduled reports are available on the current plan.
 */
export function canUseScheduledReports(
  subscription?: UserSubscriptionResponse
): FeatureGateResult {
  if (!subscription) return { allowed: false, reason: "Subscription data unavailable." };
  if (!subscription.plan.features.scheduledReports) {
    return {
      allowed: false,
      reason: "Scheduled reports are not available on your current plan.",
      upgradeRequired: true,
    };
  }
  return { allowed: true };
}
