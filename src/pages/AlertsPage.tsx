import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiSearch, FiPlus, FiActivity, FiServer, FiDollarSign, FiTrash2, FiEdit2, FiClock } from "react-icons/fi";
import { format } from "date-fns";
import { useClientContext } from '@/context/ClientContext';
import { getAlerts, createAlert, updateAlert, deleteAlert } from '@/api/alertsApi';
import { AlertForm } from '@/components/AlertForm';
import { NotificationsPopover } from '@/components/NotificationsPopover';
import type { Alert, CreateAlertData, UpdateAlertData } from '@/types/alert.types';
import type { ClientWithIntegrations } from '@/types/client.types';

// --- Logic Helpers ---

const getAlertStatus = (alert: Alert): 'critical' | 'healthy' => {
  if (!alert.isActive) return 'healthy'; // Inactive is effectively healthy/ignored
  if (alert.currentValue === undefined || alert.currentValue === null) return 'healthy';

  const current = Number(alert.currentValue);
  const trigger = alert.triggerValue;

  switch (alert.condition) {
    case 'greater_than': return current > trigger ? 'critical' : 'healthy';
    case 'greater_than_or_equal': return current >= trigger ? 'critical' : 'healthy';
    case 'less_than': return current < trigger ? 'critical' : 'healthy';
    case 'less_than_or_equal': return current <= trigger ? 'critical' : 'healthy';
    case 'exactly_equal': return current === trigger ? 'critical' : 'healthy';
    default: return 'healthy';
  }
};

const getAlertType = (integration: string): 'financial' | 'performance' | 'system' => {
  const financial = ['shopify', 'woocommerce', 'stripe'];
  const system = ['google-analytics', 'google-search-console', 'google-console'];

  if (financial.includes(integration.toLowerCase())) return 'financial';
  if (system.includes(integration.toLowerCase())) return 'system';
  return 'performance';
};

// --- Page Component ---

const AlertsPage: React.FC = () => {
  const { clients, currentClient, setCurrentClient } = useClientContext();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const queryClient = useQueryClient();
  const clientId = currentClient?.id;

  // -- Queries & Mutations --

  const { data: response, isLoading, error: queryError } = useQuery({
    queryKey: ['alerts', clientId],
    queryFn: () => getAlerts(clientId!),
    enabled: !!clientId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAlertData) => createAlert(clientId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', clientId] });
      setIsCreateModalOpen(false);
      toast.success('Alert created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create alert';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAlertData) => updateAlert(clientId!, editingAlert!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', clientId] });
      setEditingAlert(null);
      toast.success('Alert updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update alert';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAlert(clientId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', clientId] });
      toast.success('Alert deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete alert';
      toast.error(errorMessage);
    },
  });

  // -- Event Handlers --

  const handleCreate = (data: CreateAlertData | UpdateAlertData) => {
    createMutation.mutate(data as CreateAlertData);
  };

  const handleUpdate = (data: CreateAlertData | UpdateAlertData) => {
    updateMutation.mutate(data as UpdateAlertData);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      deleteMutation.mutate(id);
    }
  };

  // -- Filter Logic --

  const alerts = response?.data || [];

  const filteredAlerts = alerts.filter(alert => {
    const status = getAlertStatus(alert);
    const matchesSearch = (alert.metricLabel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.integration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all'
      ? true
      : activeTab === 'critical'
        ? status === 'critical'
        : activeTab === 'healthy'
          ? status === 'healthy'
          : true;

    return matchesSearch && matchesTab;
  });

  const criticalAlerts = filteredAlerts.filter(a => getAlertStatus(a) === 'critical');
  const healthyAlerts = filteredAlerts.filter(a => getAlertStatus(a) === 'healthy');


  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-zinc-50/50">
      <div className="w-full h-full flex flex-col">

        {/* Header */}
        <div className="w-full h-[4.8em] border-b flex justify-between items-center px-6 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-xl text-zinc-900">Alerts Monitor</h1>

            {/* Client Selector */}
            <Select
              value={clientId?.toString()}
              onValueChange={(val) => {
                const client = clients.find(c => c.id === Number(val));
                setCurrentClient(client || null);
              }}
            >
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border-l pl-4">
              <NotificationsPopover />
              <Button
                size="sm"
                className="gap-2 bg-zinc-900 hover:bg-zinc-800"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!clientId}
              >
                <FiPlus /> Create Alert
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto">

          {!clientId ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <p>Please select a client to view alerts.</p>
            </div>
          ) : queryError ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <p className="font-medium">Failed to load alerts</p>
              <p className="text-sm text-zinc-500 mt-2">
                {(queryError as any)?.response?.data?.message || 'Please try again later'}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex justify-between items-center">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-zinc-100/50 p-1 border border-zinc-200/50">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">All Monitors</TabsTrigger>
                    <TabsTrigger value="critical" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-red-600 data-[state=active]:text-red-600">
                      Critical <span className="ml-2 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs">{alerts.filter(a => getAlertStatus(a) === 'critical').length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="healthy" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-green-600 data-[state=active]:text-green-600">
                      Healthy <span className="ml-2 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-xs">{alerts.filter(a => getAlertStatus(a) === 'healthy').length}</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Critical Section */}
              {criticalAlerts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Critical Attention Needed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {criticalAlerts.map(alert => (
                      <PulseCard
                        key={alert.id}
                        alert={alert}
                        onDelete={() => handleDelete(alert.id)}
                        onEdit={() => setEditingAlert(alert)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Healthy Section */}
              {healthyAlerts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Active Monitors</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {healthyAlerts.map(alert => (
                      <MonitorCard
                        key={alert.id}
                        alert={alert}
                        onDelete={() => handleDelete(alert.id)}
                        onEdit={() => setEditingAlert(alert)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                    <FiSearch className="text-zinc-300 text-2xl" />
                  </div>
                  <h3 className="text-zinc-900 font-medium">No alerts found</h3>
                  <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Create Alert Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
          </DialogHeader>
          {clientId && (
            <AlertForm
              clientId={clientId}
              clientName={currentClient?.name}
              client={currentClient as ClientWithIntegrations}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={createMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Alert Modal */}
      <Dialog open={!!editingAlert} onOpenChange={(open) => !open && setEditingAlert(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
          </DialogHeader>
          {clientId && editingAlert && (
            <AlertForm
              clientId={clientId}
              clientName={currentClient?.name}
              client={currentClient as ClientWithIntegrations}
              initialData={editingAlert}
              onSubmit={handleUpdate}
              onCancel={() => setEditingAlert(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};


// --- Components ---

interface CardProps {
  alert: Alert;
  onDelete: () => void;
  onEdit: () => void;
}

const PulseCard = ({ alert, onDelete, onEdit }: CardProps) => {
  const type = getAlertType(alert.integration);

  return (
    <div className="group relative bg-white rounded-xl border border-red-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Pulse Effect Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-red-100/50 transition-colors"></div>

      <div className="relative flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'financial' ? 'bg-orange-50 text-orange-600' :
            type === 'system' ? 'bg-blue-50 text-blue-600' :
              'bg-purple-50 text-purple-600'
            }`}>
            {type === 'financial' && <FiDollarSign className="text-xl" />}
            {type === 'system' && <FiServer className="text-xl" />}
            {type === 'performance' && <FiActivity className="text-xl" />}
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 truncate max-w-[150px]">{alert.metricLabel}</h4>
            <p className="text-xs text-zinc-500">{alert.integration}</p>
          </div>
        </div>
        {/* Live Pulse Dot */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="flex items-baseline gap-2">
          {typeof alert.currentValue === 'number' ? (
            <span className="text-3xl font-bold text-zinc-900">
              {type === 'financial' ? `${alert.currentValue.toLocaleString()}` : alert.currentValue}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-zinc-400 text-lg font-medium bg-zinc-50 px-3 py-1 rounded-full">
              <FiClock className="w-4 h-4 animate-pulse" />
              Waiting for data...
            </span>
          )}
        </div>
        <p className="text-sm text-red-600 font-medium mt-1">
          Threshold: <span className="opacity-80">{alert.condition.replace(/_/g, ' ')} {alert.triggerValue}</span>
        </p>
      </div>

      <div className="relative flex items-center justify-between pt-4 border-t border-red-50">
        <span className="text-xs text-zinc-400">
          {alert.updatedAt ? `Updated ${format(new Date(alert.updatedAt), "MMM d")}` : 'Recently'}
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600" onClick={onEdit}>
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={onDelete}>
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MonitorCard = ({ alert, onDelete, onEdit }: CardProps) => {
  const type = getAlertType(alert.integration);

  return (
    <div className="bg-white rounded-lg border border-zinc-100 p-4 shadow-sm hover:border-zinc-200 transition-colors group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${type === 'financial' ? 'bg-zinc-50 text-zinc-600' :
            type === 'system' ? 'bg-zinc-50 text-zinc-600' :
              'bg-zinc-50 text-zinc-600'
            }`}>
            {type === 'financial' && <FiDollarSign />}
            {type === 'system' && <FiServer />}
            {type === 'performance' && <FiActivity />}
          </div>
          <div>
            <h4 className="font-medium text-sm text-zinc-900 truncate max-w-[120px]">{alert.metricLabel}</h4>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{alert.integration}</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          {typeof alert.currentValue === 'number' ? (
            <span className="text-lg font-semibold text-zinc-700">
              {type === 'financial' ? `${alert.currentValue.toLocaleString()}` : alert.currentValue}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-zinc-400 text-sm font-medium">
              <FiClock className="w-3.5 h-3.5" />
              Waiting...
            </span>
          )}
          <p className="text-xs text-zinc-400 mt-0.5 max-w-[100px] truncate" title={`${alert.condition} ${alert.triggerValue}`}>
            Target: {alert.condition.replace(/_/g, ' ')} {alert.triggerValue}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-600" onClick={onEdit}>
            <FiEdit2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={onDelete}>
            <FiTrash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
