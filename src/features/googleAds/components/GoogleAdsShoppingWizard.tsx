import { useState } from "react";
import { CheckCircle2, Circle, ChevronUp } from "lucide-react";
import GoogleAdsShoppingBudgetStep from "./GoogleAdsShoppingBudgetStep";
import GoogleAdsShoppingSettingsStep from "./GoogleAdsShoppingSettingsStep";
import GoogleAdsShoppingAdGroupStep from "./GoogleAdsShoppingAdGroupStep";
import GoogleAdsShoppingSummaryStep from "./GoogleAdsShoppingSummaryStep";

interface WizardProps {
  onCancel: () => void;
  campaignType: string;
}

export default function GoogleAdsShoppingWizard({ campaignType }: WizardProps) {
  const [activeStep, setActiveStep] = useState<"budget" | "settings" | "adgroup" | "summary">("budget");

  const steps = [
    { id: "budget", label: "Budget and bidding optimization" },
    { id: "settings", label: "Campaign settings" },
    { id: "adgroup", label: "Ad group" },
    { id: "summary", label: "Summary" },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[280px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-[12px] font-bold">
              G
            </span>
            <span className="text-[14px] font-medium text-slate-800">{campaignType}</span>
          </div>
        </div>
        
        <div className="flex-1 py-4">
          <div className="relative">
            {/* The line connecting the dots */}
            <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

            {steps.map((step, index) => {
               const isActive = activeStep === step.id;
               const isPast = steps.findIndex(s => s.id === activeStep) > index;
               
               // Mocking the error states shown in screenshot 3 when on the Summary step
               const isError = activeStep === "summary" && ["budget", "settings", "adgroup", "summary"].includes(step.id);
               
               return (
                 <div key={step.id} className="relative z-10">
                   <div 
                     onClick={() => setActiveStep(step.id as any)}
                     className="flex items-center gap-3 px-6 py-2.5 cursor-pointer hover:bg-slate-50"
                   >
                     {isError ? (
                       <div className="w-4 h-4 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[11px]">!</div>
                     ) : isActive ? (
                       <div className="w-4 h-4 rounded-full border-4 border-blue-600 bg-white"></div>
                     ) : isPast ? (
                       <CheckCircle2 className="w-4 h-4 text-blue-600 bg-white" />
                     ) : (
                       <Circle className="w-4 h-4 text-slate-400 bg-white fill-white" />
                     )}
                     <span className={`text-[13px] ${isActive || isError ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                       {step.label}
                     </span>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#f1f3f4] h-full overflow-y-auto">
        <div className="w-full max-w-[1000px] pt-8 px-8 mx-auto flex-1">
          {activeStep === "budget" && <GoogleAdsShoppingBudgetStep onNext={() => setActiveStep("settings")} />}
          {activeStep === "settings" && <GoogleAdsShoppingSettingsStep onNext={() => setActiveStep("adgroup")} />}
          {activeStep === "adgroup" && <GoogleAdsShoppingAdGroupStep onNext={() => setActiveStep("summary")} />}
          {activeStep === "summary" && <GoogleAdsShoppingSummaryStep onNext={() => {}} />}
        </div>
      </div>

      {/* Right Sidebar (Estimates) */}
      <div className="w-[300px] shrink-0 border-l border-slate-200 bg-white p-6 flex flex-col gap-6">
        <h3 className="text-[15px] font-medium text-slate-800">Weekly estimates</h3>
        
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-[13px] font-medium text-slate-800 flex items-center gap-2">
               Available impressions <ChevronUp className="w-4 h-4" />
            </h4>
          </div>
          <div className="p-4">
            <p className="text-[12px] text-slate-600 mb-3">
              Based on your targeting and settings but not your budget or bid
            </p>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-500 uppercase font-medium">Impressions</span>
              <span className="text-[15px] font-medium text-slate-800">10B+</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4">
          <h4 className="text-[13px] font-medium text-slate-800 flex items-center gap-2 mb-3">
            Your estimated performance
          </h4>
          <p className="text-[12px] text-slate-600 mb-3">
            To see estimated performance, enter the following settings:
          </p>
          <ul className="list-disc pl-4 text-[12px] text-slate-800 flex flex-col gap-1">
            <li>Budget</li>
            <li>Ad group bid</li>
          </ul>
        </div>
        
        <a href="#" className="text-[13px] text-blue-600 hover:underline">Leave feedback</a>
      </div>

    </div>
  );
}
