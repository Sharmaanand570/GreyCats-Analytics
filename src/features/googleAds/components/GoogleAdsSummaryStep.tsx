
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

interface GoogleAdsSummaryStepProps {
  onNavigateToStep?: (stepId: number, subStepId: string) => void;
  campaignType?: string;
}

export default function GoogleAdsSummaryStep(_props: GoogleAdsSummaryStepProps) {


  const WrenchIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
  );

  const LightbulbIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1e8e3e]" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  const RedExclamation = () => (
    <div className="inline-flex items-center justify-center w-[14px] h-[14px] bg-[#c5221f] rounded-full text-white text-[10px] font-bold mr-2 mt-0.5 shrink-0">!</div>
  );

  const OrangeWarning = () => (
    <div className="inline-flex items-center justify-center w-[14px] h-[14px] text-[#e37400] mr-2 mt-0.5 shrink-0">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <h1 className="text-[24px] font-normal text-slate-800 mb-6">Your campaign is almost ready to publish</h1>

      {/* Issues Section */}
      <div className="mb-8">
        <h2 className="text-[14px] font-medium text-slate-800 mb-1">Issues</h2>
        <p className="text-[13px] text-slate-600 mb-4">Fix these issues to run your campaign</p>
        
        <div className="flex flex-col border border-slate-200 rounded-md bg-white">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <WrenchIcon />
              <div className="text-[13px] text-slate-800"><span className="font-medium">Add a budget:</span> To publish your campaign, enter a budget</div>
            </div>
            <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <WrenchIcon />
              <div className="text-[13px] text-slate-800"><span className="font-medium">Final URL:</span> Enter a valid URL (ex. https://www.example.com)</div>
            </div>
            <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <WrenchIcon />
              <div className="text-[13px] text-slate-800"><span className="font-medium">Budget:</span> Value is required</div>
            </div>
            <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-[14px] font-medium text-slate-800 mb-1">Recommendations</h2>
            <p className="text-[13px] text-slate-600">Apply these recommendations to optimize campaign performance</p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium select-none">
            <ChevronLeft className="w-4 h-4 text-slate-300 cursor-not-allowed" />
            <span>1 / 2</span>
            <ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-700" />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-start gap-4">
            <LightbulbIcon />
            <div className="text-[13px] text-slate-800 leading-relaxed mt-0.5">
              <span className="font-medium">Set a target CPA:</span> Get more conversions at a similar CPA by setting a target and staying unconstrained by budget
              <Info className="w-3.5 h-3.5 inline-block ml-1.5 text-slate-400 mb-0.5" />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="text-[13px] text-blue-600 font-medium hover:underline whitespace-nowrap">View</button>
            <button className="text-[13px] text-blue-600 font-medium hover:underline whitespace-nowrap">Apply</button>
          </div>
        </div>
      </div>

      {/* Summary Details */}
      <div className="flex flex-col gap-6">
        {/* Overview */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Overview</h2>
          <div className="border border-slate-200 rounded-md bg-white">
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Campaign name</div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value="Local store visits and promotions-Performance M" 
                  className="w-[300px] border border-slate-300 rounded px-2 py-1 text-[13px] text-slate-800 outline-none" 
                  readOnly 
                />
              </div>
            </div>
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Campaign type</div>
              <div className="flex-1 text-[13px] text-slate-800">Performance Max</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Goal</div>
              <div className="flex-1 text-[13px] text-slate-800">Contacts, Get directions</div>
            </div>
          </div>
        </div>

        {/* Bidding */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Bidding</h2>
          <div className="border border-slate-200 rounded-md bg-white">
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Bidding</div>
              <div className="flex-1 text-[13px] text-slate-800">Maximize conversions</div>
            </div>
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Customer acquisition</div>
              <div className="flex-1 text-[13px] text-slate-800">Bid equally for new and existing customers</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Customer retention</div>
              <div className="flex-1 text-[13px] text-slate-800">Do not adjust bidding to re-engage lapsed customers</div>
            </div>
          </div>
        </div>

        {/* Campaign settings */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Campaign settings</h2>
          <div className="border border-slate-200 rounded-md bg-white">
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Languages</div>
              <div className="flex-1 text-[13px] text-slate-800">English</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">EU political ads</div>
              <div className="flex-1 text-[13px] text-slate-800">Doesn't have EU political ads</div>
            </div>
          </div>
        </div>

        {/* Asset group */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Asset group</h2>
          <div className="border border-slate-200 rounded-md bg-white">
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Asset group name</div>
              <div className="flex-1 text-[13px] text-slate-800">Asset Group 1</div>
            </div>
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Final URL</div>
              <div className="flex-1 text-[13px] text-[#c5221f] flex items-start">
                <RedExclamation />
                Enter a valid URL (ex. https://www.example.com)
              </div>
            </div>
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Assets</div>
              <div className="flex-1 text-[13px] text-slate-800">No assets</div>
            </div>
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Asset optimization</div>
              <div className="flex-1 text-[13px] text-slate-800">Text customization, final URL expansion, and 2 more are turned on</div>
            </div>
            <div className="flex p-4 border-b border-slate-200">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Search themes</div>
              <div className="flex-1 text-[13px] text-slate-800">No signals provided</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Audience</div>
              <div className="flex-1 text-[13px]">
                <div className="text-slate-800">No signal provided</div>
                <div className="flex items-start text-[#e37400] mt-1">
                  <OrangeWarning />
                  Add signals
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Budget</h2>
          <div className="border border-slate-200 rounded-md bg-white">
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-slate-600 font-medium">Budget</div>
              <div className="flex-1 text-[13px]">
                <div className="text-slate-800 mb-1">₹0.00/day</div>
                <div className="flex items-start text-[#c5221f]">
                  <RedExclamation />
                  Value is required
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
