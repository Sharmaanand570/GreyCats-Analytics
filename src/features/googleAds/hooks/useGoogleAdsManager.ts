import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getGoogleAdsConversionActions,
  getGoogleAdsPublishStatus,
  getKeywordRecommendations,
  searchGoogleAdsLocations,
  submitGoogleAdsPublish,
  TERMINAL_JOB_STATES,
  type GoogleAdsConversionAction,
  type GoogleAdsKeywordIdea,
  type GoogleAdsLocation,
  type GoogleAdsPublishJob,
  type GoogleAdsPublishPayload,
  type KeywordRecommendationsPayload,
  type PublishJobState,
} from "../API/googleAdsManagerApi";

const MIN_QUERY_LEN = 2;

export const useGoogleAdsLocations = (query: string) => {
  const trimmed = query.trim();
  return useQuery<GoogleAdsLocation[], Error>({
    queryKey: ["google-ads-manager", "locations", trimmed],
    queryFn: () => searchGoogleAdsLocations(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LEN,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useGoogleAdsConversionActions = (
  customerId: string | null,
  clientId: number | null
) => {
  return useQuery<GoogleAdsConversionAction[], Error>({
    queryKey: [
      "google-ads-manager",
      "conversion-actions",
      customerId,
      clientId,
    ],
    queryFn: () =>
      getGoogleAdsConversionActions({
        customerId: customerId ?? undefined,
        clientId: clientId ?? undefined,
      }),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useGoogleAdsKeywordIdeas = () => {
  return useMutation<
    GoogleAdsKeywordIdea[],
    Error,
    {
      payload: KeywordRecommendationsPayload;
      params?: { clientId?: number; customerId?: string };
    }
  >({
    mutationFn: ({ payload, params }) =>
      getKeywordRecommendations(payload, params),
    onError: (e) => toast.error(e.message || "Failed to generate keyword ideas"),
  });
};

// Submits the publish job to the async queue. Resolves with the jobId; callers
// then pass that to useGoogleAdsPublishStatus to poll until terminal.
export const useSubmitGoogleAdsPublish = () => {
  return useMutation<
    { jobId: string; state: PublishJobState },
    Error,
    { payload: GoogleAdsPublishPayload; idempotencyKey: string }
  >({
    mutationFn: ({ payload, idempotencyKey }) =>
      submitGoogleAdsPublish({ ...payload, idempotencyKey }),
    onError: (e) => toast.error(e.message || "Failed to submit Google Ads campaign"),
  });
};

// Polls the status endpoint until a terminal state. Pass jobId=null to disable.
export const useGoogleAdsPublishStatus = (jobId: string | null) => {
  return useQuery<GoogleAdsPublishJob, Error>({
    queryKey: ["google-ads-publish-job", jobId],
    queryFn: () => getGoogleAdsPublishStatus(jobId as string),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state && TERMINAL_JOB_STATES.has(state)) return false;
      const hint = query.state.data?.pollAfter ?? 3000;
      return Math.max(1000, Math.min(hint, 10_000));
    },
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
  });
};
