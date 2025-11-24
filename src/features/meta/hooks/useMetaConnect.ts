import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  connectMeta,
  handleMetaCallback,
  type MetaConnectResponse,
  type MetaCallbackParams,
  type MetaCallbackResponse,
} from "../API/metaApi";

// Empty type for connect params since Meta doesn't need any
export type MetaConnectParams = Record<string, never>;

export const useMetaConnect = () => {
  return useMutation<MetaConnectResponse, Error, MetaConnectParams>({
    mutationFn: () => connectMeta(),
  });
};

export const useMetaCallback = () => {
  const queryClient = useQueryClient();

  return useMutation<MetaCallbackResponse, Error, MetaCallbackParams>({
    mutationFn: (params) => handleMetaCallback(params),
    onSuccess: () => {
      // Invalidate integrations query to refetch after successful connection
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};

