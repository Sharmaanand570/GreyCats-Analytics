import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listAdImages,
  listAdVideos,
  uploadAdMedia,
  type MetaMediaImage,
  type MetaMediaUpload,
  type MetaMediaVideo,
} from "../API/metaMediaApi";
import { formatUserMessage, parseMetaError, shouldToast } from "../API/metaErrors";

const toastMetaError = (e: unknown, fallback: string) => {
  const parsed = parseMetaError(e);
  if (!shouldToast(parsed)) return;
  toast.error(formatUserMessage(parsed) || fallback);
};

// ==================== IMAGE / VIDEO LISTS ====================

export const useAdImages = (
  clientId: number | null,
  accountId: string | null
) => {
  return useQuery<MetaMediaImage[], Error>({
    queryKey: ["meta-media", "images", clientId, accountId],
    queryFn: () => listAdImages(clientId as number, accountId as string),
    enabled: !!clientId && !!accountId,
    staleTime: 60 * 1000,
  });
};

export const useAdVideos = (
  clientId: number | null,
  accountId: string | null
) => {
  return useQuery<MetaMediaVideo[], Error>({
    queryKey: ["meta-media", "videos", clientId, accountId],
    queryFn: () => listAdVideos(clientId as number, accountId as string),
    enabled: !!clientId && !!accountId,
    staleTime: 60 * 1000,
  });
};

// ==================== UPLOAD ====================

export const useUploadAdMedia = () => {
  const qc = useQueryClient();
  return useMutation<
    MetaMediaUpload,
    Error,
    { clientId: number; accountId: string; file: File; onProgress?: (pct: number) => void }
  >({
    mutationFn: ({ clientId, accountId, file, onProgress }) =>
      uploadAdMedia(clientId, accountId, file, onProgress),
    onSuccess: (_, { clientId, accountId }) => {
      // Invalidate both lists so the freshly uploaded asset appears in the library.
      qc.invalidateQueries({ queryKey: ["meta-media", "images", clientId, accountId] });
      qc.invalidateQueries({ queryKey: ["meta-media", "videos", clientId, accountId] });
      toast.success("Upload complete");
    },
    onError: (e) => toastMetaError(e, "Upload failed"),
  });
};
