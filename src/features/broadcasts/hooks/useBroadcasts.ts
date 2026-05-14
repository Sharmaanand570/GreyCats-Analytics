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
  createIntegration
} from '../api/broadcastApi';
import type { 
  CreateBroadcastPayload, 
  CreateTemplateRequest, 
  CreateIntegrationRequest
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
      // If any campaign is PROCESSING, poll every 5 seconds
      const hasProcessing = query?.state?.data?.some(b => b.status === 'PROCESSING');
      return hasProcessing ? 5000 : false;
    }
  });
};

export const useAdminBroadcasts = () => {
  return useQuery({
    queryKey: ['broadcasts-admin'],
    queryFn: listAdminBroadcasts,
    refetchInterval: (query) => {
      const hasProcessing = query?.state?.data?.some(b => b.status === 'PROCESSING');
      return hasProcessing ? 5000 : false;
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
    }) => createBroadcastCsv(
      data.file,
      data.name,
      data.channel,
      data.templateId,
      data.integrationId,
      data.columnName,
      data.subject,
      data.clientId
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['broadcasts-admin'] });
      toast.success('CSV Broadcast campaign created');
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
    queryFn: listTemplates
  });
};

export const useAdminTemplates = () => {
  return useQuery({
    queryKey: ['broadcast-admin-templates'],
    queryFn: listAdminTemplates
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

export const useAdminIntegrations = () => {
  return useQuery({
    queryKey: ['broadcast-integrations-admin'],
    queryFn: listAdminIntegrations
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
