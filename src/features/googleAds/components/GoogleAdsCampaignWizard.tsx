import { useState } from "react";
import { HelpCircle, CheckCircle2, Search, ChevronRight } from "lucide-react";
import GoogleAdsBiddingStep from "./GoogleAdsBiddingStep";
import GoogleAdsCampaignSettingsStep from "./GoogleAdsCampaignSettingsStep";
import GoogleAdsAssetGroupStep from "./GoogleAdsAssetGroupStep";
import GoogleAdsBudgetStep from "./GoogleAdsBudgetStep";
import GoogleAdsSummaryStep from "./GoogleAdsSummaryStep";
import GoogleAdsAIMaxStep from "./GoogleAdsAIMaxStep";
import GoogleAdsKeywordAssetGenStep from "./GoogleAdsKeywordAssetGenStep";
import GoogleAdsKeywordsAndAdsStep from "./GoogleAdsKeywordsAndAdsStep";

interface WizardProps {
  onCancel: () => void;
  campaignType: string;
}

export default function GoogleAdsCampaignWizard({ campaignType }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSubStep, setActiveSubStep] = useState("bidding");
  
  const steps = campaignType === "Search" ? [
    { id: 1, name: "Bidding", component: GoogleAdsBiddingStep },
    { id: 2, name: "Campaign settings", component: GoogleAdsCampaignSettingsStep },
    { id: 3, name: "AI Max", component: GoogleAdsAIMaxStep },
    { id: 4, name: "Keyword and asset generation", component: GoogleAdsKeywordAssetGenStep },
    { id: 5, name: "Keywords and ads", component: GoogleAdsKeywordsAndAdsStep },
    { id: 6, name: "Budget", component: GoogleAdsBudgetStep },
    { id: 7, name: "Review", component: GoogleAdsSummaryStep },
  ] : [
    { id: 1, name: "Bidding", component: GoogleAdsBiddingStep },
    { id: 2, name: "Campaign settings", component: GoogleAdsCampaignSettingsStep },
    { id: 3, name: "Asset group", component: GoogleAdsAssetGroupStep },
    { id: 4, name: "Budget", component: GoogleAdsBudgetStep },
    { id: 5, name: "Summary", component: GoogleAdsSummaryStep },
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
    <div className="flex flex-col h-full bg-[#f1f3f4] w-full font-sans overflow-hidden">
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
                <div key={step.id} className={`flex flex-col ${currentStep === step.id ? "bg-[#e8f0fe] rounded-md" : ""}`}>
                  <div 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => {
                      setCurrentStep(step.id);
                      if (step.id === 1) setActiveSubStep("bidding");
                      if (step.id === 2) setActiveSubStep("networks");
                      if (campaignType === "Search") {
                         if (step.id === 6) setActiveSubStep("budget");
                      } else {
                         if (step.id === 3) setActiveSubStep("name");
                         if (step.id === 4) setActiveSubStep("budget");
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
                          className={`cursor-pointer transition-colors ${activeSubStep === 'bidding' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('bidding')}
                        >
                          Bidding
                        </div>
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'acquisition' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('acquisition')}
                        >
                          Customer acquisition
                        </div>
                        {campaignType === "Performance Max" && (
                          <div 
                            className={`cursor-pointer transition-colors ${activeSubStep === 'retention' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                            onClick={() => handleSubMenuClick('retention')}
                          >
                            Customer retention
                          </div>
                        )}
                     </div>
                  )}

                  {/* Active Step Sub-menu (for Campaign settings) */}
                  {currentStep === step.id && step.id === 2 && (
                     <div className="flex flex-col pl-11 pb-2 gap-3 text-[13px] text-slate-600">
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'networks' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('networks')}
                        >
                          Network
                        </div>
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'locations' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('locations')}
                        >
                          Locations
                        </div>
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'languages' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('languages')}
                        >
                          Languages
                        </div>
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'eu-political-ads' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('eu-political-ads')}
                        >
                          EU political ads
                        </div>
                        <div 
                          className={`cursor-pointer transition-colors ${activeSubStep === 'audience-segments' ? 'text-blue-700 font-medium border-l-2 border-blue-600 -ml-[23px] pl-[21px]' : 'hover:text-slate-900'}`}
                          onClick={() => handleSubMenuClick('audience-segments')}
                        >
                          Audiences
                        </div>
                     </div>
                  )}

                  {/* Active Step Sub-menu */}
                  {currentStep === step.id && (
                     <div className="flex flex-col pl-11 pb-2 gap-3 text-[13px] text-slate-600">
                        {step.id === 3 && campaignType !== "Search" && (
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
           <CurrentStepComponent 
             onNext={() => {
               setCurrentStep(prev => {
                 const next = prev + 1;
                 if (next === 2) setActiveSubStep("networks");
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
             onNavigateToStep={(stepId: number, subStepId: string) => {
               setCurrentStep(stepId);
               setActiveSubStep(subStepId);
               setTimeout(() => {
                 const element = document.getElementById(`panel-${subStepId}`);
                 if (element) {
                   element.scrollIntoView({ behavior: "smooth", block: "start" });
                 }
               }, 100);
             }}
           />
        </div>

        {/* Right Sidebar */}
        <div className="w-[320px] bg-white border-l border-slate-200 shrink-0 flex flex-col pt-6 relative">
           <div className="px-6 flex flex-col gap-6">
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
           </div>

           <div className="mt-auto border-t border-slate-200 p-2 flex justify-end">
              <ChevronRight className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
           </div>
        </div>
      </div>
    </div>
  );
}
