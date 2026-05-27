import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Phone,
  Pin,
  PinOff,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Youtube,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AdPreviewPanel } from "./AdPreviewPanel";
import {
  CTA_OPTIONS,
  DESCRIPTION_PIN_OPTIONS,
  MAX_DISPLAY_BUSINESS_NAME_LEN,
  MAX_DISPLAY_DESCRIPTIONS,
  MAX_DISPLAY_DESCRIPTION_LEN,
  MAX_DISPLAY_HEADLINES,
  MAX_DISPLAY_HEADLINE_LEN,
  MAX_DISPLAY_IMAGES,
  MAX_DISPLAY_LOGOS,
  MAX_DISPLAY_LONG_HEADLINE_LEN,
  MAX_DISPLAY_VIDEOS,
  MAX_RSA_DESCRIPTIONS,
  MAX_RSA_DESCRIPTION_LEN,
  MAX_RSA_HEADLINES,
  MAX_RSA_HEADLINE_LEN,
  MAX_RSA_PATH_LEN,
  MIN_RSA_DESCRIPTIONS,
  MIN_RSA_HEADLINES,
  PIN_POSITION_OPTIONS,
  type StepProps,
} from "./types";
import type {
  DisplayImageAsset,
  PinPosition,
  RsaDescription,
  RsaHeadline,
} from "../../API/googleAdsManagerApi";

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

function AdUrlOptionsSection({
  form,
  setForm,
}: {
  form: any;
  setForm: any;
}) {
  const [expanded, setExpanded] = useState(false);

  const addParam = () => {
    setForm((f: any) => ({
      ...f,
      customParameters: [...f.customParameters, { key: "", value: "" }],
    }));
  };

  const removeParam = (idx: number) => {
    setForm((f: any) => ({
      ...f,
      customParameters: f.customParameters.filter((_: any, i: number) => i !== idx),
    }));
  };

  const updateParam = (idx: number, patch: { key?: string; value?: string }) => {
    setForm((f: any) => ({
      ...f,
      customParameters: f.customParameters.map((p: any, i: number) =>
        i === idx ? { ...p, ...patch } : p
      ),
    }));
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm font-bold text-slate-900"
      >
        <span className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
          Ad URL options
        </span>
        <span className="text-xs text-[#1A73E8] hover:underline font-semibold">
          {expanded ? "Hide URL options" : "Show URL options"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Tracking template
            </label>
            <Input
              value={form.trackingTemplate}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, trackingTemplate: e.target.value }))
              }
              placeholder="e.g. {lpurl}?utm_source=google&utm_medium=cpc"
              className="h-10 rounded-lg border-slate-200 bg-white text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Final URL suffix
            </label>
            <Input
              value={form.finalUrlSuffix}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, finalUrlSuffix: e.target.value }))
              }
              placeholder="e.g. utm_campaign=summer-sale"
              className="h-10 rounded-lg border-slate-200 bg-white text-xs"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Custom parameters
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={addParam}
                className="h-7 rounded-lg border-slate-200 text-[10px] font-bold gap-1 px-2.5"
              >
                <Plus className="w-3 h-3" />
                Add parameter
              </Button>
            </div>

            {form.customParameters.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No custom parameters added yet.</p>
            ) : (
              <div className="space-y-2">
                {form.customParameters.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={p.key}
                      onChange={(e) => updateParam(idx, { key: e.target.value })}
                      placeholder="Name"
                      className="h-9 rounded-lg border-slate-200 bg-white text-xs"
                    />
                    <span className="text-slate-400 text-xs font-bold">=</span>
                    <Input
                      value={p.value}
                      onChange={(e) => updateParam(idx, { value: e.target.value })}
                      placeholder="Value"
                      className="h-9 rounded-lg border-slate-200 bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeParam(idx)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  return (
    <span
      className={cn(
        "text-[10px] font-mono",
        over ? "text-rose-600 font-bold" : "text-slate-400"
      )}
    >
      {len}/{max}
    </span>
  );
}

function RsaAssetsSelector({ form, setForm }: { form: any; setForm: any }) {
  const updateSitelink = (idx: number, patch: Partial<{ text: string; line1: string; line2: string; url: string }>) => {
    setForm((f: any) => ({
      ...f,
      rsaSitelinks: f.rsaSitelinks.map((s: any, i: number) =>
        i === idx ? { ...s, ...patch } : s
      ),
    }));
  };

  const updateCallout = (idx: number, value: string) => {
    setForm((f: any) => ({
      ...f,
      rsaCallouts: f.rsaCallouts.map((c: any, i: number) => (i === idx ? value : c)),
    }));
  };

  const updateSnippetValue = (idx: number, value: string) => {
    setForm((f: any) => ({
      ...f,
      rsaSnippetsValues: f.rsaSnippetsValues.map((v: any, i: number) => (i === idx ? value : v)),
    }));
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
        Ad assets (Recommended)
        <span className="text-[10px] text-slate-400 font-normal normal-case ml-1">
          Add assets to get up to 15% higher click-through rate
        </span>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Sitelinks */}
        <AccordionItem value="sitelinks" className="border-b border-slate-100">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
              Sitelinks
              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                ({form.rsaSitelinks.filter((s: any) => s.text.trim() && s.url.trim()).length}/4 added)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <p className="text-[11px] text-slate-500 mb-2">
              Add links to specific pages on your website. You need at least 2 for them to show, up to 4.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.rsaSitelinks.map((s: any, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-slate-50/40 space-y-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sitelink {idx + 1}
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Link text</label>
                      <Input
                        value={s.text}
                        onChange={(e) => updateSitelink(idx, { text: e.target.value })}
                        placeholder="e.g. Contact Us"
                        className="h-8 rounded-lg border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Description Line 1</label>
                      <Input
                        value={s.line1}
                        onChange={(e) => updateSitelink(idx, { line1: e.target.value })}
                        placeholder="e.g. Get in touch with our team"
                        className="h-8 rounded-lg border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Description Line 2</label>
                      <Input
                        value={s.line2}
                        onChange={(e) => updateSitelink(idx, { line2: e.target.value })}
                        placeholder="e.g. We are available 24/7"
                        className="h-8 rounded-lg border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Final URL</label>
                      <Input
                        value={s.url}
                        onChange={(e) => updateSitelink(idx, { url: e.target.value })}
                        placeholder="https://example.com/contact"
                        className="h-8 rounded-lg border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Callouts */}
        <AccordionItem value="callouts" className="border-b border-slate-100">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Type className="w-4 h-4 text-slate-400 shrink-0" />
              Callouts
              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                ({form.rsaCallouts.filter(Boolean).length}/4 added)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <p className="text-[11px] text-slate-500 mb-2">
              Add popular or unique aspects of your business, like "Free shipping" or "24/7 customer support".
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {form.rsaCallouts.map((c: string, idx: number) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Callout {idx + 1}</label>
                  <Input
                    value={c}
                    onChange={(e) => updateCallout(idx, e.target.value)}
                    placeholder="e.g. Free Shipping"
                    className="h-8 rounded-lg border-slate-200 bg-white text-xs"
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Structured Snippets */}
        <AccordionItem value="snippets" className="border-b border-slate-100">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Type className="w-4 h-4 text-slate-400 shrink-0" />
              Structured snippets
              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                ({form.rsaSnippetsValues.filter(Boolean).length}/3 added)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <p className="text-[11px] text-slate-500 mb-2">
              Highlight specific aspects of your products or services under a structured header.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Header type</label>
                <Select
                  value={form.rsaSnippetsHeader}
                  onValueChange={(v) => setForm((f: any) => ({ ...f, rsaSnippetsHeader: v }))}
                >
                  <SelectTrigger className="h-9 rounded-lg border-slate-200 bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Amenities", "Brands", "Courses", "Degrees", "Destinations", "Featured hotels", "Insurance coverage", "Models", "Neighborhoods", "Service catalog", "Shows", "Styles", "Types"].map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {form.rsaSnippetsValues.map((v: string, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Value {idx + 1}</label>
                    <Input
                      value={v}
                      onChange={(e) => updateSnippetValue(idx, e.target.value)}
                      placeholder="e.g. Organic, Non-GMO"
                      className="h-8 rounded-lg border-slate-200 bg-white text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Call Extension */}
        <AccordionItem value="call" className="border-0">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              Call extension
              {form.rsaCallPhoneNumber.trim() && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-2">
                  Enabled
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-2 space-y-4">
            <p className="text-[11px] text-slate-500 mb-2">
              Encourage people to call your business by showing your phone number with your ads.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Country Code</label>
                <Select
                  value={form.rsaCallCountryCode}
                  onValueChange={(v) => setForm((f: any) => ({ ...f, rsaCallCountryCode: v }))}
                >
                  <SelectTrigger className="h-9 rounded-lg border-slate-200 bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { code: "US", label: "United States (+1)" },
                      { code: "GB", label: "United Kingdom (+44)" },
                      { code: "CA", label: "Canada (+1)" },
                      { code: "AU", label: "Australia (+61)" },
                      { code: "IN", label: "India (+91)" },
                      { code: "DE", label: "Germany (+49)" },
                      { code: "FR", label: "France (+33)" },
                    ].map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Phone number</label>
                <Input
                  value={form.rsaCallPhoneNumber}
                  onChange={(e) => setForm((f: any) => ({ ...f, rsaCallPhoneNumber: e.target.value }))}
                  placeholder="e.g. 555-0199"
                  className="h-9 rounded-lg border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ─── RSA section ────────────────────────────────────────────────────────────

function RsaCreator({ form, setForm, showAllErrors }: StepProps) {
  const updateHeadline = (idx: number, patch: Partial<RsaHeadline>) => {
    setForm((f) => ({
      ...f,
      rsaHeadlines: f.rsaHeadlines.map((h, i) =>
        i === idx ? { ...h, ...patch } : h
      ),
    }));
  };
  const updateDescription = (idx: number, patch: Partial<RsaDescription>) => {
    setForm((f) => ({
      ...f,
      rsaDescriptions: f.rsaDescriptions.map((d, i) =>
        i === idx ? { ...d, ...patch } : d
      ),
    }));
  };
  const addHeadline = () => {
    if (form.rsaHeadlines.length >= MAX_RSA_HEADLINES) return;
    setForm((f) => ({
      ...f,
      rsaHeadlines: [...f.rsaHeadlines, { text: "", pin: "UNPINNED" as PinPosition }],
    }));
  };
  const removeHeadline = (idx: number) => {
    if (form.rsaHeadlines.length <= MIN_RSA_HEADLINES) return;
    setForm((f) => ({
      ...f,
      rsaHeadlines: f.rsaHeadlines.filter((_, i) => i !== idx),
    }));
  };
  const addDescription = () => {
    if (form.rsaDescriptions.length >= MAX_RSA_DESCRIPTIONS) return;
    setForm((f) => ({
      ...f,
      rsaDescriptions: [
        ...f.rsaDescriptions,
        { text: "", pin: "UNPINNED" as Exclude<PinPosition, "POSITION_3"> },
      ],
    }));
  };
  const removeDescription = (idx: number) => {
    if (form.rsaDescriptions.length <= MIN_RSA_DESCRIPTIONS) return;
    setForm((f) => ({
      ...f,
      rsaDescriptions: f.rsaDescriptions.filter((_, i) => i !== idx),
    }));
  };

  const validHeadlines = form.rsaHeadlines.filter(
    (h) => h.text.trim() && h.text.length <= MAX_RSA_HEADLINE_LEN
  );
  const validDescriptions = form.rsaDescriptions.filter(
    (d) => d.text.trim() && d.text.length <= MAX_RSA_DESCRIPTION_LEN
  );
  const finalUrlMissing = !!showAllErrors && !form.rsaFinalUrl.trim();
  const headlinesShort =
    !!showAllErrors && validHeadlines.length < MIN_RSA_HEADLINES;
  const descriptionsShort =
    !!showAllErrors && validDescriptions.length < MIN_RSA_DESCRIPTIONS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Form column */}
      <div className="space-y-6 min-w-0">
        {/* Final URL & display paths */}
        <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
            Final URL & Paths
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Final URL
            </label>
            <Input
              value={form.rsaFinalUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, rsaFinalUrl: e.target.value }))
              }
              placeholder="https://example.com/landing"
              className={cn(
                "h-11 rounded-xl border-slate-200 bg-white",
                finalUrlMissing && "border-rose-400"
              )}
            />
            {finalUrlMissing && <FieldError message="Final URL is required." />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Display path 1
                </label>
                <CharCounter value={form.rsaPath1} max={MAX_RSA_PATH_LEN} />
              </div>
              <Input
                value={form.rsaPath1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rsaPath1: e.target.value }))
                }
                placeholder="hiking-gear"
                className="h-10 rounded-lg border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Display path 2
                </label>
                <CharCounter value={form.rsaPath2} max={MAX_RSA_PATH_LEN} />
              </div>
              <Input
                value={form.rsaPath2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rsaPath2: e.target.value }))
                }
                placeholder="backpacks"
                className="h-10 rounded-lg border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Headlines */}
        <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Type className="w-5 h-5 text-slate-400 shrink-0" />
              Headlines
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ({validHeadlines.length}/{MAX_RSA_HEADLINES} · min {MIN_RSA_HEADLINES})
              </span>
            </div>
            {form.rsaHeadlines.length < MAX_RSA_HEADLINES && (
              <Button
                type="button"
                variant="outline"
                onClick={addHeadline}
                className="h-8 rounded-lg border-slate-200 text-xs font-bold gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {form.rsaHeadlines.map((h, idx) => {
              const over = h.text.length > MAX_RSA_HEADLINE_LEN;
              const isPinned = h.pin !== "UNPINNED";
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border bg-white p-2",
                    over ? "border-rose-300" : "border-slate-200"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <Input
                      value={h.text}
                      onChange={(e) =>
                        updateHeadline(idx, { text: e.target.value })
                      }
                      placeholder={`Headline ${idx + 1}`}
                      className="h-9 rounded-lg border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-[#1A73E8]"
                    />
                  </div>
                  <CharCounter value={h.text} max={MAX_RSA_HEADLINE_LEN} />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all",
                          isPinned
                            ? "border-[#1A73E8] bg-blue-50/60 text-[#1A73E8]"
                            : "border-slate-200 text-slate-400 hover:bg-slate-50"
                        )}
                        title={isPinned ? `Pinned to ${h.pin}` : "Unpinned"}
                      >
                        {isPinned ? (
                          <Pin className="w-3.5 h-3.5" />
                        ) : (
                          <PinOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-1" align="end">
                      {PIN_POSITION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateHeadline(idx, { pin: opt.value })}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors",
                            h.pin === opt.value
                              ? "bg-[#1A73E8] text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  {form.rsaHeadlines.length > MIN_RSA_HEADLINES && (
                    <button
                      type="button"
                      onClick={() => removeHeadline(idx)}
                      className="shrink-0 text-slate-300 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {headlinesShort && (
            <FieldError
              message={`Add at least ${MIN_RSA_HEADLINES} headlines (each ≤ ${MAX_RSA_HEADLINE_LEN} characters).`}
            />
          )}
        </div>

        {/* Descriptions */}
        <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Type className="w-5 h-5 text-slate-400 shrink-0" />
              Descriptions
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ({validDescriptions.length}/{MAX_RSA_DESCRIPTIONS} · min {MIN_RSA_DESCRIPTIONS})
              </span>
            </div>
            {form.rsaDescriptions.length < MAX_RSA_DESCRIPTIONS && (
              <Button
                type="button"
                variant="outline"
                onClick={addDescription}
                className="h-8 rounded-lg border-slate-200 text-xs font-bold gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {form.rsaDescriptions.map((d, idx) => {
              const over = d.text.length > MAX_RSA_DESCRIPTION_LEN;
              const isPinned = d.pin !== "UNPINNED";
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-2 rounded-xl border bg-white p-2",
                    over ? "border-rose-300" : "border-slate-200"
                  )}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <Input
                      value={d.text}
                      onChange={(e) =>
                        updateDescription(idx, { text: e.target.value })
                      }
                      placeholder={`Description ${idx + 1}`}
                      className="h-9 rounded-lg border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-[#1A73E8]"
                    />
                  </div>
                  <CharCounter value={d.text} max={MAX_RSA_DESCRIPTION_LEN} />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all",
                          isPinned
                            ? "border-[#1A73E8] bg-blue-50/60 text-[#1A73E8]"
                            : "border-slate-200 text-slate-400 hover:bg-slate-50"
                        )}
                      >
                        {isPinned ? (
                          <Pin className="w-3.5 h-3.5" />
                        ) : (
                          <PinOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-1" align="end">
                      {DESCRIPTION_PIN_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            updateDescription(idx, { pin: opt.value })
                          }
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded text-xs font-semibold transition-colors",
                            d.pin === opt.value
                              ? "bg-[#1A73E8] text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  {form.rsaDescriptions.length > MIN_RSA_DESCRIPTIONS && (
                    <button
                      type="button"
                      onClick={() => removeDescription(idx)}
                      className="shrink-0 text-slate-300 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {descriptionsShort && (
            <FieldError
              message={`Add at least ${MIN_RSA_DESCRIPTIONS} descriptions (each ≤ ${MAX_RSA_DESCRIPTION_LEN} characters).`}
            />
          )}
        </div>

        {/* Ad Assets (Extensions) Panel */}
        <RsaAssetsSelector form={form} setForm={setForm} />

        {/* Ad URL Options */}
        <AdUrlOptionsSection form={form} setForm={setForm} />
      </div>

      {/* Sticky preview */}
      <div className="lg:sticky lg:top-24 self-start space-y-3">
        <div className="bg-white border border-slate-200/80 rounded-[12px] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            Preview
          </div>
          <AdPreviewPanel
            finalUrl={form.rsaFinalUrl}
            path1={form.rsaPath1}
            path2={form.rsaPath2}
            headlines={form.rsaHeadlines}
            descriptions={form.rsaDescriptions}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Display section ────────────────────────────────────────────────────────

function ImageAssetGrid({
  assets,
  onChange,
  max,
  aspect,
  label,
}: {
  assets: DisplayImageAsset[];
  onChange: (next: DisplayImageAsset[]) => void;
  max: number;
  aspect: "LANDSCAPE" | "SQUARE";
  label: string;
}) {
  const [draftUrl, setDraftUrl] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    const url = draftUrl.trim();
    if (!url || assets.length >= max) return;
    onChange([...assets, { url, aspect }]);
    setDraftUrl("");
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = max - assets.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newAssets: DisplayImageAsset[] = [];
    let loaded = 0;
    toAdd.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (url) newAssets.push({ url, aspect });
        loaded++;
        if (loaded === toAdd.length) {
          onChange([...assets, ...newAssets]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (i: number) => {
    onChange(assets.filter((_, idx) => idx !== i));
  };

  const aspectClass =
    aspect === "LANDSCAPE" ? "aspect-[1.91/1]" : "aspect-square";

  const canAdd = assets.length < max;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {label} ({assets.length}/{max})
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {aspect === "LANDSCAPE" ? "1.91 : 1" : "1 : 1"}
        </span>
      </div>

      {/* Drag-and-drop zone */}
      {canAdd && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full rounded-xl border-2 border-dashed px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
            isDraggingOver
              ? "border-[#1A73E8] bg-blue-50/50 scale-[1.01]"
              : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-100/60"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isDraggingOver ? "bg-[#1A73E8] text-white" : "bg-slate-200 text-slate-500"
            )}
          >
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-700">
              {isDraggingOver ? "Drop images here" : "Drag & drop images"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              or{" "}
              <span className="text-[#1A73E8] font-semibold underline">
                browse files
              </span>{" "}
              · {aspect === "LANDSCAPE" ? "1.91:1" : "1:1"} ratio preferred
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Asset grid */}
      {assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {assets.map((a, i) => (
            <div
              key={i}
              className={cn(
                "relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group",
                aspectClass
              )}
            >
              <img
                src={a.url}
                alt={`Asset ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              {/* Aspect indicator */}
              <div className="absolute bottom-1 left-1 text-[8px] font-bold uppercase tracking-wider bg-black/50 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {aspect === "LANDSCAPE" ? "1.91:1" : "1:1"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL fallback */}
      {canAdd && (
        <div className="flex gap-2 items-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Or add URL
          </div>
          <Input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
            placeholder="https://cdn.example.com/image.jpg"
            className="h-9 rounded-lg border-slate-200 bg-white text-xs"
          />
          <Button
            type="button"
            onClick={addUrl}
            disabled={!draftUrl.trim()}
            className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1 px-3 shrink-0"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

function DisplayCreator({ form, setForm, showAllErrors }: StepProps) {
  const finalUrlMissing = !!showAllErrors && !form.displayFinalUrl.trim();
  const businessNameMissing =
    !!showAllErrors && !form.displayBusinessName.trim();
  const longHeadlineMissing =
    !!showAllErrors && !form.displayLongHeadline.trim();
  const needLandscape =
    !!showAllErrors &&
    form.displayImages.filter((i) => i.aspect === "LANDSCAPE").length === 0;
  const needSquare =
    !!showAllErrors &&
    form.displayImages.filter((i) => i.aspect === "SQUARE").length === 0;
  const needLogo =
    !!showAllErrors &&
    form.displayLogos.filter((l) => l.aspect === "SQUARE").length === 0;

  const updateHeadlineAt = (idx: number, value: string) => {
    setForm((f) => ({
      ...f,
      displayHeadlines: f.displayHeadlines.map((h, i) => (i === idx ? value : h)),
    }));
  };
  const updateDescAt = (idx: number, value: string) => {
    setForm((f) => ({
      ...f,
      displayDescriptions: f.displayDescriptions.map((d, i) =>
        i === idx ? value : d
      ),
    }));
  };
  const addHeadlineSlot = () => {
    if (form.displayHeadlines.length >= MAX_DISPLAY_HEADLINES) return;
    setForm((f) => ({ ...f, displayHeadlines: [...f.displayHeadlines, ""] }));
  };
  const addDescSlot = () => {
    if (form.displayDescriptions.length >= MAX_DISPLAY_DESCRIPTIONS) return;
    setForm((f) => ({
      ...f,
      displayDescriptions: [...f.displayDescriptions, ""],
    }));
  };

  const landscapeImages = form.displayImages.filter(
    (i) => i.aspect === "LANDSCAPE"
  );
  const squareImages = form.displayImages.filter((i) => i.aspect === "SQUARE");
  const squareLogos = form.displayLogos.filter((l) => l.aspect === "SQUARE");

  return (
    <div className="space-y-6">
      {/* Basics */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
          Basics
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Final URL
          </label>
          <Input
            value={form.displayFinalUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayFinalUrl: e.target.value }))
            }
            placeholder="https://example.com"
            className={cn(
              "h-11 rounded-xl border-slate-200 bg-white",
              finalUrlMissing && "border-rose-400"
            )}
          />
          {finalUrlMissing && <FieldError message="Final URL is required." />}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Business name
            </label>
            <CharCounter
              value={form.displayBusinessName}
              max={MAX_DISPLAY_BUSINESS_NAME_LEN}
            />
          </div>
          <Input
            value={form.displayBusinessName}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayBusinessName: e.target.value }))
            }
            placeholder="Your Brand"
            className={cn(
              "h-11 rounded-xl border-slate-200 bg-white",
              businessNameMissing && "border-rose-400"
            )}
          />
          {businessNameMissing && (
            <FieldError message="Business name is required for Display ads." />
          )}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
          Images
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ({form.displayImages.length}/{MAX_DISPLAY_IMAGES})
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Add at least one landscape (1.91:1) and one square (1:1). Google will
          crop and rotate to fit each placement.
        </p>
        <ImageAssetGrid
          assets={landscapeImages}
          onChange={(next) => {
            const others = form.displayImages.filter(
              (i) => i.aspect !== "LANDSCAPE"
            );
            setForm((f) => ({ ...f, displayImages: [...next, ...others] }));
          }}
          max={MAX_DISPLAY_IMAGES - squareImages.length}
          aspect="LANDSCAPE"
          label="Landscape"
        />
        {needLandscape && (
          <FieldError message="At least one landscape image (1.91:1) is required." />
        )}
        <ImageAssetGrid
          assets={squareImages}
          onChange={(next) => {
            const others = form.displayImages.filter(
              (i) => i.aspect !== "SQUARE"
            );
            setForm((f) => ({ ...f, displayImages: [...others, ...next] }));
          }}
          max={MAX_DISPLAY_IMAGES - landscapeImages.length}
          aspect="SQUARE"
          label="Square"
        />
        {needSquare && (
          <FieldError message="At least one square image (1:1) is required." />
        )}
      </div>

      {/* Logos */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <ImageIcon className="w-5 h-5 text-slate-400 shrink-0" />
          Logos
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ({form.displayLogos.length}/{MAX_DISPLAY_LOGOS})
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Add a square logo (1:1). It appears next to your brand name.
        </p>
        <ImageAssetGrid
          assets={squareLogos}
          onChange={(next) => setForm((f) => ({ ...f, displayLogos: next }))}
          max={MAX_DISPLAY_LOGOS}
          aspect="SQUARE"
          label="Square logos"
        />
        {needLogo && (
          <FieldError message="Add at least one square (1:1) logo." />
        )}
      </div>

      {/* YouTube videos */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Youtube className="w-5 h-5 text-red-500 shrink-0" />
          YouTube videos (optional)
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ({form.displayYoutubeUrls.length}/{MAX_DISPLAY_VIDEOS})
          </span>
        </div>
        <div className="space-y-2">
          {form.displayYoutubeUrls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={url}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    displayYoutubeUrls: f.displayYoutubeUrls.map((v, i) =>
                      i === idx ? e.target.value : v
                    ),
                  }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-10 rounded-lg border-slate-200 bg-white text-xs"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    displayYoutubeUrls: f.displayYoutubeUrls.filter(
                      (_, i) => i !== idx
                    ),
                  }))
                }
                className="text-slate-300 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {form.displayYoutubeUrls.length < MAX_DISPLAY_VIDEOS && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  displayYoutubeUrls: [...f.displayYoutubeUrls, ""],
                }))
              }
              className="h-9 rounded-lg border-dashed border-slate-300 text-xs font-bold text-slate-600 gap-1"
            >
              <Plus className="w-3 h-3" />
              Add YouTube link
            </Button>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Type className="w-5 h-5 text-slate-400 shrink-0" />
          Headlines & descriptions
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Long headline
            </label>
            <CharCounter
              value={form.displayLongHeadline}
              max={MAX_DISPLAY_LONG_HEADLINE_LEN}
            />
          </div>
          <Input
            value={form.displayLongHeadline}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayLongHeadline: e.target.value }))
            }
            placeholder="Make summer adventures unforgettable"
            className={cn(
              "h-11 rounded-xl border-slate-200 bg-white",
              longHeadlineMissing && "border-rose-400"
            )}
          />
          {longHeadlineMissing && (
            <FieldError message="Long headline is required." />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Short headlines (up to {MAX_DISPLAY_HEADLINES})
            </label>
            {form.displayHeadlines.length < MAX_DISPLAY_HEADLINES && (
              <button
                type="button"
                onClick={addHeadlineSlot}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1A73E8] hover:underline uppercase tracking-wider"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>
          {form.displayHeadlines.map((h, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={h}
                onChange={(e) => updateHeadlineAt(idx, e.target.value)}
                placeholder={`Headline ${idx + 1}`}
                className="h-9 rounded-lg border-slate-200 bg-white text-xs"
              />
              <CharCounter value={h} max={MAX_DISPLAY_HEADLINE_LEN} />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Descriptions (up to {MAX_DISPLAY_DESCRIPTIONS})
            </label>
            {form.displayDescriptions.length < MAX_DISPLAY_DESCRIPTIONS && (
              <button
                type="button"
                onClick={addDescSlot}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1A73E8] hover:underline uppercase tracking-wider"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>
          {form.displayDescriptions.map((d, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={d}
                onChange={(e) => updateDescAt(idx, e.target.value)}
                placeholder={`Description ${idx + 1}`}
                className="h-9 rounded-lg border-slate-200 bg-white text-xs"
              />
              <CharCounter value={d} max={MAX_DISPLAY_DESCRIPTION_LEN} />
            </div>
          ))}
        </div>
      </div>

      {/* Colors + CTA */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          Colors & CTA
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Accent color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.displayAccentColor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayAccentColor: e.target.value }))
                }
                className="w-10 h-10 rounded-lg border border-slate-200 bg-white cursor-pointer"
              />
              <Input
                value={form.displayAccentColor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayAccentColor: e.target.value }))
                }
                className="h-10 rounded-lg border-slate-200 bg-white text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Main color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.displayMainColor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayMainColor: e.target.value }))
                }
                className="w-10 h-10 rounded-lg border border-slate-200 bg-white cursor-pointer"
              />
              <Input
                value={form.displayMainColor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayMainColor: e.target.value }))
                }
                className="h-10 rounded-lg border-slate-200 bg-white text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Call to action
            </label>
            <Select
              value={form.displayCta}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, displayCta: v as typeof form.displayCta }))
              }
            >
              <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CTA_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional format options */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
          Additional format options
        </div>
        <p className="text-xs text-slate-500">
          Help optimize your ad layouts and formats across placements automatically.
        </p>
        <div className="space-y-3.5">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={form.displayEnhance}
              onCheckedChange={(c) =>
                setForm((f: any) => ({ ...f, displayEnhance: !!c }))
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900">Use asset enhancement</div>
              <p className="text-[10px] text-slate-400">
                Let Google automatically improve your image quality and layouts (e.g. brightness tuning, auto-cropping).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={form.displayAutoVideo}
              onCheckedChange={(c) =>
                setForm((f: any) => ({ ...f, displayAutoVideo: !!c }))
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900">Use auto-generated video</div>
              <p className="text-[10px] text-slate-400">
                Create video assets from your images when a video placement is available and you haven't uploaded one.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={form.displayNative}
              onCheckedChange={(c) =>
                setForm((f: any) => ({ ...f, displayNative: !!c }))
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900">Use native formats</div>
              <p className="text-[10px] text-slate-400">
                Optimize your ad creatives to match the look and feel of publisher websites and native app streams.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Ad URL Options */}
      <AdUrlOptionsSection form={form} setForm={setForm} />
    </div>
  );
}

export function Step5Creative(props: StepProps) {
  if (props.form.campaignType === "DISPLAY") {
    return <DisplayCreator {...props} />;
  }
  // PERFORMANCE_MAX uses Google's automated asset generation; we collect the
  // RSA creative as the primary asset and supplement with display assets
  // if the user provides them. For v1 we route Performance Max through RSA.
  return <RsaCreator {...props} />;
}
