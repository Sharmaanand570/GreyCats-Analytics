import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent
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
  Check
} from 'lucide-react';
import { SiTelegram } from 'react-icons/si';
import { toast } from 'sonner';
import { creativeApi } from '@/api/creativeApi';
import { useCreateBroadcast, useCreateBroadcastCsv, useTemplates, useIntegrations } from '../hooks/useBroadcasts';
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

interface CreateBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
}

type WizardStep = 'channel' | 'config' | 'audience' | 'review';

export function CreateBroadcastModal({ isOpen, onClose, clientId }: CreateBroadcastModalProps) {
  const [step, setStep] = useState<WizardStep>('channel');
  const [channel, setChannel] = useState<BroadcastChannel>('SMS');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [aiSubjectLoading, setAiSubjectLoading] = useState(false);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [integrationId, setIntegrationId] = useState<number | null>(null);
  const [recipientMode, setRecipientMode] = useState<'manual' | 'csv'>('manual');
  const [manualRecipients, setManualRecipients] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [columnName, setColumnName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: templates } = useTemplates();
  const { data: integrations } = useIntegrations(clientId);
  const { data: telegramTargets = [] } = useTelegramTargets(clientId);
  const createManual = useCreateBroadcast();
  const createCsv = useCreateBroadcastCsv();

  const isSms = channel === 'SMS';
  const isEmail = channel === 'EMAIL';
  const isTelegram = channel === 'TELEGRAM';

  const filteredTemplates = templates?.filter(t => t.channel === channel && t.status === 'APPROVED') || [];
  const filteredIntegrations = (integrations as BroadcastIntegration[])?.filter(i => i.type === channel) || [];
  const selectedTemplate = templates?.find(t => t.id === templateId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?\d{10,15}$/.test(phone);
  const validateTelegramTarget = (s: string) => /^@[A-Za-z0-9_]{4,}$/.test(s) || /^-?\d{5,}$/.test(s);

  useEffect(() => {
    if (!isOpen) {
      setStep('channel');
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    setIntegrationId(null);
    setTemplateId(null);
    setError(null);
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

  const resetForm = () => {
    setChannel('SMS');
    setName('');
    setSubject('');
    setTemplateId(null);
    setIntegrationId(null);
    setManualRecipients('');
    setCsvFile(null);
    setColumnName('');
    setMessage('');
    setError(null);
    setStep('channel');
  };

  const isLoading = createManual.isPending || createCsv.isPending;

  const steps: { id: WizardStep; label: string }[] = [
    { id: 'channel', label: 'Channel' },
    { id: 'config', label: 'Configuration' },
    { id: 'audience', label: 'Audience' },
    { id: 'review', label: 'Review' },
  ];
  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-white rounded-[32px] border border-zinc-200/60 flex flex-col h-[750px] shadow-2xl shadow-zinc-900/10">
        
        {/* Header & Stepper */}
        <div className="px-10 pt-10 pb-8 bg-gradient-to-b from-zinc-50/50 to-white border-b border-zinc-100 flex flex-col gap-10 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-zinc-200/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-zinc-100/50 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-none">
                Create Campaign
              </h2>
              <p className="text-sm font-medium text-zinc-500 mt-2">
                Launch a new broadcast to reach your audience.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-lg shadow-zinc-500/20">
              <Sparkles className="w-6 h-6 text-white" />
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
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                    isPast ? "bg-zinc-900 text-white shadow-md shadow-zinc-500/20" 
                           : isCurrent ? "bg-white text-zinc-900 border-2 border-zinc-900 shadow-lg shadow-zinc-500/20 scale-110" 
                                       : "bg-white border-2 border-zinc-200 text-zinc-400"
                  )}>
                    {isPast ? <Check className="w-5 h-5" /> : (idx + 1)}
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-extrabold absolute -bottom-6 whitespace-nowrap transition-colors",
                    isCurrent ? "text-zinc-900" : isPast ? "text-zinc-700" : "text-zinc-400"
                  )}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pt-10 pb-6 custom-scrollbar bg-[#fafafa]/50 relative">
          
          {error && (
            <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 rounded-2xl border border-red-100/50 shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* STEP 1: CHANNEL */}
          {step === 'channel' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'SMS', label: 'SMS Campaign', icon: MessageSquare, desc: 'Short, urgent text updates' },
                  { id: 'EMAIL', label: 'Email Campaign', icon: Mail, desc: 'Rich newsletters & updates' },
                  { id: 'TELEGRAM', label: 'Telegram Hub', icon: SiTelegram, desc: 'Direct channel broadcasts' }
                ].map((item) => {
                  const isActive = channel === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setChannel(item.id as BroadcastChannel)}
                      className={cn(
                        "flex flex-col items-center justify-center p-8 rounded-[28px] transition-all duration-300 border-[1.5px] group text-center relative overflow-hidden",
                        isActive 
                          ? "border-zinc-900 bg-zinc-50 shadow-xl shadow-zinc-200/50 scale-[1.02]" 
                          : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50/50 hover:shadow-lg hover:shadow-zinc-200/20"
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 mb-5 shadow-sm relative z-10",
                        isActive ? "bg-zinc-900 text-white shadow-zinc-500/30" : "bg-zinc-50 border border-zinc-100 text-zinc-400 group-hover:text-zinc-900 group-hover:bg-white"
                      )}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <p className={cn(
                        "text-lg font-extrabold tracking-tight mb-2 relative z-10",
                        isActive ? "text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900"
                      )}>{item.label}</p>
                      <p className={cn("text-xs font-medium leading-relaxed relative z-10", isActive ? "text-zinc-600" : "text-zinc-500")}>
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURATION */}
          {step === 'config' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Campaign Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                    <Input 
                      placeholder="e.g. Summer Promo 2024"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 pl-12 rounded-2xl border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-base font-bold transition-all shadow-sm"
                    />
                  </div>
                </div>

                {isEmail && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email Subject <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                      <Input 
                        placeholder="Enter subject line..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-14 pl-12 pr-14 rounded-2xl border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-base font-bold transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        title={subject ? "Rewrite subject with AI" : "Generate subject with AI"}
                        disabled={aiSubjectLoading}
                        onClick={() => {
                          const topic = subject.trim() || name.trim();
                          if (!topic) { toast.error('Enter a subject or broadcast name first'); return; }
                          setAiSubjectLoading(true);
                          creativeApi.generateCaptions({ clientId: 0, platform: 'linkedin', goal: 'engagement', topic: `Write a catchy email subject line about: ${topic}`, count: 1 })
                            .then((res) => { const t = res.data.data.captions[0]?.text; if (t) { setSubject(t.replace(/^["']|["']$/g, '').slice(0, 200)); toast.success('Subject generated!'); } })
                            .catch(() => toast.error('Failed')).finally(() => setAiSubjectLoading(false));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-600 transition-all shadow-sm"
                      >
                        {aiSubjectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Gateway Provider</label>
                  <Select value={integrationId?.toString()} onValueChange={v => setIntegrationId(Number(v))}>
                    <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-bold px-5 shadow-sm">
                      <SelectValue placeholder={
                        isTelegram ? "Choose Bot..." : "System Default (Auto-select)"
                      } />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-200 shadow-xl p-1">
                      {!isTelegram && (
                        <SelectItem value="0" className="font-bold py-3 px-4 rounded-xl text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer">
                          System Default (Platform Account)
                        </SelectItem>
                      )}
                      {(isTelegram ? (telegramTargets as any[]) : filteredIntegrations).map((item: any) => (
                        <SelectItem key={item.id} value={item.id.toString()} className="font-bold py-3 px-4 rounded-xl focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer">
                          {item.name} {('provider' in item) && <span className="text-zinc-400 font-medium">({item.provider})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isTelegram && telegramTargets.length === 0 && (
                    <p className="text-xs text-amber-600 font-bold px-1 flex items-center gap-1.5 mt-2">
                      <AlertCircle className="w-3.5 h-3.5" /> No bots connected.
                    </p>
                  )}
                </div>

                {!isTelegram && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Message Template <span className="text-red-500">*</span></label>
                    <Select value={templateId?.toString()} onValueChange={v => setTemplateId(Number(v))}>
                      <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-bold px-5 shadow-sm">
                        <SelectValue placeholder="Choose Template..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-zinc-200 shadow-xl p-1">
                        {filteredTemplates.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()} className="font-bold py-3 px-4 rounded-xl focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filteredTemplates.length === 0 && (
                      <p className="text-xs text-amber-600 font-bold px-1 flex items-center gap-1.5 mt-2">
                        <AlertCircle className="w-3.5 h-3.5" /> No templates found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {isTelegram && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Message Content <span className="text-red-500">*</span></label>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", message.length > 4000 ? "text-red-500" : "text-zinc-400")}>
                      {message.length} / 4096
                    </span>
                  </div>
                  <Textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your Telegram message..."
                    className="min-h-[160px] p-5 rounded-3xl border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-base font-medium resize-none transition-all shadow-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: AUDIENCE */}
          {step === 'audience' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-center p-1.5 bg-zinc-100 rounded-[20px] max-w-sm mx-auto shadow-inner">
                <button
                  onClick={() => setRecipientMode('manual')}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all",
                    recipientMode === 'manual' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                  )}
                >
                  Manual List
                </button>
                {!isTelegram && (
                  <button
                    onClick={() => setRecipientMode('csv')}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all",
                      recipientMode === 'csv' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                    )}
                  >
                    CSV Upload
                  </button>
                )}
              </div>

              <div className="max-w-2xl mx-auto mt-8">
                {recipientMode === 'manual' ? (
                  <div className="space-y-4">
                     <div className="relative group">
                        <Target className="absolute left-6 top-6 w-5 h-5 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                        <Textarea 
                          value={manualRecipients}
                          onChange={e => setManualRecipients(e.target.value)}
                          placeholder={isSms ? "+1 234 567 890\n+44 7700 900077..." : isEmail ? "user@example.com\nhello@world.com..." : "@my_channel\n-100123456789..."}
                          className="min-h-[250px] pl-16 pr-6 py-6 rounded-[32px] border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-base font-medium transition-all resize-none shadow-sm leading-relaxed"
                        />
                     </div>
                     <div className="flex items-center justify-between px-4">
                       <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Separate by commas or lines</p>
                       {manualRecipients.trim() && (
                         <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full shadow-md shadow-zinc-500/20 animate-in fade-in zoom-in">
                           <Users className="w-3.5 h-3.5" />
                           <span className="text-[11px] font-bold uppercase tracking-widest">
                             {manualRecipients.split(/[\n,;]+/).filter(Boolean).length} Recipients
                           </span>
                         </div>
                       )}
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className={cn(
                         "h-[240px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                         csvFile ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 bg-white hover:border-zinc-900 hover:bg-zinc-50"
                       )}
                     >
                        <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                        {csvFile ? (
                          <>
                            <div className="w-16 h-16 rounded-full bg-zinc-900 shadow-lg shadow-zinc-500/20 flex items-center justify-center animate-in zoom-in">
                              <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-extrabold text-zinc-900">{csvFile.name}</p>
                              <p className="text-sm font-medium text-zinc-500 mt-1">Ready to upload</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-zinc-200 group-hover:text-zinc-900 transition-all shadow-inner">
                              <Upload className="w-7 h-7" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-xl font-extrabold text-zinc-900">Upload CSV File</h3>
                              <p className="text-sm font-medium text-zinc-500 mt-1">Click to browse or drag and drop</p>
                            </div>
                          </>
                        )}
                     </div>
                     <div className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-[24px] border border-zinc-200 shadow-sm">
                        <div className="flex-1 space-y-2">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Target Column (Optional)</label>
                          <Input 
                            placeholder="e.g. Email, Phone"
                            value={columnName}
                            onChange={e => setColumnName(e.target.value)}
                            className="h-12 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-sm font-bold px-4 focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1 opacity-0">Action</label>
                          <a 
                            href={isEmail ? "/example_email.csv" : "/example_sms.csv"} 
                            download 
                            className="h-12 px-6 bg-zinc-100 text-zinc-600 rounded-xl flex items-center gap-2 hover:bg-zinc-900 hover:text-white transition-all font-bold text-xs"
                          >
                             <Upload className="w-4 h-4" />
                             Get Template
                          </a>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 'review' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Summary Card */}
                <div className="p-8 bg-zinc-900 rounded-[32px] text-white shadow-xl shadow-zinc-900/20 flex flex-col justify-between h-full relative overflow-hidden border border-zinc-800">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Send className="w-32 h-32" />
                  </div>
                  <div className="space-y-6 relative z-10">
                    <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> Campaign Summary
                    </h4>
                    
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</p>
                      <p className="text-2xl font-extrabold mt-1 tracking-tight text-white">{name}</p>
                    </div>

                    {isEmail && (
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Subject</p>
                        <p className="text-lg font-medium mt-1 truncate text-zinc-200">{subject}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 pt-5 border-t border-zinc-800">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Channel</p>
                        <p className="text-sm font-bold mt-1 flex items-center gap-1.5 text-zinc-100">
                          {isSms ? <MessageSquare className="w-4 h-4" /> : isEmail ? <Mail className="w-4 h-4" /> : <SiTelegram className="w-4 h-4" />}
                          {channel}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gateway</p>
                        <p className="text-sm font-bold mt-1 text-zinc-100">{integrationId ? 'Custom' : 'Platform Default'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Audience</span>
                    <span className="text-3xl font-black text-white">
                      {recipientMode === 'csv' ? (csvFile ? csvFile.name : '0') : manualRecipients.split(/[\n,;]+/).filter(Boolean).length}
                    </span>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="p-8 bg-white border border-zinc-200 rounded-[32px] flex flex-col shadow-lg shadow-zinc-200/40 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-6">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Message Preview</h4>
                  </div>
                  <div className="flex-1 bg-zinc-50/80 rounded-2xl p-6 border border-zinc-100 overflow-y-auto max-h-[280px] custom-scrollbar shadow-inner relative">
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

        </div>

        {/* Footer Actions */}
        <div className="px-10 py-6 bg-white border-t border-zinc-100 flex items-center justify-between gap-4 z-20">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (step === 'channel') onClose();
              else if (step === 'config') setStep('channel');
              else if (step === 'audience') setStep('config');
              else if (step === 'review') setStep('audience');
            }}
            disabled={isLoading}
            className="h-12 px-8 rounded-xl font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-sm"
          >
            {step === 'channel' ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>}
          </Button>
          
          {step !== 'review' ? (
            <Button 
              onClick={handleNext}
              className="h-12 px-10 rounded-xl font-bold text-sm bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-lg shadow-zinc-500/20 flex items-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-12 px-12 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-xl shadow-zinc-900/20 flex items-center gap-3 active:scale-[0.98] bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Ship Campaign</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
