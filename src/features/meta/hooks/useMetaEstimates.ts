import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAdPreview,
  getDeliveryEstimate,
  getReachEstimate,
  type AdPreviewItem,
  type AdPreviewPayload,
  type DeliveryEstimate,
  type DeliveryEstimatePayload,
  type ReachEstimate,
  type ReachEstimatePayload,
} from "../API/metaEstimatesApi";
import { useEffect, useState } from "react";

// Debounce a value so we don't fire reach estimate on every keystroke as the
// user picks countries / interests / age bands. ~500ms is a balance between
// responsiveness and Meta API quota usage.
const useDebouncedValue = <T,>(value: T, delay = 500): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// Live reach estimate. Disabled when accountId is missing or targeting is
// empty (no point asking Meta to estimate "everyone"). 60s cache because
// the same targeting + account often re-queries on re-mount.
export const useReachEstimate = (payload: ReachEstimatePayload | null) => {
  const debounced = useDebouncedValue(payload);
  // Key includes a stable hash of the payload — JSON.stringify is fine here
  // since the payload is bounded (targeting + a few enums).
  const enabled =
    !!debounced?.accountId && hasMeaningfulTargeting(debounced.targeting);

  return useQuery<ReachEstimate, Error>({
    queryKey: ["meta-campaign-wizard", "reach-estimate", JSON.stringify(debounced)],
    queryFn: () => getReachEstimate(debounced as ReachEstimatePayload),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

// True only if the targeting has at least one filter — geo, interests,
// audiences, etc. Without that, Meta's estimate is just the platform's
// total user count which isn't useful.
const hasMeaningfulTargeting = (t: ReachEstimatePayload["targeting"]): boolean => {
  return !!(
    t.geo_locations?.countries?.length ||
    t.geo_locations?.cities?.length ||
    t.geo_locations?.regions?.length ||
    t.geo_locations?.zips?.length ||
    t.geo_locations?.custom_locations?.length ||
    t.flexible_spec?.some(
      (g) =>
        g.interests?.length ||
        g.behaviors?.length ||
        g.demographics?.length ||
        g.life_events?.length
    ) ||
    t.custom_audiences?.length
  );
};

// On-demand delivery estimate — user clicks "Preview delivery" to fire it.
// Returns a curve of (spend → outcomes) for budget planning.
export const useDeliveryEstimate = () => {
  return useMutation<DeliveryEstimate, Error, DeliveryEstimatePayload>({
    mutationFn: (payload) => getDeliveryEstimate(payload),
  });
};

// On-demand ad preview — typically called from Step 4. Backend returns
// iframe HTML which we render inside a sandboxed div.
export const useAdPreview = () => {
  return useMutation<AdPreviewItem[], Error, AdPreviewPayload>({
    mutationFn: (payload) => getAdPreview(payload),
  });
};
