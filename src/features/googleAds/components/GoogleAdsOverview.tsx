import { useState } from "react";
import { 
  Plus, ChevronDown, BarChart2, SlidersHorizontal, MoreVertical, 
  Activity, Check, TriangleAlert, Download, MessageSquare, Folder
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface OverviewProps {
  onCreateCampaign?: () => void;
}

export default function GoogleAdsOverview({ onCreateCampaign }: OverviewProps = {}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chartData = [
    { name: "Jun 1, 2026", clicks: 1900, impressions: 8000 },
    { name: "Jun 2, 2026", clicks: 3900, impressions: 35000 },
    { name: "Jun 3, 2026", clicks: 160, impressions: 500 },
  ];

  return (
    <div className="flex flex-col">
      {/* Overview Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New campaign
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col py-1">
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (onCreateCampaign) onCreateCampaign();
                }}
                className="flex items-center gap-4 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
              >
                <Plus className="w-5 h-5 text-slate-500" />
                New campaign
              </button>
              <button className="flex items-center gap-4 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left border-t border-slate-100">
                <Folder className="w-5 h-5 text-slate-500" />
                Resume campaign draft
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6 text-slate-500 text-xs">
          <button className="flex flex-col items-center hover:text-slate-900 gap-1"><Download className="w-5 h-5"/>Download</button>
          <button className="flex flex-col items-center hover:text-slate-900 gap-1"><MessageSquare className="w-5 h-5"/>Feedback</button>
        </div>
      </div>

      <div className="flex flex-col">
        {/* KPI Cards Container */}
        <div className="flex bg-white border border-slate-200 border-b-0 overflow-hidden shadow-sm">
          
          <div className="flex-1 p-5 border-r border-slate-200 bg-blue-600 text-white cursor-pointer group">
            <div className="flex items-center gap-1 text-xs mb-3 font-medium">
              <ChevronDown className="w-4 h-4"/>
              Clicks
            </div>
            <div className="text-4xl">5.94K</div>
          </div>
          
          <div className="flex-1 p-5 border-r border-slate-200 bg-red-600 text-white cursor-pointer group">
            <div className="flex items-center gap-1 text-xs mb-3 font-medium">
              <ChevronDown className="w-4 h-4"/>
              Impressions
            </div>
            <div className="text-4xl">48.9K</div>
          </div>
          
          <div className="flex-1 p-5 border-r border-slate-200 hover:bg-slate-50 cursor-pointer group">
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-3 font-medium">
              <ChevronDown className="w-4 h-4"/>
              CTR
            </div>
            <div className="text-4xl text-slate-800">12.16%</div>
          </div>
          
          <div className="flex-1 p-5 border-r border-slate-200 hover:bg-slate-50 cursor-pointer group">
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-3 font-medium">
              <ChevronDown className="w-4 h-4"/>
              Avg. Target CPA
            </div>
            <div className="text-4xl text-slate-800">₹150</div>
          </div>

          {/* Metrics & Adjust right panel */}
          <div className="flex items-center justify-center gap-6 px-6 text-slate-500 text-xs">
            <button className="flex flex-col items-center gap-1 hover:text-slate-900"><BarChart2 className="w-5 h-5"/>Metrics</button>
            <button className="flex flex-col items-center gap-1 hover:text-slate-900"><SlidersHorizontal className="w-5 h-5"/>Adjust</button>
            <button className="hover:text-slate-900 ml-2"><MoreVertical className="w-5 h-5"/></button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-white border border-slate-200 p-6 h-[320px] shadow-sm mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={true} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                dy={10}
                padding={{ left: 0, right: 0 }}
                tickMargin={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                ticks={[0, 2000, 4000]}
                tickFormatter={(value: number) => value === 0 ? "0" : `${value / 1000}K`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                ticks={[0, 20000, 40000]}
                tickFormatter={(value: number) => value === 0 ? "0" : `${value / 1000}K`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '13px' }}
                labelStyle={{ color: '#0f172a', fontWeight: 500, marginBottom: '4px' }}
              />
              <Line 
                yAxisId="left"
                type="linear" 
                dataKey="clicks" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="linear" 
                dataKey="impressions" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Diagnostic Box */}
      <div className="bg-white border border-slate-200 shadow-sm mt-2">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Account diagnostics
          </div>
          <button className="hover:bg-slate-100 p-1 rounded-full"><MoreVertical className="w-5 h-5"/></button>
        </div>

        <div className="p-6">
          <h3 className="text-xl text-slate-800 font-normal mb-1">
            Account has issues and campaigns that needs attention
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Review account issues and campaigns that need attention
          </p>

          <div className="flex items-center gap-3 mb-8">
            <button className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" />
              Top account issues
            </button>
            <button className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
              Campaigns need attention
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 text-sm text-slate-800 font-medium">
              <TriangleAlert className="w-5 h-5 text-orange-500 fill-orange-100" />
              Account balance is exhausted
            </div>
            <div className="flex items-center gap-4">
              <button className="text-blue-600 text-sm hover:underline font-medium">View details</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
                Add funds
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
