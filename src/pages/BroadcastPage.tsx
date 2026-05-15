import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Send,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  Search,
  Filter,
  Building2,
  Layers,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Users,
  UserPlus,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useBroadcasts } from '@/features/broadcasts/hooks/useBroadcasts';
import { CreateBroadcastModal } from '@/features/broadcasts/components/CreateBroadcastModal';
import { TemplateManager } from '@/features/broadcasts/components/TemplateManager';
import { ProviderManager } from '@/features/broadcasts/components/ProviderManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useClientContext } from '@/context/ClientContext';
import { useBroadcastStore } from '@/store/useBroadcastStore';
import { useCreateClient, useDeleteClient, useClient, useClients } from '../hooks/useClients';
import { getProfileImageUrl } from '@/utils/imageUtils';
import type { ClientWithIntegrations } from '@/types/client.types';

const statusConfig = {
  PENDING: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Pending'
  },
  PROCESSING: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    label: 'Processing'
  },
  RUNNING: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    label: 'Running'
  },
  COMPLETED: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Completed'
  },
  FAILED: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: 'Failed'
  }
};

/* ═══════════════════════════════════════════════════
   Step 1 — Select Client
   ═══════════════════════════════════════════════════ */
function StepSelectClient({
  clients,
  isLoading,
  onSelect,
  onAddExisting,
  onAddNew,
  onDelete,
}: {
  clients: ClientWithIntegrations[];
  isLoading: boolean;
  onSelect: (client: ClientWithIntegrations) => void;
  onAddExisting: () => void;
  onAddNew: () => void;
  onDelete: (client: ClientWithIntegrations) => void;
}) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  return (
    <div className="w-full p-8 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-12 text-center pt-10">
          <div className="w-20 h-20 bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 rounded-[28%] flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Send className="w-10 h-10 text-zinc-800" />
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-none">Broadcast Studio</h1>
          <p className="text-zinc-500 mt-3 text-lg font-medium max-w-lg mx-auto leading-relaxed">
            Manage your SMS & Email campaigns across all your workspaces. Select a workspace to begin.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-zinc-300 animate-spin mb-4" />
            <p className="text-zinc-400 font-medium">Loading your workspaces...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white/80 backdrop-blur-sm border border-zinc-200/50 rounded-[24px] p-7 cursor-pointer hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 hover:-translate-y-1.5 transition-all group duration-500 relative"
              >
                <div onClick={() => onSelect(client)} className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl border border-zinc-100 overflow-hidden flex items-center justify-center bg-zinc-50 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
                    {client.logo ? (
                      <img src={getProfileImageUrl(client.logo)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                        <Layers className="w-7 h-7 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-zinc-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                      {client.name}
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 line-clamp-1 mt-1">
                      {client.description || 'No description provided'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(client);
                  }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:rotate-90 transition-all opacity-0 group-hover:opacity-100 blur-0"
                  title="Delete client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Client card */}
            <Popover open={addMenuOpen} onOpenChange={setAddMenuOpen}>
              <PopoverTrigger asChild>
                <div className="bg-white/40 backdrop-blur-md border-2 border-dashed border-zinc-200 rounded-[24px] p-7 cursor-pointer hover:bg-white/60 hover:border-zinc-400 hover:shadow-xl transition-all flex flex-col items-center justify-center min-h-[160px] group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-zinc-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative z-10">
                    <Plus className="w-7 h-7 text-zinc-800" />
                  </div>
                  <span className="font-bold text-zinc-800 tracking-tight text-lg relative z-10">Add New Workspace</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1.5 rounded-xl shadow-lg border border-zinc-200" align="center" sideOffset={8}>
                <button
                  onClick={() => { setAddMenuOpen(false); onAddExisting(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">Existing Client</p>
                    <p className="text-[11px] text-zinc-400">Choose from your clients</p>
                  </div>
                </button>
                <button
                  onClick={() => { setAddMenuOpen(false); onAddNew(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">New Client</p>
                    <p className="text-[11px] text-zinc-400">Create a new client</p>
                  </div>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 1b — Create Client Form
   ═══════════════════════════════════════════════════ */
function StepCreateClient({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (data: { name: string; description: string; logo?: File }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    onCreate({ name: name.trim(), description: description.trim(), logo: logoFile || undefined });
  };

  return (
    <div className="w-full p-8 relative">
      <div className="max-w-xl mx-auto relative z-10 pt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-all mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="bg-white/80 backdrop-blur-md border border-zinc-200/50 rounded-[32px] p-10 shadow-2xl shadow-zinc-200/50">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-white shadow-lg border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transform -rotate-6 transition-transform duration-500">
              <Building2 className="w-8 h-8 text-zinc-800" />
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Create Workspace</h2>
            <p className="text-zinc-500 mt-2 font-medium">Set up your broadcast hub.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2.5 block px-1">
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Acme Marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 px-5 rounded-[18px] border-zinc-200 bg-white/50 focus:bg-white transition-all text-lg font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2.5 block px-1">
                Description
              </label>
              <Textarea
                placeholder="A few words about this workspace..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] px-5 py-4 rounded-[18px] border-zinc-200 bg-white/50 focus:bg-white transition-all text-base font-medium resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2.5 block px-1">
                Workspace Logo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-5 h-5 text-zinc-300" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="broadcast-logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('broadcast-logo-upload')?.click()}
                    className="w-full h-11 rounded-xl border-zinc-200 text-xs font-bold"
                  >
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex-1 h-14 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-[2] h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg tracking-tight transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              Create Workspace
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 1c — Pick Existing Client
   ═══════════════════════════════════════════════════ */
function StepPickExistingClient({
  clients,
  onSelect,
  onBack,
}: {
  clients: ClientWithIntegrations[];
  onSelect: (client: ClientWithIntegrations) => void;
  onBack: () => void;
}) {
  return (
    <div className="w-full p-8 relative">
      <div className="max-w-3xl mx-auto relative z-10 pt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-all mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="bg-white/80 backdrop-blur-md border border-zinc-200/50 rounded-[32px] p-10 shadow-2xl shadow-zinc-200/50">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-white shadow-lg border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transform rotate-3">
              <Users className="w-8 h-8 text-zinc-800" />
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Select Workspace</h2>
            <p className="text-zinc-500 mt-2 font-medium">Choose an existing client for your broadcast.</p>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-zinc-400 font-medium">No workspaces found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onSelect(client)}
                  className="flex items-center gap-5 p-5 rounded-[22px] border border-zinc-100 bg-white hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-100/50 cursor-pointer transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl border border-zinc-50 overflow-hidden flex items-center justify-center bg-zinc-50 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
                    {client.logo ? (
                      <img src={getProfileImageUrl(client.logo)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-zinc-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {client.name}
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 line-clamp-1 mt-0.5">
                      {client.description || 'No description'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Workspace — Broadcast Dashboard
   ═══════════════════════════════════════════════════ */
function StepWorkspace({
  client,
  onSwitchWorkspace,
}: {
  client: ClientWithIntegrations;
  onSwitchWorkspace: () => void;
}) {
  const { data: broadcasts, isLoading, refetch, isRefetching } = useBroadcasts(client.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');



  const filteredBroadcasts = broadcasts?.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Workspace header bar */}
      <div className="px-5 py-3 border-b border-zinc-100 bg-white/60 backdrop-blur-sm shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl border border-zinc-100 overflow-hidden flex items-center justify-center bg-zinc-50 shrink-0">
              {client.logo ? (
                <img src={getProfileImageUrl(client.logo)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-zinc-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-zinc-900 truncate leading-tight">{client.name}</h3>
              <p className="text-[11px] text-zinc-400 font-medium truncate">Broadcast Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchWorkspace}
              className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 h-8 px-4 shrink-0 rounded-lg border-zinc-200 hover:bg-zinc-50 gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" />
              Switch Workspace
            </Button>
            <Button 
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-4 h-8 flex items-center gap-2 font-bold transition-all text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                New Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto w-full">
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="bg-zinc-100/50 p-1 border border-zinc-200/50 rounded-xl mb-8">
              <TabsTrigger value="providers" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Providers</TabsTrigger>
              <TabsTrigger value="templates" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Templates</TabsTrigger>
              <TabsTrigger value="campaigns" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-8 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[28px] border border-zinc-200/50 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Campaigns</p>
                  </div>
                  <p className="text-4xl font-extrabold text-zinc-900 tracking-tight">{broadcasts?.length || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[28px] border border-zinc-200/50 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Messages Sent</p>
                  </div>
                  <p className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                    {broadcasts?.reduce((acc, b) => acc + b.sentCount, 0).toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-[28px] border border-zinc-200/50 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Failures</p>
                  </div>
                  <p className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                    {broadcasts?.reduce((acc, b) => acc + b.failedCount, 0).toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-zinc-200/60 shadow-xl shadow-zinc-200/20 overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search campaigns..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toast.info('Refreshing campaigns...');
                        refetch();
                      }} 
                      disabled={isLoading || isRefetching}
                      className="rounded-xl border-zinc-200 text-zinc-600 font-bold text-xs h-10 px-4 gap-2"
                    >
                      <RefreshCcw className={cn("w-3.5 h-3.5", (isLoading || isRefetching) && "animate-spin")} />
                      {isRefetching ? 'Refetching...' : 'Refresh'}
                    </Button>
                    <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-600 font-bold text-xs h-10 px-4">
                      <Filter className="w-3.5 h-3.5 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50/50">
                        <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Campaign Details</th>
                        <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Channel</th>
                        <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Progress</th>
                        <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">Date Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                            <Loader2 className="w-10 h-10 text-zinc-200 animate-spin mx-auto mb-4" />
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Loading Campaigns...</p>
                          </td>
                        </tr>
                      ) : filteredBroadcasts?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                            <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-dashed border-zinc-200">
                              <Send className="w-8 h-8 text-zinc-300" />
                            </div>
                            <h3 className="text-zinc-900 font-bold text-lg mb-1">No campaigns found</h3>
                            <p className="text-zinc-500 text-sm font-medium">Create your first broadcast to reach your customers.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredBroadcasts?.map((b) => {
                          const cfg = statusConfig[b.status as keyof typeof statusConfig] || statusConfig.PENDING;
                          const progress = b.totalCount > 0 ? (b.sentCount / b.totalCount) * 100 : 0;
                          
                          return (
                            <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex flex-col">
                                  <span className="font-bold text-zinc-900 mb-1 group-hover:text-blue-600 transition-colors">{b.name}</span>
                                  <span className="text-xs text-zinc-400 font-medium truncate max-w-[200px]">{b.message}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                  {b.channel === 'SMS' ? (
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                      <MessageSquare className="w-4 h-4 text-orange-600" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                      <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                  )}
                                  <span className="text-xs font-bold text-zinc-600">{b.channel}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight ${cfg.color}`}>
                                  {cfg.icon}
                                  {cfg.label}
                                </div>
                              </td>
                              <td className="px-8 py-6 min-w-[200px]">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                                    <span>{b.sentCount} / {b.totalCount}</span>
                                    <span>{Math.round(progress)}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50 shadow-inner">
                                    <div 
                                      className={`h-full transition-all duration-500 rounded-full ${
                                        b.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-600'
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <span className="text-xs font-bold text-zinc-500">
                                  {format(new Date(b.createdAt), 'MMM d, yyyy')}
                                </span>
                                <div className="text-[10px] text-zinc-400 font-medium mt-1">
                                  {format(new Date(b.createdAt), 'hh:mm a')}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="focus-visible:outline-none">
              <TemplateManager />
            </TabsContent>

            <TabsContent value="providers" className="focus-visible:outline-none">
              <ProviderManager clientId={client.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateBroadcastModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        clientId={client.id}
      />
    </div>
  );
}

export default function BroadcastPage() {
  const { clientId: urlClientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { currentStep, setCurrentStep } = useBroadcastStore();
  const { currentClient, setCurrentClient: _setCurrentClient, clients: allClients, isLoading: isLoadingContext } = useClientContext();
  const { isLoading: isLoadingClientsFetch } = useClients();
  const isLoadingClients = isLoadingContext || isLoadingClientsFetch;

  const [subStep, setSubStep] = useState<'main' | 'create' | 'existing'>('main');

  const { data: liveClient } = useClient(currentClient?.id || null);
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();

  const setCurrentClient = (client: ClientWithIntegrations | null) => {
    _setCurrentClient(client);
    if (client) {
      localStorage.setItem('lastBroadcastClientId', String(client.id));
      if (urlClientId !== String(client.id)) {
        navigate(`/broadcasts/${client.id}`);
      }
    } else {
      navigate('/broadcasts');
    }
  };

  // Sync URL clientId with state on mount or change
  useEffect(() => {
    if (!urlClientId || allClients.length === 0) return;
    const client = allClients.find(c => String(c.id) === urlClientId);
    if (!client) return;

    if (!currentClient || currentClient.id !== client.id) {
      _setCurrentClient(client as ClientWithIntegrations);
    }

    if (currentStep === 'select-client') {
      setCurrentStep('workspace');
    }
  }, [urlClientId, allClients.length, currentClient?.id, currentStep]);

  useEffect(() => {
    if (liveClient && currentClient && liveClient.id === currentClient.id) {
      const liveIntCount = (liveClient as ClientWithIntegrations).integrations?.length ?? 0;
      const ctxIntCount = (currentClient as ClientWithIntegrations).integrations?.length ?? 0;
      if (liveIntCount !== ctxIntCount) {
        setCurrentClient(liveClient as ClientWithIntegrations);
      }
    }
  }, [liveClient]);

  const activeClient = (liveClient || currentClient) as ClientWithIntegrations | null;

  const renderContent = () => {
    if (currentStep === 'select-client') {
      if (subStep === 'create') {
        return (
          <StepCreateClient
            onBack={() => setSubStep('main')}
            onCreate={(data) => {
              createClient.mutate(data, {
                onSuccess: (newClient) => {
                  setCurrentClient(newClient as ClientWithIntegrations);
                  setSubStep('main');
                  setCurrentStep('workspace');
                },
              });
            }}
          />
        );
      }

      if (subStep === 'existing') {
        return (
          <StepPickExistingClient
            clients={allClients}
            onSelect={(client) => {
              setCurrentClient(client);
              setSubStep('main');
              setCurrentStep('workspace');
            }}
            onBack={() => setSubStep('main')}
          />
        );
      }

      return (
        <StepSelectClient
          clients={allClients}
          isLoading={isLoadingClients}
          onSelect={(client) => {
            setCurrentClient(client);
            setCurrentStep('workspace');
          }}
          onAddExisting={() => setSubStep('existing')}
          onAddNew={() => setSubStep('create')}
          onDelete={(client) => {
            if (window.confirm(`Delete "${client.name}" and all their data?`)) {
              deleteClient.mutate(client.id);
            }
          }}
        />
      );
    }

    if (currentStep === 'workspace' && activeClient) {
      return (
        <StepWorkspace
          client={activeClient}
          onSwitchWorkspace={() => {
            setCurrentClient(null);
            setCurrentStep('select-client');
          }}
        />
      );
    }

    setCurrentStep('select-client');
    return null;
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-white">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col relative">
          <div className="flex-1 overflow-y-auto relative h-full custom-scrollbar">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
