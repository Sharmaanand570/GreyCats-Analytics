import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  useIntegrations, 
  useAdminIntegrations, 
  useCreateIntegration,
  useDeleteIntegration,
  useAdminDeleteIntegration
} from '../hooks/useBroadcasts';
import { useConnectTelegram, useTelegramTargets } from '@/features/blog/hooks/useBlogPosts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiTelegram, SiWhatsapp } from 'react-icons/si';
import { WhatsAppIntegrationCard } from './WhatsAppIntegrationCard';
import {
  Plus,
  Loader2,
  Globe,
  Server,
  ShieldCheck,
  Info,
  Mail,
  MessageSquare,
  AlertCircle,
  X,
  ChevronDown,
  Building2,
  Trash2
} from 'lucide-react';
import type { BroadcastChannel, BroadcastProvider, BroadcastIntegration } from '../api/types';
import { cn } from '@/lib/utils';
import { useClientContext } from '@/context/ClientContext';

interface ProviderManagerProps {
  admin?: boolean;
  clientId?: number;
  fixedChannel?: BroadcastChannel;
}

export function ProviderManager({ admin = false, clientId, fixedChannel }: ProviderManagerProps = {}) {
  const { clients } = useClientContext();
  const userQuery = useIntegrations(clientId);
  const adminQuery = useAdminIntegrations(admin);
  const { data: integrations, isLoading } = admin ? adminQuery : userQuery;
  
  const createIntegration = useCreateIntegration();
  const deleteIntegrationMutation = useDeleteIntegration();
  const adminDeleteIntegrationMutation = useAdminDeleteIntegration();
  const connectTelegramMutation = useConnectTelegram();
  const { data: telegramTargets = [], isLoading: isLoadingTelegram } = useTelegramTargets(
    admin ? undefined : clientId
  );
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<BroadcastChannel>(fixedChannel || 'SMS');
  const [provider, setProvider] = useState<BroadcastProvider>(
    fixedChannel === 'EMAIL' ? 'SMTP' :
    fixedChannel === 'WHATSAPP' ? 'META' :
    fixedChannel === 'TELEGRAM' ? 'TELEGRAM' :
    'ADBIZZ'
  );
  
  // Dynamic config state
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioFrom, setTwilioFrom] = useState('');
  const [msg91Key, setMsg91Key] = useState('');
  const [msg91Sender, setMsg91Sender] = useState('');
  const [adbizzUser, setAdbizzUser] = useState('');
  const [adbizzKey, setAdbizzKey] = useState('');
  const [adbizzSender, setAdbizzSender] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [tgDisplayName, setTgDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const smtpFieldsRef = useRef<HTMLDivElement | null>(null);


  const applyPreset = (preset: 'gmail' | 'outlook' | 'zoho') => {
    if (preset === 'gmail') {
      setSmtpHost('smtp.gmail.com'); setSmtpPort('587'); setSmtpSecure(false);
      toast.success('Gmail preset applied', { description: 'Host smtp.gmail.com · Port 587' });
    } else if (preset === 'outlook') {
      setSmtpHost('smtp-mail.outlook.com'); setSmtpPort('587'); setSmtpSecure(false);
      toast.success('Outlook preset applied', { description: 'Host smtp-mail.outlook.com · Port 587' });
    } else {
      setSmtpHost('smtp.zoho.com'); setSmtpPort('465'); setSmtpSecure(true);
      toast.success('Zoho preset applied', { description: 'Host smtp.zoho.com · Port 465 (SSL)' });
    }
    smtpFieldsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    if (fixedChannel) {
      setType(fixedChannel);
      setProvider(
        fixedChannel === 'EMAIL' ? 'SMTP' :
        fixedChannel === 'WHATSAPP' ? 'META' :
        fixedChannel === 'TELEGRAM' ? 'TELEGRAM' :
        'ADBIZZ'
      );
    }
  }, [fixedChannel]);

  useEffect(() => {
    if (!isCreating) {
      setError(null);
      return;
    }

    // Real-time validation for UI feedback
    if (name && name.length < 3) {
      setError('Integration name must be at least 3 characters');
      return;
    }

    if (provider === 'TWILIO') {
      if (twilioSid && !twilioSid.startsWith('AC')) setError('Twilio SID must start with AC');
      else if (twilioToken && twilioToken.length < 10) setError('Invalid Auth Token length');
      else setError(null);
    } else if (provider === 'MSG91') {
      if (msg91Key && msg91Key.length < 10) setError('Invalid MSG91 Key');
      else setError(null);
    } else if (provider === 'ADBIZZ') {
      if (adbizzUser && adbizzUser.length < 3) setError('Adbizz Username too short');
      else if (adbizzKey && adbizzKey.length < 10) setError('Invalid API Key');
      else setError(null);
    } else if (provider === 'SMTP') {
      if (smtpHost && !smtpHost.includes('.')) setError('Invalid SMTP Host format');
      else if (smtpPort && isNaN(Number(smtpPort))) setError('Port must be a valid number');
      else setError(null);
    } else if (provider === 'TELEGRAM') {
      if (tgBotToken && !tgBotToken.includes(':')) setError('Invalid Bot Token format');
      else setError(null);
    } else {
      setError(null);
    }
  }, [name, provider, twilioSid, twilioToken, adbizzUser, adbizzKey, smtpHost, smtpPort, tgBotToken, isCreating]);

  const validateForm = () => {
    if (!name.trim() || name.length < 3) { toast.error('Valid integration name is required'); return false; }
    
    if (provider === 'TWILIO') {
      if (!twilioSid.startsWith('AC')) { toast.error('Invalid Twilio SID'); return false; }
      if (!twilioToken) { toast.error('Twilio Token is required'); return false; }
      if (!twilioFrom) { toast.error('Twilio From Number is required'); return false; }
    } else if (provider === 'MSG91') {
      if (!msg91Key) { toast.error('MSG91 Auth Key is required'); return false; }
      if (!msg91Sender) { toast.error('MSG91 Sender ID is required'); return false; }
    } else if (provider === 'ADBIZZ') {
      if (!adbizzUser) { toast.error('Adbizz Username is required'); return false; }
      if (!adbizzKey) { toast.error('Adbizz API Key is required'); return false; }
      if (!adbizzSender) { toast.error('Adbizz Sender name is required'); return false; }
    } else if (provider === 'SMTP') {
      if (!smtpHost) { toast.error('SMTP Host is required'); return false; }
      if (!smtpPort) { toast.error('SMTP Port is required'); return false; }
      if (!smtpUser) { toast.error('SMTP Username is required'); return false; }
      if (!smtpPass) { toast.error('SMTP Password is required'); return false; }
    } else if (provider === 'TELEGRAM') {
      if (!tgBotToken.includes(':')) { toast.error('Invalid Telegram Bot Token'); return false; }
      if (!tgChatId) { toast.error('Telegram Channel ID is required'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Telegram credentials live in the TelegramAccount table on the backend,
    // not in BroadcastIntegration — route through the blog-side endpoint.
    if (provider === 'TELEGRAM') {
      try {
        await connectTelegramMutation.mutateAsync({
          botToken: tgBotToken.trim(),
          chatId: tgChatId.trim(),
          ...(tgDisplayName.trim() ? { displayName: tgDisplayName.trim() } : { displayName: name.trim() }),
          ...(clientId ? { clientId } : {}),
        });
        toast.success('Telegram channel connected');
        setIsCreating(false);
        resetForm();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to connect Telegram');
      }
      return;
    }

    let config: Record<string, any> = {};
    if (provider === 'TWILIO') {
      config = { accountSid: twilioSid, authToken: twilioToken, from: twilioFrom };
    } else if (provider === 'MSG91') {
      config = { authKey: msg91Key, sender: msg91Sender };
    } else if (provider === 'ADBIZZ') {
      config = { username: adbizzUser, apiKey: adbizzKey, sender: adbizzSender };
    } else if (provider === 'SMTP') {
      config = { host: smtpHost, port: Number(smtpPort), user: smtpUser, password: smtpPass, fromName: smtpFromName, secure: smtpSecure };
    }

    await createIntegration.mutateAsync({ name, type, provider, config, isDefault: true, clientId });
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setTwilioSid(''); setTwilioToken(''); setTwilioFrom('');
    setMsg91Key(''); setMsg91Sender(''); setAdbizzUser(''); setAdbizzKey(''); setAdbizzSender('');
    setSmtpHost(''); setSmtpPort('587'); setSmtpUser(''); setSmtpPass(''); setSmtpFromName(''); setSmtpSecure(false);
    setTgBotToken(''); setTgChatId(''); setTgDisplayName('');
  };

  const clientNameById = (id?: number | null) =>
    id ? (clients.find(c => c.id === id)?.name ?? `Client #${id}`) : null;

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to disconnect "${name}"?`)) {
      if (admin) {
        adminDeleteIntegrationMutation.mutate(id);
      } else {
        deleteIntegrationMutation.mutate(id);
      }
    }
  };

  const renderIntegrationCard = (i: BroadcastIntegration) => {
    const isSms = i.type === 'SMS';
    const isWhatsapp = i.type === 'WHATSAPP';
    const scopedClientName = clientNameById(i.clientId);
    return (
      <Card key={i.id} className="group border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-[#111]">
        <CardContent className="p-8 flex flex-col h-full relative">
          <div className={cn(
            "absolute top-0 right-0 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1.5",
            isWhatsapp ? "bg-green-500 shadow-green-500/20" : isSms ? "bg-orange-500 shadow-orange-500/20" : "bg-indigo-500 shadow-indigo-500/20"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Active
          </div>

          <button
            onClick={() => handleDelete(i.id, i.name)}
            className="absolute top-10 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:rotate-90 transition-all opacity-0 group-hover:opacity-100"
            title="Disconnect integration"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-6 mb-8 mt-2">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-all duration-500",
              isWhatsapp ? "bg-green-500/5 text-green-600" : isSms ? "bg-orange-500/5 text-orange-600" : "bg-indigo-500/5 text-indigo-600"
            )}>
              {isWhatsapp ? <SiWhatsapp className="w-7 h-7" /> : isSms ? <MessageSquare className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight leading-none mb-2">{i.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{i.provider}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{i.type}</span>
                {scopedClientName ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                    <Building2 className="w-2.5 h-2.5" />
                    {scopedClientName}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                    <Globe className="w-2.5 h-2.5" />
                    Global
                  </span>
                )}
              </div>
            </div>
          </div>

          {admin && i.user && (
            <div className="mb-6 p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Owner</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{i.user.fullName}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">{i.user.email}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5 mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Operational</span>
            </div>
            {i.isDefault && (
              <div className={cn(
                "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                isWhatsapp ? "bg-green-500/5 text-green-600" : isSms ? "bg-orange-500/5 text-orange-600" : "bg-indigo-500/5 text-indigo-600"
              )}>
                <ShieldCheck className="w-3.5 h-3.5" />
                System Default
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConfigFields = () => {
    const inputClasses = "w-full px-5 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none";
    const labelClasses = "text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-1";

    const errorDisplay = error && (
      <div className="col-span-full flex items-center gap-2 mb-2 animate-in slide-in-from-top-1 duration-300">
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</p>
      </div>
    );

    if (provider === 'TWILIO') {
      return (
        <>
          {errorDisplay}
          <div className="space-y-3">
            <label className={labelClasses}>Account SID <span className="text-red-500">*</span></label>
            <input type="text" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} className={inputClasses} placeholder="AC..." />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Auth Token <span className="text-red-500">*</span></label>
            <input type="password" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} className={inputClasses} placeholder="••••••••" />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>From Number <span className="text-red-500">*</span></label>
            <input type="text" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)} className={inputClasses} placeholder="+1..." />
          </div>
        </>
      );
    }
    if (provider === 'MSG91') {
      return (
        <>
          {errorDisplay}
          <div className="space-y-3">
            <label className={labelClasses}>Auth Key <span className="text-red-500">*</span></label>
            <input type="password" value={msg91Key} onChange={e => setMsg91Key(e.target.value)} className={inputClasses} placeholder="••••••••" />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Sender ID <span className="text-red-500">*</span></label>
            <input type="text" value={msg91Sender} onChange={e => setMsg91Sender(e.target.value)} className={inputClasses} placeholder="GRYCAT" />
          </div>
        </>
      );
    }
    if (provider === 'ADBIZZ') {
      return (
        <>
          {errorDisplay}
          <div className="space-y-3">
            <label className={labelClasses}>Adbizz Username <span className="text-red-500">*</span></label>
            <input type="text" value={adbizzUser} onChange={e => setAdbizzUser(e.target.value)} className={inputClasses} placeholder="Your username" />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>API Key <span className="text-red-500">*</span></label>
            <input type="password" value={adbizzKey} onChange={e => setAdbizzKey(e.target.value)} className={inputClasses} placeholder="••••••••" />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Sender ID <span className="text-red-500">*</span></label>
            <input type="text" value={adbizzSender} onChange={e => setAdbizzSender(e.target.value)} className={inputClasses} placeholder="GREYCATS" />
          </div>
        </>
      );
    }
    if (provider === 'TELEGRAM') {
      return (
        <>
          {errorDisplay}
          <div className="space-y-3">
            <label className={labelClasses}>Bot Token <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={tgBotToken}
              onChange={e => setTgBotToken(e.target.value)}
              className={inputClasses}
              placeholder="123456:ABC-DEF..."
            />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Channel ID / Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tgChatId}
              onChange={e => setTgChatId(e.target.value)}
              className={inputClasses}
              placeholder="@mychannel or -100..."
            />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Display Name (optional)</label>
            <input
              type="text"
              value={tgDisplayName}
              onChange={e => setTgDisplayName(e.target.value)}
              className={inputClasses}
              placeholder="My Channel"
            />
          </div>
          <div className="col-span-full flex items-center gap-3 p-4 bg-sky-500/5 rounded-xl border border-sky-500/10">
            <Info className="w-4 h-4 text-sky-500" />
            <p className="text-xs font-medium text-sky-900/60 dark:text-sky-300/60">
              Get your Bot Token from <span className="font-mono font-bold">@BotFather</span> on Telegram. Add the bot as an admin to your channel before connecting.
            </p>
          </div>
        </>
      );
    }
    if (provider === 'SMTP') {
      return (
        <div className="space-y-8 col-span-full">

          <div className="bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 rounded-2xl overflow-hidden transition-all duration-300">
            <details className="group">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none select-none">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Configuration Helper</p>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">SMTP Guide & Presets</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest group-open:hidden">Show Guide</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hidden group-open:block">Hide Guide</span>
                  <div className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-all">
                    <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform duration-300" />
                  </div>
                </div>
              </summary>
              
              <div className="px-6 pb-6 space-y-6 border-t border-indigo-100/50 dark:border-indigo-500/10 pt-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center flex-wrap gap-2">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest w-full mb-1">Apply Presets:</p>
                  <Button variant="outline" size="sm" className="rounded-xl text-[10px] h-8 px-4 font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => applyPreset('gmail')}>Gmail</Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-[10px] h-8 px-4 font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => applyPreset('outlook')}>Outlook</Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-[10px] h-8 px-4 font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => applyPreset('zoho')}>Zoho</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border border-indigo-100/50 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Step-by-Step</p>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Gmail Setup</h4>
                      </div>
                    </div>
                    <ol className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-2 font-medium list-decimal ml-4">
                      <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">App Passwords</a></li>
                      <li>Create a new password named "Greycats"</li>
                      <li>Copy the <span className="text-blue-600 font-bold">16-character code</span></li>
                      <li className="text-[10px] text-zinc-400 italic">Paste code into the password field below</li>
                    </ol>
                  </div>

                  <div className="p-5 bg-white/50 dark:bg-black/20 rounded-2xl border border-indigo-100/50 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Step-by-Step</p>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Outlook Setup</h4>
                      </div>
                    </div>
                    <ol className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-2 font-medium list-decimal ml-4">
                      <li>Visit <a href="https://mysignins.microsoft.com/security-info" target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 hover:underline">Security Info</a></li>
                      <li>Add <span className="font-bold">App password</span> method</li>
                      <li>Copy the generated secret</li>
                      <li className="text-[10px] text-zinc-400 italic">Use this in the password field below</li>
                    </ol>
                  </div>
                </div>
              </div>
            </details>
          </div>


          {errorDisplay}

          <div ref={smtpFieldsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-mt-24">
            <div className="space-y-3">
              <label className={labelClasses}>SMTP Host <span className="text-red-500">*</span></label>
              <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className={inputClasses} placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Port <span className="text-red-500">*</span></label>
              <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className={inputClasses} placeholder="587" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Display Name</label>
              <input type="text" value={smtpFromName} onChange={e => setSmtpFromName(e.target.value)} className={inputClasses} placeholder="Your Name" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Username / Email <span className="text-red-500">*</span></label>
              <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className={inputClasses} placeholder="user@gmail.com" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Password / App Secret <span className="text-red-500">*</span></label>
              <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} className={inputClasses} placeholder="••••••••" />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input 
                type="checkbox" checked={smtpSecure} onChange={e => setSmtpSecure(e.target.checked)}
                className="w-5 h-5 rounded border-gray-200 text-blue-600"
              />
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">SSL/TLS (Port 465)</label>
            </div>
          </div>
        </div>
      );
    }
    if (provider === 'META') {
      return (
        <div className="col-span-full py-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 mb-6">
            <SiWhatsapp className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">Connect via Meta</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mb-8">
            WhatsApp Business uses a secure OAuth connection. Click below to securely connect your Meta Business account.
          </p>
          <div className="w-full max-w-sm">
             <WhatsAppIntegrationCard clientId={clientId} onConnected={() => { setIsCreating(false); userQuery.refetch(); }} variant="button" />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <Card className="border-zinc-200 shadow-sm overflow-hidden bg-zinc-900 text-white">
        <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Server className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Provider Integrations</h2>
              <p className="text-sm text-zinc-400 font-medium mt-1">Connect and manage enterprise messaging gateways.</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (!isCreating && fixedChannel) {
                setType(fixedChannel);
                setProvider(
                  fixedChannel === 'EMAIL' ? 'SMTP' :
                  fixedChannel === 'WHATSAPP' ? 'META' :
                  fixedChannel === 'TELEGRAM' ? 'TELEGRAM' :
                  'ADBIZZ'
                );
              }
              setIsCreating(!isCreating);
            }}
            className={cn(
              "rounded-2xl px-6 h-12 font-bold transition-all flex items-center gap-2",
              isCreating ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white text-zinc-900 hover:bg-zinc-100"
            )}
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isCreating ? 'Cancel' : 'Connect Gateway'}
          </Button>
        </CardContent>
      </Card>



      {/* Integration Form Modal */}
      <Dialog open={isCreating} onOpenChange={(open) => {
        setIsCreating(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
          <Card className="border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden bg-white dark:bg-[#111]">
            <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] p-6 relative">
              <DialogTitle className="text-lg font-bold">New Gateway Configuration</DialogTitle>
              <DialogDescription>Setup a new messaging provider for your account.</DialogDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Integration Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input 
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Adbizz Production Gateway"
                      className="w-full pl-12 pr-5 py-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>
                {!fixedChannel && (
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Channel Type</label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as BroadcastChannel;
                        setType(newType);
                        setProvider(
                          newType === 'SMS' ? 'ADBIZZ' :
                          newType === 'EMAIL' ? 'SMTP' :
                          newType === 'WHATSAPP' ? 'META' :
                          'TELEGRAM'
                        );
                      }}
                      className="w-full px-5 py-4 pr-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer outline-none"
                    >
                      <option value="SMS">SMS Gateway</option>
                      <option value="EMAIL">Email Gateway</option>
                      <option value="TELEGRAM">Telegram Channel</option>
                      <option value="WHATSAPP">WhatsApp Business API</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                )}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Service Provider</label>
                  <div className="relative">
                    <select value={provider} onChange={(e) => setProvider(e.target.value as BroadcastProvider)} className="w-full px-5 py-4 pr-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer outline-none">
                      {type === 'SMS' ? (
                        <option value="ADBIZZ">Adbizz</option>
                      ) : type === 'EMAIL' ? (
                        <option value="SMTP">SMTP (Gmail/Outlook/Custom/Zoho)</option>
                      ) : type === 'WHATSAPP' ? (
                        <option value="META">Meta Business SDK</option>
                      ) : (
                        <option value="TELEGRAM">Telegram Bot</option>
                      )}
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
  
              <div className="flex items-center gap-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mb-6">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {type === 'EMAIL'
                    ? "Connect SMTP to broadcast from your domain. Default routing uses platform servers."
                    : type === 'TELEGRAM'
                    ? "Connect your bot to broadcast directly to your channels."
                    : "Approved SMS templates require a connected gateway to execute."}
                </p>
              </div>
  
              <div className="pt-8 border-t border-zinc-100 dark:border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {renderConfigFields()}
                </div>
              </div>
  
              {provider !== 'META' && (
                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-white/5 mt-8">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!name || createIntegration.isPending || connectTelegramMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 rounded-xl h-12"
                  >
                    {createIntegration.isPending || connectTelegramMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activate Integration'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Scanning Integrations...</p>
          </div>
        ) : (integrations as BroadcastIntegration[])?.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200 dark:border-white/10">
              <Globe className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Disconnected</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Connect your first provider to start broadcasting.</p>
          </div>
        ) : (
          <div className="col-span-full">
            <Tabs defaultValue={fixedChannel?.toLowerCase() || "email"} value={fixedChannel?.toLowerCase()} className="w-full space-y-8">
              {!fixedChannel && (
              <TabsList className="bg-zinc-100/50 p-1.5 rounded-2xl inline-flex h-auto w-full md:w-auto">
                <TabsTrigger value="email" className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email Channels
                </TabsTrigger>
                <TabsTrigger value="sms" className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 transition-all flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> SMS Channels
                </TabsTrigger>
                {!admin && (
                  <TabsTrigger value="telegram" className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-sky-600 transition-all flex items-center gap-2">
                    <SiTelegram className="w-3.5 h-3.5" /> Telegram Bots
                  </TabsTrigger>
                )}
                {!admin && (
                  <TabsTrigger value="whatsapp" className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 transition-all flex items-center gap-2">
                    <SiWhatsapp className="w-3.5 h-3.5" /> WhatsApp Business
                  </TabsTrigger>
                )}
              </TabsList>
              )}

              <TabsContent value="email" className="mt-0 outline-none">
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(integrations as BroadcastIntegration[])?.filter(i => i.type === 'EMAIL').map(i => renderIntegrationCard(i))}
                    {(integrations as BroadcastIntegration[])?.filter(i => i.type === 'EMAIL').length === 0 && (
                      <button 
                        onClick={() => { setType('EMAIL'); setProvider('SMTP'); setIsCreating(true); }}
                        className="h-[240px] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-center px-6">
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No Email Gateway Connected</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Connect SMTP to send emails</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sms" className="mt-0 outline-none">
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(integrations as BroadcastIntegration[])?.filter(i => i.type === 'SMS').map(i => renderIntegrationCard(i))}
                    {(integrations as BroadcastIntegration[])?.filter(i => i.type === 'SMS').length === 0 && (
                      <button
                        onClick={() => { setType('SMS'); setProvider('ADBIZZ'); setIsCreating(true); }}
                        className="h-[240px] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-center px-6">
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No SMS Gateway Connected</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Connect Adbizz to send messages</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {!admin && (
                <TabsContent value="telegram" className="mt-0 outline-none">
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {isLoadingTelegram ? (
                        <div className="col-span-full py-10 flex justify-center">
                          <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                        </div>
                      ) : telegramTargets.length === 0 ? (
                        <button
                          onClick={() => { setType('TELEGRAM'); setProvider('TELEGRAM'); setIsCreating(true); }}
                          className="h-[240px] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="text-center px-6">
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No Telegram Channel Connected</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Connect a bot to broadcast to channels</p>
                          </div>
                        </button>
                      ) : (
                        (telegramTargets as any[]).map((tg) => {
                          const scopedClientName = clientNameById(tg.clientId ?? null);
                          return (
                            <Card key={tg.id} className="group border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-[#111]">
                              <CardContent className="p-8 flex flex-col h-full relative">
                                <div className="absolute top-0 right-0 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1.5 bg-sky-500 shadow-sky-500/20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  Active
                                </div>
                                <div className="flex items-center gap-6 mb-8 mt-2">
                                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-all duration-500 bg-sky-500/5 text-sky-600">
                                    <SiTelegram className="w-7 h-7" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight leading-none mb-2">{tg.name}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">TELEGRAM</span>
                                      {scopedClientName ? (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                          <Building2 className="w-2.5 h-2.5" />
                                          {scopedClientName}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                                          <Globe className="w-2.5 h-2.5" />
                                          Global
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5 mt-auto">
                                  <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Operational</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                      {telegramTargets.length > 0 && (
                        <button
                          onClick={() => { setType('TELEGRAM'); setProvider('TELEGRAM'); setIsCreating(true); }}
                          className="h-[240px] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="text-center px-6">
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Connect Another Channel</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
              {!admin && (
                <TabsContent value="whatsapp" className="mt-0 outline-none">
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {(integrations as BroadcastIntegration[])?.filter(i => i.type === 'WHATSAPP').map(i => renderIntegrationCard(i))}
                      {(integrations as BroadcastIntegration[])?.filter(i => i.type === 'WHATSAPP').length === 0 && (
                        <WhatsAppIntegrationCard clientId={clientId} onConnected={() => userQuery.refetch()} />
                      )}
                      {(integrations as BroadcastIntegration[])?.filter(i => i.type === 'WHATSAPP').length > 0 && (
                        <WhatsAppIntegrationCard clientId={clientId} onConnected={() => userQuery.refetch()} hasExisting={true} />
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
