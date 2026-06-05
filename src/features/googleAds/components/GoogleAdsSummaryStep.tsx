import { useState } from "react";
import { Info, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface GoogleAdsSummaryStepProps {
  onNavigateToStep?: (stepId: number, subStepId: string) => void;
  campaignType?: string;
}

export default function GoogleAdsSummaryStep({ onNavigateToStep, campaignType }: GoogleAdsSummaryStepProps) {
  const [currentRec, setCurrentRec] = useState(0);

  const pmaxRecommendations = [
    {
      id: 1,
      icon: Sparkles,
      iconColor: "text-blue-600",
      content: (
        <>
          <span className="font-medium">Improve your Performance Max asset groups:</span> Get more conversions by adding or improving your assets
          <Info className="w-3.5 h-3.5 inline-block ml-1.5 text-slate-400 mb-0.5" />
        </>
      ),
      badge: "+4.3%",
      action: () => onNavigateToStep?.(3, 'assets'),
    },
    {
      id: 2,
      icon: ({ className }: { className?: string }) => (
        <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className={`w-3 h-3 fill-[#c5221f] ${className}`}><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
        </div>
      ),
      iconColor: "",
      content: "To use customer acquisition, you need to include at least one eligible audience segment",
      action: () => onNavigateToStep?.(3, 'audience-signal'),
    },
    {
      id: 3,
      icon: ({ className }: { className?: string }) => (
        <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className={`w-3 h-3 fill-[#c5221f] ${className}`}><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
        </div>
      ),
      iconColor: "",
      content: "Multiple asset group issues",
      action: () => onNavigateToStep?.(3, 'assets'),
    }
  ];

  const handleNextRec = () => setCurrentRec(r => Math.min(pmaxRecommendations.length - 1, r + 1));
  const handlePrevRec = () => setCurrentRec(r => Math.max(0, r - 1));

  const activeRec = pmaxRecommendations[currentRec];
  const Icon = activeRec?.icon;

  return (
    <div className="max-w-[800px]">
      <h1 className="text-[24px] font-normal text-slate-800 mb-1">Your campaign is almost ready to publish</h1>

      {/* Issues Section */}
      <div className="mb-8 mt-6">
        <h2 className="text-[15px] font-medium text-slate-800 mb-1">Issues</h2>
        <p className="text-[13px] text-slate-600 mb-4">Fix these issues to run your campaign</p>
        
        <div className="flex flex-col gap-0 border border-slate-200 rounded-md bg-white">
          {campaignType === "Search" ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                  </div>
                  <div className="text-[13px] text-slate-800"><span className="font-medium">Create an ad:</span> Get your ads running by adding ads to your ad group</div>
                </div>
                <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                  </div>
                  <div className="text-[13px] text-slate-800"><span className="font-medium">Add keywords:</span> Get your ads running by adding keywords to your ad group</div>
                </div>
                <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                  </div>
                  <div className="text-[13px] text-slate-800"><span className="font-medium">Add a budget:</span> To publish your campaign, enter a budget</div>
                </div>
                <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                  </div>
                  <div className="text-[13px] text-slate-800"><span className="font-medium">Budget:</span> Value is required</div>
                </div>
                <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                  </div>
                  <div className="text-[13px] text-slate-800"><span className="font-medium">Billing:</span> Balance exhausted</div>
                </div>
                <button className="text-[13px] text-blue-600 font-medium hover:underline">Fix it</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                  </div>
                  <div className="text-[13px] text-slate-800"><span className="font-medium">Create an asset group:</span> Get your ads running by adding an asset group</div>
                </div>
                <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fce8e6] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c5221f]"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                  </div>
                  <div className="text-[13px] text-slate-800"><span className="font-medium">Billing:</span> Balance exhausted</div>
                </div>
                <button className="text-[13px] text-blue-600 font-medium hover:underline">Fix it</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-[15px] font-medium text-slate-800 mb-1">Recommendations</h2>
            <p className="text-[13px] text-slate-600">Apply these recommendations to optimize campaign performance</p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium select-none">
            {campaignType === "Search" ? (
              <>
                <ChevronLeft className="w-4 h-4 text-slate-300" />
                <span>1 / 2</span>
                <ChevronRight className="w-4 h-4 text-slate-700 cursor-pointer" />
              </>
            ) : (
              <>
                <ChevronLeft 
                  className={`w-4 h-4 ${currentRec > 0 ? 'cursor-pointer hover:text-slate-900 text-slate-700' : 'text-slate-300'}`} 
                  onClick={handlePrevRec}
                />
                <span>{currentRec + 1} / {pmaxRecommendations.length}</span>
                <ChevronRight 
                  className={`w-4 h-4 ${currentRec < pmaxRecommendations.length - 1 ? 'cursor-pointer hover:text-slate-900 text-slate-700' : 'text-slate-300'}`} 
                  onClick={handleNextRec}
                />
              </>
            )}
          </div>
        </div>
        
        <div className="border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white">
          <div className="flex items-center gap-3 pr-4">
            {campaignType === "Search" ? (
              <>
                <Sparkles className="w-4 h-4 text-green-600 shrink-0" />
                <div className="text-[13px] text-slate-800">
                  <span className="font-medium">Set a target CPA.</span> Get more conversions at a similar CPA by setting a target and staying unconstrained by budget
                  <Info className="w-3.5 h-3.5 inline-block ml-1.5 text-slate-400 mb-0.5" />
                </div>
              </>
            ) : (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${activeRec.iconColor}`} />
                <div className="text-[13px] text-slate-800">
                  {activeRec.content}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {campaignType !== "Search" && activeRec.badge && <span className="text-[13px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{activeRec.badge}</span>}
            <button className="text-blue-600 text-[13px] font-medium hover:underline" onClick={campaignType !== "Search" ? activeRec.action : undefined}>View</button>
            <button className="text-blue-600 text-[13px] font-medium hover:underline">Apply</button>
          </div>
        </div>
      </div>

      {/* Overview Table */}
      <div className="mb-10 text-[13px]">
        {campaignType === "Search" ? (
          <>
            {/* Search Campaign Review Table */}
            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Overview</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200">
                <div className="p-4 text-slate-600">Campaign name</div>
                <div className="p-4">
                  <input type="text" className="border border-slate-300 rounded px-3 py-1.5 w-[300px] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" defaultValue="Search-5" />
                </div>
              </div>
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200">
                <div className="p-4 text-slate-600">Campaign type</div>
                <div className="p-4 text-slate-800">Search</div>
              </div>
              <div className="grid grid-cols-[200px_1fr]">
                <div className="p-4 text-slate-600">Goal</div>
                <div className="p-4 text-slate-800">Add to cart, Begin checkout, Other, Downloads, Page views, Purchases</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Bidding</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(1, 'bidding')}>
                <div className="p-4 text-slate-600">Bidding</div>
                <div className="p-4 text-slate-800">Maximize conversions</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(1, 'customer-acquisition')}>
                <div className="p-4 text-slate-600">Customer acquisition</div>
                <div className="p-4 text-slate-800">Bid equally for new and existing customers</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Campaign settings</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(2, 'networks')}>
                <div className="p-4 text-slate-600">Networks</div>
                <div className="p-4 text-slate-800">Google Search Network, Search partners, Display Network</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(2, 'locations')}>
                <div className="p-4 text-slate-600">Locations</div>
                <div className="p-4 text-slate-800">All countries and territories</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(2, 'languages')}>
                <div className="p-4 text-slate-600">Languages</div>
                <div className="p-4 text-slate-800">English</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(2, 'eu-political-ads')}>
                <div className="p-4 text-slate-600">EU political ads</div>
                <div className="p-4 text-slate-800">Doesn't have EU political ads</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(2, 'audience-segments')}>
                <div className="p-4 text-slate-600">Audiences</div>
                <div className="p-4 text-slate-800">No segments</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">AI Max</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(3, 'ai-max')}>
                <div className="p-4 text-slate-600">Asset optimization</div>
                <div className="p-4 text-slate-800">Text customization and Final URL expansion turned off</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(3, 'ai-max')}>
                <div className="p-4 text-slate-600">Branded searches</div>
                <div className="p-4 text-slate-800">Showing ads on all relevant searches</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Keywords and ads</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(5, 'keywords')}>
                <div className="p-4 text-slate-600">Keywords</div>
                <div className="p-4 text-slate-800">None</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(5, 'keywords')}>
                <div className="p-4 text-slate-600">Search term matching</div>
                <div className="p-4 text-slate-800">Using only your keywords and match types</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(5, 'keywords')}>
                <div className="p-4 text-slate-600">Brand inclusions</div>
                <div className="p-4 text-slate-800">Limiting to: 0 brand lists</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(5, 'keywords')}>
                <div className="p-4 text-slate-600">Locations of interest</div>
                <div className="p-4 text-slate-800">None</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(5, 'keywords')}>
                <div className="p-4 text-slate-600">URL inclusions</div>
                <div className="p-4 text-slate-800">No URL inclusions</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Budget</h2>
            <div className="border border-slate-200 rounded-md bg-white mb-8">
              <div className="grid grid-cols-[200px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(6, 'budget')}>
                <div className="p-4 text-slate-600">Budget</div>
                <div className="p-4 text-slate-800">
                  <div>₹0.00/day</div>
                  <div className="text-[#c5221f] text-[11px] mt-1 flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    Value is required
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* PMax Campaign Review Table */}
            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Overview</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[250px_1fr] border-b border-slate-200">
                <div className="p-4 text-slate-600">Campaign name</div>
                <div className="p-4">
                  <input type="text" className="border border-slate-300 rounded px-3 py-1.5 w-[300px] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" defaultValue="Performance Max-1" />
                </div>
              </div>
              <div className="grid grid-cols-[250px_1fr]">
                <div className="p-4 text-slate-600">Campaign type</div>
                <div className="p-4 text-slate-800">Performance Max</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Bidding</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[250px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(1, 'bidding')}>
                <div className="p-4 text-slate-600">Bidding</div>
                <div className="p-4 text-slate-800 flex flex-col gap-1">
                  <div>Maximize conversions</div>
                  <div className="text-slate-500">Target CPA: Not set</div>
                </div>
              </div>
              <div className="grid grid-cols-[250px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(1, 'customer-acquisition')}>
                <div className="p-4 text-slate-600">Customer acquisition</div>
                <div className="p-4 text-slate-800">Bid equally for new and existing customers</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Campaign settings</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[250px_1fr] border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(2, 'locations')}>
                <div className="p-4 text-slate-600">Locations</div>
                <div className="p-4 text-slate-800">All countries and territories</div>
              </div>
              <div className="grid grid-cols-[250px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(2, 'languages')}>
                <div className="p-4 text-slate-600">Languages</div>
                <div className="p-4 text-slate-800">English</div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Asset group</h2>
            <div className="border border-slate-200 rounded-md bg-white">
              <div className="grid grid-cols-[250px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(3, 'assets')}>
                <div className="p-4 text-slate-600">Asset group 1</div>
                <div className="p-4 text-slate-800">
                  <div className="text-[#c5221f] flex items-center gap-1.5 font-medium mb-1">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    Poor ad strength
                  </div>
                  <div className="text-slate-600 text-[12px]">Add images, Add a logo, Add descriptions</div>
                </div>
              </div>
            </div>

            <h2 className="text-[15px] font-medium text-slate-800 mb-3 mt-8">Budget</h2>
            <div className="border border-slate-200 rounded-md bg-white mb-8">
              <div className="grid grid-cols-[250px_1fr] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigateToStep?.(4, 'budget')}>
                <div className="p-4 text-slate-600">Budget</div>
                <div className="p-4 text-slate-800">₹1,326.23 / day</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
