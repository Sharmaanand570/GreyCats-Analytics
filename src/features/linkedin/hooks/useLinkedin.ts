import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  connectLinkedinPersonal,
  connectLinkedinOrg,
  disconnectLinkedin,
  syncLinkedin,
  fetchLinkedinAnalytics,
  fetchLinkedinPosts
} from "../api/linkedinApi";

export const linkedinKeys = {
  all: ["linkedin"] as const,
  analytics: (startDate?: string, endDate?: string) => [...linkedinKeys.all, "analytics", { startDate, endDate }] as const,
  posts: () => [...linkedinKeys.all, "posts"] as const,
};

export const useLinkedinPersonalConnect = () => {
  return useMutation({
    mutationFn: connectLinkedinPersonal,
  });
};

export const useLinkedinOrgConnect = () => {
  return useMutation({
    mutationFn: (clientId?: string | number) => connectLinkedinOrg(clientId),
  });
};

export const useLinkedinDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectLinkedin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useLinkedinSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncLinkedin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedinKeys.all });
    },
  });
};

export const useLinkedinAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: linkedinKeys.analytics(startDate, endDate),
    queryFn: () => fetchLinkedinAnalytics(startDate, endDate),
  });
};

export const useLinkedinPosts = () => {
  return useQuery({
    queryKey: linkedinKeys.posts(),
    queryFn: fetchLinkedinPosts,
  });
};
