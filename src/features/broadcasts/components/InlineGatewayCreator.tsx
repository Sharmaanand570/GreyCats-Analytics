import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCreateIntegration } from '../hooks/useBroadcasts';
import { useConnectTelegram } from '@/features/blog/hooks/useBlogPosts';
import { Button } from '@/components/ui/button';
import { Loader2, Info, ArrowLeft, CheckCircle2, Server, Key, User, Shield, MessageSquare, Mail } from 'lucide-react';
import { SiTelegram, SiWhatsapp } from 'react-icons/si';
import type { BroadcastChannel, BroadcastProvider } from '../api/types';
import { cn } from '@/lib/utils';

export interface InlineGatewayCreatorProps {
  channel: BroadcastChannel;
  clientId?: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const channelConfig = {
  SMS: { icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', name: 'SMS' },
  EMAIL: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', name: 'Email' },
  TELEGRAM: { icon: SiTelegram, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', name: 'Telegram' },
  WHATSAPP: { icon: SiWhatsapp, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', name: 'WhatsApp' },
};

export function InlineGatewayCreator({ channel, clientId, onCancel, onSuccess }: InlineGatewayCreatorProps) {
  const createIntegration = useCreateIntegration();
  const connectTelegramMutation = useConnectTelegram();
  const cfg = channelConfig[channel] || channelConfig.SMS;
  const ChannelIcon = cfg.icon;

  const [name, setName] = useState('');
  const [provider, setProvider] = useState<BroadcastProvider>(
    channel === 'EMAIL' ? 'SMTP' :
    channel === 'WHATSAPP' ? 'META' :
    channel === 'TELEGRAM' ? 'TELEGRAM' :
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
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
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
  }, [name, provider, twilioSid, twilioToken, adbizzUser, adbizzKey, smtpHost, smtpPort, tgBotToken, msg91Key]);

  const handleSubmit = async () => {
    if (!name.trim() || name.length < 3) { toast.error('Valid integration name is required'); return; }

    if (provider === 'TELEGRAM') {
      if (!tgBotToken.includes(':')) { toast.error('Invalid Telegram Bot Token'); return; }
      if (!tgChatId) { toast.error('Telegram Channel ID is required'); return; }
      
      try {
        await connectTelegramMutation.mutateAsync({
          botToken: tgBotToken.trim(),
          chatId: tgChatId.trim(),
          displayName: name.trim(),
          ...(clientId ? { clientId } : {}),
        });
        toast.success('Telegram channel connected');
        setSaved(true);
        setTimeout(() => onSuccess(), 800);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to connect Telegram');
      }
      return;
    }

    let config: Record<string, any> = {};
    if (provider === 'TWILIO') {
      if (!twilioSid.startsWith('AC')) { toast.error('Invalid Twilio SID'); return; }
      if (!twilioToken || !twilioFrom) { toast.error('All fields are required'); return; }
      config = { accountSid: twilioSid, authToken: twilioToken, from: twilioFrom };
    } else if (provider === 'MSG91') {
      if (!msg91Key || !msg91Sender) { toast.error('All fields are required'); return; }
      config = { authKey: msg91Key, sender: msg91Sender };
    } else if (provider === 'ADBIZZ') {
      if (!adbizzUser || !adbizzKey || !adbizzSender) { toast.error('All fields are required'); return; }
      config = { username: adbizzUser, apiKey: adbizzKey, sender: adbizzSender };
    } else if (provider === 'SMTP') {
      if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) { toast.error('All fields are required'); return; }
      config = { host: smtpHost, port: Number(smtpPort), user: smtpUser, password: smtpPass, secure: Number(smtpPort) === 465 };
    }

    try {
      await createIntegration.mutateAsync({ name, type: channel, provider, config, isDefault: true, clientId });
      toast.success('Gateway connected');
      setSaved(true);
      setTimeout(() => onSuccess(), 800);
    } catch (err) {
      console.error(err);
    }
  };

  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all outline-none shadow-sm pl-9";
  const labelClasses = "text-xs font-semibold text-zinc-600 px-0.5 block mb-1.5 flex items-center gap-1.5";

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', cfg.bg)}>
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900">Gateway Connected!</h3>
        <p className="text-sm text-zinc-500 mt-1">Returning to campaign setup…</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-400">
      {/* Section header */}
      <div className={cn('flex items-center gap-3 p-4 rounded-2xl border mb-6', cfg.bg, cfg.border)}>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border', cfg.border)}>
          <ChannelIcon className={cn('w-5 h-5', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-zinc-900">Connect {cfg.name} Gateway</h3>
          <p className="text-[11px] font-medium text-zinc-500">Link your provider account to enable messaging</p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClasses}><Server className="w-3.5 h-3.5" /> Integration Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <Server className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} 
              className={inputClasses} placeholder="e.g. Primary Gateway" 
            />
          </div>
        </div>

        {channel === 'SMS' && (
          <div>
            <label className={labelClasses}><Shield className="w-3.5 h-3.5" /> Provider</label>
            <div className="flex gap-2">
              {(['ADBIZZ', 'TWILIO', 'MSG91'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl border transition-all",
                    provider === p 
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-sm" 
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-2 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
          {provider === 'TWILIO' && (
            <>
              <div>
                <label className={labelClasses}><Key className="w-3.5 h-3.5" /> Account SID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} className={inputClasses} placeholder="AC..." />
                </div>
              </div>
              <div>
                <label className={labelClasses}><Shield className="w-3.5 h-3.5" /> Auth Token <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className={labelClasses}><MessageSquare className="w-3.5 h-3.5" /> From Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)} className={inputClasses} placeholder="+1..." />
                </div>
              </div>
            </>
          )}

          {provider === 'MSG91' && (
            <>
              <div>
                <label className={labelClasses}><Key className="w-3.5 h-3.5" /> Auth Key <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={msg91Key} onChange={e => setMsg91Key(e.target.value)} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className={labelClasses}><User className="w-3.5 h-3.5" /> Sender ID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={msg91Sender} onChange={e => setMsg91Sender(e.target.value)} className={inputClasses} placeholder="GRYCAT" />
                </div>
              </div>
            </>
          )}

          {provider === 'ADBIZZ' && (
            <>
              <div>
                <label className={labelClasses}><User className="w-3.5 h-3.5" /> Adbizz Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={adbizzUser} onChange={e => setAdbizzUser(e.target.value)} className={inputClasses} placeholder="Your username" />
                </div>
              </div>
              <div>
                <label className={labelClasses}><Key className="w-3.5 h-3.5" /> API Key <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={adbizzKey} onChange={e => setAdbizzKey(e.target.value)} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className={labelClasses}><User className="w-3.5 h-3.5" /> Sender ID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={adbizzSender} onChange={e => setAdbizzSender(e.target.value)} className={inputClasses} placeholder="GREYCATS" />
                </div>
              </div>
            </>
          )}

          {provider === 'SMTP' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClasses}><Server className="w-3.5 h-3.5" /> SMTP Host <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Server className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className={inputClasses} placeholder="smtp.gmail.com" />
                </div>
              </div>
              <div>
                <label className={labelClasses}><Shield className="w-3.5 h-3.5" /> SMTP Port <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className={inputClasses} placeholder="587" />
                </div>
              </div>
              <div>
                <label className={labelClasses}><User className="w-3.5 h-3.5" /> Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className={inputClasses} placeholder="hello@company.com" />
                </div>
              </div>
              <div className="col-span-2">
                <label className={labelClasses}><Key className="w-3.5 h-3.5" /> Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}

          {provider === 'TELEGRAM' && (
            <>
              <div>
                <label className={labelClasses}><Key className="w-3.5 h-3.5" /> Bot Token <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={tgBotToken} onChange={e => setTgBotToken(e.target.value)} className={inputClasses} placeholder="123456:ABC-DEF..." />
                </div>
              </div>
              <div>
                <label className={labelClasses}><User className="w-3.5 h-3.5" /> Channel ID / Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={tgChatId} onChange={e => setTgChatId(e.target.value)} className={inputClasses} placeholder="@mychannel or -100..." />
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 mt-2 bg-blue-50/50 rounded-xl border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-blue-800/80 leading-relaxed">
                  Get your Bot Token from <span className="font-bold text-blue-900">@BotFather</span>. Add the bot as an admin to your channel.
                </p>
              </div>
            </>
          )}

          {provider === 'META' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-amber-800/80 leading-relaxed">
                Meta WhatsApp integration must be set up via the main Gateways dashboard due to OAuth requirements.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-6">
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="flex-1 h-10 rounded-xl text-xs font-semibold border-zinc-200 text-zinc-600 hover:bg-zinc-50"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!!error || !name || provider === 'META' || createIntegration.isPending || connectTelegramMutation.isPending} 
          className="flex-[2] h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40"
        >
          {createIntegration.isPending || connectTelegramMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Connect Gateway</>
          )}
        </Button>
      </div>
    </div>
  );
}
