import { useState } from "react";
import { Info, ChevronUp } from "lucide-react";

interface GoogleAdsBudgetStepProps {
  onNext: () => void;
}

export default function GoogleAdsBudgetStep({ onNext }: GoogleAdsBudgetStepProps) {
  const [budgetType, setBudgetType] = useState<'daily' | 'campaign'>('daily');
  const [customBudget, setCustomBudget] = useState('1,326.23');
  const [campaignTotalBudget, setCampaignTotalBudget] = useState('');
  
  return (
    <div className="max-w-[800px]">
      <h1 className="text-[24px] font-normal text-slate-800 mb-1">Budget</h1>
      <p className="text-[13px] text-slate-600 mb-6">Decide how much you want to spend.</p>

      {/* Budget Panel */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-[15px] font-medium text-slate-800">Budget</h2>
          <ChevronUp className="w-5 h-5 text-slate-500" />
        </div>
        <div className="p-6">
          <div className="bg-[#e8f0fe] rounded-md p-4 flex gap-3 mb-6">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[13px] text-slate-800 leading-relaxed">
              Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.
            </div>
          </div>

          <div className="mb-4">
            <span className="text-[14px] font-medium text-slate-800">Select budget type</span>
          </div>

          <div className="flex flex-col gap-6 w-full">
            <div className="flex gap-8">
              <div className="flex-1">
                {/* Average daily budget */}
                <div className="flex gap-3 mb-6">
                  <div className="pt-1">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${budgetType === 'daily' ? 'border-blue-600' : 'border-slate-400'}`}
                      onClick={() => setBudgetType('daily')}
                    >
                      {budgetType === 'daily' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] text-slate-800 font-medium mb-1 cursor-pointer" onClick={() => setBudgetType('daily')}>Average daily budget</div>
                    <div className="text-[12px] text-slate-500 mb-4">Set your average daily budget for this campaign</div>
                    
                    {budgetType === 'daily' && (
                      <div className="w-[200px]">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-500 text-[14px]">₹</span>
                          <input 
                            type="text"
                            className="w-full border border-slate-300 rounded-md bg-transparent px-3 py-2 pl-7 text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                            value={customBudget}
                            onChange={(e) => setCustomBudget(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaign total budget */}
                <div className="flex gap-3 mt-2">
                  <div className="pt-1">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${budgetType === 'campaign' ? 'border-blue-600' : 'border-slate-400'}`}
                      onClick={() => setBudgetType('campaign')}
                    >
                      {budgetType === 'campaign' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] text-slate-800 font-medium mb-1 cursor-pointer" onClick={() => setBudgetType('campaign')}>Campaign total budget</div>
                    <div className="text-[12px] text-slate-500 mb-4">Set a budget for the duration of your campaign</div>
                    
                    {budgetType === 'campaign' && (
                      <div className="flex flex-col mt-2 max-w-[300px]">
                        <div className="relative mb-6">
                          <span className="absolute left-3 top-2.5 text-slate-500 text-[14px]">₹</span>
                          <input 
                            type="text"
                            placeholder="0.00"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 pl-7 text-[14px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                            value={campaignTotalBudget}
                            onChange={(e) => setCampaignTotalBudget(e.target.value)}
                            autoFocus
                          />
                        </div>
                        
                        <div className="bg-slate-50/50 rounded p-4 flex justify-between items-center text-[12px] border border-slate-100">
                          <div className="flex flex-col gap-1 text-slate-600">
                            <div>Start date: June 4, 2026</div>
                            <div>End date: None</div>
                          </div>
                          <button className="text-blue-600 font-medium hover:underline">Edit</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informational sidebar on the right */}
              {budgetType === 'daily' && (
                <div className="w-[280px] pl-6 border-l border-slate-200">
                  <div className="text-[12px] text-slate-500 leading-relaxed mb-4">
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
      </div>

      <div className="flex justify-end mt-6">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-[14px] px-6 py-2 rounded transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
