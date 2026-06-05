import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, Settings, BarChart2 } from "lucide-react";

interface AIMaxStepProps {
  onNext: () => void;
}

export default function GoogleAdsAIMaxStep({ onNext }: AIMaxStepProps) {
  const [optimizeWithAi, setOptimizeWithAi] = useState(false);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

  const togglePanel = (panel: string) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  return (
    <div className="flex flex-col h-full max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[22px] text-slate-800 font-normal mb-1">AI Max for Search campaigns</h1>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="w-[60px] shrink-0">
               {/* Mock Icon Graphic for AI Max */}
               <div className="w-full aspect-[4/3] bg-slate-100 border border-slate-200 rounded flex items-center justify-center relative overflow-hidden">
                 <div className="w-8 h-8 rounded border border-blue-200 flex items-center justify-center bg-white shadow-sm">
                   <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                 </div>
                 <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-yellow-400"></div>
               </div>
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-slate-800 mb-1">Get the best AI-powered performance on Google Search</h2>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Advertisers that activate AI Max in Search Campaigns will typically see 14% more conversions or conversion value at a similar CPA / ROAS
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-6 flex flex-col gap-5 border border-slate-100">
            <div className="flex gap-4">
              <TrendingUp className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-[13px] leading-relaxed text-slate-700">
                <span className="font-medium text-slate-800">Engage more customers and boost performance:</span> Easily expand your keywords with broad match technology and let Google AI match content from your landing pages and assets to help you show up on more relevant searches. New ad group settings help you guide which customers you reach.
              </div>
            </div>
            
            <div className="flex gap-4">
              <Settings className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-[13px] leading-relaxed text-slate-700">
                <span className="font-medium text-slate-800">Tailor your ads and keep them fresh:</span> Use Google AI to serve the most relevant ad copy and landing pages to each customer based on their unique interest and intent.
              </div>
            </div>

            <div className="flex gap-4">
              <BarChart2 className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-[13px] leading-relaxed text-slate-700">
                <span className="font-medium text-slate-800">Take charge and understand how the newest and best Google AI is working for you:</span> You'll get new actionable insights in search term reports that show how AI Max improves performance.
              </div>
            </div>

            <div className="mt-2">
              <a href="#" className="text-[13px] text-blue-600 hover:underline font-medium">Learn more</a>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
           <label className="flex items-center gap-3 cursor-pointer w-max">
             <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${optimizeWithAi ? 'bg-blue-600' : 'bg-slate-300'}`}>
               <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${optimizeWithAi ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: optimizeWithAi ? 'translateX(18px)' : 'translateX(3px)' }}/>
             </div>
             <span className="text-[13px] text-slate-800">Optimize your campaign with AI Max</span>
           </label>
           
           {/* Invisible checkbox for actual state management */}
           <input 
             type="checkbox" 
             className="hidden" 
             checked={optimizeWithAi} 
             onChange={() => setOptimizeWithAi(!optimizeWithAi)} 
           />
        </div>

        <div className="border-t border-slate-200">
          {/* Asset optimization panel */}
          <div 
            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 border-b border-slate-200"
            onClick={() => togglePanel('assetOpt')}
          >
            <div className="flex items-center gap-12 w-full">
               <span className="text-[13px] text-slate-800 font-medium w-[160px]">Asset optimization</span>
               <span className="text-[13px] text-slate-500">Text customization and Final URL expansion turned off</span>
            </div>
            {openPanels['assetOpt'] ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
          </div>
          {openPanels['assetOpt'] && (
            <div className="p-6 bg-white border-b border-slate-200">
               <div className="text-[13px] text-slate-600">Asset optimization settings would go here...</div>
            </div>
          )}

          {/* Branded searches panel */}
          <div 
            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
            onClick={() => togglePanel('branded')}
          >
            <div className="flex items-center gap-12 w-full">
               <span className="text-[13px] text-slate-800 font-medium w-[160px]">Branded searches</span>
               <span className="text-[13px] text-slate-500">Showing ads on all relevant searches</span>
            </div>
            {openPanels['branded'] ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
          </div>
          {openPanels['branded'] && (
            <div className="p-6 bg-white border-t border-slate-200">
               <div className="text-[13px] text-slate-600">Branded searches settings would go here...</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6 w-full max-w-[800px]">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
