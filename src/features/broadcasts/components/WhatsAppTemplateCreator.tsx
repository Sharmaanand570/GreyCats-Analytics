import { useState, useEffect } from 'react';
import { useCreateTemplate } from '../hooks/useBroadcasts';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { cn } from '@/lib/utils';

// ─── Meta Language Codes ──────────────────────────────────────────────────────
export const WHATSAPP_LANGUAGES = [
  { label: 'English (US)', value: 'en_US' },
  { label: 'English (UK)', value: 'en_GB' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish (Spain)', value: 'es_ES' },
  { label: 'Spanish (Mexico)', value: 'es_MX' },
  { label: 'Portuguese (Brazil)', value: 'pt_BR' },
  { label: 'French', value: 'fr' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Indonesian', value: 'id' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Gujarati', value: 'gu' },
  { label: 'Bengali', value: 'bn' },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const WA_NAME_REGEX = /^[a-z0-9_]*$/;
const MAX_BODY_CHARS = 1024;

function validateName(name: string): string | null {
  if (!name) return null;
  if (!WA_NAME_REGEX.test(name))
    return 'Only lowercase letters, numbers, and underscores are allowed (e.g. order_shipped)';
  if (name.length < 3) return 'Template name must be at least 3 characters';
  if (name.length > 512) return 'Template name is too long';
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface WhatsAppTemplateCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WhatsAppTemplateCreator({
  isOpen,
  onClose,
}: WhatsAppTemplateCreatorProps) {
  const createTemplate = useCreateTemplate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'UTILITY' | 'MARKETING'>('UTILITY');
  const [language, setLanguage] = useState('en_US');
  const [content, setContent] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Live name validation
  useEffect(() => {
    setNameError(name ? validateName(name) : null);
  }, [name]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName('');
        setCategory('UTILITY');
        setLanguage('en_US');
        setContent('');
        setNameError(null);
        setSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  const canSubmit =
    name.trim().length >= 3 &&
    !nameError &&
    content.trim().length > 0 &&
    content.length <= MAX_BODY_CHARS &&
    !createTemplate.isPending;

  const handleSubmit = async () => {
    const err = validateName(name);
    if (err) { setNameError(err); return; }
    if (!content.trim()) return;

    await createTemplate.mutateAsync({
      name: name.trim(),
      channel: 'WHATSAPP',
      content: content.trim(),
      category,
      language,
    });
    setSubmitted(true);
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-white rounded-2xl border border-zinc-200/60 shadow-xl shadow-zinc-900/5">
          <DialogTitle className="sr-only">WhatsApp Template Submitted</DialogTitle>
          <DialogDescription className="sr-only">Template submitted to Meta for review</DialogDescription>
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Icon stack */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                <SiWhatsapp className="w-9 h-9 text-[#25D366]" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Template Submitted!</h2>
            <p className="text-sm text-zinc-500 font-medium mt-2 leading-relaxed max-w-xs">
              Your template <span className="font-bold text-zinc-800 font-mono">{name}</span> has been sent to Meta for review.
            </p>

            {/* Pending badge */}
            <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 animate-pulse">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest">Pending Meta Approval</span>
            </div>

            {/* Info callout */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-left w-full max-w-sm">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  The Templates tab will automatically refresh every ~12 seconds while your template is pending. You'll see it turn green once Meta approves it.
                </p>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="mt-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-8 h-11 font-bold text-sm"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden bg-white rounded-2xl border border-zinc-200/60 shadow-xl shadow-zinc-900/5">
        <DialogTitle className="sr-only">Create WhatsApp Template</DialogTitle>
        <DialogDescription className="sr-only">Create a new WhatsApp Business message template for Meta review</DialogDescription>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-[#128C7E]/5 via-white to-[#25D366]/5 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#128C7E] to-[#25D366] flex items-center justify-center shadow-lg shadow-green-500/20">
              <SiWhatsapp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">WhatsApp Template</h2>
              <p className="text-sm text-zinc-500 font-medium mt-0.5">Submitted to Meta Business for approval</p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="px-8 py-6 space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto">

          {/* Template Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              id="wa-template-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. order_shipped or welcome_message"
              className={cn(
                'w-full px-4 py-3 bg-zinc-50 border rounded-xl text-sm font-medium transition-all outline-none',
                'focus:bg-white focus:ring-2',
                nameError
                  ? 'border-red-300 focus:ring-red-500/10 focus:border-red-400'
                  : name && !nameError
                  ? 'border-green-300 focus:ring-green-500/10 focus:border-green-400'
                  : 'border-zinc-200 focus:ring-zinc-900/10 focus:border-zinc-900'
              )}
            />
            {/* Live validation feedback */}
            {nameError && (
              <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium">{nameError}</p>
              </div>
            )}
            {name && !nameError && name.length >= 3 && (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <p className="text-xs text-green-600 font-medium">Valid name format</p>
              </div>
            )}
            <p className="text-[11px] text-zinc-400 font-medium">
              Meta requires: lowercase letters, numbers, and underscores only.
            </p>
          </div>

          {/* Category + Language — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                Category <span className="text-red-500">*</span>
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as 'UTILITY' | 'MARKETING')}>
                <SelectTrigger
                  id="wa-template-category"
                  className="h-11 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-sm font-semibold focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 shadow-lg p-1">
                  <SelectItem value="UTILITY" className="text-sm py-2.5 px-3 rounded-lg focus:bg-zinc-100 cursor-pointer font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold">Utility</span>
                      <span className="text-[11px] text-zinc-400">Transactional, account updates</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MARKETING" className="text-sm py-2.5 px-3 rounded-lg focus:bg-zinc-100 cursor-pointer font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold">Marketing</span>
                      <span className="text-[11px] text-zinc-400">Promotions, offers, engagement</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                Language <span className="text-red-500">*</span>
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  id="wa-template-language"
                  className="h-11 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-sm font-semibold focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 shadow-lg p-1 max-h-[260px]">
                  {WHATSAPP_LANGUAGES.map(lang => (
                    <SelectItem
                      key={lang.value}
                      value={lang.value}
                      className="text-sm py-2 px-3 rounded-lg focus:bg-zinc-100 cursor-pointer font-medium"
                    >
                      {lang.label}
                      <span className="ml-2 text-[10px] text-zinc-400 font-mono">{lang.value}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Body Content <span className="text-red-500">*</span>
              </label>
              <span className={cn(
                'text-[10px] font-bold tabular-nums',
                content.length > MAX_BODY_CHARS ? 'text-red-500' : 'text-zinc-400'
              )}>
                {content.length} / {MAX_BODY_CHARS}
              </span>
            </div>
            <textarea
              id="wa-template-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder={"Hi {{1}}, your order {{2}} has been shipped and will arrive by {{3}}. Track it here: {{4}}"}
              className={cn(
                'w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium',
                'focus:bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all outline-none resize-none leading-relaxed'
              )}
            />

            {/* Variables info callout */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-100">
              <Info className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
              <div className="text-[11px] text-green-700 font-medium leading-relaxed">
                <span className="font-bold">Dynamic variables:</span> Use{' '}
                <code className="bg-green-100 px-1 py-0.5 rounded text-green-800 font-mono">{'{{1}}'}</code>,{' '}
                <code className="bg-green-100 px-1 py-0.5 rounded text-green-800 font-mono">{'{{2}}'}</code>, etc. for
                personalized values. These will be mapped to CSV columns when you create a broadcast campaign.
              </div>
            </div>
          </div>

          {/* Category advisory */}
          {category === 'MARKETING' && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100 animate-in fade-in duration-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                <span className="font-bold">Marketing templates</span> require users to have opted-in to receive promotional messages. Meta enforces this strictly.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-zinc-100 bg-zinc-50/40 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={createTemplate.isPending}
            className="h-11 px-6 rounded-xl font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 text-sm"
          >
            Cancel
          </Button>
          <Button
            id="wa-template-submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'h-11 px-8 rounded-xl font-bold text-white text-sm shadow-lg transition-all',
              'bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#0c6b60] hover:to-[#1da851]',
              'disabled:opacity-40 disabled:cursor-not-allowed shadow-green-500/20'
            )}
          >
            {createTemplate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <SiWhatsapp className="w-4 h-4 mr-2" />
                Submit to Meta
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
