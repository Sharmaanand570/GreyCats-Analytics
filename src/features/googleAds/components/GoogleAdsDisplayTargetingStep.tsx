import { HelpCircle, Settings } from "lucide-react";

interface TargetingStepProps {
  onNext: () => void;
}

export default function GoogleAdsDisplayTargetingStep({ onNext }: TargetingStepProps) {
  const targetingOptions = [
    { name: "Audience Segments", desc: "Suggest who should see your ads" },
    { name: "Demographics", desc: "Suggest people based on age, gender, parental status, or household income" },
    { name: "Keywords", desc: "Suggest terms related to your products or services to target relevant websites" },
    { name: "Topics", desc: "Suggest webpages, apps, and videos about a certain topic" },
    { name: "Placements", desc: "Suggest websites, videos, or apps where you'd like to show your ads" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[22px] font-normal text-slate-800 mb-2">Targeting</h2>

      <div className="border border-slate-200 rounded-md bg-white">
        <div className="p-6 flex items-start gap-6 border-b border-slate-200">
          <div className="flex-1">
            <h3 className="text-[18px] font-normal text-slate-800 mb-2">Optimized targeting is set up for you</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Optimized targeting helps you get more conversions by using information such as your landing page and assets. You can opt out or speed up optimization by adding targeting first. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
            </p>
          </div>
          <div className="w-[120px] h-[80px] shrink-0 bg-slate-100 rounded flex items-center justify-center">
            {/* Mock illustration */}
            <svg viewBox="0 0 120 80" className="w-full h-full text-slate-300" fill="currentColor">
              <rect x="20" y="20" width="80" height="40" rx="4" />
              <circle cx="60" cy="40" r="10" fill="white" />
            </svg>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200">
          <button className="flex items-center gap-2 text-[13px] font-medium text-blue-600 cursor-pointer hover:bg-slate-50 px-4 py-2 rounded">
            <Settings className="w-4 h-4" />
            Add targeting
          </button>
        </div>

        <div className="flex flex-col">
          {targetingOptions.map((opt, i) => (
            <div 
              key={i}
              className={`flex items-center p-4 hover:bg-slate-50 cursor-pointer ${i !== targetingOptions.length - 1 ? 'border-b border-slate-200' : ''}`}
            >
              <div className="w-[200px] text-[13px] text-slate-800 font-medium">
                {opt.name}
              </div>
              <div className="flex items-center gap-1 text-[13px] text-slate-600">
                {opt.desc} <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
