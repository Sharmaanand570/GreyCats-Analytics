import { useState } from "react";
import { ChevronUp, ChevronDown, Info, Search, X, Settings } from "lucide-react";

interface SettingsStepProps {
  onNext: () => void;
}

export default function GoogleAdsDisplaySettingsStep({ onNext }: SettingsStepProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("locations");
  const [locationSelection, setLocationSelection] = useState("all");
  const [euPoliticalSelection, setEuPoliticalSelection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) setExpandedSection(null);
    else setExpandedSection(section);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[22px] font-normal text-slate-800 mb-2">Campaign settings</h2>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {/* Locations */}
        <div className="border-b border-slate-200">
          <div 
            onClick={() => toggleSection("locations")}
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col">
              <h3 className={`text-[15px] font-medium ${expandedSection === "locations" ? "text-blue-600" : "text-slate-800"}`}>Locations</h3>
            </div>
            {expandedSection === "locations" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          
          {expandedSection === "locations" && (
            <div className="px-6 pb-6 pt-2">
              <div className="flex items-center gap-1 text-[13px] text-slate-800 mb-3">
                Select locations for this campaign <Info className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="flex flex-col gap-3 ml-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="location" 
                    checked={locationSelection === "all"}
                    onChange={() => setLocationSelection("all")}
                    className="w-4 h-4 text-blue-600 border-slate-300" 
                  />
                  <span className="text-[13px] text-slate-800">All countries and territories</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="location" 
                    checked={locationSelection === "india"}
                    onChange={() => setLocationSelection("india")}
                    className="w-4 h-4 text-blue-600 border-slate-300" 
                  />
                  <span className="text-[13px] text-slate-800">India</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="location" 
                    checked={locationSelection === "other"}
                    onChange={() => setLocationSelection("other")}
                    className="w-4 h-4 text-blue-600 border-slate-300" 
                  />
                  <span className="text-[13px] text-slate-800">Enter another location</span>
                </label>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[13px] text-blue-600 font-medium cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                Location options
              </div>
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="border-b border-slate-200">
          <div 
            onClick={() => toggleSection("languages")}
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col">
              <h3 className={`text-[15px] font-medium ${expandedSection === "languages" ? "text-blue-600" : "text-slate-800"}`}>Languages</h3>
            </div>
            {expandedSection === "languages" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          
          {expandedSection === "languages" && (
            <div className="px-6 pb-6 pt-2">
              <div className="flex items-center gap-1 text-[13px] text-slate-800 mb-3">
                Select the languages your customers speak. <Info className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="relative max-w-[400px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Start typing or select a language"
                  className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="border border-slate-300 rounded-full px-3 py-1 flex items-center gap-2 text-[13px] text-slate-800 bg-white">
                  English <X className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-800" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EU political ads */}
        <div className="">
          <div 
            onClick={() => toggleSection("eu")}
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col">
              <h3 className={`text-[15px] font-medium ${expandedSection === "eu" ? "text-blue-600" : "text-slate-800"}`}>EU political ads</h3>
            </div>
            {expandedSection === "eu" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          
          {expandedSection === "eu" && (
            <div className="px-6 pb-6 pt-2 flex gap-8">
              <div className="flex-1">
                <div className="text-[13px] text-slate-800 mb-1">
                  Does your campaign have European Union political ads?
                </div>
                <div className="text-[11px] text-slate-500 mb-4">Required</div>
                <div className="flex flex-col gap-4 ml-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="eu" 
                      checked={euPoliticalSelection === "yes"}
                      onChange={() => setEuPoliticalSelection("yes")}
                      className="w-4 h-4 text-blue-600 border-slate-300" 
                    />
                    <span className="text-[13px] text-slate-800">Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="eu" 
                      checked={euPoliticalSelection === "no"}
                      onChange={() => setEuPoliticalSelection("no")}
                      className="w-4 h-4 text-blue-600 border-slate-300" 
                    />
                    <span className="text-[13px] text-slate-800">No, this campaign doesn't have EU political ads</span>
                  </label>
                </div>
              </div>
              <div className="w-[250px] border-l border-slate-200 pl-6 text-[12px] text-slate-600">
                EU regulation requires Google to ask this question.<br/>
                <a href="#" className="text-blue-600 hover:underline">Learn how an EU political ad is defined</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-blue-600 font-medium cursor-pointer mt-2 px-2 hover:underline w-max">
        <Settings className="w-4 h-4" />
        More settings
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
