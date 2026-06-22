

interface SummaryStepProps {
  onNext: () => void;
}

export default function GoogleAdsShoppingSummaryStep(props: SummaryStepProps) {
  return (
    <div className="flex flex-col gap-6 max-w-[800px] w-full pb-10">
      <h2 className="text-[22px] font-normal text-slate-800">Your campaign is almost ready to publish</h2>
      
      {/* Overview */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Overview</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Campaign name</div>
            <div className="flex-1">
              <input type="text" value="Shopping-1" readOnly className="border border-slate-300 rounded px-3 py-2 w-full max-w-[300px] outline-none" />
            </div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Campaign type</div>
            <div className="flex-1 text-slate-800">Shopping</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Goal</div>
            <div className="flex-1 text-slate-800">Contacts (Call from Ads, Website), Downloads, Page views, Phone call leads</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Merchant Center and Comparison Shopping Service</div>
            <div className="flex-1 text-slate-800">5813121778 - Shobha Shringar / CSS: Google Shopping (google.com/shopping)</div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600 shrink-0">Feeds</div>
            <div className="flex-1 text-slate-800">All products from all feeds</div>
          </div>
        </div>
      </div>

      {/* Budget and bidding optimization */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Budget and bidding optimization</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Budget</div>
            <div className="flex-1 flex flex-col gap-1 text-slate-800">
              <span>₹0.00/day</span>
              <div className="flex items-center gap-1 text-[#c5221f] text-[12px]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[10px]">!</div>
                Enter a budget
              </div>
            </div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Bidding</div>
            <div className="flex-1 text-slate-800">Manual CPC</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Customer acquisition</div>
            <div className="flex-1 text-slate-800">Bid equally for new and existing customers</div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600 shrink-0">Campaign priority</div>
            <div className="flex-1 text-slate-800">Low (default)</div>
          </div>
        </div>
      </div>

      {/* Campaign settings */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Campaign settings</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Locations</div>
            <div className="flex-1 text-slate-800">India</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Local products</div>
            <div className="flex-1 text-slate-800">Turned off</div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600 shrink-0">EU political ads</div>
            <div className="flex-1 flex flex-col gap-1 text-slate-800">
              <span>Not specified</span>
              <div className="flex items-center gap-1 text-[#c5221f] text-[12px]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[10px]">!</div>
                Confirm if your campaign has EU political ads
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad group */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Ad group</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Ad group name</div>
            <div className="flex-1 text-slate-800">Ad group 1</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Ad group bid</div>
            <div className="flex-1 flex flex-col gap-1 text-slate-800">
              <span>₹0.00</span>
              <div className="flex items-center gap-1 text-[#c5221f] text-[12px]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[10px]">!</div>
                Enter an amount
              </div>
            </div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600 shrink-0">Product groups</div>
            <div className="flex-1 text-slate-800">All products</div>
          </div>
        </div>
      </div>

    </div>
  );
}
