import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUpdateCampaign } from "../../hooks/useCampaignManagement";
import type { Campaign, CampaignStatus } from "../../types/googleAds.types";
import { UnifiedBiddingConfiguration } from "./../bidding/UnifiedBiddingConfiguration";
import type { BiddingConfigValue } from "./../bidding/UnifiedBiddingConfiguration";

// ─────────────────────────────────────────────────────────────
// FORM TYPES
// ─────────────────────────────────────────────────────────────

interface EditCampaignForm {
  name: string;
  status: CampaignStatus;
  budgetAmount: string;        // string for controlled input
  startDate: string;
  endDate: string;
  trackingUrlTemplate: string;
  finalUrlSuffix: string;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

interface CampaignEditDrawerProps {
  clientId: number;
  campaign: Campaign | null;
  onClose: () => void;
}

export function CampaignEditDrawer({
  clientId,
  campaign,
  onClose,
}: CampaignEditDrawerProps) {
  const open = campaign !== null;
  const updateMutation = useUpdateCampaign(clientId);

  const {
    register,
    handleSubmit,
    reset,
    control,
  // @ts-expect-error unused variable
    watch,
    formState: { errors, isDirty },
  } = useForm<EditCampaignForm>({
    defaultValues: buildDefaults(campaign),
  });

  const [biddingConfig, setBiddingConfig] = useState<Partial<BiddingConfigValue>>({});

  // Reset form when campaign changes
  useEffect(() => {
    if (campaign) {
      reset(buildDefaults(campaign));
      setBiddingConfig({
        type: campaign.bidStrategyType || "MAXIMIZE_CONVERSIONS",
        portfolioStrategyId: campaign.biddingStrategyId || null,
        targetCpa: campaign.targetCpa ? campaign.targetCpa * 1000000 : undefined,
        targetRoas: campaign.targetRoas ? campaign.targetRoas / 100 : undefined,
      });
    }
  }, [campaign, reset]);

  function buildDefaults(c: Campaign | null): EditCampaignForm {
    return {
      name: c?.name ?? "",
      status: c?.status ?? "PAUSED",
      budgetAmount: c?.budgetAmount?.toString() ?? "",
      startDate: c?.startDate ?? "",
      endDate: c?.endDate ?? "",
      trackingUrlTemplate: c?.trackingUrlTemplate ?? "",
      finalUrlSuffix: c?.finalUrlSuffix ?? "",
    };
  }

  function onSubmit(values: EditCampaignForm) {
    if (!campaign) return;
    updateMutation.mutate(
      {
        campaignId: campaign.id,
        payload: {
          name: values.name,
          status: values.status,
          budgetAmountMicros: values.budgetAmount
            ? Math.round(parseFloat(values.budgetAmount) * 1_000_000)
            : undefined,
          targetCpa: biddingConfig.targetCpa ? biddingConfig.targetCpa / 1000000 : undefined,
          targetRoas: biddingConfig.targetRoas ? biddingConfig.targetRoas * 100 : undefined,
          biddingStrategyId: biddingConfig.portfolioStrategyId || undefined,
          startDate: values.startDate || undefined,
          endDate: values.endDate || undefined,
          trackingUrlTemplate: values.trackingUrlTemplate || undefined,
          finalUrlSuffix: values.finalUrlSuffix || undefined,
        },
      },
      { onSuccess: () => onClose() }
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-slate-200">
          <SheetTitle className="text-base font-bold text-slate-900">
            Edit Campaign
          </SheetTitle>
          {campaign && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
              {campaign.name}
            </p>
          )}
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-6 py-5 space-y-6">
            {/* ── General ───────────────────────────────── */}
            <Section title="General">
              <Field label="Campaign name" error={errors.name?.message}>
                <Input
                  {...register("name", { required: "Name is required" })}
                  placeholder="Campaign name"
                  className="text-sm"
                />
              </Field>

              <Field label="Status">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENABLED">Enabled</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </Section>

            <Separator />

            {/* ── Budget ────────────────────────────────── */}
            <Section title="Budget">
              <Field
                label="Daily budget"
                hint="Amount in account currency (e.g. INR, USD)"
                error={errors.budgetAmount?.message}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>
                  <Input
                    {...register("budgetAmount", {
                      validate: (v) =>
                        !v ||
                        (!isNaN(parseFloat(v)) && parseFloat(v) > 0) ||
                        "Enter a valid budget amount",
                    })}
                    placeholder="0.00"
                    className="pl-7 text-sm"
                  />
                </div>
              </Field>
            </Section>

            {/* ── Bidding ───────────────────────────────── */}
            <Separator />
            <Section title="Bidding">
              <UnifiedBiddingConfiguration 
                clientId={clientId}
                value={biddingConfig}
                onChange={(val) => setBiddingConfig(prev => ({ ...prev, ...val }))}
              />
            </Section>

            <Separator />

            {/* ── Schedule ──────────────────────────────── */}
            <Section title="Schedule">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start date">
                  <Input
                    type="date"
                    {...register("startDate")}
                    className="text-sm"
                  />
                </Field>
                <Field label="End date">
                  <Input
                    type="date"
                    {...register("endDate")}
                    className="text-sm"
                  />
                </Field>
              </div>
            </Section>

            <Separator />

            {/* ── Tracking ──────────────────────────────── */}
            <Section title="Tracking">
              <Field
                label="Tracking template"
                hint="Override tracking URL with ValueTrack parameters"
              >
                <Input
                  {...register("trackingUrlTemplate")}
                  placeholder="{lpurl}?..."
                  className="text-sm font-mono"
                />
              </Field>
              <Field
                label="Final URL suffix"
                hint="Appended to all final URLs"
              >
                <Input
                  {...register("finalUrlSuffix")}
                  placeholder="utm_source=google"
                  className="text-sm font-mono"
                />
              </Field>
            </Section>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
