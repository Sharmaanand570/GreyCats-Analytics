import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  browseTargeting,
  getCampaignDetails,
  publishAd,
  searchInterests,
  searchLocations,
  updateCampaign,
  updateCampaignStatus,
  type AudiencesResponse,
  type CampaignDetails,
  type CampaignStatus,
  type DetailedTargetingResult,
  type DetailedTargetingType,
  type MetaPixelsResponse,
  type PublishAdPayload,
  type PublishAdResponse,
  type TargetingInterest,
  type TargetingLocation,
  type UpdateCampaignPayload,
  type UpdateCampaignResponse,
  type UpdateCampaignStatusResponse,
} from "../API/metaAdsManagerApi";
import {
  createCustomerListAudience,
  createLookalikeAudience,
  createWebsiteTrafficAudience,
  deleteAudience,
  getAudiences,
  getMetaPixels,
} from "../API/metaApi";

const MIN_QUERY_LEN = 2;

export const useSearchInterests = (query: string) => {
  const trimmed = query.trim();
  return useQuery<TargetingInterest[], Error>({
    queryKey: ["meta-campaign-wizard", "interests", trimmed],
    queryFn: () => searchInterests(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LEN,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useSearchLocations = (query: string) => {
  const trimmed = query.trim();
  return useQuery<TargetingLocation[], Error>({
    queryKey: ["meta-campaign-wizard", "locations", trimmed],
    queryFn: () => searchLocations(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LEN,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useBrowseTargeting = (type: DetailedTargetingType, query: string) => {
  const trimmed = query.trim();
  return useQuery<DetailedTargetingResult[], Error>({
    queryKey: ["meta-campaign-wizard", "browse", type, trimmed],
    queryFn: () => browseTargeting(type, trimmed),
    enabled: trimmed.length >= MIN_QUERY_LEN,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useMetaPixels = (clientId: number | null) => {
  return useQuery<MetaPixelsResponse, Error>({
    queryKey: ["meta-campaign-wizard", "pixels", clientId],
    queryFn: () => getMetaPixels(clientId as number),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useAudiences = (clientId: number | null) => {
  return useQuery<AudiencesResponse, Error>({
    queryKey: ["meta-campaign-wizard", "audiences", clientId],
    queryFn: () => getAudiences(clientId as number),
    enabled: !!clientId,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useCreateCustomerListAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { clientId: number; name: string; emails: string[] }) =>
      createCustomerListAudience(vars.clientId, { name: vars.name, emails: vars.emails }),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Customer list uploaded — Meta is processing it");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create audience");
    },
  });
};

export const useCreateWebsiteTrafficAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      clientId: number;
      name: string;
      pixelId: string;
      retentionDays: number;
      rules: { event: string; url?: string }[];
    }) =>
      createWebsiteTrafficAudience(vars.clientId, {
        name: vars.name,
        pixelId: vars.pixelId,
        retentionDays: vars.retentionDays,
        rules: vars.rules,
      }),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Website-traffic audience created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create audience");
    },
  });
};

export const useCreateLookalikeAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      clientId: number;
      name: string;
      sourceAudienceId: string;
      country: string;
      ratio: 0.01 | 0.02 | 0.05 | 0.1;
    }) =>
      createLookalikeAudience(vars.clientId, {
        name: vars.name,
        sourceAudienceId: vars.sourceAudienceId,
        country: vars.country,
        ratio: vars.ratio,
      }),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Lookalike audience provisioning…");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create lookalike");
    },
  });
};

export const useDeleteAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { clientId: number; audienceId: string }) =>
      deleteAudience(vars.clientId, vars.audienceId),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Audience deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete audience");
    },
  });
};

export const useCampaignDetails = (
  campaignId: string | null,
  clientId: number | null
) => {
  return useQuery<CampaignDetails, Error>({
    queryKey: ["meta-ads-manager", "campaign-details", clientId, campaignId],
    queryFn: () => getCampaignDetails(campaignId as string, clientId as number),
    enabled: !!campaignId && !!clientId,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

const invalidateCampaignViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  // Campaign edits affect summary cards, the trends chart, and the table —
  // they all key off these query roots.
  ["meta-ads-campaigns", "meta-ads-summary", "meta-ads-meta", "meta-ads-trends"].forEach(
    (key) => queryClient.invalidateQueries({ queryKey: [key] })
  );
  queryClient.invalidateQueries({ queryKey: ["meta-ads-manager", "campaign-details"] });
};

export const useUpdateCampaignStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateCampaignStatusResponse,
    Error,
    { campaignId: string; status: CampaignStatus; clientId: number }
  >({
    mutationFn: ({ campaignId, status, clientId }) =>
      updateCampaignStatus(campaignId, status, clientId),
    onSuccess: (data, { status }) => {
      invalidateCampaignViews(queryClient);
      const action =
        status === "ACTIVE" ? "resumed" : status === "PAUSED" ? "paused" : "deleted";
      toast.success(data.message || `Campaign ${action}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update campaign status");
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateCampaignResponse,
    Error,
    { campaignId: string; payload: UpdateCampaignPayload; clientId: number }
  >({
    mutationFn: ({ campaignId, payload, clientId }) =>
      updateCampaign(campaignId, payload, clientId),
    onSuccess: (data) => {
      invalidateCampaignViews(queryClient);
      toast.success(data.message || "Campaign updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update campaign");
    },
  });
};

export const usePublishAd = () => {
  return useMutation<PublishAdResponse, Error, PublishAdPayload>({
    mutationFn: (payload) => publishAd(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Ad successfully published to Meta!");
      } else {
        toast.error(data.message || "Meta rejected the ad");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish ad");
    },
  });
};
