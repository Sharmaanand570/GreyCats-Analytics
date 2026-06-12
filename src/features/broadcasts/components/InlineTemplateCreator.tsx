import { useState, useEffect } from 'react';
import { useCreateTemplate } from '../hooks/useBroadcasts';
import { Button } from '@/components/ui/button';
import {
  Loader2, Sparkles, X, Mail, MessageSquare, FileText,
  ArrowLeft, CheckCircle2, AlertCircle, Info, Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SiTelegram, SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';
import { creativeApi } from '@/api/creativeApi';
import type { BroadcastChannel, WhatsAppTemplateCategory } from '../api/types';
import { cn } from '@/lib/utils';
import { WHATSAPP_LANGUAGES } from './WhatsAppTemplateCreator';

export interface InlineTemplateCreatorProps {
  channel: BroadcastChannel;
  clientId?: number;
  onCancel: () => void;
  onSuccess: (templateId?: number) => void;
}

// ─── Channel configs ──────────────────────────────────────────────────────────
const channelConfig = {
  SMS: { icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', name: 'SMS', maxChars: 160 },
  EMAIL: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', name: 'Email', maxChars: 10000 },
  TELEGRAM: { icon: SiTelegram, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', name: 'Telegram', maxChars: 4096 },
  WHATSAPP: { icon: SiWhatsapp, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', name: 'WhatsApp', maxChars: 1024 },
};

// WhatsApp name must be lowercase letters, numbers, and underscores only
const WA_NAME_REGEX = /^[a-z0-9_]*$/;

function validateWaName(name: string): string | null {
  if (!name) return null;
  if (!WA_NAME_REGEX.test(name))
    return 'Only lowercase letters, numbers, and underscores allowed (e.g. order_shipped)';
  if (name.length < 3) return 'At least 3 characters required';
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InlineTemplateCreator({ channel, clientId, onCancel, onSuccess }: InlineTemplateCreatorProps) {
  const createTemplate = useCreateTemplate();
  const cfg = channelConfig[channel] || channelConfig.SMS;
  const ChannelIcon = cfg.icon;
  const isWhatsapp = channel === 'WHATSAPP';

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<WhatsAppTemplateCategory>('UTILITY');
  const [language, setLanguage] = useState('en_US');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Live validation
  useEffect(() => {
    if (isWhatsapp && name) {
      const err = validateWaName(name);
      if (err) { setError(err); return; }
    } else if (name && name.length < 3) {
      setError('Template name must be at least 3 characters');
      return;
    }
    if (channel === 'SMS' && content.length > 160) {
      setError(`SMS exceeds 160 characters (${content.length}/160)`);
      return;
    }
    setError(null);
  }, [name, content, channel, isWhatsapp]);

  const handleSubmit = async () => {
    if (!name || !content) { setError('Name and content are required'); return; }
    if (isWhatsapp) {
      const nameErr = validateWaName(name);
      if (nameErr) { setError(nameErr); return; }
    }
    try {
      const res = await createTemplate.mutateAsync({
        name,
        channel,
        content,
        ...(isWhatsapp ? { category, language } : {}),
      });
      setSaved(true);
      setTimeout(() => onSuccess((res as any)?.id), 800);
    } catch (err) {
      console.error(err);
    }
  };

  const runAi = (topic: string) => {
    setAiLoading(true);
    setShowAiInput(false);
    if (channel === 'SMS') {
      creativeApi.generateCaptions({ clientId: clientId || 0, platform: 'linkedin', goal: 'engagement', topic: `Write a short SMS message (max 160 chars) about: ${topic}`, count: 1 })
        .then(res => { const t = res.data.data.captions[0]?.text; if (t) { setContent(t.slice(0, 160)); toast.success('SMS generated!'); } })
        .catch(() => toast.error('AI generation failed')).finally(() => { setAiLoading(false); setAiTopic(''); });
    } else {
      creativeApi.generateContent({ clientId: clientId || 0, contentType: 'article', topic: `Write a clean, responsive HTML email template with inline styles about: ${topic}. Include header, body paragraphs, and CTA button.`, platform: 'linkedin' })
        .then(res => { if (res.data.data.content) { setContent(res.data.data.content); toast.success('Template generated!'); } })
        .catch(() => toast.error('AI generation failed')).finally(() => { setAiLoading(false); setAiTopic(''); });
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative', cfg.bg)}>
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          {isWhatsapp && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white">
              <Clock className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-zinc-900">Template Saved!</h3>
        {isWhatsapp ? (
          <p className="text-sm text-zinc-500 mt-1 text-center max-w-xs leading-relaxed">
            Submitted to Meta for review. It will appear as <span className="text-amber-600 font-semibold">Pending</span> until approved.
          </p>
        ) : (
          <p className="text-sm text-zinc-500 mt-1">Returning to campaign setup…</p>
        )}
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-400">
      {/* Section header */}
      <div className={cn('flex items-center gap-3 p-4 rounded-2xl border mb-6', cfg.bg, cfg.border)}>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border', cfg.border)}>
          <ChannelIcon className={cn('w-5 h-5', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-zinc-900">New {cfg.name} Template</h3>
          <p className="text-[11px] font-medium text-zinc-500">
            {isWhatsapp
              ? 'Will be submitted to Meta for approval before use'
              : 'Create a reusable message for this campaign'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Template Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 px-0.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => {
              // For WhatsApp, allow live typing but validate
              setName(e.target.value);
            }}
            placeholder={isWhatsapp ? 'e.g. order_shipped or welcome_message' : `e.g. ${cfg.name} Welcome Message`}
            className={cn(
              'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all outline-none shadow-sm',
              isWhatsapp && error && name
                ? 'border-red-300 focus:ring-2 focus:ring-red-500/10 focus:border-red-400'
                : isWhatsapp && name && !validateWaName(name) && name.length >= 3
                ? 'border-green-300 focus:ring-2 focus:ring-green-500/10 focus:border-green-400'
                : 'border-zinc-200 focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900'
            )}
          />
          {isWhatsapp && (
            <p className="text-[10px] text-zinc-400 px-0.5">
              Lowercase letters, numbers, and underscores only (Meta requirement)
            </p>
          )}
        </div>

        {/* WhatsApp — Category + Language */}
        {isWhatsapp && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 px-0.5">
                Category <span className="text-red-500">*</span>
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as WhatsAppTemplateCategory)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 shadow-lg p-1">
                  <SelectItem value="UTILITY" className="text-sm py-2 px-3 rounded-lg focus:bg-zinc-100 cursor-pointer font-medium">
                    Utility
                  </SelectItem>
                  <SelectItem value="MARKETING" className="text-sm py-2 px-3 rounded-lg focus:bg-zinc-100 cursor-pointer font-medium">
                    Marketing
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 px-0.5">
                Language <span className="text-red-500">*</span>
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-sm font-medium shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 shadow-lg p-1 max-h-[240px]">
                  {WHATSAPP_LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value} className="text-sm py-2 px-3 rounded-lg focus:bg-zinc-100 cursor-pointer font-medium">
                      {lang.label}{' '}
                      <span className="text-[10px] text-zinc-400 font-mono">{lang.value}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <label className="text-xs font-semibold text-zinc-600 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Message Content <span className="text-red-500">*</span>
            </label>
            <span className={cn('text-[10px] font-bold tabular-nums', content.length > cfg.maxChars ? 'text-red-500' : 'text-zinc-400')}>
              {content.length}/{cfg.maxChars}
            </span>
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                isWhatsapp
                  ? 'Hi {{1}}, your order {{2}} has been shipped and will arrive by {{3}}.'
                  : channel === 'SMS'
                  ? 'Hi {{name}}, your appointment is on {{date}}. Reply STOP to opt out.'
                  : channel === 'TELEGRAM'
                  ? 'Write your Telegram message here. Markdown supported!'
                  : 'Start typing your message, or use AI to generate one…'
              }
              rows={isWhatsapp ? 5 : channel === 'EMAIL' ? 7 : 5}
              className="w-full px-3.5 py-2.5 pr-12 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none outline-none shadow-sm"
            />

            {/* AI button — skip for WhatsApp */}
            {!isWhatsapp && (
              <button
                type="button"
                title={content ? 'Improve with AI' : 'Write with AI'}
                disabled={aiLoading}
                onClick={() => content.trim() ? runAi(`Rewrite and improve this message: ${content.slice(0, 300)}`) : setShowAiInput(true)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* AI topic popup */}
            {showAiInput && !isWhatsapp && (
              <div className="absolute top-0 left-0 right-0 z-20 bg-white rounded-xl border border-zinc-200 shadow-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Generate with AI
                  </span>
                  <button type="button" onClick={() => setShowAiInput(false)} className="text-zinc-400 hover:text-zinc-700 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder={channel === 'SMS' ? 'e.g. Appointment reminder for tomorrow at 10am' : 'e.g. Welcome email for new subscribers'}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-400 bg-zinc-50"
                  onKeyDown={e => { if (e.key === 'Enter' && aiTopic.trim()) { e.preventDefault(); runAi(aiTopic.trim()); } }}
                />
                <button
                  type="button"
                  disabled={!aiTopic.trim()}
                  onClick={() => runAi(aiTopic.trim())}
                  className="w-full bg-zinc-900 text-white rounded-lg text-xs font-bold py-2 hover:bg-zinc-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Generate
                </button>
              </div>
            )}
          </div>

          {/* WhatsApp variable hint */}
          {isWhatsapp && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-100 animate-in fade-in duration-300">
              <Info className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                Use{' '}
                <code className="bg-green-100 px-1 rounded font-mono text-green-800">{'{{1}}'}</code>,{' '}
                <code className="bg-green-100 px-1 rounded font-mono text-green-800">{'{{2}}'}</code>, etc. for dynamic values — they'll be mapped to CSV columns during campaign setup.
              </p>
            </div>
          )}

          {channel === 'SMS' && (
            <p className="text-[11px] text-zinc-400 px-0.5">Use <code className="bg-zinc-100 px-1 rounded">{'{{name}}'}</code> for personalized variables</p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600 animate-in fade-in duration-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* WhatsApp PENDING notice */}
        {isWhatsapp && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100 animate-in fade-in duration-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
              WhatsApp templates require <span className="font-bold">Meta approval</span> before they can be used in campaigns. Status updates automatically — no manual refresh needed.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
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
          disabled={!!error || !name || !content || createTemplate.isPending}
          className={cn(
            'flex-[2] h-10 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40 transition-all',
            isWhatsapp
              ? 'bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#0c6b60] hover:to-[#1da851] text-white shadow-green-500/20'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          )}
        >
          {createTemplate.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isWhatsapp ? (
            <><SiWhatsapp className="w-3.5 h-3.5 mr-1.5" /> Submit to Meta</>
          ) : (
            <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Save Template</>
          )}
        </Button>
      </div>
    </div>
  );
}
