import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SiTelegram, SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';
import { useSendTestMessage } from '../hooks/useBroadcasts';
import { useUserStore } from '@/utils/useUserStore';
import type { BroadcastChannel } from '../api/types';
import { cn } from '@/lib/utils';

interface SendTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  campaignName: string;
  channel: BroadcastChannel;
}

export function SendTestModal({
  isOpen,
  onClose,
  campaignId,
  campaignName,
  channel,
}: SendTestModalProps) {
  const { user } = useUserStore();
  const sendTest = useSendTestMessage();
  const [testTo, setTestTo] = useState('');
  const [sent, setSent] = useState(false);

  // Pre-fill with user's own email for quick testing
  useEffect(() => {
    if (isOpen) {
      setSent(false);
      setTestTo(channel === 'EMAIL' ? (user?.email ?? '') : '');
    }
  }, [isOpen, channel, user?.email]);

  const isEmail = channel === 'EMAIL';
  const isSms = channel === 'SMS';
  const isWhatsapp = channel === 'WHATSAPP';
  const isTelegram = channel === 'TELEGRAM';

  const placeholder = isEmail
    ? 'test@example.com'
    : isSms || isWhatsapp
    ? '+1 234 567 890'
    : '@channel or chat ID';

  const label = isEmail
    ? 'Email address'
    : isSms || isWhatsapp
    ? 'Phone number (with country code)'
    : 'Telegram channel / chat ID';

  const ChannelIcon = isEmail
    ? Mail
    : isSms
    ? MessageSquare
    : isWhatsapp
    ? SiWhatsapp
    : SiTelegram;

  const channelColor = isEmail
    ? 'text-blue-600 bg-blue-50'
    : isSms
    ? 'text-orange-600 bg-orange-50'
    : isWhatsapp
    ? 'text-green-600 bg-green-50'
    : 'text-sky-600 bg-sky-50';

  const handleSend = async () => {
    const trimmed = testTo.trim();
    if (!trimmed) {
      toast.error('Please enter a destination address');
      return;
    }

    try {
      await sendTest.mutateAsync({ campaignId, testTo: trimmed });
      setSent(true);
      toast.success(`✅ Test message sent to ${trimmed}`);
      // Auto-close after 1.5s
      setTimeout(onClose, 1500);
    } catch (err: any) {
      const details =
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Unknown error';
      toast.error(`Failed to send test message: ${details}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white rounded-2xl border border-zinc-200/60 shadow-xl shadow-zinc-900/5">
        <DialogTitle className="sr-only">Send Test Message</DialogTitle>
        <DialogDescription className="sr-only">
          Send a single test message to verify your campaign content
        </DialogDescription>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', channelColor)}>
              <ChannelIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight leading-tight">
                Send Test Message
              </h2>
              <p className="text-xs font-medium text-zinc-500 mt-0.5 truncate max-w-[260px]">
                Campaign: {campaignName}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {sent ? (
            <div className="flex flex-col items-center py-6 gap-3 animate-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-zinc-900">Sent successfully!</p>
              <p className="text-xs text-zinc-400 font-medium">Closing…</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  Send a test to…
                </label>
                <Input
                  id="send-test-input"
                  placeholder={placeholder}
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  autoFocus
                  className="h-11 px-4 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm font-medium transition-all"
                />
                <p className="text-[11px] text-zinc-400 font-medium px-1">{label}</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Send className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  This sends <strong>one real message</strong> using the campaign's actual gateway and template. Standard messaging costs apply.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="px-6 py-4 bg-white border-t border-zinc-100 flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={sendTest.isPending}
              className="h-9 px-5 rounded-lg font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendTest.isPending || !testTo.trim()}
              id="send-test-submit-btn"
              className="h-9 px-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
            >
              {sendTest.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
