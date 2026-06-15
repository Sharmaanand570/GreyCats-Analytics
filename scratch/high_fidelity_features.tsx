import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { 
  BarChart3, 
  Settings,
  CheckCircle2,
  ShieldCheck, 
  ArrowRight,
  Database,
  PieChart,
  Lock,
  Send,
  MousePointerClick,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Presentation,
  Filter,
  LayoutGrid,
  Download,
  AlertCircle,
  ChevronDown,
  Plus,
  ArrowUp,
  ArrowDown,
  Search,
  Image,
  Video,
  FileText,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Instagram,
  MessageSquare,
  Smartphone,
  Mail,
  MessageCircle,
  Calendar,
  Clock
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import logoBlack from "../../assets/greycats_logo_black.png";
import logoWhite from "../../assets/greycats_logo_white.png";

const FEATURES_DATA = [
  {
    id: "analytics",
    title: "Analytics",
    desc: "Connect over 50+ data sources to instantly populate client dashboards with real-time performance data. No coding required.",
    graphic: () => (
      <div className="w-full h-full bg-[#f8f9fa] flex flex-col items-center justify-center rounded-[2rem] overflow-hidden p-6 relative border border-[#e5e5e5]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <div className="bg-white/90 backdrop-blur-sm border border-[#f0f0f0] rounded-2xl shadow-sm w-full max-w-sm p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-semibold text-[#111]">Traffic vs Conversions</h4>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]"></span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[#f0f0f0] pb-4">
              <div>
                <div className="text-xs text-[#666] mb-1">Total Visitors</div>
                <div className="text-3xl font-medium text-[#111]">24,592</div>
              </div>
              <div className="flex items-center text-emerald-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5%
              </div>
            </div>
            <div className="flex justify-between items-end pt-2">
              <div>
                <div className="text-xs text-[#666] mb-1">Conversion Rate</div>
                <div className="text-3xl font-medium text-[#111]">4.8%</div>
              </div>
              <div className="flex items-center text-emerald-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +1.2%
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "reports",
    title: "Reports",
    desc: "Automate client reporting and generate stunning, brandable dashboards in seconds. Say goodbye to manual spreadsheets.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex rounded-[2rem] overflow-hidden border border-[#e5e5e5] text-xs">
        <div className="w-48 bg-white border-r border-[#e5e5e5] flex flex-col">
          <div className="p-4 border-b border-[#e5e5e5] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="font-semibold text-[#111]">REPORT BUILDER</span>
          </div>
          <div className="p-4 flex-1">
            <div className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-3">Drag Widgets</div>
            <div className="space-y-2">
              {[
                { name: "Bar Chart", icon: BarChart3, color: "text-blue-500" },
                { name: "Pie Chart", icon: PieChart, color: "text-purple-500" },
                { name: "Goal Tracker", icon: Target, color: "text-green-500" },
                { name: "Funnel", icon: Filter, color: "text-orange-500" },
                { name: "Data Table", icon: LayoutGrid, color: "text-teal-500" },
              ].map((w, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-[#e5e5e5] bg-white hover:border-[#111] transition-colors">
                  <w.icon className={`w-3.5 h-3.5 ${w.color}`} />
                  <span className="text-[#333] font-medium">{w.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-[#e5e5e5]">
            <div className="w-full bg-[#111] text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-[#333] transition-colors">
              <Download className="w-3.5 h-3.5" /> Generate PDF
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#f8f9fa] relative p-6 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.5 }}></div>
          <div className="w-full max-w-sm bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e5e5e5] p-5 relative z-10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f0f0f0]">
              <div>
                <h3 className="text-lg font-bold text-[#111] leading-tight">Q3 Performance</h3>
                <div className="text-gray-500 mt-1">October 2026 - Acme Corp</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center font-bold text-xs">AC</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg border border-[#f0f0f0]">
                <div className="text-gray-500 font-medium mb-1 text-[10px]">TOTAL LEADS</div>
                <div className="text-2xl font-bold text-[#111]">842</div>
                <div className="text-green-500 font-medium text-[9px] mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> 12% vs last month</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-[#f0f0f0]">
                <div className="text-gray-500 font-medium mb-1 text-[10px]">AVG CPA</div>
                <div className="text-2xl font-bold text-[#111]">$12.50</div>
                <div className="text-green-500 font-medium text-[9px] mt-1 flex items-center"><TrendingDown className="w-3 h-3 mr-1"/> $1.20 vs last month</div>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <div className="text-gray-500 font-medium mb-2 text-[10px]">Lead Generation Over Time</div>
                <div className="h-16 flex items-end gap-1.5">
                  {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-gray-400 mt-1 font-bold">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-2 text-[10px]">Top Converting Channels</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 relative flex-shrink-0">
                    <div className="absolute inset-[-4px] border-4 border-purple-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}></div>
                  </div>
                  <div className="text-[10px] flex-1">
                    <div className="flex justify-between mb-1.5"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Organic Search</span><span className="font-bold">75%</span></div>
                    <div className="flex justify-between mb-1.5"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>Social Media</span><span className="font-bold">18%</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>Direct/Other</span><span className="font-bold">7%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "seo",
    title: "SEO Tools",
    desc: "Monitor keyword rankings, track visibility index, and resolve critical on-page issues across multiple domains.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex rounded-[2rem] overflow-hidden border border-[#e5e5e5] text-xs">
        <div className="w-48 bg-white border-r border-[#e5e5e5] flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <span className="font-semibold text-[#111]">SEO PROJECTS</span>
              <Settings className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="p-2 space-y-1">
              {[
                { name: "Acme Corp", url: "acme.com", active: true },
                { name: "Global Tech Blog", url: "globaltech.io", active: false },
                { name: "Local Bakery Co", url: "bakery.local", active: false },
              ].map((p, i) => (
                <div key={i} className={`p-2 rounded-lg ${p.active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <div className="font-medium">{p.name}</div>
                  <div className={`text-[10px] ${p.active ? 'text-blue-500' : 'text-gray-400'}`}>{p.url}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-100 m-3 rounded-lg">
            <div className="flex items-center gap-1.5 text-orange-600 font-bold mb-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Critical Issues
            </div>
            <div className="text-[10px] text-orange-500 leading-tight">3 pages missing H1 tags on Acme Corp</div>
          </div>
        </div>
        <div className="flex-1 bg-white p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#111]">Keyword Rankings</h3>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 border border-[#e5e5e5] rounded-md text-gray-600 font-medium bg-[#fafafa] flex items-center gap-1.5">
                US - EN <ChevronDown className="w-3 h-3" />
              </div>
              <div className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-medium flex items-center gap-1.5 shadow-sm">
                <Plus className="w-3 h-3" /> Add Keywords
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-[#e5e5e5] rounded-xl flex items-center justify-between bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <div>
                <div className="text-gray-500 font-medium mb-1 text-[10px]">VISIBILITY INDEX</div>
                <div className="text-3xl font-bold text-[#111]">42.8%</div>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="p-4 border border-[#e5e5e5] rounded-xl flex items-center justify-between bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <div>
                <div className="text-gray-500 font-medium mb-1 text-[10px]">KEYWORDS IN TOP 3</div>
                <div className="text-3xl font-bold text-[#111]">124</div>
              </div>
              <div className="text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md text-sm border border-emerald-100">
                <ArrowUp className="w-3.5 h-3.5" /> 12
              </div>
            </div>
          </div>
          <div className="flex-1 border border-[#e5e5e5] rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="grid grid-cols-12 gap-2 bg-gray-50 p-3 border-b border-[#e5e5e5] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Keyword</div>
              <div className="col-span-3">Intent</div>
              <div className="col-span-2">Position</div>
              <div className="col-span-2">Volume</div>
              <div className="col-span-1">KD</div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col bg-white">
              {[
                { kw: "enterprise software", intent: "Commercial", intentColor: "bg-blue-50 text-blue-700 border-blue-200", pos: "1", change: 0, vol: "12,500", kd: "78" },
                { kw: "best CRM tools 2026", intent: "Informational", intentColor: "bg-purple-50 text-purple-700 border-purple-200", pos: "2", change: 1, vol: "8,200", kd: "65" },
                { kw: "acme pricing", intent: "Transactional", intentColor: "bg-emerald-50 text-emerald-700 border-emerald-200", pos: "1", change: 0, vol: "1,400", kd: "12" },
                { kw: "crm implementation guide", intent: "Informational", intentColor: "bg-purple-50 text-purple-700 border-purple-200", pos: "4", change: -2, vol: "3,600", kd: "45" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 p-3 border-b border-[#f0f0f0] items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-4 font-semibold text-[#111] truncate">{row.kw}</div>
                  <div className="col-span-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${row.intentColor}`}>{row.intent}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 font-medium">
                    {row.pos}
                    {row.change > 0 ? <ArrowUp className="w-3 h-3 text-emerald-500"/> : row.change < 0 ? <ArrowDown className="w-3 h-3 text-red-500"/> : <span className="w-3 h-3 text-gray-300">-</span>}
                  </div>
                  <div className="col-span-2 text-gray-600">{row.vol}</div>
                  <div className="col-span-1 font-medium text-gray-700">{row.kd}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "scheduler",
    title: "Scheduler",
    desc: "Plan, preview, and schedule content across all major social networks from a single, unified calendar.",
    graphic: () => (
      <div className="w-full h-full bg-white flex rounded-[2rem] overflow-hidden border border-[#e5e5e5] text-xs">
        <div className="w-48 bg-[#fafafa] border-r border-[#e5e5e5] flex flex-col">
          <div className="p-4 border-b border-[#e5e5e5] flex justify-between items-center bg-white">
            <span className="font-semibold text-[#111]">MEDIA LIBRARY</span>
            <Search className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="p-3 grid grid-cols-2 gap-3 overflow-y-auto flex-1">
            {[
              { color: "bg-blue-100", label: "Product_Shot_1.jpg", icon: Image },
              { color: "bg-purple-100", label: "Promo_Reel.mp4", icon: Video },
              { color: "bg-green-100", label: "Team_Photo.jpg", icon: Image },
              { color: "bg-yellow-100", label: "Infographic.png", icon: Image },
              { color: "bg-red-100", label: "Event_Banner.jpg", icon: Image },
              { color: "bg-gray-200", label: "Logo_Pack.zip", icon: FileText },
            ].map((media, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 group cursor-grab">
                <div className={`w-full aspect-square ${media.color} rounded-lg flex items-center justify-center border border-transparent group-hover:border-gray-300 transition-colors shadow-sm`}>
                  <media.icon className="w-5 h-5 text-black/30" />
                </div>
                <span className="text-[8px] text-gray-500 truncate w-full text-center font-medium">{media.label}</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[#e5e5e5] bg-white">
            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
              <UploadCloud className="w-4 h-4 mx-auto mb-1.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Upload Assets</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-[#e5e5e5] flex justify-between items-center bg-white shadow-sm z-10 relative">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-[#111]">October 2026</h3>
              <div className="flex gap-1">
                <div className="w-7 h-7 rounded-md border border-[#e5e5e5] flex items-center justify-center hover:bg-gray-50 cursor-pointer text-gray-600"><ChevronLeft className="w-4 h-4" /></div>
                <div className="w-7 h-7 rounded-md border border-[#e5e5e5] flex items-center justify-center hover:bg-gray-50 cursor-pointer text-gray-600"><ChevronRight className="w-4 h-4" /></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 border border-[#e5e5e5] rounded-md font-semibold text-gray-600 bg-[#fafafa]">Month View</div>
              <div className="px-3 py-1.5 bg-[#111] text-white rounded-md font-semibold flex items-center gap-1.5 shadow-sm"><Plus className="w-3.5 h-3.5" /> New Post</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="grid grid-cols-5 border-b border-[#e5e5e5] bg-white">
              {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, i) => (
                <div key={i} className="p-2.5 text-center text-[10px] font-bold text-gray-400 border-r border-[#e5e5e5] last:border-r-0">{day}</div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-5 grid-rows-2 bg-gray-50">
              {[12, 13, 14, 15, 16].map((day, i) => (
                <div key={i} className="border-r border-b border-[#e5e5e5] p-2 bg-white flex flex-col gap-2 min-h-0 hover:bg-gray-50 transition-colors">
                  <div className="text-[10px] font-bold text-gray-400 pl-1">{day}</div>
                  {i === 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-blue-700">
                        <Twitter className="w-3 h-3" /> 09:00 AM
                      </div>
                      <div className="text-[10px] text-gray-800 leading-tight font-medium">Excited to announce our new product line! 🚀</div>
                    </div>
                  )}
                  {i === 3 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-2 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-purple-700">
                        <Instagram className="w-3 h-3" /> 02:30 PM
                      </div>
                      <div className="w-full h-12 bg-purple-200 rounded mb-1.5 bg-cover bg-center border border-purple-300" style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Q4YjRmZSIvPjwvc3ZnPg==)' }}></div>
                      <div className="text-[10px] text-gray-800 leading-tight font-medium truncate">Behind the scenes...</div>
                    </div>
                  )}
                </div>
              ))}
              {[19, 20, 21, 22, 23].map((day, i) => (
                <div key={i} className="border-r border-[#e5e5e5] p-2 bg-white flex flex-col gap-2 min-h-0 hover:bg-gray-50 transition-colors">
                  <div className="text-[10px] font-bold text-gray-400 pl-1">{day}</div>
                  {i === 0 && (
                    <div className="bg-[#111] rounded-md p-2 shadow-sm text-white">
                      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-gray-400">
                        <MessageSquare className="w-3 h-3 text-gray-300" /> 11:00 AM
                      </div>
                      <div className="text-[10px] leading-tight font-medium text-gray-200">Weekly Q&A Thread is now open! Drop your questions 👇</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "broadcast",
    title: "Broadcast",
    desc: "Reach your audience directly with targeted SMS, Email, and WhatsApp campaigns. Personalize messages at scale.",
    graphic: () => (
      <div className="w-full h-full bg-[#fafafa] flex rounded-[2rem] overflow-hidden border border-[#e5e5e5] text-xs">
        <div className="w-48 bg-white border-r border-[#e5e5e5] flex flex-col">
          <div className="p-4 border-b border-[#e5e5e5] flex justify-between items-center">
            <span className="font-semibold text-[#111]">CAMPAIGNS</span>
            <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-100 border border-blue-100">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Active</div>
            {[
              { name: "Black Friday Promo", type: "SMS", date: "Nov 24", icon: Smartphone, color: "text-blue-600", active: true },
              { name: "Welcome Series", type: "Email", date: "Ongoing", icon: Mail, color: "text-purple-600", active: false },
            ].map((c, i) => (
              <div key={i} className={`p-2 rounded-xl flex items-center gap-3 ${c.active ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}>
                <div className={`w-8 h-8 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <c.icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <div className="overflow-hidden">
                  <div className={`font-semibold text-[11px] truncate ${c.active ? 'text-blue-900' : 'text-[#111]'}`}>{c.name}</div>
                  <div className="text-[9px] text-gray-500 font-medium">{c.type} • {c.date}</div>
                </div>
              </div>
            ))}
            
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Drafts</div>
            <div className="p-2 rounded-xl flex items-center gap-3 hover:bg-gray-50 border border-transparent">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-[11px] text-gray-600 truncate">Holiday Updates</div>
                  <div className="text-[9px] text-gray-400 font-medium">WhatsApp</div>
                </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex bg-[#f8f9fa]">
          <div className="w-[220px] border-r border-[#e5e5e5] bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-[180px] aspect-[1/2] bg-[#111] rounded-[32px] p-2 shadow-2xl relative border-[4px] border-gray-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#111] rounded-b-2xl z-10 flex justify-center pt-1">
                <div className="w-8 h-1 rounded-full bg-gray-800"></div>
              </div>
              <div className="w-full h-full bg-white rounded-[24px] overflow-hidden flex flex-col relative">
                <div className="bg-gray-100/90 backdrop-blur-md h-12 flex items-end justify-center pb-1.5 font-bold text-[11px] text-gray-800 border-b border-gray-200 z-10 relative">
                  Acme Corp
                </div>
                <div className="flex-1 p-2.5 bg-gray-50 flex flex-col justify-end space-y-2 relative">
                  <div className="text-center text-[9px] text-gray-400 font-bold mb-2">Today 10:00 AM</div>
                  <div className="bg-[#e5e5e5] text-gray-800 p-2.5 rounded-2xl rounded-bl-sm text-[10px] max-w-[85%] leading-tight self-start font-medium shadow-sm">
                    Reply STOP to unsubscribe
                  </div>
                  <div className="bg-blue-500 text-white p-2.5 rounded-2xl rounded-br-sm text-[10px] max-w-[90%] self-end leading-[1.4] shadow-md font-medium">
                    Hey {"{"}first_name{"}"}! 🚨 Our Black Friday sale is live! Get 40% off all premium plans. Use code BF40 at checkout: https://acme.com/bf
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-[#e5e5e5] pb-5">
              <h3 className="text-2xl font-bold text-[#111]">Message Editor</h3>
              <div className="px-5 py-2 bg-[#111] text-white rounded-lg font-semibold cursor-pointer shadow-sm hover:bg-gray-800 transition-colors">Schedule</div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Audience Segment</label>
                <div className="w-full border border-[#e5e5e5] rounded-xl p-3 flex items-center justify-between bg-[#fafafa] shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
                  <span className="font-semibold text-[13px] text-gray-800">All Active Customers (4,291)</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block flex justify-between">
                  Message Content
                  <span className="text-blue-500 cursor-pointer hover:underline">{"{"} Insert Variable {"}"}</span>
                </label>
                <div className="w-full border border-[#e5e5e5] rounded-xl p-4 bg-white h-32 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 outline-none transition-all text-[13px] leading-relaxed text-[#333] shadow-inner">
                  Hey {"{{"}first_name{"}}"}! 🚨 Our Black Friday sale is live! Get 40% off all premium plans. Use code BF40 at checkout: https://acme.com/bf
                </div>
                <div className="text-right text-[11px] font-medium text-gray-400 mt-2">128/160 characters (1 SMS)</div>
              </div>
              <div className="pt-4 border-t border-[#e5e5e5]">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Delivery Schedule</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-[#e5e5e5] rounded-xl p-3 flex items-center gap-3 bg-[#fafafa] shadow-sm">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-[13px] text-gray-800">Nov 24, 2026</span>
                  </div>
                  <div className="border border-[#e5e5e5] rounded-xl p-3 flex items-center gap-3 bg-[#fafafa] shadow-sm">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-[13px] text-gray-800">10:00 AM EST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

const FeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div id="features" ref={containerRef} className="relative bg-white" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 md:py-24 max-w-[1600px] mx-auto gap-12 overflow-hidden">
        <div className="w-full md:w-1/3 flex flex-col gap-16 md:gap-32 pr-0 md:pr-12 relative z-10 h-full justify-center">
          {FEATURES_DATA.map((feature, i) => {
            const step = 1 / FEATURES_DATA.length;
            const start = i * step;
            const end = (i + 1) * step;
            const opacity = useTransform(
              scrollYProgress,
              [start - 0.1, start, end - 0.1, end],
              [0, 1, 1, 0]
            );
            const y = useTransform(
              scrollYProgress,
              [start - 0.1, start, end - 0.1, end],
              [40, 0, 0, -40]
            );

            return (
              <motion.div
                key={feature.id}
                style={{ opacity, y, position: i === 0 ? "relative" : "absolute", top: i === 0 ? "auto" : "50%", transform: i === 0 ? "none" : "translateY(-50%)" }}
                className="w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-6 shadow-sm">
                  {i === 0 ? <BarChart3 className="w-6 h-6 text-[#111]" /> :
                   i === 1 ? <PieChart className="w-6 h-6 text-[#111]" /> :
                   i === 2 ? <Target className="w-6 h-6 text-[#111]" /> :
                   i === 3 ? <Calendar className="w-6 h-6 text-[#111]" /> :
                             <Send className="w-6 h-6 text-[#111]" />}
                </div>
                <h3 className="text-3xl md:text-5xl font-medium tracking-tight text-[#111] mb-6">{feature.title}</h3>
                <p className="text-xl text-[#666] leading-relaxed font-light">{feature.desc}</p>
                <div className="mt-8">
                  <Link to="/pricing" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-[#111] hover:underline group">
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="w-full md:w-2/3 h-[50vh] md:h-[85vh] relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-[#e5e5e5] bg-white">
          {FEATURES_DATA.map((feature, i) => {
            const step = 1 / FEATURES_DATA.length;
            const start = i * step;
            const end = (i + 1) * step;
            const opacity = useTransform(
              scrollYProgress,
              [start - 0.05, start + 0.05, end - 0.05, end + 0.05],
              [0, 1, 1, 0]
            );
            const scale = useTransform(
              scrollYProgress,
              [start - 0.1, start + 0.1, end - 0.1, end + 0.1],
              [0.95, 1, 1, 1.05]
            );

            return (
              <motion.div
                key={feature.id}
                style={{ opacity, scale }}
                className="absolute inset-0 w-full h-full bg-white"
              >
                {feature.graphic()}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
