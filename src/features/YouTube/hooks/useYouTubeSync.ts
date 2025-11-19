import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncYouTube, type YouTubeSyncResponse } from "../API/youtubeApi";
import { toast } from "sonner";

export const useYouTubeSync = () => {
  const queryClient = useQueryClient();

  return useMutation<YouTubeSyncResponse, Error, void>({
    mutationFn: () => syncYouTube(),
    onSuccess: (data) => {
      toast.success(data.message || "Sync completed successfully");
      // Invalidate channel and videos queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["youtube"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync YouTube data");
    },
  });
};


