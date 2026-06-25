import { useState } from "react";
  // @ts-expect-error unused variable
import { useParams, Routes, Route, useNavigate } from "react-router-dom";
import { SiGoogleads } from "react-icons/si";
import { 
  Search, Palette, RefreshCw, HelpCircle, Bell, MessageSquare, 
  Plus, Megaphone, Target, Wrench, CreditCard, Settings, Activity,
  // @ts-expect-error unused variable
  ChevronDown, AlertCircle, ChevronLeft, ChevronRight, X
} from "lucide-react";
import GoogleAdsOverview from "../features/googleAds/components/GoogleAdsOverview";
import { LiveCampaignsTable } from "../features/googleAds/components/campaigns/LiveCampaignsTable";
import { GoogleAdsCampaignDetailPage } from "../features/googleAds/components/campaigns/GoogleAdsCampaignDetailPage";
import GoogleAdsCreateCampaign from "../features/googleAds/components/GoogleAdsCreateCampaign";
import { GoogleAdsDateRangePicker } from "../features/googleAds/components/GoogleAdsDateRangePicker";
import { AudiencesTab } from "../features/googleAds/components/audiences/AudiencesTab";
import { AssetsLibraryPage } from "../features/googleAds/components/assets/AssetsLibraryPage";
import { AssetGroupsPage } from "../features/googleAds/components/pmax/AssetGroupsPage";
import { RecommendationsPage } from "../features/googleAds/components/recommendations/RecommendationsPage";
import { ConversionsPage } from "../features/googleAds/components/conversions/ConversionsPage";
import { GoogleAdsReportsPage } from "../features/googleAds/components/reports/GoogleAdsReportsPage";
import { AccountSwitcher } from "../features/googleAds/components/mcc/AccountSwitcher";
import { MCCHierarchyPage } from "../features/googleAds/components/mcc/MCCHierarchyPage";
import { SharedNegativeListsPage } from "../features/googleAds/components/sharedLibrary/SharedNegativeListsPage";
import { BillingOverviewPage } from "../features/googleAds/components/billing/BillingOverviewPage";
import { LabelsPage } from "../features/googleAds/components/sharedLibrary/labels/LabelsPage";
import { PortfolioBidStrategiesPage } from "../features/googleAds/components/sharedLibrary/bidding/PortfolioBidStrategiesPage";
import { SharedBudgetsPage } from "../features/googleAds/components/sharedLibrary/budget/SharedBudgetsPage";
import { PlacementExclusionListsPage } from "../features/googleAds/components/sharedLibrary/PlacementExclusionListsPage";
import { ChangeHistoryPage } from "../features/googleAds/components/changeHistory/ChangeHistoryPage";

export default function GoogleAdsDashboardPage() {
  const { clientId, "*": splat } = useParams<{ clientId?: string; "*": string }>();
  const navigate = useNavigate();
  const numericClientId = clientId ? parseInt(clientId, 10) : 1; // Fallback to 1 if not provided
  
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "audiences" | "assets" | "asset-groups" | "recommendations" | "conversions" | "reports" | "accounts" | "shared-library" | "shared-library-bid-strategies" | "shared-library-budgets" | "shared-library-placement-exclusions" | "billing" | "labels" | "change-history">("overview");
  const [currentView, setCurrentView] = useState<"dashboard" | "create">("dashboard");
  const [draftIdToResume, setDraftIdToResume] = useState<string | null>(null);

  // If splat contains 'campaigns/', we should just render the detail page without the dashboard sidebar
  if (splat && splat.startsWith("campaigns/")) {
    return (
      <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col font-['Inter']">
        <GoogleAdsCampaignDetailPage clientId={numericClientId} baseRoute={`/data-sources/google-ads/${numericClientId}`} />
      </div>
    );
  }

  const handleCreateCampaign = () => {
    setDraftIdToResume(null);
    setCurrentView("create");
  };

  const handleResumeDraft = (draftId: string) => {
    setDraftIdToResume(draftId);
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
            <AccountSwitcher 
              selectedClientId={numericClientId} 
              onSelectClient={(id) => navigate(`/data-sources/google-ads/${id}`)}
            />
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
                <button 
                  onClick={() => setActiveTab("recommendations")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "recommendations" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Recommendations
                </button>
                <button 
                  onClick={() => setActiveTab("reports")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "reports" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Insights and reports
                </button>
                <button 
                  onClick={() => setActiveTab("campaigns")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "campaigns" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Campaigns
                </button>
                <button 
                  onClick={() => setActiveTab("accounts")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "accounts" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Accounts (MCC)
                </button>
                <button 
                  onClick={() => setActiveTab("assets")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "assets" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Assets
                </button>
                <button 
                  onClick={() => setActiveTab("asset-groups")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "asset-groups" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Asset Groups (PMax)
                </button>
                <button 
                  onClick={() => setActiveTab("audiences")}
                  className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "audiences" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Audiences
                </button>
                <button className="text-left text-sm px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">Products</button>
              </div>
              
              <button 
                onClick={() => setActiveTab("conversions")}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full mr-4 ${activeTab === "conversions" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Target className="w-5 h-5" /> Goals (Conversions)
              </button>
                <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">
                  <Wrench className="w-5 h-5" /> Tools
                </button>
                <div className="ml-[48px] flex flex-col gap-1 border-l border-slate-200 pl-2 my-1">
                  <button 
                    onClick={() => setActiveTab("shared-library")}
                    className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "shared-library" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    Negative lists
                  </button>
                  <button 
                    onClick={() => setActiveTab("shared-library-bid-strategies")}
                    className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "shared-library-bid-strategies" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    Bid strategies
                  </button>
                  <button 
                    onClick={() => setActiveTab("shared-library-budgets")}
                    className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "shared-library-budgets" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    Shared budgets
                  </button>
                  <button 
                    onClick={() => setActiveTab("shared-library-placement-exclusions")}
                    className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "shared-library-placement-exclusions" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    Placement exclusions
                  </button>
                  <button 
                    onClick={() => setActiveTab("labels")}
                    className={`text-left text-sm px-3 py-1.5 rounded-r-full mr-4 ${activeTab === "labels" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    Labels
                  </button>
                </div>
                
                <button 
                  onClick={() => setActiveTab("billing")}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4 ${activeTab === "billing" ? "bg-blue-50 text-blue-700 font-medium" : ""}`}
                >
                  <CreditCard className="w-5 h-5" /> Billing
                </button>
                <button 
                  onClick={() => setActiveTab("change-history")}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full mr-4 ${activeTab === "change-history" ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <Activity className="w-5 h-5" /> Change history
                </button>
              <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-r-full mr-4">
                <Settings className="w-5 h-5" /> Admin
              </button>
            </nav>
          </aside>
        )}

        {/* ── Main Content Area ── */}
        <main className={`flex-1 flex flex-col relative z-0 overflow-hidden ${currentView === "create" ? "bg-[#f1f3f4]" : "bg-slate-50 overflow-y-auto"}`}>
          
          {currentView === "dashboard" ? (
            <>
              {/* Page Title & Controls */}
              <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 sticky top-0 z-10">
                <h1 className="text-2xl font-normal text-slate-800">
                  {activeTab === "overview" ? "Overview" : "Campaigns"}
                </h1>
                
                <div className="flex items-center gap-4 text-sm">
                  <GoogleAdsDateRangePicker />
                </div>
              </div>

              <div className="flex-1 p-8 w-full mx-auto min-w-0 overflow-auto">
                {activeTab === "overview" && <GoogleAdsOverview onCreateCampaign={handleCreateCampaign} onResumeDraft={handleResumeDraft} />}
                {activeTab === "campaigns" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <LiveCampaignsTable clientId={numericClientId} baseRoute={`/data-sources/google-ads/${numericClientId}`} />
                   </div>
                )}
                {activeTab === "audiences" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <AudiencesTab clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "assets" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <AssetsLibraryPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "asset-groups" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <AssetGroupsPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "recommendations" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <RecommendationsPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "conversions" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <ConversionsPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "reports" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <GoogleAdsReportsPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "accounts" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <MCCHierarchyPage 
                       clientId={numericClientId} 
                       onSelectClient={(id) => {
                         navigate(`/data-sources/google-ads/${id}`);
                       }}
                     />
                   </div>
                )}
                {activeTab === "shared-library" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <SharedNegativeListsPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "shared-library-bid-strategies" && (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                    <PortfolioBidStrategiesPage clientId={numericClientId} />
                  </div>
                )}
                {activeTab === "shared-library-budgets" && (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                    <SharedBudgetsPage clientId={numericClientId} />
                  </div>
                )}
                {activeTab === "shared-library-placement-exclusions" && (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                    <PlacementExclusionListsPage clientId={numericClientId} />
                  </div>
                )}
                {activeTab === "billing" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <BillingOverviewPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "labels" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <LabelsPage clientId={numericClientId} />
                   </div>
                )}
                {activeTab === "change-history" && (
                   <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden h-[800px]">
                     <ChangeHistoryPage clientId={numericClientId} />
                   </div>
                )}
              </div>
            </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <GoogleAdsCreateCampaign onCancel={() => setCurrentView("dashboard")} initialDraftId={draftIdToResume} />
          </div>
        )}
          
        </main>
      </div>
    </div>
  );
}
