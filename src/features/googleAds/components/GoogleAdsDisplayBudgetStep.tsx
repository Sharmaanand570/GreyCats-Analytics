import { useState } from "react";
import { ChevronUp, ChevronDown, CheckCircle2, HelpCircle } from "lucide-react";

interface BudgetStepProps {
  onNext: () => void;
}

export default function GoogleAdsDisplayBudgetStep({ onNext }: BudgetStepProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("budget");
  const [focusOn, setFocusOn] = useState("conversions");
  const [howToGet, setHowToGet] = useState("auto");
  const [setTarget, setSetTarget] = useState(false);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) setExpandedSection(null);
    else setExpandedSection(section);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[22px] font-normal text-slate-800 mb-2">Budget and bidding</h2>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {/* Budget */}
        <div className="border-b border-slate-200">
          <div 
            onClick={() => toggleSection("budget")}
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col">
              <h3 className={`text-[15px] font-medium ${expandedSection === "budget" ? "text-blue-600" : "text-slate-800"}`}>Budget</h3>
            </div>
            {expandedSection === "budget" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          
          {expandedSection === "budget" && (
            <div className="px-6 pb-6 pt-2 flex gap-8">
              <div className="flex-1">
                <div className="text-[13px] text-slate-800 mb-2">
                  Set your average daily budget for this campaign
                </div>
                <div className="relative w-max">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-[13px]">₹</span>
                  </div>
                  <input 
                    type="text" 
                    className="w-[180px] border border-slate-300 rounded px-3 py-2 pl-7 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="w-[300px] border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed">
                The most you'll pay per month is your daily budget times 30.4 (the average number of days in a month). Some days you might spend more or less than your daily budget. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
              </div>
            </div>
          )}
        </div>

        {/* Bidding */}
        <div className="">
          <div 
            onClick={() => toggleSection("bidding")}
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col">
              <h3 className={`text-[15px] font-medium ${expandedSection === "bidding" ? "text-blue-600" : "text-slate-800"}`}>Bidding</h3>
            </div>
            {expandedSection === "bidding" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          
          {expandedSection === "bidding" && (
            <div className="px-6 pb-8 pt-2">
              <div className="flex flex-col gap-4 max-w-[400px]">
                
                <div>
                  <div className="text-[13px] text-slate-800 flex items-center gap-1 mb-2">
                    What do you want to focus on? <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="relative">
                    <select 
                      value={focusOn}
                      onChange={(e) => setFocusOn(e.target.value)}
                      className="w-full appearance-none border border-slate-300 rounded px-3 py-2 pr-8 text-[13px] text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="conversions">Conversions</option>
                      <option value="conversion_value">Conversion value</option>
                      <option value="clicks">Clicks</option>
                      <option value="impressions">Viewable impressions</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-[12px] text-slate-500 mb-1">Recommended for your campaign goal</div>
                  <div className="text-[13px] text-slate-800 flex items-center gap-1 mb-2">
                    How do you want to get conversions? <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="relative">
                    <select 
                      value={howToGet}
                      onChange={(e) => setHowToGet(e.target.value)}
                      className="w-full appearance-none border border-slate-300 rounded px-3 py-2 pr-8 text-[13px] text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="auto">Automatically maximize conversions</option>
                      <option value="manual">Manual CPC</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-2 w-max">
                  <input 
                    type="checkbox" 
                    checked={setTarget}
                    onChange={(e) => setSetTarget(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                  />
                  <span className="text-[13px] text-slate-800">Set a target cost per action</span>
                </label>

                <div className="bg-[#e6f4ea] rounded-md p-4 mt-2 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                  <div className="text-[13px] text-green-800 font-medium">
                    This campaign will use the Maximize conversions bid strategy to help you get the most conversions for your budget.
                  </div>
                </div>

                <div className="mt-4 text-[13px] text-blue-600 cursor-pointer hover:underline">
                  Or, select a bid strategy directly (not recommended)
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
