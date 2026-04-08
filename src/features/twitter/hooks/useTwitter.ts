import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  connectTwitter,
  disconnectTwitter,
  getTwitterSummary,
  getTwitterAudienceHistory,
  getTwitterProfile,
} from "../api/twitterApi";

export const twitterKeys = {
  all: ["twitter"] as const,
  summary: (clientId: number) => [...twitterKeys.all, "summary", clientId] as const,
  audience: (clientId: number, days?: number) =>
    [...twitterKeys.all, "audience", clientId, { days }] as const,
  profile: (accountId: number) => [...twitterKeys.all, "profile", accountId] as const,
};

export const useTwitterConnect = () => {
  return useMutation({
    mutationFn: connectTwitter,
  });
};

export const useTwitterDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectTwitter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twitterKeys.all });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useTwitterSummary = (clientId?: number) => {
  return useQuery({
    queryKey: twitterKeys.summary(clientId!),
    queryFn: () => getTwitterSummary(clientId!),
    enabled: !!clientId,
  });
};

export const useTwitterAudienceHistory = (clientId?: number, days: number = 90) => {
  return useQuery({
    queryKey: twitterKeys.audience(clientId!, days),
    queryFn: () => getTwitterAudienceHistory(clientId!, days),
    enabled: !!clientId,
  });
};

export const useTwitterProfile = (accountId?: number) => {
  return useQuery({
    queryKey: twitterKeys.profile(accountId!),
    queryFn: () => getTwitterProfile(accountId!),
    enabled: !!accountId,
  });
};
