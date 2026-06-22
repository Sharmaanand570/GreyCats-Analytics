import { AlertCircle, Info, Edit2 } from "lucide-react";

interface ReviewStepProps {
  onNext: () => void;
}

export default function GoogleAdsDisplayReviewStep(props: ReviewStepProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      
      <div className="flex flex-col gap-2">
        <div className="text-[14px] font-medium text-slate-800">Fix these errors to publish your campaign</div>
        <div className="border border-red-300 rounded-md overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between p-3 border-b border-red-200 bg-white">
            <div className="flex items-center gap-2 text-[13px] text-slate-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>EU political ads: Confirm if your campaign has EU political ads</span>
            </div>
            <button className="bg-[#c5221f] hover:bg-red-800 text-white text-[12px] font-medium px-4 py-1.5 rounded">Fix it</button>
          </div>

          <div className="flex items-center justify-between p-3 border-b border-red-200 bg-white">
            <div className="flex items-center gap-2 text-[13px] text-slate-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Budget: Value is required</span>
            </div>
            <button className="bg-[#c5221f] hover:bg-red-800 text-white text-[12px] font-medium px-4 py-1.5 rounded">Fix it</button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white">
            <div className="flex items-center gap-2 text-[13px] text-slate-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Your campaign can't run without an ad <a href="#" className="text-blue-600 hover:underline">Learn more</a></span>
            </div>
            <button className="bg-[#c5221f] hover:bg-red-800 text-white text-[12px] font-medium px-4 py-1.5 rounded">Fix it</button>
          </div>

        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[14px] font-medium text-slate-800">The following suggestions will greatly improve your campaign's performance</div>
        <div className="border border-blue-300 rounded-md p-3 bg-white flex items-center gap-2 text-[13px] text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>End-user consent signals are required to use ad personalization features in the European Economic Area (EEA) <a href="#" className="text-blue-600 hover:underline">Learn more</a></span>
        </div>
      </div>

      <h2 className="text-[22px] font-normal text-slate-800 mt-2">Campaign Review</h2>
      
      {/* Campaign Basics */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Campaign name</div>
          <div className="flex-1">
            <input type="text" value="Display-19" readOnly className="border border-slate-300 rounded px-3 py-2 w-full max-w-[300px] outline-none" />
          </div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Campaign type</div>
          <div className="flex-1 text-slate-800">Display</div>
        </div>
        <div className="flex p-4">
          <div className="w-[250px] text-slate-600">Goal</div>
          <div className="flex-1 text-slate-800">Contacts (Call from Ads, Website), Downloads, Page views, Phone call leads</div>
        </div>
      </div>

      {/* Campaign Settings */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Campaign settings</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600">Locations</div>
            <div className="flex-1 text-slate-800">All countries and territories</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600">Languages</div>
            <div className="flex-1 text-slate-800">English</div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600">EU political ads</div>
            <div className="flex-1 flex flex-col gap-1 text-slate-800">
              <span>Not specified</span>
              <div className="flex items-center gap-1 text-[#c5221f] text-[12px]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[10px]">!</div>
                Confirm if your campaign has EU political ads
              </div>
              <div className="flex items-center gap-1 text-[#c5221f] text-[12px]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[10px]">!</div>
                Confirm if your campaign has EU political ads
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget and Bidding */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Budget and bidding</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600">Budget</div>
            <div className="flex-1 flex flex-col gap-1 text-slate-800">
              <span>₹0.00/day</span>
              <div className="flex items-center gap-1 text-[#c5221f] text-[12px]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[10px]">!</div>
                Value is required
              </div>
            </div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600">Bidding</div>
            <div className="flex-1 text-slate-800">Maximize conversions</div>
          </div>
        </div>
      </div>

      {/* Ad Group */}
      <div className="bg-slate-100 rounded-lg p-6 flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-medium text-slate-800">Ad group 1</h3>
          <Edit2 className="w-4 h-4 text-slate-500 cursor-pointer" />
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-medium text-slate-800">Targeting</h4>
          <div className="bg-white border border-slate-200 rounded p-4 flex text-[13px]">
            <div className="w-[250px] text-slate-600">Optimized targeting</div>
            <div className="flex-1 text-slate-800">On</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-medium text-slate-800">Ads</h4>
          <div className="bg-white border border-slate-200 rounded p-4 flex text-[13px]">
            <div className="w-[250px] text-slate-600">Ad creation</div>
            <div className="flex-1 text-slate-800">No ads</div>
          </div>
        </div>
      </div>

      <div className="flex justify-start mt-2 border-t border-slate-200 pt-4">
        <button className="bg-slate-200 text-slate-500 text-[13px] font-medium py-2 px-6 rounded cursor-not-allowed">
          Publish campaign
        </button>
      </div>

    </div>
  );
}
