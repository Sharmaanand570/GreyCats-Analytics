import { AlertCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

interface Props { onPublish: () => void; }

  // @ts-expect-error unused variable
export default function GoogleAdsAppReviewStep(props: Props) {
  return (
    <div className="flex flex-col max-w-[800px] w-full pb-20">
      
      {/* Top Alerts */}
      <div className="mb-8 flex flex-col gap-3">
        <div>
          <div className="text-[13px] text-slate-800 mb-1 font-medium">Fix these issues to publish your campaign</div>
          <div className="bg-white border border-red-300 rounded overflow-hidden flex items-stretch">
            <div className="w-1 bg-red-600 shrink-0"></div>
            <div className="p-3 flex items-center justify-between w-full">
              <div className="flex gap-2 items-center text-[13px] text-slate-800">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Bidding: Enter an amount
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white text-[12px] font-medium px-4 py-1.5 rounded">Fix it</button>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[13px] text-slate-800 mb-1 font-medium mt-2">The following issue may negatively impact your campaign's performance</div>
          <div className="bg-white border border-amber-300 rounded overflow-hidden flex items-stretch">
            <div className="w-1 bg-amber-500 shrink-0"></div>
            <div className="p-3 flex items-center justify-between w-full">
              <div className="flex gap-2 items-center text-[13px] text-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Audience signal: Add an audience signal for faster optimization
              </div>
              <button className="bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-medium px-4 py-1.5 rounded">Fix it</button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-[22px] font-normal text-slate-800 mb-1">Campaign Review</h2>
      <p className="text-[13px] text-slate-500 mb-6">Your campaign is almost ready to publish</p>

      {/* Issues Section */}
      <div className="mb-6">
        <h3 className="text-[14px] font-medium text-slate-800">Issues</h3>
        <p className="text-[12px] text-slate-500 mb-2">Fix these issues to run your campaign</p>
        <div className="border border-slate-200 rounded p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 text-[13px] text-slate-800">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-medium">Bidding:</span> Enter an amount
          </div>
          <button className="text-blue-600 text-[13px] hover:underline">View</button>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mb-8">
        <h3 className="text-[14px] font-medium text-slate-800">Recommendations</h3>
        <p className="text-[12px] text-slate-500 mb-2">Apply these recommendations to optimize campaign performance</p>
        <div className="border border-slate-200 rounded p-4 flex items-center justify-between bg-white relative">
          <div className="absolute right-4 top-[-24px] flex items-center gap-2 text-[12px] text-slate-500">
            <ChevronLeft className="w-4 h-4 text-slate-300 cursor-not-allowed" />
            <span>1 / 2</span>
            <ChevronRight className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-medium">Audience signal:</span> Add an audience signal for faster optimization
          </div>
          <button className="text-blue-600 text-[13px] hover:underline">View</button>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="flex flex-col gap-6">
        {/* Basic Info */}
        <div className="border border-slate-200 rounded overflow-hidden bg-white">
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
            <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Campaign name</div>
            <div className="p-4"><input type="text" defaultValue="App promotion-App-1" className="border border-slate-300 rounded px-3 py-1.5 text-[13px] w-full max-w-[300px]" /></div>
          </div>
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
            <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Campaign type</div>
            <div className="p-4 text-[13px] text-slate-600">App</div>
          </div>
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
            <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Campaign subtype</div>
            <div className="p-4 text-[13px] text-slate-600">App installs</div>
          </div>
        </div>

        {/* Bidding and Budget */}
        <div>
          <h3 className="text-[14px] font-medium text-slate-800 mb-2">Bidding and budget</h3>
          <div className="border border-slate-200 rounded overflow-hidden bg-white">
            <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
              <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Bidding</div>
              <div className="p-4 text-[13px] text-slate-600">
                Install volume (All users)
                <div className="text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> Enter an amount</div>
              </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
              <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Budget</div>
              <div className="p-4 text-[13px] text-slate-600">₹0.00/day</div>
            </div>
          </div>
        </div>

        {/* Campaign Settings */}
        <div>
          <h3 className="text-[14px] font-medium text-slate-800 mb-2">Campaign settings</h3>
          <div className="border border-slate-200 rounded overflow-hidden bg-white">
            <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
              <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Mobile app</div>
              <div className="p-4 text-[13px] text-slate-600">Yorder - Yorder Web Services (Android)</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
              <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Locations</div>
              <div className="p-4 text-[13px] text-slate-600">All countries and territories</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
              <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">Languages</div>
              <div className="p-4 text-[13px] text-slate-600">English</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
              <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">View-through conversion optimization</div>
              <div className="p-4 text-[13px] text-slate-600">Turned on</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0">
              <div className="p-4 text-[13px] font-medium text-slate-800 bg-[#fafafa] border-r border-slate-200">EU political ads</div>
              <div className="p-4 text-[13px] text-slate-600">Doesn't have EU political ads</div>
            </div>
          </div>
        </div>

        {/* Ad Group */}
        <div className="bg-[#f8f9fa] border border-slate-200 rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-[#f1f3f4]">
            <h3 className="text-[14px] font-medium text-slate-800 flex items-center gap-2">Ad group 1 <span className="text-slate-400">✎</span></h3>
          </div>
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0 bg-white">
            <div className="p-4 text-[13px] font-medium text-slate-800 border-r border-slate-200">Product groups</div>
            <div className="p-4 text-[13px] text-slate-600">This campaign is not using a product feed</div>
          </div>
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0 bg-white">
            <div className="p-4 text-[13px] font-medium text-slate-800 border-r border-slate-200">Ad assets</div>
            <div className="p-4 text-[13px] text-slate-600">No assets</div>
          </div>
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0 bg-white">
            <div className="p-4 text-[13px] font-medium text-slate-800 border-r border-slate-200">Audience</div>
            <div className="p-4 text-[13px] text-slate-600">
              Select or create an audience
              <div className="text-amber-500 flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3" /> Add an audience signal to reach the right customers faster</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
