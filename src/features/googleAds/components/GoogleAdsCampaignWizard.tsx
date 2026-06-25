import { useState, useEffect } from "react";
import { HelpCircle, CheckCircle2, Search, LineChart } from "lucide-react";
import GoogleAdsBiddingStep from "./GoogleAdsBiddingStep";
import GoogleAdsCampaignSettingsStep from "./GoogleAdsCampaignSettingsStep";
import GoogleAdsAssetGroupStep from "./GoogleAdsAssetGroupStep";
import GoogleAdsBudgetStep from "./GoogleAdsBudgetStep";
import GoogleAdsSummaryStep from "./GoogleAdsSummaryStep";
import GoogleAdsAIMaxStep from "./GoogleAdsAIMaxStep";
import GoogleAdsKeywordAssetGenStep from "./GoogleAdsKeywordAssetGenStep";
import GoogleAdsKeywordsAndAdsStep from "./GoogleAdsKeywordsAndAdsStep";
import GoogleAdsVideoSettingsStep from "./GoogleAdsVideoSettingsStep";
import GoogleAdsAssetExtensionsStep from "./GoogleAdsAssetExtensionsStep";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { publishCompleteCampaign } from "../API/campaignManagementApi";
import { validateCampaignPayload } from "../utils/campaignValidation";
import { PublishProgressModal } from "./PublishProgressModal";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface WizardProps {
  onCancel: () => void;
  campaignType: string;
}

export default function GoogleAdsCampaignWizard({ campaignType, onCancel }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSubStep, setActiveSubStep] = useState("bidding");
  const [budgetType] = useState<'daily' | 'campaign'>('daily');
  
  const { payload, updatePayload, isPublishing, setIsPublishing, takePublishSnapshot } = useCampaignWizardContext();

  useEffect(() => {
    const activeOp = localStorage.getItem('active_publish_operation');
    if (activeOp) {
      updatePayload({ publishOperationId: activeOp });
      setIsPublishing(true);
      takePublishSnapshot();
    }
  }, [setIsPublishing, takePublishSnapshot, updatePayload]);

  const handlePublish = async () => {
    // 1. Validate Payload
    const validation = validateCampaignPayload(payload as any);
    if (!validation.isValid) {
      toast.error(`Validation Failed: ${validation.errors[0].message}`);
      return;
    }

    // 2. Generate Idempotency Key
    const operationId = uuidv4();
    updatePayload({ publishOperationId: operationId });
    localStorage.setItem('active_publish_operation', operationId);

    // 3. Freeze UI & Take Snapshot
    setIsPublishing(true);
    
    // Note: State updates are async, so we manually pass the operation ID here to ensure it's in the snapshot immediately
    const snapshot = { ...payload, publishOperationId: operationId };
    
    try {
      // 4. Send to Saga
      await publishCompleteCampaign(1, snapshot as any);
      // The SSE stream inside PublishProgressModal will handle completion tracking.
    } catch (err: any) {
      setIsPublishing(false);
      toast.error(err.message || "Failed to start publish operation");
    }
  };
  
  const steps = campaignType === "Search" ? [
    { id: 1, name: "Bidding", component: GoogleAdsBiddingStep },
    { id: 2, name: "Campaign settings", component: GoogleAdsCampaignSettingsStep },
    { id: 3, name: "AI Max", component: GoogleAdsAIMaxStep },
    { id: 4, name: "Keyword and asset generation", component: GoogleAdsKeywordAssetGenStep },
    { id: 5, name: "Keywords and ads", component: GoogleAdsKeywordsAndAdsStep },
    { id: 6, name: "Asset extensions", component: GoogleAdsAssetExtensionsStep },
    { id: 7, name: "Budget", component: GoogleAdsBudgetStep },
    { id: 8, name: "Review", component: GoogleAdsSummaryStep },
  ] : campaignType === "Video" ? [
    { id: 1, name: "Campaign settings", component: GoogleAdsVideoSettingsStep },
    { id: 2, name: "Ad group", component: GoogleAdsAssetGroupStep },
    { id: 3, name: "Ads", component: GoogleAdsSummaryStep },
    { id: 4, name: "Bid", component: GoogleAdsSummaryStep },
    { id: 5, name: "Review", component: GoogleAdsSummaryStep },
  ] : [
    { id: 1, name: "Bidding", component: GoogleAdsBiddingStep },
    { id: 2, name: "Campaign settings", component: GoogleAdsCampaignSettingsStep },
    { id: 3, name: "Asset group", component: GoogleAdsAssetGroupStep },
    { id: 4, name: "Asset extensions", component: GoogleAdsAssetExtensionsStep },
    { id: 5, name: "Budget", component: GoogleAdsBudgetStep },
    { id: 6, name: "Summary", component: GoogleAdsSummaryStep },
  ];
  
  const CurrentStepComponent = steps.find(s => s.id === currentStep)?.component || steps[0].component;

  const handleSubMenuClick = (stepId: string) => {
    setActiveSubStep(stepId);
    const element = document.getElementById(`panel-${stepId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <PublishProgressModal clientId={1} />
      <div className={`flex flex-col h-full bg-[#f1f3f4] w-full font-sans overflow-hidden ${isPublishing ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-[240px] shrink-0 border-r border-slate-200 bg-white flex flex-col pt-4">
           <div className="px-6 mb-4 flex items-center gap-2 text-slate-600 text-[13px] font-medium">
             <div className="w-4 h-4 text-slate-400">
               {campaignType === "Search" ? <Search className="w-4 h-4 text-slate-500" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/></svg>}
             </div>
             {campaignType}
           </div>
           
           <div className="flex flex-col px-2">
             {steps.map((step) => (
                <div key={step.id} className="flex flex-col">
                  <div 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => {
                      if (campaignType === "Video") {
                        // For Video, all content is in one scrollable page – scroll to section
                        if (step.id === 1) { setActiveSubStep("name"); setCurrentStep(1); }
                        else if (step.id === 2) { setActiveSubStep("ad-group-name"); setCurrentStep(2); }
                        else if (step.id === 3) { setActiveSubStep("ads"); setCurrentStep(3); setTimeout(() => { document.getElementById('panel-ads')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
                        else if (step.id === 4) { setActiveSubStep("bid"); setCurrentStep(4); setTimeout(() => { document.getElementById('panel-bid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
                        else if (step.id === 5) { setActiveSubStep("review"); setCurrentStep(5); }
                      } else {
                        setCurrentStep(step.id);
                        if (step.id === 1) setActiveSubStep("bidding");
                        if (step.id === 2) setActiveSubStep("networks");
                        if (campaignType === "Search") {
                           if (step.id === 6) setActiveSubStep("budget");
                        } else {
                           if (step.id === 3) setActiveSubStep("name");
                           if (step.id === 4) setActiveSubStep("budget");
                        }
                      }
                    }}
                  >
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                        ${currentStep > step.id ? "bg-blue-600 border-blue-600" : currentStep === step.id ? "border-blue-600" : "border-slate-400"}
                     `}>
                       {currentStep > step.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                     </div>
                     <span className={`text-[13px] ${currentStep === step.id ? "text-blue-700 font-medium" : "text-slate-700 font-medium"}`}>
                       {step.name}
                     </span>
                  </div>
                  
                  {/* Active Step Sub-menu (for Bidding) */}
                  {currentStep === step.id && step.id === 1 && (
                     <div className="flex flex-col pl-11 pb-2 gap-3 text-[13px] text-slate-600">
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'bidding' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('bidding')}
                        >
                          Bidding
                        </div>
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'acquisition' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('acquisition')}
                        >
                          Customer acquisition
                        </div>
                        {campaignType === "Performance Max" && (
                          <div 
                            className={`cursor-pointer transition-colors ${activeSubStep === 'retention' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                            onClick={() => handleSubMenuClick('retention')}
                          >
                            Customer retention
                          </div>
                        )}
                     </div>
                  )}

                  {/* Active Step Sub-menu (for Campaign settings - Non Video) */}
                  {currentStep === step.id && step.id === 2 && campaignType !== "Video" && (
                     <div className="flex flex-col pl-11 pb-2 gap-3 text-[13px] text-slate-600">
                        {campaignType !== "Performance Max" && (
                          <div 
                            className={`cursor-pointer transition-colors ${activeSubStep === 'networks' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                            onClick={() => handleSubMenuClick('networks')}
                          >
                            Network
                          </div>
                        )}
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'locations' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('locations')}
                        >
                          Locations
                        </div>
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'languages' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('languages')}
                        >
                          Languages
                        </div>
                        {campaignType !== "Performance Max" && (
                          <>
                            <div 
                              className={`cursor-pointer transition-colors ${activeSubStep === 'eu-political-ads' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                              onClick={() => handleSubMenuClick('eu-political-ads')}
                            >
                              EU political ads
                            </div>
                            <div 
                              className={`cursor-pointer transition-colors ${activeSubStep === 'audience-segments' ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                              onClick={() => handleSubMenuClick('audience-segments')}
                            >
                              Audiences
                            </div>
                          </>
                        )}
                     </div>
                  )}

                  {/* Active Step Sub-menu (for Video Campaign settings) */}
                  {currentStep === step.id && step.id === 1 && campaignType === "Video" && (
                     <div className="flex flex-col pl-11 pb-2 gap-3 text-[13px] text-slate-600">
                        {['name', 'ad-formats', 'bid-strategy', 'budget-dates', 'networks', 'locations', 'languages', 'related-videos'].map(sub => (
                           <div 
                             key={sub}
                             className={`cursor-pointer transition-colors capitalize ${activeSubStep === sub ? 'text-blue-700 font-medium' : 'hover:text-slate-900'}`}
                             onClick={() => handleSubMenuClick(sub)}
                           >
                             {sub.replace(/-/g, ' ')}
                           </div>
                        ))}
                     </div>
                  )}

                  {/* Active Step Sub-menu (for Video Ad group) */}
                  {currentStep === step.id && step.id === 2 && campaignType === "Video" && (
                     <div className="flex flex-col pl-11 pb-2 gap-3 text-[13px] text-slate-600">
                        {['ad-group-name', 'audience', 'content'].map(sub => (
                           <div key={sub} className="flex flex-col gap-3">
                             <div 
                               className={`cursor-pointer transition-colors capitalize ${activeSubStep === sub || (sub === 'content' && ['keywords', 'topics', 'placements'].includes(activeSubStep)) ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                               onClick={() => handleSubMenuClick(sub)}
                             >
                               <div className="flex items-center gap-1 -ml-4">
                                 {sub === 'content' ? <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3 h-3 text-slate-400 transition-transform ${['content', 'keywords', 'topics', 'placements'].includes(activeSubStep) ? 'rotate-90' : ''}`}><path d="M8 5v14l11-7z"/></svg> : <div className="w-3 h-3"></div>}
                                 {sub.replace(/-/g, ' ')}
                               </div>
                             </div>
                             {sub === 'content' && ['content', 'keywords', 'topics', 'placements'].includes(activeSubStep) && (
                               <div className="flex flex-col gap-3 mt-1">
                                 {['keywords', 'topics', 'placements'].map(nested => (
                                   <div 
                                     key={nested}
                                     className={`cursor-pointer transition-colors capitalize ${activeSubStep === nested ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900 pl-[21px] -ml-[23px]'}`}
                                     onClick={() => handleSubMenuClick(nested)}
                                   >
                                     {nested}
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                        ))}
                     </div>
                  )}

                  {/* Active Step Sub-menu — only render when there are sub-items */}
                  {currentStep === step.id && !(campaignType === "Video" && (step.id === 3 || step.id === 4)) && (
                     <div className="flex flex-col pl-11 pb-2 gap-3 text-[13px] text-slate-600">
                        {step.id === 3 && campaignType !== "Search" && campaignType !== "Video" && (
                          ['name', 'listing-groups', 'final-url', 'brand-guidelines', 'assets', 'asset-optimization', 'search-themes', 'audience-signal'].map(sub => (
                             <div 
                               key={sub}
                               className={`cursor-pointer transition-colors capitalize ${activeSubStep === sub ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                               onClick={() => handleSubMenuClick(sub)}
                             >
                               {sub.replace(/-/g, ' ')}
                             </div>
                          ))
                        )}
                        {step.id === 4 && campaignType === "Search" && (
                          <div 
                            className={`cursor-pointer transition-colors ${activeSubStep === 'keyword-and-asset-generation' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                            onClick={() => handleSubMenuClick('keyword-and-asset-generation')}
                          >
                            Keyword and asset generation
                          </div>
                        )}
                        {step.id === 5 && campaignType === "Search" && (
                          <>
                            <div 
                              className={`cursor-pointer transition-colors ${activeSubStep === 'keywords' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                              onClick={() => handleSubMenuClick('keywords')}
                            >
                              Keywords
                            </div>
                            <div 
                              className={`cursor-pointer transition-colors ${activeSubStep === 'ai-max' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                              onClick={() => handleSubMenuClick('ai-max')}
                            >
                              AI Max
                            </div>
                            <div 
                              className={`cursor-pointer transition-colors ${activeSubStep === 'ads' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                              onClick={() => handleSubMenuClick('ads')}
                            >
                              Ads
                            </div>
                          </>
                        )}
                     </div>
                  )}
                </div>
             ))}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-6 pb-20 scroll-smooth">
           {campaignType === "Video" && currentStep < 5 ? (
             <GoogleAdsVideoSettingsStep 
               onNext={() => {}} 
               activeSubStep={activeSubStep}
               onSubStepChange={(subStepId: string) => {
                 setActiveSubStep(subStepId);
                 if (['name', 'ad-formats', 'bid-strategy', 'budget-dates', 'networks', 'locations', 'languages', 'related-videos'].includes(subStepId)) {
                   setCurrentStep(1);
                 } else if (['ad-group', 'ad-group-name', 'audience', 'content', 'keywords', 'topics', 'placements'].includes(subStepId)) {
                   setCurrentStep(2);
                 } else if (subStepId === 'ads') {
                   setCurrentStep(3);
                 } else if (subStepId === 'bid') {
                   setCurrentStep(4);
                 }
               }}
             />
           ) : (
             <CurrentStepComponent 
               onNext={() => {
                 setCurrentStep(prev => {
                   const next = prev + 1;
                   if (next === 2) {
                     setActiveSubStep(campaignType === "Performance Max" ? "languages" : "networks");
                   }
                   if (campaignType === "Search") {
                      if (next === 6) setActiveSubStep("budget");
                   } else {
                      if (next === 3) setActiveSubStep("name");
                      if (next === 4) setActiveSubStep("budget");
                   }
                   return next;
                 });
               }} 
               activeSubStep={activeSubStep}
               onSubStepChange={setActiveSubStep}
               campaignType={campaignType}
                onNavigateToStep={(stepId: number) => {
                  setCurrentStep(stepId);
                  if (stepId === 1) setActiveSubStep("bidding");
                  if (stepId === 2) setActiveSubStep("networks");
                  if (stepId === 5) setActiveSubStep("keywords");
                  if (stepId === 7) setActiveSubStep("budget");
                }}
             />
           )}
        </div>

         {/* Right Sidebar */}
         <div className="w-[320px] bg-white border-l border-slate-200 shrink-0 flex flex-col pt-6 relative">
            <div className="px-6 flex flex-col gap-6">
              
              {/* If step 6 (Budget) for Search, show specific estimates box */}
              {currentStep === 6 && campaignType === "Search" ? (
                <div className="border border-slate-200 rounded-md p-6 bg-white flex flex-col gap-4 shadow-sm items-center mt-4">
                   <div className="w-16 h-12 border border-slate-200 bg-white shadow-sm flex items-end justify-between px-1.5 pb-1 relative">
                     {/* Mini chart graphic */}
                     <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                     <LineChart className="w-full h-full text-slate-400 stroke-[1.5px]" />
                   </div>
                   <div className="text-[12px] text-slate-600 leading-relaxed text-center">
                     Traffic estimates are not yet available for AI Max in Search campaigns.
                     {budgetType === 'campaign' && (
                       <span> Traffic estimates are not yet available for campaigns using a total budget or with promotion mode turned on.</span>
                     )}
                   </div>
                </div>
              ) : (
                <>
                  {/* Optimization Score */}
                  <div>
                     <div className="flex items-end justify-between mb-2">
                        <div className="text-[28px] leading-none text-blue-600">
                          {currentStep === 1 ? "--.-%" : "95.7%"}
                        </div>
                        <HelpCircle className="w-4 h-4 text-slate-400 mb-1" />
                     </div>
                     {currentStep === 2 && (
                       <div className="w-full h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
                         <div className="h-full bg-blue-600 rounded-full w-[95.7%]"></div>
                       </div>
                     )}
                     <div className="text-[13px] font-medium text-slate-800 flex items-center justify-between mb-1">
                        Campaign optimization score
                     </div>
                     <div className="text-[12px] text-slate-500 leading-relaxed">
                        Your score will be shown after you've made updates to your campaign needed to run ads.
                     </div>
                  </div>

                  <div className="h-px bg-slate-200 w-full"></div>

                  {/* Estimates */}
                  <div>
                     <div className="flex items-center gap-2 mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-500"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        <span className="text-[14px] text-slate-800 font-medium">Weekly estimates</span>
                     </div>
                     
                     {currentStep === 1 ? (
                       <div className="text-[13px] text-slate-500">
                          Estimates aren't currently available
                       </div>
                     ) : (
                       <div className="flex flex-col gap-4">
                         <div className="text-[11px] text-slate-500">
                           Based on your daily budget and bid settings
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1">
                             <div className="text-[11px] text-slate-500">Weekly conv.</div>
                             <div className="text-[13px] text-slate-900 font-medium">9</div>
                           </div>
                           <div className="flex flex-col gap-1">
                             <div className="text-[11px] text-slate-500">Weekly conversion value</div>
                             <div className="text-[13px] text-slate-900 font-medium">{currentStep >= 4 ? '₹13,586.26' : '₹20,280.95'}</div>
                           </div>
                           <div className="flex flex-col gap-1 mt-2">
                             <div className="text-[11px] text-slate-500 leading-tight">Avg. conversion value/cost</div>
                             <div className="text-[13px] text-slate-900 font-medium">{currentStep >= 4 ? '146.35%' : '146.57%'}</div>
                           </div>
                           <div className="flex flex-col gap-1 mt-2">
                             <div className="text-[11px] text-slate-500">Weekly cost</div>
                             <div className="text-[13px] text-slate-900 font-medium">{currentStep >= 4 ? '₹9,283.61' : '₹13,603.25'}</div>
                           </div>
                         </div>
                       </div>
                     )}
                  </div>
                </>
              )}
            </div>

           <div className="mt-auto border-t border-slate-200 p-4 flex justify-between items-center bg-white">
              <button onClick={onCancel} className="text-[13px] text-blue-600 font-medium hover:underline px-2 py-1">Cancel</button>
              {currentStep === steps.length ? (
                <button 
                  onClick={() => {
                    // Make sure context snapshot has the right data before API call
                    takePublishSnapshot();
                    handlePublish();
                  }}
                  disabled={isPublishing}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors disabled:opacity-50"
                >
                  {isPublishing ? "Publishing..." : "Publish campaign"}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setCurrentStep(prev => Math.min(prev + 1, steps.length));
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors"
                >
                  Next
                </button>
              )}
           </div>
        </div>
        </div>
      </div>
    </>
  );
}
