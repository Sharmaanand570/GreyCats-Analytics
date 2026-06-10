import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiGoogleads } from "react-icons/si";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Stepper } from "@/features/googleAds/components/adsWizard/Stepper";
import { Step1Objective } from "@/features/googleAds/components/adsWizard/Step1Objective";
import { Step2Settings } from "@/features/googleAds/components/adsWizard/Step2Settings";
import { Step3Bidding } from "@/features/googleAds/components/adsWizard/Step3Bidding";
import { Step4AdGroup } from "@/features/googleAds/components/adsWizard/Step4AdGroup";
import { Step5Creative } from "@/features/googleAds/components/adsWizard/Step5Creative";
import {
  Step6Review,
  validateWizard,
} from "@/features/googleAds/components/adsWizard/Step6Review";
import {
  INITIAL_FORM_STATE,
  parseKeywords,
  type WizardFormState,
} from "@/features/googleAds/components/adsWizard/types";
import {
  TERMINAL_JOB_STATES,
  type GoogleAdsPublishPayload,
} from "@/features/googleAds/API/googleAdsManagerApi";
import {
  useGoogleAdsPublishStatus,
  useSubmitGoogleAdsPublish,
} from "@/features/googleAds/hooks/useGoogleAdsManager";
import { useGoogleAdsAccounts } from "@/features/googleAds/hooks/useGoogleAds";
import { useAllClients } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";

const TOTAL_STEPS = 6;

// Translates dollars → micros (Google's currency unit).
const toMicros = (dollars: number) => Math.round(dollars * 1_000_000);

const buildPayload = (
  form: WizardFormState,
  clientId: number
): GoogleAdsPublishPayload => {
  const keywords = parseKeywords(form.keywordsText);

  // Conditionally include the conversion action only when the bid focus needs one.
  const needsConversion =
    form.biddingFocus === "CONVERSIONS" ||
    form.biddingFocus === "CONVERSION_VALUE";

  const rsaActive =
    form.campaignType !== "DISPLAY" && form.rsaHeadlines.length > 0;
  const displayActive = form.campaignType === "DISPLAY";

  return {
    customerId: form.customerId,
    clientId,
    campaignName: form.campaignName.trim(),
    objective: form.objective,
    campaignType: form.campaignType,
    networks: form.networks,
    locationMode: form.locationMode,
    locations: form.locations.map((l) => ({
      geoTargetConstantId: l.id,
      name: l.name,
      excluded: !!l.excluded,
    })),
    locationPreset: form.locationPreset,
    languageIds: form.languageIds,
    ...(form.adSchedule.length > 0
      ? { adSchedule: form.adSchedule }
      : {}),
    campaignStartDate: form.campaignStartDate || undefined,
    campaignEndDate: form.campaignEndDate || undefined,
    adRotation: form.adRotation,

    biddingFocus: form.biddingFocus,
    bidStrategy: form.bidStrategy,
    ...(form.setTargetCpa && form.targetCpa > 0
      ? { targetCpaMicros: toMicros(form.targetCpa) }
      : {}),
    ...(form.setTargetRoas && form.targetRoasPercent > 0
      ? { targetRoasPercent: form.targetRoasPercent }
      : {}),
    ...(form.setMaxCpc && form.maxCpc > 0
      ? { maxCpcBidMicros: toMicros(form.maxCpc) }
      : {}),
    ...(needsConversion && form.conversionActionId
      ? { conversionActionId: form.conversionActionId }
      : {}),
    budgetType: form.budgetType,
    budgetAmount: form.budgetAmount,

    customerAcquisition: form.customerAcquisition,
    acquisitionOptimizeNew: form.customerAcquisition ? form.acquisitionOptimizeNew : undefined,
    ...(form.biddingFocus === "IMPRESSION_SHARE"
      ? {
          targetImpressionShareLocation: form.targetImpressionShareLocation,
          targetImpressionSharePercent: form.targetImpressionSharePercent,
          targetImpressionShareMaxCpcMicros: form.targetImpressionShareMaxCpc > 0 ? toMicros(form.targetImpressionShareMaxCpc) : undefined,
        }
      : {}),

    ...(form.campaignType === "SEARCH"
      ? {
          adGroupName: form.adGroupName.trim() || "Ad Group 1",
          keywords,
        }
      : {}),

    ...(rsaActive
      ? {
          rsaCreative: {
            finalUrl: form.rsaFinalUrl.trim(),
            ...(form.rsaPath1.trim() ? { path1: form.rsaPath1.trim() } : {}),
            ...(form.rsaPath2.trim() ? { path2: form.rsaPath2.trim() } : {}),
            headlines: form.rsaHeadlines.filter((h) => h.text.trim()),
            descriptions: form.rsaDescriptions.filter((d) => d.text.trim()),
            sitelinks: form.rsaSitelinks.filter((s) => s.text.trim() && s.url.trim()),
            callouts: form.rsaCallouts.filter(Boolean),
            ...(form.rsaSnippetsValues.filter(Boolean).length > 0
              ? {
                  snippetsHeader: form.rsaSnippetsHeader,
                  snippetsValues: form.rsaSnippetsValues.filter(Boolean),
                }
              : {}),
            ...(form.rsaCallPhoneNumber.trim()
              ? {
                  callCountryCode: form.rsaCallCountryCode,
                  callPhoneNumber: form.rsaCallPhoneNumber.trim(),
                }
              : {}),
          },
        }
      : {}),

    ...(displayActive
      ? {
          displayCreative: {
            finalUrl: form.displayFinalUrl.trim(),
            businessName: form.displayBusinessName.trim(),
            longHeadline: form.displayLongHeadline.trim(),
            headlines: form.displayHeadlines.filter(Boolean),
            descriptions: form.displayDescriptions.filter(Boolean),
            images: form.displayImages,
            logos: form.displayLogos,
            ...(form.displayYoutubeUrls.filter(Boolean).length > 0
              ? { youtubeVideoUrls: form.displayYoutubeUrls.filter(Boolean) }
              : {}),
            accentColor: form.displayAccentColor,
            mainColor: form.displayMainColor,
            callToAction: form.displayCta,
            displayEnhance: form.displayEnhance,
            displayAutoVideo: form.displayAutoVideo,
            displayNative: form.displayNative,
          },
        }
      : {}),

    ...(form.trackingTemplate.trim() ? { trackingTemplate: form.trackingTemplate.trim() } : {}),
    ...(form.finalUrlSuffix.trim() ? { finalUrlSuffix: form.finalUrlSuffix.trim() } : {}),
    ...(form.customParameters.filter((p) => p.key.trim() && p.value.trim()).length > 0
      ? { customParameters: form.customParameters.filter((p) => p.key.trim() && p.value.trim()) }
      : {}),
  };
};

function GoogleAdsWizardPage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const clientId = clientIdParam ? Number(clientIdParam) : null;

  const { data: clientsData } = useAllClients();
  const clients = clientsData || [];

  // Connected Google Ads accounts. Auto-select the first when only one exists.
  const { data: accountsData, isLoading: loadingAccounts } =
    useGoogleAdsAccounts(true);
  const accounts = useMemo(
    () => accountsData?.accounts ?? [],
    [accountsData]
  );

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardFormState>(INITIAL_FORM_STATE);
  const [showStepErrors, setShowStepErrors] = useState<Record<number, boolean>>({});
  const [softFailure, setSoftFailure] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingExit, setPendingExit] = useState<{ to: string } | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Auto-pick the customer if only one is connected.
  useEffect(() => {
    if (!form.customerId && accounts.length === 1) {
      setForm((f) => ({ ...f, customerId: accounts[0].customerId }));
    }
  }, [accounts, form.customerId]);

  const {
    mutateAsync: submitJob,
    isPending: isSubmittingJob,
    error: submitError,
  } = useSubmitGoogleAdsPublish();
  const { data: jobStatus, error: jobError } =
    useGoogleAdsPublishStatus(activeJobId);

  const setFormDirty = useCallback(
    (updater: (prev: WizardFormState) => WizardFormState) => {
      setForm(updater);
      setIsDirty(true);
    },
    []
  );

  const navigateGuarded = useCallback(
    (to: string) => {
      if (!isDirty) {
        navigate(to);
        return;
      }
      setPendingExit({ to });
    },
    [isDirty, navigate]
  );

  const handleClientChange = (newClientId: number) => {
    if (newClientId === clientId) return;
    navigateGuarded(`/data-sources/google-ads/wizard/${newClientId}`);
  };

  // Per-step "can advance" — light-checks; full validation runs on the review step.
  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return !!form.objective && !!form.campaignType;
      case 1: {
        if (!form.campaignName.trim()) return false;
        if (form.campaignType === "SEARCH" && form.networks.length === 0) return false;
        if (
          form.locationMode === "CUSTOM" &&
          form.locations.filter((l) => !l.excluded).length === 0
        ) {
          return false;
        }
        return true;
      }
      case 2: {
        if (form.budgetAmount <= 0) return false;
        if (
          (form.biddingFocus === "CONVERSIONS" ||
            form.biddingFocus === "CONVERSION_VALUE") &&
          !form.conversionActionId
        ) {
          return false;
        }
        return true;
      }
      case 3: {
        if (form.campaignType !== "SEARCH") return true;
        if (!form.adGroupName.trim()) return false;
        if (parseKeywords(form.keywordsText).length === 0) return false;
        return true;
      }
      case 4: {
        if (form.campaignType === "DISPLAY") {
          return (
            !!form.displayFinalUrl.trim() &&
            !!form.displayBusinessName.trim() &&
            !!form.displayLongHeadline.trim() &&
            form.displayImages.some((i) => i.aspect === "LANDSCAPE") &&
            form.displayImages.some((i) => i.aspect === "SQUARE")
          );
        }
        const validHeadlines = form.rsaHeadlines.filter(
          (h) => h.text.trim() && h.text.length <= 30
        );
        const validDescriptions = form.rsaDescriptions.filter(
          (d) => d.text.trim() && d.text.length <= 90
        );
        return (
          !!form.rsaFinalUrl.trim() &&
          validHeadlines.length >= 3 &&
          validDescriptions.length >= 2
        );
      }
      default:
        return true;
    }
  }, [step, form]);

  // Map "step 3" (Ad Group) to step 4 (Creative) for non-Search campaigns.
  const goToNextStep = useCallback(
    (delta: number) => {
      setStep((curr) => {
        let next = curr + delta;
        // Skip Step 3 (Ad Group) when not a Search campaign.
        if (form.campaignType !== "SEARCH" && next === 3) {
          next += delta > 0 ? 1 : -1;
        }
        return Math.max(0, Math.min(TOTAL_STEPS - 1, next));
      });
    },
    [form.campaignType]
  );

  const handleBack = () => {
    if (step === 0) {
      navigateGuarded(
        clientId ? `/data-sources/google-ads/${clientId}` : "/data-sources/google-ads"
      );
      return;
    }
    goToNextStep(-1);
  };

  const handleNext = () => {
    if (!canAdvance) {
      setShowStepErrors((m) => ({ ...m, [step]: true }));
      return;
    }
    goToNextStep(1);
  };

  const handlePublish = async () => {
    if (!clientId) return;
    const issues = validateWizard(form).filter((i) => i.level === "error");
    if (issues.length > 0) {
      toast.error(`Fix ${issues.length} issue${issues.length === 1 ? "" : "s"} before publishing.`);
      return;
    }
    setSoftFailure(null);
    setActiveJobId(null);
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const { jobId } = await submitJob({
        payload: buildPayload(form, clientId),
        idempotencyKey,
      });
      setActiveJobId(jobId);
    } catch {
      // useSubmitGoogleAdsPublish already toasts the submit failure.
    }
  };

  // Watch the polled job for terminal states.
  useEffect(() => {
    if (!jobStatus || !TERMINAL_JOB_STATES.has(jobStatus.state)) return;
    if (jobStatus.state === "PUBLISHED") {
      toast.success("Campaign published to Google Ads!");
      setIsDirty(false);
      navigate(
        clientId
          ? `/data-sources/google-ads/${clientId}`
          : "/data-sources/google-ads"
      );
      return;
    }
    if (jobStatus.state === "NEEDS_REVIEW") {
      toast.success("Submitted for approval");
      setIsDirty(false);
      navigate(
        clientId
          ? `/data-sources/google-ads/${clientId}`
          : "/data-sources/google-ads"
      );
      return;
    }
    const message =
      jobStatus.state === "PARTIAL"
        ? `Campaign created but a child entity failed. ${jobStatus.lastError ?? ""}`.trim()
        : jobStatus.lastError ?? "Google Ads rejected the campaign";
    setSoftFailure(message);
    setActiveJobId(null);
  }, [jobStatus, clientId, navigate]);

  const isJobInFlight =
    activeJobId !== null &&
    (!jobStatus || !TERMINAL_JOB_STATES.has(jobStatus.state));
  const isPublishing = isSubmittingJob || isJobInFlight;
  const reviewError = (submitError ?? jobError)?.message || softFailure;

  // Step 3 (Ad Group) is hidden when campaign type isn't SEARCH — but we still
  // count it in the stepper labels for parity with Google's UI. The stepper
  // shows progress visually; the wizard skips that step in navigation.
  const renderCurrentStep = () => {
    if (!clientId) return null;
    switch (step) {
      case 0:
        return (
          <Step1Objective
            form={form}
            setForm={setFormDirty}
            clientId={clientId}
            showAllErrors={!!showStepErrors[0]}
          />
        );
      case 1:
        return (
          <Step2Settings
            form={form}
            setForm={setFormDirty}
            clientId={clientId}
            showAllErrors={!!showStepErrors[1]}
          />
        );
      case 2:
        return (
          <Step3Bidding
            form={form}
            setForm={setFormDirty}
            clientId={clientId}
            showAllErrors={!!showStepErrors[2]}
          />
        );
      case 3:
        return (
          <Step4AdGroup
            form={form}
            setForm={setFormDirty}
            clientId={clientId}
            showAllErrors={!!showStepErrors[3]}
          />
        );
      case 4:
        return (
          <Step5Creative
            form={form}
            setForm={setFormDirty}
            clientId={clientId}
            showAllErrors={!!showStepErrors[4]}
          />
        );
      case 5:
        return (
          <Step6Review
            form={form}
            publishError={reviewError}
            job={jobStatus ?? null}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-[#fafafa]">
      <div className="w-full h-full flex flex-col">
        {/* Top Bar */}
        <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm">
          <div className="flex flex-col gap-2">
            <Breadcrumb>
              <BreadcrumbList className="text-xs font-medium text-slate-400">
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    to={
                      clientId
                        ? `/data-sources/google-ads/${clientId}`
                        : "/data-sources/google-ads"
                    }
                  >
                    Google Ads
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900 font-bold">
                    Create Campaign
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#1A73E8] flex items-center justify-center shadow-[0_8px_16px_rgba(66,133,244,0.25)]">
                <SiGoogleads className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Create Google Ads Campaign
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Step {step + 1} of {TOTAL_STEPS} — campaign, ad group, and ads in one flow
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[240px]">
              <Select
                value={clientId?.toString() ?? ""}
                onValueChange={(v) => handleClientChange(Number(v))}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white font-medium text-slate-700 shadow-sm">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-800" />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                navigateGuarded(
                  clientId
                    ? `/data-sources/google-ads/${clientId}`
                    : "/data-sources/google-ads"
                )
              }
              className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 px-6"
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Stepper */}
            <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm">
              <Stepper current={step} />
            </div>

            {/* Google Ads account selector — shown on step 0 only */}
            {step === 0 && (
              <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-3">
                <div className="text-sm font-bold text-slate-900">
                  Google Ads account
                </div>
                <p className="text-xs text-slate-500">
                  Which connected account should this campaign publish to?
                </p>
                {loadingAccounts ? (
                  <Skeleton className="h-11 rounded-xl" />
                ) : accounts.length === 0 ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    No connected Google Ads accounts. Connect one from the
                    integrations page first.
                  </div>
                ) : (
                  <Select
                    value={form.customerId}
                    onValueChange={(v) =>
                      setFormDirty((f) => ({ ...f, customerId: v }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.customerId} value={acc.customerId}>
                          <div className="flex items-center justify-between gap-3 w-[300px]">
                            <span className="font-semibold text-slate-900 truncate">
                              {acc.descriptiveName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {acc.customerId}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {!clientId ? (
              <div className="rounded-[20px] border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
                A client is required to publish ads. Open this wizard from a
                client's Google Ads page.
              </div>
            ) : (
              renderCurrentStep()
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between sticky bottom-0 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[20px] px-6 py-4 shadow-md">
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-11 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 px-5 gap-2"
                disabled={isPublishing}
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 0 ? "Exit" : "Back"}
              </Button>

              {step < TOTAL_STEPS - 1 ? (
                <Button
                  onClick={handleNext}
                  className={
                    canAdvance
                      ? "h-11 rounded-xl px-6 gap-2 font-bold bg-slate-900 hover:bg-slate-800"
                      : "h-11 rounded-xl px-6 gap-2 font-bold bg-slate-300 hover:bg-slate-400 text-white cursor-help"
                  }
                  title={
                    canAdvance
                      ? undefined
                      : "Some required fields are missing — click to see them"
                  }
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setConfirmPublish(true)}
                  disabled={!clientId || isPublishing}
                  className="h-11 rounded-xl px-6 gap-2 font-bold bg-gradient-to-r from-[#4285F4] to-[#1A73E8] hover:from-[#1A73E8] hover:to-[#1557B0] text-white"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {jobStatus?.state === "QUEUED"
                        ? "Queued…"
                        : jobStatus?.state === "PUBLISHING"
                          ? "Publishing…"
                          : "Submitting…"}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Publish to Google Ads
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved-changes guard */}
      <AlertDialog
        open={pendingExit !== null}
        onOpenChange={(open) => {
          if (!open) setPendingExit(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't published this campaign yet. Leaving now will lose
              every change you've made in this wizard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const to = pendingExit?.to;
                setPendingExit(null);
                setIsDirty(false);
                if (to) navigate(to);
              }}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish confirmation */}
      <AlertDialog
        open={confirmPublish}
        onOpenChange={(open) => {
          if (!open) setConfirmPublish(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Publish this campaign to Google Ads?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This sends the campaign to Google Ads and begins billing under{" "}
              <span className="font-semibold text-slate-900">
                {form.campaignName || "—"}
              </span>{" "}
              at{" "}
              <span className="font-semibold text-slate-900">
                ${form.budgetAmount.toFixed(2)} /{" "}
                {form.budgetType === "DAILY" ? "day" : "total"}
              </span>
              . You can pause it from Google Ads afterwards, but the publish
              itself can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review again</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmPublish(false);
                handlePublish();
              }}
              className="bg-gradient-to-r from-[#4285F4] to-[#1A73E8] hover:from-[#1A73E8] hover:to-[#1557B0] text-white"
            >
              Publish to Google Ads
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GoogleAdsWizardPage;
