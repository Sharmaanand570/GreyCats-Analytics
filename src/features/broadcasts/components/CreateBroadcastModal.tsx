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
  Send,
  Target,
  Hash,
  Type,
  Users,
  Zap
} from 'lucide-react';
import { SiTelegram } from 'react-icons/si';
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

export function CreateBroadcastModal({ isOpen, onClose, clientId }: CreateBroadcastModalProps) {
  const [channel, setChannel] = useState<BroadcastChannel>('SMS');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
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
    setIntegrationId(null);
    setTemplateId(null);
    setError(null);
  }, [channel]);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) { setError('Campaign name is required'); return; }
    if (isTelegram) {
      if (!integrationId) { setError('Please select a Telegram bot'); return; }
      if (!message.trim()) { setError('Message content is required'); return; }
    } else {
      if (!templateId) { setError('Please select a message template'); return; }
      if (isEmail && !subject.trim()) { setError('Subject is required'); return; }
    }

    // Integration is now optional due to backend System Default / Fallback mechanism
    if (isTelegram && !integrationId) {
      setError('Please select a Telegram bot');
      return;
    }

    if (recipientMode === 'csv' && isTelegram) {
      setError('CSV upload is not supported for Telegram broadcasts.');
      return;
    }

    if (recipientMode === 'manual') {
      let recipients = manualRecipients
        .split(/[\n,;]+/)
        .map(r => r.trim().replace(/\s/g, ''))
        .filter(Boolean);

      if (recipients.length === 0) { setError('Please enter at least one recipient'); return; }

      recipients = Array.from(new Set(recipients));
      if (isEmail) recipients = recipients.map(r => r.toLowerCase());

      const invalidRecipients = recipients.filter(r =>
        isSms ? !validatePhone(r) :
        isEmail ? !validateEmail(r) :
        !validateTelegramTarget(r)
      );

      if (invalidRecipients.length > 0) {
        setError(`Invalid ${isSms ? 'phone numbers' : isEmail ? 'emails' : 'Telegram targets'}: ${invalidRecipients.slice(0, 1).join(', ')}`);
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
      if (!csvFile) { setError('Please upload a CSV file'); return; }
      try {
        await createCsv.mutateAsync({
          file: csvFile,
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
    setName('');
    setSubject('');
    setTemplateId(null);
    setIntegrationId(null);
    setManualRecipients('');
    setCsvFile(null);
    setColumnName('');
    setMessage('');
    setError(null);
  };

  const isLoading = createManual.isPending || createCsv.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[960px] p-0 overflow-hidden bg-white rounded-[32px] border border-zinc-200 flex flex-col md:flex-row gap-0 h-[680px]">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-[260px] bg-zinc-50/50 border-r border-zinc-100 p-8 flex flex-col gap-8">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">Campaign Type</h3>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Select your channel</p>
          </div>

          <div className="space-y-2">
            {[
              { id: 'SMS', label: 'SMS Campaign', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
              { id: 'EMAIL', label: 'Email Campaign', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
              { id: 'TELEGRAM', label: 'Telegram Hub', icon: SiTelegram, color: 'text-sky-600', bg: 'bg-sky-50' }
            ].map((item) => {
              const isActive = channel === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setChannel(item.id as BroadcastChannel)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                    isActive 
                      ? "bg-white border border-zinc-200 shadow-sm" 
                      : "hover:bg-zinc-100/80 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isActive ? item.bg : "bg-white border border-zinc-100"
                    )}>
                      <Icon className={cn("w-5 h-5", isActive ? item.color : "text-zinc-400")} />
                    </div>
                    <div className="text-left">
                      <p className={cn(
                        "text-sm font-bold tracking-tight",
                        isActive ? "text-zinc-900" : "text-zinc-500"
                      )}>{item.label}</p>
                      {isActive && <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Active</p>}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-zinc-400" />}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-zinc-100">
             <div className="p-5 bg-white border border-zinc-100 rounded-[24px] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Campaign Tip</span>
                </div>
                <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                  {isSms ? "Keep SMS under 160 characters to avoid multiple segment charges." : 
                   isEmail ? "Use a clear subject line to improve your open rates significantly." : 
                   "Direct channels like Telegram build higher trust with your audience."}
                </p>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="p-10 pb-4 flex items-center justify-between">
            <div className="space-y-1">
               <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-none">New <span className={cn(isSms ? "text-orange-600" : isEmail ? "text-blue-600" : "text-sky-600")}>{channel}</span> Broadcast</h2>
               <p className="text-sm font-medium text-zinc-400">Configure your campaign identity and audience.</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 pt-4 pb-10 space-y-10 custom-scrollbar">
            {/* Identity & Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Campaign Name</label>
                <div className="relative group">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                  <Input 
                    placeholder="e.g. Summer Promo 2024"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 pl-12 rounded-[18px] border-zinc-200 bg-zinc-50/50 focus:bg-white text-base font-medium transition-all"
                  />
                </div>
              </div>

              {isEmail && (
                <div className="space-y-3 animate-in fade-in duration-500">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email Subject</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      placeholder="Enter subject line..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="h-14 pl-12 rounded-[18px] border-zinc-200 bg-zinc-50/50 focus:bg-white text-base font-medium transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Providers & Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Gateway Provider</label>
                <Select value={integrationId?.toString()} onValueChange={v => setIntegrationId(Number(v))}>
                  <SelectTrigger className="h-14 rounded-[18px] border-zinc-200 bg-zinc-50/50 font-medium px-5">
                    <SelectValue placeholder={
                      isTelegram ? "Choose Bot" : "System Default (Auto-select)"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {!isTelegram && (
                      <SelectItem value="0" className="font-bold text-blue-600 py-3">
                        System Default (Platform Account)
                      </SelectItem>
                    )}
                    {(isTelegram ? (telegramTargets as any[]) : filteredIntegrations).map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()} className="font-medium py-3">
                        {item.name} {('provider' in item) && `(${item.provider})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!integrationId && !isTelegram && (
                  <div className="flex items-center gap-2 px-1 animate-in fade-in duration-700">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Fast Lane: Using platform master account
                    </p>
                  </div>
                )}
              </div>

              {!isTelegram && (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Message Template</label>
                  <Select value={templateId?.toString()} onValueChange={v => setTemplateId(Number(v))}>
                    <SelectTrigger className="h-14 rounded-[18px] border-zinc-200 bg-zinc-50/50 font-medium px-5">
                      <SelectValue placeholder="Choose Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTemplates.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()} className="font-medium py-3">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Audience Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-6 border-b border-zinc-100 pb-0.5">
                <button
                  onClick={() => setRecipientMode('manual')}
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-widest pb-4 transition-all relative",
                    recipientMode === 'manual' ? 'text-zinc-900' : 'text-zinc-400'
                  )}
                >
                  Manual List
                  {recipientMode === 'manual' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />}
                </button>
                {!isTelegram && (
                  <button
                    onClick={() => setRecipientMode('csv')}
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-widest pb-4 transition-all relative",
                      recipientMode === 'csv' ? 'text-zinc-900' : 'text-zinc-400'
                    )}
                  >
                    CSV Cloud Import
                    {recipientMode === 'csv' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                  {recipientMode === 'manual' ? (
                    <div className="space-y-3">
                       <div className="relative group">
                          <Target className="absolute left-4 top-4 w-4 h-4 text-zinc-300" />
                          <Textarea 
                            value={manualRecipients}
                            onChange={e => setManualRecipients(e.target.value)}
                            placeholder={isSms ? "+1 234 567 890..." : isEmail ? "user@example.com..." : "@my_channel..."}
                            className="min-h-[160px] pl-12 pr-5 py-4 rounded-[24px] border-zinc-200 bg-zinc-50/50 focus:bg-white text-base font-medium transition-all resize-none"
                          />
                       </div>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Separate by commas or line breaks</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={cn(
                           "h-[160px] border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                           csvFile ? "border-emerald-500/50 bg-emerald-50/30" : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50"
                         )}
                       >
                          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                          {csvFile ? (
                            <>
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                              </div>
                              <p className="text-sm font-bold text-zinc-900">{csvFile.name}</p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-zinc-400" />
                              </div>
                              <p className="text-sm font-bold text-zinc-500">Upload Recipients CSV</p>
                            </>
                          )}
                       </div>
                       <div className="flex flex-col sm:flex-row gap-4 w-full">
                          <div className="flex-1 space-y-1.5">
                            <Input 
                              placeholder="CSV Column Name (optional)"
                              value={columnName}
                              onChange={e => setColumnName(e.target.value)}
                              className="h-12 rounded-xl border-zinc-200 text-sm font-medium"
                            />
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                              <Info className="w-2.5 h-2.5" />
                              Defaults to first column
                            </p>
                          </div>
                          <a 
                            href={isEmail ? "/example_email.csv" : "/example_sms.csv"} 
                            download 
                            className="h-12 px-5 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center gap-2 hover:bg-zinc-100 transition-all group shrink-0"
                          >
                             <Upload className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 group-hover:-translate-y-0.5 transition-all" />
                             <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-tight group-hover:text-zinc-900">Download Example</p>
                          </a>
                       </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-zinc-50/80 border border-zinc-200 rounded-[32px] p-8 h-full relative overflow-hidden flex flex-col justify-between">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center">
                             {isTelegram ? <SiTelegram className="w-5 h-5 text-sky-500" /> : isEmail ? <Mail className="w-5 h-5 text-blue-600" /> : <MessageSquare className="w-5 h-5 text-orange-600" />}
                           </div>
                           <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Message Preview</p>
                        </div>

                        {isTelegram ? (
                          <Textarea 
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Type your Telegram message..."
                            className="w-full h-32 bg-transparent border-none text-base font-bold text-zinc-700 placeholder:text-zinc-300 resize-none outline-none focus-visible:ring-0 p-0"
                          />
                        ) : (
                          <p className="text-sm font-bold text-zinc-600 leading-relaxed italic">
                            {selectedTemplate ? `"${selectedTemplate.content}"` : "Choose a template to see your message here..."}
                          </p>
                        )}
                     </div>

                     <div className="flex items-center justify-between pt-6 border-t border-zinc-200/50">
                        {recipientMode === 'manual' && manualRecipients.trim() ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full">
                            <Users className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {manualRecipients.split(/[\n,;]+/).filter(Boolean).length} Recipients
                            </span>
                          </div>
                        ) : <div />}
                        
                        {isTelegram && (
                           <span className={cn("text-[10px] font-bold uppercase tracking-widest", message.length > 4000 ? "text-red-500" : "text-zinc-400")}>
                             {message.length} / 4096
                           </span>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-[18px] border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest">{error}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-10 pt-6 border-t border-zinc-100 flex items-center justify-end gap-4">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="h-14 px-8 rounded-[18px] font-bold text-zinc-500 hover:text-zinc-900 transition-all"
            >
              Discard
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!name || isLoading || (isTelegram ? !integrationId || !message.trim() : !templateId || (isEmail && !subject))}
              className={cn(
                "h-14 px-12 rounded-[18px] font-extrabold text-base tracking-tight transition-all shadow-sm flex items-center gap-3 active:scale-[0.98]",
                isSms ? "bg-orange-600 hover:bg-orange-700" :
                isEmail ? "bg-blue-600 hover:bg-blue-700" :
                "bg-sky-500 hover:bg-sky-600",
                "text-white"
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Ship Campaign</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
