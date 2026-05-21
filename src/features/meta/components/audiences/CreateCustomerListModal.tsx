import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { RequiredMark } from "@/components/ui/required-mark";
import { useCreateCustomerListAudience } from "@/features/meta/hooks/useMetaAdsManager";

// CSVs of customer emails tend to be small. 10 MB is way more than a typical
// upload (~150k email rows) and well under any browser hang threshold.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

type Props = {
  open: boolean;
  clientId: number;
  onClose: () => void;
};

// Pulled out so we can unit-test independently if needed. Strips whitespace,
// lowercases, dedupes, and filters anything that doesn't look like an email.
// Meta hashes server-side, so we send plain strings — but we still scrub
// obvious junk so the API doesn't reject the whole batch.
const parseEmails = (raw: string): string[] => {
  const tokens = raw
    .split(/[\n,;]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t));
  return Array.from(new Set(tokens));
};

export function CreateCustomerListModal({ open, clientId, onClose }: Props) {
  const [name, setName] = useState("");
  const [emailText, setEmailText] = useState("");
  const [touchedName, setTouchedName] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: createAudience, isPending } = useCreateCustomerListAudience();

  const hasNameError = touchedName && !name.trim();

  const emails = parseEmails(emailText);
  const canSubmit = name.trim().length > 0 && emails.length > 0 && !isPending;

  const reset = () => {
    setName("");
    setEmailText("");
    setTouchedName(false);
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB) — max ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)} MB.`
      );
      return;
    }
    try {
      const text = await file.text();
      setEmailText((prev) => (prev ? `${prev}\n${text}` : text));
    } catch {
      // file.text() rejects on read failure or encoding issues — surface a
      // toast instead of leaving an uncaught promise.
      toast.error("Couldn't read that file. Try a plain UTF-8 .csv or .txt.");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createAudience({ clientId, name: name.trim(), emails });
      reset();
      onClose();
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Upload Customer List
          </DialogTitle>
          <DialogDescription>
            Upload a list of customer emails to retarget. The backend hashes them with
            SHA-256 before sending to Meta — raw emails never leave our infrastructure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              Audience name <RequiredMark />
            </label>
            <Input
              value={name}
              onChange={(e) => { setTouchedName(true); setName(e.target.value); }}
              onBlur={() => setTouchedName(true)}
              placeholder="e.g. VIP customers Q1 2026"
              className={`h-11 rounded-xl border-slate-200 ${hasNameError ? 'border-rose-400' : ''}`}
              disabled={isPending}
            />
            {hasNameError && <FieldError message="Audience name is required." />}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                Emails <RequiredMark />
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {emails.length} valid
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={isPending}
                  className="h-7 text-xs gap-1.5"
                >
                  <Upload className="w-3 h-3" /> CSV / TXT
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt,text/csv,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="one@example.com&#10;two@example.com&#10;three@example.com"
              rows={6}
              disabled={isPending}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:bg-slate-50"
            />
            <p className="text-xs text-slate-400">
              Paste one email per line, or comma/semicolon-separated. Invalid lines are skipped.
            </p>
          </div>

          {emailText.trim().length > 0 && emails.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5" />
              No valid email addresses found. Check formatting.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isPending ? "Uploading…" : `Create audience (${emails.length} contacts)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
