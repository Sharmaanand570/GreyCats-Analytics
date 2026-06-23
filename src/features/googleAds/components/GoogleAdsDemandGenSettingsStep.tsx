import { useState } from "react";
import { ChevronUp, ChevronDown, TriangleAlert } from "lucide-react";

interface DemandGenSettingsProps {
  campaignGoal: string;
  onCampaignGoalChange: (goal: string) => void;
}

export default function GoogleAdsDemandGenSettingsStep({ campaignGoal, onCampaignGoalChange }: DemandGenSettingsProps) {
  const [openSections, setOpenSections] = useState({
    viewThrough: true,
    targetCpa: true,
    budget: true,
    customerAcq: true,
    brandGuidelines: true,
    euPolitical: true,
    locationLang: false,
    devices: false,
    adSchedule: false,
    measurement: false,
    urlOptions: false,
    ipExclusions: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex flex-col gap-4 pb-20 max-w-[800px]">
      
      {/* Campaign Name */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
           <h2 className="text-[14px] text-slate-800 font-medium">Campaign name</h2>
           <ChevronUp className="w-5 h-5 text-slate-500" />
        </div>
        <div className="p-6">
           <input 
             type="text" 
             defaultValue="Demand Gen - 2026-06-22"
             className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
           />
           <div className="text-[11px] text-slate-400 text-right mt-1">23 / 250</div>
        </div>
      </div>

      {/* Product Feeds */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
           <h2 className="text-[14px] text-slate-800 font-medium">Product feeds</h2>
           <ChevronUp className="w-5 h-5 text-slate-500" />
        </div>
        <div className="p-6">
           <label className="flex items-center gap-3 cursor-pointer">
             <div className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" />
               <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
             </div>
             <span className="text-[13px] text-slate-800">Advertise products from a Merchant Center account</span>
           </label>
        </div>
      </div>

      {/* Campaign Goal */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
           <h2 className="text-[14px] text-slate-800 font-medium">Campaign goal</h2>
           <ChevronUp className="w-5 h-5 text-slate-500" />
        </div>
        <div className="p-6">
           <div className="grid grid-cols-4 gap-4">
             {/* Conversions */}
             <div 
               onClick={() => onCampaignGoalChange('conversions')}
               className={`border rounded p-4 relative cursor-pointer transition-colors ${campaignGoal === 'conversions' ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}
             >
                {campaignGoal === 'conversions' && (
                  <div className="absolute top-3 right-3 text-blue-600">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                )}
                <div className={`w-6 h-6 mb-2 ${campaignGoal === 'conversions' ? 'text-blue-600' : 'text-slate-600'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18M15 3v18"/></svg>
                </div>
                <div className={`text-[13px] font-medium mb-1 ${campaignGoal === 'conversions' ? 'text-blue-700' : 'text-slate-800'}`}>Conversions</div>
                <div className="text-[11px] text-slate-500 leading-tight">Get more sales or other conversion actions with your ads using a conversion based bid strategy</div>
             </div>

             {/* Clicks */}
             <div 
               onClick={() => onCampaignGoalChange('clicks')}
               className={`border rounded p-4 relative cursor-pointer transition-colors ${campaignGoal === 'clicks' ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}
             >
                {campaignGoal === 'clicks' && (
                  <div className="absolute top-3 right-3 text-blue-600">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                )}
                <div className={`w-6 h-6 mb-2 ${campaignGoal === 'clicks' ? 'text-blue-600' : 'text-slate-600'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </div>
                <div className={`text-[13px] font-medium mb-1 ${campaignGoal === 'clicks' ? 'text-blue-700' : 'text-slate-800'}`}>Clicks</div>
                <div className="text-[11px] text-slate-500 leading-tight">Get more traffic or engagement with your ads using a cost per click based bid strategy</div>
             </div>

             {/* Conversion Value */}
             <div className="border border-slate-200 rounded p-4 cursor-pointer hover:border-slate-300 opacity-50">
                <div className="w-6 h-6 mb-2 text-slate-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <div className="text-[13px] font-medium text-slate-800 mb-1">Conversion value</div>
                <div className="text-[11px] text-slate-500 leading-tight">Get more sales or other conversion actions to get the most value at a value you set</div>
             </div>

             {/* YouTube Engagements */}
             <div 
               onClick={() => onCampaignGoalChange('youtube')}
               className={`border rounded p-4 relative cursor-pointer transition-colors ${campaignGoal === 'youtube' ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}
             >
                {campaignGoal === 'youtube' && (
                  <div className="absolute top-3 right-3 text-blue-600">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                )}
                <div className={`w-6 h-6 mb-2 ${campaignGoal === 'youtube' ? 'text-blue-600' : 'text-slate-600'}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.665 2.665 0 0 0-1.875-1.882c-1.654-.446-8.272-.446-8.272-.446s-6.618 0-8.272.446a2.665 2.665 0 0 0-1.875 1.882C.843 7.846.843 11.8.843 11.8s0 3.954.445 5.614a2.665 2.665 0 0 0 1.875 1.882c1.654.446 8.272.446 8.272.446s6.618 0 8.272-.446a2.665 2.665 0 0 0 1.875-1.882c.445-1.66.445-5.614.445-5.614s0-3.954-.445-5.614z"/><path fill="white" d="M10.156 15.086l6.098-3.286-6.098-3.286z"/></svg>
                </div>
                <div className={`text-[13px] font-medium mb-1 ${campaignGoal === 'youtube' ? 'text-blue-700' : 'text-slate-800'}`}>YouTube engagements</div>
                <div className="text-[11px] text-slate-500 leading-tight">Get more YouTube subscriptions and engagements</div>
             </div>
           </div>
           
           {/* YouTube Link Warning */}
           {campaignGoal === 'youtube' && (
             <div className="bg-red-50/50 border border-red-200 rounded p-4 flex items-center justify-between mt-4">
               <div className="flex items-center gap-3">
                 <div className="text-red-500">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                 </div>
                 <div className="text-[12px] text-red-600">
                   Your campaign can't run until you link your YouTube channel to your Google Ads account.
                 </div>
               </div>
               <button className="text-[13px] font-medium text-blue-600 hover:underline">Link channel</button>
             </div>
           )}
        </div>
      </div>

      {/* Conversion Goals */}
      {campaignGoal === 'conversions' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className="text-[14px] text-slate-800 font-medium">Conversion goals</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <table className="w-full text-left">
               <thead className="border-b border-slate-200">
                 <tr>
                   <th className="pb-3 text-[11px] text-slate-500 font-medium">Conversion Goals</th>
                   <th className="pb-3 text-[11px] text-slate-500 font-medium">Conversion Source</th>
                   <th className="pb-3 text-[11px] text-slate-500 font-medium">Conversion Actions</th>
                   <th className="pb-3 text-[11px] text-slate-500 font-medium">Value</th>
                   <th className="pb-3 w-8"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 <tr className="hover:bg-slate-50">
                   <td className="py-4 flex items-center gap-3">
                     <input type="radio" name="convGoal" defaultChecked className="w-4 h-4 text-blue-600" />
                     <div className="flex items-center gap-2 text-[13px] font-medium text-slate-800">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                       Contacts (account default)
                     </div>
                   </td>
                   <td className="py-4">
                     <div className="flex flex-col gap-3 text-[12px] text-slate-600">
                       <div>Call from Ads</div>
                       <div>Website</div>
                     </div>
                   </td>
                   <td className="py-4">
                     <div className="flex flex-col gap-3 text-[12px] text-slate-600">
                       <div className="flex items-center gap-1"><TriangleAlert className="w-3.5 h-3.5 text-amber-500" /> 1 action</div>
                       <div className="flex items-center gap-1"><TriangleAlert className="w-3.5 h-3.5 text-amber-500" /> 1 action</div>
                     </div>
                   </td>
                   <td className="py-4">
                     <div className="flex flex-col gap-3 text-[12px] text-slate-600">
                       <div>Dynamic</div>
                       <div>Dynamic</div>
                     </div>
                   </td>
                   <td className="py-4">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                   </td>
                 </tr>

                 <tr className="hover:bg-slate-50">
                   <td className="py-4 flex items-center gap-3">
                     <input type="radio" name="convGoal" className="w-4 h-4 text-blue-600" />
                     <div className="flex items-center gap-2 text-[13px] text-slate-800">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                       Page views (account default)
                     </div>
                   </td>
                   <td className="py-4 text-[12px] text-slate-600">Website</td>
                   <td className="py-4 text-[12px] text-slate-600"><div className="flex items-center gap-1"><TriangleAlert className="w-3.5 h-3.5 text-amber-500" /> 1 action</div></td>
                   <td className="py-4 text-[12px] text-slate-600">Dynamic</td>
                   <td className="py-4"></td>
                 </tr>

                 <tr className="hover:bg-slate-50">
                   <td className="py-4 flex items-center gap-3">
                     <input type="radio" name="convGoal" className="w-4 h-4 text-blue-600" />
                     <div className="flex items-center gap-2 text-[13px] text-slate-800">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                       Phone call leads (account default)
                     </div>
                   </td>
                   <td className="py-4 text-[12px] text-slate-600">Call from Ads</td>
                   <td className="py-4 text-[12px] text-slate-600"><div className="flex items-center gap-1"><TriangleAlert className="w-3.5 h-3.5 text-amber-500" /> 2 actions</div></td>
                   <td className="py-4 text-[12px] text-slate-600">Multiple values</td>
                   <td className="py-4"></td>
                 </tr>
               </tbody>
             </table>

             <div className="bg-[#fff8e1] border border-[#ffe082] rounded p-4 flex items-start gap-3 mt-4">
               <TriangleAlert className="w-5 h-5 text-amber-500 shrink-0" />
               <div className="flex items-center justify-between w-full">
                 <div className="text-[12px] text-slate-800">
                   All of the actions in your selected conversion goals are unverified. Select a goal with verified actions or add a verified action to this goal.
                 </div>
                 <a href="#" className="text-[13px] font-medium text-blue-600 hover:underline">Fix it</a>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* View-through conversion optimization */}
      {campaignGoal !== 'clicks' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('viewThrough')}>
             <h2 className="text-[14px] text-slate-800 font-medium flex items-center gap-2">
               View-through conversion optimization <span className="bg-green-100 text-green-700 text-[10px] font-medium px-1.5 py-0.5 rounded">BETA</span>
             </h2>
             {openSections.viewThrough ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {openSections.viewThrough && (
            <div className="p-6">
              <div className="text-[12px] text-slate-600 mb-4 leading-relaxed">
                Google Ads can include view-through conversions, in addition to click-through and engaged-view conversions, when bidding and reporting. While in beta, not all channels are supported. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded text-blue-600" />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Include view-through conversions</div>
                  <div className="text-[12px] text-slate-500">Recorded when users view (but don't interact with) an ad and then later convert</div>
                </div>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Target cost per action / click */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('targetCpa')}>
           <h2 className="text-[14px] text-slate-800 font-medium">
             {campaignGoal === 'clicks' ? 'Target cost per click' : 'Target cost per action'}
           </h2>
           {openSections.targetCpa ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {openSections.targetCpa && (
          <div className="p-6 flex gap-8">
            <div className="flex-1">
              <div className="text-[12px] text-slate-600 mb-4 leading-relaxed">
                {campaignGoal === 'clicks' 
                  ? 'By default, your campaign will aim to maximize clicks. You can set an optional target cost per click (Target CPC) to optimize for getting clicks at a specific cost per click. Your ad groups will use your campaign-level target CPC by default, and you can set a target for each of your ad groups.'
                  : 'By default, your campaign will aim to maximize your conversions. You can set an optional target cost per action (Target CPA) to optimize for getting conversions at a specific cost per conversion. Your ad groups will use your campaign-level Target CPA by default, and you can set a target for each of your ad groups.'
                }
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600" />
                <span className="text-[13px] text-slate-800">
                  {campaignGoal === 'clicks' ? 'Set a target cost per click (optional)' : 'Set a target cost per action (optional)'}
                </span>
              </label>
            </div>
            <div className="w-[200px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-500 leading-relaxed">
              {campaignGoal === 'clicks'
                ? 'Target CPC is the average amount you\'d like to pay for a click. Google Ads will optimize bids to help get as many clicks as possible at the target cost-per-click (CPC). Some clicks may cost more or less than your target. '
                : 'Target CPA is the average amount you\'d like to pay for a conversion. Google Ads will optimize bids to help get as many conversions as possible at the target cost per action (CPA). Some conversions may cost more or less than your target. '
              }
              <a href="#" className="text-blue-600 hover:underline">Learn more</a>
            </div>
          </div>
        )}
      </div>

      {/* Budget and dates */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('budget')}>
           <h2 className="text-[14px] text-slate-800 font-medium">Budget and dates</h2>
           {openSections.budget ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {openSections.budget && (
          <div className="p-6">
            <div className="flex gap-8 mb-6">
              <div className="flex-1">
                <div className="text-[13px] font-medium text-slate-800 mb-2">Enter budget type and amount</div>
                <div className="flex items-start gap-4">
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <select className="px-3 py-2 text-[13px] text-slate-800 outline-none w-[120px] bg-white cursor-pointer">
                      <option>Daily</option>
                      <option>Campaign total</option>
                    </select>
                  </div>
                  <div className="flex flex-col relative">
                    <div className="flex items-center border border-red-500 rounded overflow-hidden shadow-sm">
                      <span className="px-3 text-slate-500 bg-slate-50 border-r border-slate-200">₹</span>
                      <input type="text" className="px-3 py-2 w-[160px] outline-none text-[13px]" />
                    </div>
                    <div className="text-[11px] text-red-500 absolute -bottom-5">Required</div>
                  </div>
                </div>
              </div>
              <div className="w-[200px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-500 leading-relaxed">
                For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded p-4 flex items-center justify-between">
              <div className="text-[13px] text-slate-600">
                <span className="font-medium text-slate-800">Start date:</span> 6/22/2026<br />
                <span className="font-medium text-slate-800">End date:</span> None
              </div>
              <button className="text-[13px] font-medium text-blue-600 hover:underline">Edit</button>
            </div>
          </div>
        )}
      </div>

      {/* Customer acquisition */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('customerAcq')}>
           <h2 className="text-[14px] text-slate-800 font-medium">Customer acquisition</h2>
           {openSections.customerAcq ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {openSections.customerAcq && (
          <div className="p-6 flex gap-8">
            <div className="flex-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded text-blue-600" />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Only bid for new customers</div>
                  <div className="text-[12px] text-slate-500">Your campaign will be limited to only new customers, regardless of your bid strategy</div>
                </div>
              </label>
            </div>
            <div className="w-[200px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-500 leading-relaxed">
              By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" className="text-blue-600 hover:underline">Learn more about customer acquisition</a>
            </div>
          </div>
        )}
      </div>

      {/* Brand guidelines */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('brandGuidelines')}>
           <h2 className="text-[14px] text-slate-800 font-medium">Brand guidelines</h2>
           {openSections.brandGuidelines ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {openSections.brandGuidelines && (
          <div className="p-6">
            <div className="text-[12px] text-slate-600 mb-4">
              Control how your brand appears in ads for this campaign. <a href="#" className="text-blue-600 hover:underline">Learn more about brand guidelines</a>
            </div>
            
            <div className="mb-6">
              <div className="text-[13px] font-medium text-slate-800 mb-2">Custom colors</div>
              <div className="flex gap-4">
                <div>
                  <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-2 w-[160px] bg-white">
                    <span className="text-[13px] text-slate-400">Main color</span>
                    <div className="w-4 h-4 rounded-full border border-slate-200 ml-auto bg-white"></div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Example: #FFFF</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-2 w-[160px] bg-white">
                    <span className="text-[13px] text-slate-400">Accent color</span>
                    <div className="w-4 h-4 rounded-full border border-slate-200 ml-auto bg-white"></div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Example: #FFFF</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[13px] font-medium text-slate-800 mb-2">Font</div>
              <div className="border border-slate-300 rounded overflow-hidden w-full max-w-sm">
                <select className="px-3 py-2 w-full text-[13px] text-slate-800 outline-none bg-white cursor-pointer">
                  <option>Any font</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EU political ads */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('euPolitical')}>
           <h2 className="text-[14px] text-slate-800 font-medium">EU political ads</h2>
           {openSections.euPolitical ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {openSections.euPolitical && (
          <div className="p-6 flex gap-8">
            <div className="flex-1">
              <div className="text-[13px] font-medium text-slate-800 mb-1 flex items-center gap-2">
                Does your campaign have European Union political ads? <span className="text-[10px] text-red-500 bg-red-50 px-1 rounded">Required</span>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="euPolitical" className="w-4 h-4 text-blue-600" />
                  <span className="text-[13px] text-slate-800">Yes, this campaign has EU political ads</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="euPolitical" className="w-4 h-4 text-blue-600" />
                  <span className="text-[13px] text-slate-800">No, this campaign doesn't have EU political ads</span>
                </label>
              </div>
            </div>
            <div className="w-[200px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-500 leading-relaxed bg-blue-50/30">
              EU regulation requires Google to ask this question.<br />
              <a href="#" className="text-blue-600 hover:underline">Learn more about EU political ads</a><br />
              <a href="#" className="text-blue-600 hover:underline">Details</a>
            </div>
          </div>
        )}
      </div>

      {/* Collapsed Sections */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('locationLang')}>
           <div className="flex gap-16">
             <h2 className="text-[14px] text-slate-800 font-medium w-[200px]">Location and language</h2>
             <span className="text-[13px] text-slate-600">Set at ad group, include people with presence in locations</span>
           </div>
           <ChevronDown className="w-5 h-5 text-slate-500" />
        </div>

        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('devices')}>
           <div className="flex gap-16">
             <h2 className="text-[14px] text-slate-800 font-medium w-[200px]">Devices</h2>
             <span className="text-[13px] text-slate-600">All eligible devices (computers, mobile, tablet, and TV screens)</span>
           </div>
           <ChevronDown className="w-5 h-5 text-slate-500" />
        </div>

        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('adSchedule')}>
           <div className="flex gap-16">
             <h2 className="text-[14px] text-slate-800 font-medium w-[200px]">Ad schedule</h2>
             <span className="text-[13px] text-slate-600">All day</span>
           </div>
           <ChevronDown className="w-5 h-5 text-slate-500" />
        </div>

        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('measurement')}>
           <div className="flex gap-16">
             <h2 className="text-[14px] text-slate-800 font-medium w-[200px]">Third-party measurement</h2>
             <span className="text-[13px] text-slate-600">None</span>
           </div>
           <ChevronDown className="w-5 h-5 text-slate-500" />
        </div>

        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('urlOptions')}>
           <div className="flex gap-16">
             <h2 className="text-[14px] text-slate-800 font-medium w-[200px]">Campaign URL options</h2>
             <span className="text-[13px] text-slate-600">No options set</span>
           </div>
           <ChevronDown className="w-5 h-5 text-slate-500" />
        </div>

        <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('ipExclusions')}>
           <div className="flex gap-16">
             <h2 className="text-[14px] text-slate-800 font-medium w-[200px]">IP exclusions</h2>
             <span className="text-[13px] text-slate-600">No exclusions set</span>
           </div>
           <ChevronDown className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </div>
  );
}
