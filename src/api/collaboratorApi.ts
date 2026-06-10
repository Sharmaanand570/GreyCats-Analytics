import { api } from '../apiConfig';
import type { Collaborator, Invitation, SharedAccessClient } from '../types/client.types';

export interface InviteCollaboratorPayload {
  email: string;
  role?: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';
  accessAnalytics?: boolean;
  accessAlerts?: boolean;
  accessReports?: boolean;
  accessScheduler?: boolean;
  accessAds?: boolean;
}

export interface UpdateCollaboratorPayload {
  role?: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';
  accessAnalytics?: boolean;
  accessAlerts?: boolean;
  accessReports?: boolean;
  accessScheduler?: boolean;
  accessAds?: boolean;
}

export const collaboratorApi = {
  // 1. Invite a Collaborator
  inviteCollaborator: async (clientId: number, data: InviteCollaboratorPayload) => {
    const response = await api.post<{ success: boolean; message: string; inviteLink?: string }>(`/clients/${clientId}/collaborators/invite`, data);
    return response.data;
  },

  // 2. List Active Collaborators
  getCollaborators: async (clientId: number) => {
    const response = await api.get<{ success: boolean; collaborators: Collaborator[] }>(
      `/clients/${clientId}/collaborators`
    );
    return response.data.collaborators;
  },

  // 3. List Pending Invitations
  getPendingInvitations: async (clientId: number) => {
    const response = await api.get<{ success: boolean; invitations: Invitation[] }>(
      `/clients/${clientId}/invitations`
    );
    return response.data.invitations;
  },

  // 4. Update a Collaborator's Role / Module Access
  updateCollaborator: async (clientId: number, userId: number, data: UpdateCollaboratorPayload) => {
    const response = await api.patch<{ success: boolean; message: string; collaborator: Collaborator }>(
      `/clients/${clientId}/collaborators/${userId}`,
      data
    );
    return response.data;
  },

  // 5. Revoke a Collaborator's Access
  revokeCollaborator: async (clientId: number, userId: number) => {
    const response = await api.delete(`/clients/${clientId}/collaborators/${userId}`);
    return response.data;
  },

  // 6. Cancel a Pending Invitation
  cancelInvitation: async (clientId: number, invitationId: number) => {
    const response = await api.delete(`/clients/${clientId}/invitations/${invitationId}`);
    return response.data;
  },

  // 7. Resend a Pending Invitation
  resendInvitation: async (clientId: number, invitationId: number) => {
    const response = await api.post<{ success: boolean; message: string; inviteLink?: string }>(`/clients/${clientId}/invitations/${invitationId}/resend`);
    return response.data;
  },

  // 8. Get My Shared Client Access (Collaborator View)
  getMySharedClientAccess: async () => {
    const response = await api.get<{ success: boolean; accessList: SharedAccessClient[] }>(
      `/collaborator-access/my-access`
    );
    return response.data.accessList;
  },
};
