import { useState } from "react";
import { ChevronUp, ChevronDown, Info, CheckCircle2 } from "lucide-react";

interface Props { onNext: () => void; }

export default function GoogleAdsAppBiddingStep({ onNext }: Props) {
  const [expanded, setExpanded] = useState({
    bidding: true,
    budget: true,
  });
  const toggle = (k: keyof typeof expanded) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  const [targetCpiChecked, setTargetCpiChecked] = useState(true);

  return (
    <div className="flex flex-col max-w-[760px] w-full pb-10">
      <h2 className="text-[22px] font-normal text-slate-800 mb-1">Bidding and budget</h2>
      <p className="text-[13px] text-slate-600 mb-6">Select the bidding and budget options that work best for your goals</p>

      {/* Bidding */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
        <div onClick={() => toggle("bidding")} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
          <h3 className="text-[14px] font-medium text-slate-800">Bidding</h3>
          {expanded.bidding ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.bidding && (
          <div className="px-6 pb-6 border-t border-slate-200 flex gap-8">
            <div className="flex-1 flex flex-col gap-5 mt-4">
              
              <div>
                <label className="text-[12px] text-slate-800 flex items-center gap-1 mb-1.5">
                  What do you want to focus on? <Info className="w-3 h-3 text-slate-500" />
                </label>
                <div className="relative w-max">
                  <select className="appearance-none border border-slate-300 rounded px-3 py-2 pr-8 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Install volume</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[12px] text-slate-800 flex items-center gap-1 mb-1.5">
                  How do you want to track install volume? <Info className="w-3 h-3 text-slate-500" />
                </label>
                <div className="relative w-full max-w-[400px]">
                  <select className="w-full appearance-none border border-slate-300 rounded px-3 py-2 pr-8 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white h-auto leading-tight">
                    <option>
                      Yorder (Android) Installs 2024-05-10T12:08:22.063
                      &#10;Google Play
                    </option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[12px] text-slate-800 flex items-center gap-1 mb-1.5">
                  What kind of users do you want to target? <Info className="w-3 h-3 text-slate-500" />
                </label>
                <div className="relative w-[150px]">
                  <select className="w-full appearance-none border border-slate-300 rounded px-3 py-2 pr-8 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>All users</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer -mt-1">
                <input 
                  type="checkbox" 
                  checked={targetCpiChecked} 
                  onChange={e => setTargetCpiChecked(e.target.checked)} 
                  className="w-4 h-4 rounded text-blue-600" 
                />
                <span className="text-[13px] text-slate-800">Set a target cost per install (optional)</span>
              </label>

              {targetCpiChecked && (
                <div className="flex flex-col gap-1 -mt-2">
                  <label className="text-[12px] text-slate-600">Target cost per install</label>
                  <div className="relative w-[150px]">
                    <div className="absolute left-3 top-2.5 text-[13px] text-slate-500">₹</div>
                    <input 
                      type="text" 
                      className="w-full border border-red-500 rounded px-3 py-2.5 pl-7 text-[13px] text-slate-800 outline-none focus:ring-1 focus:ring-red-500" 
                    />
                  </div>
                  <span className="text-[11px] text-red-500 mt-1">Enter an amount</span>

                  <div className="flex items-center justify-between bg-[#f8fbff] p-3 rounded border border-blue-100 mt-3 max-w-[400px]">
                    <div className="flex gap-2 items-start">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-[12px] text-slate-700">A typical cost per install for other apps is ₹17.72</span>
                    </div>
                    <button className="text-[12px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">APPLY</button>
                  </div>
                </div>
              )}

              <div className="bg-[#e6f4ea] rounded p-4 flex gap-3 items-start mt-2 border border-[#ceead6]">
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <div className="text-[12px] text-slate-700 leading-relaxed">
                  This campaign will use the <strong>Target CPA</strong> bid strategy to help you get the most conversions at or below your budget. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                </div>
              </div>

            </div>

            {/* Right info panel */}
            <div className="w-[280px] shrink-0 border-l border-slate-200 pl-6 mt-4">
              <div className="text-[12px] font-medium text-slate-800 mb-4">Focus new installs on</div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-16 overflow-hidden mb-2">
                  <div className="absolute w-32 h-32 rounded-full border-[12px] border-slate-200 border-b-transparent border-l-transparent -rotate-45"></div>
                  {/* Active gauge part */}
                  <div className="absolute w-32 h-32 rounded-full border-[12px] border-blue-600 border-t-transparent border-l-transparent border-r-transparent -rotate-45"></div>
                  {/* Needle */}
                  <div className="absolute bottom-0 left-1/2 w-1.5 h-14 bg-slate-700 origin-bottom rounded-t-full rotate-[60deg] -ml-[3px]"></div>
                  <div className="absolute bottom-[-4px] left-1/2 w-3 h-3 bg-slate-700 rounded-full -ml-[6px]"></div>
                </div>
                <div className="flex justify-between w-full text-[11px] text-slate-500 px-2">
                  <span className="w-10 text-center leading-tight">In-app activity</span>
                  <span className="w-10 text-center leading-tight font-medium text-slate-800">Install volume</span>
                </div>
              </div>

              <div className="text-[12px] text-slate-600 leading-relaxed mb-4">
                This focus will optimize your bid to achieve the highest volume of new installs for your app. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
              </div>

              <div className="text-[12px] text-slate-600 leading-relaxed">
                The target cost per install is the average amount you'd like to spend each time someone installs your app or opens it for the first time. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
        <div onClick={() => toggle("budget")} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
          <h3 className="text-[14px] font-medium text-slate-800">Budget</h3>
          {expanded.budget ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
        {expanded.budget && (
          <div className="px-6 pb-6 border-t border-slate-200 flex gap-8">
            <div className="flex-1 mt-4">
              <label className="text-[13px] text-slate-800 block mb-2">Set your average daily budget for this campaign</label>
              <div className="relative w-[200px]">
                <div className="absolute left-3 top-2.5 text-[13px] text-slate-500">₹</div>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded px-3 py-2.5 pl-7 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div className="w-[280px] shrink-0 border-l border-slate-200 pl-6 mt-4">
              <div className="text-[12px] text-slate-600 leading-relaxed">
                For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-2">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded">Next</button>
      </div>
    </div>
  );
}
