import { useState, useEffect } from 'react';
import { useIntegrations, useAdminIntegrations, useCreateIntegration } from '../hooks/useBroadcasts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  X
} from 'lucide-react';
import type { BroadcastChannel, BroadcastProvider } from '../api/types';
import { cn } from '@/lib/utils';

interface ProviderManagerProps {
  admin?: boolean;
}

export function ProviderManager({ admin = false }: ProviderManagerProps = {}) {
  const userQuery = useIntegrations();
  const adminQuery = useAdminIntegrations();
  const { data: integrations, isLoading } = admin ? adminQuery : userQuery;
  const createIntegration = useCreateIntegration();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<BroadcastChannel>('SMS');
  const [provider, setProvider] = useState<BroadcastProvider>('ADBIZZ');
  
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCreating) {
      setError(null);
      return;
    }

    if (name && name.length < 3) {
      setError('Integration name is too short');
      return;
    }

    if (provider === 'ADBIZZ') {
      if (adbizzUser && adbizzUser.length < 3) setError('Invalid Adbizz Username');
      else if (adbizzKey && adbizzKey.length < 10) setError('Invalid API Key');
      else setError(null);
    } else if (provider === 'SMTP') {
      if (smtpHost && !smtpHost.includes('.')) setError('Invalid SMTP Host');
      else if (smtpPort && isNaN(Number(smtpPort))) setError('Port must be a number');
      else if (smtpUser && !smtpUser.includes('@')) setError('Username should be an email');
      else setError(null);
    } else {
      setError(null);
    }
  }, [name, provider, adbizzUser, adbizzKey, smtpHost, smtpPort, smtpUser, isCreating]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Integration name is required');
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

    await createIntegration.mutateAsync({ name, type, provider, config, isDefault: true });
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setTwilioSid(''); setTwilioToken(''); setTwilioFrom('');
    setMsg91Key(''); setMsg91Sender(''); setAdbizzUser(''); setAdbizzKey(''); setAdbizzSender('');
    setSmtpHost(''); setSmtpPort('587'); setSmtpUser(''); setSmtpPass(''); setSmtpFromName(''); setSmtpSecure(false);
  };

  const renderIntegrationCard = (i: any) => {
    const isSms = i.type === 'SMS';
    return (
      <Card key={i.id} className="group border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-[#111]">
        <CardContent className="p-8 flex flex-col h-full relative">
          <div className={cn(
            "absolute top-0 right-0 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1.5",
            isSms ? "bg-orange-500 shadow-orange-500/20" : "bg-indigo-500 shadow-indigo-500/20"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Active
          </div>

          <div className="flex items-center gap-6 mb-8 mt-2">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-all duration-500",
              isSms ? "bg-orange-500/5 text-orange-600" : "bg-indigo-500/5 text-indigo-600"
            )}>
              {isSms ? <MessageSquare className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight leading-none mb-2">{i.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{i.provider}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{i.type}</span>
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
                isSms ? "bg-orange-500/5 text-orange-600" : "bg-indigo-500/5 text-indigo-600"
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
    const inputClasses = "w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
    const labelClasses = "text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1";

    if (provider === 'TWILIO') {
      return (
        <>
          <div className="space-y-3">
            <label className={labelClasses}>Account SID</label>
            <input type="text" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} className={inputClasses} placeholder="AC..." />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Auth Token</label>
            <input type="password" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} className={inputClasses} placeholder="••••••••" />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>From Number</label>
            <input type="text" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)} className={inputClasses} placeholder="+1..." />
          </div>
        </>
      );
    }
    if (provider === 'MSG91') {
      return (
        <>
          <div className="space-y-3">
            <label className={labelClasses}>Auth Key</label>
            <input type="password" value={msg91Key} onChange={e => setMsg91Key(e.target.value)} className={inputClasses} placeholder="••••••••" />
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Sender ID</label>
            <input type="text" value={msg91Sender} onChange={e => setMsg91Sender(e.target.value)} className={inputClasses} placeholder="GRYCAT" />
          </div>
        </>
      );
    }
    if (provider === 'SMTP') {
      return (
        <div className="space-y-8 col-span-full">
          <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
            <Button 
              variant="outline" size="sm" className="rounded-xl font-bold"
              onClick={() => {
                setSmtpHost('smtp.gmail.com'); setSmtpPort('587'); setSmtpSecure(false);
              }}
            >Gmail Preset</Button>
            <Button 
              variant="outline" size="sm" className="rounded-xl font-bold"
              onClick={() => {
                setSmtpHost('smtp-mail.outlook.com'); setSmtpPort('587'); setSmtpSecure(false);
              }}
            >Outlook Preset</Button>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest ml-auto flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Gmail requires an "App Password"
            </p>
          </div>

          {/* Quick Reference Table */}
          <div className="bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="px-5 py-3 bg-gray-100/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Common SMTP Settings</p>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
                    <th className="pb-3 px-2">Provider</th>
                    <th className="pb-3 px-2">SMTP Host</th>
                    <th className="pb-3 px-2">Port</th>
                    <th className="pb-3 px-2">Password Type</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  <tr className="border-b border-gray-50 dark:border-white/5">
                    <td className="py-3 px-2">Gmail</td>
                    <td className="py-3 px-2">smtp.gmail.com</td>
                    <td className="py-3 px-2">587</td>
                    <td className="py-3 px-2 text-indigo-600">App Password</td>
                  </tr>
                  <tr className="border-b border-gray-50 dark:border-white/5">
                    <td className="py-3 px-2">Outlook</td>
                    <td className="py-3 px-2">smtp-mail.outlook.com</td>
                    <td className="py-3 px-2">587</td>
                    <td className="py-3 px-2 text-indigo-600">App Password</td>
                  </tr>
                  <tr className="border-b border-gray-50 dark:border-white/5">
                    <td className="py-3 px-2">Yahoo</td>
                    <td className="py-3 px-2">smtp.mail.yahoo.com</td>
                    <td className="py-3 px-2">587</td>
                    <td className="py-3 px-2 text-indigo-600">App Password</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2">Custom</td>
                    <td className="py-3 px-2 italic">Your mail server</td>
                    <td className="py-3 px-2">587 / 465</td>
                    <td className="py-3 px-2 text-emerald-600">Standard</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* App Password Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Provider Setup</p>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gmail App Password</h4>
                </div>
              </div>
              <ol className="text-[11px] text-gray-600 dark:text-gray-400 space-y-2 font-medium list-decimal ml-4">
                <li>Go directly to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">Google App Passwords</a></li>
                <li>Confirm your password to reach the creation page</li>
                <li>Under <span className="font-bold">App passwords</span>, create a new password</li>
                <li>Copy the generated <span className="text-blue-600 font-bold tracking-wider">16-character</span> code</li>
                <li className="text-blue-600/80 italic font-bold">Note: Remove any spaces when pasting below</li>
                <li>Use this code in the password field below</li>
              </ol>
            </div>

            <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Provider Setup</p>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Outlook / Microsoft Business</h4>
                </div>
              </div>
              <ol className="text-[11px] text-gray-600 dark:text-gray-400 space-y-2 font-medium list-decimal ml-4">
                <li>Go to <a href="https://mysignins.microsoft.com/security-info" target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 hover:underline">Microsoft Security Info</a></li>
                <li>Click <span className="font-bold">+ Add sign-in method</span> at the top</li>
                <li>Select <span className="font-bold">App password</span> from the dropdown</li>
                <li>Name it (e.g., Greycats) and <span className="font-bold text-indigo-600">copy the password</span></li>
                <li>Use this password in the password field below</li>
              </ol>
              <div className="mt-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed italic">
                  Note: If you don't see "App password" in the dropdown, your organization's IT Admin may have disabled it for your domain.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className={labelClasses}>SMTP Host</label>
              <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className={inputClasses} placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Port</label>
              <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className={inputClasses} placeholder="587" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Display Name</label>
              <input type="text" value={smtpFromName} onChange={e => setSmtpFromName(e.target.value)} className={inputClasses} placeholder="Your Name" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Username / Email</label>
              <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className={inputClasses} placeholder="user@gmail.com" />
            </div>
            <div className="space-y-3">
              <label className={labelClasses}>Password / App Secret</label>
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
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <Card className="border-gray-200 dark:border-white/10 shadow-sm overflow-hidden bg-white dark:bg-[#111]">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/20">
              <Server className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Provider Integrations</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Connect and manage enterprise messaging gateways.</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            variant={isCreating ? "outline" : "default"}
            className="rounded-xl px-6 h-10 font-bold transition-all flex items-center gap-2"
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isCreating ? 'Cancel' : 'Connect Gateway'}
          </Button>
        </CardContent>
      </Card>

      {/* Integration Form */}
      {isCreating && (
        <Card className="border-gray-200 dark:border-white/10 shadow-lg overflow-hidden bg-white dark:bg-[#111] animate-in zoom-in-95 duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] p-6">
            <CardTitle className="text-lg font-bold">New Gateway Configuration</CardTitle>
            <CardDescription>Setup a new messaging provider for your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Integration Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adbizz Production Gateway"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Channel Type</label>
                <select 
                  value={type} 
                  onChange={(e) => {
                    const newType = e.target.value as BroadcastChannel;
                    setType(newType);
                    setProvider(newType === 'SMS' ? 'ADBIZZ' : 'SMTP');
                  }} 
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer outline-none"
                >
                  <option value="SMS">SMS Gateway</option>
                  <option value="EMAIL">Email Gateway</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Service Provider</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value as BroadcastProvider)} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer outline-none">
                  {type === 'SMS' ? (
                    <>
                      <option value="ADBIZZ">Adbizz</option>
                    </>
                  ) : (
                    <option value="SMTP">SMTP (Gmail/Outlook/Custom)</option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 mb-8">
              <Info className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-medium text-blue-900/60 dark:text-blue-300/60">
                {type === 'EMAIL' 
                  ? "Connecting your own SMTP allows you to send emails from your own domain. Otherwise, we send via our servers with a Reply-To header."
                  : "Approved SMS templates require a connected provider to execute broadcasts."}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/5 rounded-xl border border-red-500/10 mb-8 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100 dark:border-white/5">
              {renderConfigFields()}
            </div>

            <div className="flex justify-end pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
              <Button 
                onClick={handleSubmit} disabled={!name || createIntegration.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-500/20 min-w-[200px]"
              >
                {createIntegration.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activate Integration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Scanning Integrations...</p>
          </div>
        ) : integrations?.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200 dark:border-white/10">
              <Globe className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Disconnected</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Connect your first provider to start broadcasting.</p>
          </div>
        ) : (
          <div className="col-span-full space-y-12">
            {/* Email Providers Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 ml-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Email Channels</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">SMTP & Business Mail Gateways</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {integrations?.filter(i => i.type === 'EMAIL').map(i => renderIntegrationCard(i))}
                {integrations?.filter(i => i.type === 'EMAIL').length === 0 && (
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

            {/* SMS Providers Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 ml-1">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">SMS Channels</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Adbizz, Twilio & MSG91 Gateways</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {integrations?.filter(i => i.type === 'SMS').map(i => renderIntegrationCard(i))}
                {integrations?.filter(i => i.type === 'SMS').length === 0 && (
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
          </div>
        )}
      </div>
    </div>
  );
}
