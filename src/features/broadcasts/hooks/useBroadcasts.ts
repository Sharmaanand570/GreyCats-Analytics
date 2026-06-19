import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listBroadcasts,
  listAdminBroadcasts,
  createBroadcast,
  createBroadcastCsv,
  getBroadcastStatus,
  listTemplates,
  listAdminTemplates,
  createTemplate,
  createSystemTemplate,
  deleteTemplate,
  approveTemplate,
  listIntegrations,
  listAdminIntegrations,
  createIntegration,
  deleteIntegration,
  deleteAdminIntegration,
  syncTemplates,
  getBroadcastStats,
  sendTestMessage
} from '../api/broadcastApi';
import type { 
  CreateBroadcastPayload, 
  CreateTemplateRequest, 
  CreateIntegrationRequest,
  SendTestPayload
} from '../api/types';
import { toast } from 'sonner';

const extractError = (error: any, fallback: string): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

export const useBroadcasts = (clientId?: number) => {
  return useQuery({
    queryKey: ['broadcasts', clientId],
    queryFn: () => listBroadcasts(clientId),
    refetchInterval: (query) => {
      // If any campaign is PROCESSING or RUNNING, poll every 5 seconds
      const hasActive = query?.state?.data?.some(b => b.status === 'PROCESSING' || b.status === 'RUNNING');
      return hasActive ? 5000 : 60000; // 5s if active, 60s default
    }
  });
};

export const useAdminBroadcasts = () => {
  return useQuery({
    queryKey: ['broadcasts-admin'],
    queryFn: listAdminBroadcasts,
    refetchInterval: (query) => {
      const hasActive = query?.state?.data?.some(b => b.status === 'PROCESSING' || b.status === 'RUNNING');
      return hasActive ? 5000 : 60000;
    }
  });
};

export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBroadcastPayload) => createBroadcast(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['broadcasts-admin'] });
      toast.success('Broadcast campaign created successfully');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to create broadcast'));
    }
  });
};

export const useCreateBroadcastCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      file: File;
      name: string;
      channel: string;
      templateId: number;
      integrationId?: number;
      columnName?: string;
      subject?: string;
      clientId?: number;
      variableMapping?: Record<string, string>;
    }) => createBroadcastCsv(
      data.file,
      data.name,
      data.channel,
      data.templateId,
      data.integrationId,
      data.columnName,
      data.subject,
      data.clientId,
      data.variableMapping
    ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['broadcasts-admin'] });
      // Check if the backend silently truncated the CSV at 5,000 recipients
      if (result.serverMessage?.toLowerCase().includes('truncated')) {
        toast.warning('Your CSV had more than 5,000 valid recipients. Only the first 5,000 were imported.');
      } else {
        toast.success('CSV Broadcast campaign created');
      }
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'CSV upload failed'));
    }
  });
};

export const useBroadcastStatus = (id: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['broadcast', id],
    queryFn: () => getBroadcastStatus(id),
    enabled,
    refetchInterval: 3000, // Poll every 3s when enabled
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: ['broadcast-templates'],
    queryFn: listTemplates,
    refetchInterval: (query) => {
      // Poll every 12s only while any template is PENDING (e.g. awaiting Meta approval)
      const hasPending = query?.state?.data?.some(t => t.status === 'PENDING');
      return hasPending ? 12000 : false;
    },
  });
};

export const useAdminTemplates = () => {
  return useQuery({
    queryKey: ['broadcast-admin-templates'],
    queryFn: listAdminTemplates,
    refetchInterval: (query) => {
      // Poll every 12s only while any template is PENDING
      const hasPending = query?.state?.data?.some(t => t.status === 'PENDING');
      return hasPending ? 12000 : false;
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplateRequest) => createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-admin-templates'] });
      toast.success('Template submitted for approval');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to submit template'));
    }
  });
};

export const useCreateSystemTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplateRequest) => createSystemTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-admin-templates'] });
      toast.success('System template created and approved');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to create system template'));
    }
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-admin-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to delete template'));
    }
  });
};

export const useSyncTemplates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId?: number) => syncTemplates(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-admin-templates'] });
      toast.success('Templates synced successfully');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to sync templates'));
    }
  });
};

export const useApproveTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, externalId }: { id: number; status: 'APPROVED' | 'REJECTED'; externalId?: string }) => 
      approveTemplate(id, status, externalId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-admin-templates'] });
      toast.success(`Template ${variables.status.toLowerCase()} successfully`);
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to update template status'));
    }
  });
};

export const useIntegrations = (clientId?: number) => {
  return useQuery({
    queryKey: ['broadcast-integrations', clientId],
    queryFn: () => listIntegrations(clientId)
  });
};

export const useAdminIntegrations = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['broadcast-integrations-admin'],
    queryFn: listAdminIntegrations,
    enabled
  });
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIntegrationRequest) => createIntegration(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-integrations-admin'] });
      toast.success('Provider connected successfully');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to connect provider'));
    }
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-integrations-admin'] });
      toast.success('Provider disconnected successfully');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to disconnect provider'));
    }
  });
};

export const useAdminDeleteIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['broadcast-integrations-admin'] });
      toast.success('Provider forcefully deleted across the system');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Failed to delete provider as admin'));
    }
  });
};

/**
 * Fetch engagement stats (delivered, opened, clicked, bounced) for the current workspace.
 * GET /broadcasts/stats
 */
export const useBroadcastStats = (clientId?: number) => {
  return useQuery({
    queryKey: ['broadcast-stats', clientId],
    queryFn: () => getBroadcastStats(clientId),
    // Refresh every 5 minutes — stats are updated by webhooks, not real-time
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Send a single test message for a campaign.
 * POST /broadcasts/test
 */
export const useSendTestMessage = () => {
  return useMutation({
    mutationFn: (payload: SendTestPayload) => sendTestMessage(payload),
    onError: (error: any) => {
      // Let the caller handle the toast so it can include the testTo address
      console.error('Send test failed:', extractError(error, 'Failed to send test message'));
    }
  });
};
