import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteScheduledPost } from '../api/scheduledPostsApi';
import { scheduledPostKeys } from './useScheduledPosts';

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteScheduledPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.lists() });
      toast.success('Post deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });
};
