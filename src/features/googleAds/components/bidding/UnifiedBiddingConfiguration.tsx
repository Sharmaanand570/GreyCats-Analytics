import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import type { BidStrategyType } from "../../types/googleAds.types";
import { useBiddingStrategies } from "../../hooks/useCampaignManagement";

export interface BiddingConfigValue {
  type: BidStrategyType | string;
  targetCpa?: number;
  targetRoas?: number;
  targetImpressionShare?: {
    location: "ANYWHERE_ON_PAGE" | "TOP_OF_PAGE" | "ABSOLUTE_TOP_OF_PAGE";
    locationFractionMicros: number;
    cpcBidCeilingMicros?: number;
  };
  portfolioStrategyId?: string | null;
}

interface UnifiedBiddingConfigurationProps {
  clientId: number;
  value: Partial<BiddingConfigValue>;
  onChange: (value: Partial<BiddingConfigValue>) => void;
  hidePortfolioSelector?: boolean; // For when we are editing a portfolio strategy itself
}

export function UnifiedBiddingConfiguration({ clientId, value, onChange, hidePortfolioSelector }: UnifiedBiddingConfigurationProps) {
  const { data: portfolioStrategies } = useBiddingStrategies(clientId);

  // Derive simple local state based on standard Google Ads UI
  // Usually the UI asks "What do you want to focus on?"
  // Options: Conversions, Conversion value, Impression Share
  
  const [biddingFocus, setBiddingFocus] = useState<"Conversions" | "Conversion value" | "Clicks" | "Impression share">(() => {
    if (value.type === "TARGET_ROAS" || value.type === "MAXIMIZE_CONVERSION_VALUE") return "Conversion value";
    if (value.type === "MAXIMIZE_CLICKS") return "Clicks";
    if (value.type === "TARGET_IMPRESSION_SHARE") return "Impression share";
    return "Conversions";
  });
  
  const [isBiddingDropdownOpen, setIsBiddingDropdownOpen] = useState(false);
  
  // Is it constrained?
  const [hasTarget, setHasTarget] = useState<boolean>(() => {
    return value.type === "TARGET_CPA" || value.type === "TARGET_ROAS" || (value.type === "MAXIMIZE_CLICKS" && !!value.targetImpressionShare?.cpcBidCeilingMicros);
  });

  const handleFocusChange = (focus: "Conversions" | "Conversion value" | "Clicks" | "Impression share") => {
    setBiddingFocus(focus);
    setHasTarget(false);
    if (focus === "Conversions") onChange({ ...value, type: "MAXIMIZE_CONVERSIONS", portfolioStrategyId: null });
    if (focus === "Conversion value") onChange({ ...value, type: "MAXIMIZE_CONVERSION_VALUE", portfolioStrategyId: null });
    if (focus === "Clicks") onChange({ ...value, type: "MAXIMIZE_CLICKS", portfolioStrategyId: null, targetImpressionShare: { location: "ANYWHERE_ON_PAGE", locationFractionMicros: 1000000, cpcBidCeilingMicros: undefined } });
    if (focus === "Impression share") onChange({ ...value, type: "TARGET_IMPRESSION_SHARE", portfolioStrategyId: null, targetImpressionShare: { location: "ANYWHERE_ON_PAGE", locationFractionMicros: 1000000 } });
  };

  const handleTargetToggle = (checked: boolean) => {
    setHasTarget(checked);
    if (checked) {
      if (biddingFocus === "Conversions") onChange({ ...value, type: "TARGET_CPA" });
      if (biddingFocus === "Conversion value") onChange({ ...value, type: "TARGET_ROAS" });
      if (biddingFocus === "Clicks") onChange({ ...value, type: "MAXIMIZE_CLICKS", targetImpressionShare: { ...(value.targetImpressionShare || { location: "ANYWHERE_ON_PAGE", locationFractionMicros: 1000000 }), cpcBidCeilingMicros: 1000000 } }); // default 1
    } else {
      if (biddingFocus === "Conversions") onChange({ ...value, type: "MAXIMIZE_CONVERSIONS" });
      if (biddingFocus === "Conversion value") onChange({ ...value, type: "MAXIMIZE_CONVERSION_VALUE" });
      if (biddingFocus === "Clicks") onChange({ ...value, type: "MAXIMIZE_CLICKS", targetImpressionShare: { ...(value.targetImpressionShare || { location: "ANYWHERE_ON_PAGE", locationFractionMicros: 1000000 }), cpcBidCeilingMicros: undefined } });
    }
  };

  const isUsingPortfolio = !!value.portfolioStrategyId;

  return (
    <div className="flex flex-col gap-5 relative">
      {!hidePortfolioSelector && portfolioStrategies?.strategies && portfolioStrategies.strategies.length > 0 && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input 
              type="radio" 
              name="biddingMode" 
              checked={!isUsingPortfolio}
              onChange={() => onChange({ ...value, portfolioStrategyId: null })}
              className="text-blue-600 focus:ring-blue-500" 
            />
            <span className="text-[13px] font-medium text-slate-800">Use a standard strategy</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input 
              type="radio" 
              name="biddingMode" 
              checked={isUsingPortfolio}
              onChange={() => {
                if (portfolioStrategies.strategies.length > 0) {
                  onChange({ ...value, portfolioStrategyId: portfolioStrategies.strategies[0].id });
                }
              }}
              className="text-blue-600 focus:ring-blue-500" 
            />
            <span className="text-[13px] font-medium text-slate-800">Use a portfolio strategy</span>
          </label>

          {isUsingPortfolio && (
            <div className="ml-6 mt-3">
              <select 
                className="w-full max-w-sm border border-slate-300 rounded px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={value.portfolioStrategyId || ""}
                onChange={(e) => onChange({ ...value, portfolioStrategyId: e.target.value })}
              >
                {portfolioStrategies.strategies.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Configuration Form */}
      {!isUsingPortfolio && (
        <div className="flex flex-col gap-4">
          <div className="relative w-[280px]">
            <div className="flex items-center gap-1 mb-2">
              <label className="text-[13px] text-slate-800">What do you want to focus on?</label>
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            </div>
            
            <div
              className="border border-slate-300 rounded px-3 py-2 flex items-center justify-between w-full cursor-pointer hover:bg-slate-50 bg-white"
              onClick={(e) => { e.stopPropagation(); setIsBiddingDropdownOpen(!isBiddingDropdownOpen); }}
            >
              <span className="text-[13px] text-slate-800">{biddingFocus}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            
            {isBiddingDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-200 shadow-lg rounded z-10 py-1">
                {(["Conversions", "Conversion value", "Clicks", "Impression share"] as const).map(opt => (
                  <div
                    key={opt}
                    className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-slate-100 ${biddingFocus === opt ? "bg-slate-50 font-medium" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleFocusChange(opt); setIsBiddingDropdownOpen(false); }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(biddingFocus === "Conversions" || biddingFocus === "Conversion value" || biddingFocus === "Clicks") && (
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTarget}
                  onChange={(e) => handleTargetToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <span className="text-[13px] text-slate-800">
                  {biddingFocus === "Conversions"
                    ? "Set a target cost per action (optional)"
                    : biddingFocus === "Conversion value" 
                    ? "Set a target return on ad spend (optional)"
                    : "Set a maximum cost per click bid limit (optional)"}
                </span>
              </label>

              {hasTarget && biddingFocus === "Conversions" && (
                <div className="pl-7">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[13px] text-slate-800">Target CPA</span>
                  </div>
                  <div className="border border-slate-300 rounded-sm flex items-center w-[120px] bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                    <span className="pl-3 text-[13px] text-slate-600 font-medium bg-slate-50 py-1.5 border-r border-slate-200 pr-2">₹</span>
                    <input 
                      type="number" 
                      className="w-full outline-none text-[13px] px-2 py-1.5" 
                      value={value.targetCpa ? (value.targetCpa / 1000000) : ""}
                      onChange={(e) => onChange({ ...value, targetCpa: Number(e.target.value) * 1000000 })}
                    />
                  </div>
                </div>
              )}

              {hasTarget && biddingFocus === "Conversion value" && (
                <div className="pl-7">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[13px] text-slate-800">Target ROAS</span>
                  </div>
                  <div className="border border-slate-300 rounded-sm flex items-center w-[120px] bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                    <input 
                      type="number" 
                      className="w-full outline-none text-[13px] px-3 py-1.5 text-right" 
                      value={value.targetRoas ? (value.targetRoas * 100) : ""}
                      onChange={(e) => onChange({ ...value, targetRoas: Number(e.target.value) / 100 })}
                    />
                    <span className="pr-3 text-[13px] text-slate-600 font-medium bg-slate-50 py-1.5 border-l border-slate-200 pl-2">%</span>
                  </div>
                </div>
              )}

              {hasTarget && biddingFocus === "Clicks" && (
                <div className="pl-7">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[13px] text-slate-800">Maximum CPC bid limit</span>
                  </div>
                  <div className="border border-slate-300 rounded-sm flex items-center w-[120px] bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                    <span className="pl-3 text-[13px] text-slate-600 font-medium bg-slate-50 py-1.5 border-r border-slate-200 pr-2">₹</span>
                    <input 
                      type="number" 
                      className="w-full outline-none text-[13px] px-2 py-1.5" 
                      value={value.targetImpressionShare?.cpcBidCeilingMicros ? (value.targetImpressionShare.cpcBidCeilingMicros / 1000000) : ""}
                      onChange={(e) => onChange({ ...value, targetImpressionShare: { ...(value.targetImpressionShare || { location: "ANYWHERE_ON_PAGE", locationFractionMicros: 1000000 }), cpcBidCeilingMicros: Number(e.target.value) * 1000000 } })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {biddingFocus === "Impression share" && (
            <div className="flex flex-col gap-4 mt-2 max-w-md">
              <div>
                <label className="text-[13px] text-slate-800 block mb-1.5">Where do you want your ads to appear?</label>
                <select 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-blue-500"
                  value={value.targetImpressionShare?.location || "ANYWHERE_ON_PAGE"}
                  onChange={(e) => onChange({ 
                    ...value, 
                    targetImpressionShare: { 
                      ...(value.targetImpressionShare || { locationFractionMicros: 1000000 }), 
                      location: e.target.value as any 
                    } 
                  })}
                >
                  <option value="ANYWHERE_ON_PAGE">Anywhere on results page</option>
                  <option value="TOP_OF_PAGE">Top of results page</option>
                  <option value="ABSOLUTE_TOP_OF_PAGE">Absolute top of results page</option>
                </select>
              </div>
              
              <div>
                <label className="text-[13px] text-slate-800 block mb-1.5">Percent (%) impression share to target</label>
                <div className="border border-slate-300 rounded flex items-center w-[120px] bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                  <input 
                    type="number" 
                    className="w-full outline-none text-[13px] px-3 py-1.5 text-right" 
                    value={value.targetImpressionShare ? (value.targetImpressionShare.locationFractionMicros / 10000) : 100}
                    onChange={(e) => onChange({ 
                      ...value, 
                      targetImpressionShare: { 
                        ...(value.targetImpressionShare || { location: "ANYWHERE_ON_PAGE" }), 
                        locationFractionMicros: Number(e.target.value) * 10000 
                      } 
                    })}
                  />
                  <span className="pr-3 text-[13px] text-slate-600 font-medium bg-slate-50 py-1.5 border-l border-slate-200 pl-2">%</span>
                </div>
              </div>

              <div>
                <label className="text-[13px] text-slate-800 block mb-1.5">Maximum CPC bid limit (optional)</label>
                <div className="border border-slate-300 rounded flex items-center w-[120px] bg-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                  <span className="pl-3 text-[13px] text-slate-600 font-medium bg-slate-50 py-1.5 border-r border-slate-200 pr-2">₹</span>
                  <input 
                    type="number" 
                    className="w-full outline-none text-[13px] px-2 py-1.5" 
                    value={value.targetImpressionShare?.cpcBidCeilingMicros ? (value.targetImpressionShare.cpcBidCeilingMicros / 1000000) : ""}
                    onChange={(e) => onChange({ 
                      ...value, 
                      targetImpressionShare: { 
                        ...(value.targetImpressionShare || { location: "ANYWHERE_ON_PAGE", locationFractionMicros: 1000000 }), 
                        cpcBidCeilingMicros: Number(e.target.value) * 1000000 
                      } 
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
