import { useState, useEffect } from "react";
  // @ts-expect-error unused variable
import { ChevronDown, ChevronUp, HelpCircle, AlertCircle, Info } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { useAudiencesList } from "../hooks/useCampaignLookups";
import { UnifiedBiddingConfiguration } from "./bidding/UnifiedBiddingConfiguration";
import type { BiddingConfigValue } from "./bidding/UnifiedBiddingConfiguration";

interface BiddingStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
  campaignType?: string;
}

  // @ts-expect-error unused variable
export default function GoogleAdsBiddingStep({ onNext, activeSubStep, onSubStepChange, campaignType = "Search" }: BiddingStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const configValue: Partial<BiddingConfigValue> = {
    type: payload.biddingStrategyId ? "MAXIMIZE_CONVERSIONS" : 
          (payload.targetRoas ? "TARGET_ROAS" : (payload.targetCpa ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS")),
    portfolioStrategyId: payload.biddingStrategyId || null,
    targetCpa: payload.targetCpa ? payload.targetCpa * 1000000 : undefined,
    targetRoas: payload.targetRoas ? payload.targetRoas : undefined,
  };

  const handleConfigChange = (newVal: Partial<BiddingConfigValue>) => {
    updatePayload({
      biddingStrategyId: newVal.portfolioStrategyId || undefined,
      biddingFocus: (newVal.type === "TARGET_CPA" || newVal.type === "MAXIMIZE_CONVERSIONS") ? "CONVERSIONS" : 
                    (newVal.type === "TARGET_IMPRESSION_SHARE" ? "IMPRESSION_SHARE" : 
                    (newVal.type === "MAXIMIZE_CLICKS" ? "CLICKS" : "CONVERSION_VALUE")),
      targetCpa: newVal.targetCpa ? newVal.targetCpa / 1000000 : undefined,
      targetRoas: newVal.targetRoas ? newVal.targetRoas : undefined,
      maxCpcBidLimit: newVal.type === "MAXIMIZE_CLICKS" ? newVal.targetImpressionShare?.cpcBidCeilingMicros : undefined, // re-using the UI field temporarily if it exists, actually wait we need to get it directly if CLICKS
      targetImpressionShare: newVal.type === "TARGET_IMPRESSION_SHARE" ? newVal.targetImpressionShare : undefined,
    });
  };

  const [onlyNewCustomers, setOnlyNewCustomers] = useState(!!payload.onlyNewCustomers);
  const [audienceId, setAudienceId] = useState<string>(payload.customerAcquisitionAudienceId || "");

  const { data: audiencesData } = useAudiencesList(payload.clientId || 1);
  const audiences = audiencesData?.audiences ?? [];

  // Sync to context when local state changes
  useEffect(() => {
    updatePayload({
      onlyNewCustomers: onlyNewCustomers,
      customerAcquisitionAudienceId: audienceId || undefined,
    });
  }, [onlyNewCustomers, audienceId, updatePayload]);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (!onSubStepChange) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const activeId = visibleEntries[0].target.id.replace('panel-', '');
          onSubStepChange(activeId);
        }
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    const panels = document.querySelectorAll('.bidding-panel-section');
    panels.forEach(p => observer.observe(p));
    return () => observer.disconnect();
  }, [onSubStepChange]);

  const isSearch = campaignType === "Search";

  return (
    <div className="flex flex-col max-w-[800px] pb-20 relative">
      <h1 className="text-[24px] font-normal text-slate-800 mb-6">Bidding</h1>

      <div className="flex flex-col gap-4">

        {/* ── Bidding Panel ── */}
        <div
          id="panel-bidding"
          onClick={() => onSubStepChange?.('bidding')}
          className="bidding-panel-section bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
            <h2 className="text-[14px] font-medium text-slate-800">Bidding</h2>
            <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <UnifiedBiddingConfiguration 
              clientId={payload.clientId || 1} 
              value={configValue} 
              onChange={handleConfigChange} 
            />
          </div>
        </div>

        {(
          <div
            id="panel-customer-acquisition"
            onClick={() => onSubStepChange?.('customer-acquisition')}
            className="bidding-panel-section bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
              <h2 className="text-[14px] font-medium text-slate-800">Customer acquisition</h2>
              <ChevronUp className="w-5 h-5 text-slate-500" />
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex gap-8">
                <div className="flex-1">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyNewCustomers}
                      onChange={() => setOnlyNewCustomers(!onlyNewCustomers)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                    />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800">Only bid for new customers</div>
                      <div className="text-[12px] text-slate-500 mt-0.5">Your campaign will be limited to only new customers, regardless of your bid strategy</div>
                    </div>
                  </label>

                  {onlyNewCustomers && (
                    <div className="mt-4 bg-[#fce8e6] border border-[#f8dedc] rounded p-4 flex gap-3 ml-7">
                      <AlertCircle className="w-5 h-5 text-[#c5221f] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-[#c5221f] mb-2">This campaign will not run</div>
                        <div className="text-[12px] text-[#c5221f] leading-relaxed mb-3">
                          To fix this campaign, you can either include an audience segment with at least 1,000 active members in at least one network, or turn off this setting until you have added an eligible audience segment.
                        </div>
                        <div className="flex flex-col gap-2 mt-4 max-w-[400px]">
                          <label className="text-[12px] font-medium text-slate-800">Select existing customer list</label>
                          <select
                            value={audienceId}
                            onChange={(e) => setAudienceId(e.target.value)}
                            className="border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 bg-white w-full"
                          >
                            <option value="">Select an audience...</option>
                            {audiences.map((a) => (
                              <option key={a.audienceId} value={a.audienceId}>{a.audienceName}</option>
                            ))}
                          </select>
                          {audiences.length === 0 && (
                            <span className="text-[11px] text-slate-500">No customer lists found for this account.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-[280px] shrink-0 border-l border-slate-200 pl-6 flex flex-col gap-4 text-[12px] text-slate-600 leading-relaxed">
                  <div>
                    By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" className="text-blue-600 hover:underline">Learn more about customer acquisition</a>
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">Smart bidding</span> will be optimized for delivering your ads only to new customers.
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">Note:</span> Your ads may sometimes be shown to existing customers due to technology limitations and privacy measures. <a href="#" className="text-blue-600 hover:underline">Learn more about customer acquisition</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Customer Retention Panel ── */}
        {!isSearch && (
          <div
            id="panel-customer-retention"
            onClick={() => onSubStepChange?.('customer-retention')}
            className="bidding-panel-section bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
              <h2 className="text-[14px] font-medium text-slate-800">Customer retention</h2>
              <ChevronUp className="w-5 h-5 text-slate-500" />
            </div>
            <div className="p-6 flex gap-6">
              {/* Left side */}
              <div className="flex-1 flex flex-col gap-3">
                <label className="flex items-start gap-3 opacity-50 cursor-not-allowed" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    disabled
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                  />
                  <span className="text-[13px] text-slate-800">Adjust your bidding to help re-engage lapsed customers.</span>
                </label>

                {/* Info: no purchase goal */}
                <div className="pl-7">
                  <div className="bg-[#e8f0fe] border border-blue-100 rounded-md p-4 flex gap-3 max-w-[460px]">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-[13px] text-slate-700 leading-relaxed">
                      You can't bid higher for lapsed customers because you don't have a purchase goal in your account. Add a purchase goal to run campaigns that bid higher for specific customer types.
                    </div>
                  </div>
                </div>

                {/* Additional warning when onlyNewCustomers is checked */}
                {onlyNewCustomers && (
                  <div className="pl-7 mt-2">
                    <div className="bg-[#e8f0fe] border border-blue-100 rounded-md p-4 flex gap-3 max-w-[460px]">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-[13px] text-slate-700 leading-relaxed">
                        Customer retention optimization is not available because your customer acquisition is set to only bid for new customers. To use customer retention, set customer acquisition to bid higher for new customers than existing customers.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right description */}
              <div className="w-[280px] shrink-0 border-l border-slate-200 pl-5 text-[12px] text-slate-600 leading-relaxed">
                By default, your campaign does not adjust bidding to re-engage lapsed customers. However, you can configure your customer acquisition settings to optimize for winning back lapsed customers.
                <div className="mt-1">
                  <a href="#" className="text-blue-600 hover:underline" onClick={e => e.preventDefault()}>Learn more about how to re-engage lapsed customers</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-[11px] text-slate-500">
        © Google, 2025.{" "}
        <a href="#" className="text-blue-600 hover:underline" onClick={e => e.preventDefault()}>Leave feedback</a>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-6 py-2 rounded shadow-sm transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
