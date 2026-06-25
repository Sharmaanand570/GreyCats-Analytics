import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, HelpCircle, Search, X, Settings, Info, Plus, Minus } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import LocationSelector, { type SelectedGeo } from "./LocationSelector";

interface CampaignSettingsStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
  campaignType?: string;
}

const AVAILABLE_LANGUAGES = [
  "All languages", "Arabic", "Bengali", "Bulgarian", "Catalan", "Chinese (simplified)", 
  "Chinese (traditional)", "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian", 
  "Filipino", "Finnish", "French", "German", "Greek", "Gujarati", "Hebrew", "Hindi", 
  "Hungarian", "Indonesian", "Italian", "Japanese", "Kannada", "Korean", "Latvian", 
  "Lithuanian", "Malay", "Malayalam", "Marathi", "Norwegian", "Persian", "Polish", 
  "Portuguese", "Punjabi", "Romanian", "Russian", "Serbian", "Slovak", "Slovenian", 
  "Spanish", "Swedish", "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese"
];

export default function GoogleAdsCampaignSettingsStep({ onNext, activeSubStep, onSubStepChange, campaignType = "Search" }: CampaignSettingsStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const [location, setLocation] = useState(
    payload.locations?.type === "OTHER" ? "other" : "all"
  );
  const [selectedGeos, setSelectedGeos] = useState<SelectedGeo[]>(() => {
    const loc = payload.locations;
    if (!loc) return [];
    const names = loc.geoTargetNames || {};
    const inc = (loc.geoTargetConstantIds || []).map((id) => ({ id, name: names[id] || id, excluded: false }));
    const exc = (loc.excludedGeoTargetConstantIds || []).map((id) => ({ id, name: names[id] || id, excluded: true }));
    return [...inc, ...exc];
  });
  const [euPolitical, setEuPolitical] = useState(payload.euPolitical ? "yes" : "no"); 
  const [searchPartners, setSearchPartners] = useState(payload.networks?.searchPartners ?? true);
  const [displayNetwork, setDisplayNetwork] = useState(payload.networks?.displayNetwork ?? true);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const [languages, setLanguages] = useState<string[]>(payload.languages || ["English"]);
  const [languageSearchQuery, setLanguageSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(payload.startDate);
  const [endDate, setEndDate] = useState<string | undefined>(payload.endDate);
  const [adSchedule, setAdSchedule] = useState<any[]>(payload.adSchedule || []);
  const [devices, setDevices] = useState<any[]>(payload.devices || []);
  const [trackingUrlTemplate, setTrackingUrlTemplate] = useState<string>(payload.trackingUrlTemplate || "");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>(payload.finalUrlSuffix || "");
  const [merchantId, setMerchantId] = useState<string>(payload.merchantId || "");
  const [salesCountry, setSalesCountry] = useState<string>(payload.salesCountry || "IN");

  // Broad Match & ACA
  const [broadMatchEnabled, setBroadMatchEnabled] = useState<boolean>(payload.broadMatchEnabled ?? true);
  const [acaTextEnabled, setAcaTextEnabled] = useState<boolean>(payload.automaticallyCreatedAssets?.textEnabled ?? true);
  const [acaFinalUrlEnabled, setAcaFinalUrlEnabled] = useState<boolean>(payload.automaticallyCreatedAssets?.finalUrlExpansionEnabled ?? false);
  const [acaExcludedUrls, setAcaExcludedUrls] = useState<string>(payload.automaticallyCreatedAssets?.excludedUrls?.join("\n") || "");

  // More Settings
  const [moreSettingsOpen, setMoreSettingsOpen] = useState(false);
  const [adRotation, setAdRotation] = useState<"OPTIMIZE" | "DO_NOT_OPTIMIZE">(payload.adRotation || "OPTIMIZE");
  const [dsaEnabled, setDsaEnabled] = useState(!!payload.dynamicSearchAds?.domain);
  const [dsaDomain, setDsaDomain] = useState(payload.dynamicSearchAds?.domain || "");
  const [dsaLanguage, setDsaLanguage] = useState(payload.dynamicSearchAds?.language || "en");
  const [dsaTargetingSource, setDsaTargetingSource] = useState<"WEBSITE" | "FEED" | "BOTH">(payload.dynamicSearchAds?.targetingSource || "WEBSITE");
  const [brandRestrictionsInput, setBrandRestrictionsInput] = useState(payload.brandRestrictions?.join(", ") || "");

  useEffect(() => {
    updatePayload({
      locations: {
        type: location === "other" ? "OTHER" : "ALL",
        geoTargetConstantIds: selectedGeos.filter((g) => !g.excluded).map((g) => g.id),
        excludedGeoTargetConstantIds: selectedGeos.filter((g) => g.excluded).map((g) => g.id),
        geoTargetNames: Object.fromEntries(selectedGeos.map((g) => [g.id, g.name])),
      },
      euPolitical: euPolitical === "yes",
      networks: { searchPartners, displayNetwork },
      languages,
      startDate,
      endDate,
      adSchedule,
      devices,
      trackingUrlTemplate,
      finalUrlSuffix,
      merchantId,
      salesCountry,
      broadMatchEnabled,
      automaticallyCreatedAssets: {
        textEnabled: acaTextEnabled,
        finalUrlExpansionEnabled: acaFinalUrlEnabled,
        excludedUrls: acaExcludedUrls.split("\n").map(u => u.trim()).filter(Boolean),
      },
      adRotation,
      dynamicSearchAds: dsaEnabled && dsaDomain ? { domain: dsaDomain, language: dsaLanguage, targetingSource: dsaTargetingSource } : undefined,
      brandRestrictions: brandRestrictionsInput.split(",").map(b => b.trim()).filter(Boolean),
    });
  }, [
    location, selectedGeos, euPolitical, searchPartners, displayNetwork, languages, startDate, endDate,
    adSchedule, devices, trackingUrlTemplate, finalUrlSuffix, merchantId, salesCountry,
    broadMatchEnabled, acaTextEnabled, acaFinalUrlEnabled, acaExcludedUrls,
    adRotation, dsaEnabled, dsaDomain, dsaLanguage, dsaTargetingSource, brandRestrictionsInput,
    updatePayload
  ]);

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

        {/* Merchant Center Panel - Only for PMax if desired, or for any campaign if specified */}
        {isPMax && (
          <div 
            id="panel-merchant-center" 
            onClick={() => onSubStepChange?.('merchantCenter')}
            className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'merchantCenter' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
               <h2 className={`text-[14px] ${activeSubStep === 'merchantCenter' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Merchant Center account</h2>
                 <ChevronUp className="w-5 h-5 text-slate-500" />
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-4 max-w-[400px]">
                <div>
                  <label className="text-[13px] text-slate-800 block mb-1">Select a Merchant Center account</label>
                  <input 
                    type="text" 
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    placeholder="e.g. 123456789"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="text-[13px] text-slate-800 block mb-1">Country of sale</label>
                  <select 
                    value={salesCountry}
                    onChange={(e) => setSalesCountry(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none bg-white"
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
              <div className="text-[12px] text-slate-500 mt-4">
                Products from this account will be used in your campaign.
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
                     checked={location === "other"}
                     onChange={() => setLocation("other")}
                     className="w-4 h-4 text-blue-600 accent-blue-600"
                   />
                   <span className="text-[13px] text-slate-800">Enter another location</span>
                 </label>
               </div>

               {location === "other" && (
                 <div className="mt-4 ml-2">
                   <LocationSelector value={selectedGeos} onChange={setSelectedGeos} />
                   {selectedGeos.filter((g) => !g.excluded).length === 0 && (
                     <div className="mt-2 text-[12px] text-[#c5221f]">Add at least one location to target</div>
                   )}
                 </div>
               )}
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
                  value={languageSearchQuery}
                  onChange={(e) => setLanguageSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-sm text-[13px] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Start typing or select a language"
                  onFocus={() => setIsLanguagesOpen(true)}
                  onBlur={() => setTimeout(() => setIsLanguagesOpen(false), 200)}
                />
                
                {isLanguagesOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-sm max-h-[300px] overflow-y-auto z-[100] py-2">
                    {AVAILABLE_LANGUAGES
                      .filter(lang => lang.toLowerCase().includes(languageSearchQuery.toLowerCase()))
                      .map(lang => (
                        <div 
                          key={lang} 
                          onClick={() => {
                            if (lang === "All languages") {
                              setLanguages(["All languages"]);
                            } else {
                              const withoutAll = languages.filter(l => l !== "All languages");
                              if (withoutAll.includes(lang)) {
                                setLanguages(withoutAll.filter(l => l !== lang));
                              } else {
                                setLanguages([...withoutAll, lang]);
                              }
                            }
                            setLanguageSearchQuery("");
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer"
                        >
                          <input 
                            type="checkbox" 
                            checked={languages.includes(lang)}
                            readOnly
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 pointer-events-none" 
                          />
                          <span className="text-[13px] text-slate-800">{lang}</span>
                        </div>
                    ))}
                    {AVAILABLE_LANGUAGES.filter(lang => lang.toLowerCase().includes(languageSearchQuery.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-[13px] text-slate-500 text-center">No languages found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {languages.map(lang => (
                  <div key={lang} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-[13px] text-slate-700 shadow-sm">
                    {lang}
                    <X 
                      className="w-3.5 h-3.5 cursor-pointer text-slate-500 hover:text-slate-700" 
                      onClick={() => setLanguages(languages.filter(l => l !== lang))}
                    />
                  </div>
                ))}
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

        {/* Ad schedule */}
        <div 
          id="panel-schedule" 
          onClick={() => onSubStepChange?.('schedule')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'schedule' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'schedule' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Ad schedule</h2>
             <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 flex flex-col gap-4 bg-white">
            <div className="text-[13px] text-slate-600 mb-2">Set times when your ads can show</div>
            
            {adSchedule.map((schedule, idx) => (
              <div key={idx} className="flex gap-3 items-center mb-2">
                <select 
                  value={schedule.dayOfWeek}
                  onChange={(e) => {
                    const newSchedule = [...adSchedule];
                    newSchedule[idx].dayOfWeek = e.target.value;
                    setAdSchedule(newSchedule);
                  }}
                  className="border border-slate-300 rounded px-3 py-2 text-[13px] min-w-[120px]"
                >
                  <option value="MONDAY">Monday</option>
                  <option value="TUESDAY">Tuesday</option>
                  <option value="WEDNESDAY">Wednesday</option>
                  <option value="THURSDAY">Thursday</option>
                  <option value="FRIDAY">Friday</option>
                  <option value="SATURDAY">Saturday</option>
                  <option value="SUNDAY">Sunday</option>
                  <option value="ALL_DAYS">All Days</option>
                  <option value="MONDAY_TO_FRIDAY">Monday to Friday</option>
                </select>
                
                <div className="flex gap-1 items-center">
                  <select 
                    value={schedule.startHour}
                    onChange={(e) => {
                      const newSchedule = [...adSchedule];
                      newSchedule[idx].startHour = parseInt(e.target.value);
                      setAdSchedule(newSchedule);
                    }}
                    className="border border-slate-300 rounded px-2 py-2 text-[13px]"
                  >
                    {Array.from({length: 24}).map((_, i) => <option key={`sh-${i}`} value={i}>{i.toString().padStart(2, '0')}</option>)}
                  </select>
                  <span className="text-[13px] text-slate-500">:</span>
                  <select 
                    value={schedule.startMinute}
                    onChange={(e) => {
                      const newSchedule = [...adSchedule];
                      newSchedule[idx].startMinute = parseInt(e.target.value);
                      setAdSchedule(newSchedule);
                    }}
                    className="border border-slate-300 rounded px-2 py-2 text-[13px]"
                  >
                    {[0, 15, 30, 45].map(m => <option key={`sm-${m}`} value={m}>{m.toString().padStart(2, '0')}</option>)}
                  </select>
                </div>
                
                <span className="text-[13px] text-slate-500">to</span>

                <div className="flex gap-1 items-center">
                  <select 
                    value={schedule.endHour}
                    onChange={(e) => {
                      const newSchedule = [...adSchedule];
                      newSchedule[idx].endHour = parseInt(e.target.value);
                      setAdSchedule(newSchedule);
                    }}
                    className="border border-slate-300 rounded px-2 py-2 text-[13px]"
                  >
                    {Array.from({length: 25}).map((_, i) => <option key={`eh-${i}`} value={i}>{i.toString().padStart(2, '0')}</option>)}
                  </select>
                  <span className="text-[13px] text-slate-500">:</span>
                  <select 
                    value={schedule.endMinute}
                    onChange={(e) => {
                      const newSchedule = [...adSchedule];
                      newSchedule[idx].endMinute = parseInt(e.target.value);
                      setAdSchedule(newSchedule);
                    }}
                    className="border border-slate-300 rounded px-2 py-2 text-[13px]"
                  >
                    {[0, 15, 30, 45].map(m => <option key={`em-${m}`} value={m}>{m.toString().padStart(2, '0')}</option>)}
                  </select>
                </div>

                <button 
                  onClick={() => setAdSchedule(adSchedule.filter((_, i) => i !== idx))}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => setAdSchedule([...adSchedule, { dayOfWeek: "MONDAY", startHour: 0, startMinute: 0, endHour: 24, endMinute: 0 }])}
              className="text-[13px] font-medium text-blue-600 hover:underline w-fit"
            >
              + Add schedule
            </button>
          </div>
        </div>

        {/* Devices */}
        <div 
          id="panel-devices" 
          onClick={() => onSubStepChange?.('devices')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'devices' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'devices' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Devices</h2>
             <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 flex flex-col gap-4 bg-white">
            <div className="text-[13px] text-slate-600 mb-2">Show ads on specific devices and set bid adjustments</div>
            
            {['Desktop', 'Mobile', 'Tablet'].map((deviceType) => {
              const existing = devices.find(d => d.type === deviceType);
              const isSelected = !!existing;
              return (
                <div key={deviceType} className="flex gap-4 items-center">
                  <label className="flex items-center gap-3 cursor-pointer w-[120px]">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDevices([...devices, { type: deviceType, bidModifier: 0 }]);
                        } else {
                          setDevices(devices.filter(d => d.type !== deviceType));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" 
                    />
                    <span className="text-[13px] text-slate-800">{deviceType}</span>
                  </label>
                  
                  {isSelected && (
                    <div className="flex gap-2 items-center">
                      <span className="text-[12px] text-slate-500">Bid adj. (%)</span>
                      <input 
                        type="number" 
                        value={existing.bidModifier || 0}
                        onChange={(e) => {
                          const newDevices = [...devices];
                          const idx = newDevices.findIndex(d => d.type === deviceType);
                          newDevices[idx].bidModifier = parseInt(e.target.value) || 0;
                          setDevices(newDevices);
                        }}
                        className="border border-slate-300 rounded px-2 py-1 text-[13px] w-[80px]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign URL options */}
        <div 
          id="panel-url-options" 
          onClick={() => onSubStepChange?.('url-options')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'url-options' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'url-options' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Campaign URL options</h2>
             <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 flex flex-col gap-4 bg-white">
             <div className="flex flex-col gap-1.5 max-w-[500px]">
                <label className="text-[13px] text-slate-800 font-medium">Tracking template</label>
                <div className="text-[11px] text-slate-500 mb-1">E.g. {'{lpurl}?utm_source=google'}</div>
                <input 
                  type="text" 
                  value={trackingUrlTemplate} 
                  onChange={e => setTrackingUrlTemplate(e.target.value)} 
                  placeholder="{lpurl}"
                  className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full" 
                />
             </div>
             <div className="flex flex-col gap-1.5 max-w-[500px] mt-2">
                <label className="text-[13px] text-slate-800 font-medium">Final URL suffix</label>
                <div className="text-[11px] text-slate-500 mb-1">E.g. param1=value1&param2=value2</div>
                <input 
                  type="text" 
                  value={finalUrlSuffix} 
                  onChange={e => setFinalUrlSuffix(e.target.value)} 
                  className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full" 
                />
             </div>
          </div>
        </div>

        {/* Broad Match Keywords */}
        {!isPMax && (
          <div
            id="panel-broad-match"
            onClick={() => onSubStepChange?.('broad-match')}
            className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'broad-match' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
              <h2 className={`text-[14px] ${activeSubStep === 'broad-match' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Broad match keywords</h2>
              <ChevronDown className="w-5 h-5 text-slate-500" />
            </div>
            <div className="p-6">
              <label className="flex items-start gap-3 cursor-pointer" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={broadMatchEnabled}
                  onChange={e => setBroadMatchEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Use broad match (recommended)</div>
                  <div className="text-[12px] text-slate-500 mt-0.5 leading-relaxed max-w-[520px]">
                    Show ads on searches related to your keywords. Broad match works best with Smart Bidding strategies. <a href="#" className="text-blue-600 hover:underline" onClick={e => e.preventDefault()}>Learn more</a>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Automatically Created Assets (ACA) */}
        {!isPMax && (
          <div
            id="panel-aca"
            onClick={() => onSubStepChange?.('aca')}
            className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'aca' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
              <h2 className={`text-[14px] ${activeSubStep === 'aca' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Automatically created assets</h2>
              <ChevronDown className="w-5 h-5 text-slate-500" />
            </div>
            <div className="p-6 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
              <div className="bg-[#e8f0fe] rounded p-3 flex gap-2 items-start">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-[12px] text-slate-700 leading-relaxed">
                  Google can generate additional assets using content from your ads, landing pages, and domain. You control which types are enabled.
                </span>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acaTextEnabled}
                  onChange={e => setAcaTextEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Text assets</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Allow Google to generate headlines and descriptions from your landing page content</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acaFinalUrlEnabled}
                  onChange={e => setAcaFinalUrlEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Final URL expansion</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Replace or supplement your final URL with a more relevant landing page from your domain</div>
                </div>
              </label>

              {acaFinalUrlEnabled && (
                <div className="ml-7 flex flex-col gap-2">
                  <label className="text-[13px] text-slate-700 font-medium">Exclude specific URLs</label>
                  <div className="text-[12px] text-slate-500">One URL per line — these pages will never be used as final URLs</div>
                  <textarea
                    value={acaExcludedUrls}
                    onChange={e => setAcaExcludedUrls(e.target.value)}
                    placeholder="https://example.com/no-ads"
                    rows={3}
                    className="w-full max-w-[480px] border border-slate-300 rounded px-3 py-2 text-[13px] resize-y"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* More Settings (Ad Rotation, DSA, Brand Restrictions) */}
        {!isPMax && (
          <div
            id="panel-more-settings"
            className="settings-panel-section bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setMoreSettingsOpen(prev => !prev)}
              className="w-full px-6 py-4 flex items-center gap-2 text-blue-600 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[14px] font-medium">More settings</span>
              {moreSettingsOpen ? <Minus className="w-4 h-4 ml-auto" /> : <Plus className="w-4 h-4 ml-auto" />}
            </button>

            {moreSettingsOpen && (
              <div className="border-t border-slate-200 divide-y divide-slate-100">

                {/* Ad Rotation */}
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-medium text-slate-800">Ad rotation</h3>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[12px] text-slate-500 -mt-2">Choose how to rotate ad serving within ad groups</div>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="adRotation"
                        checked={adRotation === "OPTIMIZE"}
                        onChange={() => setAdRotation("OPTIMIZE")}
                        className="mt-0.5 w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">Optimise: prefer best performing ads</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">Show ads expected to get more clicks or conversions. Uses machine learning to decide the best ad to serve.</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="adRotation"
                        checked={adRotation === "DO_NOT_OPTIMIZE"}
                        onChange={() => setAdRotation("DO_NOT_OPTIMIZE")}
                        className="mt-0.5 w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">Do not optimise: rotate ads indefinitely</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">Rotate ads more evenly without preferring higher-performing ads. This option doesn't support automated bidding strategies.</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Dynamic Search Ads */}
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-medium text-slate-800">Dynamic Search Ads setting</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDsaEnabled(prev => !prev)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${dsaEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${dsaEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="text-[12px] text-slate-500 -mt-2">Automatically generate ads for searches closely related to your domain</div>

                  {dsaEnabled && (
                    <div className="flex flex-col gap-3 mt-1">
                      <div className="flex flex-col gap-1.5 max-w-[420px]">
                        <label className="text-[13px] text-slate-800">Website domain</label>
                        <input
                          type="text"
                          value={dsaDomain}
                          onChange={e => setDsaDomain(e.target.value)}
                          placeholder="example.com"
                          className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 max-w-[220px]">
                        <label className="text-[13px] text-slate-800">Website language</label>
                        <select
                          value={dsaLanguage}
                          onChange={e => setDsaLanguage(e.target.value)}
                          className="border border-slate-300 rounded px-3 py-2 text-[13px] bg-white"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="hi">Hindi</option>
                          <option value="pt">Portuguese</option>
                          <option value="ja">Japanese</option>
                          <option value="zh">Chinese</option>
                          <option value="ar">Arabic</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] text-slate-800">Targeting source</label>
                        <div className="flex flex-col gap-2">
                          {(["WEBSITE", "FEED", "BOTH"] as const).map(src => (
                            <label key={src} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="dsaSource"
                                checked={dsaTargetingSource === src}
                                onChange={() => setDsaTargetingSource(src)}
                                className="w-4 h-4 text-blue-600 accent-blue-600"
                              />
                              <span className="text-[13px] text-slate-800">
                                {src === "WEBSITE" ? "Use my website" : src === "FEED" ? "Use a Google Merchant Center feed" : "Use both"}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand Restrictions */}
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-medium text-slate-800">Brand restrictions</h3>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[12px] text-slate-500 -mt-2">
                    Restrict broad match keywords to specific brands. Your ads will only match searches that include these brand names.
                  </div>
                  <input
                    type="text"
                    value={brandRestrictionsInput}
                    onChange={e => setBrandRestrictionsInput(e.target.value)}
                    placeholder="e.g. Nike, Adidas, Puma (comma-separated)"
                    className="border border-slate-300 rounded px-3 py-2 text-[13px] max-w-[480px] w-full"
                  />
                  {brandRestrictionsInput.trim() && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {brandRestrictionsInput.split(",").map(b => b.trim()).filter(Boolean).map(brand => (
                        <span key={brand} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[12px] font-medium px-2.5 py-1 rounded-full border border-blue-200">
                          {brand}
                          <button type="button" onClick={() => setBrandRestrictionsInput(prev => prev.split(",").map(b => b.trim()).filter(b => b !== brand).join(", "))}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
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
