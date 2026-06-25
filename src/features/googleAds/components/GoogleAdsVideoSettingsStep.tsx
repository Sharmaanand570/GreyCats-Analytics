import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, HelpCircle, Search, Plus } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
interface VideoSettingsStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
}

export default function GoogleAdsVideoSettingsStep({ onNext, activeSubStep = "name", onSubStepChange }: VideoSettingsStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const initialHeadline = payload.assets?.find(a => a.type === "HEADLINE")?.text || "Video Headline";

  const [openContentTab, setOpenContentTab] = useState<string | null>(null);
  const [placementTab, setPlacementTab] = useState<'browse' | 'enter'>('browse');
  const [budgetType] = useState("Campaign total");
  const [locationType, setLocationType] = useState(payload.locations?.type || "India");
  const [campaignName, setCampaignName] = useState(payload.name || "Video views - 2026-06-18");

  const [videoId] = useState("dQw4w9WgXcQ");
  const [videoFormat] = useState("IN_STREAM");
  const [cta] = useState("Learn More");
  const [finalUrl] = useState(payload.ads?.[0]?.finalUrls?.[0] || "https://example.com");
  const [headline] = useState(initialHeadline);

  const [targetCpv, setTargetCpv] = useState<number | undefined>(payload.targetCpv);
  const [targetCpm, setTargetCpm] = useState<number | undefined>(payload.targetCpm);

  useEffect(() => {
    updatePayload({
      campaignName,
      targetCpv,
      targetCpm,
      ads: [
        {
          type: "VIDEO_AD",
          finalUrls: [finalUrl],
          videoAd: {
            videoId,
            format: videoFormat,
            callToAction: cta,
            headline: headline
          }
        }
      ]
    } as any);
  }, [campaignName, videoId, videoFormat, cta, finalUrl, headline, targetCpv, targetCpm, updatePayload]);

  // Sync sidebar content sub-step with open accordion
  useEffect(() => {
    if (['keywords', 'topics', 'placements'].includes(activeSubStep)) {
      setOpenContentTab(activeSubStep);
    }
  }, [activeSubStep]);

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
        <h1 className="text-[22px] text-slate-800 font-normal mb-1">General settings</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Campaign Name */}
        <div 
          id="panel-name" 
          onClick={() => onSubStepChange?.('name')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'name' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'name' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Campaign name</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <input 
               type="text" 
               value={campaignName}
               onChange={(e) => setCampaignName(e.target.value)}
               className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
             />
             <div className="text-[11px] text-slate-400 text-right mt-1">24 / 250</div>
          </div>
        </div>

        {/* Ad Formats */}
        <div 
          id="panel-ad-formats" 
          onClick={() => onSubStepChange?.('ad-formats')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'ad-formats' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'ad-formats' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Ad formats</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <div className="text-[12px] text-slate-600 mb-4 pb-4 border-b border-dashed border-slate-300 leading-relaxed">
               Using all available formats can help you get up to 40% more views, 40% more consideration lift, and 25% more search lift.
             </div>
             
             <div className="flex flex-col gap-3">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-blue-600 border-blue-600" />
                 <span className="text-[13px] text-slate-800">Skippable in-stream ads</span>
                 <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-blue-600 border-blue-600" />
                 <span className="text-[13px] text-slate-800">In-feed ads</span>
                 <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-blue-600 border-blue-600" />
                 <span className="text-[13px] text-slate-800">Shorts ads</span>
                 <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
               </label>
             </div>
          </div>
        </div>

        {/* Bid Strategy */}
        <div 
          id="panel-bid-strategy" 
          onClick={() => onSubStepChange?.('bid-strategy')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'bid-strategy' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'bid-strategy' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Bid strategy</h2>
             <div className="flex items-center gap-4">
               <span className="text-[13px] text-slate-500">Target CPV</span>
               <ChevronUp className="w-5 h-5 text-slate-500" />
             </div>
          </div>
          <div className="p-6 border-t border-slate-200">
             <div className="flex items-start gap-8">
               <div className="flex-1">
                 <label className="flex items-center gap-1 text-[13px] text-slate-800 mb-2">
                   Select your bid strategy <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                 </label>
                 <div className="border border-slate-300 rounded px-3 py-2 flex justify-between items-center bg-slate-50 text-slate-600 w-full max-w-[240px]">
                   <span className="text-[13px]">Target CPV</span>
                   <ChevronDown className="w-4 h-4" />
                 </div>
                 <div className="text-[11px] text-slate-500 mt-4 leading-relaxed max-w-md">
                   The following bid strategies aren't available in this campaign: Maximum CPV, Target CPM, Viewable CPM, Target CPA, Maximize conversions, Maximize conversion value, Target ROAS
                 </div>
               </div>
               
               <div className="w-[300px] border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed">
                 With TrueView target cost-per-view (previously called Target cost-per-view) you set the average amount you want to pay for TrueView views of this campaign. From the TrueView target CPV you set, we'll optimize bids to help get as many TrueView views as possible. Some TrueView views may cost more or less than your target.
               </div>
             </div>
          </div>
        </div>

        {/* Budget and Dates */}
        <div 
          id="panel-budget-dates" 
          onClick={() => onSubStepChange?.('budget-dates')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'budget-dates' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'budget-dates' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Budget and dates</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 border-t border-slate-200 flex items-start gap-8">
             <div className="flex-1 flex flex-col gap-6">
               <div>
                 <label className="text-[13px] text-slate-800 mb-2 block">Enter budget type and amount</label>
                 <div className="flex gap-4 items-start">
                   <div className="border border-slate-300 rounded px-3 py-2 flex justify-between items-center w-[160px]">
                     <span className="text-[13px]">{budgetType}</span>
                     <ChevronDown className="w-4 h-4 text-slate-500" />
                   </div>
                   <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                       <span className="text-[14px] text-slate-800">₹</span>
                       <input type="text" className="border-b-2 border-red-500 focus:border-blue-600 outline-none w-[120px] text-[13px] pb-1" />
                     </div>
                     <span className="text-[11px] text-red-500">Required</span>
                   </div>
                 </div>
               </div>
               
               <div className="bg-slate-50 p-4 border border-slate-200 rounded">
                 <div className="flex flex-col gap-4">
                   <div>
                     <label className="text-[11px] text-slate-500 block mb-1">Start date</label>
                     <div className="border border-slate-300 rounded px-3 py-2 flex justify-between items-center w-[160px] bg-white">
                       <span className="text-[13px]">Jun 18, 2026</span>
                       <ChevronDown className="w-4 h-4 text-slate-500" />
                     </div>
                   </div>
                   
                   <div>
                     <label className="text-[11px] text-slate-500 block mb-2">End date</label>
                     <div className="flex flex-col gap-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="radio" name="end_date" className="w-4 h-4 text-blue-600" />
                         <div className="flex items-center">
                           <span className="text-[13px] text-slate-500 mr-2 absolute -mt-4 text-[10px]">Ends in</span>
                           <div className="border border-slate-300 rounded px-3 py-1.5 flex justify-between items-center w-[120px] bg-white mt-2">
                             <span className="text-[13px]">2 weeks</span>
                             <ChevronDown className="w-4 h-4 text-slate-500" />
                           </div>
                         </div>
                       </label>
                       
                       <label className="flex items-start gap-3 cursor-pointer mt-2">
                         <input type="radio" name="end_date" defaultChecked className="mt-1 w-4 h-4 text-blue-600" />
                         <div>
                           <div className="border border-slate-300 rounded px-3 py-1.5 flex justify-between items-center w-[160px] bg-white">
                             <span className="text-[13px] text-slate-400">Select a date</span>
                             <ChevronDown className="w-4 h-4 text-slate-500" />
                           </div>
                           <span className="text-[11px] text-red-500 mt-1 block">Required</span>
                         </div>
                       </label>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="w-[300px] border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed">
               Campaign total budget represents your total spend for the duration of the campaign. You must schedule an end date for the campaign. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
             </div>
          </div>
        </div>

        {/* Networks */}
        <div 
          id="panel-networks" 
          onClick={() => onSubStepChange?.('networks')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'networks' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'networks' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Networks</h2>
             <div className="flex items-center gap-4">
               <span className="text-[13px] text-slate-500 truncate max-w-[300px]">YouTube, Video partners on the Google Display Network</span>
               <ChevronUp className="w-5 h-5 text-slate-500" />
             </div>
          </div>
          <div className="p-6 border-t border-slate-200">
             <div className="flex flex-col gap-5">
               <div>
                 <div className="text-[13px] font-medium text-slate-800 mb-2">YouTube & Google</div>
                 <div className="ml-2 flex flex-col gap-3">
                   <label className="flex items-start gap-3">
                     <input type="checkbox" defaultChecked disabled className="mt-1 w-4 h-4 rounded text-slate-400 border-slate-300" />
                     <div>
                       <div className="text-[13px] text-slate-800 font-medium">YouTube</div>
                       <div className="text-[12px] text-slate-500 mt-0.5">Ads can appear on YouTube videos and channels, YouTube home, and in YouTube search results.</div>
                     </div>
                   </label>
                   <label className="flex items-start gap-3 cursor-pointer">
                     <input type="checkbox" className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300" />
                     <div>
                       <div className="flex items-center gap-1 text-[13px] text-slate-800 font-medium">Google TV <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></div>
                       <div className="text-[12px] text-slate-500 mt-0.5">Ads can appear in video-streaming apps available with Google TV. The Google TV network is only available for campaigns running in the United States. <a href="#" className="text-blue-600 hover:underline">Learn more</a></div>
                     </div>
                   </label>
                 </div>
               </div>
               
               <div>
                 <div className="text-[13px] font-medium text-slate-800 mb-2">Google partners</div>
                 <div className="ml-2">
                   <label className="flex items-start gap-3 cursor-pointer">
                     <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300" />
                     <div>
                       <div className="flex items-center gap-1 text-[13px] text-slate-800 font-medium">Video partners on the Google Display Network <HelpCircle className="w-3.5 h-3.5 text-slate-400" /></div>
                       <div className="text-[12px] text-slate-500 mt-0.5">Video partners extend the reach of video ads to a collection of sites and apps in the Google Display Network. <a href="#" className="text-blue-600 hover:underline">Learn more</a></div>
                     </div>
                   </label>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Locations */}
        <div 
          id="panel-locations" 
          onClick={() => onSubStepChange?.('locations')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'locations' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'locations' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Locations</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 border-t border-slate-200">
             <div className="flex items-center gap-1 mb-4">
               <label className="text-[13px] text-slate-800">Select locations for this campaign</label>
               <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
             </div>
             
             <div className="flex flex-col gap-3 ml-2">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="radio" 
                   name="locations" 
                   checked={locationType === 'all'}
                   onChange={() => setLocationType('all')}
                   className="w-4 h-4 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">All countries and territories</span>
               </label>
               
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="radio" 
                   name="locations" 
                   checked={locationType === 'India'}
                   onChange={() => setLocationType('India')}
                   className="w-4 h-4 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">India</span>
               </label>
               
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="radio" 
                   name="locations" 
                   checked={locationType === 'other'}
                   onChange={() => setLocationType('other')}
                   className="w-4 h-4 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">Enter another location</span>
               </label>
             </div>
          </div>
        </div>

        {/* Languages */}
        <div 
          id="panel-languages" 
          onClick={() => onSubStepChange?.('languages')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'languages' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'languages' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Languages</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 border-t border-slate-200">
             <div className="flex items-center gap-1 mb-2">
               <label className="text-[13px] text-slate-800">Select the languages your customers speak.</label>
               <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
             </div>
             
             <div className="relative w-full max-w-[400px] mb-4">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="w-4 h-4 text-slate-400" />
               </div>
               <input 
                 type="text" 
                 placeholder="Start typing or select a language"
                 className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
               />
             </div>
             
             <div className="text-[13px] text-slate-800">All languages</div>
          </div>
        </div>
      </div>

        {/* Related videos */}
        <div 
          id="panel-related-videos" 
          onClick={() => onSubStepChange?.('related-videos')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'related-videos' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'related-videos' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Related videos</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 border-t border-slate-200 flex items-start gap-8">
             <div className="flex-1">
               <div className="text-[13px] text-slate-800 mb-4">Add videos related to your video ads to help increase engagement</div>
               <button className="flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors -ml-3">
                 <div className="bg-blue-600 text-white rounded-full p-0.5"><Plus className="w-3 h-3" /></div>
                 Related videos
               </button>
             </div>
             <div className="w-[300px] border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed">
               Related videos appear below your video ad and offer an immersive video experience to help reinforce and extend your ad's message. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
             </div>
          </div>
        </div>

        {/* Additional settings */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2 cursor-pointer w-max">
            <ChevronUp className="w-4 h-4 text-blue-600" />
            <span className="text-[14px] font-medium text-blue-600">Additional settings</span>
          </div>

          <div className="bg-white border shadow-sm rounded-md overflow-hidden border-slate-200 flex flex-col">
             <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
               <div className="flex gap-10">
                 <span className="text-[13px] text-slate-800 font-medium w-48">Devices</span>
                 <span className="text-[13px] text-slate-500">All eligible devices (computers, mobile, tablet, and TV screens)</span>
               </div>
               <ChevronDown className="w-5 h-5 text-slate-500" />
             </div>
             <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
               <div className="flex gap-10">
                 <span className="text-[13px] text-slate-800 font-medium w-48">Frequency capping</span>
                 <span className="text-[13px] text-slate-500">None</span>
               </div>
               <ChevronDown className="w-5 h-5 text-slate-500" />
             </div>
             <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
               <div className="flex gap-10">
                 <span className="text-[13px] text-slate-800 font-medium w-48">Ad schedule</span>
                 <span className="text-[13px] text-slate-500">All day</span>
               </div>
               <ChevronDown className="w-5 h-5 text-slate-500" />
             </div>
             <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
               <div className="flex gap-10">
                 <span className="text-[13px] text-slate-800 font-medium w-48">Third-party measurement</span>
                 <span className="text-[13px] text-slate-500">None</span>
               </div>
             </div>
          </div>
        </div>
      {/* Ad Group Section */}
      <div className="mt-12 mb-6 flex items-center justify-between">
        <h1 className="text-[22px] text-slate-800 font-normal">Create your ad group</h1>
        <a href="#" className="text-[13px] text-blue-600 font-medium hover:underline flex items-center gap-1">
          Skip ad group and ad creation (advanced)
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      <div className="flex flex-col gap-4">
        {/* Ad group name */}
        <div 
          id="panel-ad-group-name" 
          onClick={() => onSubStepChange?.('ad-group-name')}
          className={`bg-white border shadow-sm rounded-md transition-all duration-200 ${activeSubStep === 'ad-group-name' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="p-6">
             <div className="text-[13px] text-slate-800 font-medium mb-4">Ad group name</div>
             <input 
               type="text" 
               defaultValue="Video views - 2026-06-18"
               className="w-full max-w-[400px] border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
             />
             <div className="text-[11px] text-slate-400 mt-1 max-w-[400px] text-right">24 / 255</div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
            <div className="text-[13px] text-slate-800 leading-relaxed">Combining audience and content settings in the same ad group can limit your reach and increase your costs. This excludes audience settings for age and gender.</div>
          </div>
          <button className="text-[13px] text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded shrink-0 transition-colors">Dismiss</button>
        </div>

        {/* Audience */}
        <div
          id="panel-audience"
          onClick={() => onSubStepChange?.('audience')}
          className={`bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'audience' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className="text-[14px] text-slate-800 font-medium">Audience</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <div className="flex justify-between items-center mb-6">
               <div className="text-[13px] text-slate-600 max-w-[600px] leading-relaxed">
                 Audiences allow you to reach people based on who they are, their interests and habits, what they're actively researching, or how they've interacted with your business or organization.
               </div>
               <button className="text-[13px] font-medium text-blue-600 border border-slate-300 rounded px-4 py-2 hover:bg-slate-50 transition-colors">
                 Add saved audience
               </button>
             </div>

             <div className="border border-slate-200 rounded-md overflow-hidden mb-6">
               <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 bg-slate-50/50">
                 <div className="flex gap-10 items-center">
                   <span className="text-[13px] text-slate-800 font-medium w-40">Audience name</span>
                   <span className="text-[13px] text-slate-500">Add a name for your audience to save it to your library (optional)</span>
                 </div>
                 <ChevronDown className="w-5 h-5 text-slate-500" />
               </div>
             </div>

             <div className="text-[13px] font-medium text-slate-800 mb-2">Include people who match any of the following</div>
             
             <div className="border border-slate-200 rounded-md overflow-hidden mb-6">
               <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 bg-white">
                 <div className="flex gap-10 items-center">
                   <span className="text-[13px] text-slate-800 font-medium w-40">Demographics</span>
                   <span className="text-[13px] text-slate-800">All demographics (recommended) <HelpCircle className="inline w-3.5 h-3.5 text-slate-400 mb-0.5 ml-1"/></span>
                 </div>
                 <ChevronDown className="w-5 h-5 text-slate-500" />
               </div>
             </div>

             <div className="text-[13px] font-medium text-slate-800 mb-2">Narrow audience to people who match the following</div>

             <div className="border border-slate-200 rounded-md overflow-hidden flex flex-col mb-4">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50 bg-white">
                 <div className="flex gap-10 items-center">
                   <span className="text-[13px] text-slate-800 font-medium w-40 leading-snug">Interests & detailed demographics</span>
                   <span className="text-[13px] text-slate-500">Add any interests, detailed demographics, or life events related to your customers</span>
                 </div>
                 <ChevronDown className="w-5 h-5 text-slate-500" />
               </div>
               <div className="bg-white">
                 <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
                   <div className="flex gap-10 items-center">
                     <span className="text-[13px] text-slate-800 font-medium w-40">Your data</span>
                   </div>
                   <ChevronUp className="w-5 h-5 text-slate-500" />
                 </div>
                 <div className="px-6 pb-6">
                   <div className="text-[13px] text-slate-600 mb-4 flex items-center gap-1">
                     First-party data can help us reach your customers <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                   </div>
                   <div className="relative w-full max-w-[600px]">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Add your data"
                        className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                   </div>
                 </div>
               </div>
             </div>

             <div className="flex items-center gap-2 mt-4 cursor-pointer text-blue-600 w-max mb-6">
               <div className="bg-blue-50 rounded-full p-0.5"><Plus className="w-3.5 h-3.5" /></div>
               <span className="text-[13px] font-medium hover:underline">Additional audience segments</span>
             </div>

             <div className="border-t border-slate-200 pt-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 -mx-6 px-6 -mb-6 pb-4">
               <div className="flex gap-10 items-center">
                 <span className="text-[13px] text-slate-800 font-medium w-40">Audience expansion</span>
                 <span className="text-[13px] text-slate-500">Off</span>
               </div>
               <ChevronDown className="w-5 h-5 text-slate-500" />
             </div>
          </div>
        </div>

        {/* Content */}
        <div
          id="panel-content"
          onClick={() => onSubStepChange?.('content')}
          className={`bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${['content','keywords','topics','placements'].includes(activeSubStep) ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className="text-[14px] text-slate-800 font-medium">Content</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 pb-6">
             <div className="text-[13px] text-slate-800 mb-4 flex items-center gap-1">
               Build product and brand association with content keywords, topics, and placements. <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
             </div>
             <div className="border border-slate-200 rounded-md overflow-hidden flex flex-col">
               {/* Keywords */}
               {openContentTab === 'keywords' ? (
                 <div className="border-b border-slate-200 bg-white">
                   <div 
                     className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                     onClick={(e) => { e.stopPropagation(); setOpenContentTab(null); onSubStepChange?.('content'); }}
                   >
                     <div className="flex gap-10 items-center">
                       <span className="text-[13px] text-blue-700 font-medium w-40">Keywords</span>
                     </div>
                     <ChevronUp className="w-5 h-5 text-blue-700" />
                   </div>
                   <div className="px-6 pb-6 pt-2">
                     <div className="text-[13px] text-slate-600 mb-4 flex items-center gap-1">
                       Choose terms related to your products or services to target relevant content. <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                     </div>
                     <div className="flex gap-6">
                       <div className="flex-1 border border-slate-300 rounded p-4 h-[180px] bg-white">
                         <div className="text-[13px] text-slate-500 mb-2">Enter or paste keywords. You can separate each keyword by commas or enter one per line.</div>
                         <textarea className="w-full h-[120px] outline-none text-[13px] resize-none"></textarea>
                       </div>
                       <div className="w-[300px]">
                         <div className="text-[13px] text-slate-800 font-medium mb-2">Get keyword ideas</div>
                         <div className="flex flex-col gap-2 mb-6">
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                              </div>
                              <input type="text" placeholder="Enter a related website" className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white" />
                           </div>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                              </div>
                              <input type="text" placeholder="Enter your product or service" className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white" />
                           </div>
                         </div>
                         <div className="flex flex-col items-center justify-center text-center px-4">
                           <Search className="w-6 h-6 text-slate-300 mb-2" />
                           <div className="text-[11px] text-slate-500 leading-relaxed">
                             We only show keyword ideas that are relevant to your business. To get ideas, enter your landing page, a related website, or words or phrases that describe your product or service in the field above.
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div 
                   className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                   onClick={(e) => { e.stopPropagation(); setOpenContentTab('keywords'); onSubStepChange?.('keywords'); }}
                 >
                   <div className="flex gap-10 items-center">
                     <span className="text-[13px] text-slate-800 font-medium w-40">Keywords</span>
                     <span className="text-[13px] text-slate-500">Add keywords</span>
                   </div>
                   <ChevronDown className="w-5 h-5 text-slate-500" />
                 </div>
               )}

               {/* Topics */}
               {openContentTab === 'topics' ? (
                 <div className="border-b border-slate-200 bg-white">
                   <div 
                     className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                     onClick={(e) => { e.stopPropagation(); setOpenContentTab(null); onSubStepChange?.('content'); }}
                   >
                     <div className="flex gap-10 items-center">
                       <span className="text-[13px] text-blue-700 font-medium w-40">Topics</span>
                     </div>
                     <ChevronUp className="w-5 h-5 text-blue-700" />
                   </div>
                   <div className="px-6 pb-6 pt-2">
                     <div className="text-[13px] text-slate-600 mb-4 flex items-center gap-1">
                       Select topics to show ads on content about specific subjects. <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                     </div>
                     
                     <div className="border border-slate-300 rounded overflow-hidden bg-white">
                       <div className="flex border-b border-slate-300 bg-white px-2">
                         <div className="px-4 py-3 text-[13px] font-medium text-blue-600 border-b-2 border-blue-600 cursor-pointer">Search</div>
                         <div className="px-4 py-3 text-[13px] font-medium text-slate-600 cursor-pointer hover:bg-slate-50">Browse</div>
                       </div>
                       <div className="p-4">
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="w-4 h-4 text-slate-400" />
                            </div>
                            <input type="text" placeholder="Search by word or phrase" className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] outline-none focus:ring-1 focus:ring-blue-500 bg-white" />
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div 
                   className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                   onClick={(e) => { e.stopPropagation(); setOpenContentTab('topics'); onSubStepChange?.('topics'); }}
                 >
                   <div className="flex gap-10 items-center">
                     <span className="text-[13px] text-slate-800 font-medium w-40">Topics</span>
                     <span className="text-[13px] text-slate-500">Add topics</span>
                   </div>
                   <ChevronDown className="w-5 h-5 text-slate-500" />
                 </div>
               )}

               {/* Placements */}
               {openContentTab === 'placements' ? (
                 <div className="bg-white">
                   <div 
                     className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                     onClick={(e) => { e.stopPropagation(); setOpenContentTab(null); onSubStepChange?.('content'); }}
                   >
                     <div className="flex gap-10 items-center">
                       <span className="text-[13px] text-blue-700 font-medium w-40">Placements</span>
                     </div>
                     <ChevronUp className="w-5 h-5 text-blue-700" />
                   </div>
                   <div className="px-6 pb-6 pt-2">
                     <div className="text-[13px] text-slate-600 mb-4 flex items-center gap-1">
                       Select your placement targeting <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                     </div>
                     
                     <div className="border border-slate-300 rounded flex h-[320px]">
                       {/* Left panel */}
                       <div className="w-1/2 border-r border-slate-300 flex flex-col">
                         <div className="flex border-b border-slate-300 bg-white px-2">
                           <div 
                             className={`px-4 py-3 text-[13px] font-medium cursor-pointer ${placementTab === 'browse' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                             onClick={(e) => { e.stopPropagation(); setPlacementTab('browse'); }}
                           >Browse</div>
                           <div 
                             className={`px-4 py-3 text-[13px] font-medium cursor-pointer ${placementTab === 'enter' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                             onClick={(e) => { e.stopPropagation(); setPlacementTab('enter'); }}
                           >Enter</div>
                         </div>
                         {placementTab === 'browse' ? (
                           <>
                             <div className="p-3 border-b border-slate-200 bg-white">
                               <div className="relative">
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <input type="text" placeholder="Search by word, phrase, URL, or video ID" className="w-full text-[13px] outline-none px-3 py-2 border-b border-transparent focus:border-blue-500" />
                               </div>
                             </div>
                             <div className="flex-1 overflow-y-auto bg-white">
                               <div className="px-4 py-3 text-[13px] text-slate-800 hover:bg-slate-50 cursor-pointer flex justify-between items-center">YouTube channels <span className="text-slate-400 text-lg">›</span></div>
                               <div className="px-4 py-3 text-[13px] text-slate-800 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-t border-slate-100">YouTube videos <span className="text-slate-400 text-lg">›</span></div>
                               <div className="px-4 py-3 text-[13px] text-slate-800 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-t border-slate-100">Websites <span className="text-slate-400 text-lg">›</span></div>
                               <div className="px-4 py-3 text-[13px] text-slate-800 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-t border-slate-100">Apps <span className="text-slate-400 text-lg">›</span></div>
                               <div className="px-4 py-3 text-[13px] text-slate-800 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-t border-slate-100">App categories (141) <span className="text-slate-400 text-lg">›</span></div>
                             </div>
                           </>
                         ) : (
                           <div className="flex-1 p-4 flex flex-col bg-white">
                             <a href="#" className="text-[13px] text-blue-600 hover:underline font-medium mb-3" onClick={e => e.preventDefault()}>Enter multiple placements</a>
                             <textarea 
                               placeholder="Enter placement URLs, line by line, or paste in a list."
                               className="flex-1 w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-700 resize-none outline-none focus:ring-1 focus:ring-blue-500"
                             />
                             <button className="mt-3 text-[13px] text-slate-500 hover:text-blue-600 text-left">Add placements</button>
                           </div>
                         )}
                       </div>
                       {/* Right panel */}
                       <div className="w-1/2 p-5 flex flex-col bg-white">
                         <div className="text-[13px] font-medium text-slate-800 mb-4">None selected</div>
                         <div className="text-[12px] text-slate-500 leading-relaxed">
                           Your ad can appear on any YouTube or Display Network placements that match your other targeting. Add specific placements to narrow your targeting. If a specific website you target has an equivalent app, your ads can also show there.
                         </div>
                       </div>
                     </div>
                     <div className="mt-4 text-[11px] text-slate-500 leading-relaxed">
                       Note: Google's policy doesn't allow you to target placements that promote hatred, intolerance, discrimination, or violence towards an individual or group. All campaigns are subject to the Google Ads advertising policies. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div 
                   className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                   onClick={(e) => { e.stopPropagation(); setOpenContentTab('placements'); onSubStepChange?.('placements'); }}
                 >
                   <div className="flex gap-10 items-center">
                     <span className="text-[13px] text-slate-800 font-medium w-40">Placements</span>
                     <span className="text-[13px] text-slate-500">Add placements</span>
                   </div>
                   <ChevronDown className="w-5 h-5 text-slate-500" />
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Ads Section */}
      <div className="mt-12 mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[22px] text-slate-800 font-normal">Create your video ads</h1>
          <div className="text-[13px] text-slate-500 mt-1">Create one or more ads now, or skip this step and create them later. Your campaign won't run without at least one ad.</div>
        </div>
        <a href="#" className="text-[13px] text-blue-600 font-medium hover:underline flex items-center gap-1">
          Skip ad creation (advanced)
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      <div className="flex flex-col gap-4">
        {/* Ads Panel */}
        <div 
          id="panel-ads" 
          onClick={() => onSubStepChange?.('ads')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'ads' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="flex h-[360px]">
             {/* Left half */}
             <div className="w-1/2 p-6 border-r border-slate-200">
               <div className="text-[14px] text-slate-800 font-medium mb-1">Your YouTube video</div>
               <div className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                 Add up to 5 videos. Get more TrueView views with vertical and horizontal videos
               </div>
               
               <div className="relative w-full mb-1">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Search className="w-4 h-4 text-slate-400" />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Search for a video or paste the URL from YouTube"
                   className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                 />
               </div>
               <div className="text-[11px] text-red-500 mb-6">Required</div>
               
               <div className="flex gap-6">
                 <button className="flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:underline">
                   <Plus className="w-4 h-4" /> Add video
                 </button>
                 <button className="flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:underline">
                   <div className="relative">
                     <Plus className="w-4 h-4" />
                   </div> 
                   Create video 
                   <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">BETA</span>
                 </button>
               </div>
             </div>
             
             {/* Right half (Preview area) */}
             <div className="w-1/2 bg-slate-50/50 flex flex-col items-center justify-center">
               <div className="flex flex-col items-center text-slate-400 gap-2">
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M21.582 6.186a2.665 2.665 0 0 0-1.875-1.886C18.053 3.86 12 3.86 12 3.86s-6.053 0-7.707.44A2.665 2.665 0 0 0 2.418 6.186C2 7.847 2 12 2 12s0 4.153.418 5.814a2.665 2.665 0 0 0 1.875 1.886C6.053 20.14 12 20.14 12 20.14s6.053 0 7.707-.44a2.665 2.665 0 0 0 1.875-1.886C22 16.153 22 12 22 12s0-4.153-.418-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                 <span className="text-[13px]">Add a video to see a preview of your video ad</span>
               </div>
             </div>
          </div>
        </div>

        {/* Ad creation accordion */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <div className="flex gap-10 items-center">
               <span className="text-[13px] text-slate-800 font-medium w-40">Ad creation</span>
               <span className="text-[13px] text-slate-500">1 ad</span>
             </div>
             <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Bid Section */}
      <div className="mt-12 mb-6">
        <h1 className="text-[22px] text-slate-800 font-normal">
          Set a <a href="#" className="text-blue-600 hover:underline" onClick={e => e.preventDefault()}>bid</a> for this ad group
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Bid Panel */}
        <div 
          id="panel-bid" 
          onClick={() => onSubStepChange?.('bid')}
          className={`settings-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'bid' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200">
             <h2 className={`text-[14px] ${activeSubStep === 'bid' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Bid</h2>
          </div>
          <div className="p-6">
             <div className="flex gap-8">
               <div className="flex-1">
                 <label className="text-[13px] text-slate-700 block mb-2">
                   {(payload.biddingFocus as any) === 'AWARENESS' ? 'Target CPM bid' : 'TrueView target CPV bid'}
                 </label>
                 <div className="flex flex-col gap-1">
                   <div className="border border-slate-300 rounded flex items-center w-[140px] bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                     <span className="text-[14px] text-slate-700 pl-3 pr-1">₹</span>
                     <input 
                       type="number" 
                       value={(payload.biddingFocus as any) === 'AWARENESS' ? (targetCpm || "") : (targetCpv || "")}
                       onChange={(e) => {
                         const val = parseFloat(e.target.value) || undefined;
                         if ((payload.biddingFocus as any) === 'AWARENESS') {
                           setTargetCpm(val);
                         } else {
                           setTargetCpv(val);
                         }
                       }}
                       className="w-full outline-none text-[13px] py-2 pr-3" 
                     />
                   </div>
                   <span className="text-[11px] text-red-500 mt-1">Required</span>
                 </div>
               </div>
               
               <div className="flex-1 text-[12px] text-slate-600 leading-relaxed pt-6">
                 {(payload.biddingFocus as any) === 'AWARENESS' ? (
                   "With Target CPM (cost-per-thousand impressions), you set the average amount you're willing to pay for every thousand times your ad is shown. We'll optimize bids to help get as many impressions as possible."
                 ) : (
                   "With TrueView target CPV (cost-per-view), you set the average amount you're willing to pay for views for this campaign. From the TrueView target CPV you set, we'll optimize bids to help get as many TrueView views as possible. Some TrueView views may cost more or less than your target."
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex gap-3 items-center mt-10">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-6 py-2 rounded shadow-sm transition-colors"
        >
          Create campaign
        </button>
        <button className="text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition-colors">Cancel</button>
      </div>

      <div className="mt-8 text-[11px] text-slate-500 leading-relaxed">
        Important notices: By creating this ad, you agree that you have legal rights to distribute all content (including all videos and images) you have provided. You are responsible for compliance with all applicable laws and regulations in the location(s) in which you have chosen to target your advertising. © Google, 2026.
      </div>
    </div>
  );
}
