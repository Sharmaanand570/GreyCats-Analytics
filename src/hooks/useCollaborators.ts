import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collaboratorApi } from '../api/collaboratorApi';
import type { InviteCollaboratorPayload, UpdateCollaboratorPayload } from '../api/collaboratorApi';
import { toast } from 'sonner';

export const collaboratorKeys = {
  all: ['collaborators'] as const,
  lists: (clientId: number) => [...collaboratorKeys.all, 'list', clientId] as const,
  invitations: (clientId: number) => [...collaboratorKeys.all, 'invitations', clientId] as const,
};

export const useCollaborators = (clientId: number) => {
  return useQuery({
    queryKey: collaboratorKeys.lists(clientId),
    queryFn: () => collaboratorApi.getCollaborators(clientId),
    enabled: !!clientId,
  });
};

export const usePendingInvitations = (clientId: number) => {
  return useQuery({
    queryKey: collaboratorKeys.invitations(clientId),
    queryFn: () => collaboratorApi.getPendingInvitations(clientId),
    enabled: !!clientId,
  });
};

export const useInviteCollaborator = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteCollaboratorPayload) => collaboratorApi.inviteCollaborator(clientId, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Invitation processed successfully');
      queryClient.invalidateQueries({ queryKey: collaboratorKeys.lists(clientId) });
      queryClient.invalidateQueries({ queryKey: collaboratorKeys.invitations(clientId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    },
  });
};

export const useUpdateCollaborator = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateCollaboratorPayload }) => 
      collaboratorApi.updateCollaborator(clientId, userId, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Collaborator updated successfully');
      queryClient.invalidateQueries({ queryKey: collaboratorKeys.lists(clientId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update collaborator');
    },
  });
};

export const useRevokeCollaborator = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => collaboratorApi.revokeCollaborator(clientId, userId),
    onSuccess: (response) => {
      toast.success(response.message || 'Collaborator access revoked');
      queryClient.invalidateQueries({ queryKey: collaboratorKeys.lists(clientId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke collaborator');
    },
  });
};

export const useCancelInvitation = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) => collaboratorApi.cancelInvitation(clientId, invitationId),
    onSuccess: (response) => {
      toast.success(response.message || 'Invitation cancelled');
      queryClient.invalidateQueries({ queryKey: collaboratorKeys.invitations(clientId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel invitation');
    },
  });
};

export const useResendInvitation = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) => collaboratorApi.resendInvitation(clientId, invitationId),
    onSuccess: (response) => {
      toast.success(response.message || 'Invitation resent');
      queryClient.invalidateQueries({ queryKey: collaboratorKeys.invitations(clientId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    },
  });
};
