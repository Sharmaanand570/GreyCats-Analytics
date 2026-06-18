import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocialMediaStore } from '@/store/useSocialMediaStore';
import { SocialMediaCalendar } from '@/features/social-media/components/SocialMediaCalendar';
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Building2,
  Trash2,
  Users,
  UserPlus,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa6';
import { toast } from 'sonner';
import { useCreateClient, useDeleteClient, useClient, useAllClients } from '../hooks/useClients';
import { useClientContext } from '@/context/ClientContext';
import { useAvailableAccounts, useAssignAccount, useRemoveAccount } from '@/hooks/useIntegrations';
import { loginMetaBusiness } from '@/features/meta/API/metaBusinessApi';

import { getProfileImageUrl } from '@/utils/imageUtils';
import { AISuggestionsPanel, useAISuggestionsCount } from '@/features/social-media/components/AISuggestionsPanel';
import type { ClientWithIntegrations, AvailableAccount } from '@/types/client.types';
import {
  ConnectPlatformsButton,
  type ConnectedPlatformIcon,
} from '@/components/scheduler/ConnectPlatformsButton';

function ClientLogo({ logo, size = 'md' }: { logo?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false);
  const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';
  const showImg = logo && !failed;
  return showImg ? (
    <img
      src={getProfileImageUrl(logo)}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
      <Layers className={`${iconClass} text-zinc-400`} />
    </div>
  );
}

// Meta = single connection for Instagram + Facebook
const PLATFORMS = [
  {
    id: 'meta',
    label: 'Meta',
    sublabel: 'Instagram & Facebook',
    icon: (
      <div className="flex items-center -space-x-1">
        <FaFacebook className="w-4 h-4 text-blue-600" />
        <FaInstagram className="w-4 h-4 text-pink-600" />
      </div>
    ),
    comingSoon: false,
  },
  { id: 'linkedin', label: 'LinkedIn', sublabel: null, icon: <FaLinkedin className="w-5 h-5 text-blue-700" />, comingSoon: false },
];

/* ═══════════════════════════════════════════════════
   Step 1 — Select client / Add Client (choose or create)
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
    <div className="w-full p-4 sm:p-8 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8 sm:mb-12 text-center pt-6 sm:pt-10">
          <div className="w-20 h-20 bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 rounded-[28%] flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Layers className="w-10 h-10 text-zinc-800" />
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-none">Social Media Studio</h1>
          <p className="text-zinc-500 mt-3 text-lg font-medium max-w-lg mx-auto leading-relaxed">
            Your command center for multi-platform presence. Select a workspace to begin.
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
                    <ClientLogo logo={client.logo} size="lg" />
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
                {/* Delete button */}
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

            {/* Add Client card with dropdown */}
            <Popover open={addMenuOpen} onOpenChange={setAddMenuOpen}>
              <PopoverTrigger asChild>
                <div className="bg-white/40 backdrop-blur-md border-2 border-dashed border-zinc-200 rounded-[24px] p-7 cursor-pointer hover:bg-white/60 hover:border-zinc-400 hover:shadow-xl transition-all flex flex-col items-center justify-center min-h-[160px] group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-zinc-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative z-10">
                    <Plus className="w-7 h-7 text-zinc-800" />
                  </div>
                  <span className="font-bold text-zinc-800 tracking-tight text-lg relative z-10">Add New Workspace</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1.5 rounded-xl shadow-lg border border-zinc-200" align="center" sideOffset={8}>
                <button
                  onClick={() => {
                    setAddMenuOpen(false);
                    onAddExisting();
                  }}
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
                  onClick={() => {
                    setAddMenuOpen(false);
                    onAddNew();
                  }}
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
    <div className="w-full p-4 sm:p-8 relative">
      <div className="max-w-xl mx-auto relative z-10 pt-6 sm:pt-10">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-zinc-200">1</div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">Workspace</span>
          </div>
          <div className="w-12 h-1 bg-zinc-200 rounded-full opacity-50" />
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-zinc-200 text-zinc-400 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-sm font-bold text-zinc-400 tracking-tight">Connectivity</span>
          </div>
          <div className="w-12 h-1 bg-zinc-200 rounded-full opacity-50" />
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-zinc-200 text-zinc-400 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-sm font-bold text-zinc-400 tracking-tight">Ready</span>
          </div>
        </div>

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
            <p className="text-zinc-500 mt-2 font-medium">Define your client's digital hub.</p>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2.5 block px-1">
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Acme Global"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 px-5 rounded-[18px] border-zinc-200 bg-white/50 focus:bg-white transition-all text-lg font-medium"
              />
            </div>

            <div className="group">
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

            <div className="group">
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
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
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
              Create & Connect
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
    <div className="w-full p-4 sm:p-8 relative">
      <div className="max-w-3xl mx-auto relative z-10 pt-6 sm:pt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-all mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="bg-white/80 backdrop-blur-md border border-zinc-200/50 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-zinc-200/50">
          <div className="mb-8 sm:mb-10 text-center">
            <div className="w-16 h-16 bg-white shadow-lg border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transform rotate-3">
              <Users className="w-8 h-8 text-zinc-800" />
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Select Workspace</h2>
            <p className="text-zinc-500 mt-2 font-medium">Revisit an existing client setup.</p>
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
                    <ClientLogo logo={client.logo} size="md" />
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
   Step 2 — Connect Platforms (Meta = single card)
   ═══════════════════════════════════════════════════ */
function StepConnectPlatforms({
  client,
  onContinue,
  onBack,
}: {
  client: ClientWithIntegrations;
  onContinue: () => void;
  onBack: () => void;
}) {
  const { data: availableMetaPages = [], isLoading: isLoadingPages } = useAvailableAccounts('meta-business');
  const { data: availableLinkedinPages = [], isLoading: isLoadingLinkedin } = useAvailableAccounts('linkedin');
  const assignAccount = useAssignAccount();
  const removeAccount = useRemoveAccount();

  const handleTogglePage = async (page: AvailableAccount) => {
    const isAlreadyLinked = !!(client.integrations || []).find(
      (i: any) => i.integrationType === 'meta-business' && i.accountId === page.id
    );

    if (isAlreadyLinked) {
      if (window.confirm(`Disconnect ${page.pageName || page.pageId}?`)) {
        removeAccount.mutate({
          clientId: client.id,
          integrationType: 'meta-business',
          accountId: page.id,
        });
      }
    } else {
      assignAccount.mutate({
        clientId: client.id,
        data: {
          integrationType: 'meta-business',
          accountId: page.id,
        },
      });
    }
  };

  const handleNewConnection = async () => {
    try {
      // Save context so the OAuth callback knows where to return
      localStorage.setItem('pending_oauth_client_id', String(client.id));
      localStorage.setItem('pending_oauth_integration', 'meta-business');
      localStorage.setItem('pending_oauth_return', '/social-media/scheduler');
      await loginMetaBusiness(); // redirects to Facebook OAuth
    } catch (error) {
      toast.error('Failed to initiate login');
    }
  };

  const linkedPages = (client.integrations || []).filter(
    (i) => i.integrationType === 'meta-business'
  );
  const linkedLinkedin = (client.integrations || []).filter(
    (i) => i.integrationType === 'linkedin'
  );
  const hasAnyConnection = linkedPages.length > 0 || linkedLinkedin.length > 0;

  return (
    <div className="w-full p-4 sm:p-6 relative">
      <div className="max-w-4xl mx-auto relative z-10 pt-4">
        {/* Top bar: Left = back + heading, Right = coming soon + stepper */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 mb-6">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-all mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Workspaces
            </button>
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight leading-none mb-1">Connect Your Presence</h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Link your social channels for <span className="text-zinc-900 font-bold">{client.name}</span> to enable automated scheduling.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-3">
            {/* Coming Soon Platforms */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-100 bg-white/60">
              <div className="flex items-center -space-x-1">
                {PLATFORMS.filter((p: any) => p.comingSoon).map((platform: any) => (
                  <div
                    key={platform.id}
                    className="w-6 h-6 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 [&>svg]:w-3 [&>svg]:h-3"
                  >
                    {platform.icon}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Coming Soon</span>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 tracking-tight">Workspace</span>
              </div>
              <div className="w-8 h-0.5 bg-zinc-200 rounded-full" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-zinc-200">2</div>
                <span className="text-xs font-bold text-zinc-900 tracking-tight">Connectivity</span>
              </div>
              <div className="w-8 h-0.5 bg-zinc-200 rounded-full opacity-50" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-zinc-200 text-zinc-400 flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-xs font-bold text-zinc-400 tracking-tight">Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Active Integrations */}
          <div className="bg-white/80 backdrop-blur-sm border border-zinc-200/50 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-xl shadow-zinc-100/50">
            {/* Platform badge + header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                <FaFacebook className="w-3.5 h-3.5 text-blue-600" />
                <FaInstagram className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-[11px] font-bold text-blue-700 tracking-tight ml-0.5">Meta</span>
              </div>
              {linkedPages.length > 0 && (
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Connected</span>
              )}
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Available Pages</h3>
                <p className="text-xs text-zinc-400 font-medium">Select pages to link with this workspace.</p>
              </div>
              <Button
                variant="outline"
                onClick={handleNewConnection}
                className="h-9 rounded-xl border-zinc-200 font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Account
              </Button>
            </div>

            {isLoadingPages ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-zinc-200 animate-spin mb-3" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Syncing Meta Accounts...</p>
              </div>
            ) : availableMetaPages.length === 0 ? (
              <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-bold mb-1">No Meta Pages Found</p>
                <p className="text-xs text-zinc-400 font-medium px-10">
                  Connect your Facebook account to manage Instagram and Facebook pages.
                </p>
                <Button variant="link" onClick={handleNewConnection} className="mt-2 text-blue-600 font-bold">
                  Connect Facebook Now
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {availableMetaPages.map((page: AvailableAccount) => {
                  const isLinked = !!linkedPages.find((p: any) => p.accountId === page.id);
                  return (
                    <div
                      key={page.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        isLinked
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-100 overflow-hidden text-zinc-400">
                          {isLinked ? (
                            <div className="flex items-center -space-x-1">
                              <FaFacebook className="w-4 h-4 text-blue-600" />
                              <FaInstagram className="w-4 h-4 text-pink-600" />
                            </div>
                          ) : (
                            <Layers className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 leading-none mb-1">
                            {page.pageName || page.instagramUsername || 'Unnamed Page'}
                          </h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {page.pageId ? 'Facebook Page' : 'Instagram account'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={isLinked ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleTogglePage(page)}
                        disabled={assignAccount.isPending || removeAccount.isPending}
                        className={`h-9 px-5 rounded-lg font-bold text-xs tracking-tight ${
                          isLinked
                            ? 'border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        }`}
                      >
                        {isLinked ? 'Disconnect' : 'Link to Client'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Go to Calendar button inside the container */}
            <div className="mt-6 flex justify-end border-t border-zinc-100 pt-6">
              <Button
                onClick={onContinue}
                className="h-11 px-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm tracking-tight transition-all shadow-lg shadow-zinc-200 flex items-center gap-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                {hasAnyConnection ? 'Go to Calendar' : 'Skip for now'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* LinkedIn Integrations */}
          <div className="bg-white/80 backdrop-blur-sm border border-zinc-200/50 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-xl shadow-zinc-100/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                <FaLinkedin className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-[11px] font-bold text-blue-800 tracking-tight ml-0.5">LinkedIn</span>
              </div>
              {linkedLinkedin.length > 0 && (
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Connected</span>
              )}
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">LinkedIn Pages</h3>
                <p className="text-xs text-zinc-400 font-medium">Select LinkedIn organization pages to link.</p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { connectLinkedinOrg } = await import('@/features/linkedin/api/linkedinApi');
                    const res = await connectLinkedinOrg(client.id);
                    if (res.url) window.location.href = res.url;
                  } catch (err) {
                    toast.error('Failed to initiate LinkedIn login');
                  }
                }}
                className="h-9 rounded-xl border-zinc-200 font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Connect LinkedIn
              </Button>
            </div>

            {isLoadingLinkedin ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-zinc-200 animate-spin mb-3" />
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Fetching LinkedIn Pages...</p>
              </div>
            ) : availableLinkedinPages.length === 0 ? (
              <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                <FaLinkedin className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-500 font-bold mb-1">No LinkedIn Pages Found</p>
                <p className="text-xs text-zinc-400 font-medium px-10">
                  Connect your LinkedIn account to manage organization pages.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {availableLinkedinPages.map((page: AvailableAccount) => {
                  const isLinked = !!linkedLinkedin.find((p: any) => p.accountId === page.id);
                  return (
                    <div
                      key={page.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        isLinked
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-100 overflow-hidden text-zinc-400">
                           <FaLinkedin className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 leading-none mb-1">
                            {page.name}
                          </h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            LinkedIn Page
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={isLinked ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => {
                          if (isLinked) {
                            removeAccount.mutate({ clientId: client.id, integrationType: 'linkedin', accountId: page.id });
                          } else {
                            assignAccount.mutate({ clientId: client.id, data: { integrationType: 'linkedin', accountId: page.id } });
                          }
                        }}
                        disabled={assignAccount.isPending || removeAccount.isPending}
                        className={`h-9 px-5 rounded-lg font-bold text-xs tracking-tight ${
                          isLinked
                            ? 'border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        }`}
                      >
                        {isLinked ? 'Disconnect' : 'Link to Client'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Step 3 — Workspace (Calendar)
   ═══════════════════════════════════════════════════ */
function StepWorkspace({
  client,
  onSwitchWorkspace,
}: {
  client: ClientWithIntegrations;
  onSwitchWorkspace: () => void;
}) {
  const removeAccount = useRemoveAccount();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const suggestionsCount = useAISuggestionsCount(client.id);

  const linkedPages = (client.integrations || []).filter(
    (i) => i.integrationType === 'meta-business'
  );
  const linkedLinkedin = (client.integrations || []).filter(
    (i) => i.integrationType === 'linkedin'
  );
  const connectedIds = PLATFORMS.filter(p => {
    if (p.id === 'meta') {
      return linkedPages.length > 0;
    }
    if (p.id === 'linkedin') {
      return linkedLinkedin.length > 0;
    }
    return false;
  }).map(p => p.id);

  const handleConnect = async (platformId: string) => {
    if (platformId === 'meta') {
      try {
        localStorage.setItem('pending_oauth_client_id', String(client.id));
        localStorage.setItem('pending_oauth_integration', 'meta-business');
        localStorage.setItem('pending_oauth_return', '/social-media/scheduler');
        await loginMetaBusiness();
      } catch (error) {
        toast.error('Failed to connect Meta');
      }
    }
    if (platformId === 'linkedin') {
      try {
        const { connectLinkedinOrg } = await import('@/features/linkedin/api/linkedinApi');
        const res = await connectLinkedinOrg(client.id);
        if (res.url) window.location.href = res.url;
      } catch (error) {
        toast.error('Failed to connect LinkedIn');
      }
    }
  };

  const handleDisconnect = async (platformId: string) => {
     // For now, Meta disconnect would mean removing all linked pages for this client
     if (platformId === 'meta') {
       try {
         for (const page of linkedPages) {
           await removeAccount.mutateAsync({
             clientId: client.id,
             integrationType: 'meta-business',
             accountId: page.accountId
           });
         }
         toast.success('Meta disconnected from this workspace');
       } catch {
         // Error toast already shown by useRemoveAccount hook
       }
     }
     if (platformId === 'linkedin') {
       try {
         for (const page of linkedLinkedin) {
           await removeAccount.mutateAsync({
             clientId: client.id,
             integrationType: 'linkedin',
             accountId: page.accountId
           });
         }
         toast.success('LinkedIn disconnected from this workspace');
       } catch {
         // Error toast
       }
     }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-50/30">
      <div className="px-3 sm:px-5 py-3 border-b border-zinc-100 bg-white/60 backdrop-blur-sm shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl border border-zinc-100 overflow-hidden flex items-center justify-center bg-zinc-50 shrink-0">
              <ClientLogo logo={client.logo} size="md" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-zinc-900 truncate leading-tight">{client.name}</h3>
              <p className="text-[11px] text-zinc-400 font-medium truncate">Social Media Workspace</p>
            </div>
            <div className="w-px h-6 bg-zinc-200 shrink-0 mx-1 hidden sm:block" />
            <Popover>
              <PopoverTrigger asChild>
                <ConnectPlatformsButton
                  connected={(() => {
                    const list: ConnectedPlatformIcon[] = [];
                    if (connectedIds.includes('meta')) {
                      list.push({
                        id: 'facebook',
                        name: 'Facebook',
                        icon: <FaFacebook className="w-3.5 h-3.5 text-blue-600" />,
                      });
                      list.push({
                        id: 'instagram',
                        name: 'Instagram',
                        icon: <FaInstagram className="w-3.5 h-3.5 text-pink-600" />,
                      });
                    }
                    if (connectedIds.includes('linkedin')) {
                      list.push({
                        id: 'linkedin',
                        name: 'LinkedIn',
                        icon: <FaLinkedin className="w-3.5 h-3.5 text-blue-700" />,
                      });
                    }
                    return list;
                  })()}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-2 bg-white rounded-xl shadow-lg border border-zinc-200/50"
                align="start"
                sideOffset={8}
              >
                <div className="mb-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100/50">
                  <h4 className="font-bold text-sm text-zinc-900 tracking-tight leading-none mb-1">Integrations</h4>
                  <p className="text-[11px] text-zinc-500 font-medium">Link platforms to enable direct posting.</p>
                </div>
                <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto nice-scrollbar">
                  {PLATFORMS.map((p) => {
                    const isConnected = connectedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors group border border-transparent hover:border-zinc-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="shrink-0 bg-white p-1 rounded-md shadow-sm border border-zinc-100">
                            {p.icon}
                          </div>
                          <div>
                            <span className="text-[13px] font-bold text-zinc-800 tracking-tight">{p.label}</span>
                            {p.sublabel && (
                              <p className="text-[10px] text-zinc-400">{p.sublabel}</p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center">
                          {p.comingSoon ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-100 border border-zinc-200/50 shadow-sm">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                                Soon
                              </span>
                            </div>
                          ) : isConnected ? (
                            <button
                              onClick={() => handleDisconnect(p.id)}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200/50 shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors group/btn"
                            >
                              <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest leading-none group-hover/btn:hidden">
                                Linked
                              </span>
                              <CheckCircle2 className="w-3 h-3 text-green-600 group-hover/btn:hidden" />
                              <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest leading-none hidden group-hover/btn:inline">
                                Remove
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(p.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm hover:bg-zinc-800 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-white" />
                              <span className="text-[9px] font-bold text-white uppercase tracking-widest leading-none">
                                Connect
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
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

      <div className="flex-1 p-3 sm:p-6 overflow-hidden">
        <div className="max-w-[1400px] mx-auto h-full">
          <SocialMediaCalendar
            clientId={client.id}
            canPost={connectedIds.length > 0}
            headerExtra={
              <>
              {/* Content Suggestions Button */}
              <Button
                variant="outline"
                className={`h-10 gap-2 shrink-0 transition-colors ${
                  (suggestionsCount.data ?? 0) > 0
                    ? 'bg-violet-50 border-violet-300 hover:bg-violet-100 text-violet-800'
                    : 'bg-white border-zinc-200 hover:bg-zinc-50'
                }`}
                onClick={() => setAiPanelOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
                Suggestions
                {(suggestionsCount.data ?? 0) > 0 && (
                  <div className="ml-1 rounded-full px-2 py-0.5 text-[9px] font-bold leading-none bg-violet-600 text-white min-w-[18px] text-center">
                    {suggestionsCount.data}
                  </div>
                )}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-10 gap-2 shrink-0 transition-colors ${
                      connectedIds.length < PLATFORMS.filter(p => !p.comingSoon).length
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-800'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {connectedIds.length < PLATFORMS.filter(p => !p.comingSoon).length ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                    Connections
                    <div className={`ml-1 rounded-lg px-2 py-0.5 text-[9px] font-bold leading-none border flex items-center ${
                      connectedIds.length < PLATFORMS.filter(p => !p.comingSoon).length
                        ? 'bg-amber-200/60 text-amber-800 border-amber-300'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 shadow-inner'
                    }`}>
                      {connectedIds.length}/{PLATFORMS.length}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-2 bg-white rounded-xl shadow-lg border border-zinc-200/50"
                  align="center"
                  sideOffset={8}
                >
                  <div className="mb-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100/50">
                    <h4 className="font-bold text-sm text-zinc-900 tracking-tight leading-none mb-1">Integrations</h4>
                    <p className="text-[11px] text-zinc-500 font-medium">Link platforms to enable direct posting.</p>
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto nice-scrollbar">
                    {PLATFORMS.map((p) => {
                      const isConnected = connectedIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors group border border-transparent hover:border-zinc-100"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="shrink-0 bg-white p-1 rounded-md shadow-sm border border-zinc-100">
                              {p.icon}
                            </div>
                            <div>
                              <span className="text-[13px] font-bold text-zinc-800 tracking-tight">{p.label}</span>
                              {p.sublabel && (
                                <p className="text-[10px] text-zinc-400">{p.sublabel}</p>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center">
                            {p.comingSoon ? (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-100 border border-zinc-200/50 shadow-sm">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                                  Soon
                                </span>
                              </div>
                            ) : isConnected ? (
                              <button
                                onClick={() => handleDisconnect(p.id)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200/50 shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors group/btn"
                              >
                                <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest leading-none group-hover/btn:hidden">
                                  Linked
                                </span>
                                <CheckCircle2 className="w-3 h-3 text-green-600 group-hover/btn:hidden" />
                                <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest leading-none hidden group-hover/btn:inline">
                                  Remove
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleConnect(p.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm hover:bg-zinc-800 transition-colors"
                              >
                                <Plus className="w-3 h-3 text-white" />
                                <span className="text-[9px] font-bold text-white uppercase tracking-widest leading-none">
                                  Connect
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              <AISuggestionsPanel
                clientId={client.id}
                isOpen={aiPanelOpen}
                onClose={() => setAiPanelOpen(false)}
                onPostCreated={() => {
                  // Refetch calendar data
                  setAiPanelOpen(false);
                }}
              />
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */
export default function SocialMediaSchedulerPage() {
  const { clientId: urlClientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, resetDraft } = useSocialMediaStore();
  const { currentClient, setCurrentClient: _setCurrentClient, clients: allClients, isLoading: isLoadingContext } = useClientContext();
  const { isLoading } = useAllClients();
  const isLoadingClients = isLoadingContext || isLoading;

  const isClearingClient = useRef(false);

  // Sync URL clientId with state on mount or change
  useEffect(() => {
    // If no URL client, but context has one AND we aren't actively clearing it:
    if (!urlClientId && currentClient?.id && !isClearingClient.current) {
      navigate(`/social-media/scheduler/${currentClient.id}`, { replace: true });
      return;
    }

    if (!urlClientId || allClients.length === 0) return;
    const client = allClients.find(c => String(c.id) === urlClientId);
    if (!client) return;

    // Prevent race condition where URL hasn't updated yet but we've requested to clear the client
    if (isClearingClient.current) return;

    // Reset the flag since we have a valid client
    isClearingClient.current = false;

    if (!currentClient || currentClient.id !== client.id) {
      _setCurrentClient(client as ClientWithIntegrations);
    }

    // If we have a valid client in the URL, automatically route the step
    // to the workspace calendar (or connection onboarding if they have no integrations)
    if (currentStep === 'select-client') {
      setCurrentStep('workspace');
    }
  }, [urlClientId, allClients, currentClient, currentStep, navigate, _setCurrentClient, setCurrentStep]);

  // Wrap setCurrentClient to persist lastClientId, update URL, and reset the post draft.
  // This ensures no form state bleeds across client switches.
  const setCurrentClient = useCallback((client: ClientWithIntegrations | null) => {
    if (!client) {
      isClearingClient.current = true;
    } else {
      isClearingClient.current = false;
    }

    _setCurrentClient(client);
    // Always wipe any in-progress post draft so Client B never sees Client A's data
    resetDraft();
    if (client) {
      localStorage.setItem('lastClientId', String(client.id));
      if (urlClientId !== String(client.id)) {
        navigate(`/social-media/scheduler/${client.id}`);
      }
    } else {
      localStorage.removeItem('lastClientId');
      navigate('/social-media/scheduler');
    }
  }, [_setCurrentClient, resetDraft, urlClientId, navigate]);
  const [subStep, setSubStep] = useState<'main' | 'create' | 'existing'>('main');

  const { data: liveClient } = useClient(currentClient?.id || null);
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();

  // Keep context in sync with fresh server data so child components
  // (e.g. SocialMediaPostModal) that read from useClientContext() see
  // newly-connected integrations without requiring a page refresh.
  useEffect(() => {
    if (liveClient && currentClient && liveClient.id === currentClient.id) {
      const liveIntCount = (liveClient as ClientWithIntegrations).integrations?.length ?? 0;
      const ctxIntCount = (currentClient as ClientWithIntegrations).integrations?.length ?? 0;
      if (liveIntCount !== ctxIntCount) {
        setCurrentClient(liveClient as ClientWithIntegrations);
        if (currentStep === 'connect-platforms' && liveIntCount > 0) {
          setCurrentStep('workspace');
        }
      }
    }
  }, [liveClient, currentClient, currentStep, setCurrentClient, setCurrentStep]);

  const activeClient = (liveClient || currentClient) as ClientWithIntegrations | null;

  const renderContent = () => {
    // 1. Show loading spinner if clients are loading
    if (isLoadingClients) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
          <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mb-3" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Loading workspace...</p>
        </div>
      );
    }

    // 2. If a client ID is in URL but we don't have activeClient yet, we're loading the client data
    if (urlClientId && !activeClient) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
          <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mb-3" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Loading client workspace...</p>
        </div>
      );
    }

    // 3. Select / Add Client
    if (currentStep === 'select-client' || !urlClientId) {
      if (subStep === 'create') {
        return (
          <StepCreateClient
            onBack={() => setSubStep('main')}
            onCreate={(data) => {
              createClient.mutate(data, {
                onSuccess: (newClient) => {
                  setCurrentClient(newClient as ClientWithIntegrations);
                  setSubStep('main');
                  setCurrentStep('connect-platforms');
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
              const hasIntegrations = client.integrations && client.integrations.length > 0;
              if (hasIntegrations) {
                setCurrentStep('workspace');
              } else {
                setCurrentStep('connect-platforms');
              }
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
          onSelect={(client: ClientWithIntegrations) => {
            setCurrentClient(client);
            setCurrentStep('workspace');
          }}
          onAddExisting={() => setSubStep('existing')}
          onAddNew={() => setSubStep('create')}
          onDelete={(client: ClientWithIntegrations) => {
            if (window.confirm(`Delete "${client.name}" and all their data?`)) {
              deleteClient.mutate(client.id);
            }
          }}
        />
      );
    }

    // 4. Step 2: Connect Platforms
    if (currentStep === 'connect-platforms' && activeClient) {
      return (
        <StepConnectPlatforms
          client={activeClient}
          onContinue={() => setCurrentStep('workspace')}
          onBack={() => {
            setCurrentClient(null);
            setCurrentStep('select-client');
          }}
        />
      );
    }

    // 5. Step 3: Workspace / Calendar
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

    // Safe fallback
    return (
      <StepSelectClient
        clients={allClients}
        isLoading={isLoadingClients}
        isError={false}
        onSelect={(client: ClientWithIntegrations) => {
          setCurrentClient(client);
          setCurrentStep('workspace');
        }}
        onAddExisting={() => setSubStep('existing')}
        onAddNew={() => setSubStep('create')}
        onDelete={(client: ClientWithIntegrations) => {
          if (window.confirm(`Delete "${client.name}" and all their data?`)) {
            deleteClient.mutate(client.id);
          }
        }}
      />
    );
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-white">
      <div className="w-full sm:rounded-l-2xl overflow-hidden h-full sm:my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col relative">
          <div className="flex-1 overflow-y-auto relative h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
