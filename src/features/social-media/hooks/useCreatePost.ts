import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  uploadScheduledMedia,
  createScheduledPost,
  createMultiPlatformPost,
} from '../api/scheduledPostsApi';
import { scheduledPostKeys } from './useScheduledPosts';
import type {
  CreatePostPayload,
  CreateMultiPlatformPostPayload,
  MediaType,
} from '../api/types';

interface CreateSingleInput {
  mode: 'single';
  files: File[];
  payload: Omit<CreatePostPayload, 'mediaUrls' | 'mediaType'>;
}

interface CreateMultiInput {
  mode: 'multi';
  files: File[];
  payload: Omit<CreateMultiPlatformPostPayload, 'mediaUrls' | 'mediaType'>;
}

type CreatePostInput = CreateSingleInput | CreateMultiInput;

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
    mutationFn: async (input: CreatePostInput) => {
      let mediaUrls: string[] = [];
      let mediaType: MediaType | undefined;

      // Step 1: Upload media if any
      if (input.files.length > 0) {
        setUploadProgress(0);
        mediaUrls = await uploadScheduledMedia(input.files, (percent) => {
          setUploadProgress(percent);
        });
        mediaType = detectMediaType(input.files);
      }

      setUploadProgress(100);

      // Step 2: Create post(s)
      if (input.mode === 'multi') {
        return createMultiPlatformPost({
          ...input.payload,
          mediaUrls,
          mediaType,
        });
      } else {
        return createScheduledPost({
          ...input.payload,
          mediaUrls,
          mediaType,
        });
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.lists() });
      // result is ScheduledPost[] (multi) or ScheduledPost (single)
      const count = Array.isArray(result) ? result.length : 1;
      const platformNames = Array.isArray(result)
        ? result.map((p) => p.platform).join(', ')
        : null;
      if (count > 1 && platformNames) {
        toast.success(`Post scheduled on ${count} platforms: ${platformNames}`);
      } else {
        toast.success('Post scheduled successfully!');
      }
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule post');
      setUploadProgress(0);
    },
  });

  return { ...mutation, uploadProgress };
};
