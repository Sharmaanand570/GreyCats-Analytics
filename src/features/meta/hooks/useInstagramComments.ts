import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstagramComments, addInstagramComment, editInstagramComment, deleteInstagramComment } from "../API/instagramApi";

export const useInstagramComments = (mediaId?: string) => {
    return useQuery({
        queryKey: ["instagram_comments", mediaId],
        queryFn: () => {
            if (!mediaId) return null;
            return getInstagramComments(mediaId);
        },
        enabled: !!mediaId,
    });
};

export const useAddInstagramComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ mediaId, text }: { mediaId: string; text: string }) => addInstagramComment(mediaId, text),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["instagram_comments", variables.mediaId] });
        },
    });
};

export const useEditInstagramComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId, text }: { commentId: string; text: string }) => editInstagramComment(commentId, text),
        onSuccess: () => {
            // Invalidate all comments since we don't necessarily know the mediaId here,
            // or we could invalidate the entire list
            queryClient.invalidateQueries({ queryKey: ["instagram_comments"] });
        },
    });
};

export const useDeleteInstagramComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) => deleteInstagramComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instagram_comments"] });
        },
    });
};
