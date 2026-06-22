import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageSquare,
  Upload,
  Info,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Send,
  Target,
  Hash,
  Type,
  Users,
  Sparkles,
  Check,
  RefreshCcw
} from 'lucide-react';
import { SiTelegram, SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';
import { creativeApi } from '@/api/creativeApi';
import { useCreateBroadcast, useCreateBroadcastCsv, useTemplates, useIntegrations, useSyncTemplates } from '../hooks/useBroadcasts';
import { useTelegramTargets } from '@/features/blog/hooks/useBlogPosts';
import type { BroadcastChannel, BroadcastIntegration } from '../api/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { InlineTemplateCreator } from './InlineTemplateCreator';
import { InlineGatewayCreator } from './InlineGatewayCreator';
// import { WhatsAppTemplateCreator } from './WhatsAppTemplateCreator';

interface CreateBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  fixedChannel?: BroadcastChannel;
}

type WizardStep = 'channel' | 'config' | 'audience' | 'review';

export function CreateBroadcastModal({ isOpen, onClose, clientId, fixedChannel }: CreateBroadcastModalProps) {
  const [step, setStep] = useState<WizardStep>(fixedChannel ? 'config' : 'channel');
  const [channel, setChannel] = useState<BroadcastChannel>(fixedChannel || 'SMS');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [aiSubjectLoading, setAiSubjectLoading] = useState(false);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [integrationId, setIntegrationId] = useState<number | null>(null);
  const [recipientMode, setRecipientMode] = useState<'manual' | 'csv'>('manual');
  const [manualRecipients, setManualRecipients] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [columnName, setColumnName] = useState('');
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showProviderManager, setShowProviderManager] = useState(false);

  const { data: templates } = useTemplates();
  const { data: integrations } = useIntegrations(clientId);
  const { data: telegramTargets = [] } = useTelegramTargets(clientId);
  const createManual = useCreateBroadcast();
  const createCsv = useCreateBroadcastCsv();
  const syncTemplates = useSyncTemplates();

  const isSms = channel === 'SMS';
  const isEmail = channel === 'EMAIL';
  const isTelegram = channel === 'TELEGRAM';
  const isWhatsapp = channel === 'WHATSAPP';

  const filteredTemplates = templates?.filter(t => t.channel === channel && t.status === 'APPROVED') || [];
  const filteredIntegrations = (integrations as BroadcastIntegration[])?.filter(i => i.type === channel) || [];
  const selectedTemplate = templates?.find(t => t.id === templateId);

  const templateParams = isWhatsapp && selectedTemplate 
    ? Array.from(selectedTemplate.content.matchAll(/\{\{(\d+)\}\}/g)).map(m => m[1]) 
    : [];
  const uniqueParams = Array.from(new Set(templateParams)).sort((a, b) => Number(a) - Number(b));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?\d{10,15}$/.test(phone);
  const validateTelegramTarget = (s: string) => /^@[A-Za-z0-9_]{4,}$/.test(s) || /^-?\d{5,}$/.test(s);

  const resetForm = useCallback(() => {
    setChannel(fixedChannel || 'SMS');
    setName('');
    setSubject('');
    setTemplateId(null);
    setIntegrationId(null);
    setManualRecipients('');
    setCsvFile(null);
    setColumnName('');
    setVariableMapping({});
    setMessage('');
    setError(null);
    setStep(fixedChannel ? 'config' : 'channel');
    setShowTemplateManager(false);
    setShowProviderManager(false);
  }, [fixedChannel]);

  useEffect(() => {
    if (!isOpen) {
      setStep(fixedChannel ? 'config' : 'channel');
      resetForm();
    }
  }, [isOpen, fixedChannel, resetForm]);

  useEffect(() => {
    setIntegrationId(null);
    setTemplateId(null);
    setError(null);
    setShowTemplateManager(false);
    setShowProviderManager(false);
  }, [channel]);

  const handleNext = () => {
    setError(null);
    if (step === 'channel') {
      setStep('config');
    } else if (step === 'config') {
      if (!name.trim()) { setError('Campaign name is required'); return; }
      if (isEmail && !subject.trim()) { setError('Subject is required'); return; }
      if (!isTelegram && !templateId) { setError('Message template is required'); return; }
      if (isTelegram && !integrationId) { setError('Telegram bot is required'); return; }
      if (isTelegram && !message.trim()) { setError('Message content is required'); return; }
      setStep('audience');
    } else if (step === 'audience') {
      if (recipientMode === 'manual') {
        const recipients = manualRecipients.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean);
        if (recipients.length === 0) { setError('Please enter at least one recipient'); return; }
        if (isWhatsapp && uniqueParams.length > 0) { setError('WhatsApp templates with variables require a CSV upload to map the parameters.'); return; }
      } else {
        if (!csvFile) { setError('Please upload a CSV file'); return; }
      }
      setStep('review');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (recipientMode === 'manual') {
      let recipients = manualRecipients
        .split(/[\n,;]+/)
        .map(r => r.trim().replace(/\s/g, ''))
        .filter(Boolean);

      recipients = Array.from(new Set(recipients));
      if (isEmail) recipients = recipients.map(r => r.toLowerCase());

      const invalidRecipients = recipients.filter(r =>
        isSms ? !validatePhone(r) :
        isEmail ? !validateEmail(r) :
        !validateTelegramTarget(r)
      );

      if (invalidRecipients.length > 0) {
        setError(`Invalid ${isSms ? 'phone numbers' : isEmail ? 'emails' : 'Telegram targets'}: ${invalidRecipients.slice(0, 1).join(', ')}`);
        setStep('audience');
        return;
      }

      try {
        await createManual.mutateAsync({
          name: name.trim(),
          channel,
          integrationId: integrationId || undefined,
          clientId,
          ...(isTelegram
            ? { message: message.trim() }
            : { templateId: templateId!, ...(isEmail ? { subject: subject.trim() } : {}) }),
          recipients,
        });
        onClose();
        resetForm();
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to create broadcast');
      }
    } else {
      try {
        await createCsv.mutateAsync({
          file: csvFile!,
          name: name.trim(),
          channel,
          templateId: templateId!,
          integrationId: integrationId || undefined,
          columnName: columnName.trim(),
          variableMapping,
          subject: isEmail ? subject.trim() : undefined,
          clientId,
        });
        onClose();
        resetForm();
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to create CSV broadcast');
      }
    }
  };



  const isLoading = createManual.isPending || createCsv.isPending;

  const steps: { id: WizardStep; label: string }[] = fixedChannel
    ? [
        { id: 'config', label: 'Configuration' },
        { id: 'audience', label: 'Audience' },
        { id: 'review', label: 'Review' },
      ]
    : [
        { id: 'channel', label: 'Channel' },
        { id: 'config', label: 'Configuration' },
        { id: 'audience', label: 'Audience' },
        { id: 'review', label: 'Review' },
      ];
  const currentStepIndex = steps.findIndex(s => s.id === step);

  const getChannelIcon = () => {
    if (channel === 'WHATSAPP') return <SiWhatsapp className="w-5 h-5 text-green-500" />;
    if (channel === 'TELEGRAM') return <SiTelegram className="w-5 h-5 text-sky-500" />;
    if (channel === 'EMAIL') return <Mail className="w-5 h-5 text-blue-500" />;
    return <MessageSquare className="w-5 h-5 text-orange-500" />;
  };

  const getChannelName = () => {
    if (channel === 'WHATSAPP') return 'WhatsApp';
    if (channel === 'TELEGRAM') return 'Telegram';
    if (channel === 'EMAIL') return 'Email';
    return 'SMS';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-white rounded-2xl border border-zinc-200/60 flex flex-col h-[700px] shadow-xl shadow-zinc-900/5">
        <DialogTitle className="sr-only">Create Broadcast Campaign</DialogTitle>
        <DialogDescription className="sr-only">Create a new broadcast campaign</DialogDescription>
        
        {/* Header & Stepper */}
        <div className="px-8 pt-8 pb-6 bg-zinc-50/50 border-b border-zinc-100 flex flex-col gap-8 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 rounded-2xl flex items-center justify-center transform -rotate-3 transition-transform duration-500 hover:rotate-0">
                {step !== 'channel' ? getChannelIcon() : <Sparkles className="w-6 h-6 text-zinc-800" />}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight leading-none">
                  {step !== 'channel' ? `New ${getChannelName()} Campaign` : 'Create Broadcast'}
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-1.5">
                  Launch a new campaign to reach your audience.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between relative px-2 z-10 mt-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-100 rounded-full overflow-hidden -z-10">
              <div 
                className="h-full bg-zinc-900 transition-all duration-700 ease-out" 
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} 
              />
            </div>
            {steps.map((s, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={s.id} className="flex flex-col items-center gap-3 relative">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                    isPast ? "bg-zinc-900 text-white" 
                           : isCurrent ? "bg-white text-zinc-900 ring-2 ring-zinc-900 shadow-sm" 
                                       : "bg-white border border-zinc-200 text-zinc-400"
                  )}>
                    {isPast ? <Check className="w-4 h-4" /> : (idx + 1)}
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase font-semibold absolute -bottom-5 whitespace-nowrap transition-colors",
                    isCurrent ? "text-zinc-900 tracking-wider" : isPast ? "text-zinc-500 tracking-wide" : "text-zinc-400 tracking-wide"
                  )}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar bg-white relative">
          
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-red-600">{error}</p>
            </div>
          )}

          {showTemplateManager ? (
            <InlineTemplateCreator 
              channel={channel} 
              clientId={clientId} 
              onCancel={() => setShowTemplateManager(false)}
              onSuccess={() => setShowTemplateManager(false)}
            />
          ) : showProviderManager ? (
            <InlineGatewayCreator 
              channel={channel} 
              clientId={clientId} 
              onCancel={() => setShowProviderManager(false)}
              onSuccess={() => setShowProviderManager(false)}
            />
          ) : (
            <>
          {/* STEP 1: CHANNEL */}
          {step === 'channel' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'SMS', label: 'SMS Campaign', icon: MessageSquare, desc: 'Short, urgent text updates' },
                  { id: 'EMAIL', label: 'Email Campaign', icon: Mail, desc: 'Rich newsletters & updates' },
                  { id: 'TELEGRAM', label: 'Telegram Hub', icon: SiTelegram, desc: 'Direct channel broadcasts' },
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: SiWhatsapp, desc: 'Official Business API' }
                ].map((item) => {
                  const isActive = channel === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setChannel(item.id as BroadcastChannel)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border text-left",
                        isActive 
                          ? "border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900" 
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 group-hover:text-zinc-900"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-semibold tracking-tight",
                          isActive ? "text-zinc-900" : "text-zinc-700"
                        )}>{item.label}</p>
                        <p className={cn("text-xs", isActive ? "text-zinc-600" : "text-zinc-500")}>
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURATION */}
          {step === 'config' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 px-1">Campaign Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <Input 
                      placeholder="e.g. Summer Promo 2024"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 pl-9 rounded-lg border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium transition-all shadow-sm"
                    />
                  </div>
                </div>

                {isEmail && (
                  <div className="space-y-2 animate-in fade-in duration-500">
                    <label className="text-xs font-semibold text-zinc-600 px-1">Email Subject <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                      <Input 
                        placeholder="Enter subject line..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-10 pl-9 pr-10 rounded-lg border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium transition-all shadow-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const topic = subject.trim() || name.trim();
                          if (!topic) { toast.error('Enter a subject or broadcast name first'); return; }
                          setAiSubjectLoading(true);
                          creativeApi.generateCaptions({ clientId: clientId || 0, platform: 'linkedin', goal: 'engagement', topic: `Write a catchy email subject line about: ${topic}`, count: 1 })
                            .then((res) => { const t = res.data.data.captions[0]?.text; if (t) { setSubject(t.replace(/^["']|["']$/g, '').slice(0, 200)); toast.success('Subject generated!'); } })
                            .catch(() => toast.error('Failed')).finally(() => setAiSubjectLoading(false));
                        }}
                        title={subject ? "Rewrite subject with AI" : "Generate subject with AI"}
                        disabled={aiSubjectLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                      >
                        {aiSubjectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 px-1">Gateway Provider</label>
                  <Select value={integrationId?.toString()} onValueChange={v => {
                    if (v === "new") setShowProviderManager(true);
                    else setIntegrationId(Number(v));
                  }}>
                    <SelectTrigger className="h-10 rounded-lg border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium px-3 shadow-sm">
                      <SelectValue placeholder={
                        isTelegram ? "Choose Bot..." : "System Default (Auto-select)"
                      } />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-zinc-200 shadow-lg p-1">
                      {!isTelegram && (
                        <SelectItem value="0" className="text-sm py-2 px-3 rounded-md text-zinc-900 focus:bg-zinc-100 cursor-pointer">
                          System Default (Platform Account)
                        </SelectItem>
                      )}
                      {(isTelegram ? (telegramTargets as any[]) : filteredIntegrations).map((item: any) => (
                        <SelectItem 
                          key={item.id} 
                          value={item.id.toString()} 
                          className="text-sm py-2 px-3 rounded-md focus:bg-zinc-100 cursor-pointer"
                        >
                          {`${item.name} ${'provider' in item ? `(${item.provider})` : ''}`}
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="text-sm py-2 px-3 rounded-md text-blue-600 focus:bg-blue-50 focus:text-blue-700 cursor-pointer font-semibold border-t border-zinc-100 mt-1">
                        + Connect New Gateway
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isTelegram && telegramTargets.length === 0 && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1.5">
                      <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> No bots connected.
                      </p>
                      <p className="text-[11px] text-amber-700/80 font-medium">Please connect a Telegram Bot in the Gateways tab first.</p>
                      <Button 
                        onClick={() => setShowProviderManager(true)}
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-md h-8 text-[11px] font-semibold self-start mt-1"
                      >
                        Connect Bot Now
                      </Button>
                    </div>
                  )}
                  {isWhatsapp && filteredIntegrations.length === 0 && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1.5">
                      <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> WhatsApp is not connected
                      </p>
                      <p className="text-[11px] text-amber-700/80 font-medium">Please connect WhatsApp Business in the Gateways tab first.</p>
                      <Button 
                        onClick={() => setShowProviderManager(true)}
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-md h-8 text-[11px] font-semibold self-start mt-1"
                      >
                        Connect Gateway Now
                      </Button>
                    </div>
                  )}
                </div>

                {!isTelegram && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600 px-1">Message Template <span className="text-red-500">*</span></label>
                    <Select value={templateId?.toString()} onValueChange={v => {
                      if (v === "new") setShowTemplateManager(true);
                      else setTemplateId(Number(v));
                    }}>
                      <SelectTrigger className="h-10 rounded-lg border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium px-3 shadow-sm">
                        <SelectValue placeholder="Choose Template..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-zinc-200 shadow-lg p-1">
                        {filteredTemplates.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()} className="text-sm py-2 px-3 rounded-md focus:bg-zinc-100 cursor-pointer">
                            {t.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new" className="text-sm py-2 px-3 rounded-md text-blue-600 focus:bg-blue-50 focus:text-blue-700 cursor-pointer font-semibold border-t border-zinc-100 mt-1">
                          + Create New Template
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {filteredTemplates.length === 0 && (
                      <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1.5">
                        <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> No approved templates found.
                        </p>
                        {isWhatsapp ? (
                          <div className="flex flex-col gap-1.5 mt-1">
                            <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed">WhatsApp templates must be approved by Meta before use. You can sync existing ones from Meta Business Manager, or create a new template directly.</p>
                            <div className="flex gap-2 flex-wrap">
                              <Button 
                                onClick={() => syncTemplates.mutate(clientId)}
                                disabled={syncTemplates.isPending}
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-white rounded-md h-8 text-[11px] font-semibold self-start mt-1"
                              >
                                <RefreshCcw className={cn("w-3 h-3 mr-1.5", syncTemplates.isPending && "animate-spin")} />
                                Sync from Meta
                              </Button>
                              <Button
                                onClick={() => setShowTemplateManager(true)}
                                size="sm"
                                variant="outline"
                                className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-md h-8 text-[11px] font-semibold self-start mt-1"
                              >
                                + Create New Template
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-[11px] text-amber-700/80 font-medium">Please create and approve a template in the Templates tab first.</p>
                            <Button 
                              onClick={() => setShowTemplateManager(true)}
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white rounded-md h-8 text-[11px] font-semibold self-start mt-1"
                            >
                              Create Template Now
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isTelegram && (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-zinc-600">Message Content <span className="text-red-500">*</span></label>
                    <span className={cn("text-xs font-medium", message.length > 4000 ? "text-red-500" : "text-zinc-400")}>
                      {message.length} / 4096
                    </span>
                  </div>
                  <div className="relative group">
                    <Textarea 
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Type your Telegram message. Supports *bold*, _italic_, and emojis..."
                      className="min-h-[120px] p-3 pr-10 rounded-lg border-zinc-200 bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium resize-none transition-all shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const topic = message.trim() || name.trim();
                        if (!topic) { toast.error('Enter a message or campaign name first'); return; }
                        creativeApi.generateCaptions({ clientId: clientId || 0, platform: 'linkedin', goal: 'engagement', topic: `Write an engaging Telegram broadcast message about: ${topic}. Use emojis and bold formatting.`, count: 1 })
                          .then((res) => { const t = res.data.data.captions[0]?.text; if (t) { setMessage(t); toast.success('Message generated!'); } })
                          .catch(() => toast.error('Failed'));
                      }}
                      title={message ? "Rewrite with AI" : "Generate with AI"}
                      className="absolute right-2 top-3 p-1.5 text-zinc-400 hover:text-sky-500 hover:bg-sky-50 rounded-md transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <Info className="w-3 h-3 text-sky-500" />
                    <span className="text-[10px] text-zinc-500 font-medium">Telegram allows rich formatting. Use *text* for bold and _text_ for italics.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: AUDIENCE */}
          {step === 'audience' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-center p-1 bg-zinc-100/80 rounded-lg max-w-[280px] mx-auto shadow-sm">
                <button
                  onClick={() => setRecipientMode('manual')}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium transition-all",
                    recipientMode === 'manual' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900'
                  )}
                >
                  Manual List
                </button>
                {!isTelegram && (
                  <button
                    onClick={() => setRecipientMode('csv')}
                    className={cn(
                      "flex-1 py-1.5 rounded-md text-xs font-medium transition-all",
                      recipientMode === 'csv' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900'
                    )}
                  >
                    CSV Upload
                  </button>
                )}
              </div>

              <div className="max-w-2xl mx-auto mt-6">
                {(isSms || isWhatsapp) && (
                  <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      {isWhatsapp ? "WhatsApp numbers" : "SMS numbers"} should include their country code prefix (e.g., 91 for India). International numbers should use their respective country codes.
                    </p>
                  </div>
                )}
                {recipientMode === 'manual' ? (
                  <div className="space-y-3">
                     <div className="relative group">
                        <Target className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                        <Textarea 
                          value={manualRecipients}
                          onChange={e => setManualRecipients(e.target.value)}
                          placeholder={isSms ? "+1 234 567 890\n+44 7700 900077..." : isEmail ? "user@example.com\nhello@world.com..." : "@my_channel\n-100123456789..."}
                          className="min-h-[200px] pl-9 pr-4 py-3 rounded-xl border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm transition-all resize-none shadow-sm"
                        />
                     </div>
                     <div className="flex items-center justify-between px-1">
                       <p className="text-xs text-zinc-500">Separate by commas or new lines</p>
                       {manualRecipients.trim() && (
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 animate-in fade-in zoom-in">
                           <Users className="w-3.5 h-3.5" />
                           <span className="text-xs font-semibold">
                             {manualRecipients.split(/[\n,;]+/).filter(Boolean).length} Recipients
                           </span>
                         </div>
                       )}
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className={cn(
                         "h-[160px] border border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                         csvFile ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 bg-white hover:border-zinc-900 hover:bg-zinc-50"
                       )}
                     >
                        <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                        {csvFile ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center animate-in zoom-in">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-zinc-900">{csvFile.name}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Ready to upload</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-500 flex items-center justify-center group-hover:bg-zinc-200 transition-all">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-sm font-semibold text-zinc-900">Upload CSV File</h3>
                              <p className="text-xs text-zinc-500 mt-0.5">Click to browse or drag and drop</p>
                            </div>
                          </>
                        )}
                     </div>
                     <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-600 px-1">Target Column (Optional)</label>
                          <Input 
                            placeholder="e.g. Email, Phone"
                            value={columnName}
                            onChange={e => setColumnName(e.target.value)}
                            className="h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white text-sm px-3 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-600 px-1 opacity-0">Action</label>
                          <a 
                            href={isEmail ? "/example_email.csv" : "/example_sms.csv"} 
                            download 
                            className="h-10 px-4 bg-zinc-100 text-zinc-700 rounded-lg flex items-center gap-2 hover:bg-zinc-200 transition-all text-xs font-medium"
                          >
                             <Upload className="w-4 h-4" />
                             Get Template
                          </a>
                        </div>
                     </div>
                     {isWhatsapp && uniqueParams.length > 0 && (
                        <div className="mt-4 space-y-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-sm">
                          <h4 className="text-xs font-semibold text-zinc-600 px-1">Template Parameters Mapping</h4>
                          {uniqueParams.map(param => (
                            <div key={param} className="flex items-center gap-3">
                              <span className="text-xs font-mono w-16 text-zinc-500">{`{{${param}}}`}</span>
                              <Input 
                                placeholder="CSV Column name (e.g. FirstName)"
                                value={variableMapping[param] || ''}
                                onChange={e => setVariableMapping({...variableMapping, [param]: e.target.value})}
                                className="h-9 rounded-lg border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* STEP 4: REVIEW */}
        {step === 'review' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Summary Card */}
              <div className="p-6 bg-zinc-900 rounded-2xl text-white shadow-xl shadow-zinc-900/10 flex flex-col justify-between h-full relative overflow-hidden border border-zinc-800">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <Send className="w-24 h-24" />
                </div>
                <div className="space-y-5 relative z-10">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Campaign Summary
                  </h4>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Name</p>
                    <p className="text-xl font-bold mt-1 tracking-tight text-white">{name}</p>
                  </div>

                  {isEmail && (
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Subject</p>
                      <p className="text-sm font-medium mt-1 truncate text-zinc-200">{subject}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Channel</p>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-1.5 text-zinc-100">
                        {isSms ? <MessageSquare className="w-4 h-4" /> : isEmail ? <Mail className="w-4 h-4" /> : isWhatsapp ? <SiWhatsapp className="w-4 h-4" /> : <SiTelegram className="w-4 h-4" />}
                        {channel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Gateway</p>
                      <p className="text-sm font-semibold mt-1 text-zinc-100">{integrationId ? 'Custom' : 'Platform Default'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Total Audience</span>
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {recipientMode === 'csv' ? (csvFile ? csvFile.name : '0') : manualRecipients.split(/[\n,;]+/).filter(Boolean).length}
                  </span>
                </div>
              </div>

              {/* Message Preview */}
              <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-zinc-400" />
                  <h4 className="text-xs font-semibold text-zinc-600">Message Preview</h4>
                </div>
                <div className="flex-1 bg-zinc-50/80 rounded-xl p-5 border border-zinc-100 overflow-y-auto max-h-[280px] custom-scrollbar">
                  {isTelegram ? (
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{message}</p>
                  ) : (
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{selectedTemplate?.content || 'No template selected.'}</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
            </>
          )}
        </div>

      {/* Footer Actions */}
      {(!showTemplateManager && !showProviderManager) && (
      <div className="px-8 py-4 bg-white border-t border-zinc-100 flex items-center justify-between gap-4 z-20">
        <Button 
          variant="ghost" 
          onClick={() => {
            if (step === 'channel') onClose();
            else if (step === 'config') {
              if (fixedChannel) {
                onClose();
              } else {
                setStep('channel');
              }
            }
            else if (step === 'audience') setStep('config');
            else if (step === 'review') setStep('audience');
          }}
          disabled={isLoading}
          className="h-10 px-6 rounded-lg font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm"
        >
          {step === 'channel' ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-1.5" /> Back</>}
        </Button>
        
        {step !== 'review' ? (
          <Button 
            onClick={handleNext}
            className="h-10 px-8 rounded-lg font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-sm flex items-center gap-2"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="h-10 px-8 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <span>Ship Campaign</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}
      </div>
      )}
      </DialogContent>
    </Dialog>
  );
}
