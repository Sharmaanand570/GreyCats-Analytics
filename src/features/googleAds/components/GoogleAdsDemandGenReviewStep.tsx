import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function GoogleAdsDemandGenReviewStep() {
  const [detailsExpanded, setDetailsExpanded] = useState({ campaign: false, adGroup: false });
  
  const toggleDetails = (section: 'campaign' | 'adGroup') => {
    setDetailsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[800px]">
      <h2 className="text-[22px] font-normal text-slate-800">Review your campaign</h2>

      <div className="flex flex-col gap-4">
        
        {/* Campaign Accordion */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h3 className="text-[14px] text-slate-800 font-medium">Demand Gen - 2026-06-22</h3>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-slate-500">Daily budget</div>
                <div className="text-[13px] font-medium text-slate-800">Not set</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-slate-500">Start date</div>
                <div className="text-[13px] font-medium text-slate-800">6/22/2026</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-slate-500">End date</div>
                <div className="text-[13px] font-medium text-slate-800">Not set</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-slate-500">Conversion goals</div>
                <div className="text-[13px] font-medium text-slate-800">Not set</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-slate-500">Bidding strategy</div>
                <div className="text-[13px] font-medium text-slate-800">Maximize conversions</div>
              </div>
            </div>

            <div 
              onClick={() => toggleDetails('campaign')}
              className={`flex items-center gap-1 text-[13px] font-medium text-blue-600 cursor-pointer -mx-6 px-6 py-3 border-t border-slate-100 ${detailsExpanded.campaign ? 'bg-[#e8f0fe]' : ''}`}
            >
              {detailsExpanded.campaign ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              More details
            </div>

            {detailsExpanded.campaign && (
              <div className="flex flex-col text-[12px] text-slate-800 -mx-6 px-6 bg-white">
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">View-through conversion optimization</div>
                  <div className="flex-1 text-slate-600">Turned off</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Customer acquisition</div>
                  <div className="flex-1 text-slate-600">Bid equally for new and existing customers</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Brand guidelines</div>
                  <div className="flex-1 text-slate-600">No guidelines set</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">EU political ads</div>
                  <div className="flex-1 text-slate-600">Not specified</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Location and language</div>
                  <div className="flex-1 text-slate-600">Set at ad group, include people with presence in locations</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Devices</div>
                  <div className="flex-1 text-slate-600">All eligible devices (computers, mobile, tablet, and TV screens)</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Ad schedule</div>
                  <div className="flex-1 text-slate-600">All day</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Campaign URL options</div>
                  <div className="flex-1 text-slate-600">No options set</div>
                </div>
                <div className="flex py-4">
                  <div className="w-[300px] font-medium text-slate-800">IP exclusions</div>
                  <div className="flex-1 text-slate-600">No exclusions set</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ad group Accordion */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h3 className="text-[14px] text-slate-800 font-medium">Ad group 1</h3>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="flex gap-16 mb-6">
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-slate-500">Ads</div>
                <div className="text-[13px] font-medium text-slate-800">1</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[11px] text-slate-500">Available impressions</div>
                <div className="text-[13px] font-medium text-slate-800">10B+</div>
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-red-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="text-[12px] text-red-600">
                  "Ad 1" has errors which will prevent this campaign from being published
                </div>
              </div>
              <button className="bg-red-100 text-red-700 text-[13px] font-medium px-3 py-1.5 rounded hover:bg-red-200">
                Fix it
              </button>
            </div>

            <div 
              onClick={() => toggleDetails('adGroup')}
              className={`flex items-center gap-1 text-[13px] font-medium text-blue-600 cursor-pointer -mx-6 px-6 py-3 border-t border-slate-100 ${detailsExpanded.adGroup ? 'bg-[#e8f0fe]' : ''}`}
            >
              {detailsExpanded.adGroup ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              More details
            </div>

            {detailsExpanded.adGroup && (
              <div className="flex flex-col text-[12px] text-slate-800 -mx-6 px-6 bg-white pb-2">
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Languages</div>
                  <div className="flex-1 text-slate-600">All languages</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Locations</div>
                  <div className="flex-1 text-slate-600">India (country)</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Channels</div>
                  <div className="flex-1 text-slate-600">All Google channels</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Optimized targeting</div>
                  <div className="flex-1 text-slate-600">On</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Ad group URL options</div>
                  <div className="flex-1 text-slate-600">No options set</div>
                </div>
                <div className="flex py-4 border-b border-slate-100">
                  <div className="w-[300px] font-medium text-slate-800">Ads</div>
                </div>
                <div className="flex py-4 items-center">
                  <div className="w-[150px] flex flex-col">
                    <div className="text-blue-600 font-medium text-[13px]">Ad 1</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <span className="font-bold text-[14px] leading-none">+</span> 2 active enhancements
                    </div>
                  </div>
                  <div className="w-[150px] text-slate-600">Video ad</div>
                  <div className="w-[150px] text-slate-600">No assets</div>
                  <div className="flex-1 text-slate-600">Final URL not set</div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
