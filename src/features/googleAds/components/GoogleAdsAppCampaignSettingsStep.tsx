import { useState } from "react";
import { ChevronUp, ChevronDown, Info, X, Search } from "lucide-react";

interface Props { onNext: () => void; }

export default function GoogleAdsAppCampaignSettingsStep({ onNext }: Props) {
  const [expanded, setExpanded] = useState({
    mobileApp: true,
    locations: true,
    languages: true,
    viewThrough: true,
    euPolitical: true,
  });
  const toggle = (k: keyof typeof expanded) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  const [location, setLocation] = useState<"all" | "india" | "other">("all");
  const [euAds, setEuAds] = useState<"yes" | "no" | "none">("no");
  const [viewThrough, setViewThrough] = useState(true);

  return (
    <div className="flex flex-col gap-0 max-w-[760px] w-full pb-10">
      <h2 className="text-[22px] font-normal text-slate-800 mb-1">Campaign settings</h2>
      <p className="text-[13px] text-slate-600 mb-6">To reach the right people, start by defining key settings for your campaign.</p>

      {/* Mobile app */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
        <div onClick={() => toggle("mobileApp")} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
          <h3 className="text-[14px] font-medium text-slate-800">Mobile app</h3>
          {expanded.mobileApp ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.mobileApp && (
          <div className="px-6 pb-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mt-4 border border-slate-200 rounded p-3 w-max">
              <div className="w-9 h-9 bg-slate-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-[11px]">Y</span>
              </div>
              <div>
                <div className="text-[13px] font-medium text-slate-800">Yorder</div>
                <div className="text-[12px] text-blue-600 hover:underline cursor-pointer">com.yorder.app</div>
                <div className="text-[11px] text-slate-500">Yorder Web Services</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Locations */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
        <div onClick={() => toggle("locations")} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
          <h3 className="text-[14px] font-medium text-slate-800">Locations</h3>
          {expanded.locations ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.locations && (
          <div className="px-6 pb-6 border-t border-slate-200">
            <div className="text-[13px] text-slate-800 flex items-center gap-1 mt-4 mb-3">
              Select locations for this campaign <Info className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="app_loc" checked={location === "all"} onChange={() => setLocation("all")} className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">All countries and territories</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="app_loc" checked={location === "india"} onChange={() => setLocation("india")} className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">India</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="app_loc" checked={location === "other"} onChange={() => setLocation("other")} className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">Enter another location</span>
              </label>
            </div>
            <div className="bg-[#e8f0fe] rounded p-4 flex gap-3 items-start mb-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-slate-700 leading-relaxed">
                While we will attempt to only show ads in countries where your app is available to download, we highly recommend you to additionally restrict your country targeting to regions where the app is accessible.
              </p>
            </div>
            <a href="#" className="text-[13px] text-blue-600 hover:underline flex items-center gap-1">
              <ChevronDown className="w-3.5 h-3.5" /> Location options
            </a>
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
        <div onClick={() => toggle("languages")} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
          <h3 className="text-[14px] font-medium text-slate-800">Languages</h3>
          {expanded.languages ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.languages && (
          <div className="px-6 pb-6 border-t border-slate-200">
            <div className="text-[13px] text-slate-800 flex items-center gap-1 mt-4 mb-3">
              Select the languages your customers speak <Info className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="relative w-full max-w-[400px] mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Start typing or select a language" className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1 text-[12px] text-slate-700">
                English <button className="ml-1 text-slate-500 hover:text-slate-700"><X className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View-through conversion optimization */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
        <div onClick={() => toggle("viewThrough")} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
          <h3 className="text-[14px] font-medium text-slate-800">View-through conversion optimization</h3>
          {expanded.viewThrough ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.viewThrough && (
          <div className="px-6 pb-6 border-t border-slate-200">
            <div className="mt-4 text-[12px] text-slate-600 mb-3 leading-relaxed">
              Google Ads will include view-through conversion data in addition to click-through and engagement conversions when bidding.
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={viewThrough} onChange={e => setViewThrough(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              <span className="text-[13px] text-slate-800">Turn on view-through conversions</span>
            </label>
          </div>
        )}
      </div>

      {/* EU political ads */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
        <div onClick={() => toggle("euPolitical")} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
          <h3 className="text-[14px] font-medium text-slate-800">EU political ads</h3>
          {expanded.euPolitical ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.euPolitical && (
          <div className="px-6 pb-6 border-t border-slate-200 flex gap-8">
            <div className="flex-1 flex flex-col gap-3 mt-4">
              <div className="text-[13px] text-slate-800">Does your campaign have European Union political ads?</div>
              <div className="text-[11px] text-slate-500 -mt-1">Required</div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="app_eu" checked={euAds === "yes"} onChange={() => setEuAds("yes")} className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">Yes, this campaign has EU political ads</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="app_eu" checked={euAds === "no"} onChange={() => setEuAds("no")} className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] text-slate-800">No, this campaign doesn't have EU political ads</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded-sm" />
                <span className="text-[13px] text-slate-800">I don't plan to use this account to run EU political ads. This option will still be applicable to any existing campaigns. You can change this for any campaign at any time.</span>
              </label>
            </div>
            <div className="w-[260px] shrink-0 border-l border-slate-200 pl-6 mt-4 text-[12px] text-slate-600 leading-relaxed">
              EU regulations require Google to verify the advertiser.
              <div className="mt-2"><a href="#" className="text-blue-600 hover:underline">Learn more about EU political ads</a></div>
            </div>
          </div>
        )}
      </div>

      <a href="#" className="text-[13px] text-blue-600 hover:underline flex items-center gap-1 mb-6">
        <ChevronDown className="w-3.5 h-3.5" /> More settings
      </a>

      <div className="flex justify-end">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded">Next</button>
      </div>
    </div>
  );
}
