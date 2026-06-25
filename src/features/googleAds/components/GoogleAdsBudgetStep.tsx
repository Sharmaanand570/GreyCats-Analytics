import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";

interface GoogleAdsBudgetStepProps {
  onNext: () => void;
  onBudgetTypeChange?: (type: 'daily' | 'campaign') => void;
}

export default function GoogleAdsBudgetStep({ onNext, onBudgetTypeChange }: GoogleAdsBudgetStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const [budgetType, setBudgetType] = useState<'daily' | 'campaign'>(payload.budgetType?.toLowerCase() as any || 'daily');
  const [budgetAmount, setBudgetAmount] = useState(payload.budgetAmount?.toString() || '');
  const [sharedBudgetId] = useState<string | undefined>(payload.sharedBudgetId);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    updatePayload({
      budgetType: budgetType.toUpperCase() as any,
      budgetAmount: parseFloat(budgetAmount) || 0,
      sharedBudgetId,
    });
  }, [budgetType, budgetAmount, sharedBudgetId, updatePayload]);

  const handleBudgetTypeChange = (type: 'daily' | 'campaign') => {
    setBudgetType(type);
    if (onBudgetTypeChange) {
      onBudgetTypeChange(type);
    }
  };
  
  return (
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <div className="mb-6">
        <h1 className="text-[24px] font-normal text-slate-800 mb-1">Budget</h1>
        <p className="text-[13px] text-slate-600">Decide how much you want to spend.</p>
      </div>

      {/* Budget Panel */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 flex">
        <div className="flex-1 p-6">
          <div className="bg-[#f0f4ff] rounded p-4 flex gap-3 mb-6 items-start">
            <div className="w-4 h-4 rounded-full border border-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-blue-600 font-serif text-[10px] font-bold">
              i
            </div>
            <div className="text-[13px] text-slate-800 leading-relaxed">
              Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.
            </div>
          </div>

          <div className="mb-4">
            <span className="text-[13px] font-medium text-slate-800">Select budget type</span>
          </div>

          <div className="flex flex-col gap-6 w-full">
            {/* Average daily budget */}
            <label className="flex gap-3 cursor-pointer group">
              <div className="pt-0.5">
                <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${budgetType === 'daily' ? 'border-blue-600' : 'border-slate-400 group-hover:border-slate-500'}`}>
                  {budgetType === 'daily' && <div className="w-[10px] h-[10px] rounded-full bg-blue-600"></div>}
                </div>
                <input type="radio" name="budgetType" value="daily" checked={budgetType === 'daily'} onChange={() => handleBudgetTypeChange('daily')} className="hidden" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] text-slate-800 mb-0.5">Average daily budget</div>
                <div className="text-[12px] text-slate-500 mb-3">Set your average daily budget for this campaign</div>
                
                {budgetType === 'daily' && (
                  <div className="flex flex-col gap-3 mt-4">
                    {/* Option 1 */}
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-md cursor-pointer hover:border-slate-300 transition-colors">
                      <input type="radio" name="dailyBudget" onChange={() => setBudgetAmount("1169.65")} className="w-4 h-4 text-blue-600 accent-blue-600" />
                      <span className="text-[13px] text-slate-800 font-medium">₹1,169.65</span>
                    </label>

                    {/* Option 2 (Recommended) */}
                    <label className="flex flex-col gap-3 p-4 border border-blue-500 rounded-md cursor-pointer bg-blue-50/10">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="dailyBudget" defaultChecked onChange={() => setBudgetAmount("974.67")} className="w-4 h-4 text-blue-600 accent-blue-600" />
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-slate-800 font-medium">₹974.67</span>
                          <span className="text-[11px] text-blue-600 font-medium px-1.5 py-0.5 bg-blue-50 rounded">Recommended</span>
                        </div>
                      </div>
                      <div className="pl-7">
                        <div className="text-[12px] text-slate-800 font-medium mb-2">Average daily budget:</div>
                        <div className="flex items-start justify-between text-[11px] mb-3">
                          <div className="flex flex-col">
                            <span className="text-slate-500">Weekly conv.:</span>
                            <span className="font-medium text-slate-800">44</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500">Weekly conversion value</span>
                            <span className="font-medium text-slate-800">₹1,788.51</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500">Avg. conversion value/cost</span>
                            <span className="font-medium text-slate-800">26.21%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500">Weekly cost</span>
                            <span className="font-medium text-slate-800">₹6,822.69</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed max-w-[480px]">
                          Recommended because of your campaign settings, such as bidding, targeting and ads, as well as the budgets of similar advertisers.
                        </div>
                      </div>
                    </label>

                    {/* Option 3 */}
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-md cursor-pointer hover:border-slate-300 transition-colors">
                      <input type="radio" name="dailyBudget" onChange={() => setBudgetAmount("779.74")} className="w-4 h-4 text-blue-600 accent-blue-600" />
                      <span className="text-[13px] text-slate-800 font-medium">₹779.74</span>
                    </label>

                    {/* Custom */}
                    <label className="flex flex-col gap-3 p-4 border border-slate-200 rounded-md cursor-pointer hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="dailyBudget" onChange={() => setBudgetAmount("")} className="w-4 h-4 text-blue-600 accent-blue-600" />
                        <span className="text-[13px] text-slate-800 font-medium">Set custom budget</span>
                      </div>
                      <div className="pl-7">
                        <div className="relative w-[160px]">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-[13px] text-slate-600 pointer-events-none">₹</span>
                          <input 
                            type="number"
                            min="0"
                            className="w-full border border-slate-300 rounded-sm pl-6 pr-3 py-1.5 text-[13px] outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                )}
                
                {/* Warnings */}
                {budgetType === 'daily' && parseFloat(budgetAmount) > 0 && payload.targetCpa && parseFloat(budgetAmount) < payload.targetCpa && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-4 flex gap-3 ml-7">
                    <div className="text-[13px] text-amber-800 leading-relaxed">
                      <span className="font-semibold block mb-1">Budget is lower than your target CPA</span>
                      Your daily budget is lower than your target CPA (₹{payload.targetCpa}). This may prevent your campaign from spending its budget and limit your conversions. Consider increasing your budget or lowering your target CPA.
                    </div>
                  </div>
                )}
                {budgetType === 'daily' && parseFloat(budgetAmount) > 0 && payload.maxCpcBidLimit && parseFloat(budgetAmount) < (payload.maxCpcBidLimit / 1000000) && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-4 flex gap-3 ml-7">
                    <div className="text-[13px] text-amber-800 leading-relaxed">
                      <span className="font-semibold block mb-1">Budget is lower than your max CPC bid</span>
                      Your daily budget is lower than your maximum CPC bid limit. Your ads may not show often. Consider increasing your budget or lowering your max CPC.
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Campaign total budget */}
            <label className="flex gap-3 cursor-pointer group">
              <div className="pt-0.5">
                <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${budgetType === 'campaign' ? 'border-blue-600' : 'border-slate-400 group-hover:border-slate-500'}`}>
                  {budgetType === 'campaign' && <div className="w-[10px] h-[10px] rounded-full bg-blue-600"></div>}
                </div>
                <input type="radio" name="budgetType" value="campaign" checked={budgetType === 'campaign'} onChange={() => handleBudgetTypeChange('campaign')} className="hidden" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] text-slate-800 mb-0.5">Campaign total budget</div>
                <div className="text-[12px] text-slate-500 mb-3">Set a budget for the duration of your campaign</div>

                {budgetType === 'campaign' && (
                  <div>
                    <div className="w-[160px] mb-4">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-[13px] text-slate-600 pointer-events-none">₹</span>
                        <input 
                          type="number"
                          min="0"
                          className={`w-full border rounded-sm pl-6 pr-3 py-1.5 text-[13px] outline-none transition-colors ${isFocused ? 'border-blue-600 ring-1 ring-blue-600' : budgetAmount === '' ? 'border-slate-300' : 'border-slate-300'}`}
                          value={budgetAmount}
                          placeholder=""
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                      <div className="text-[12px] text-slate-700 flex flex-col gap-1">
                        <div>Start date: June 22, 2026</div>
                        <div>End date: None</div>
                      </div>
                      <button className="text-[12px] text-blue-600 font-medium hover:underline">
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Informational sidebar on the right */}
        <div className="w-[300px] p-6 border-l border-slate-200 relative">
          <ChevronUp className="w-5 h-5 text-slate-500 absolute top-4 right-4 cursor-pointer" />
          
          {budgetType === 'daily' ? (
            <div className="pr-6 mt-1">
              <div className="text-[11.5px] text-slate-700 leading-relaxed mb-4">
                For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much.
              </div>
              <a href="#" className="text-[12px] text-blue-600 hover:underline">
                Learn more about average daily budget
              </a>
            </div>
          ) : (
            <div className="pr-6 mt-1">
              <div className="text-[11.5px] text-slate-700 leading-relaxed">
                Your campaign total budget is what the campaign should spend over its runtime. To use a campaign total budget, you must add an end date for your campaign.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between items-center w-full">
         <div className="text-[11px] text-slate-500">
           © Google, 2025.{" "}
           <a href="#" className="text-blue-600 hover:underline" onClick={e => e.preventDefault()}>Leave feedback</a>
         </div>
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
