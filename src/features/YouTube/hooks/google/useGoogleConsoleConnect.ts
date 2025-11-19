import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  connectGoogleConsole,
  handleGoogleConsoleCallback,
  type ConnectGoogleConsoleResponse,
  type GoogleConsoleCallbackResponse,
} from "../../API/googleConsoleApi";

export const useGoogleConsoleConnect = () => {
  return useMutation<ConnectGoogleConsoleResponse, Error, void>({
    mutationFn: () => connectGoogleConsole(),
  });
};

export const useGoogleConsoleCallback = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GoogleConsoleCallbackResponse,
    Error,
    { status: string; reason?: string }
  >({
    mutationFn: ({ status, reason }) =>
      handleGoogleConsoleCallback(status, reason),
    onSuccess: () => {
      // Invalidate queries to refetch after successful connection
      queryClient.invalidateQueries({ queryKey: ["google-console", "connect"] });
    },
  });
};


