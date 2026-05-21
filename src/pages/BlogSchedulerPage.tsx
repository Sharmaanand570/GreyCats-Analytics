import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogSchedulerStore } from '@/store/useBlogSchedulerStore';
import { BlogCalendar } from '@/features/blog/components/BlogCalendar';
import {
  Layers,
  Plus,
  ArrowLeft,
  ArrowRight,
  Building2,
  Trash2,
  Users,
  UserPlus,
  Loader2,
  AlertCircle,
  PenLine,
} from 'lucide-react';
import { SiLinkedin, SiTelegram, SiBlogger } from 'react-icons/si';
import { FaWordpress, FaReddit } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { toast } from 'sonner';
import { useCreateClient, useDeleteClient, useClient, useClients } from '../hooks/useClients';
import { useClientContext } from '@/context/ClientContext';
import { getProfileImageUrl } from '@/utils/imageUtils';
import type { ClientWithIntegrations } from '@/types/client.types';
import { ConnectBlogPlatform } from '@/features/blog/components/ConnectBlogPlatform';
import { useWordPressTargets, useLinkedInTargets } from '@/features/blog/hooks/useBlogPosts';
import {
  ConnectPlatformsButton,
  type ConnectedPlatformIcon,
} from '@/components/scheduler/ConnectPlatformsButton';

const BLOG_PLATFORM_ICONS: Record<string, { name: string; icon: React.ReactNode }> = {
  linkedin: { name: 'LinkedIn', icon: <SiLinkedin style={{ color: '#0A66C2' }} /> },
  wordpress: { name: 'WordPress', icon: <FaWordpress style={{ color: '#21759b' }} /> },
  telegram: { name: 'Telegram', icon: <SiTelegram style={{ color: '#229ED9' }} /> },
  blogger: { name: 'Blogger', icon: <SiBlogger style={{ color: '#f57c00' }} /> },
  reddit: { name: 'Reddit', icon: <FaReddit style={{ color: '#FF4500' }} /> },
};

// Blog platforms configuration removed, moved to ConnectBlogPlatform

/* ═══════════════════════════════════════════════════
   Step 1 — Select Client
   ═══════════════════════════════════════════════════ */
function StepSelectClient({
  clients,
  isLoading,
  isError,
  onSelect,
  onAddExisting,
  onAddNew,
  onDelete,
}: {
  clients: ClientWithIntegrations[];
  isLoading: boolean;
  isError?: boolean;
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
            <PenLine className="w-10 h-10 text-zinc-800" />
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-none">Blog Studio</h1>
          <p className="text-zinc-500 mt-3 text-lg font-medium max-w-lg mx-auto leading-relaxed">
            Your command center for multi-platform blog publishing. Select a workspace to begin.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-zinc-300 animate-spin mb-4" />
            <p className="text-zinc-400 font-medium">Loading your workspaces...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-10 h-10 text-red-300 mb-4" />
            <p className="text-red-500 font-medium">Failed to load workspaces. Please try again.</p>
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
            <p className="text-zinc-500 mt-2 font-medium">Set up your blog publishing hub.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2.5 block px-1">
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Acme Blog"
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
                    id="blog-logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('blog-logo-upload')?.click()}
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
            <p className="text-zinc-500 mt-2 font-medium">Choose an existing client for blog scheduling.</p>
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
   Workspace — Calendar + Connections
   ═══════════════════════════════════════════════════ */
function StepWorkspace({
  client,
  onSwitchWorkspace,
}: {
  client: ClientWithIntegrations;
  onSwitchWorkspace: () => void;
}) {
  // Derive "connected platforms" from the per-platform target endpoints.
  // Match BlogPostModal's behavior (no clientId filter) so the icon list
  // and the modal's platform list stay in sync. Telegram is intentionally
  // excluded — it's a broadcast destination, not a blog destination.
  const { data: wordpressTargets = [] } = useWordPressTargets(client.id);
  const { data: linkedinTargets = [] } = useLinkedInTargets(client.id);

  const connectedPlatforms: ConnectedPlatformIcon[] = useMemo(() => {
    const result: ConnectedPlatformIcon[] = [];
    const add = (id: string) => {
      const meta = BLOG_PLATFORM_ICONS[id];
      if (meta) result.push({ id, name: meta.name, icon: meta.icon });
    };
    if (wordpressTargets.length > 0) add('wordpress');
    if (linkedinTargets.length > 0) add('linkedin');
    return result;
  }, [wordpressTargets.length, linkedinTargets.length]);

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
              <p className="text-[11px] text-zinc-400 font-medium truncate">Blog Workspace</p>
            </div>
            <div className="w-px h-6 bg-zinc-200 shrink-0 mx-1 hidden sm:block" />
            <ConnectBlogPlatform clientId={client.id}>
              <ConnectPlatformsButton connected={connectedPlatforms} />
            </ConnectBlogPlatform>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSwitchWorkspace}
            className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 h-8 px-4 shrink-0 rounded-lg border-zinc-200 hover:bg-zinc-50 gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            Switch Workspace
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-[1400px] mx-auto h-full">
          <BlogCalendar
            clientId={client.id}
            canPost
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */
export default function BlogSchedulerPage() {
  const { clientId: urlClientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, resetDraft } = useBlogSchedulerStore();
  const { currentClient, setCurrentClient: _setCurrentClient, clients: allClients, isLoading: isLoadingContext } = useClientContext();
  const { isLoading: isLoadingClientsFetch } = useClients();
  const isLoadingClients = isLoadingContext || isLoadingClientsFetch;

  const setCurrentClient = (client: ClientWithIntegrations | null) => {
    _setCurrentClient(client);
    // Reset the blog draft when switching clients to prevent form state leakage
    resetDraft();
    if (client) {
      localStorage.setItem('lastBlogClientId', String(client.id));
      if (urlClientId !== String(client.id)) {
        navigate(`/blog/scheduler/${client.id}`);
      }
    } else {
      navigate('/blog/scheduler');
    }
  };

  // Sync URL clientId with state on mount or change
  useEffect(() => {
    if (!urlClientId || allClients.length === 0) return;
    const client = allClients.find(c => String(c.id) === urlClientId);
    if (!client) return;

    let shouldUpdateStep = false;
    if (!currentClient || currentClient.id !== client.id) {
      _setCurrentClient(client as ClientWithIntegrations);
      shouldUpdateStep = true;
    }

    if (shouldUpdateStep && currentStep === 'select-client') {
      setCurrentStep('workspace');
    }
  }, [urlClientId, allClients.length]);

  const [subStep, setSubStep] = useState<'main' | 'create' | 'existing'>('main');

  const { data: liveClient } = useClient(currentClient?.id || null);
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();

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
          isError={false}
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
          <div className="flex-1 overflow-y-auto relative h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
