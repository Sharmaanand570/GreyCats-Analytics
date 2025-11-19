import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  connectGoogle,
  handleGoogleCallback,
  type connectGoogleTypeResponse,
  type GoogleCallbackParams,
  type GoogleCallbackResponse,
} from "../../API/googleApi";

export const useGoogleConnect = () => {
  return useMutation<connectGoogleTypeResponse, Error, void>({
    mutationFn: () => connectGoogle(),
  });
};

export const useGoogleCallback = () => {
  const queryClient = useQueryClient();

  return useMutation<GoogleCallbackResponse, Error, GoogleCallbackParams>({
    mutationFn: (params) => handleGoogleCallback(params),
    onSuccess: () => {
      // Invalidate channel query to refetch after successful connection
      queryClient.invalidateQueries({ queryKey: ["google", "connect"] });
    },
  });
};
