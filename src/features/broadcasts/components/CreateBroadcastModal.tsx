import { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2,
  AlertCircle,
  Mail, 
  MessageSquare, 
  Upload, 
  UserPlus, 
  Hash,
  Type,
  FileText,
  Info,
  Loader2,
  X,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useCreateBroadcast, useCreateBroadcastCsv, useTemplates, useIntegrations } from '../hooks/useBroadcasts';
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
}

export function CreateBroadcastModal({ isOpen, onClose }: CreateBroadcastModalProps) {
  const [channel, setChannel] = useState<BroadcastChannel>('SMS');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [integrationId, setIntegrationId] = useState<number | null>(null);
  const [recipientMode, setRecipientMode] = useState<'manual' | 'csv'>('manual');
  const [manualRecipients, setManualRecipients] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [columnName, setColumnName] = useState('');

  const { data: templates } = useTemplates();
  const { data: integrations } = useIntegrations();
  const createManual = useCreateBroadcast();
  const createCsv = useCreateBroadcastCsv();

  const filteredTemplates = templates?.filter(t => t.channel === channel && t.status === 'APPROVED');
  const filteredIntegrations = integrations?.filter(i => i.type === channel);
  const selectedTemplate = templates?.find(t => t.id === templateId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSms = channel === 'SMS';

  const handleSubmit = async () => {
    if (!name || !templateId) return;

    if (recipientMode === 'manual') {
      const recipients = manualRecipients
        .split(/[\n,]+/)
        .map(r => r.trim())
        .filter(Boolean);
      
      if (recipients.length === 0) return;

      await createManual.mutateAsync({
        name,
        channel,
        templateId,
        integrationId: integrationId || undefined,
        subject: !isSms ? subject : undefined,
        recipients
      });
    } else {
      if (!csvFile) return;

      await createCsv.mutateAsync({
        file: csvFile,
        name,
        channel,
        templateId,
        integrationId: integrationId || undefined,
        columnName: columnName || undefined,
        subject: !isSms ? subject : undefined
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
                      !isSms 
                        ? "bg-white dark:bg-white/10 border-indigo-500/20 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold" 
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">Email Campaign</span>
                    </div>
                    {!isSms && <ChevronRight className="w-4 h-4" />}
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

            {!isSms && (
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
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#0A0A0A] overflow-hidden">
            <div className="p-10 pb-6">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                New <span className={cn(isSms ? "text-blue-600" : "text-indigo-600")}>{channel}</span> Campaign
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

              {!isSms && (
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

              <div className={cn("grid gap-6", isSms ? "grid-cols-2" : "grid-cols-1")}>
                {/* Provider Selection */}
                {isSms && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Integration Gateway</label>
                    <Select value={integrationId?.toString()} onValueChange={(v) => setIntegrationId(Number(v))}>
                      <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-blue-500/20">
                        <SelectValue placeholder="System Default" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 dark:border-white/10 shadow-xl">
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

                {/* Template Selection */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Message Template</label>
                  <Select value={templateId?.toString()} onValueChange={(v) => setTemplateId(Number(v))}>
                    <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-blue-500/20">
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 dark:border-white/10 shadow-xl">
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
                    Manual List
                  </button>
                  <button 
                    onClick={() => setRecipientMode('csv')}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] pb-3 transition-all border-b-2",
                      recipientMode === 'csv' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
                    )}
                  >
                    CSV Cloud Import
                  </button>
                </div>

                {recipientMode === 'manual' ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <textarea 
                      placeholder={isSms ? "+1234567890, +0987654321..." : "target@domain.com, lead@domain.com..."}
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
                disabled={!name || !templateId || (!isSms && !subject) || isLoading}
                className={cn(
                  "rounded-xl px-10 h-10 font-bold shadow-md transition-all min-w-[160px]",
                  isSms ? "bg-blue-600 shadow-blue-500/20" : "bg-indigo-600 shadow-indigo-500/20",
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
