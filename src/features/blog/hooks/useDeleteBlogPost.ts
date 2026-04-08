import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBlogPost } from '../api/blogPostsApi';
import { blogPostKeys } from './useBlogPosts';
import { toast } from 'sonner';

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogPostKeys.all });
      toast.success('Blog post deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete blog post');
    },
  });
};
