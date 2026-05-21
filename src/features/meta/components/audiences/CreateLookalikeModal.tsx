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
import { AlertCircle, Sparkles } from "lucide-react";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  useAudiences,
  useCreateLookalikeAudience,
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

// Common country codes — the most-used 12 cover ~80% of campaigns. Users can
// also type a 2-letter ISO code directly into the input below.
const COMMON_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
];

type Ratio = 0.01 | 0.02 | 0.05 | 0.1;

const RATIO_OPTIONS: { value: Ratio; label: string; hint: string }[] = [
  { value: 0.01, label: "1%", hint: "Closest match to source — smallest audience" },
  { value: 0.02, label: "2%", hint: "Strong match, modest reach" },
  { value: 0.05, label: "5%", hint: "Looser match, broader reach" },
  { value: 0.1, label: "10%", hint: "Broadest reach, weakest similarity" },
];

export function CreateLookalikeModal({ open, clientId, onClose }: Props) {
  const [name, setName] = useState("");
  const [sourceAudienceId, setSourceAudienceId] = useState("");
  const [country, setCountry] = useState("US");
  const [ratio, setRatio] = useState<Ratio>(0.01);
  const [touchedName, setTouchedName] = useState(false);
  const [touchedSource, setTouchedSource] = useState(false);
  const [touchedCountry, setTouchedCountry] = useState(false);

  const hasNameError = touchedName && !name.trim();
  const hasSourceError = touchedSource && !sourceAudienceId;
  const hasCountryError = touchedCountry && !/^[A-Z]{2}$/.test(country.toUpperCase());

  const { data: audiencesData, isLoading: isLoadingAudiences } = useAudiences(
    open ? clientId : null
  );
  // Can't lookalike a lookalike. Filter to seedable types only.
  const seedAudiences = useMemo(
    () => (audiencesData?.audiences ?? []).filter((a) => a.type !== "LOOKALIKE"),
    [audiencesData]
  );
  const { mutateAsync: createLookalike, isPending } = useCreateLookalikeAudience();

  const canSubmit =
    name.trim().length > 0 &&
    !!sourceAudienceId &&
    /^[A-Z]{2}$/.test(country.toUpperCase()) &&
    !isPending;

  const reset = () => {
    setName("");
    setSourceAudienceId("");
    setCountry("US");
    setRatio(0.01);
    setTouchedName(false);
    setTouchedSource(false);
    setTouchedCountry(false);
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createLookalike({
        clientId,
        name: name.trim(),
        sourceAudienceId,
        country: country.toUpperCase(),
        ratio,
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
            <Sparkles className="w-5 h-5 text-violet-600" /> Lookalike Audience
          </DialogTitle>
          <DialogDescription>
            Meta finds new people who behave like your source audience. Use a customer list or
            website-traffic audience as the seed.
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
              placeholder="e.g. Lookalike of top customers - US 1%"
              className={`h-11 rounded-xl border-slate-200 ${hasNameError ? 'border-rose-400' : ''}`}
              disabled={isPending}
            />
            {hasNameError && <FieldError message="Audience name is required." />}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              Source audience <RequiredMark />
            </label>
            {isLoadingAudiences ? (
              <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
            ) : seedAudiences.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5" />
                No customer-list or website-traffic audiences to seed from. Create one first.
              </div>
            ) : (
              <>
                <Select
                  value={sourceAudienceId}
                  onValueChange={(v) => { setTouchedSource(true); setSourceAudienceId(v); }}
                  disabled={isPending}
                >
                  <SelectTrigger className={`h-11 rounded-xl border-slate-200 bg-white ${hasSourceError ? 'border-rose-400' : ''}`}>
                    <SelectValue placeholder="Pick a seed audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {seedAudiences.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex flex-col items-start py-0.5">
                          <span className="font-semibold text-sm">{a.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {a.type}
                            {a.approxSize !== undefined && ` · ${a.approxSize.toLocaleString()} people`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasSourceError && <FieldError message="Please select a source audience." />}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                Country <RequiredMark />
              </label>
              <Select
                value={
                  COMMON_COUNTRIES.find((c) => c.code === country.toUpperCase())
                    ? country.toUpperCase()
                    : "__custom"
                }
                onValueChange={(v) => {
                  if (v !== "__custom") setCountry(v);
                }}
                disabled={isPending}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="font-mono text-xs mr-2">{c.code}</span>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom">
                    <span className="text-slate-500 text-xs">Other (type below)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={country}
                onChange={(e) => { setTouchedCountry(true); setCountry(e.target.value.slice(0, 2).toUpperCase()); }}
                onBlur={() => setTouchedCountry(true)}
                placeholder="ISO 2-letter"
                maxLength={2}
                disabled={isPending}
                className={`h-9 rounded-xl border-slate-200 font-mono text-center text-xs ${hasCountryError ? 'border-rose-400' : ''}`}
              />
              {hasCountryError && <FieldError message="Enter a valid 2-letter country code (e.g. US, GB)." />}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                Match ratio <RequiredMark />
              </label>
              <Select
                value={String(ratio)}
                onValueChange={(v) => setRatio(Number(v) as Ratio)}
                disabled={isPending}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATIO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      <div className="flex flex-col items-start py-0.5">
                        <span className="font-semibold text-sm">{opt.label}</span>
                        <span className="text-[11px] text-slate-500">{opt.hint}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isPending ? "Provisioning…" : "Create lookalike"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
