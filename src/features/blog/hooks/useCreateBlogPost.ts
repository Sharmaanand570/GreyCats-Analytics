import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadBlogMedia, createBlogPost } from '../api/blogPostsApi';
import { blogPostKeys } from './useBlogPosts';
import type { BlogPost, BlogPostsListResponse, CreateBlogPostPayload } from '../api/types';

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      files,
      payload,
    }: {
      files: File[];
      payload: Omit<CreateBlogPostPayload, 'mediaUrls'>;
    }) => {
      let mediaUrls: string[] = [];

      if (files.length > 0) {
        setUploadProgress(0);
        mediaUrls = await uploadBlogMedia(files, setUploadProgress);
      }

      return createBlogPost({ ...payload, mediaUrls });
    },
    onSuccess: (newPost: BlogPost) => {
      // Optimistically add the post to every cached list so it shows up
      // immediately without waiting for the refetch.
      queryClient.setQueriesData<BlogPostsListResponse | BlogPost[]>(
        { queryKey: blogPostKeys.lists() },
        (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return [...old, newPost];
          }
          return { ...old, posts: [...old.posts, newPost], total: old.total + 1 };
        }
      );
      queryClient.invalidateQueries({ queryKey: blogPostKeys.all });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  return { ...mutation, uploadProgress };
};
