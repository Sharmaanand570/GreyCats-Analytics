import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Globe, Plus, Trash2 } from "lucide-react";
import { RequiredMark } from "@/components/ui/required-mark";
import { isValidHttpUrl } from "@/lib/url";
import {
  useCreateWebsiteTrafficAudience,
  useMetaPixels,
} from "@/features/meta/hooks/useMetaAdsManager";

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

const RETENTION_PRESETS = [7, 14, 30, 60, 90, 180];

const PIXEL_EVENT_OPTIONS = [
  { value: "PageView", label: "Page View", hint: "Anyone who loaded the page" },
  { value: "ViewContent", label: "View Content", hint: "Viewed a product / article" },
  { value: "AddToCart", label: "Add to Cart", hint: "Added something to cart" },
  { value: "InitiateCheckout", label: "Initiate Checkout", hint: "Started checkout flow" },
  { value: "Purchase", label: "Purchase", hint: "Completed a purchase" },
  { value: "Lead", label: "Lead", hint: "Submitted a lead form" },
];

type Rule = { event: string; url: string };

const blankRule = (): Rule => ({ event: "PageView", url: "" });

export function CreateWebsiteTrafficModal({ open, clientId, onClose }: Props) {
  const [name, setName] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [retentionDays, setRetentionDays] = useState(30);
  const [rules, setRules] = useState<Rule[]>([blankRule()]);
  const [touchedName, setTouchedName] = useState(false);
  const [touchedPixel, setTouchedPixel] = useState(false);

  const hasNameError = touchedName && !name.trim();
  const hasPixelError = touchedPixel && !pixelId;

  // Per-rule URL validity — accept either a path fragment ("/pricing") or a
  // full URL; only flag if the user typed a full-looking URL that doesn't
  // parse. We don't insist on absolute URLs because Meta's `url contains`
  // operator commonly matches path substrings.
  const ruleUrlInvalid = (url: string) => {
    const t = url.trim();
    if (!t) return false;
    // Heuristic: if it looks like the user intended a full URL (starts with
    // http or has a scheme separator), validate it strictly. Otherwise treat
    // as a substring matcher and accept.
    if (/^https?:\/\//i.test(t) || /:\/\//.test(t)) return !isValidHttpUrl(t);
    return false;
  };

  // Flag duplicate (event, url) rules — Meta dedupes them server-side but
  // showing the duplicate up front avoids confusion when the saved audience
  // has fewer rules than the user added.
  const duplicateIndices = useMemo(() => {
    const seen = new Map<string, number>();
    const dupes = new Set<number>();
    rules.forEach((r, i) => {
      const key = `${r.event}::${r.url.trim().toLowerCase()}`;
      const first = seen.get(key);
      if (first !== undefined) {
        dupes.add(i);
        dupes.add(first);
      } else {
        seen.set(key, i);
      }
    });
    return dupes;
  }, [rules]);

  const { data: pixelsData, isLoading: isLoadingPixels } = useMetaPixels(
    open ? clientId : null
  );
  const pixels = useMemo(() => pixelsData?.pixels ?? [], [pixelsData]);
  const { mutateAsync: createAudience, isPending } = useCreateWebsiteTrafficAudience();

  const canSubmit =
    name.trim().length > 0 &&
    !!pixelId &&
    retentionDays >= 1 &&
    retentionDays <= 180 &&
    rules.length > 0 &&
    !isPending;

  const reset = () => {
    setName("");
    setPixelId("");
    setRetentionDays(30);
    setRules([blankRule()]);
    setTouchedName(false);
    setTouchedPixel(false);
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  const updateRule = (idx: number, patch: Partial<Rule>) =>
    setRules((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addRule = () => setRules((rs) => [...rs, blankRule()]);
  const removeRule = (idx: number) => setRules((rs) => rs.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createAudience({
        clientId,
        name: name.trim(),
        pixelId,
        retentionDays,
        rules: rules.map((r) => ({
          event: r.event,
          ...(r.url.trim() ? { url: r.url.trim() } : {}),
        })),
      });
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
            <Globe className="w-5 h-5 text-blue-600" /> Website Traffic Audience
          </DialogTitle>
          <DialogDescription>
            Build a retargeting audience from visitors who triggered specific Pixel events on
            your site within a recent time window.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              Audience name <RequiredMark />
            </label>
            <Input
              value={name}
              onChange={(e) => { setTouchedName(true); setName(e.target.value); }}
              onBlur={() => setTouchedName(true)}
              placeholder="e.g. Recent product viewers"
              className={`h-11 rounded-xl border-slate-200 ${hasNameError ? 'border-rose-400' : ''}`}
              disabled={isPending}
            />
            {hasNameError && <FieldError message="Audience name is required." />}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              Meta Pixel <RequiredMark />
            </label>
            {isLoadingPixels ? (
              <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
            ) : pixels.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5" />
                No Pixels attached to this ad account. Create one in Meta Events Manager.
              </div>
            ) : (
              <>
                <Select value={pixelId} onValueChange={(v) => { setTouchedPixel(true); setPixelId(v); }} disabled={isPending}>
                  <SelectTrigger className={`h-11 rounded-xl border-slate-200 bg-white ${hasPixelError ? 'border-rose-400' : ''}`}>
                    <SelectValue placeholder="Select a pixel" />
                  </SelectTrigger>
                  <SelectContent>
                    {pixels.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-semibold text-sm">{p.name}</span>
                        <span className="ml-2 text-[10px] text-slate-400 font-mono">{p.id}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasPixelError && <FieldError message="Please select a Meta Pixel." />}
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Retention
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RETENTION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setRetentionDays(d)}
                  disabled={isPending}
                  className={
                    retentionDays === d
                      ? "px-3 h-9 rounded-lg bg-slate-900 text-white text-xs font-bold border border-slate-900"
                      : "px-3 h-9 rounded-lg bg-white text-slate-600 text-xs font-bold border border-slate-200 hover:border-slate-300"
                  }
                >
                  {d}d
                </button>
              ))}
              <Input
                type="number"
                min={1}
                max={180}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Math.max(1, Math.min(180, Number(e.target.value) || 0)))}
                disabled={isPending}
                className="h-9 w-20 rounded-lg border-slate-200 text-xs text-center"
              />
            </div>
            <p className="text-xs text-slate-400">
              How long to keep visitors in the audience after they trigger an event. Meta caps at 180 days.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                Trigger rules <RequiredMark />
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addRule}
                disabled={isPending}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" /> Add rule
              </Button>
            </div>
            <div className="space-y-2">
              {rules.map((rule, idx) => {
                const isDupe = duplicateIndices.has(idx);
                const urlBad = ruleUrlInvalid(rule.url);
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border bg-slate-50/40 p-3 space-y-2 ${
                      isDupe ? "border-amber-300" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Select
                        value={rule.event}
                        onValueChange={(v) => updateRule(idx, { event: v })}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PIXEL_EVENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex flex-col items-start py-0.5">
                                <span className="font-semibold text-xs">{opt.label}</span>
                                <span className="text-[10px] text-slate-500">{opt.hint}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRule(idx)}
                          disabled={isPending}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-md hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Input
                      value={rule.url}
                      onChange={(e) => updateRule(idx, { url: e.target.value })}
                      placeholder="URL contains (optional, e.g. /pricing)"
                      disabled={isPending}
                      className={`h-9 rounded-lg border-slate-200 text-xs ${urlBad ? "border-rose-300" : ""}`}
                    />
                    {urlBad && (
                      <p className="text-[11px] text-rose-600">
                        That looks like a full URL but doesn't parse — use http(s):// or a path
                        fragment like /pricing.
                      </p>
                    )}
                    {isDupe && (
                      <p className="text-[11px] text-amber-700">
                        Duplicate of another rule — Meta will collapse them.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Creating…" : "Create audience"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
