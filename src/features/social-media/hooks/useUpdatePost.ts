import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateScheduledPost, uploadScheduledMedia } from '../api/scheduledPostsApi';
import { scheduledPostKeys } from './useScheduledPosts';
import type { UpdatePostPayload, MediaType } from '../api/types';

interface UpdatePostInput {
  id: number;
  files?: File[];
  payload: UpdatePostPayload;
}

/** Auto-detect mediaType from files. */
const detectMediaType = (files: File[]): MediaType | undefined => {
  if (files.length === 0) return undefined;
  const hasVideo = files.some((f) => f.type.startsWith('video/'));
  if (hasVideo) return 'VIDEO';
  return files.length > 1 ? 'CAROUSEL' : 'IMAGE';
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const mutation = useMutation({
    mutationFn: async ({ id, files, payload }: UpdatePostInput) => {
      let mediaUrls = payload.mediaUrls;
      let mediaType = payload.mediaType;

      // If new files provided, upload them and update payload
      if (files && files.length > 0) {
        setUploadProgress(0);
        mediaUrls = await uploadScheduledMedia(files, (percent) => {
          setUploadProgress(percent);
        });
        mediaType = detectMediaType(files);
      }

      return updateScheduledPost(id, {
        ...payload,
        mediaUrls,
        mediaType,
      });
    },
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: scheduledPostKeys.detail(updatedPost.id),
      });
      toast.success('Post updated successfully!');
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
      setUploadProgress(0);
    },
  });

  return { ...mutation, uploadProgress };
};
