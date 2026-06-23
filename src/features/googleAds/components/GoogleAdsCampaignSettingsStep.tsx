import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, HelpCircle, Search, X, Settings, Info } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";

interface CampaignSettingsStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
  campaignType?: string;
}

export default function GoogleAdsCampaignSettingsStep({ onNext, activeSubStep, onSubStepChange, campaignType = "Search" }: CampaignSettingsStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const [location, setLocation] = useState(payload.locations?.type?.toLowerCase() || "all");
  const [euPolitical, setEuPolitical] = useState(payload.euPolitical ? "yes" : "no"); 
  const [searchPartners, setSearchPartners] = useState(payload.networks?.searchPartners ?? true);
  const [displayNetwork, setDisplayNetwork] = useState(payload.networks?.displayNetwork ?? true);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const [languages] = useState<string[]>(payload.languages || ["English"]);
  const [startDate, setStartDate] = useState<string | undefined>(payload.startDate);
  const [endDate, setEndDate] = useState<string | undefined>(payload.endDate);

  useEffect(() => {
    updatePayload({
      locations: { type: location.toUpperCase() as any },
      euPolitical: euPolitical === "yes",
      networks: { searchPartners, displayNetwork },
      languages,
      startDate,
      endDate,
    });
  }, [location, euPolitical, searchPartners, displayNetwork, languages, startDate, endDate, updatePayload]);

  const isPMax = campaignType === "Performance Max";

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
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <div className="mb-6">
        <h1 className="text-[24px] text-slate-800 font-normal mb-2">Campaign settings</h1>
        <p className="text-[13px] text-slate-600">To reach the right people, start by defining key settings for your campaign</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Networks Panel - Hidden for PMax */}
        {!isPMax && (
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
                     checked={searchPartners}
                     onChange={(e) => setSearchPartners(e.target.checked)}
                     className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" 
                   />
                   <div>
                     <div className="text-[13px] text-slate-800 font-medium">Google Search Partners Network (recommended)</div>
                     <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Ads can appear near Google Search results and on other <a href="#" className="text-blue-600 hover:underline">Google Search Partners</a> websites when people search for terms that are relevant to your keywords. Search Partners can include hundreds of non-Google websites, Parked Domains, as well as YouTube and other Google sites.</div>
                   </div>
                 </label>

                 <label className="flex items-start gap-3 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={displayNetwork}
                     onChange={(e) => setDisplayNetwork(e.target.checked)}
                     className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" 
                   />
                   <div>
                     <div className="text-[13px] text-slate-800 font-medium">Google Display Network (recommended)</div>
                     <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Ads can appear on relevant sites, videos, and apps across Google (like YouTube) and the internet when you have leftover Search budget.</div>
                   </div>
                 </label>
               </div>
            </div>
          </div>
        )}

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
                     className="w-4 h-4 text-blue-600 accent-blue-600" 
                   />
                   <span className="text-[13px] text-slate-800">All countries and territories</span>
                 </label>
                 
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input 
                     type="radio" 
                     name="location" 
                     checked={location === "india"}
                     onChange={() => setLocation("india")}
                     className="w-4 h-4 text-blue-600 accent-blue-600" 
                   />
                   <span className="text-[13px] text-slate-800">India</span>
                 </label>

                 <label className="flex items-center gap-3 cursor-pointer">
                   <input 
                     type="radio" 
                     name="location" 
                     checked={location === "another"}
                     onChange={() => setLocation("another")}
                     className="w-4 h-4 text-blue-600 accent-blue-600" 
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
          className="settings-panel-section bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'languages' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Languages</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 pb-8">
             <div className="flex items-center gap-1 mb-4">
               <label className="text-[13px] text-slate-800">Select the languages your customers speak.</label>
               <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
             </div>
             
             <div className="relative w-full max-w-[400px]">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-500" />
               </div>
               <input 
                 type="text" 
                 className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-sm text-[13px] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="Start typing or select a language"
                 onFocus={() => setIsLanguagesOpen(true)}
                 onBlur={() => setTimeout(() => setIsLanguagesOpen(false), 200)}
               />
               
               {isLanguagesOpen && (
                 <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-sm max-h-[300px] overflow-y-auto z-[100] py-2">
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">All languages</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">Arabic</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">Bengali</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">Bulgarian</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">Catalan</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">Chinese (simplified)</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">Chinese (traditional)</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                     <span className="text-[13px] text-slate-800">Croatian</span>
                   </div>
                 </div>
               )}
             </div>

             <div className="mt-4 flex flex-wrap gap-2">
               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-[13px] text-slate-700 shadow-sm">
                 English
                 <X className="w-3.5 h-3.5 cursor-pointer text-slate-500 hover:text-slate-700" />
               </div>
             </div>
          </div>
        </div>

        {/* More Settings Button (Only for PMax) */}
        {isPMax && (
          <div className="mt-2">
            <button className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-blue-600 hover:bg-slate-100 rounded-md transition-colors">
              <Settings className="w-4 h-4" />
              More settings
            </button>
          </div>
        )}

        {/* EU political ads Panel */}
        {!isPMax && (
          <div 
            id="panel-eu-political-ads" 
            onClick={() => onSubStepChange?.('eu-political-ads')}
            className="settings-panel-section bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
               <h2 className={`text-[14px] ${activeSubStep === 'eu-political-ads' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>EU political ads</h2>
               <ChevronUp className="w-5 h-5 text-slate-500" />
            </div>
          <div className="p-6 flex gap-6">
             <div className="flex-1">
               <div className="text-[13px] text-slate-800 mb-1">Does your campaign have European Union political ads?</div>
               <div className="text-[11px] text-slate-500 mb-4">Required</div>
               
               <div className="flex flex-col gap-4 ml-1">
                 <div>
                   <label className="flex items-center gap-3 cursor-pointer mb-2">
                     <input 
                       type="radio" 
                       name="eupolitical" 
                       checked={euPolitical === "yes"}
                       onChange={() => setEuPolitical("yes")}
                       className="w-4 h-4 text-blue-600 accent-blue-600" 
                     />
                     <span className="text-[13px] text-slate-800">Yes, this campaign has EU political ads</span>
                   </label>
                   
                   {euPolitical === "yes" && (
                     <div className="ml-7 bg-[#f8fbff] border border-blue-100 rounded-md p-4 flex gap-3 max-w-[500px]">
                       <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                       <div className="text-[12px] text-slate-700 leading-relaxed">
                         <div className="font-medium text-slate-800 mb-1 text-[13px]">Your campaign can't run in the European Union</div>
                         Google Ads doesn't allow campaigns with EU political ads to run in the EU. You can still run your campaign in other regions. <a href="#" className="text-blue-600 hover:underline">Learn more about the EU political ads policy</a>
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <div>
                   <label className="flex items-center gap-3 cursor-pointer">
                     <input 
                       type="radio" 
                       name="eupolitical" 
                       checked={euPolitical === "no"}
                       onChange={() => setEuPolitical("no")}
                       className="w-4 h-4 text-blue-600 accent-blue-600" 
                     />
                     <span className="text-[13px] text-slate-800">No, this campaign doesn't have EU political ads</span>
                   </label>
                   
                   {euPolitical === "no" && (
                     <div className="ml-7 mt-2 text-[12px] text-slate-500 leading-relaxed max-w-[500px]">
                       I don't plan to use this account to run EU political ads.<br />
                       The same selection will be applied to all new and existing campaigns. You can change this for any campaign at any time.
                     </div>
                   )}
                 </div>
               </div>
             </div>

             <div className="w-[280px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600">
               <div className="text-slate-800 mb-1 leading-snug">EU regulation requires Google to ask this question</div>
               <a href="#" className="text-blue-600 hover:underline">Learn how an EU political ad is defined</a>
             </div>
          </div>
        </div>
        )}
        {/* Audience segments Panel - Hidden for PMax */}
        {!isPMax && (
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
        )}

        {/* Start and end dates */}
        <div 
          id="panel-dates" 
          onClick={() => onSubStepChange?.('dates')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'dates' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'dates' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Start and end dates</h2>
             <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 flex flex-col gap-4 bg-white">
             <div className="flex gap-6 max-w-[500px]">
                <div className="flex flex-col gap-1.5 flex-1">
                   <label className="text-[13px] text-slate-800 font-medium">Start date</label>
                   <input type="date" value={startDate || ""} onChange={e => setStartDate(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                   <label className="text-[13px] text-slate-800 font-medium">End date (Optional)</label>
                   <input type="date" value={endDate || ""} onChange={e => setEndDate(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full" />
                </div>
             </div>
          </div>
        </div>

        {/* More settings */}
        {!isPMax && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="px-6 py-4 flex items-center gap-2 text-blue-600">
               <Settings className="w-5 h-5" />
               <span className="text-[14px] font-medium">More settings</span>
            </div>
          </div>
        )}
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
