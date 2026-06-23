import { useState } from "react";
import { CheckCircle2, Circle, ChevronUp } from "lucide-react";
import GoogleAdsDisplaySettingsStep from "./GoogleAdsDisplaySettingsStep";
import GoogleAdsDisplayBudgetStep from "./GoogleAdsDisplayBudgetStep";
import GoogleAdsDisplayTargetingStep from "./GoogleAdsDisplayTargetingStep";
import GoogleAdsDisplayAdStep from "./GoogleAdsDisplayAdStep";
import GoogleAdsDisplayReviewStep from "./GoogleAdsDisplayReviewStep";

interface WizardProps {
  onCancel: () => void;
  campaignType: string;
}

  // @ts-expect-error unused variable
export default function GoogleAdsDisplayWizard(props: WizardProps) {
  const [activeStep, setActiveStep] = useState("settings");

  const steps = [
    { id: "settings", label: "Campaign settings" },
    { id: "budget", label: "Budget and bidding" },
    { id: "targeting", label: "Targeting" },
    { id: "ads", label: "Ads" },
    { id: "review", label: "Review" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f1f3f4] w-full font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[240px] shrink-0 border-r border-slate-200 bg-white flex flex-col relative overflow-y-auto pb-16">
           <div className="px-6 py-4">
             <div className="text-[13px] font-medium text-slate-800">Display</div>
           </div>

           <div className="flex flex-col">
             {steps.map((step, index) => {
               const isActive = activeStep === step.id;
               const isPast = steps.findIndex(s => s.id === activeStep) > index;
               
               const isError = activeStep === "review" && ["settings", "budget", "review"].includes(step.id);
               const isCheck = activeStep === "review" ? step.id === "targeting" : isPast;
               const isBlueCircle = activeStep === "review" && step.id === "ads";
               
               return (
                 <div key={step.id}>
                   <div 
                     onClick={() => setActiveStep(step.id)}
                     className="flex items-center gap-3 px-6 py-2.5 cursor-pointer hover:bg-slate-50"
                   >
                     {isError ? (
                       <div className="w-4 h-4 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[11px]">!</div>
                     ) : isActive ? (
                       <div className="w-4 h-4 rounded-full border-4 border-blue-600 bg-white"></div>
                     ) : isCheck ? (
                       <CheckCircle2 className="w-4 h-4 text-blue-600" />
                     ) : isBlueCircle ? (
                       <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-white"></div>
                     ) : (
                       <Circle className="w-4 h-4 text-slate-400" />
                     )}
                     <span className={`text-[13px] ${isActive || isError ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                       {step.label}
                     </span>
                   </div>
                   
                   {/* Sub-items for Campaign Settings */}
                   {isActive && step.id === "settings" && (
                     <div className="flex flex-col py-1">
                       <div className="pl-12 py-1.5 text-[12px] text-blue-600 font-medium cursor-pointer">Locations</div>
                       <div className="pl-12 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 cursor-pointer">Languages</div>
                       <div className="pl-12 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 cursor-pointer">EU political ads</div>
                     </div>
                   )}

                   {/* Sub-items for Budget and bidding */}
                   {isActive && step.id === "budget" && (
                     <div className="flex flex-col py-1">
                       <div className="pl-12 py-1.5 text-[12px] text-blue-600 font-medium cursor-pointer">Budget</div>
                       <div className="pl-12 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 cursor-pointer">Bidding</div>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>

           <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 bg-white">
             <div className="text-[11px] text-slate-500">All changes saved</div>
           </div>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 overflow-y-auto relative flex flex-col pb-20">
          <div className={`w-full pt-8 px-8 mx-auto flex-1 ${activeStep === "ads" ? "max-w-[1200px]" : "max-w-[800px]"}`}>
            {activeStep === "settings" && (
              <GoogleAdsDisplaySettingsStep onNext={() => setActiveStep("budget")} />
            )}
            {activeStep === "budget" && (
              <GoogleAdsDisplayBudgetStep onNext={() => setActiveStep("targeting")} />
            )}
            {activeStep === "targeting" && (
              <GoogleAdsDisplayTargetingStep onNext={() => setActiveStep("ads")} />
            )}
            {activeStep === "ads" && (
              <GoogleAdsDisplayAdStep onNext={() => setActiveStep("review")} />
            )}
            {activeStep === "review" && (
              <GoogleAdsDisplayReviewStep onNext={() => {}} />
            )}
          </div>
        </div>

        {/* Right Sidebar: Weekly estimates */}
        <div className="w-[300px] bg-white border-l border-slate-200 shrink-0 flex flex-col pt-6 overflow-y-auto pb-6">
           <div className="px-6 flex flex-col gap-6">
             <h3 className="text-[14px] font-medium text-slate-800">Weekly estimates</h3>
             
             <div className="border border-slate-200 rounded-md overflow-hidden">
               {/* Impressions */}
               <div className="border-b border-slate-200">
                 <div className="px-4 py-3 flex justify-between items-center bg-slate-50 cursor-pointer">
                   <div className="flex items-center gap-2">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                     <span className="text-[13px] font-medium text-slate-800">Available impressions</span>
                   </div>
                   <ChevronUp className="w-4 h-4 text-slate-500" />
                 </div>
                 <div className="px-4 py-3 bg-white">
                   <div className="text-[11px] text-slate-500 leading-relaxed mb-3">
                     Based on your targeting and settings but not your budget or bid
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[11px] text-slate-500">Impressions</span>
                     <span className="text-[13px] font-medium text-slate-800">10B+</span>
                   </div>
                 </div>
               </div>

               {/* Performance */}
               <div>
                 <div className="px-4 py-3 flex justify-between items-center bg-white cursor-pointer">
                   <div className="flex items-center gap-2">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                     <span className="text-[13px] font-medium text-slate-800">Your estimated performance</span>
                   </div>
                   <ChevronUp className="w-4 h-4 text-slate-500" />
                 </div>
                 <div className="px-4 pb-4 bg-white">
                   <div className="text-[11px] text-slate-500 leading-relaxed mb-3">
                     To see estimated performance, enter the following settings:
                   </div>
                   <ul className="list-disc pl-4 text-[12px] text-slate-800 font-medium">
                     <li>Budget</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="text-[12px] text-blue-600 font-medium cursor-pointer">Leave feedback</div>
           </div>
        </div>
      </div>
    </div>
  );
}
