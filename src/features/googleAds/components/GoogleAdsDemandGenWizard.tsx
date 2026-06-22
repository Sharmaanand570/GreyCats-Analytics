import { useState } from "react";
import { HelpCircle, AlertTriangle, Users, CheckCircle2, ChevronDown } from "lucide-react";
import GoogleAdsDemandGenSettingsStep from "./GoogleAdsDemandGenSettingsStep";
import GoogleAdsDemandGenAdStep from "./GoogleAdsDemandGenAdStep";
import GoogleAdsDemandGenReviewStep from "./GoogleAdsDemandGenReviewStep";

interface WizardProps {
  onCancel: () => void;
  campaignType: string;
}

export default function GoogleAdsDemandGenWizard(props: WizardProps) {
  const [activeStep, setActiveStep] = useState("settings");
  const [campaignGoal, setCampaignGoal] = useState("conversions");

  return (
    <div className="flex flex-col h-full bg-[#f1f3f4] w-full font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[240px] shrink-0 border-r border-slate-200 bg-white flex flex-col relative">
           <div 
             onClick={() => setActiveStep("settings")}
             className={`flex items-center justify-between px-4 py-3 border-b border-slate-200 cursor-pointer ${activeStep === "settings" ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "hover:bg-slate-50 border-l-4 border-l-transparent"}`}
           >
             <div className={`flex items-center gap-2 text-[13px] font-medium ${activeStep === "settings" ? "text-blue-700" : "text-slate-800"}`}>
               <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${activeStep === "settings" ? "text-blue-600" : "text-slate-500"}`}>
                 <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" fill="none" stroke="currentColor" strokeWidth="2" />
               </svg>
               Demand Gen - 2026...
             </div>
             <div className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 rounded text-slate-500">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
             </div>
           </div>

           <div className="flex flex-col pt-2">
             <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer">
               <div className="flex items-center gap-2 text-[13px] text-slate-800 font-medium">
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2"/></svg>
                 Ad group 1
               </div>
               <div className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 rounded text-slate-500">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
               </div>
             </div>
             
             <div 
               onClick={() => setActiveStep("ad")}
               className={`flex items-center justify-between py-2 pl-10 pr-4 cursor-pointer relative ${activeStep === "ad" ? "bg-blue-50/80" : "hover:bg-slate-50"}`}
             >
               {activeStep === "ad" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
               <div className={`flex items-center gap-2 text-[13px] ${activeStep === "ad" ? "text-blue-700 font-medium" : "text-slate-600"}`}>
                 <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${activeStep === "ad" ? "text-blue-600" : "text-slate-400"}`}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M8 12h8" stroke="currentColor" strokeWidth="2"/></svg>
                 Ad 1
               </div>
               <div className="flex items-center gap-2">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-500"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                 <div className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 rounded text-slate-500">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                 </div>
               </div>
             </div>

             <div 
               onClick={() => setActiveStep("review")}
               className={`flex items-center gap-2 py-3 mt-2 pr-4 pl-4 cursor-pointer relative ${activeStep === "review" ? "bg-blue-50/80" : "hover:bg-slate-50"}`}
             >
               {activeStep === "review" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
               <CheckCircle2 className={`w-4 h-4 ${activeStep === "review" ? "text-blue-600" : "text-slate-400"}`} />
               <span className={`text-[13px] ${activeStep === "review" ? "text-blue-700 font-medium" : "text-slate-800"}`}>Review campaign</span>
             </div>
           </div>

           <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 bg-white">
             <div className="flex items-center gap-2 text-[11px] text-slate-500">
               <div className="w-4 h-4 rounded-full border border-slate-300"></div>
               Changes pending
             </div>
             <button 
               className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-1.5 rounded px-3 flex justify-center items-center"
               onClick={() => {
                 if (activeStep === "settings") setActiveStep("ad");
                 else if (activeStep === "ad") setActiveStep("review");
               }}
             >
               <span>
                 {activeStep === "settings" ? "Go to Ad group 1" : 
                  activeStep === "ad" ? "Go to review" : "Publish campaign"}
               </span>
             </button>
           </div>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 overflow-y-auto relative flex justify-center pb-20">
          <div className={`w-full pt-8 px-8 mx-auto ${activeStep === "ad" ? "max-w-[1200px]" : "max-w-[800px]"}`}>
            {activeStep === "settings" && (
              <GoogleAdsDemandGenSettingsStep 
                campaignGoal={campaignGoal} 
                onCampaignGoalChange={setCampaignGoal} 
              />
            )}
            {activeStep === "ad" && (
              <GoogleAdsDemandGenAdStep />
            )}
            {activeStep === "review" && (
              <GoogleAdsDemandGenReviewStep />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        {activeStep !== "ad" && (
          <div className="w-[320px] bg-white border-l border-slate-200 shrink-0 flex flex-col pt-6 overflow-y-auto pb-6">
             <div className="px-6 flex flex-col gap-6">
             {/* Header */}
             <div>
               <div className="flex items-start justify-between">
                 <h2 className="text-[18px] text-slate-800 font-normal leading-tight mb-2">Your campaign is not ready to run yet</h2>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-400 shrink-0"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
               </div>
               <div className="flex items-center gap-2 mt-1">
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500"><path d="M21.582 6.186a2.665 2.665 0 0 0-1.875-1.882c-1.654-.446-8.272-.446-8.272-.446s-6.618 0-8.272.446a2.665 2.665 0 0 0-1.875 1.882C.843 7.846.843 11.8.843 11.8s0 3.954.445 5.614a2.665 2.665 0 0 0 1.875 1.882c1.654.446 8.272.446 8.272.446s6.618 0 8.272-.446a2.665 2.665 0 0 0 1.875-1.882c.445-1.66.445-5.614.445-5.614s0-3.954-.445-5.614z"/><path fill="white" d="M10.156 15.086l6.098-3.286-6.098-3.286z"/></svg>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/></svg>
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>
             </div>

             {/* Details Accordion */}
             <div className="border-b border-slate-200 pb-4">
               <div className="flex items-center justify-between mb-4">
                 <div className="text-[13px] font-medium text-slate-800">Details</div>
                 <ChevronDown className="w-4 h-4 text-slate-500 rotate-180" />
               </div>
               
               <div className="flex flex-col gap-4">
                 {campaignGoal === 'conversions' && (
                   <div>
                     <div className="text-[11px] text-slate-500 mb-1">Conversion goals</div>
                     <div className="flex items-start gap-2 text-[13px] text-slate-800 font-medium">
                       <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                       Verify conversion actions
                     </div>
                   </div>
                 )}

                 <div>
                   <div className="text-[11px] text-slate-500 mb-1">Bidding</div>
                   <div className="flex items-start gap-2 text-[13px] text-slate-800">
                     <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                     {campaignGoal === 'clicks' ? 'Maximize clicks' : 'Maximize conversions'}
                   </div>
                 </div>

                 <div>
                   <div className="text-[11px] text-slate-500 mb-1">Budget</div>
                   <div className="flex items-start gap-2 text-[13px] text-slate-800">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                     Set budget
                   </div>
                 </div>

                 <div>
                   <div className="text-[11px] text-slate-500 mb-1">Targeting</div>
                   <div className="flex items-start gap-2 text-[13px] text-slate-800">
                     <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                     Excellent
                   </div>
                 </div>

                 <div>
                   <div className="text-[11px] text-slate-500 mb-1">Ad strength</div>
                   <div className="flex items-start gap-2 text-[13px] text-slate-800">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                     Incomplete
                   </div>
                 </div>
               </div>
             </div>

             {/* Performance Estimates */}
             <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-500"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                   <span className="text-[13px] text-slate-800 font-medium">Your estimated performance</span>
                   <HelpCircle className="w-4 h-4 text-slate-400 ml-auto" />
                </div>
                <div className="text-[12px] text-slate-500 leading-relaxed ml-7">
                  Set a budget to view performance estimates for this campaign
                </div>
             </div>

             {/* Impressions */}
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <Users className="w-5 h-5 text-slate-500" />
                   <span className="text-[13px] text-slate-800 font-medium">Available campaign impressions</span>
                   <HelpCircle className="w-4 h-4 text-slate-400 ml-auto" />
                </div>
                <div className="text-[12px] text-slate-600 font-medium ml-7">
                  10B+ impressions
                </div>
             </div>

           </div>
          </div>
        )}
      </div>
    </div>
  );
}
