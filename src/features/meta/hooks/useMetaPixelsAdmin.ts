import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCustomConversion,
  getPixelEvents,
  getPixelStats,
  listCustomConversions,
  listDomains,
  verifyDomain,
  type CreateCustomConversionPayload,
  type CustomConversion,
  type DomainStatus,
  type PixelEvent,
  type PixelStats,
} from "../API/metaPixelsApi";
import { formatUserMessage, parseMetaError, shouldToast } from "../API/metaErrors";

const toastMetaError = (e: unknown, fallback: string) => {
  const parsed = parseMetaError(e);
  if (!shouldToast(parsed)) return;
  toast.error(formatUserMessage(parsed) || fallback);
};

// ==================== EVENTS ====================

export const usePixelEvents = (
  clientId: number | null,
  pixelId: string | null
) => {
  return useQuery<PixelEvent[], Error>({
    queryKey: ["meta-pixels", "events", clientId, pixelId],
    queryFn: () => getPixelEvents(clientId as number, pixelId as string),
    enabled: !!clientId && !!pixelId,
    staleTime: 30 * 1000,
  });
};

// ==================== STATS ====================

export const usePixelStats = (
  clientId: number | null,
  pixelId: string | null
) => {
  return useQuery<PixelStats, Error>({
    queryKey: ["meta-pixels", "stats", clientId, pixelId],
    queryFn: () => getPixelStats(clientId as number, pixelId as string),
    enabled: !!clientId && !!pixelId,
    staleTime: 60 * 1000,
  });
};

// ==================== CUSTOM CONVERSIONS ====================

export const useCustomConversions = (
  clientId: number | null,
  pixelId: string | null
) => {
  return useQuery<CustomConversion[], Error>({
    queryKey: ["meta-pixels", "custom-conversions", clientId, pixelId],
    queryFn: () => listCustomConversions(clientId as number, pixelId as string),
    enabled: !!clientId && !!pixelId,
    staleTime: 60 * 1000,
  });
};

export const useCreateCustomConversion = () => {
  const qc = useQueryClient();
  return useMutation<
    CustomConversion,
    Error,
    { clientId: number; pixelId: string; payload: CreateCustomConversionPayload }
  >({
    mutationFn: ({ clientId, pixelId, payload }) =>
      createCustomConversion(clientId, pixelId, payload),
    onSuccess: (_, { clientId, pixelId }) => {
      qc.invalidateQueries({
        queryKey: ["meta-pixels", "custom-conversions", clientId, pixelId],
      });
      toast.success("Custom conversion created");
    },
    onError: (e) => toastMetaError(e, "Failed to create custom conversion"),
  });
};

// ==================== DOMAINS ====================

export const useDomains = (clientId: number | null) => {
  return useQuery<DomainStatus[], Error>({
    queryKey: ["meta-pixels", "domains", clientId],
    queryFn: () => listDomains(clientId as number),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVerifyDomain = () => {
  const qc = useQueryClient();
  return useMutation<
    DomainStatus,
    Error,
    { clientId: number; domain: string; method: "meta_tag" | "dns_txt" | "file_upload" }
  >({
    mutationFn: ({ clientId, domain, method }) =>
      verifyDomain(clientId, domain, method),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["meta-pixels", "domains", clientId] });
      toast.success("Verification check complete");
    },
    onError: (e) => toastMetaError(e, "Failed to verify domain"),
  });
};
