import { Info } from "lucide-react";

interface Props { onNext: () => void; }

export default function GoogleAdsAppAdGroupStep({ onNext }: Props) {
  // Per screenshot 4: the Ad group step content area is empty/blank
  // Only a Next button is shown in the real Google Ads UI
  return (
    <div className="flex flex-col max-w-[760px] w-full pb-10">
      <h2 className="text-[22px] font-normal text-slate-800 mb-1">Ad group</h2>
      <p className="text-[13px] text-slate-600 mb-8">Set up your ad group targeting and creative assets.</p>

      {/* Empty state as shown in real Google Ads screenshot 4 */}
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <Info className="w-8 h-8 text-slate-300 mb-3" />
        <div className="text-[14px] text-slate-400">Ad group settings will appear here.</div>
      </div>

      <div className="flex justify-end mt-8">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded">Next</button>
      </div>
    </div>
  );
}
