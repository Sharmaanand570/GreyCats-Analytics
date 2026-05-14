import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageSquare,
  Upload,
  Hash,
  Type,
  FileText,
  Info,
  Loader2,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { SiTelegram } from 'react-icons/si';
import { useCreateBroadcast, useCreateBroadcastCsv, useTemplates, useIntegrations } from '../hooks/useBroadcasts';
import { useTelegramTargets } from '@/features/blog/hooks/useBlogPosts';
import type { BroadcastChannel } from '../api/types';
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

  const filteredTemplates = templates?.filter(t => t.channel === channel && t.status === 'APPROVED');
  const filteredIntegrations = integrations?.filter(i => i.type === channel);
  const selectedTemplate = templates?.find(t => t.id === templateId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{10,12}$/.test(phone);
  // Telegram channel ID: @username (5+ chars) OR numeric chat id (e.g. -1001234567890)
  const validateTelegramTarget = (s: string) => /^@[A-Za-z0-9_]{4,}$/.test(s) || /^-?\d{5,}$/.test(s);

  const recipientPlaceholder = isSms
    ? '9123456789, 9876543210...'
    : isEmail
    ? 'target@domain.com, lead@domain.com...'
    : '@mychannel_a, @mychannel_b, -1001234567890';

  // Real-time validation as user types
  useEffect(() => {
    if (recipientMode === 'manual' && manualRecipients) {
      const recipients = manualRecipients
        .split(/[\n,;]+/)
        .map(r => r.trim().replace(/\s/g, ''))
        .filter(Boolean);

      if (recipients.length > 0) {
        const invalidRecipients = recipients.filter(r =>
          isSms ? !validatePhone(r) :
          isEmail ? !validateEmail(r) :
          !validateTelegramTarget(r)
        );

        if (invalidRecipients.length > 0) {
          setError(`Invalid format: ${invalidRecipients.slice(0, 1).join(', ')}${invalidRecipients.length > 1 ? '...' : ''}`);
        } else {
          setError(null);
        }
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, [manualRecipients, recipientMode, channel, isSms, isEmail]);

  // Reset integration & template when channel changes, since the lists differ per channel.
  useEffect(() => {
    setIntegrationId(null);
    setTemplateId(null);
  }, [channel]);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }

    if (isTelegram) {
      if (!integrationId) {
        setError('Please select a Telegram bot');
        return;
      }
      if (!message.trim()) {
        setError('Message body is required');
        return;
      }
    } else {
      if (!templateId) {
        setError('Please select a message template');
        return;
      }
      if (isEmail && !subject.trim()) {
        setError('Email subject is required');
        return;
      }
    }

    if (recipientMode === 'csv' && isTelegram) {
      setError('CSV upload is not supported for Telegram broadcasts. Use the manual list.');
      return;
    }

    if (recipientMode === 'manual') {
      let recipients = manualRecipients
        .split(/[\n,;]+/)
        .map(r => r.trim().replace(/\s/g, ''))
        .filter(Boolean);

      if (recipients.length === 0) {
        setError('Please enter at least one recipient');
        return;
      }

      recipients = Array.from(new Set(recipients));

      if (isEmail) {
        recipients = recipients.map(r => r.toLowerCase());
      }

      const invalidRecipients = recipients.filter(r =>
        isSms ? !validatePhone(r) :
        isEmail ? !validateEmail(r) :
        !validateTelegramTarget(r)
      );

      if (invalidRecipients.length > 0) {
        const label = isSms ? 'phone numbers' : isEmail ? 'emails' : 'Telegram channels';
        setError(`Invalid ${label}: ${invalidRecipients.slice(0, 2).join(', ')}${invalidRecipients.length > 2 ? '...' : ''}`);
        return;
      }

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
    } else {
      if (!csvFile) {
        setError('Please upload a CSV file to proceed');
        return;
      }

      await createCsv.mutateAsync({
        file: csvFile,
        name: name.trim(),
        channel,
        templateId: templateId!,
        integrationId: integrationId || undefined,
        columnName: columnName.trim() || undefined,
        subject: isEmail ? subject.trim() : undefined,
        clientId,
      });
    }

    onClose();
    resetForm();
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
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-white dark:bg-[#0A0A0A] rounded-2xl border-none shadow-2xl gap-0">
        <div className="flex h-[600px]">
          {/* Left Sidebar - Visual Context */}
          <div className="w-64 bg-gray-50 dark:bg-white/[0.02] border-r border-gray-100 dark:border-white/5 flex flex-col p-8 justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-blue-500 rounded-full blur-3xl" />
              <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-indigo-500 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white dark:text-black" />
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Select Channel</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setChannel('SMS')}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl transition-all border",
                      isSms 
                        ? "bg-white dark:bg-white/10 border-blue-500/20 shadow-sm text-blue-600 dark:text-blue-400 font-bold" 
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-sm">SMS Broadcast</span>
                    </div>
                    {isSms && <ChevronRight className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setChannel('EMAIL')}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl transition-all border",
                      channel === 'EMAIL'
                        ? "bg-white dark:bg-white/10 border-indigo-500/20 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">Email Campaign</span>
                    </div>
                    {channel === 'EMAIL' && <ChevronRight className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setChannel('TELEGRAM')}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl transition-all border",
                      isTelegram
                        ? "bg-white dark:bg-white/10 border-sky-500/20 shadow-sm text-sky-600 dark:text-sky-400 font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <SiTelegram className="w-5 h-5" />
                      <span className="text-sm">Telegram Channel</span>
                    </div>
                    {isTelegram && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-blue-600/5 p-4 rounded-xl border border-blue-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pro Tip</p>
              </div>
              <p className="text-[11px] text-blue-900/60 dark:text-blue-300/60 leading-relaxed font-medium">
                Personalized templates increase engagement by up to 40%. Use tags effectively.
              </p>
            </div>

            {isEmail && (
              <div className="space-y-4">
                {(!filteredIntegrations || filteredIntegrations.length === 0) && (
                  <div className="relative z-10 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Action Required</p>
                    </div>
                    <p className="text-[11px] text-amber-900/60 dark:text-amber-300/60 leading-relaxed font-medium">
                      Connect your email account to send emails from your own address.
                    </p>
                  </div>
                )}

                <div className="relative z-10 bg-indigo-600/5 p-4 rounded-xl border border-indigo-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Inbox Sync</p>
                  </div>
                  <p className="text-[11px] text-indigo-900/60 dark:text-indigo-300/60 leading-relaxed font-medium">
                    Replies to your broadcasts will go directly to your registered email address.
                  </p>
                </div>
              </div>
            )}

            {isTelegram && (
              <div className="space-y-4">
                {telegramTargets.length === 0 && (
                  <div className="relative z-10 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Action Required</p>
                    </div>
                    <p className="text-[11px] text-amber-900/60 dark:text-amber-300/60 leading-relaxed font-medium">
                      Connect a Telegram bot from Providers → Telegram Channels before broadcasting.
                    </p>
                  </div>
                )}

                <div className="relative z-10 bg-sky-500/5 p-4 rounded-xl border border-sky-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <SiTelegram className="w-3.5 h-3.5 text-sky-500" />
                    <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Admin Required</p>
                  </div>
                  <p className="text-[11px] text-sky-900/60 dark:text-sky-300/60 leading-relaxed font-medium">
                    The bot must be an admin in every channel you list. Channels without admin rights are marked failed.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#0A0A0A] overflow-hidden">
            <div className="p-10 pb-6">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                New <span className={cn(
                  isSms ? "text-blue-600" :
                  isEmail ? "text-indigo-600" :
                  "text-sky-600"
                )}>{channel}</span> Campaign
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Define your target audience and message payload.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scrollbar">
              {/* Campaign Name */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Campaign Identity</label>
                <div className="relative group">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="e.g. Q4 Marketing Campaign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              {isEmail && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-500">
                  <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Email Subject Line</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="🎉 Your Exclusive Update is Here!"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full pl-11 pr-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              <div className={cn("grid gap-6", (isSms || isTelegram) ? "grid-cols-2" : "grid-cols-1")}>
                {/* Provider Selection — SMS gateway / Email gateway / Telegram bot */}
                {isSms && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Integration Gateway</label>
                    <Select value={integrationId?.toString()} onValueChange={(v) => setIntegrationId(Number(v))}>
                      <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-blue-500/20">
                        <SelectValue placeholder="System Default" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredIntegrations?.map(i => (
                          <SelectItem key={i.id} value={i.id.toString()} className="rounded-lg my-1 mx-1 font-medium">
                            {i.name}
                          </SelectItem>
                        ))}
                        {(!filteredIntegrations || filteredIntegrations.length === 0) && (
                          <div className="p-4 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            No {channel} providers
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {isTelegram && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Telegram Bot</label>
                    <Select value={integrationId?.toString()} onValueChange={(v) => setIntegrationId(Number(v))}>
                      <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-sky-500/20">
                        <SelectValue placeholder="Select a connected bot" />
                      </SelectTrigger>
                      <SelectContent>
                        {telegramTargets.map(t => (
                          <SelectItem key={t.id} value={String(t.id)} className="rounded-lg my-1 mx-1 font-medium">
                            {t.name}
                          </SelectItem>
                        ))}
                        {telegramTargets.length === 0 && (
                          <div className="p-4 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                            No bots connected for this client.<br />
                            Connect one from Providers → Telegram Channels.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Message source — Template for SMS/EMAIL, plain body for Telegram */}
                {!isTelegram ? (
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Message Template</label>
                    <Select value={templateId?.toString()} onValueChange={(v) => setTemplateId(Number(v))}>
                      <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-blue-500/20">
                        <SelectValue placeholder="Select Template" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTemplates?.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()} className="rounded-lg my-1 mx-1 font-medium">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isSms && (
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-1 flex items-center gap-1.5">
                        <Info className="w-3 h-3" />
                        Only templates approved by DLT Providers and Service Provider Adbizz are eligible.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Message Body</label>
                    <textarea
                      placeholder="Hello everyone! 🎉"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none resize-none"
                    />
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-1 flex items-center gap-1.5">
                      <Info className="w-3 h-3" />
                      Plain text. The bot posts the same message to every channel below.
                    </p>
                  </div>
                )}
              </div>

              {/* Template Preview */}
              {selectedTemplate && (
                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl animate-in zoom-in-95 duration-500">
                   <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Preview Payload</p>
                    </div>
                    {isSms && (
                      <span className="text-[9px] font-black bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {selectedTemplate.content.length} / 160 Chars
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic whitespace-pre-wrap">
                    "{selectedTemplate.content}"
                  </p>
                </div>
              )}

              {/* Recipient Input */}
              <div className="space-y-4">
                 <div className="flex items-center gap-6 border-b border-gray-100 dark:border-white/5 pb-1">
                  <button
                    onClick={() => setRecipientMode('manual')}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] pb-3 transition-all border-b-2",
                      recipientMode === 'manual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
                    )}
                  >
                    {isTelegram ? 'Channels' : 'Manual List'}
                  </button>
                  {!isTelegram && (
                    <button
                      onClick={() => setRecipientMode('csv')}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] pb-3 transition-all border-b-2",
                        recipientMode === 'csv' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
                      )}
                    >
                      CSV Cloud Import
                    </button>
                  )}
                </div>

                {recipientMode === 'manual' ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <textarea
                      placeholder={recipientPlaceholder}
                      value={manualRecipients}
                      onChange={(e) => setManualRecipients(e.target.value)}
                      rows={4}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-500",
                        csvFile 
                          ? "border-emerald-500/30 bg-emerald-500/5" 
                          : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-blue-500/30 hover:bg-blue-500/5"
                      )}
                    >
                      <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      />
                      {csvFile ? (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-gray-900 dark:text-white">{csvFile.name}</p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Ready for synchronization</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-gray-200/50 dark:bg-white/10 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Deploy CSV File</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">UTF-8 Format Recommended</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/5 rounded-xl border border-red-500/10 mb-4 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest">{error}</p>
                </div>
              )}
            </div>

            <div className="p-10 pt-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex items-center justify-end gap-4">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="rounded-xl px-6 h-10 font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                Discard
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !name ||
                  isLoading ||
                  (isTelegram
                    ? !integrationId || !message.trim()
                    : !templateId || (isEmail && !subject))
                }
                className={cn(
                  "rounded-xl px-10 h-10 font-bold shadow-md transition-all min-w-[160px]",
                  isSms ? "bg-blue-600 shadow-blue-500/20" :
                  isEmail ? "bg-indigo-600 shadow-indigo-500/20" :
                  "bg-sky-500 shadow-sky-500/20",
                  "text-white"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Start Broadcast'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
