import { useState } from "react";
import { ChevronUp, Link } from "lucide-react";

interface KeywordAssetGenStepProps {
  onNext: () => void;
}

export default function GoogleAdsKeywordAssetGenStep({ onNext }: KeywordAssetGenStepProps) {
  const [finalUrl, setFinalUrl] = useState("");

  const handleGenerate = () => {
    if (finalUrl) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[22px] text-slate-800 font-normal mb-1">Keyword and asset generation</h1>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
           <h2 className="text-[14px] text-blue-700 font-medium">Keyword and asset generation</h2>
           <ChevronUp className="w-5 h-5 text-slate-500" />
        </div>
        <div className="p-6">
           <div className="flex items-center gap-2 mb-3">
             <h3 className="text-[15px] font-medium text-slate-800">Get help creating your ad</h3>
             <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide">NEW</span>
           </div>
           
           <div className="text-[12px] text-slate-600 leading-relaxed mb-4 max-w-[700px]">
             Google AI will use your URL and the information you provide to create assets, like keywords, headlines, and descriptions for you to review. Generated content may be inaccurate or offensive, so please review and check the responses. To improve Google AI, human reviewers may read, annotate, and process the information you provide. Don't enter anything you wouldn't want reviewed or used.
           </div>
           
           <div className="text-[11px] text-slate-500 mb-6">
             Your use is subject to Google's <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Generative AI Prohibited Use Policy</a>. Your data is handled as explained in the Google <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
           </div>

           <div className="mb-2">
             <label className="text-[13px] text-slate-800 font-medium">Where will people go when they click your ad?</label>
           </div>
           
           <div className="relative max-w-[500px]">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Link className="h-4 w-4 text-slate-400" />
             </div>
             <input 
               type="text" 
               placeholder="Final URL (required)*"
               value={finalUrl}
               onChange={(e) => setFinalUrl(e.target.value)}
               className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-[13px] text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
             />
           </div>
           
           <div className="mt-2 text-[11px] text-slate-500">
             Keyword and asset generation is not available in all languages
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 items-center max-w-[800px]">
        <button 
          onClick={onNext}
          className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium text-[13px] transition-colors"
        >
          Skip
        </button>
        <button 
          onClick={handleGenerate}
          disabled={!finalUrl}
          className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
            finalUrl 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Generate
        </button>
      </div>
    </div>
  );
}
