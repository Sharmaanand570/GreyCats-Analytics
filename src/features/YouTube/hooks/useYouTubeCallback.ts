import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  handleYouTubeCallback,
  type YouTubeCallbackParams,
  type YouTubeCallbackResponse,
} from "../API/youtubeApi";

export const useYouTubeCallback = () => {
  const queryClient = useQueryClient();

  return useMutation<
    YouTubeCallbackResponse,
    Error,
    YouTubeCallbackParams
  >({
    mutationFn: (params) => handleYouTubeCallback(params),
    onSuccess: () => {
      // Invalidate channel query to refetch after successful connection
      queryClient.invalidateQueries({ queryKey: ["youtube", "channel"] });
    },
  });
};

