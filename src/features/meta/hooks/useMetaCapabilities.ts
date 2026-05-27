import { useQuery } from "@tanstack/react-query";
import {
  getMetaCapabilities,
  type MetaCapabilities,
  type MetaCapabilityFeatures,
} from "../API/metaCapabilitiesApi";

// Capabilities rarely change — backend redeploys it. An hour is generous and
// keeps the wizard from hitting the endpoint on every navigation.
const CAPABILITIES_STALE_MS = 60 * 60 * 1000;

export const useMetaCapabilities = () => {
  return useQuery<MetaCapabilities, Error>({
    queryKey: ["meta-campaign-wizard", "capabilities"],
    queryFn: getMetaCapabilities,
    staleTime: CAPABILITIES_STALE_MS,
    // If the backend is briefly down, fall back to a default-disabled view
    // rather than spinning forever. The wizard handles `undefined` data.
    retry: 1,
  });
};

// Convenience selector: returns `false` for unknown features so consumers can
// `if (features.cbo) { ... }` without nullchecks. New backend additions land
// as `undefined` here until the type is updated — that's deliberate, the UI
// stays hidden until the frontend explicitly opts in.
export const useMetaFeature = (flag: keyof MetaCapabilityFeatures): boolean => {
  const { data } = useMetaCapabilities();
  return data?.features?.[flag] === true;
};
