import { useState } from "react";
import { 
  Tag, Users, MousePointerClick, Smartphone, 
  Volume2, MapPin, Settings, CheckCircle2, 
  ShoppingCart, CreditCard, Target, Eye, 
  MoreVertical, TriangleAlert, Info, Play, Trash2, ChevronUp,
  Mail, Sparkles, Layout, MonitorPlay, Search,
  Building2, CornerUpRight, ChevronDown, Package, FileClock, Link2, X
} from "lucide-react";
import { SiGoogleads } from "react-icons/si";
import GoogleAdsCampaignWizard from "./GoogleAdsCampaignWizard";
interface CreateCampaignProps {
  onCancel: () => void;
}

export default function GoogleAdsCreateCampaign({ onCancel }: CreateCampaignProps) {
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [youtubeGoal, setYoutubeGoal] = useState<"views" | "reach" | "subs">("views");
  const [storeLocationType, setStoreLocationType] = useState<"business" | "affiliate">("business");
  const [advertiseProducts, setAdvertiseProducts] = useState(true);
  const [localGoal, setLocalGoal] = useState<"contact" | "directions">("contact");
  const [resumeDraft, setResumeDraft] = useState(true);
  const [customCampaignType, setCustomCampaignType] = useState<string>("pmax");
  const [wizardMode, setWizardMode] = useState(false);
  const [appSubtype, setAppSubtype] = useState<"installs" | "engagement" | "prereg">("installs");
  const [appPlatform, setAppPlatform] = useState<"android" | "ios" | null>(null);
  const [videoSubtype, setVideoSubtype] = useState<string>("views");
  const [hasContinued, setHasContinued] = useState(false);
  const [isDraftDropdownOpen, setIsDraftDropdownOpen] = useState(false);
  const [reachGoals, setReachGoals] = useState({
    website: true,
    phone: true,
    store: true,
    leads: true,
    messages: true,
  });

  const conversionGoalsList = selectedObjective === "sales"
    ? [
        { id: 'cart', name: 'Add to cart', icon: ShoppingCart, source: 'Website', actions: 1, warning: true },
        { id: 'checkout', name: 'Begin checkout', icon: CreditCard, source: 'Website', actions: 2, warning: true },
        { id: 'purchases', name: 'Purchases', icon: ShoppingCart, source: 'Website', actions: 2, warning: false },
        { id: 'other', name: 'Other', icon: Target, source: 'Website', actions: 1, warning: false },
        { id: 'pageviews', name: 'Page views', icon: Eye, source: 'Website', actions: 3, warning: false },
      ]
    : [
        { id: 'cart', name: 'Add to cart', icon: ShoppingCart, source: 'Website', actions: 1, warning: true },
        { id: 'checkout', name: 'Begin checkout', icon: CreditCard, source: 'Website', actions: 2, warning: true },
        { id: 'other', name: 'Other', icon: Target, source: 'Website', actions: 1, warning: false },
        { id: 'pageviews', name: 'Page views', icon: Eye, source: 'Website', actions: 3, warning: false },
        { id: 'purchases', name: 'Purchases', icon: ShoppingCart, source: 'Website', actions: 2, warning: false },
      ];


  const objectives = [
    { id: "sales", title: "Sales", desc: "Drive sales online, in app, by phone, or in store", icon: Tag },
    { id: "leads", title: "Leads", desc: "Get leads and other conversions by encouraging customers to take action", icon: Users },
    { id: "traffic", title: "Website traffic", desc: "Get the right people to visit your website", icon: MousePointerClick },
    { id: "app", title: "App promotion", desc: "Get more installs, engagement and pre-registration for your app", icon: Smartphone },
    { id: "youtube", title: "YouTube reach, views, and engagements", desc: "Drive awareness and consideration of your product or brand", icon: Volume2 },
    { id: "local", title: "Local store visits and promotions", desc: "Drive visits to local stores, including restaurants and dealerships.", icon: MapPin },
    { id: "custom", title: "Create a campaign without guidance", desc: "You'll choose a campaign next", icon: Settings },
  ];

  if (wizardMode) {
    const displayType = 
      customCampaignType === "pmax" ? "Performance Max" : 
      customCampaignType === "search" ? "Search" : 
      customCampaignType === "shopping" ? "Shopping" : 
      customCampaignType === "video" ? "Video" : 
      customCampaignType === "display" ? "Display" :
      customCampaignType === "demand" ? "Demand Gen" :
      "Campaign";

    return <GoogleAdsCampaignWizard onCancel={onCancel} campaignType={displayType} />;
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto py-8 flex flex-col">
      <h1 className="text-2xl font-normal text-slate-800 mb-6 order-1">What's your campaign objective?</h1>
      
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-2">
        <div className="bg-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">Choose your objective</h2>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-6">Select an objective to tailor your experience to the goals and settings that will work best for your campaign</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {objectives.map((obj) => {
              const isSelected = selectedObjective === obj.id;
              const Icon = obj.icon;
              return (
                <div 
                  key={obj.id}
                  onClick={() => {
                    setSelectedObjective(obj.id);
                    setHasContinued(false);
                  }}
                  className={`relative p-5 border rounded-md cursor-pointer transition-all hover:bg-slate-50 min-h-[140px] flex flex-col gap-2 ${
                    isSelected ? "border-blue-600 bg-blue-50/30" : "border-slate-200 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <Icon className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-slate-600"}`} />
                  <h3 className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-slate-800"}`}>{obj.title}</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">{obj.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Panel: Conversion Goals (Sales, Leads, Traffic, Custom) */}
      {["sales", "leads", "traffic", "custom"].includes(selectedObjective || "") && 
       !(selectedObjective === "custom" && ["app", "video"].includes(customCampaignType)) && (
        <div className={`bg-white border border-slate-200 shadow-sm rounded-md mb-6 ${selectedObjective === "custom" ? "order-4" : "order-3"}`}>
          <div className="bg-white px-6 py-4 border-b border-slate-200 rounded-t-md">
            <h2 className="text-sm font-semibold text-slate-800">
              {selectedObjective === "custom" 
                ? "Use these conversion goals for campaign performance optimization" 
                : `Use these conversion goals to improve ${objectives.find(o => o.id === selectedObjective)?.title}`}
            </h2>
          </div>
          <div className="p-6">
            <p className="text-[13px] text-slate-500 mb-6">
              {selectedObjective === "custom"
                ? "Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance"
                : `Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance, even if they don't seem directly related to ${objectives.find(o => o.id === selectedObjective)?.title}.`}
            </p>
            
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="pb-3 w-1/3">Conversion Goals</th>
                  <th className="pb-3 w-1/3">Conversion Source</th>
                  <th className="pb-3 w-1/3">Conversion Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {conversionGoalsList.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <tr key={goal.id} className="hover:bg-slate-50 relative">
                      <td className="py-4 font-medium text-slate-700 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-500" />
                        {goal.name} <span className="text-slate-400 font-normal">(account default)</span>
                      </td>
                      <td className="py-4 text-slate-600">{goal.source}</td>
                      <td className="py-4 text-slate-600 flex items-center justify-between">
                        <div className="relative">
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setOpenTooltipId(openTooltipId === goal.id ? null : goal.id);
                              setOpenMenuId(null);
                            }}
                          >
                            {goal.warning && <TriangleAlert className="w-4 h-4 text-amber-500 fill-amber-100" />}
                            <span className="border-b border-dashed border-slate-400">{goal.actions} action{goal.actions > 1 ? 's' : ''}</span>
                          </div>

                          {/* Action Tooltip Popup */}
                          {openTooltipId === goal.id && (
                            <div className="absolute top-full left-0 mt-2 w-[420px] bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                              {goal.warning ? (
                                <>
                                  <div className="bg-[#fef9eb] border-b border-[#fef0c8] p-4 flex gap-3">
                                    <TriangleAlert className="w-5 h-5 text-amber-600 fill-amber-100 shrink-0" />
                                    <div className="text-[13px] text-slate-800 font-medium">
                                      {goal.actions} inactive or unverified conversion action<br/>from <strong>{goal.source}</strong> for the <strong>{goal.name}</strong> goal
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-800 mb-2">
                                      <ChevronUp className="w-4 h-4 text-slate-500" />
                                      {goal.actions} inactive conversion action
                                    </div>
                                    <div className="pl-6 mb-4">
                                      <div className="text-[13px] font-medium text-slate-800">{goal.name.replace(/\s+/g, '_')}</div>
                                      <div className="text-[12px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        No recent conversions, Value: ₹0.00
                                      </div>
                                    </div>
                                    <div className="text-[12px] text-slate-500 pt-2 border-t border-slate-100">
                                      You can <button onClick={() => setIsEditModalOpen(true)} className="text-blue-600 hover:underline">edit this goal</button> on your Conversions page
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="p-4">
                                  <div className="text-[13px] text-slate-700 mb-4">
                                    {goal.actions} active conversion action{goal.actions > 1 ? 's' : ''} from {goal.source} for the {goal.name} goal
                                  </div>
                                  
                                  <div className="flex flex-col gap-4 mb-4">
                                    <div>
                                      <div className="text-[13px] font-semibold text-slate-700">Google Shopping App Page View</div>
                                      <div className="text-[12px] text-slate-500 flex items-start gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0"></div>
                                        <span>Recording (processing enhanced conversions), Value:<br/>Dynamic</span>
                                      </div>
                                    </div>
                                    {goal.actions > 1 && (
                                      <div>
                                        <div className="text-[13px] font-semibold text-slate-700">Google Shopping App View Item</div>
                                        <div className="text-[12px] text-slate-500 flex items-start gap-1.5 mt-0.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0"></div>
                                          <span>Recording (processing enhanced conversions), Value:<br/>Dynamic</span>
                                        </div>
                                      </div>
                                    )}
                                    {goal.actions > 2 && (
                                      <div>
                                        <div className="text-[13px] font-semibold text-slate-700">Google Shopping App Search</div>
                                        <div className="text-[12px] text-slate-500 flex items-start gap-1.5 mt-0.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0"></div>
                                          <span>Recording (processing enhanced conversions), Value:<br/>Dynamic</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-[12px] text-slate-500 pt-1 pb-3">
                                    You can <button onClick={() => setIsEditModalOpen(true)} className="text-blue-600 hover:underline">edit this goal</button> on your Conversions page
                                  </div>
                                  
                                  <div className="pt-3 border-t border-slate-200">
                                    <div className="text-[13px] font-semibold text-slate-700 mb-1">Dynamic value</div>
                                    <div className="text-[12px] text-slate-500 leading-relaxed">
                                      A unique value is recorded for each conversion. The average<br/>value recorded for these conversions is (Multiple values avg).
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <button 
                            onClick={() => {
                              setOpenMenuId(openMenuId === goal.id ? null : goal.id);
                              setOpenTooltipId(null);
                            }}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4"/>
                          </button>

                          {/* 3-Dots Menu Popup */}
                          {openMenuId === goal.id && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded shadow-lg z-50 py-1">
                              <button className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 w-full text-left transition-colors">
                                <Trash2 className="w-4 h-4 text-slate-500" />
                                Remove "{goal.name}" goal
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Panel: App Promotion */}
      {selectedObjective === "app" && (
        <div className="flex flex-col gap-4 mb-6 order-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Select a campaign type</h2>
            </div>
            <div className="p-6">
              <div className="relative p-4 border border-blue-600 rounded-md bg-blue-50/30 w-full max-w-[240px]">
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
                <div className="flex gap-2 mb-2 items-center">
                  <SiGoogleads className="w-4 h-4 text-blue-600" />
                  <Play className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
                <h3 className="text-sm font-medium text-blue-700 mb-1">App</h3>
                <p className="text-[12px] text-slate-500 leading-snug">Promote your Android or iOS app on Google Search, Play, YouTube and partner sites with app ads</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Select a campaign subtype</h2>
              <a href="#" className="text-[13px] text-blue-600 hover:underline">Learn more</a>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="subtype" defaultChecked className="mt-1 text-blue-600 w-4 h-4" />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">App installs</div>
                  <div className="text-[12px] text-slate-500">Get new people to install your app</div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="subtype" className="mt-1 text-blue-600 w-4 h-4" />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">App engagement</div>
                  <div className="text-[12px] text-slate-500">Get existing users to take actions in your app (Minimum 50K installs required)</div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="subtype" className="mt-1 text-blue-600 w-4 h-4" />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">App pre-registration (Android only)</div>
                  <div className="text-[12px] text-slate-500">Get new users to pre-register for your app before launch</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Select your mobile app's platform</h2>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="platform" defaultChecked className="text-blue-600 w-4 h-4" />
                  <span className="text-[13px] text-slate-800">Android</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="platform" className="text-blue-600 w-4 h-4" />
                  <span className="text-[13px] text-slate-800">iOS</span>
                </label>
              </div>
              
              <div className="flex flex-col gap-2 w-full max-w-lg">
                <label className="text-[13px] font-medium text-slate-800">Look up your app</label>
                <input 
                  type="text" 
                  placeholder="Enter the app name, package name, publisher, or Play Store URL"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-[12px] text-slate-500">
                  If you cannot find your app, please see <a href="#" className="text-blue-600 hover:underline">these steps</a>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Campaign name</h2>
            </div>
            <div className="p-6">
              <input 
                type="text" 
                defaultValue="App promotion-App-1"
                className="w-full max-w-md border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Panel: Local store visits */}
      {selectedObjective === "local" && (
        <div className="flex flex-col gap-4 mb-6 order-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Select a campaign type</h2>
            </div>
            <div className="p-6">
              <div className="relative p-4 border border-blue-600 rounded-md bg-blue-50/30 w-[240px] shrink-0 mb-4">
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
                <div className="flex gap-1.5 mb-2 items-center">
                  <SiGoogleads className="w-4 h-4 text-blue-600" />
                  <Play className="w-4 h-4 text-red-500 fill-red-500" />
                  <Mail className="w-4 h-4 text-red-500" />
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <Layout className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-blue-700 mb-1">Performance Max</h3>
                <p className="text-[12px] text-slate-500 leading-snug">Reach the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more</p>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded px-4 py-3 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[12px] text-slate-700 leading-relaxed">
                  Performance Max has replaced Local campaigns. Performance Max brings you the same optimization benefits, including store visits, call clicks, and directions to help you meet your offline goals. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-[13px] font-medium text-slate-500 mb-4">Campaign feeds</h3>
              <p className="text-[13px] text-slate-600 mb-6">Expand available ad formats, power ad creatives, and improve targeting.</p>
              
              <div className="text-[13px] font-bold text-slate-800 mb-4">Which store locations should your ads promote?</div>
              
              <div className="flex flex-col gap-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="locations" 
                    checked={storeLocationType === "business"} 
                    onChange={() => setStoreLocationType("business")}
                    className="text-blue-600 w-4 h-4" 
                  />
                  <span className="text-[13px] text-slate-800">Your business locations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="locations" 
                    checked={storeLocationType === "affiliate"}
                    onChange={() => setStoreLocationType("affiliate")}
                    className="text-blue-600 w-4 h-4" 
                  />
                  <span className="text-[13px] text-slate-800">Affiliate locations</span>
                </label>
              </div>

              {storeLocationType === "business" ? (
                <a href="#" className="text-[13px] font-medium text-blue-600 hover:underline">Link Account</a>
              ) : (
                <a href="#" className="text-[13px] font-medium text-blue-600 hover:underline">Select retail chains</a>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
              <h2 className="text-sm font-semibold text-slate-800">Add products to this campaign</h2>
              <ChevronUp className="w-5 h-5 text-slate-500" />
            </div>
            <div className="p-6 border-t border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input 
                  type="checkbox" 
                  checked={advertiseProducts}
                  onChange={(e) => setAdvertiseProducts(e.target.checked)}
                  className="text-blue-600 w-4 h-4 rounded-sm" 
                />
                <span className="text-[13px] text-slate-800 font-medium">Advertise products from a Merchant Center account</span>
              </label>

              {advertiseProducts && (
                <div className="ml-7">
                  <div className="flex items-center gap-1 text-[12px] text-slate-600 mb-2">
                    Select a Merchant Center account <Info className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-2 w-max bg-white mb-3">
                    <Package className="w-4 h-4 text-blue-600 fill-blue-100" />
                    <span className="text-[13px] text-slate-800">5513827312 - kashmirorganicnuts</span>
                    <button className="text-slate-400 hover:text-slate-600"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="text-[12px] text-slate-600">
                    All products from the selected account will be available to advertise in this campaign. <a href="#" className="text-blue-600 hover:underline">Select a feed label</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!advertiseProducts && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
              <div className="bg-white px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800">Where should people go after clicking your ads?</h2>
              </div>
              <div className="p-6">
                <p className="text-[13px] text-slate-600 mb-6 leading-relaxed">
                  Think about the product or service you want to sell and enter the URL you want people to see after clicking your ads. This might be your homepage or a more specific page on your website.
                </p>
                <div className="relative w-full max-w-[400px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Final URL"
                    className="w-full border border-slate-300 rounded px-3 py-2.5 pl-10 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Choose your local store visits and promotions conversion goals</h2>
            </div>
            <div className="p-6">
              <p className="text-[13px] text-slate-500 mb-4">
                Pick the most important local store visits and promotions goals that you would like to focus on. Based on your selection, Smart Bidding will then optimize for delivering your ads to the right people to meet the goals. <a href="#" className="text-blue-600 hover:underline">Learn more about smart bidding</a>
              </p>

              <div className="flex flex-col gap-3">
                <div 
                  onClick={() => setLocalGoal("contact")}
                  className={`flex items-center justify-between border rounded-md p-4 cursor-pointer transition-colors ${
                    localGoal === "contact" ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Building2 className={`w-5 h-5 shrink-0 ${localGoal === "contact" ? "text-blue-600" : "text-slate-500"}`} />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800">Contact</div>
                      <div className="text-[12px] text-slate-500">Show your ads to people who are more likely to contact a business like yours</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    localGoal === "contact" ? "border-blue-600" : "border-slate-400"
                  }`}>
                    {localGoal === "contact" && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                  </div>
                </div>

                <div 
                  onClick={() => setLocalGoal("directions")}
                  className={`flex items-center justify-between border rounded-md p-4 cursor-pointer transition-colors ${
                    localGoal === "directions" ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <CornerUpRight className={`w-5 h-5 shrink-0 ${localGoal === "directions" ? "text-blue-600" : "text-slate-500"}`} />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800">Directions request</div>
                      <div className="text-[12px] text-slate-500">Show your ads to people who are more likely looking for directions to a business like yours</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    localGoal === "directions" ? "border-blue-600" : "border-slate-400"
                  }`}>
                    {localGoal === "directions" && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Would you like to resume from an existing campaign draft?</h2>
            </div>
            <div className="p-6">
              <p className="text-[13px] text-slate-500 mb-6">
                Your account has existing campaign drafts with the same campaign type, allowing you to continue where you last left off setting up your campaign
              </p>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input 
                      type="radio" 
                      name="draft" 
                      checked={resumeDraft} 
                      onChange={() => setResumeDraft(true)}
                      className="text-blue-600 w-4 h-4" 
                    />
                    <span className="text-[13px] font-medium text-slate-800">Continue from an existing campaign draft</span>
                  </label>
                  {resumeDraft && (
                    <div className="ml-7 border border-slate-300 rounded-md p-3 flex items-center justify-between w-max min-w-[300px] cursor-pointer hover:bg-slate-50">
                      <div className="flex gap-3 items-center">
                        <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                        <div>
                          <div className="text-[13px] font-medium text-slate-800">Performance Max-9</div>
                          <div className="text-[11px] text-slate-500">Last modified less than a day ago • Performance Max</div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="draft" 
                      checked={!resumeDraft}
                      onChange={() => setResumeDraft(false)}
                      className="text-blue-600 w-4 h-4" 
                    />
                    <span className="text-[13px] text-slate-800">Create a new campaign</span>
                  </label>
                  {!resumeDraft && (
                    <div className="ml-7 mt-4 relative">
                      <label className="absolute -top-2 left-2 bg-white px-1 text-[11px] text-slate-500">Campaign name*</label>
                      <input 
                        type="text" 
                        defaultValue="Local store visits and promotions-Performance Max-10"
                        className="w-full max-w-[400px] border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Panel: Custom (Without Guidance) */}
      {selectedObjective === "custom" && (
        <div className="flex flex-col gap-4 mb-6 order-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Select a campaign type</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Type: PMax */}
                <div 
                  onClick={() => setCustomCampaignType("pmax")}
                  className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                    customCampaignType === "pmax" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {customCampaignType === "pmax" && (
                    <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-1 items-center">
                    <SiGoogleads className="w-4 h-4 text-blue-600" />
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Mail className="w-4 h-4 text-red-500" />
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className={`text-sm font-medium ${customCampaignType === "pmax" ? "text-blue-700" : "text-slate-800"}`}>Performance Max</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Reach the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more</p>
                </div>

                {/* Type: Search */}
                <div 
                  onClick={() => setCustomCampaignType("search")}
                  className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                    customCampaignType === "search" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {customCampaignType === "search" && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-1 items-center">
                    <SiGoogleads className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className={`text-sm font-medium ${customCampaignType === "search" ? "text-blue-700" : "text-slate-800"}`}>Search</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Drive action on Google Search with text ads</p>
                </div>

                {/* Type: Demand Gen */}
                <div 
                  onClick={() => setCustomCampaignType("demandgen")}
                  className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                    customCampaignType === "demandgen" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {customCampaignType === "demandgen" && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-1 items-center">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Mail className="w-4 h-4 text-red-500" />
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className={`text-sm font-medium ${customCampaignType === "demandgen" ? "text-blue-700" : "text-slate-800"}`}>Demand Gen</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads</p>
                </div>

                {/* Type: Display */}
                <div 
                  onClick={() => setCustomCampaignType("display")}
                  className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                    customCampaignType === "display" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {customCampaignType === "display" && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-1 items-center">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Mail className="w-4 h-4 text-red-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className={`text-sm font-medium ${customCampaignType === "display" ? "text-blue-700" : "text-slate-800"}`}>Display</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Reach potential customers across 3 million sites and apps with your creative</p>
                </div>

                {/* Type: Shopping */}
                <div 
                  onClick={() => setCustomCampaignType("shopping")}
                  className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                    customCampaignType === "shopping" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {customCampaignType === "shopping" && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-1 items-center">
                    <SiGoogleads className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className={`text-sm font-medium ${customCampaignType === "shopping" ? "text-blue-700" : "text-slate-800"}`}>Shopping</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Promote your products from Merchant Center on Google Search with Shopping ads</p>
                </div>

                {/* Type: Video */}
                <div 
                  onClick={() => setCustomCampaignType("video")}
                  className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                    customCampaignType === "video" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {customCampaignType === "video" && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-1 items-center">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className={`text-sm font-medium ${customCampaignType === "video" ? "text-blue-700" : "text-slate-800"}`}>Video</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Drive action on YouTube with your video ads</p>
                </div>

                {/* Type: App */}
                <div 
                  onClick={() => setCustomCampaignType("app")}
                  className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                    customCampaignType === "app" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {customCampaignType === "app" && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-1 items-center">
                    <SiGoogleads className="w-4 h-4 text-blue-600" />
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Mail className="w-4 h-4 text-red-500" />
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className={`text-sm font-medium ${customCampaignType === "app" ? "text-blue-700" : "text-slate-800"}`}>App</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Promote your Android or iOS app on Google Search, Play, YouTube and partner sites with app ads</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Panel: Add Products (Pmax / Shopping) */}
      {selectedObjective === "custom" && ["pmax", "shopping"].includes(customCampaignType) && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-5">
          <div className="bg-white px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <h2 className="text-sm font-semibold text-slate-800">Add products to this campaign</h2>
            <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 border-t border-slate-200">
            {customCampaignType === "pmax" && (
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input 
                  type="checkbox" 
                  checked={advertiseProducts}
                  onChange={(e) => setAdvertiseProducts(e.target.checked)}
                  className="text-blue-600 w-4 h-4 rounded-sm" 
                />
                <span className="text-[13px] text-slate-800 font-medium">Advertise products from a Merchant Center account</span>
              </label>
            )}

            {(customCampaignType === "shopping" || (customCampaignType === "pmax" && advertiseProducts)) && (
              <div className={customCampaignType === "pmax" ? "ml-7" : ""}>
                <div className="flex items-center gap-1 text-[12px] text-slate-600 mb-2">
                  Select a Merchant Center account <Info className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-2 w-max bg-white mb-3">
                  <Package className="w-4 h-4 text-blue-600 fill-blue-100" />
                  <span className="text-[13px] text-slate-800">5513827312 - kashmirorganicnuts</span>
                  <button className="text-slate-400 hover:text-slate-600"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="text-[12px] text-slate-600">
                  All products from the selected account will be available to advertise in this campaign. <a href="#" className="text-blue-600 hover:underline">Select a feed label</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Panel: Demand Gen Info */}
      {selectedObjective === "custom" && customCampaignType === "demandgen" && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-5 p-4 flex gap-3">
           <div className="text-[13px] text-slate-600 leading-relaxed">
             Capturing engagement and action across YouTube, including Shorts, Discover, and Gmail, Demand Gen campaigns are ideal for social advertisers who want to serve visually-appealing, multi-format ads on Google's most impactful surfaces available to any advertiser. <a href="#" className="text-blue-600 hover:underline">See how it works</a>
           </div>
        </div>
      )}

      {/* Custom Panel: App Subtype */}
      {selectedObjective === "custom" && customCampaignType === "app" && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-4">
          <div className="p-6 flex flex-col gap-5">
            <div className="text-[13px] font-medium text-slate-800 flex gap-2">
              Select a campaign subtype <a href="#" className="text-blue-600 hover:underline font-normal">Learn more</a>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="app_subtype" 
                checked={appSubtype === "installs"} 
                onChange={() => setAppSubtype("installs")}
                className="mt-1 w-4 h-4 text-blue-600" 
              />
              <div>
                <div className="text-[13px] font-medium text-slate-800">App Installs</div>
                <div className="text-[12px] text-slate-500 mt-1">Get new people to install your app</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="app_subtype" 
                checked={appSubtype === "engagement"} 
                onChange={() => setAppSubtype("engagement")}
                className="mt-1 w-4 h-4 text-blue-600" 
              />
              <div>
                <div className="text-[13px] font-medium text-slate-800">App engagement</div>
                <div className="text-[12px] text-slate-500 mt-1">Get existing users to take actions in your app (Minimum 50K installs required)</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="app_subtype" 
                checked={appSubtype === "prereg"} 
                onChange={() => setAppSubtype("prereg")}
                className="mt-1 w-4 h-4 text-blue-600" 
              />
              <div>
                <div className="text-[13px] font-medium text-slate-800">App pre-registration (Android only)</div>
                <div className="text-[12px] text-slate-500 mt-1">Get new users to pre-register for your app before launch</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Custom Panel: App Platform */}
      {selectedObjective === "custom" && customCampaignType === "app" && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-5">
          <div className="p-6 flex flex-col gap-5">
            <div className="text-[13px] font-medium text-slate-800 mb-2">Select your mobile app's platform</div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="app_platform" 
                checked={appPlatform === "android"} 
                onChange={() => setAppPlatform("android")}
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-[13px] font-medium text-slate-800">Android</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input 
                type="radio" 
                name="app_platform" 
                checked={appPlatform === "ios"} 
                onChange={() => setAppPlatform("ios")}
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-[13px] font-medium text-slate-800">iOS</span>
            </label>

            <div>
              <label className="text-[13px] text-slate-800 block mb-2">Look up your app</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter the app name, package name, publisher, or Play Store URL"
                  className="w-full max-w-[500px] border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="text-[12px] text-slate-500 mt-3">
                If you cannot find your app, please see <a href="#" className="text-blue-600 hover:underline">these steps</a>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Dynamic Panel: Guided Campaign Type (Sales, Leads, Traffic) */}
      {hasContinued && ["sales", "leads", "traffic"].includes(selectedObjective || "") && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-5">
          <div className="bg-white px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">Select a campaign type</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const blocks: Record<string, React.ReactNode> = {
                  pmax: (
                    <div 
                      key="pmax"
                      onClick={() => setCustomCampaignType("pmax")}
                      className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                        customCampaignType === "pmax" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {customCampaignType === "pmax" && (
                        <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                        </div>
                      )}
                      <div className="flex gap-1.5 mb-1 items-center">
                        <SiGoogleads className="w-4 h-4 text-blue-600" />
                        <Play className="w-4 h-4 text-red-500 fill-red-500" />
                        <Mail className="w-4 h-4 text-red-500" />
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <Layout className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className={`text-sm font-medium ${customCampaignType === "pmax" ? "text-blue-700" : "text-slate-800"}`}>Performance Max</h3>
                      <p className="text-[12px] text-slate-500 leading-snug">Drive {selectedObjective} by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more</p>
                    </div>
                  ),
                  shopping: (
                    <div 
                      key="shopping"
                      onClick={() => setCustomCampaignType("shopping")}
                      className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                        customCampaignType === "shopping" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {customCampaignType === "shopping" && (
                        <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                        </div>
                      )}
                      <div className="flex gap-1.5 mb-1 items-center">
                        <SiGoogleads className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className={`text-sm font-medium ${customCampaignType === "shopping" ? "text-blue-700" : "text-slate-800"}`}>Shopping</h3>
                      <p className="text-[12px] text-slate-500 leading-snug">Promote your products from Merchant Center on Google Search with Shopping ads</p>
                    </div>
                  ),
                  demandgen: (
                    <div 
                      key="demandgen"
                      onClick={() => setCustomCampaignType("demandgen")}
                      className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                        customCampaignType === "demandgen" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {customCampaignType === "demandgen" && (
                        <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                        </div>
                      )}
                      <div className="flex gap-1.5 mb-1 items-center">
                        <Play className="w-4 h-4 text-red-500 fill-red-500" />
                        <Mail className="w-4 h-4 text-red-500" />
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <Layout className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className={`text-sm font-medium ${customCampaignType === "demandgen" ? "text-blue-700" : "text-slate-800"}`}>Demand Gen</h3>
                      <p className="text-[12px] text-slate-500 leading-snug">Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads</p>
                    </div>
                  ),
                  search: (
                    <div 
                      key="search"
                      onClick={() => setCustomCampaignType("search")}
                      className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                        customCampaignType === "search" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {customCampaignType === "search" && (
                        <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                        </div>
                      )}
                      <div className="flex gap-1.5 mb-1 items-center">
                        <SiGoogleads className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className={`text-sm font-medium ${customCampaignType === "search" ? "text-blue-700" : "text-slate-800"}`}>Search</h3>
                      <p className="text-[12px] text-slate-500 leading-snug">Drive {selectedObjective} on Google Search with text ads</p>
                    </div>
                  ),
                  video: (
                    <div 
                      key="video"
                      onClick={() => setCustomCampaignType("video")}
                      className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                        customCampaignType === "video" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {customCampaignType === "video" && (
                        <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                        </div>
                      )}
                      <div className="flex gap-1.5 mb-1 items-center">
                        <Play className="w-4 h-4 text-red-500 fill-red-500" />
                        <Layout className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className={`text-sm font-medium ${customCampaignType === "video" ? "text-blue-700" : "text-slate-800"}`}>Video</h3>
                      <p className="text-[12px] text-slate-500 leading-snug">Drive {selectedObjective} on YouTube with your video ads</p>
                    </div>
                  ),
                  display: (
                    <div 
                      key="display"
                      onClick={() => setCustomCampaignType("display")}
                      className={`relative p-4 border rounded-md cursor-pointer flex flex-col gap-2 min-h-[140px] transition-all ${
                        customCampaignType === "display" ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {customCampaignType === "display" && (
                        <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                        </div>
                      )}
                      <div className="flex gap-1.5 mb-1 items-center">
                        <Play className="w-4 h-4 text-red-500 fill-red-500" />
                        <Mail className="w-4 h-4 text-red-500" />
                        <Layout className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className={`text-sm font-medium ${customCampaignType === "display" ? "text-blue-700" : "text-slate-800"}`}>Display</h3>
                      <p className="text-[12px] text-slate-500 leading-snug">Reach potential customers across 3 million sites and apps with your creative</p>
                    </div>
                  )
                };

                const order = selectedObjective === "sales" 
                  ? ["pmax", "shopping", "demandgen", "search", "video", "display"]
                  : ["pmax", "search", "demandgen", "video", "display", "shopping"];

                return order.map(id => blocks[id]);
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Custom Panel: Video Subtype */}
      {selectedObjective === "custom" && customCampaignType === "video" && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-4">
          <div className="bg-white px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">Select a campaign subtype</h2>
          </div>
          <div className="p-6 flex flex-col gap-3">
            
            {/* 1. Video Views */}
            <div 
              onClick={() => setVideoSubtype("views")}
              className={`relative p-4 border rounded cursor-pointer transition-colors ${
                videoSubtype === "views" ? "border-blue-600 bg-[#f8fbff]" : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
            >
              {videoSubtype === "views" && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={videoSubtype === "views"} 
                  readOnly
                  className="mt-1 w-4 h-4 text-blue-600" 
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800 flex items-center gap-1">
                    Video views <Info className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                    Get TrueView views and engagement from people who are more likely to consider your products or brand. You only pay when someone chooses to watch your ad. Your ads can show as skippable in-stream, in-feed, and Shorts ads. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                  </div>
                </div>
              </label>
            </div>

            {/* 2. Video Reach Group */}
            <div className={`relative p-4 border rounded transition-colors ${
              ["efficient_reach", "non_skippable", "target_freq"].includes(videoSubtype) ? "border-blue-600 bg-[#f8fbff]" : "border-slate-300 bg-white"
            }`}>
              {["efficient_reach", "non_skippable", "target_freq"].includes(videoSubtype) && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
              )}
              <div className="text-[13px] text-slate-800 mb-3">Video reach</div>
              <div className="flex flex-col gap-4 ml-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={videoSubtype === "efficient_reach"} 
                    onChange={() => setVideoSubtype("efficient_reach")}
                    className="mt-1 w-4 h-4 text-blue-600" 
                  />
                  <div>
                    <div className="text-[13px] font-medium text-slate-800">Efficient reach</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Get the most reach for your budget using bumper, skippable in-stream, in-feed, and Shorts ads. <a href="#" className="text-blue-600 hover:underline">Learn more</a></div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={videoSubtype === "non_skippable"} 
                    onChange={() => setVideoSubtype("non_skippable")}
                    className="mt-1 w-4 h-4 text-blue-600" 
                  />
                  <div>
                    <div className="text-[13px] font-medium text-slate-800">Non-skippable reach</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Reach people using bumper, standard non-skippable, and 30-second non-skippable in-stream ads. <a href="#" className="text-blue-600 hover:underline">Learn more</a></div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={videoSubtype === "target_freq"} 
                    onChange={() => setVideoSubtype("target_freq")}
                    className="mt-1 w-4 h-4 text-blue-600" 
                  />
                  <div>
                    <div className="text-[13px] font-medium text-slate-800">Target frequency</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Reach the same people multiple times using bumper, skippable in-stream, non-skippable in-stream, in-feed, and Shorts ads. <a href="#" className="text-blue-600 hover:underline">Learn more</a></div>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Drive conversions */}
            <div 
              onClick={() => setVideoSubtype("conversions")}
              className={`relative p-4 border rounded cursor-pointer transition-colors ${
                videoSubtype === "conversions" ? "border-blue-600 bg-[#f8fbff]" : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
            >
              {videoSubtype === "conversions" && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={videoSubtype === "conversions"} 
                  readOnly
                  className="mt-1 w-4 h-4 text-blue-600" 
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Drive conversions</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">
                    Get more conversions with video ads designed to encourage valuable interactions with your business <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                  </div>
                </div>
              </label>
            </div>

            {/* 4. Ad sequence */}
            <div 
              onClick={() => setVideoSubtype("ad_sequence")}
              className={`relative p-4 border rounded cursor-pointer transition-colors ${
                videoSubtype === "ad_sequence" ? "border-blue-600 bg-[#f8fbff]" : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
            >
              {videoSubtype === "ad_sequence" && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={videoSubtype === "ad_sequence"} 
                  readOnly
                  className="mt-1 w-4 h-4 text-blue-600" 
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Ad sequence</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">
                    Tell your story by showing ads in a particular sequence to individual viewers with skippable in-stream ads, non-skippable in-stream ads, bumper ads, or a mix. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                  </div>
                </div>
              </label>
            </div>

            {/* 5. Audio reach */}
            <div 
              onClick={() => setVideoSubtype("audio")}
              className={`relative p-4 border rounded cursor-pointer transition-colors ${
                videoSubtype === "audio" ? "border-blue-600 bg-[#f8fbff]" : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
            >
              {videoSubtype === "audio" && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={videoSubtype === "audio"} 
                  readOnly
                  className="mt-1 w-4 h-4 text-blue-600" 
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800">Audio reach</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">
                    Reach people while they're listening to content on YouTube. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                  </div>
                </div>
              </label>
            </div>

            {/* 6. YouTube subscriptions */}
            <div 
              onClick={() => setVideoSubtype("subs")}
              className={`relative p-4 border rounded cursor-pointer transition-colors ${
                videoSubtype === "subs" ? "border-blue-600 bg-[#f8fbff]" : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
            >
              {videoSubtype === "subs" && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={videoSubtype === "subs"} 
                  readOnly
                  className="mt-1 w-4 h-4 text-blue-600" 
                />
                <div>
                  <div className="text-[13px] font-medium text-slate-800 flex items-center gap-2">
                    YouTube subscriptions and engagements 
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">NEW</span>
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5">
                    Get subscriptions and drive engagement on your YouTube channel with video ads designed to encourage valuable interactions. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                  </div>
                </div>
              </label>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Panel: YouTube Reach */}
      {selectedObjective === "youtube" && (
        <div className="flex flex-col gap-4 mb-6 order-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Choose a campaign goal</h2>
            </div>
            
            <div className="p-6 pb-2">
              <p className="text-[13px] text-slate-500 mb-6">Each goal determines which metrics the campaign is optimized to deliver.</p>
              
              <div className="flex gap-8">
                {/* Left Side: Radio Buttons */}
                <div className="flex-1 flex flex-col gap-5">
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="yt_goal" 
                        checked={youtubeGoal === "views"} 
                        onChange={() => setYoutubeGoal("views")}
                        className="mt-1 w-4 h-4 text-blue-600" 
                      />
                      <div>
                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-800">
                          Video views <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-medium">Suggested</span>
                        </div>
                        <div className="text-[12px] text-slate-500">Get people to watch your video ads</div>
                      </div>
                    </label>
                    {youtubeGoal === "views" && (
                      <div className="ml-7 mt-3 bg-blue-50/50 border border-blue-100 rounded p-4">
                        <div className="flex gap-3">
                          <Info className="w-5 h-5 text-blue-600 shrink-0" />
                          <div>
                            <div className="text-[13px] font-medium text-slate-800 mb-1">Build product consideration with TrueView views</div>
                            <div className="text-[12px] text-slate-600 mb-2 leading-relaxed">
                              People who choose to watch or engage with your video ads are more likely to search for your product or brand and actively consider it as they get closer to making a purchase.
                            </div>
                            <a href="#" className="text-[13px] text-blue-600 hover:underline font-medium">Learn more</a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="yt_goal" 
                      checked={youtubeGoal === "reach"} 
                      onChange={() => setYoutubeGoal("reach")}
                      className="mt-1 w-4 h-4 text-blue-600" 
                    />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800">Reach</div>
                      <div className="text-[12px] text-slate-500">Reach the maximum number of people</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="yt_goal" 
                      checked={youtubeGoal === "subs"} 
                      onChange={() => setYoutubeGoal("subs")}
                      className="mt-1 w-4 h-4 text-blue-600" 
                    />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800">YouTube subscriptions and engagements</div>
                      <div className="text-[12px] text-slate-500">Get people to subscribe and engage with your YouTube channel</div>
                    </div>
                  </label>
                </div>

                {/* Right Side: Info Panel */}
                <div className="w-[340px] shrink-0 border-l border-slate-200 pl-6 py-2">
                  <div className="text-[13px] font-medium text-slate-800 mb-3">Good for</div>
                  <div className="flex flex-col gap-3 mb-6">
                    {youtubeGoal === "views" && (
                      <>
                        <div className="flex gap-2 text-[12px] text-slate-600">
                          <Users className="w-4 h-4 text-slate-500 shrink-0" />
                          Finding people who are more likely to be interested in your product or brand, and consider it when deciding to make a purchase
                        </div>
                        <div className="flex gap-2 text-[12px] text-slate-600">
                          <Search className="w-4 h-4 text-slate-500 shrink-0" />
                          Increasing the number of online searches for your product or brand
                        </div>
                        <div className="flex gap-2 text-[12px] text-slate-600">
                          <MonitorPlay className="w-4 h-4 text-slate-500 shrink-0" />
                          Getting more people to watch your entire video ad
                        </div>
                      </>
                    )}
                    {youtubeGoal === "subs" && (
                      <>
                        <div className="flex gap-2 text-[12px] text-slate-600">
                          <Users className="w-4 h-4 text-slate-500 shrink-0" />
                          Finding people who are more likely to engage with your YouTube channel
                        </div>
                        <div className="flex gap-2 text-[12px] text-slate-600">
                          <MonitorPlay className="w-4 h-4 text-slate-500 shrink-0" />
                          Getting more YouTube channel subscribers
                        </div>
                      </>
                    )}
                    {youtubeGoal === "reach" && (
                      <>
                        <div className="flex gap-2 text-[12px] text-slate-600">
                          <Volume2 className="w-4 h-4 text-slate-500 shrink-0" />
                          Getting more people familiar with your product or brand
                        </div>
                        <div className="flex gap-2 text-[12px] text-slate-600">
                          <Users className="w-4 h-4 text-slate-500 shrink-0" />
                          Reaching the maximum number of unique users at your desired frequency
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-[13px] font-medium text-slate-800 mb-2">Optimized to get more</div>
                  <ul className="list-disc pl-5 text-[12px] text-slate-600 mb-6 flex flex-col gap-1">
                    {youtubeGoal === "views" && <li><span className="border-b border-dashed border-slate-400">TrueView views</span></li>}
                    {youtubeGoal === "subs" && (
                      <>
                        <li><span className="border-b border-dashed border-slate-400">YouTube channel subscriptions</span></li>
                        <li><span className="border-b border-dashed border-slate-400">YouTube follow-on views</span></li>
                      </>
                    )}
                    {youtubeGoal === "reach" && (
                      <>
                        <li><span className="border-b border-dashed border-slate-400">Unique users</span></li>
                        <li><span className="border-b border-dashed border-slate-400">Impressions</span></li>
                      </>
                    )}
                  </ul>

                  <a href="#" className="text-[13px] text-blue-600 hover:underline">Compare goals</a>
                </div>
              </div>

              {youtubeGoal === "subs" && (
                <div className="mt-6 bg-[#fdeded] border border-[#f5c6c6] rounded px-4 py-3 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[13px] text-slate-800">
                    <TriangleAlert className="w-4 h-4 text-red-600" />
                    To use YouTube subscriptions and engagements, first link a YouTube channel to your Google Ads account
                  </div>
                  <button className="text-[13px] font-medium text-slate-800 hover:bg-black/5 px-3 py-1.5 rounded transition-colors">
                    Link channel
                  </button>
                </div>
              )}
            </div>
            {/* Add a tiny padding at bottom if no alert to match spacing */}
            {youtubeGoal !== "subs" && <div className="h-4"></div>}
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Select a campaign type</h2>
            </div>
            <div className="p-6 flex gap-4">
              
              {/* Type: Video (Always shown for Views/Reach, not for Subs) */}
              {(youtubeGoal === "views" || youtubeGoal === "reach") && (
                <div className="relative p-4 border border-blue-600 rounded-md bg-blue-50/30 w-[240px] shrink-0">
                  <div className="absolute -top-2 -right-2 bg-white rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                  </div>
                  <div className="flex gap-2 mb-2 items-center">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-blue-700 mb-1">Video</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Reach viewers on YouTube and get conversions</p>
                </div>
              )}

              {/* Type: Demand Gen (Only for Subs) */}
              {youtubeGoal === "subs" && (
                <div className="relative p-4 border border-blue-600 rounded-md bg-blue-50/30 w-[240px] shrink-0">
                  <div className="absolute -top-2 -right-2 bg-white rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-white fill-blue-600" />
                  </div>
                  <div className="flex gap-1.5 mb-2 items-center">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Mail className="w-4 h-4 text-red-500" />
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-blue-700 mb-1">Demand Gen</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads</p>
                </div>
              )}

              {/* Type: Display (Only for Reach) */}
              {youtubeGoal === "reach" && (
                <div className="relative p-4 border border-slate-200 rounded-md bg-white hover:bg-slate-50 cursor-pointer w-[240px] shrink-0">
                  <div className="flex gap-1.5 mb-2 items-center">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <Mail className="w-4 h-4 text-red-500" />
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <Layout className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-800 mb-1">Display</h3>
                  <p className="text-[12px] text-slate-500 leading-snug">Reach potential customers across 3 million sites and apps with your creative</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Add Products & Campaign Name Panels */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Campaign settings</h2>
            <div className="flex flex-col gap-4">
               <div>
                 <label className="text-[13px] font-medium text-slate-800 block mb-1">Campaign name</label>
                 <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="Enter campaign name" />
               </div>
               <div>
                 <label className="text-[13px] font-medium text-slate-800 block mb-1">Add products</label>
                 <button className="text-[13px] text-blue-600 hover:underline font-medium">+ Add products</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Bottom Panels (Guided flows after Continue OR Custom) */}
      {(selectedObjective === "custom" || (hasContinued && ["sales", "leads", "traffic"].includes(selectedObjective || ""))) && (
        <>
          {/* Shared Panel: Add Products (Pmax / Shopping) */}
          {["pmax", "shopping"].includes(customCampaignType) && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-6">
              <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer">
                <h2 className="text-sm font-semibold text-slate-800">Add products to this campaign</h2>
                <ChevronUp className="w-5 h-5 text-slate-500" />
              </div>
              <div className="p-6 pt-4">
                {customCampaignType === "pmax" && (
                  <label className="flex items-center gap-3 cursor-pointer mb-5">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-[13px] text-slate-800">Advertise products from a Merchant Center account</span>
                  </label>
                )}
                
                <div className={customCampaignType === "pmax" ? "ml-7" : ""}>
                  <div className="text-[13px] text-slate-800 mb-2 flex items-center gap-1">
                    Select a Merchant Center account <Info className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="border border-slate-300 rounded max-w-[400px] flex items-center justify-between p-2.5 mb-4 bg-white">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#4285f4] rounded p-1"><Layout className="w-3 h-3 text-white" /></div>
                      <span className="text-[13px] font-medium text-slate-800">5513827312 - kashmirorganicnuts</span>
                    </div>
                    <X className="w-4 h-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="text-[12px] text-slate-600">
                    All products from the selected account will be available to advertise in this campaign. <a href="#" className="text-blue-600 hover:underline">Select a feed label</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shared Panel: Ways to reach goal (Search) */}
          {customCampaignType === "search" && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-6">
              <div className="p-6 pb-5">
                <div className="text-[13px] font-medium text-slate-800 flex items-center gap-1 mb-4">
                  Select the ways you'd like to reach your goal <Info className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer w-max">
                      <input 
                        type="checkbox" 
                        checked={reachGoals.website}
                        onChange={(e) => setReachGoals(prev => ({ ...prev, website: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                      />
                      <span className="text-[13px] text-slate-800">Website visits</span>
                    </label>
                    {reachGoals.website && (
                      <div className="ml-7 mt-1 relative w-full max-w-[400px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Link2 className="w-4 h-4 text-slate-500" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Your business's website"
                          className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer w-max">
                      <input 
                        type="checkbox" 
                        checked={reachGoals.phone}
                        onChange={(e) => setReachGoals(prev => ({ ...prev, phone: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                      />
                      <span className="text-[13px] text-slate-800">Phone calls</span>
                    </label>
                    {reachGoals.phone && (
                      <div className="ml-7 flex gap-3 mt-1 items-start">
                        <div className="relative">
                          <select className="appearance-none border border-slate-300 rounded px-3 py-2 pr-8 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
                            <option>United States</option>
                            <option>India</option>
                            <option>United Kingdom</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 w-full max-w-[200px]">
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Phone number"
                              className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <Info className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500">Example: (201) 555-0123</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-3 cursor-pointer w-max">
                      <input 
                        type="checkbox" 
                        checked={reachGoals.store}
                        onChange={(e) => setReachGoals(prev => ({ ...prev, store: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                      />
                      <span className="text-[13px] text-slate-800">Store visits</span>
                    </label>
                    {reachGoals.store && (
                      <div className="ml-7 text-[12px] text-slate-500 mt-0.5">
                        Enter location on the next step
                      </div>
                    )}
                  </div>

                  {selectedObjective !== "sales" && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-3 cursor-pointer w-max">
                          <input 
                            type="checkbox" 
                            checked={reachGoals.leads}
                            onChange={(e) => setReachGoals(prev => ({ ...prev, leads: e.target.checked }))}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                          />
                          <span className="text-[13px] text-slate-800">Lead form submissions</span>
                        </label>
                        {reachGoals.leads && (
                          <div className="ml-7 text-[12px] text-slate-500 mt-0.5">
                            Add lead form on the next step
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-3 cursor-pointer w-max">
                          <input 
                            type="checkbox" 
                            checked={reachGoals.messages}
                            onChange={(e) => setReachGoals(prev => ({ ...prev, messages: e.target.checked }))}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                          />
                          <span className="text-[13px] text-slate-800">Messages from your ads</span>
                        </label>
                        {reachGoals.messages && (
                          <div className="ml-7 text-[12px] text-slate-500 mt-0.5">
                            Add message asset on the next step
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shared Panel: Display Website */}
          {customCampaignType === "display" && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-6">
              <div className="p-6">
                <div className="text-[13px] font-medium text-slate-800 flex items-center gap-1 mb-4">
                  This is the web page people will go to after clicking your ad <Info className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="relative w-full max-w-[400px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Your business's website"
                    className="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shared Panel: Draft / Campaign Name (PMax, Search, Display) */}
          {["pmax", "search", "display"].includes(customCampaignType) && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-7">
              <div className="bg-white px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800">Would you like to resume from an existing campaign draft?</h2>
              </div>
              <div className="p-6">
                <p className="text-[13px] text-slate-500 mb-6">
                  Your account has existing campaign drafts with the same campaign type, allowing you to continue where you last left off setting up your campaign
                </p>

                <div className="flex flex-col gap-5">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input 
                        type="radio" 
                        name="shared_draft" 
                        checked={resumeDraft} 
                        onChange={() => setResumeDraft(true)}
                        className="text-blue-600 w-4 h-4" 
                      />
                      <span className="text-[13px] font-medium text-slate-800">Continue from an existing campaign draft</span>
                    </label>
                    {resumeDraft && (
                      <div className="relative z-10">
                        <div 
                          className={`ml-7 border ${isDraftDropdownOpen ? "border-blue-600 rounded-t-md border-b-white" : "border-slate-300 rounded-md"} p-3 flex items-center justify-between max-w-[400px] cursor-pointer hover:bg-slate-50`}
                          onClick={() => setIsDraftDropdownOpen(!isDraftDropdownOpen)}
                        >
                          <div className="flex gap-3 items-center">
                            <div className="bg-slate-100 p-1.5 rounded">
                              {customCampaignType === "display" ? <Layout className="w-4 h-4 text-slate-500"/> : <FileClock className="w-4 h-4 text-slate-500"/>}
                            </div>
                            <div>
                              <div className="text-[13px] font-medium text-slate-800">
                                {customCampaignType === "search" ? "Search-5" : customCampaignType === "display" ? "Display-4" : "Performance Max-9"}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Last modified {customCampaignType === "search" ? "8 days ago" : customCampaignType === "display" ? "8 days ago" : "less than a day ago"} • {customCampaignType === "search" ? "Search" : customCampaignType === "display" ? "Display" : "Performance Max"}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDraftDropdownOpen ? "rotate-180" : ""}`} />
                        </div>
                        
                        {isDraftDropdownOpen && (
                          <div className="absolute top-[100%] left-7 w-full max-w-[400px] bg-white border border-slate-200 shadow-xl rounded-b-md overflow-hidden">
                            {customCampaignType === "search" ? (
                              <>
                                <div className="p-3 flex gap-3 items-center cursor-pointer bg-[#e8f0fe]">
                                  <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Search-5</div>
                                    <div className="text-[11px] text-slate-500">Last modified 8 days ago • Search</div>
                                  </div>
                                </div>
                                <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-slate-50">
                                  <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Sales-Search-4</div>
                                    <div className="text-[11px] text-slate-500">Last modified 12 days ago • Search</div>
                                  </div>
                                </div>
                              </>
                            ) : customCampaignType === "display" ? (
                              <>
                                <div className="p-3 flex gap-3 items-center cursor-pointer bg-[#e8f0fe]">
                                  <div className="bg-slate-100 p-1.5 rounded"><Layout className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Display-4</div>
                                    <div className="text-[11px] text-slate-500">Last modified 8 days ago • Display</div>
                                  </div>
                                </div>
                                <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-slate-50">
                                  <div className="bg-slate-100 p-1.5 rounded"><Layout className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Sales-Display-2</div>
                                    <div className="text-[11px] text-slate-500">Last modified 15 days ago • Display</div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="p-3 flex gap-3 items-center cursor-pointer bg-[#e8f0fe]">
                                  <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Performance Max-9</div>
                                    <div className="text-[11px] text-slate-500">Last modified less than a day ago • Performance Max</div>
                                  </div>
                                </div>
                                <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-slate-50 border-t border-slate-100">
                                  <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Sales-Performance Max-8</div>
                                    <div className="text-[11px] text-slate-500">Last modified less than a day ago • Performance Max</div>
                                  </div>
                                </div>
                                <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-slate-50 border-t border-slate-100">
                                  <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Performance Max-7</div>
                                    <div className="text-[11px] text-slate-500">Last modified 8 days ago • Performance Max</div>
                                  </div>
                                </div>
                                <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-slate-50 border-t border-slate-100">
                                  <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Leads-Performance Max-6</div>
                                    <div className="text-[11px] text-slate-500">Last modified 8 days ago • Performance Max</div>
                                  </div>
                                </div>
                                <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-slate-50 border-t border-slate-100">
                                  <div className="bg-slate-100 p-1.5 rounded"><FileClock className="w-4 h-4 text-slate-500"/></div>
                                  <div>
                                    <div className="text-[13px] font-medium text-slate-800">Sales-Performance Max-1</div>
                                    <div className="text-[11px] text-slate-500">Last modified 318 days ago • Performance Max</div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="shared_draft" 
                        checked={!resumeDraft}
                        onChange={() => setResumeDraft(false)}
                        className="text-blue-600 w-4 h-4" 
                      />
                      <span className="text-[13px] text-slate-800">Create a new campaign</span>
                    </label>
                    {!resumeDraft && (
                      <div className="ml-7 mt-4 relative">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-[11px] text-slate-500">Campaign name*</label>
                        <input 
                          type="text" 
                          defaultValue={`${selectedObjective && selectedObjective !== "custom" ? selectedObjective.charAt(0).toUpperCase() + selectedObjective.slice(1) + "-" : ""}${customCampaignType === "search" ? "Search" : "Performance Max"}-10`}
                          key={customCampaignType + selectedObjective}
                          className="w-full max-w-[400px] border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shared Panel: Campaign Name (Shopping or App) */}
          {["shopping", "app"].includes(customCampaignType) && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-7">
              <div className="bg-white px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800">Campaign name</h2>
              </div>
              <div className="p-6">
                <input 
                  type="text" 
                  defaultValue={customCampaignType === "app" ? "App-1" : (selectedObjective === "custom" ? "Shopping-1" : "Sales-Shopping-1")}
                  key={customCampaignType + selectedObjective}
                  className="w-full max-w-[400px] border border-slate-300 rounded px-3 py-2.5 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          )}

          {/* Guided Panel: Video Info */}
          {customCampaignType === "video" && selectedObjective !== "custom" && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden mb-6 order-7 p-6">
               <div className="text-[13px] text-slate-600 flex items-center">
                 Get more conversions with video ads designed to encourage valuable interactions with your business <a href="#" className="text-blue-600 hover:underline ml-1">Learn more</a>
               </div>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 order-10">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded">Cancel</button>
        <button 
          onClick={() => {
            if (selectedObjective === "custom") {
              setWizardMode(true);
            } else if (hasContinued) {
              setWizardMode(true);
            } else {
              setHasContinued(true);
            }
          }}
          className={`px-6 py-2 rounded text-sm font-medium transition-colors ${
            selectedObjective 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>

      {/* Confirmation Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] overflow-hidden flex flex-col">
            <div className="p-6">
              <h2 className="text-[20px] font-normal text-slate-800 mb-4">Go to your Conversions page?</h2>
              <div className="flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed">
                <p>If you leave your campaign, you'll need to start over after you're done editing your conversion goals and/or actions.</p>
                <p>Note: you can always edit your conversion goals/actions after you finish campaign creation on your Conversions page.</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-end gap-4 mt-2">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-4 py-2 rounded transition-colors"
              >
                Go to conversions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
