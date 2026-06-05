import { useState } from "react";
import { SiGoogleads } from "react-icons/si";
import { 
  Search, Palette, RefreshCw, HelpCircle, Bell, MessageSquare, 
  Plus, Megaphone, Target, Wrench, CreditCard, Settings, 
  ChevronDown, AlertCircle, ChevronLeft, ChevronRight, X
} from "lucide-react";
import GoogleAdsOverview from "../features/googleAds/components/GoogleAdsOverview";
import GoogleAdsCampaignsTable from "../features/googleAds/components/GoogleAdsCampaignsTable";
import GoogleAdsCreateCampaign from "../features/googleAds/components/GoogleAdsCreateCampaign";

export default function GoogleAdsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns">("overview");
  const [currentView, setCurrentView] = useState<"dashboard" | "create">("dashboard");

  // This function is passed to GoogleAdsOverview to switch the view
  const handleCreateCampaign = () => {
    setCurrentView("create");
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden font-['Inter']">
      
      {/* ── Top Header ── */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {currentView === "create" && (
              <button 
                onClick={() => setCurrentView("dashboard")} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <SiGoogleads className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-slate-700 text-lg">Google Ads</span>
            </div>
          </div>
          
          <div className="relative hidden md:block w-[400px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder='"What are my top performing campaigns?"'
              className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-5 text-slate-500 text-xs font-medium">
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-slate-900"><Palette className="w-5 h-5"/>Appearance</div>
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-slate-900"><RefreshCw className="w-5 h-5"/>Refresh</div>
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-slate-900"><HelpCircle className="w-5 h-5"/>Help</div>
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-slate-900 relative">
            <Bell className="w-5 h-5"/>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">!</span>
            Notifications
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-slate-900 text-green-600">
            <MessageSquare className="w-5 h-5"/>Ask Advisor
          </div>
          
          <div className="flex flex-col items-end leading-tight border-l border-slate-200 pl-5 ml-2">
            <span className="text-slate-900">781-522-1497 kashmir Organ...</span>
            <span className="text-slate-500 font-normal">Team@antagonmedia.com</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-800 text-white flex items-center justify-center text-sm font-semibold cursor-pointer">
            T
          </div>
        </div>
      </header>

      {/* ── Red Alert Banner ── */}
      <div className="bg-white border border-red-500 rounded-lg mx-4 mt-4 p-3 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>
            <span className="font-semibold text-red-600">Balance exhausted</span>
            <span className="text-slate-700"> - Your balance is either exhausted or nearly exhausted. To ensure your ads keep running, make a payment to add money to your account.</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button className="text-red-500 hover:text-red-600">Dismiss</button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded transition-colors">Fix it</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden mt-4">
        
        {/* ── Secondary Sidebar (Only shown in Dashboard view) ── */}
        {currentView === "dashboard" && (
          <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 flex justify-center">
              <button 
                onClick={handleCreateCampaign}
                className="flex flex-col items-center justify-center gap-1 w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow hover:bg-slate-50 transition-all text-xs font-medium text-slate-700"
              >
                <Plus className="w-6 h-6 text-blue-600" />
                Create
              </button>
            </div>

            <nav className="flex flex-col gap-1 py-2">
              <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">
                <Megaphone className="w-5 h-5" /> Campaigns
              </button>
              <div className="ml-[48px] flex flex-col gap-1 border-l border-slate-200 pl-2 my-1">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "overview" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Overview
                </button>
                <button className="text-left text-sm px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">Recommendations</button>
                <button className="text-left text-sm px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">Insights and reports</button>
                <button 
                  onClick={() => setActiveTab("campaigns")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "campaigns" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Campaigns
                </button>
                <button className="text-left text-sm px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">Assets</button>
                <button className="text-left text-sm px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">Products</button>
              </div>
              
              <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">
                <Target className="w-5 h-5" /> Goals
                <ChevronDown className="w-4 h-4 ml-auto" />
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">
                <Wrench className="w-5 h-5" /> Tools
                <ChevronDown className="w-4 h-4 ml-auto" />
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">
                <CreditCard className="w-5 h-5" /> Billing
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">
                <Settings className="w-5 h-5" /> Admin
              </button>
            </nav>
          </aside>
        )}

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative z-0">
          
          {currentView === "dashboard" ? (
            <>
              {/* Page Title & Controls */}
              <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-end shrink-0 sticky top-0 z-10">
                <h1 className="text-2xl font-normal text-slate-800">
                  {activeTab === "overview" ? "Overview" : "Campaigns"}
                </h1>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">Custom</span>
                  <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-1.5 hover:bg-slate-50 cursor-pointer bg-white">
                    Jun 1 - 3, 2026
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden">
                    <button className="p-1.5 hover:bg-slate-100 border-r border-slate-300 text-slate-500"><ChevronLeft className="w-4 h-4"/></button>
                    <button className="p-1.5 hover:bg-slate-100 text-slate-500"><ChevronRight className="w-4 h-4"/></button>
                  </div>
                  <a href="#" className="text-blue-600 hover:underline">Show last 30 days</a>
                </div>
              </div>

              <div className="flex-1 p-8 max-w-[1600px] w-full mx-auto">
                {activeTab === "overview" && <GoogleAdsOverview onCreateCampaign={handleCreateCampaign} />}
                {activeTab === "campaigns" && <GoogleAdsCampaignsTable />}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col h-full w-full">
              <GoogleAdsCreateCampaign onCancel={() => setCurrentView("dashboard")} />
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}
