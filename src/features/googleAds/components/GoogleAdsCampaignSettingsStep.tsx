import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, HelpCircle, Search, X, Settings } from "lucide-react";

interface CampaignSettingsStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
}

export default function GoogleAdsCampaignSettingsStep({ onNext, activeSubStep, onSubStepChange }: CampaignSettingsStepProps) {
  const [location, setLocation] = useState("all");
  const [euPolitical, setEuPolitical] = useState("no");

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
    
    const panels = document.querySelectorAll('.settings-panel-section');
    panels.forEach(p => observer.observe(p));
    
    return () => observer.disconnect();
  }, [onSubStepChange]);

  return (
    <div className="flex flex-col h-full max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[22px] text-slate-800 font-normal mb-1">Campaign settings</h1>
        <p className="text-[13px] text-slate-600">To reach the right people, start by defining key settings for your campaign</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Networks Panel */}
        <div 
          id="panel-networks" 
          onClick={() => onSubStepChange?.('networks')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'networks' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'networks' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Networks</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <div className="flex flex-col gap-5">
               <label className="flex items-start gap-3 cursor-pointer">
                 <input 
                   type="checkbox" 
                   defaultChecked
                   className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" 
                 />
                 <div>
                   <div className="text-[13px] text-slate-800 font-medium">Google Search Partners Network (recommended)</div>
                   <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Ads can appear near Google Search results and on other <a href="#" className="text-blue-600 hover:underline">Google Search Partners</a> websites when people search for terms that are relevant to your keywords. Search Partners can include hundreds of non-Google websites, Parked Domains, as well as YouTube and other Google sites.</div>
                 </div>
               </label>

               <label className="flex items-start gap-3 cursor-pointer">
                 <input 
                   type="checkbox" 
                   defaultChecked
                   className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" 
                 />
                 <div>
                   <div className="text-[13px] text-slate-800 font-medium">Google Display Network (recommended)</div>
                   <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Ads can appear on relevant sites, videos, and apps across Google (like YouTube) and the internet when you have leftover Search budget.</div>
                 </div>
               </label>
             </div>
          </div>
        </div>

        {/* Locations Panel */}
        <div 
          id="panel-locations" 
          onClick={() => onSubStepChange?.('locations')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'locations' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'locations' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Locations</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <div className="flex items-center gap-1 mb-4">
               <label className="text-[13px] text-slate-800">Select locations for this campaign</label>
               <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
             </div>
             
             <div className="flex flex-col gap-3 ml-2">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="radio" 
                   name="location" 
                   checked={location === "all"}
                   onChange={() => setLocation("all")}
                   className="w-4 h-4 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">All countries and territories</span>
               </label>
               
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="radio" 
                   name="location" 
                   checked={location === "india"}
                   onChange={() => setLocation("india")}
                   className="w-4 h-4 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">India</span>
               </label>

               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="radio" 
                   name="location" 
                   checked={location === "another"}
                   onChange={() => setLocation("another")}
                   className="w-4 h-4 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">Enter another location</span>
               </label>
             </div>

             <div className="mt-4 ml-2 flex items-center gap-1 text-blue-600 cursor-pointer hover:underline text-[13px] font-medium">
                <ChevronDown className="w-4 h-4" /> Location options
             </div>
          </div>
        </div>

        {/* Languages Panel */}
        <div 
          id="panel-languages" 
          onClick={() => onSubStepChange?.('languages')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'languages' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'languages' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Languages</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <div className="flex items-center gap-1 mb-4">
               <label className="text-[13px] text-slate-800">Select the languages your customers speak.</label>
               <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
             </div>
             
             <div className="relative w-full max-w-[400px]">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input 
                 type="text" 
                 className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-[13px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Start typing or select a language"
               />
             </div>

             <div className="mt-4 flex flex-wrap gap-2">
               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-[13px] text-slate-700 shadow-sm">
                 English
                 <X className="w-3.5 h-3.5 cursor-pointer text-slate-500 hover:text-slate-700" />
               </div>
             </div>
          </div>
        </div>

        {/* EU political ads Panel */}
        <div 
          id="panel-eu-political-ads" 
          onClick={() => onSubStepChange?.('eu-political-ads')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'eu-political-ads' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'eu-political-ads' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>EU political ads</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 flex gap-6">
             <div className="flex-1">
               <div className="text-[13px] text-slate-800 mb-1">Does your campaign have European Union political ads?</div>
               <div className="text-[11px] text-slate-500 mb-4">Required</div>
               
               <div className="flex flex-col gap-3 ml-2">
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input 
                     type="radio" 
                     name="eupolitical" 
                     checked={euPolitical === "yes"}
                     onChange={() => setEuPolitical("yes")}
                     className="w-4 h-4 text-blue-600" 
                   />
                   <span className="text-[13px] text-slate-800">Yes, this campaign has EU political ads</span>
                 </label>
                 
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input 
                     type="radio" 
                     name="eupolitical" 
                     checked={euPolitical === "no"}
                     onChange={() => setEuPolitical("no")}
                     className="w-4 h-4 text-blue-600" 
                   />
                   <span className="text-[13px] text-slate-800">No, this campaign doesn't have EU political ads</span>
                 </label>
               </div>
             </div>

             <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 flex flex-col justify-center">
               <div className="text-slate-800 mb-1">EU regulation requires Google to ask this question</div>
               <a href="#" className="text-blue-600 hover:underline">Learn how an EU political ad is defined</a>
             </div>
          </div>
        </div>

        {/* Audience segments Panel */}
        <div 
          id="panel-audience-segments" 
          onClick={() => onSubStepChange?.('audience-segments')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'audience-segments' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <div className="flex items-center">
               <h2 className={`text-[14px] w-[180px] ${activeSubStep === 'audience-segments' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Audience segments</h2>
               <span className="text-[13px] text-slate-600 ml-4">Select audience segments to add to your campaign.</span>
             </div>
             <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        {/* More settings */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="px-6 py-4 flex items-center gap-2 text-blue-600">
             <Settings className="w-5 h-5" />
             <span className="text-[14px] font-medium">More settings</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center w-full pb-8">
         <div className="text-[12px] text-slate-500">
            All changes saved
         </div>
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
