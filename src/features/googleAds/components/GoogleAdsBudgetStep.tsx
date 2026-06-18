import { useState } from "react";
import { ChevronUp } from "lucide-react";

interface GoogleAdsBudgetStepProps {
  onNext: () => void;
}

export default function GoogleAdsBudgetStep({ onNext }: GoogleAdsBudgetStepProps) {
  const [budgetType, setBudgetType] = useState<'daily' | 'campaign'>('daily');
  const [budgetAmount, setBudgetAmount] = useState('e'); // Default to 'e' to match the screenshot
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <div className="mb-6">
        <h1 className="text-[24px] font-normal text-slate-800 mb-1">Budget</h1>
        <p className="text-[13px] text-slate-600">Decide how much you want to spend.</p>
      </div>

      {/* Budget Panel */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
          <h2 className="text-[14px] font-medium text-slate-800">Budget</h2>
          <ChevronUp className="w-5 h-5 text-slate-500" />
        </div>
        <div className="p-6">
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

          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 flex flex-col">
              {/* Average daily budget */}
              <label className="flex gap-3 mb-6 cursor-pointer group">
                <div className="pt-0.5">
                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${budgetType === 'daily' ? 'border-blue-600' : 'border-slate-400 group-hover:border-slate-500'}`}>
                    {budgetType === 'daily' && <div className="w-[10px] h-[10px] rounded-full bg-blue-600"></div>}
                  </div>
                  <input type="radio" name="budgetType" value="daily" checked={budgetType === 'daily'} onChange={() => setBudgetType('daily')} className="hidden" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-slate-800 mb-0.5">Average daily budget</div>
                  <div className="text-[12px] text-slate-500 mb-3">Set your average daily budget for this campaign</div>
                  
                  {budgetType === 'daily' && (
                    <div className="w-[200px]">
                      <div className="relative">
                        <input 
                          type="text"
                          className={`w-full border rounded-sm px-3 py-1.5 text-[13px] outline-none transition-colors ${isFocused ? 'border-blue-600 ring-1 ring-blue-600' : budgetAmount === 'e' || budgetAmount === '' ? 'border-red-600' : 'border-slate-300'}`}
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          autoFocus
                        />
                        {(budgetAmount === 'e' || budgetAmount === '') && (
                          <div className="text-red-600 text-[12px] mt-1">Value is required</div>
                        )}
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
                  <input type="radio" name="budgetType" value="campaign" checked={budgetType === 'campaign'} onChange={() => setBudgetType('campaign')} className="hidden" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-slate-800 mb-0.5">Campaign total budget</div>
                  <div className="text-[12px] text-slate-500">Set a budget for the duration of your campaign</div>
                </div>
              </label>
            </div>

            {/* Informational sidebar on the right */}
            {budgetType === 'daily' && (
              <div className="w-[280px] pl-6 border-l border-slate-200">
                <div className="text-[12px] text-slate-600 leading-relaxed mb-4">
                  For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much.
                </div>
                <a href="#" className="text-[12px] text-blue-600 hover:underline">
                  Learn more about average daily budget
                </a>
              </div>
            )}
          </div>
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
