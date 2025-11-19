import { useMutation } from "@tanstack/react-query";
import { connectYouTube, type YouTubeConnectResponse } from "../API/youtubeApi";

export const useYouTubeConnect = () => {
  return useMutation<YouTubeConnectResponse, Error, void>({
    mutationFn: () => connectYouTube(),
  });
};

