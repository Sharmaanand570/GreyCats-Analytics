import { 
  Info, Filter, Search, Columns, BarChart2, Download, Maximize2, 
  MoreVertical, Edit2, AlertTriangle, PenTool 
} from "lucide-react";
import { mockCampaigns } from "../googleAdsMockData";
import { SiGoogleads } from "react-icons/si";

export default function GoogleAdsCampaignsTable() {
  return (
    <div className="flex flex-col gap-4">
      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex justify-between items-center text-sm shadow-sm">
        <div className="flex items-center gap-2 text-blue-800">
          <Info className="w-5 h-5 text-blue-600" />
          You are viewing data between 2026-06-01 and 2026-06-03
        </div>
        <div className="flex items-center gap-4">
          <button className="text-blue-600 hover:underline font-medium">Change date range</button>
          <button className="text-slate-500 hover:text-slate-700 font-medium">Dismiss</button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 shadow-sm flex flex-col mt-2">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm">
              <span className="text-xl leading-none">+</span>
            </button>
            <div className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Add filter</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-slate-500 text-xs">
            <button className="hover:text-slate-900 transition-colors flex flex-col items-center gap-1"><Search className="w-4 h-4"/>Search</button>
            <button className="hover:text-slate-900 transition-colors flex flex-col items-center gap-1"><PenTool className="w-4 h-4"/>Segment</button>
            <button className="hover:text-slate-900 transition-colors flex flex-col items-center gap-1"><Columns className="w-4 h-4"/>Columns</button>
            <button className="hover:text-slate-900 transition-colors flex flex-col items-center gap-1"><BarChart2 className="w-4 h-4"/>Reports</button>
            <button className="hover:text-slate-900 transition-colors flex flex-col items-center gap-1"><Download className="w-4 h-4"/>Download</button>
            <button className="hover:text-slate-900 transition-colors flex flex-col items-center gap-1"><Maximize2 className="w-4 h-4"/>Expand</button>
            <button className="hover:text-slate-900 transition-colors flex flex-col items-center gap-1"><MoreVertical className="w-4 h-4"/>More</button>
          </div>
        </div>

        {/* Table Wrapper (Horizontal Scroll) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 text-xs border-b border-slate-200 font-medium">
              <tr>
                <th className="px-4 py-3 w-10 text-center border-r border-slate-200"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-slate-300" /></th>
                <th className="px-4 py-3 w-10 border-r border-slate-200"></th>
                <th className="px-4 py-3 min-w-[250px] border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Campaign</th>
                <th className="px-4 py-3 border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Budget</th>
                <th className="px-4 py-3 border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Status</th>
                <th className="px-4 py-3 text-center border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Optimization<br />score</th>
                <th className="px-4 py-3 border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Campaign<br />type</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Impr.</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Interac...</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Interaction<br />rate</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Avg. cost</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Cost</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">All conv.</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">CTR</th>
                <th className="px-4 py-3 border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Bid strategy<br />type</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Conv. rate</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Conv. value</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 font-medium hover:bg-slate-50 cursor-pointer">Conversions</th>
                <th className="px-4 py-3 text-right font-medium hover:bg-slate-50 cursor-pointer">Cost /<br />conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {mockCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-center border-r border-slate-200">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200 text-center">
                    <div className={`w-2.5 h-2.5 rounded-full inline-block ${camp.status === "eligible" ? "bg-green-600" : "bg-slate-300"}`}></div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-500">
                        {camp.campaignType === "Search" ? <Search className="w-3.5 h-3.5" /> : <SiGoogleads className="w-3.5 h-3.5" />}
                      </span>
                      <a href="#" className="text-blue-600 hover:underline font-medium">{camp.name}</a>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200 text-slate-700">
                    {camp.budget} <Edit2 className="w-3.5 h-3.5 text-slate-400 align-middle ml-1 cursor-pointer hover:text-blue-600 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200 whitespace-pre-wrap leading-tight text-slate-700">
                    <div>{camp.statusText}</div>
                    {camp.statusWarning && (
                      <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[11px] mt-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        {camp.statusWarning}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 text-slate-500">{camp.optimizationScore}</td>
                  <td className="px-4 py-3 border-r border-slate-200 text-slate-700">{camp.campaignType}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.impr}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 leading-tight text-slate-700">
                    {camp.interac.replace(" clicks, engagements", "")}
                    {camp.interac !== "0" && <><br /><span className="text-[11px] text-slate-500">clicks,<br />engagements</span></>}
                  </td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.interactionRate}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.avgCost}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.cost}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.allConv}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.ctr}</td>
                  <td className="px-4 py-3 border-r border-slate-200 text-slate-700">{camp.bidStrategy}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.convRate}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.convValue}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">{camp.conversions}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{camp.costConv}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-medium text-slate-800 border-t-2 border-slate-300">
              <tr>
                <td colSpan={7} className="px-4 py-3 text-right border-r border-slate-200">Total: All but removed campaigns in your cur...</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">48,871</td>
                <td className="px-4 py-3 text-right border-r border-slate-200 leading-tight font-normal text-slate-500">5,982<br/>clicks,<br/>engagements</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">12.24%</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">₹0.26</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">₹1,580.80</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">10,821.31</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">12.24%</td>
                <td className="px-4 py-3 border-r border-slate-200"></td>
                <td className="px-4 py-3 text-right border-r border-slate-200">174.51%</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">15,658,423.77</td>
                <td className="px-4 py-3 text-right border-r border-slate-200">10,438.97</td>
                <td className="px-4 py-3 text-right">₹0.15</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
