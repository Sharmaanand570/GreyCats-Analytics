import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Info } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";

interface BudgetStepProps {
  onNext: () => void;
}

export default function GoogleAdsShoppingBudgetStep({ onNext }: BudgetStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();
  const [budgetAmount, setBudgetAmount] = useState(payload.budgetAmount ? String(payload.budgetAmount) : "");
  const [onlyNewCustomers, setOnlyNewCustomers] = useState(!!payload.onlyNewCustomers);

  useEffect(() => {
    updatePayload({
      budgetAmount: parseFloat(budgetAmount) || 0,
      budgetType: "DAILY",
      biddingFocus: "CLICKS", // Shopping default: Manual CPC
      onlyNewCustomers,
    });
  }, [budgetAmount, onlyNewCustomers, updatePayload]);

  const [expanded, setExpanded] = useState({
    budget: true,
    bidding: true,
    customerAcquisition: true,
    campaignPriority: true,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1000px]">
      <div>
        <h2 className="text-[22px] font-normal text-slate-800 mb-1">Budget and bidding optimization</h2>
        <p className="text-[13px] text-slate-600">Select optimization options that work best for your goals</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Budget */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div 
            onClick={() => toggleSection("budget")}
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
          >
            <h3 className="text-[14px] font-medium text-slate-800">Budget</h3>
            {expanded.budget ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {expanded.budget && (
            <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-[#e8f0fe] rounded p-4 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-[13px] text-slate-700 leading-relaxed">
                    Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-[13px] font-medium text-slate-800">Select budget type</div>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="radio" name="budget_type" defaultChecked className="mt-1 w-4 h-4 text-blue-600" />
                    <div className="flex flex-col gap-3 w-full">
                      <div>
                        <div className="text-[13px] text-slate-800">Average daily budget</div>
                        <div className="text-[12px] text-slate-500">Set an average daily budget for this campaign</div>
                      </div>
                      <div className="relative w-full max-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 text-[13px]">₹</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          className="w-full border border-slate-300 rounded px-3 py-2 pl-7 text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer mt-2">
                    <input type="radio" name="budget_type" className="mt-1 w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-[13px] text-slate-800">Campaign total budget</div>
                      <div className="text-[12px] text-slate-500">Set a budget for the duration of your campaign</div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed">
                For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much.
                <div className="mt-2"><a href="#" className="text-blue-600 hover:underline">Learn more</a></div>
              </div>
            </div>
          )}
        </div>

        {/* Bidding */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div 
            onClick={() => toggleSection("bidding")}
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
          >
            <h3 className="text-[14px] font-medium text-slate-800">Bidding</h3>
            {expanded.bidding ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {expanded.bidding && (
            <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-1 text-[13px] text-slate-800">
                  Select your bid strategy <Info className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="relative w-full max-w-[300px]">
                  <select className="w-full border border-slate-300 rounded px-3 py-2 pr-8 text-[13px] text-slate-800 outline-none appearance-none bg-white">
                    <option>Manual CPC</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed">
                With "Manual CPC" bidding, you set your own maximum cost-per-click (CPC) for your ads.
                <div className="mt-2"><a href="#" className="text-blue-600 hover:underline">Learn more about determining a bid strategy</a></div>
              </div>
            </div>
          )}
        </div>

        {/* Customer acquisition */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div 
            onClick={() => toggleSection("customerAcquisition")}
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
          >
            <h3 className="text-[14px] font-medium text-slate-800">Customer acquisition</h3>
            {expanded.customerAcquisition ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {expanded.customerAcquisition && (
            <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
              <div className="flex-1 flex flex-col gap-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyNewCustomers}
                    onChange={(e) => setOnlyNewCustomers(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded-sm text-blue-600"
                  />
                  <div>
                    <div className="text-[13px] text-slate-800">Only bid for new customers</div>
                    <div className="text-[12px] text-slate-500 mt-1">Your campaign will be limited to only new customers, regardless of your bid strategy</div>
                  </div>
                </label>
              </div>
              <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed">
                By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" className="text-blue-600 hover:underline">Learn more about customer acquisition</a>
              </div>
            </div>
          )}
        </div>

        {/* Campaign priority */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div 
            onClick={() => toggleSection("campaignPriority")}
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
          >
            <h3 className="text-[14px] font-medium text-slate-800 flex items-center gap-2">
              Campaign priority <Info className="w-3.5 h-3.5 text-slate-500" />
            </h3>
            {expanded.campaignPriority ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {expanded.campaignPriority && (
            <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
              <div className="flex-1 flex flex-col gap-3">
                <div className="text-[13px] text-slate-800 flex items-center gap-1 mb-2">
                  Select a campaign priority <Info className="w-3.5 h-3.5 text-slate-500" />
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="priority" defaultChecked className="w-4 h-4 text-blue-600" />
                  <span className="text-[13px] text-slate-800">Low (default) – Recommended if you only have one Shopping campaign</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="priority" className="w-4 h-4 text-blue-600" />
                  <span className="text-[13px] text-slate-800">Medium</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="priority" className="w-4 h-4 text-blue-600" />
                  <span className="text-[13px] text-slate-800">High</span>
                </label>
              </div>
              <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed flex flex-col gap-1">
                <span className="font-medium text-slate-800">When to use it</span>
                If you have multiple campaigns with one product, use campaign priority to decide which campaign's bid will be used. If campaigns have the same priority, the campaign with the higher bid will serve.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded">
          Next
        </button>
      </div>
    </div>
  );
}
