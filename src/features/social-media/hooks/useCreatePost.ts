import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadScheduledMedia, createScheduledPost } from '../api/scheduledPostsApi';
import { scheduledPostKeys } from './useScheduledPosts';
import type { CreatePostPayload, MediaType } from '../api/types';

interface CreatePostInput {
  files: File[];
  payload: Omit<CreatePostPayload, 'mediaUrls' | 'mediaType'>;
}

/** Auto-detect mediaType from files. */
const detectMediaType = (files: File[]): MediaType | undefined => {
  if (files.length === 0) return undefined;
  const hasVideo = files.some((f) => f.type.startsWith('video/'));
  if (hasVideo) return 'VIDEO';
  return files.length > 1 ? 'CAROUSEL' : 'IMAGE';
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const mutation = useMutation({
    mutationFn: async ({ files, payload }: CreatePostInput) => {
      let mediaUrls: string[] = [];
      let mediaType: MediaType | undefined;

      // Step 1: Upload media if any
      if (files.length > 0) {
        setUploadProgress(0);
        mediaUrls = await uploadScheduledMedia(files, (percent) => {
          setUploadProgress(percent);
        });
        mediaType = detectMediaType(files);
      }

      setUploadProgress(100);

      // Step 2: Create the scheduled post
      return createScheduledPost({
        ...payload,
        mediaUrls,
        mediaType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.lists() });
      toast.success('Post scheduled successfully!');
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule post');
      setUploadProgress(0);
    },
  });

  return { ...mutation, uploadProgress };
};
