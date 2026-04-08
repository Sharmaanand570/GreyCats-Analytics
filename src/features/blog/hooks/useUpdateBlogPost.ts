import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadBlogMedia, updateBlogPost } from '../api/blogPostsApi';
import { blogPostKeys } from './useBlogPosts';
import type { UpdateBlogPostPayload } from '../api/types';

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      id,
      files,
      existingUrls,
      payload,
    }: {
      id: number;
      files: File[];
      existingUrls: string[];
      payload: Omit<UpdateBlogPostPayload, 'mediaUrls'>;
    }) => {
      let mediaUrls = existingUrls;

      if (files.length > 0) {
        setUploadProgress(0);
        const newUrls = await uploadBlogMedia(files, setUploadProgress);
        mediaUrls = [...existingUrls, ...newUrls];
      }

      return updateBlogPost(id, { ...payload, mediaUrls });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogPostKeys.all });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  return { ...mutation, uploadProgress };
};
