import { useState } from "react";
import { ChevronUp, ChevronDown, Info, Plus } from "lucide-react";

interface SettingsStepProps {
  onNext: () => void;
}

export default function GoogleAdsShoppingSettingsStep({ onNext }: SettingsStepProps) {
  const [expanded, setExpanded] = useState({
    locations: true,
    localProducts: true,
    euPoliticalAds: true,
    dates: true,
    urlOptions: true,
    networks: true,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1000px]">

      {/* Locations */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div 
          onClick={() => toggleSection("locations")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
        >
          <h3 className="text-[14px] font-medium text-slate-800">Locations</h3>
          {expanded.locations ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.locations && (
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="text-[13px] text-slate-800 flex items-center gap-1 mb-3">
              Select locations for this campaign <Info className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="locations" className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">All countries and territories</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="locations" defaultChecked className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">India</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input type="radio" name="locations" className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">Enter another location</span>
              </label>
              <div className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer text-[13px] font-medium">
                <ChevronDown className="w-4 h-4" /> Location options
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local products */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div 
          onClick={() => toggleSection("localProducts")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
        >
          <h3 className="text-[14px] font-medium text-slate-800">Local products</h3>
          {expanded.localProducts ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.localProducts && (
          <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
            <div className="flex-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded-sm text-blue-600" />
                <span className="text-[13px] text-slate-800">Ads for products sold in local stores</span>
              </label>
            </div>
            <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed flex flex-col gap-1">
              With local products, you can use local inventory ads to promote products that are sold in physical stores. Before including local products, make sure you have local product data in the selected Merchant Center account.
              <a href="#" className="text-blue-600 hover:underline mt-1">Learn more about local inventory ads</a>
            </div>
          </div>
        )}
      </div>

      {/* EU political ads */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div 
          onClick={() => toggleSection("euPoliticalAds")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
        >
          <h3 className="text-[14px] font-medium text-slate-800">EU political ads</h3>
          {expanded.euPoliticalAds ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.euPoliticalAds && (
          <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
            <div className="flex-1 flex flex-col gap-3">
              <div className="text-[13px] text-slate-800">Does your campaign have European Union political ads?</div>
              <div className="text-[11px] text-slate-500 -mt-2 mb-1">Required</div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="eu_ads" className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">Yes, this campaign has EU political ads</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="eu_ads" className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">No, this campaign doesn't have EU political ads</span>
              </label>
              <div className="text-[#c5221f] text-[12px] mt-1 flex items-center gap-1">
                Confirm if your campaign has EU political ads
              </div>
            </div>
            <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed flex flex-col gap-1">
              EU regulations require Google to verify the advertiser.
              <a href="#" className="text-blue-600 hover:underline">Learn more about EU political ads</a>
            </div>
          </div>
        )}
      </div>

      {/* Start and end dates */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div 
          onClick={() => toggleSection("dates")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
        >
          <h3 className="text-[14px] font-medium text-slate-800">Start and end dates</h3>
          {expanded.dates ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.dates && (
          <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-[13px] text-slate-800">Start date</div>
                <div className="relative w-[200px]">
                  <select className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none appearance-none bg-white">
                    <option>Jun 22, 2026</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[13px] text-slate-800">End date</div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="end_date" defaultChecked className="w-4 h-4 text-blue-600" />
                  <span className="text-[13px] text-slate-800">None</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer h-full">
                    <input type="radio" name="end_date" className="w-4 h-4 text-blue-600" />
                  </label>
                  <div className="relative w-[180px]">
                    <select disabled className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-[13px] text-slate-400 outline-none appearance-none">
                      <option>Select a date</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed flex items-center">
              Your ads will continue to run unless you specify an end date.
            </div>
          </div>
        )}
      </div>

      {/* Campaign URL options */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div 
          onClick={() => toggleSection("urlOptions")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50"
        >
          <h3 className="text-[14px] font-medium text-slate-800">Campaign URL options</h3>
          {expanded.urlOptions ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.urlOptions && (
          <div className="p-6 border-t border-slate-200 flex gap-8 bg-white">
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-1 w-full max-w-[400px]">
                <div className="relative">
                  <label className="absolute -top-2 left-2 bg-white px-1 text-[11px] text-slate-600">Tracking template</label>
                  <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none" />
                </div>
                <span className="text-[11px] text-slate-500">Example: https://www.trackingtemplate.foo/?url={`{lpurl}`}&id=5</span>
              </div>

              <div className="flex flex-col gap-1 w-full max-w-[400px]">
                <div className="relative">
                  <label className="absolute -top-2 left-2 bg-white px-1 text-[11px] text-slate-600">Final URL suffix</label>
                  <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none" />
                </div>
                <span className="text-[11px] text-slate-500">Example: param1=value1&param2=value2</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-[12px] text-slate-800 font-medium">Custom parameter <Info className="inline-block w-3 h-3 text-slate-500" /></div>
                <div className="flex items-center gap-2">
                  <div className="relative w-[150px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[13px] text-slate-500">{`{_`}</div>
                    <input type="text" placeholder="Name" className="w-full border border-slate-300 rounded px-3 py-2 pl-7 pr-3 text-[13px] outline-none" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[13px] text-slate-500">{`}`}</div>
                  </div>
                  <span className="text-slate-600">=</span>
                  <input type="text" placeholder="Value" className="w-[200px] border border-slate-300 rounded px-3 py-2 text-[13px] outline-none" />
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600 leading-relaxed flex flex-col gap-1">
              Tracking templates share data you want the ad click to go for tracking. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
            </div>
          </div>
        )}
      </div>

      {/* Networks */}
      <div className="bg-white border-2 border-blue-600 rounded-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
        <div 
          onClick={() => toggleSection("networks")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer bg-white"
        >
          <h3 className="text-[14px] font-medium text-slate-800">Networks</h3>
          {expanded.networks ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.networks && (
          <div className="p-6 border-t border-slate-200 flex gap-6 bg-white items-start">
            {/* Graphic mock */}
            <div className="bg-slate-50 border border-slate-200 rounded p-2 flex flex-col gap-1 w-[80px]">
               <div className="h-1 bg-slate-200 w-full"></div>
               <div className="h-1 bg-slate-300 w-2/3"></div>
               <div className="flex gap-1 mt-1">
                 <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm"></div>
                 <div className="flex-1 flex flex-col gap-0.5">
                   <div className="h-0.5 bg-slate-200 w-full"></div>
                   <div className="h-0.5 bg-slate-200 w-1/2"></div>
                 </div>
               </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-[13px] font-medium text-slate-800">Search Network</div>
              <div className="text-[12px] text-slate-600">Ads can appear near Google Search results and other Google sites when people search for terms that are relevant to your keywords.</div>
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded-sm text-blue-600" />
                <span className="text-[13px] text-slate-800">Include Google search partners <Info className="inline-block w-3.5 h-3.5 text-slate-500 ml-1" /></span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded">
          Next
        </button>
      </div>

    </div>
  );
}
