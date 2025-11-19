import { useQuery } from "@tanstack/react-query";
import {
  getYouTubeChannel,
  type YouTubeChannelResponse,
} from "../API/youtubeApi";

export const useYouTubeChannel = () => {
  return useQuery<YouTubeChannelResponse, Error>({
    queryKey: ["youtube", "channel"],
    queryFn: () => getYouTubeChannel(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


