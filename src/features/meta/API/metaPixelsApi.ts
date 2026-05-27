import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type PixelEvent = {
  event_name: string;
  count?: number;
  last_fired_time?: string;
  source?: "browser" | "server" | "both";
  event_match_quality?: number;
};

export type PixelStats = {
  total_events: number;
  events_last_24h: number;
  events_last_7d: number;
  match_quality_score?: number;
  fired_events: PixelEvent[];
};

export type CustomConversion = {
  id: string;
  name: string;
  description?: string;
  pixel_id: string;
  custom_event_type: string;
  rule?: Record<string, unknown>;
  default_conversion_value?: number;
  created_time?: string;
};

export type DomainStatus = {
  domain: string;
  verified: boolean;
  verification_method?: "meta_tag" | "dns_txt" | "file_upload";
  verified_at?: string;
  // Backend may return the token needed to prove ownership.
  verification_token?: string;
};

export type CreateCustomConversionPayload = {
  name: string;
  description?: string;
  custom_event_type: string;
  rule: Record<string, unknown>;
  default_conversion_value?: number;
};

type ApiErrorResponse = { message?: string; error?: string };

const wrapErr = (e: unknown, fallback: string): Error => {
  const ax = e as AxiosError<ApiErrorResponse>;
  return new Error(
    ax.response?.data?.message || ax.response?.data?.error || fallback
  );
};

// ==================== API ====================

export const getPixelEvents = async (
  clientId: number,
  pixelId: string
): Promise<PixelEvent[]> => {
  try {
    const res = await api.get<{ success: boolean; data: PixelEvent[] }>(
      `/clients/${clientId}/pixels/${pixelId}/events`
    );
    return res.data.data ?? [];
  } catch (e) {
    throw wrapErr(e, "Failed to load pixel events");
  }
};

export const getPixelStats = async (
  clientId: number,
  pixelId: string
): Promise<PixelStats> => {
  try {
    const res = await api.get<{ success: boolean; data: PixelStats }>(
      `/clients/${clientId}/pixels/${pixelId}/stats`
    );
    return res.data.data;
  } catch (e) {
    throw wrapErr(e, "Failed to load pixel stats");
  }
};

export const listCustomConversions = async (
  clientId: number,
  pixelId: string
): Promise<CustomConversion[]> => {
  try {
    const res = await api.get<{ success: boolean; data: CustomConversion[] }>(
      `/clients/${clientId}/pixels/${pixelId}/custom-conversions`
    );
    return res.data.data ?? [];
  } catch (e) {
    throw wrapErr(e, "Failed to load custom conversions");
  }
};

export const createCustomConversion = async (
  clientId: number,
  pixelId: string,
  payload: CreateCustomConversionPayload
): Promise<CustomConversion> => {
  try {
    const res = await api.post<{ success: boolean; data: CustomConversion }>(
      `/clients/${clientId}/pixels/${pixelId}/custom-conversions`,
      payload
    );
    return res.data.data;
  } catch (e) {
    throw wrapErr(e, "Failed to create custom conversion");
  }
};

export const listDomains = async (clientId: number): Promise<DomainStatus[]> => {
  try {
    const res = await api.get<{ success: boolean; data: DomainStatus[] }>(
      `/clients/${clientId}/domains`
    );
    return res.data.data ?? [];
  } catch (e) {
    throw wrapErr(e, "Failed to load domains");
  }
};

export const verifyDomain = async (
  clientId: number,
  domain: string,
  method: "meta_tag" | "dns_txt" | "file_upload"
): Promise<DomainStatus> => {
  try {
    const res = await api.post<{ success: boolean; data: DomainStatus }>(
      `/clients/${clientId}/domains/verify`,
      { domain, method }
    );
    return res.data.data;
  } catch (e) {
    throw wrapErr(e, "Failed to verify domain");
  }
};
