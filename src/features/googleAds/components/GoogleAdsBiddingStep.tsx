import { useState, useEffect } from "react";
import { ChevronUp, HelpCircle, Info, AlertCircle } from "lucide-react";

interface BiddingStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
  campaignType?: string;
}

export default function GoogleAdsBiddingStep({ onNext, onSubStepChange, campaignType = "Search" }: BiddingStepProps) {
  const [biddingFocus, setBiddingFocus] = useState("Conversions");
  const [isBiddingDropdownOpen, setIsBiddingDropdownOpen] = useState(false);
  const [setTargetCPA, setSetTargetCPA] = useState(false);
  const [onlyNewCustomers, setOnlyNewCustomers] = useState(false);


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

            {/* What do you want to focus on */}
            {!isSearch && (
              <div className="mb-5">
                <div className="flex items-center gap-1 mb-2">
                  <label className="text-[13px] text-slate-800">What do you want to focus on?</label>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="relative">
                  <div
                    className="border border-slate-300 rounded-sm px-3 py-2 flex items-center justify-between w-[190px] cursor-pointer hover:bg-slate-50 bg-white"
                    onClick={(e) => { e.stopPropagation(); setIsBiddingDropdownOpen(!isBiddingDropdownOpen); }}
                  >
                    <span className="text-[13px] text-slate-800">{biddingFocus}</span>
                    <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {isBiddingDropdownOpen && (
                    <div className="absolute top-full mt-1 left-0 w-[190px] bg-white border border-slate-200 shadow-lg rounded-sm z-10 py-1">
                      {["Conversions", "Conversion value"].map(opt => (
                        <div
                          key={opt}
                          className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-slate-100 ${biddingFocus === opt ? "bg-slate-50 font-medium" : ""}`}
                          onClick={(e) => { e.stopPropagation(); setBiddingFocus(opt); setIsBiddingDropdownOpen(false); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isSearch && (
              <div className="text-[13px] text-slate-800 mb-5 font-medium">Maximize conversions</div>
            )}

            {/* Set a target cost per action checkbox */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={setTargetCPA}
                  onChange={() => setSetTargetCPA(!setTargetCPA)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <span className="text-[13px] text-slate-800">
                  {biddingFocus === "Conversions"
                    ? "Set a target cost per action (optional)"
                    : "Set a target return on ad spend (optional)"}
                </span>
              </label>

              {/* Target CPA input — shown when checkbox is checked */}
              {setTargetCPA && biddingFocus === "Conversions" && (
                <div className="pl-7">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[13px] text-slate-800">Target CPA</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="border border-slate-300 rounded-sm flex items-center w-[120px] mb-3 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="pl-3 text-[13px] text-slate-600">₹</span>
                    <input type="text" className="w-full outline-none text-[13px] px-2 py-1.5" />
                  </div>
                </div>
              )}

              {/* Conversion value tabs — shown when "Conversion value" selected */}
              {!isSearch && !setTargetCPA && biddingFocus === "Conversion value" && (
                <div className="pl-0">
                  <div className="flex border-b border-slate-200 mb-3">
                    <div className="px-4 py-2 text-[13px] font-medium text-blue-600 border-b-2 border-blue-600 cursor-pointer">Conversions</div>
                    <div className="px-4 py-2 text-[13px] text-slate-600 cursor-pointer hover:bg-slate-50">Conversion value</div>
                    <div className="px-4 py-2 text-[13px] text-slate-600 cursor-pointer hover:bg-slate-50 text-blue-600">per action (optional)</div>
                  </div>
                </div>
              )}
            </div>

            {/* Set a target CPA info banner */}
            <div className="mt-4 bg-[#f2fdf5] border border-[#d1f4d9] rounded p-4 flex items-center justify-between max-w-[680px]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-4 h-4 text-[#1e8e3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-[12px] text-slate-800 leading-relaxed">
                  <strong>Set a target CPA:</strong> Get more conversions at a similar CPA by setting a target and staying unconstrained by budget{" "}
                  <HelpCircle className="w-3 h-3 text-slate-400 inline mb-0.5 ml-0.5" />
                </div>
              </div>
              <button className="text-[13px] font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4 shrink-0">
                Apply
              </button>
            </div>

            {/* Alternative bid strategies note */}
            {!isSearch && campaignType !== "Performance Max" && (
              <div className="text-[12px] text-slate-500 mt-3">
                Alternative bid strategies like Maximum CPV, Target CPM, Viewable impressions, Maximize conversion value, Target ROAS are available in this campaign.
              </div>
            )}
          </div>
        </div>

        {/* ── Customer Acquisition Panel ── */}
        <div
          id="panel-acquisition"
          onClick={() => onSubStepChange?.('acquisition')}
          className="bidding-panel-section bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
            <h2 className="text-[14px] font-medium text-slate-800">Customer acquisition</h2>
            <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 flex gap-6">
            {/* Left side */}
            <div className="flex-1 flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={onlyNewCustomers}
                  onChange={() => setOnlyNewCustomers(!onlyNewCustomers)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <span className="text-[13px] text-slate-800">Only bid for new customers</span>
              </label>
              <div className="pl-7 text-[12px] text-slate-500 leading-relaxed">
                Your campaign will be limited to only new customers, regardless of your bid strategy.
              </div>

              {/* Warning when checked */}
              {onlyNewCustomers && (
                <div className="pl-7 mt-2">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex gap-3 max-w-[460px]">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-[13px] text-slate-800 leading-relaxed">
                      <div className="font-medium text-red-700 mb-1">This campaign will not run.</div>
                      To fix this campaign, you can either include an audience segment with at least 1,000 active members in at least one network, or turn off this setting until you have added an eligible audience segment.
                      <div className="mt-2">
                        <a href="#" className="text-blue-600 hover:underline font-medium text-[13px]" onClick={e => e.preventDefault()}>
                          Define existing customer list
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right description */}
            <div className="w-[280px] shrink-0 border-l border-slate-200 pl-5 text-[12px] text-slate-600 leading-relaxed">
              {!onlyNewCustomers ? (
                <>
                  By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers.{" "}
                  <a href="#" className="text-blue-600 hover:underline" onClick={e => e.preventDefault()}>Learn more about customer acquisition</a>
                </>
              ) : (
                <>
                  Smart bidding will be optimized for delivering your ads only to new customers. Due to privacy restrictions, it's not possible to show ads to existing customers due to technology limitations and privacy measures.{" "}
                  <a href="#" className="text-blue-600 hover:underline" onClick={e => e.preventDefault()}>Learn more about customer acquisition</a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Customer Retention Panel (Performance Max only) ── */}
        {campaignType === "Performance Max" && (
          <div
            id="panel-retention"
            onClick={() => onSubStepChange?.('retention')}
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
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex gap-3 max-w-[460px]">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-[13px] text-slate-700 leading-relaxed">
                      You can't bid higher for lapsed customers because you don't have a purchase goal in your account. Add a purchase goal to run campaigns that bid higher for specific customer types.
                    </div>
                  </div>
                </div>

                {/* Additional warning when onlyNewCustomers is checked */}
                {onlyNewCustomers && (
                  <div className="pl-7">
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex gap-3 max-w-[460px]">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-[13px] text-slate-700 leading-relaxed">
                        Customer retention option is not available because your customer acquisition is set to only bid for new customers. To use customer retention, set customer acquisition to bid higher for new customers than existing customers.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right description */}
              <div className="w-[280px] shrink-0 border-l border-slate-200 pl-5 text-[12px] text-slate-600 leading-relaxed">
                By default, your campaign does not adjust bidding to re-engage lapsed customers. However, you can configure your customer acquisition settings in Google to optimize for winning back lapsed customers.
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
