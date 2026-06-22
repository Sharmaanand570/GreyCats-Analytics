import { useState } from "react";
import { Search, HelpCircle, Bell, Settings, X, CheckCircle2 } from "lucide-react";
import { SiGoogleads } from "react-icons/si";

import GoogleAdsAppCampaignSettingsStep from "./GoogleAdsAppCampaignSettingsStep";
import GoogleAdsAppAdGroupStep from "./GoogleAdsAppAdGroupStep";
import GoogleAdsAppBiddingStep from "./GoogleAdsAppBiddingStep";
import GoogleAdsAppReviewStep from "./GoogleAdsAppReviewStep";

interface Props {
  onClose: () => void;
}

export default function GoogleAdsAppWizard({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);

  const steps = [
    { id: 1, title: "Campaign settings", subtitle: "Mobile app" },
    { id: 2, title: "Ad group", subtitle: "Product groups" },
    { id: 3, title: "Bidding and budget", subtitle: "Bidding" },
    { id: 4, title: "Review", subtitle: "" },
  ];

  if (isPublished) {
    return (
      <div className="min-h-screen bg-[#f1f3f4] flex flex-col items-center pt-20 font-roboto">
        <div className="bg-white p-10 rounded-lg shadow-sm border border-slate-200 max-w-[600px] w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-normal text-slate-800 mb-4">Your App campaign is published!</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your campaign is now under review. It usually takes 1 business day for campaigns to be approved and start running.
          </p>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2.5 text-blue-600 hover:bg-blue-50 font-medium rounded text-sm transition-colors">
              Return to campaigns
            </button>
            <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors shadow-sm">
              View campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f4] flex flex-col font-roboto">
      {/* Top Navigation */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <SiGoogleads className="w-6 h-6 text-blue-600" />
            <span className="text-[18px] font-medium text-slate-700">Google Ads</span>
          </div>
        </div>
        
        <div className="flex-1 max-w-[600px] mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="What are my top performing campaigns?"
              className="w-full bg-[#f1f3f4] border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-slate-600 text-[13px] mr-2">
            <Settings className="w-4 h-4 mr-1" />
            Appearance
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-full"><HelpCircle className="w-5 h-5 text-slate-600" /></button>
          <button className="p-2 hover:bg-slate-100 rounded-full"><Bell className="w-5 h-5 text-slate-600" /></button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium ml-2">
            T
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <div className="p-1 bg-blue-50 rounded"><SiGoogleads className="w-4 h-4 text-blue-600" /></div>
            <span className="text-[14px] font-medium text-slate-800">App</span>
          </div>

          <div className="py-4">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div 
                  className={`px-6 py-2.5 flex items-start gap-3 cursor-pointer ${
                    currentStep === step.id ? "bg-[#e8f0fe]" : "hover:bg-slate-50"
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    step.id < currentStep 
                      ? "bg-blue-600 border-blue-600" 
                      : step.id === currentStep
                        ? "border-blue-600"
                        : "border-slate-300"
                  }`}>
                    {step.id < currentStep && <CheckCircle2 className="w-3 h-3 text-white" />}
                    {step.id === currentStep && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                  </div>
                  <div>
                    <div className={`text-[14px] ${currentStep === step.id ? "font-medium text-blue-700" : "text-slate-700"}`}>
                      {step.title}
                    </div>
                  </div>
                </div>

                {/* Vertical line between steps */}
                {step.id < steps.length && (
                  <div className="absolute left-[33px] top-[30px] bottom-[-10px] w-0.5 bg-slate-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="max-w-[1000px] mx-auto py-10 px-8 flex justify-center">
            {currentStep === 1 && (
              <GoogleAdsAppCampaignSettingsStep onNext={() => setCurrentStep(2)} />
            )}
            {currentStep === 2 && (
              <GoogleAdsAppAdGroupStep onNext={() => setCurrentStep(3)} />
            )}
            {currentStep === 3 && (
              <GoogleAdsAppBiddingStep onNext={() => setCurrentStep(4)} />
            )}
            {currentStep === 4 && (
              <GoogleAdsAppReviewStep onPublish={() => setIsPublished(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
