import { ChevronLeft, ChevronRight, Info } from "lucide-react";

interface GoogleAdsSummaryStepProps {
  onNavigateToStep?: (stepId: number, subStepId: string) => void;
  campaignType?: string;
}

export default function GoogleAdsSummaryStep({ campaignType = "Search" }: GoogleAdsSummaryStepProps) {

  const WrenchIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#c5221f] shrink-0">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
    </svg>
  );

  const LightbulbIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1e8e3e] shrink-0" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  const RedDot = () => (
    <span className="inline-block w-2 h-2 rounded-full bg-[#c5221f] mr-1.5 shrink-0 mt-1" />
  );

  const isSearch = campaignType === "Search";

  // Issues list differs by campaign type
  const issues = isSearch ? [
    { label: "Create an ad:", detail: "Get your ads running by adding ads to your ad group" },
    { label: "Add keywords:", detail: "Get your ads running by adding keywords to your ad group" },
    { label: "Add a budget:", detail: "To publish your campaign, enter a budget" },
    { label: "Bidding:", detail: "Enter an amount" },
  ] : [
    { label: "Customer acquisition:", detail: "This campaign will not run. To fix this, you need to include at least one eligible audience segment or turn off customer acquisition" },
  ];

  return (
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <h1 className="text-[24px] font-normal text-slate-800 mb-6">Your campaign is almost ready to publish</h1>

      {/* Issues Section */}
      <div className="mb-8">
        <h2 className="text-[14px] font-medium text-slate-800 mb-1">Issues</h2>
        <p className="text-[13px] text-slate-600 mb-4">Fix these issues to run your campaign</p>

        <div className="flex flex-col border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-start gap-3">
                <WrenchIcon />
                <div className="text-[13px] text-slate-800">
                  <span className="font-medium">{issue.label}</span> {issue.detail}
                </div>
              </div>
              <button className="text-[13px] text-blue-600 font-medium hover:underline ml-4 shrink-0">View</button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-[14px] font-medium text-slate-800 mb-1">Recommendations</h2>
            <p className="text-[13px] text-slate-600">Apply these recommendations to <a href="#" className="text-blue-600 hover:underline">optimize campaign performance</a></p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium select-none">
            <ChevronLeft className="w-4 h-4 text-slate-300 cursor-not-allowed" />
            <span>1 / 4</span>
            <ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-700" />
          </div>
        </div>

        {isSearch ? (
          <div className="flex items-start gap-4 py-1">
            <LightbulbIcon />
            <div className="flex-1 text-[13px] text-slate-800 leading-relaxed mt-0.5">
              <span className="font-medium">Set a target CPA:</span> Get more contacts at a steady, defined cost. To calculate tCPA, divide your budget by the number of expected contacts.
              <Info className="w-3.5 h-3.5 inline-block ml-1.5 text-slate-400 mb-0.5" />
              <div className="text-[12px] text-slate-500 mt-1">
                For example, if your budget is $100 and you're aiming for 10 contacts, you'd set a tCPA of $10.{" "}
                <Info className="w-3 h-3 inline-block text-slate-400 mb-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-2 shrink-0">
              <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
              <button className="text-[13px] text-blue-600 font-medium hover:underline">Apply</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-1 px-4 border border-slate-200 bg-white rounded-md">
            <div className="flex items-center gap-3">
              <LightbulbIcon />
              <div className="text-[13px] text-slate-800">
                <span className="font-medium">Improve your Performance Max asset groups:</span> Get more conversions by adding or improving your assets
                <Info className="w-3.5 h-3.5 inline-block ml-1.5 text-slate-400 mb-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-2 shrink-0">
              <span className="text-[13px] text-blue-600 font-medium">+1.2%</span>
              <button className="text-[13px] text-blue-600 font-medium hover:underline">View</button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Details */}
      <div className="flex flex-col gap-6">

        {/* Overview */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Overview</h2>
          <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Campaign name</div>
              <div className="flex-1">
                <input
                  type="text"
                  defaultValue={isSearch ? "Search-5" : "Local store visits and promotions-Performance M"}
                  className="w-[260px] border border-slate-300 rounded px-2 py-1 text-[13px] text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Campaign type</div>
              <div className="flex-1 text-[13px] text-slate-800">{campaignType}</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Goal</div>
              <div className="flex-1 text-[13px] text-slate-800">
                {isSearch
                  ? "Contacts (Call from Ads, Website), Downloads, Page views, Phone call leads"
                  : "Contacts (Call from Ads, Website), Downloads, Page views, Phone call leads"}
              </div>
            </div>
            {!isSearch && (
              <>
                <div className="flex p-4 border-t border-slate-200">
                  <div className="w-[200px] text-[13px] text-blue-700 font-medium">Merchant Center and<br/>Comparison Shopping<br/>Service</div>
                  <div className="flex-1 text-[13px] text-slate-800">5813121778 - Shobha Shringar / CSS: Google Shopping (google.com/shopping)</div>
                </div>
                <div className="flex p-4 border-t border-slate-200">
                  <div className="w-[200px] text-[13px] text-blue-700 font-medium">Feeds</div>
                  <div className="flex-1 text-[13px] text-slate-800">All products from all feeds</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bidding */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Bidding</h2>
          <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Bidding</div>
              <div className="flex-1 text-[13px]">
                <div className="text-slate-800">Maximize conversions</div>
                <div className="flex items-center gap-1 text-[#c5221f] mt-0.5">
                  <RedDot />
                  Enter an amount
                </div>
              </div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Customer acquisition</div>
              <div className="flex-1 text-[13px] text-slate-800">
                {isSearch ? "Bid equally for new and existing customers" : (
                  <>
                    <div className="mb-0.5">Only bid for new customers</div>
                    <div className="flex items-start text-[#c5221f]">
                      <RedDot />
                      <span>This campaign will not run. To fix this, you need to include at least one eligible audience segment or turn off customer acquisition</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {!isSearch && (
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Customer retention</div>
                <div className="flex-1 text-[13px] text-slate-800">Do not adjust bidding to re-engage lapsed customers</div>
              </div>
            )}
          </div>
        </div>

        {/* Campaign settings */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Campaign settings</h2>
          <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
            {isSearch && (
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Networks</div>
                <div className="flex-1 text-[13px] text-slate-800">Search partners, Display Network</div>
              </div>
            )}
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Locations</div>
              <div className="flex-1 text-[13px] text-slate-800">India</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Languages</div>
              <div className="flex-1 text-[13px] text-slate-800">English</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Audiences</div>
              <div className="flex-1 text-[13px] text-slate-800">No segments</div>
            </div>
            {!isSearch && (
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">EU political ads</div>
                <div className="flex-1 text-[13px] text-slate-800">Doesn't have EU political ads</div>
              </div>
            )}
          </div>
        </div>

        {/* AI Max (Search only) */}
        {isSearch && (
          <div>
            <h2 className="text-[14px] font-medium text-slate-800 mb-3">AI Max</h2>
            <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Asset optimization</div>
                <div className="flex-1 text-[13px] text-slate-800">Text customization and Final URL expansion turned on</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Branded searches</div>
                <div className="flex-1 text-[13px] text-slate-800">Showing ads on all relevant searches</div>
              </div>
            </div>
          </div>
        )}

        {/* Keywords and ads (Search) OR Asset group (non-Search) */}
        {isSearch ? (
          <div>
            <h2 className="text-[14px] font-medium text-slate-800 mb-3">Keywords and ads</h2>
            <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Keywords</div>
                <div className="flex-1 text-[13px] text-slate-800">None</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Search term matching</div>
                <div className="flex-1 text-[13px] text-slate-800">
                  Expanding your keywords with <a href="#" className="text-blue-600 hover:underline">Google AI</a>
                </div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Brand inclusions</div>
                <div className="flex-1 text-[13px] text-blue-600 hover:underline cursor-pointer">Add brand lists</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Locations of interest</div>
                <div className="flex-1 text-[13px] text-slate-800">None</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">URL inclusions</div>
                <div className="flex-1 text-[13px] text-slate-800">No URL inclusions</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-[14px] font-medium text-slate-800 mb-3">Asset group</h2>
            <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Asset group name</div>
                <div className="flex-1 text-[13px] text-slate-800">Asset Group 1</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Listing groups</div>
                <div className="flex-1 text-[13px] text-slate-800">All products</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Final URL</div>
                <div className="flex-1 text-[13px] text-slate-800">
                  https://goo.gl/untrusted
                </div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Assets</div>
                <div className="flex-1 text-[13px] text-slate-800">No assets</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Asset optimization</div>
                <div className="flex-1 text-[13px] text-slate-800">Text customization, final URL expansion, and 2 more are turned on</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Search themes</div>
                <div className="flex-1 text-[13px] text-slate-800">No signals provided</div>
              </div>
              <div className="flex p-4">
                <div className="w-[200px] text-[13px] text-blue-700 font-medium">Audience</div>
                <div className="flex-1 text-[13px] text-slate-800">No signal provided</div>
              </div>
            </div>
          </div>
        )}

        {/* Budget */}
        <div>
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Budget</h2>
          <div className="border border-slate-200 rounded-md bg-white">
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Budget</div>
              <div className="flex-1 text-[13px] text-slate-800">{isSearch ? "₹0.00/day" : "₹974.67/day"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
