import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, HelpCircle, Link as LinkIcon, PenLine, Settings, Info, Wand2, Image as ImageIcon, Video, Plus, MoreVertical, Trash2, Edit2, Sparkles } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { uploadAssetBinary } from "../API/campaignManagementApi";

interface AssetGroupStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
}

export default function GoogleAdsAssetGroupStep({ onNext, activeSubStep, onSubStepChange }: AssetGroupStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const initialHeadlines = payload.assets?.filter(a => a.type === "HEADLINE").map(a => a.text) || [];
  const initialLongHeadlines = payload.assets?.filter(a => a.type === "LONG_HEADLINE").map(a => a.text) || [];
  const initialDescriptions = payload.assets?.filter(a => a.type === "DESCRIPTION").map(a => a.text) || [];
  const initialBusinessName = payload.assets?.find(a => a.type === "BUSINESS_NAME")?.text || "Kashmir Organic Nuts";

  const [showListingGroupsPanel, setShowListingGroupsPanel] = useState(false);
  const [listingGroupSelection, setListingGroupSelection] = useState("all");
  const [showLogosPanel, setShowLogosPanel] = useState(false);
  const [isAdditionalSignalsExpanded, setIsAdditionalSignalsExpanded] = useState(false);
  const [expandedAssetOptSection, setExpandedAssetOptSection] = useState<string | null>(null);
  const [isMoreAssetTypesExpanded, setIsMoreAssetTypesExpanded] = useState(true);
  const [isMoreOptionsExpanded, setIsMoreOptionsExpanded] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<'Search' | 'Display' | 'YouTube' | 'Discover'>('Search');
  const [showSharePreviewModal, setShowSharePreviewModal] = useState(false);
  const [showFullPreviewAds, setShowFullPreviewAds] = useState(false);
  const [fullPreviewTab, setFullPreviewTab] = useState<'All' | 'Search' | 'Display' | 'YouTube' | 'Discover' | 'Gmail'>('Display');

  const [assetGroupName, setAssetGroupName] = useState(payload.adGroups?.[0]?.name || "Asset Group 1");
  const [audienceSignals] = useState<any[]>(payload.adGroups?.[0]?.audienceSignals || []);
  const [assets, setAssets] = useState<any[]>(payload.assets || []);

  // Text Assets
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [finalUrl, setFinalUrl] = useState(payload.ads?.[0]?.finalUrls?.[0] || "https://kashmirorganicnuts.com");
  const [headlines, setHeadlines] = useState<string[]>(Array.from({ length: 5 }, (_, i) => initialHeadlines[i] || ""));
  const [longHeadlines, setLongHeadlines] = useState<string[]>(Array.from({ length: 5 }, (_, i) => initialLongHeadlines[i] || ""));
  const [descriptions, setDescriptions] = useState<string[]>(Array.from({ length: 4 }, (_, i) => initialDescriptions[i] || ""));

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAssetBinary(payload.clientId || 1, formData);
      if (res && res.success) {
        setAssets(prev => [...prev, {
          assetId: res.assetId,
          assetType: type,
          assetName: file.name,
          previewUrl: res.assetUrl
        }]);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  // Validation
  const filledHeadlinesCount = headlines.filter(h => h.trim().length > 0).length;
  const filledLongHeadlinesCount = longHeadlines.filter(h => h.trim().length > 0).length;
  const filledDescriptionsCount = descriptions.filter(d => d.trim().length > 0).length;
  const hasBusinessName = businessName.trim().length > 0;
  const hasFinalUrl = finalUrl.trim().length > 0;

  const adStrength = 
    (filledHeadlinesCount >= 3 && filledDescriptionsCount >= 2 && filledLongHeadlinesCount >= 1 && hasBusinessName && hasFinalUrl)
      ? "Good"
      : "Poor";

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (!onSubStepChange) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const activeId = visibleEntries[0].target.id.replace('panel-', '');
          onSubStepChange(activeId);
        }
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    
    const panels = document.querySelectorAll('.asset-panel-section');
    panels.forEach(p => observer.observe(p));
    
    return () => observer.disconnect();
  }, [onSubStepChange]);

  useEffect(() => {
    const textAssets = [
      ...headlines.filter(h => h.trim().length > 0).map(t => ({ type: "HEADLINE", text: t })),
      ...longHeadlines.filter(h => h.trim().length > 0).map(t => ({ type: "LONG_HEADLINE", text: t })),
      ...descriptions.filter(d => d.trim().length > 0).map(t => ({ type: "DESCRIPTION", text: t })),
    ];
    if (businessName.trim()) {
      textAssets.push({ type: "BUSINESS_NAME", text: businessName });
    }

    updatePayload({
      adGroups: [{ 
        name: assetGroupName,
        audienceSignals: audienceSignals
      }] as any,
      assets: [...assets, ...textAssets] as any,
      ads: [
        {
          type: "PERFORMANCE_MAX_AD",
          finalUrls: finalUrl ? [finalUrl] : [],
        } as any
      ]
    });
  }, [assetGroupName, audienceSignals, assets, headlines, longHeadlines, descriptions, businessName, finalUrl, updatePayload]);

  const getPanelClass = (id: string) => {
    return `asset-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`;
  };

  const getHeaderClass = (id: string) => {
    return `text-[14px] ${activeSubStep === id ? 'text-blue-700 font-medium' : 'text-slate-800'}`;
  };

  return (
    <div className="flex flex-col h-full w-full pb-20 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] text-slate-800 font-normal mb-2">Asset group</h1>
        <p className="text-[13px] text-slate-600 max-w-[800px] leading-relaxed">
          Show high quality ads to the right people. Start by adding your assets, the building blocks of every ad. Google will test different combinations to create high performing ads across the formats and networks that work best for your goals and the audiences you want to reach.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* Name */}
        <div id="panel-name" onClick={() => onSubStepChange?.('name')} className={getPanelClass('name')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('name')}>Asset group name</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <input 
              type="text" 
              value={assetGroupName}
              onChange={(e) => setAssetGroupName(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-[13px] w-[300px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Listing groups */}
        <div id="panel-listing-groups" onClick={() => onSubStepChange?.('listing-groups')} className={getPanelClass('listing-groups')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('listing-groups')}>Listing groups</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="text-[13px] text-slate-800 mb-1">Merchant center account: 6613827812 - kashmirorganicnuts</div>
            <div className="text-[12px] text-slate-500 mb-6">
              Choose which products to show in your ads. Some of your ads will use images, headlines and descriptions from Merchant Center.
            </div>
            
            <div 
              className="flex items-center gap-2 cursor-pointer group w-fit"
              onClick={(e) => { e.stopPropagation(); setShowListingGroupsPanel(true); }}
            >
              <span className="text-[13px] text-slate-700 group-hover:text-blue-700 transition-colors">All products</span>
              <PenLine className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
            </div>
          </div>
        </div>

        {/* Final URL */}
        <div id="panel-final-url" onClick={() => onSubStepChange?.('final-url')} className={getPanelClass('final-url')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('final-url')}>Final URL</h2>
             <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="relative max-w-[600px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={finalUrl}
                onChange={(e) => setFinalUrl(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Brand guidelines */}
        <div id="panel-brand-guidelines" onClick={() => onSubStepChange?.('brand-guidelines')} className={getPanelClass('brand-guidelines')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('brand-guidelines')}>Brand guidelines</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="text-[12px] text-slate-800 mb-6">
              Control how your brand appears in ads for this campaign. <a href="#" className="text-blue-600 hover:underline">Learn more about brand guidelines</a>
            </div>

            <div className="flex flex-col gap-6">
              {/* Business Name */}
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-[13px] font-medium text-slate-800">Business name</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                </label>
                <div className="relative max-w-[500px]">
                  <input 
                    type="text"
                    value={businessName}
                    maxLength={25}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="absolute -bottom-5 left-0 text-[11px] text-slate-500">{businessName ? "" : "Required"}</div>
                  <div className="absolute -bottom-5 right-0 text-[11px] text-slate-500">{businessName.length} / 25</div>
                </div>
              </div>

              {/* Logos */}
              <div className="mt-4">
                <label className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-[13px] font-medium text-slate-800">Logos 3/5</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                </label>
                
                <div className="flex gap-2 mb-3">
                  <div className="w-10 h-10 border border-slate-200 rounded-md overflow-hidden bg-black flex items-center justify-center shrink-0">
                    <div className="w-6 h-6 bg-red-800/40 rounded-full"></div> {/* Placeholder logo */}
                  </div>
                  <div className="w-10 h-10 border border-slate-200 rounded-md overflow-hidden bg-white flex items-center justify-center shrink-0">
                    <div className="w-6 h-6 bg-red-800/40 clip-star"></div> {/* Placeholder logo */}
                  </div>
                  <div className="h-10 border border-slate-200 rounded-md overflow-hidden bg-white flex items-center justify-center shrink-0 px-2">
                    <div className="text-[10px] font-bold text-red-900 leading-none">KASHMIR ORGANIC</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[13px]">
                  <label className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline cursor-pointer w-fit mb-2">
                    <Plus className="w-4 h-4" /> Add Logo
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(e, "LOGO")} />
                  </label>
                  <div 
                    className="flex items-center gap-1.5 text-blue-600 cursor-pointer hover:underline text-[13px] font-medium w-fit mb-2"
                    onClick={(e) => { e.stopPropagation(); setShowLogosPanel(true); }}
                  >
                    <PenLine className="w-4 h-4" /> Edit
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 mt-4 max-w-[600px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="text-[13px] font-medium text-slate-800">Suggested logos</div>
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-4">
                      <span 
                        className="text-[13px] text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={(e) => { e.stopPropagation(); setShowLogosPanel(true); }}
                      >
                        View all
                      </span>
                      <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-24 h-24 border border-slate-200 rounded bg-[#f8f9fa] flex items-center justify-center relative group cursor-pointer overflow-hidden">
                       <div className="absolute inset-0 flex items-center justify-center p-2">
                         <div className="w-full h-full border-2 border-[#b0211a] rounded flex items-center justify-center transform rotate-12 bg-white">
                            <span className="text-[#b0211a] font-bold text-xs text-center leading-tight">KASHMIR<br/>ORGANIC<br/>Nuts</span>
                         </div>
                       </div>
                    </div>
                    <button 
                      className="border border-slate-300 rounded px-4 py-1.5 text-[13px] text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 h-fit"
                      onClick={(e) => { e.stopPropagation(); setShowLogosPanel(true); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      View more
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center cursor-pointer group">
              <div>
                <div className="text-[13px] text-slate-800 font-medium">More options</div>
                <div className="text-[12px] text-slate-500">Add visual and text guidelines</div>
              </div>
              <PenLine className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
            </div>
          </div>
        </div>

        {/* Assets Panel - Complex split layout */}
        <div id="panel-assets" onClick={() => onSubStepChange?.('assets')} className={getPanelClass('assets')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('assets')}>Assets</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            {/* Sub-header info */}
            <div className="flex items-center justify-between mb-4 text-[13px] text-slate-600">
              <span>Headlines and descriptions generated based on your final url, products and services</span>
              <div className="flex gap-3">
                <button className="text-blue-600 font-medium hover:underline">Clear All</button>
                <button className="text-blue-600 font-medium hover:underline">Refine</button>
              </div>
            </div>

            {/* Ad strength bar */}
            <div className="bg-[#e8f0fe] rounded-md px-4 py-3 flex items-center gap-4 mb-6 text-[12px]">
              <div className="flex items-center gap-2 shrink-0">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">Advertisers who have Excellent ad strength see an average of 6% more conversions.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                </div>
                <div>
                  <div className="text-slate-800 font-medium">Ad strength</div>
                  <div className={`text-[13px] font-medium ${adStrength === 'Poor' ? 'text-slate-500' : 'text-blue-600'}`}>{adStrength}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 ml-4">
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Images</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" defaultChecked /> Headlines</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" defaultChecked /> Products</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Videos</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Descriptions</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" defaultChecked /> Sitelinks</label>
              </div>
            </div>

            {/* Split layout: Form left, Preview right */}
            <div className="flex gap-6">
              {/* Left column - Form inputs */}
              <div className="flex-1 flex flex-col gap-6 min-w-0">

                {/* Headlines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                      <span className="text-[13px] font-medium text-slate-800">Headline ({filledHeadlinesCount})</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="mb-3">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Headline"
                          value={headlines[i]}
                          maxLength={30}
                          onChange={(e) => {
                            const newH = [...headlines];
                            newH[i] = e.target.value;
                            setHeadlines(newH);
                          }}
                          className="w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="absolute -bottom-4 left-0 text-[11px] text-slate-500">{i < 3 && !headlines[i] ? <span className="text-[#c5221f]">Required</span> : ""}</div>
                        <div className={`absolute -bottom-4 right-0 text-[11px] ${headlines[i].length > 30 ? 'text-[#c5221f]' : 'text-slate-500'}`}>{headlines[i].length} / 30</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 mt-6 text-[13px]">
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Plus className="w-4 h-4" /> Headline
                    </button>
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Wand2 className="w-4 h-4" /> Generate headlines
                    </button>
                  </div>
                </div>

                {/* Long headlines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                      <span className="text-[13px] font-medium text-slate-800">Long headlines ({filledLongHeadlinesCount})</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="mb-3 relative">
                      <input 
                        type="text" 
                        placeholder="Long headline"
                        value={longHeadlines[i]}
                        maxLength={90}
                        onChange={(e) => {
                          const newLH = [...longHeadlines];
                          newLH[i] = e.target.value;
                          setLongHeadlines(newLH);
                        }}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="absolute -bottom-4 left-0 text-[11px] text-slate-500">{i < 1 && !longHeadlines[i] ? <span className="text-[#c5221f]">Required</span> : ""}</div>
                      <div className={`absolute -bottom-4 right-0 text-[11px] ${longHeadlines[i].length > 90 ? 'text-[#c5221f]' : 'text-slate-500'}`}>{longHeadlines[i].length} / 90</div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 mt-6 text-[13px]">
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Plus className="w-4 h-4" /> Long headline
                    </button>
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Wand2 className="w-4 h-4" /> Generate long headlines
                    </button>
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                      <span className="text-[13px] font-medium text-slate-800">Descriptions ({filledDescriptionsCount})</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="mb-3 relative">
                      <input 
                        type="text" 
                        placeholder="Description"
                        value={descriptions[i]}
                        maxLength={90}
                        onChange={(e) => {
                          const newD = [...descriptions];
                          newD[i] = e.target.value;
                          setDescriptions(newD);
                        }}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="absolute -bottom-4 left-0 text-[11px] text-slate-500">{i < 2 && !descriptions[i] ? <span className="text-[#c5221f]">Required</span> : ""}</div>
                      <div className={`absolute -bottom-4 right-0 text-[11px] ${descriptions[i].length > 90 ? 'text-[#c5221f]' : 'text-slate-500'}`}>{descriptions[i].length} / 90</div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 mt-6 text-[13px]">
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Plus className="w-4 h-4" /> Description
                    </button>
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Wand2 className="w-4 h-4" /> Generate descriptions
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                      <span className="text-[13px] font-medium text-slate-800">Images (0)</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                    <div className="flex items-center gap-4 text-[13px]">
                      <label className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline cursor-pointer">
                        <Plus className="w-4 h-4" /> Images
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(e, "IMAGE")} />
                      </label>
                      <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                        <ImageIcon className="w-4 h-4" /> Generate images
                      </button>
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                      <span className="text-[13px] font-medium text-slate-800">Videos (0)</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-center gap-4 text-[13px]">
                      <label className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline cursor-pointer">
                        <Plus className="w-4 h-4" /> Videos
                        <input type="file" className="hidden" accept="video/*" onChange={(e) => handleAssetUpload(e, "VIDEO")} />
                      </label>
                      <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                        <Video className="w-4 h-4" /> Generate videos
                      </button>
                  </div>
                </div>

                {/* Sitelinks */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span className="text-[13px] font-medium text-slate-800">Sitelinks</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-[12px] text-slate-600 mb-3">You have enough sitelinks to reach Excellent ad strength</div>
                  
                  <div className="border border-slate-200 rounded-md mb-4">
                    <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-[13px] text-slate-800">
                        <LinkIcon className="w-4 h-4 text-slate-500" />
                        5 account level sitelinks
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div className="text-[12px] text-slate-600 mb-3">New sitelinks suggested by Google AI for your campaign</div>
                  
                  {/* Sitelink items */}
                  {[
                    { name: "About Us", desc: "Add a description" },
                    { name: "Contact", desc: "Add a description" },
                  ].map((link, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-md mb-2">
                      <div>
                        <div className={`text-[13px] font-medium ${i < 2 ? 'text-blue-600' : 'text-slate-800'}`}>{link.name}</div>
                        <div className="text-[12px] text-slate-500">{link.desc}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                        <button className="p-1.5 hover:bg-slate-100 rounded"><Trash2 className="w-4 h-4 text-slate-500" /></button>
                      </div>
                    </div>
                  ))}
                  {[3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-md mb-2">
                      <div>
                        <div className="text-[13px] text-slate-800">Sitelink {i}</div>
                        <div className="text-[12px] text-slate-500">Recommended</div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-500 cursor-pointer hover:text-blue-600" />
                    </div>
                  ))}

                  <div className="flex items-center gap-1.5 text-blue-600 cursor-pointer hover:underline text-[13px] font-medium w-fit mt-2">
                    <PenLine className="w-4 h-4" /> Edit
                  </div>
                </div>

                {/* Animated clips */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                      <span className="text-[13px] font-medium text-slate-800">Animated clips (0)</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex items-center gap-4 text-[13px]">
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Plus className="w-4 h-4" /> Animated clips
                    </button>
                    <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                      <Video className="w-4 h-4" /> Generate animated clips
                    </button>
                  </div>
                </div>

                {/* Call to action */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span className="text-[13px] font-medium text-slate-800">Call to action</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="w-full max-w-[300px]">
                    <select className="w-full border border-slate-300 rounded text-[13px] text-slate-800 px-3 py-2 outline-none focus:border-blue-500">
                      <option>Automated</option>
                    </select>
                  </div>
                </div>

                {/* More asset types & More options wrapper */}
                <div className="text-[13px] border-t border-slate-200 mt-2 pt-2 -mx-6 px-6">
                  {/* More asset types */}
                  <div 
                    className="flex items-center gap-1.5 text-blue-600 font-medium cursor-pointer hover:bg-slate-50 py-2 -mx-2 px-2 rounded"
                    onClick={() => setIsMoreAssetTypesExpanded(!isMoreAssetTypesExpanded)}
                  >
                    {isMoreAssetTypesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} More asset types (0/7)
                  </div>
                  
                  {isMoreAssetTypesExpanded && (
                    <div className="pb-4">
                      <div className="text-[12px] text-slate-500 ml-6 mb-4 max-w-[400px]">
                        Improve your ad performance and make your ad more interactive by adding more details about your business and website
                      </div>
                      
                      <div className="border-t border-slate-200 -mx-6 divide-y divide-slate-200">
                        {/* Promotions */}
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5 shrink-0"></div>
                            <div>
                              <div className="flex items-center gap-1 text-[13px] text-slate-800">Promotions <HelpCircle className="w-3.5 h-3.5 text-slate-500" /></div>
                              <div className="text-[12px] text-slate-500">Add promotions</div>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        </div>
                        
                        {/* Prices */}
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5 shrink-0"></div>
                            <div>
                              <div className="flex items-center gap-1 text-[13px] text-slate-800">Prices <HelpCircle className="w-3.5 h-3.5 text-slate-500" /></div>
                              <div className="text-[12px] text-slate-500">Add prices</div>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        </div>
                        
                        {/* Calls */}
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5 shrink-0"></div>
                            <div>
                              <div className="flex items-center gap-1 text-[13px] text-slate-800">Calls <HelpCircle className="w-3.5 h-3.5 text-slate-500" /></div>
                              <div className="text-[12px] text-slate-500">Add a phone number</div>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        </div>
                        
                        {/* Messages */}
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-start gap-2">
                              <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5 shrink-0"></div>
                              <div>
                                <div className="flex items-center gap-1 text-[13px] text-slate-800">Messages <HelpCircle className="w-3.5 h-3.5 text-slate-500" /></div>
                                <div className="text-[12px] text-slate-500">Add a message</div>
                              </div>
                            </div>
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          </div>
                          <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline mt-4 ml-6">
                            <Plus className="w-4 h-4" /> Message
                          </button>
                        </div>
                        
                        {/* Structured snippets */}
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5 shrink-0"></div>
                            <div>
                              <div className="flex items-center gap-1 text-[13px] text-slate-800">Structured snippets <HelpCircle className="w-3.5 h-3.5 text-slate-500" /></div>
                              <div className="text-[12px] text-slate-500">Add snippets of text</div>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        </div>

                        {/* Lead forms */}
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5 shrink-0"></div>
                            <div>
                              <div className="flex items-center gap-1 text-[13px] text-slate-800">Lead forms <HelpCircle className="w-3.5 h-3.5 text-slate-500" /></div>
                              <div className="text-[12px] text-slate-500">Add a form</div>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        </div>
                        
                        {/* Callouts */}
                        <div className="px-6 py-4 border-b border-slate-200">
                          <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-start gap-2">
                              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                              <div>
                                <div className="flex items-center gap-1 text-[13px] text-slate-800">Callouts <HelpCircle className="w-3.5 h-3.5 text-slate-500" /></div>
                                <div className="text-[12px] text-slate-500">Add more business information</div>
                              </div>
                            </div>
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="mt-4 ml-6">
                             <div className="flex items-center gap-2 text-slate-600 mb-4 text-[13px]">
                               <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                               <span className="border-b border-dashed border-slate-400 cursor-help">Account-level callouts</span>
                             </div>
                             <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline">
                               <Plus className="w-4 h-4" /> Callouts
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* More options */}
                  <div className={`-mx-6 border-t border-slate-200 ${isMoreOptionsExpanded ? 'bg-blue-50/50' : ''}`}>
                    <div 
                      className="flex items-center gap-1.5 text-blue-600 font-medium cursor-pointer py-3 px-6"
                      onClick={() => setIsMoreOptionsExpanded(!isMoreOptionsExpanded)}
                    >
                      {isMoreOptionsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} More options
                    </div>
                    
                    {isMoreOptionsExpanded && (
                      <div className="bg-white border-t border-slate-200 divide-y divide-slate-200">
                        {/* HTML5 */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[13px] font-medium text-slate-800">HTML5</span>
                            <ChevronUp className="w-5 h-5 text-slate-400 cursor-pointer" />
                          </div>
                          <div className="text-[13px] text-slate-600 mb-6 max-w-md">
                            HTML5 ads are advanced interactive ads that give you more control over your creatives.
                          </div>
                          <div className="text-[12px] text-slate-500 mb-4">Add up to 1 HTML5 file</div>
                          <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline text-[13px]">
                            <Plus className="w-4 h-4" /> HTML5
                          </button>
                        </div>
                        
                        {/* Display path */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[13px] font-medium text-slate-800">Display path</span>
                            <ChevronUp className="w-5 h-5 text-slate-400 cursor-pointer" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-slate-600">www.kashmirorganicnuts.com /</span>
                            <div className="w-[120px]">
                              <input type="text" className="w-full border border-slate-300 rounded px-2 py-1.5 text-[13px] outline-none focus:border-blue-500" />
                              <div className="text-[10px] text-slate-400 text-right mt-1">0 / 15</div>
                            </div>
                            <span className="text-slate-400">/</span>
                            <div className="w-[120px]">
                              <input type="text" className="w-full border border-slate-300 rounded px-2 py-1.5 text-[13px] outline-none focus:border-blue-500" />
                              <div className="text-[10px] text-slate-400 text-right mt-1">0 / 15</div>
                            </div>
                          </div>
                        </div>

                        {/* Final URL for mobile */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[13px] font-medium text-slate-800">Final URL for mobile</span>
                            <ChevronUp className="w-5 h-5 text-slate-400 cursor-pointer" />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-[13px] text-slate-800">Use a different final URL for mobile</span>
                          </label>
                        </div>
                        
                        {/* Asset group URL options */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-[13px] font-medium text-slate-800">Asset group URL options</span>
                            <ChevronUp className="w-5 h-5 text-slate-400 cursor-pointer" />
                          </div>
                          
                          <div className="mb-6">
                            <label className="flex items-center gap-1 text-[12px] text-slate-600 mb-1.5">
                              Tracking template <HelpCircle className="w-3 h-3" />
                            </label>
                            <input type="text" placeholder="Tracking template" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] outline-none focus:border-blue-500 max-w-[400px]" />
                            <div className="text-[11px] text-slate-400 mt-1.5">Example: https://www.trackingtemplate.foo/?url={"{lpurl}"}&id=5</div>
                          </div>
                          
                          <div className="mb-6">
                            <label className="flex items-center gap-1 text-[12px] text-slate-600 mb-1.5">
                              Final URL suffix <HelpCircle className="w-3 h-3" />
                            </label>
                            <input type="text" placeholder="Final URL suffix" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] outline-none focus:border-blue-500 max-w-[400px]" />
                            <div className="text-[11px] text-slate-400 mt-1.5">Example: param1=value1&param2=value2</div>
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-1 text-[12px] text-slate-600 mb-1.5">
                              Custom parameter <HelpCircle className="w-3 h-3" />
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative w-[150px]">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-[13px]">_</span>
                                <input type="text" placeholder="Name" className="w-full border border-slate-300 rounded pl-7 pr-3 py-2 text-[13px] outline-none focus:border-blue-500" />
                              </div>
                              <span className="text-slate-500">=</span>
                              <input type="text" placeholder="Value" className="w-[200px] border border-slate-300 rounded px-3 py-2 text-[13px] outline-none focus:border-blue-500" />
                              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center cursor-pointer hover:bg-blue-100">
                                <Plus className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* URL rules */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px] font-medium text-slate-800">URL rules</span>
                            <ChevronUp className="w-5 h-5 text-slate-400 cursor-pointer" />
                          </div>
                          <div className="text-[12px] text-slate-500 mb-4">Specify pages with URLs that contain a certain piece of text</div>
                          <button className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline text-[13px]">
                            <Plus className="w-4 h-4" /> URL rules
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column - Preview */}
              <div className="w-[260px] shrink-0 sticky top-0 self-start">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-medium text-slate-800">Preview</span>
                  <div className="flex gap-3 text-[13px]">
                    <button className="text-blue-600 font-medium hover:underline" onClick={() => setShowSharePreviewModal(true)}>Share</button>
                    <button className="text-blue-600 font-medium hover:underline" onClick={() => setShowFullPreviewAds(true)}>Preview ads</button>
                  </div>
                </div>

                {/* Preview tabs */}
                <div className="flex items-center border-b border-slate-200 mb-4 gap-1">
                  <button 
                    className={`text-[11px] pb-2 px-3 flex flex-col items-center gap-1 hover:text-slate-700 ${previewTab === 'Search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setPreviewTab('Search')}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-[14px]">G</span>
                    </div>
                    Search
                  </button>
                  <button 
                    className={`text-[11px] pb-2 px-3 flex flex-col items-center gap-1 hover:text-slate-700 ${previewTab === 'Display' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setPreviewTab('Display')}
                  >
                    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${previewTab === 'Display' ? 'text-blue-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    Display
                  </button>
                  <button 
                    className={`text-[11px] pb-2 px-3 flex flex-col items-center gap-1 hover:text-slate-700 ${previewTab === 'YouTube' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setPreviewTab('YouTube')}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
                    YouTube
                  </button>
                  <button 
                    className={`text-[11px] pb-2 px-3 flex flex-col items-center gap-1 hover:text-slate-700 ${previewTab === 'Discover' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setPreviewTab('Discover')}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Discover
                  </button>
                </div>

                {/* Phone preview mockup */}
                <div className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden h-[500px] flex flex-col relative ring-[1px] ring-slate-100 ring-offset-[6px] outline outline-1 outline-slate-200 m-2">
                  
                  {previewTab === 'Search' && (
                    <>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        <div className="text-[16px] font-medium text-slate-700">Google</div>
                        <div className="w-7 h-7 rounded-full bg-slate-200"></div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="border border-slate-200 rounded-full px-3 py-1.5 flex items-center gap-2 mb-4">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-slate-100 h-3 rounded w-[80%]"></div>
                          <div className="bg-slate-100 h-3 rounded w-[60%]"></div>
                          <div className="bg-slate-100 h-2 rounded w-[90%] mt-4"></div>
                          <div className="bg-slate-100 h-2 rounded w-[75%]"></div>
                          <div className="bg-slate-100 h-2 rounded w-[85%]"></div>
                          <div className="mt-4 bg-slate-100 h-3 rounded w-[70%]"></div>
                          <div className="bg-slate-100 h-2 rounded w-[80%]"></div>
                          <div className="bg-slate-100 h-2 rounded w-[65%]"></div>
                        </div>
                      </div>
                    </>
                  )}

                  {previewTab === 'Display' && (
                    <div className="flex-1 bg-[#f1f3f4] flex flex-col p-4 pt-10 relative">
                      {/* Top mockup bar */}
                      <div className="absolute top-4 inset-x-4 h-6 bg-white rounded-full flex items-center px-3 border border-slate-200">
                        <div className="w-4 h-0.5 bg-slate-400"></div>
                        <div className="w-4 h-0.5 bg-slate-400 mt-1"></div>
                        <div className="w-4 h-0.5 bg-slate-400 mt-1"></div>
                        <div className="mx-auto w-24 h-2 bg-slate-300 rounded"></div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>

                      {/* Display ad placeholder content */}
                      <div className="mt-6 flex flex-col gap-2">
                        <div className="bg-slate-200 h-2 rounded w-full"></div>
                        <div className="bg-slate-200 h-2 rounded w-[90%]"></div>
                        <div className="bg-slate-200 h-2 rounded w-full"></div>
                        <div className="bg-slate-200 h-2 rounded w-[80%]"></div>
                        <div className="bg-slate-200 h-2 rounded w-[60%] mt-2"></div>
                      </div>

                      {/* Grid images */}
                      <div className="bg-white rounded-md shadow-sm border border-slate-200 mt-6 p-2 relative">
                        <Info className="w-3.5 h-3.5 text-blue-400 absolute top-2 right-2 z-10" />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="aspect-square bg-slate-100 relative rounded overflow-hidden group">
                            <img src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Product" />
                            <div className="absolute top-1 left-1 bg-white text-black font-medium text-[9px] px-1 rounded-sm shadow-sm">-20%</div>
                          </div>
                          <div className="aspect-square bg-slate-100 relative rounded overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Product" />
                          </div>
                          <div className="aspect-square bg-slate-100 relative rounded overflow-hidden group">
                            <img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Product" />
                          </div>
                          <div className="aspect-square bg-slate-100 relative rounded overflow-hidden group">
                            <img src="https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Product" />
                            <div className="absolute top-1 left-1 bg-white text-black font-medium text-[9px] px-1 rounded-sm shadow-sm">-15%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 mb-1 justify-center">
                          <span className="text-[14px] text-blue-700 font-bold tracking-widest">[ ]</span>
                          <span className="text-[10px] text-slate-500">kashmirorganicnuts</span>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col gap-2">
                        <div className="bg-slate-200 h-2 rounded w-full"></div>
                        <div className="bg-slate-200 h-2 rounded w-full"></div>
                        <div className="bg-slate-200 h-2 rounded w-[90%]"></div>
                        <div className="bg-slate-200 h-2 rounded w-[95%]"></div>
                        <div className="bg-slate-200 h-2 rounded w-[85%]"></div>
                        <div className="bg-slate-200 h-2 rounded w-full"></div>
                        <div className="bg-slate-200 h-2 rounded w-[75%]"></div>
                        <div className="bg-slate-200 h-2 rounded w-[80%]"></div>
                      </div>
                    </div>
                  )}

                  {previewTab === 'YouTube' && (
                    <div className="flex-1 bg-white flex flex-col pt-8 border-t-[30px] border-[#e8eaed]">
                      {/* Video placeholders */}
                      <div className="flex flex-col h-full">
                         <div className="h-[200px] bg-[#f1f3f4] flex items-center justify-center border-b border-white">
                            <div className="w-16 h-12 bg-white rounded flex items-center justify-center shadow-sm">
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-300" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                         </div>
                         <div className="h-[20px] flex gap-2 p-2 mt-1">
                           <div className="w-8 h-2 bg-slate-200 rounded-full"></div>
                           <div className="w-12 h-2 bg-slate-200 rounded-full"></div>
                           <div className="w-10 h-2 bg-slate-200 rounded-full"></div>
                           <div className="w-8 h-2 bg-slate-200 rounded-full"></div>
                           <div className="w-10 h-2 bg-slate-200 rounded-full"></div>
                         </div>
                         <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-center">
                           <div className="w-[80%] h-8 bg-[#f1f3f4] rounded-md"></div>
                         </div>
                         <div className="flex-1 bg-[#f8f9fa] mt-1 relative flex flex-col">
                           <div className="flex-1 bg-[#e8eaed] flex items-center justify-center">
                              <div className="w-16 h-12 bg-white rounded flex items-center justify-center shadow-sm">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-300" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                           </div>
                           <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                             <div className="w-8 h-8 rounded-full bg-[#f1f3f4] shrink-0"></div>
                             <div className="flex flex-col gap-2 w-full">
                               <div className="w-[80%] h-3 bg-[#e8eaed] rounded"></div>
                               <div className="w-[60%] h-2 bg-[#e8eaed] rounded"></div>
                             </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {previewTab === 'Discover' && (
                    <div className="flex-1 bg-white relative">
                      {/* Warning overlay */}
                      <div className="absolute top-8 left-4 right-4 bg-white border border-[#fbbc04] rounded-lg shadow-lg z-20 p-4">
                        <div className="flex gap-3">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#f29900] shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          <div className="text-[13px] text-slate-800">
                            To unlock this format, add the following assets:
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-700">
                              <li>1 description</li>
                              <li>1 horizontal image</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Mockup background */}
                      <div className="h-full bg-gradient-to-b from-[#e8eaed] to-white relative pt-32">
                         <div className="text-center mb-6">
                            <span className="text-[32px] font-bold text-blue-500">G</span>
                            <span className="text-[32px] font-bold text-red-500">o</span>
                            <span className="text-[32px] font-bold text-yellow-500">o</span>
                            <span className="text-[32px] font-bold text-blue-500">g</span>
                            <span className="text-[32px] font-bold text-green-500">l</span>
                            <span className="text-[32px] font-bold text-red-500">e</span>
                         </div>
                         <div className="mx-6 h-12 bg-white rounded-full border border-slate-200 shadow-sm flex items-center px-4 justify-between">
                            <span className="text-slate-500 text-[14px]">Search</span>
                            <div className="flex gap-2">
                              <div className="w-4 h-4 rounded bg-slate-100"></div>
                              <div className="w-4 h-4 rounded bg-slate-100"></div>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}

                </div>
                <div className="flex justify-between mt-3 px-2">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100">
                    <ChevronDown className="w-5 h-5 text-slate-600 rotate-90" />
                  </button>
                  {/* Dots */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100">
                    <ChevronDown className="w-5 h-5 text-slate-600 -rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Asset optimization */}
        <div id="panel-asset-optimization" onClick={() => onSubStepChange?.('asset-optimization')} className={getPanelClass('asset-optimization')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('asset-optimization')}>Asset optimization</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="text-[13px] text-slate-600 mb-4 leading-relaxed">
              To show more relevant ads, Google AI can enhance or generate assets using the information you've provided. This can help improve performance by increasing asset variety and improving matches to customer intents. <a href="#" className="text-blue-600 hover:underline">Learn more about asset optimization</a>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center shrink-0 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-[13px] text-green-800">All recommended asset optimization settings are on</span>
            </div>

            {/* Optimization rows */}
            {/* Optimization rows */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              {/* Text Row */}
              <div 
                className="flex items-center justify-between px-4 py-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50"
                onClick={(e) => { e.stopPropagation(); setExpandedAssetOptSection(expandedAssetOptSection === 'text' ? null : 'text'); }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 text-slate-800 flex items-center justify-center">
                    <span className="text-[15px] font-bold">Tt</span>
                  </div>
                  <div className="text-[13px] text-slate-800 font-medium w-16">Text</div>
                  {expandedAssetOptSection !== 'text' && (
                    <div className="text-[13px] text-slate-500 ml-4 hidden sm:block">Customization and final URL expansion turned on</div>
                  )}
                </div>
                {expandedAssetOptSection === 'text' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
              {expandedAssetOptSection === 'text' && (
                <div className="p-5 border-b border-slate-200 bg-white">
                  <div className="flex items-start gap-3 mb-4">
                    <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <div>
                      <div className="text-[13px] text-slate-800">
                        <strong>Customization:</strong> Use text from your site, landing pages, ads, and provided assets to create customized ad copy. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                      </div>
                      <a href="#" className="text-[13px] text-blue-600 font-medium hover:underline inline-block mt-2">Add text guidelines</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <div>
                      <div className="text-[13px] text-slate-800">
                        <strong>Final URL expansion:</strong> If you choose to subdivide inventory in the next step, Final URL expansion will only send traffic to landing pages related to the campaign's product inventory. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Requires text customization to be turned on to ensure ad copy matches landing page.</div>
                      <a href="#" className="text-[13px] text-blue-600 font-medium hover:underline inline-block mt-2">Add URL exclusions</a>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Row */}
              <div 
                className="flex items-center justify-between px-4 py-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50"
                onClick={(e) => { e.stopPropagation(); setExpandedAssetOptSection(expandedAssetOptSection === 'image' ? null : 'image'); }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 text-slate-800 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="text-[13px] text-slate-800 font-medium w-16">Image</div>
                  {expandedAssetOptSection !== 'image' && (
                    <div className="text-[13px] text-slate-500 ml-4 hidden sm:block">Enhancement and landing page images turned on</div>
                  )}
                </div>
                {expandedAssetOptSection === 'image' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
              {expandedAssetOptSection === 'image' && (
                <div className="p-5 border-b border-slate-200 bg-white">
                  <div className="flex items-start gap-3 mb-4">
                    <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <div>
                      <div className="text-[13px] text-slate-800">
                        <strong>Enhancement:</strong> Enhance and adjust images for better appearance, formatting, and layout. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                      </div>
                      <a href="#" className="text-[13px] text-blue-600 font-medium hover:underline inline-block mt-2">Add visual guidelines</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-6">
                    <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <div>
                      <div className="text-[13px] text-slate-800">
                        <strong>Landing page images:</strong> Get images from your landing page to use in your ads. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        By turning on landing page images, you confirm that you own all legal rights to the images and have permission to share them with Google for use on your behalf for advertising or other commercial purposes.
                      </div>
                    </div>
                  </div>
                  
                  {/* Landing page images example box */}
                  <div className="border border-slate-200 rounded-md p-4 bg-white">
                    <div className="flex items-center justify-between cursor-pointer mb-2">
                      <span className="text-[13px] font-medium text-slate-800">Example of landing page images</span>
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex border-b border-slate-200 mb-6">
                      <div className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 text-[13px] font-medium cursor-pointer">Search</div>
                      <div className="px-4 py-2 text-slate-600 text-[13px] font-medium cursor-pointer hover:bg-slate-50">YouTube</div>
                    </div>
                    
                    <div className="flex gap-6 justify-center">
                      {/* Original */}
                      <div className="flex flex-col items-center">
                        <div className="text-[12px] text-slate-500 mb-2">Original</div>
                        <div className="w-[280px] border border-slate-200 rounded p-4 bg-white shadow-sm">
                          <div className="text-[13px] font-bold mb-2">Sponsored result</div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-[#8c3514] flex items-center justify-center text-white text-[10px]">C</div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-medium leading-tight">Cedar Pantry</span>
                              <span className="text-[10px] text-slate-500 leading-tight">https://www.cedarpantry.com</span>
                            </div>
                            <MoreVertical className="w-3 h-3 text-slate-400 ml-auto" />
                          </div>
                          <div className="text-[16px] text-blue-700 font-medium leading-tight mb-2">Cedar Pantry- Fresh groceries delivered right to your door</div>
                          <div className="text-[12px] text-slate-600 leading-relaxed">
                            Get exclusive savings on high-quality groceries. Clean living meets wellness tech. The fewer ingredients the better when it comes to a healthful brand.
                          </div>
                        </div>
                      </div>
                      
                      {/* Optimized */}
                      <div className="flex flex-col items-center">
                        <div className="text-[12px] text-slate-500 flex items-center gap-1 mb-2"><Sparkles className="w-3 h-3" /> Optimized</div>
                        <div className="w-[280px] border border-slate-200 rounded p-4 bg-white shadow-sm relative">
                          <div className="text-[13px] font-bold mb-2">Sponsored result</div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-[#8c3514] flex items-center justify-center text-white text-[10px]">C</div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-medium leading-tight">Cedar Pantry</span>
                              <span className="text-[10px] text-slate-500 leading-tight">https://www.cedarpantry.com</span>
                            </div>
                            <MoreVertical className="w-3 h-3 text-slate-400 ml-auto" />
                          </div>
                          <div className="text-[16px] text-blue-700 font-medium leading-tight mb-2">Cedar Pantry- Fresh groceries delivered right to your door</div>
                          <div className="flex gap-2">
                            <div className="text-[12px] text-slate-600 leading-relaxed flex-1">
                              Get exclusive savings on high-quality groceries. Clean living meets wellness tech. The fewer ingredients the better when it comes to a healthful brand.
                            </div>
                            <div className="w-[80px] h-[60px] bg-slate-200 rounded overflow-hidden shrink-0">
                               <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Vegetables" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Row */}
              <div 
                className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-slate-50"
                onClick={(e) => { e.stopPropagation(); setExpandedAssetOptSection(expandedAssetOptSection === 'video' ? null : 'video'); }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 text-slate-800 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="text-[13px] text-slate-800 font-medium w-16">Video</div>
                  {expandedAssetOptSection !== 'video' && (
                    <div className="text-[13px] text-slate-500 ml-4 hidden sm:block">Enhancement turned on</div>
                  )}
                </div>
                {expandedAssetOptSection === 'video' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
              {expandedAssetOptSection === 'video' && (
                <div className="p-5 bg-white border-t border-slate-200">
                  <div className="flex items-start gap-3 mb-6">
                    <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <div>
                      <div className="text-[13px] text-slate-800">
                        <strong>Enhancement:</strong> Allow Google AI to enhance your uploaded videos by creating additional versions in different aspect ratios, shorter versions, and adding a voice-over if missing. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video enhancement examples */}
                  <div className="border border-slate-200 rounded-md p-4 bg-white mb-4">
                    <div className="flex items-center justify-between cursor-pointer mb-2">
                      <span className="text-[13px] font-medium text-slate-800">Examples of video enhancements</span>
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex border-b border-slate-200 mb-6 gap-2">
                      <div className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 text-[13px] font-medium cursor-pointer">Vertical video</div>
                      <div className="px-4 py-2 text-slate-600 text-[13px] font-medium cursor-pointer hover:bg-slate-50">Shorter video</div>
                      <div className="px-4 py-2 text-slate-600 text-[13px] font-medium cursor-pointer hover:bg-slate-50">Voice-over</div>
                    </div>
                    
                    <div className="text-[12px] text-slate-700 mb-6 max-w-2xl">
                      From horizontal to vertical square: Intelligent technology ensures that key elements in the original video are shown properly in the new video.
                    </div>
                    
                    <div className="flex gap-8 justify-center items-end">
                      {/* Horizontal Original inside phone frame */}
                      <div className="w-[180px] h-[360px] bg-black rounded-xl border-[6px] border-black flex items-center justify-center relative overflow-hidden ring-1 ring-slate-200">
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400" className="w-full aspect-video object-cover" alt="Horizontal original" />
                        <div className="absolute top-2 left-3 right-3 flex justify-between items-center z-10 text-white text-[8px]">
                          <span>10:00</span>
                          <div className="flex gap-1"><span className="w-2 h-2 rounded bg-white"></span><span className="w-2 h-2 rounded bg-white"></span></div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-10 bg-black/80 flex items-center justify-around border-t border-white/20">
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                          <div className="w-6 h-6 rounded-full bg-white/40 flex items-center justify-center">+</div>
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                        </div>
                      </div>
                      
                      {/* Vertical Optimized inside phone frame */}
                      <div className="w-[180px] h-[360px] bg-black rounded-xl border-[6px] border-black flex items-center justify-center relative overflow-hidden ring-1 ring-slate-200">
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400" className="w-full h-[85%] object-cover" alt="Vertical cropped" />
                        <div className="absolute top-2 left-3 right-3 flex justify-between items-center z-10 text-white text-[8px] drop-shadow-md">
                          <span>10:00</span>
                          <div className="flex gap-1"><span className="w-2 h-2 rounded bg-white"></span><span className="w-2 h-2 rounded bg-white"></span></div>
                        </div>
                        <div className="absolute bottom-10 inset-x-4">
                           <div className="bg-white rounded px-2 py-1.5 flex items-center justify-between">
                              <span className="text-[8px] font-bold">SHOP NOW</span>
                              <ChevronUp className="w-3 h-3 rotate-90" />
                           </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-10 bg-black/80 flex items-center justify-around border-t border-white/20">
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                          <div className="w-6 h-6 rounded-full bg-white/40 flex items-center justify-center">+</div>
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                          <div className="w-4 h-4 rounded bg-white/20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a href="#" className="text-[13px] text-blue-600 font-medium hover:underline inline-block mt-2">Add visual guidelines</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signals header */}
        <div className="mt-4">
          <h2 className="text-[22px] text-slate-800 font-normal mb-2">Signals</h2>
          <p className="text-[13px] text-slate-600 mb-4">
            Signals provide valuable information about the people you want to reach. They help guide who sees your ads on Google Search, YouTube, and more.
          </p>
        </div>

        {/* Search themes */}
        <div id="panel-search-themes" onClick={() => onSubStepChange?.('search-themes')} className={getPanelClass('search-themes')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('search-themes')}>Search themes</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-[13px] text-slate-800">What are some words or phrases people use when searching for your products or services?</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Add search themes (up to 50)"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Audience signal */}
        <div id="panel-audience-signal" onClick={() => onSubStepChange?.('audience-signal')} className={getPanelClass('audience-signal')}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={getHeaderClass('audience-signal')}>Audience signal</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[13px] text-slate-800">
                Reach the right customers faster across Google with an audience signal. <HelpCircle className="w-3.5 h-3.5 text-slate-500 inline ml-1" />
              </div>
              <button 
                className="border border-slate-300 rounded-md px-4 py-1.5 text-[13px] text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                onClick={() => setShowAudienceModal(true)}
              >
                Add saved audience signal
              </button>
            </div>
            
            {/* Your data */}
            <div className="border border-slate-200 rounded-md mb-4">
              <div className="px-4 py-3 flex items-center justify-between cursor-pointer border-b border-slate-100">
                <span className="text-[13px] text-slate-800 font-medium">Your data</span>
                <ChevronUp className="w-4 h-4 text-slate-500" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[13px] text-slate-600">First party data can help us reach your customers</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add your data"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional signals */}
            {!isAdditionalSignalsExpanded ? (
              <div 
                className="flex items-center gap-1.5 text-blue-600 font-medium text-[13px] cursor-pointer hover:underline mb-6 w-fit"
                onClick={(e) => { e.stopPropagation(); setIsAdditionalSignalsExpanded(true); }}
              >
                <Settings className="w-4 h-4" /> Additional signals
              </div>
            ) : (
              <div className="border border-slate-200 rounded-md mb-4">
                <div 
                  className="px-4 py-3 flex items-center gap-1.5 text-blue-600 font-medium text-[13px] border-b border-slate-100 cursor-pointer hover:bg-slate-50"
                  onClick={(e) => { e.stopPropagation(); setIsAdditionalSignalsExpanded(false); }}
                >
                  <Settings className="w-4 h-4" /> Additional signals
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="flex px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <div className="w-[200px] shrink-0 text-[13px] text-slate-800 font-medium">Interests & detailed demographics</div>
                    <div className="text-[13px] text-slate-500">Add any interests, detailed demographics, or life events related to your customers</div>
                  </div>
                  <div className="flex px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <div className="w-[200px] shrink-0 text-[13px] text-slate-800 font-medium">Demographics</div>
                    <div className="text-[13px] text-slate-500">All demographics (recommended)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Audience name */}
            <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-800 font-medium">Audience name</span>
                <span className="text-[13px] text-slate-500">Add a name for your audience to save it to your library (optional)</span>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-between items-center w-full pb-8">
         <div className="text-[12px] text-red-600 flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">!</div>
            Changes failed to save
         </div>
         <button 
           onClick={onNext}
           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors"
         >
           Next
         </button>
      </div>
      {/* Listing Groups Side Panel */}
      {showListingGroupsPanel && createPortal(
        <div className="fixed inset-0 z-[9999] flex" style={{ position: 'fixed' }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setShowListingGroupsPanel(false)}
          />
          {/* Side panel */}
          <div className="relative ml-auto w-full max-w-[520px] bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200">
              <button 
                onClick={() => setShowListingGroupsPanel(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <h2 className="text-[18px] text-slate-800">Listing groups</h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="text-[13px] text-slate-800 mb-1">
                Merchant center account: <strong>6613827812 - kashmirorganicnuts</strong>
              </div>
              <div className="text-[12px] text-slate-500 mb-6">
                Choose which products to show in your ads
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="listing_group_type" 
                    checked={listingGroupSelection === "all"}
                    onChange={() => setListingGroupSelection("all")}
                    className="w-4 h-4 text-blue-600" 
                  />
                  <span className="text-[13px] text-slate-800">Use all products</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="listing_group_type" 
                    checked={listingGroupSelection === "selection"}
                    onChange={() => setListingGroupSelection("selection")}
                    className="w-4 h-4 text-blue-600" 
                  />
                  <span className="text-[13px] text-slate-800">Use a selection of products</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3">
              <button 
                onClick={() => setShowListingGroupsPanel(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-5 py-2 rounded transition-colors"
              >
                Save
              </button>
              <button 
                onClick={() => setShowListingGroupsPanel(false)}
                className="text-slate-600 hover:text-slate-800 text-[13px] font-medium px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Logos Side Panel */}
      {showLogosPanel && createPortal(
        <div className="fixed inset-0 z-[9999] flex" style={{ position: 'fixed' }}>
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setShowLogosPanel(false)}
          />
          <div className="relative ml-auto w-full max-w-[800px] bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowLogosPanel(false)}
                  className="text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <h2 className="text-[18px] text-slate-800">Choose 5 logos to use in your ad</h2>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-500" />
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-slate-200">
              <div className="py-3 px-4 border-b-2 border-blue-600 text-blue-600 text-[13px] font-medium cursor-pointer">Asset library</div>
              <div className="py-3 px-4 text-slate-600 text-[13px] font-medium cursor-pointer hover:text-slate-800 hover:bg-slate-50">Website or social</div>
              <div className="py-3 px-4 text-slate-600 text-[13px] font-medium cursor-pointer hover:text-slate-800 hover:bg-slate-50">Upload</div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                </div>
                <span className="text-[13px] text-slate-600">Add filter</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-0.5 cursor-pointer text-blue-600">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg>
                  <span className="text-[10px] font-medium">Cards</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer text-slate-500 hover:text-slate-800">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  <span className="text-[10px] font-medium">Table</span>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50">
              <div className="text-[13px] font-medium text-slate-800 mb-4">Assets</div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                {/* Mock asset cards */}
                {[...Array(18)].map((_, i) => (
                  <div key={i} className={`relative flex flex-col gap-2 cursor-pointer group ${i === 4 ? 'ring-2 ring-blue-600 ring-offset-1 rounded' : ''}`}>
                    <div className="w-full aspect-square bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center p-2 relative">
                      {i === 4 && (
                        <div className="absolute top-1 left-1 bg-blue-600 rounded-sm w-4 h-4 flex items-center justify-center z-10">
                          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                      {/* Random placeholder pattern for logos */}
                      <div className={`w-full h-full rounded flex items-center justify-center ${i % 3 === 0 ? 'bg-[#2b1810]' : i % 3 === 1 ? 'bg-white border-2 border-[#b0211a]' : 'bg-[#f4e8d3]'}`}>
                         <span className={`font-bold text-[8px] text-center leading-tight ${i % 3 === 0 ? 'text-[#f4e8d3]' : 'text-[#b0211a]'}`}>KASHMIR<br/>ORGANIC</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-800 truncate">Enhanced webs...</span>
                      <span className="text-[10px] text-blue-600 truncate hover:underline">Audiences: Gre...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Footer Section */}
            <div className="border-t border-slate-200 bg-white">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 cursor-pointer hover:bg-slate-50">
                <div className="text-[14px] font-medium text-slate-800">Logos for your campaign (3/5)</div>
                <ChevronUp className="w-5 h-5 text-slate-500" />
              </div>
              <div className="px-6 py-4 flex gap-4">
                {/* Selected Logos */}
                <div className="w-20 h-20 border border-slate-200 rounded flex items-center justify-center relative bg-white overflow-hidden p-1">
                   <div className="absolute top-1 right-1 bg-black/50 hover:bg-black rounded-full w-4 h-4 flex items-center justify-center cursor-pointer z-10">
                     <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                   </div>
                   <span className="text-[#b0211a] font-bold text-[8px] text-center leading-tight">KASHMIR<br/>ORGANIC</span>
                </div>
                <div className="w-20 h-20 border border-slate-200 rounded flex items-center justify-center relative bg-black overflow-hidden p-1">
                   <div className="absolute top-1 right-1 bg-black/50 hover:bg-black rounded-full w-4 h-4 flex items-center justify-center cursor-pointer z-10">
                     <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                   </div>
                   <span className="text-[#f4e8d3] font-bold text-[8px] text-center leading-tight">KASHMIR<br/>ORGANIC</span>
                </div>
                <div className="w-20 h-20 border border-slate-200 rounded flex items-center justify-center relative bg-[#2b1810] overflow-hidden p-1">
                   <div className="absolute top-1 right-1 bg-black/50 hover:bg-black rounded-full w-4 h-4 flex items-center justify-center cursor-pointer z-10">
                     <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                   </div>
                   <span className="text-white font-bold text-[8px] text-center leading-tight">KASHMIR<br/>ORGANIC</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-4 bg-white">
              <button 
                onClick={() => setShowLogosPanel(false)}
                className="bg-slate-200 text-slate-400 cursor-not-allowed text-[13px] font-medium px-5 py-2 rounded"
              >
                Save
              </button>
              <button 
                onClick={() => setShowLogosPanel(false)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-[13px] font-medium px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <div className="text-[11px] text-slate-500 ml-auto">
                By adding an image, you confirm that you own all legal rights to the image and have permission to share the image with Google for use on your behalf in advertising or for other commercial purposes.
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Select an audience Modal */}
      {showAudienceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setShowAudienceModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-[20px] text-slate-800 font-normal">Select an audience</h2>
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded text-[13px] font-medium transition-colors flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> New Audience
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search by audience name"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded text-[14px] outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[13px] text-slate-800 mb-4 leading-relaxed">
                      None of your 0 audiences are recommended for this campaign. Create a new audience by following best practices for sales.
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-[13px] font-medium transition-colors flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> New Audience
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button 
                className="text-blue-600 hover:bg-blue-50 font-medium text-[14px] px-4 py-2 rounded transition-colors"
                onClick={() => setShowAudienceModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Share Preview Modal */}
      {showSharePreviewModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setShowSharePreviewModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h2 className="text-[18px] text-slate-800 font-medium mb-6">Share preview</h2>
            
            <div className="flex flex-col gap-5 mb-6">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div className="flex items-center gap-2 text-[13px] text-slate-700">
                  Link will expire in 
                  <select className="border border-slate-300 rounded px-3 py-1 outline-none">
                    <option>14 days</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="text-[13px] text-slate-700">If assets are updated, you'll need to share a new link</span>
              </div>
              
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <div>
                  <div className="text-[13px] text-slate-700 font-medium">Anyone with the link can view the preview</div>
                  <div className="text-[12px] text-slate-500">Only you can edit the ad</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 border border-slate-300 rounded px-3 py-2.5 mb-6">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <input 
                type="text" 
                readOnly 
                value="https://ads.google.com/aw_cm/ExternalPreview?ocid=7381516048&..." 
                className="w-full bg-transparent outline-none text-[13px] text-slate-600 truncate" 
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button className="text-blue-600 font-medium text-[14px] flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy link
              </button>
              <button 
                className="text-blue-600 font-medium text-[14px] hover:bg-blue-50 px-4 py-1.5 rounded transition-colors"
                onClick={() => setShowSharePreviewModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Full Preview Ads Overlay */}
      {showFullPreviewAds && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#f8f9fa] flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => setShowFullPreviewAds(false)}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <h1 className="text-[18px] text-slate-800">Preview of Asset Group 1</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span className="text-[14px]">Desktop</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
              </button>
              <button className="text-blue-600 font-medium text-[14px] hover:bg-blue-50 px-4 py-2 rounded transition-colors flex items-center gap-2">
                Share
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white border-b border-slate-200 flex justify-center shrink-0 shadow-sm z-10 pt-4">
            <div className="flex items-center gap-4">
              <button 
                className={`text-[12px] font-medium pb-3 px-4 flex flex-col items-center gap-1.5 ${fullPreviewTab === 'All' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setFullPreviewTab('All')}
              >
                <div className={`w-5 h-5 flex items-center justify-center rounded ${fullPreviewTab === 'All' ? 'bg-blue-50' : 'bg-transparent'}`}>
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 ${fullPreviewTab === 'All' ? 'text-blue-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                All
              </button>
              <button 
                className={`text-[12px] font-medium pb-3 px-4 flex flex-col items-center gap-1.5 ${fullPreviewTab === 'Search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setFullPreviewTab('Search')}
              >
                <div className={`w-5 h-5 flex items-center justify-center rounded ${fullPreviewTab === 'Search' ? 'bg-blue-50' : 'bg-transparent'}`}>
                  <span className="text-blue-600 font-bold text-[14px]">G</span>
                </div>
                Search
              </button>
              <button 
                className={`text-[12px] font-medium pb-3 px-4 flex flex-col items-center gap-1.5 ${fullPreviewTab === 'Display' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setFullPreviewTab('Display')}
              >
                <div className={`w-5 h-5 flex items-center justify-center rounded ${fullPreviewTab === 'Display' ? 'bg-blue-50' : 'bg-transparent'}`}>
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 ${fullPreviewTab === 'Display' ? 'text-blue-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                Display
              </button>
              <button 
                className={`text-[12px] font-medium pb-3 px-4 flex flex-col items-center gap-1.5 ${fullPreviewTab === 'YouTube' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setFullPreviewTab('YouTube')}
              >
                <div className={`w-5 h-5 flex items-center justify-center rounded ${fullPreviewTab === 'YouTube' ? 'bg-red-50' : 'bg-transparent'}`}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-500" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
                </div>
                YouTube
              </button>
              <button 
                className={`text-[12px] font-medium pb-3 px-4 flex flex-col items-center gap-1.5 ${fullPreviewTab === 'Discover' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setFullPreviewTab('Discover')}
              >
                <div className={`w-5 h-5 flex items-center justify-center rounded ${fullPreviewTab === 'Discover' ? 'bg-blue-50' : 'bg-transparent'}`}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                Discover
              </button>
              <button 
                className={`text-[12px] font-medium pb-3 px-4 flex flex-col items-center gap-1.5 ${fullPreviewTab === 'Gmail' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setFullPreviewTab('Gmail')}
              >
                <div className={`w-5 h-5 flex items-center justify-center rounded ${fullPreviewTab === 'Gmail' ? 'bg-red-50' : 'bg-transparent'}`}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                Gmail
              </button>
            </div>
          </div>
          
          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-8 relative">
             <div className="max-w-[1400px] mx-auto">
               
               {/* Display Tab Content */}
               {(fullPreviewTab === 'Display' || fullPreviewTab === 'All') && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                   {/* Card 1 */}
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-100">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <div className="p-8 pb-12 text-center border-b border-slate-100 bg-[#fafafa]">
                        <div className="text-[32px] font-serif italic text-slate-800 tracking-wide mb-8">website</div>
                        <div className="space-y-4 max-w-[80%] mx-auto">
                          <div className="h-2 bg-slate-200 rounded w-full"></div>
                          <div className="h-2 bg-slate-200 rounded w-[90%] mx-auto"></div>
                          <div className="flex gap-4 justify-center mt-6">
                             <div className="w-6 h-1 bg-slate-300 rounded"></div>
                             <div className="w-4 h-2 text-slate-400">{'<'}</div>
                             <div className="w-8 h-1 bg-slate-300 rounded"></div>
                             <div className="w-4 h-2 text-slate-400">{'>'}</div>
                             <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex gap-4 h-[200px]">
                         <div className="flex-1 bg-slate-100 rounded"></div>
                         <div className="w-[120px] bg-white border border-slate-200 rounded p-2 flex flex-col relative shrink-0">
                            <Info className="w-3 h-3 text-blue-400 absolute top-1 right-1" />
                            <div className="grid grid-cols-2 gap-1 mb-2">
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" />
                               </div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" />
                               </div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" />
                               </div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" />
                               </div>
                            </div>
                            <div className="text-center mt-auto">
                              <div className="text-[10px] text-blue-600 font-bold tracking-widest">[ ]</div>
                              <div className="text-[6px] text-slate-500 truncate">kashmirorganicnuts</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Card 2 */}
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-100">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <div className="p-8 pb-12 text-center border-b border-slate-100 bg-[#fafafa]">
                        <div className="text-[32px] font-serif italic text-slate-800 tracking-wide mb-8">website</div>
                        <div className="space-y-4 max-w-[80%] mx-auto">
                          <div className="h-2 bg-slate-200 rounded w-[80%] mx-auto"></div>
                          <div className="h-2 bg-slate-200 rounded w-full"></div>
                        </div>
                      </div>
                      <div className="p-4 flex gap-4 h-[200px]">
                         <div className="flex-1 bg-slate-100 rounded"></div>
                         <div className="w-[150px] bg-white border border-slate-200 rounded p-3 flex flex-col relative shrink-0 items-center justify-center text-center">
                            <Info className="w-3 h-3 text-blue-400 absolute top-2 right-2" />
                            <div className="flex gap-2 w-full mb-3">
                               <div className="flex-1 aspect-[4/3] bg-slate-200 rounded overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                               </div>
                            </div>
                            <div className="w-16 h-1 bg-slate-200 rounded mb-2"></div>
                            <div className="w-24 h-1.5 bg-slate-300 rounded mb-4"></div>
                            <button className="w-full bg-blue-600 text-white text-[10px] font-medium py-1.5 rounded">SHOP NOW</button>
                         </div>
                      </div>
                   </div>

                   {/* Card 3 */}
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-100">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <div className="p-8 pb-12 text-center border-b border-slate-100 bg-[#fafafa]">
                        <div className="text-[32px] font-serif italic text-slate-800 tracking-wide mb-8">website</div>
                        <div className="space-y-4 max-w-[80%] mx-auto">
                          <div className="h-2 bg-slate-200 rounded w-full"></div>
                          <div className="h-2 bg-slate-200 rounded w-[85%] mx-auto"></div>
                        </div>
                      </div>
                      <div className="p-4 flex gap-4 h-[200px]">
                         <div className="flex-1 bg-slate-100 rounded"></div>
                         <div className="w-[120px] bg-white border border-slate-200 rounded p-2 flex flex-col relative shrink-0">
                            <Info className="w-3 h-3 text-blue-400 absolute top-1 right-1" />
                            <div className="grid grid-cols-2 gap-1 mb-2 mt-4">
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" />
                               </div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden">
                                 <img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" />
                               </div>
                            </div>
                            <div className="text-center mt-auto">
                              <div className="text-[10px] text-blue-600 font-bold tracking-widest">[ ]</div>
                              <div className="text-[6px] text-slate-500 truncate">kashmirorganicnuts</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Duplicate rows to fill screen */}
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-100">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <div className="p-8 pb-12 text-center border-b border-slate-100 bg-[#fafafa]">
                        <div className="text-[32px] font-serif italic text-slate-800 tracking-wide mb-8">website</div>
                      </div>
                      <div className="p-4 flex gap-4 h-[200px]">
                         <div className="w-[120px] bg-white border border-slate-200 rounded p-2 flex flex-col relative shrink-0">
                            <Info className="w-3 h-3 text-blue-400 absolute top-1 right-1" />
                            <div className="grid grid-cols-2 gap-1 mb-2">
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden"><img src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" /></div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden"><img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" /></div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden"><img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" /></div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden"><img src="https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" /></div>
                            </div>
                            <div className="text-center mt-auto">
                              <div className="text-[10px] text-blue-600 font-bold tracking-widest">[ ]</div>
                            </div>
                         </div>
                         <div className="flex-1 bg-slate-100 rounded flex flex-col justify-end p-4">
                           <div className="h-2 bg-slate-200 w-full rounded mb-2"></div>
                           <div className="h-2 bg-slate-200 w-[70%] rounded"></div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-100">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <div className="p-8 pb-12 text-center border-b border-slate-100 bg-[#fafafa]">
                        <div className="text-[32px] font-serif italic text-slate-800 tracking-wide mb-8">website</div>
                      </div>
                      <div className="p-4 flex gap-4 h-[200px]">
                         <div className="w-[120px] bg-white border border-slate-200 rounded p-2 flex flex-col relative shrink-0">
                            <Info className="w-3 h-3 text-blue-400 absolute top-1 right-1" />
                            <div className="grid grid-cols-2 gap-1 mb-2 mt-4">
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden"><img src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" /></div>
                               <div className="aspect-square bg-slate-200 rounded overflow-hidden"><img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" /></div>
                            </div>
                            <div className="text-center mt-auto">
                              <div className="text-[10px] text-blue-600 font-bold tracking-widest">[ ]</div>
                            </div>
                         </div>
                         <div className="flex-1 bg-slate-100 rounded"></div>
                      </div>
                   </div>
                   
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-100">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <div className="p-8 pb-12 text-center border-b border-slate-100 bg-[#fafafa]">
                        <div className="text-[32px] font-serif italic text-slate-800 tracking-wide mb-8">website</div>
                      </div>
                      <div className="p-4 flex flex-col gap-4 h-[200px]">
                         <div className="flex-1 bg-slate-100 rounded"></div>
                         <div className="h-[60px] bg-white border border-slate-200 rounded p-2 flex items-center gap-3 relative shrink-0">
                            <Info className="w-3 h-3 text-blue-400 absolute top-1 right-1" />
                            <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden shrink-0">
                              <img src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                               <div className="h-1.5 bg-slate-300 w-24 rounded"></div>
                               <div className="h-1.5 bg-slate-200 w-16 rounded"></div>
                            </div>
                            <button className="bg-blue-600 text-white text-[10px] font-medium px-3 py-1.5 rounded mr-3">LEARN MORE</button>
                         </div>
                      </div>
                   </div>
                 </div>
               )}

               {/* Search Tab Content / Add Assets Warning */}
               {fullPreviewTab === 'Search' && (
                 <div className="flex flex-col items-center pt-10">
                   <div className="text-[14px] text-slate-800 font-medium mb-10">Add more assets to unlock these formats</div>
                   <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-[800px] h-[400px] relative overflow-hidden">
                      {/* Warning Overlay */}
                      <div className="absolute top-10 left-10 z-20 bg-white border border-[#fbbc04] rounded-lg shadow-lg p-6 max-w-[400px]">
                        <div className="flex gap-4">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#f29900] shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          <div className="text-[14px] text-slate-800">
                            To unlock this format, add the following assets:
                            <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700">
                              <li>3 headlines</li>
                              <li>2 descriptions</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Mockup Background */}
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-200/50 to-white pt-10 px-10">
                        <div className="text-[24px] font-medium text-slate-500 mb-8 opacity-50">Google</div>
                        <div className="space-y-6 opacity-30">
                          <div>
                            <div className="h-3 bg-slate-300 rounded w-[40%] mb-3"></div>
                            <div className="h-2 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-2 bg-slate-200 rounded w-[85%]"></div>
                          </div>
                          <div>
                            <div className="h-3 bg-slate-300 rounded w-[60%] mb-3"></div>
                            <div className="h-2 bg-slate-200 rounded w-[95%] mb-2"></div>
                            <div className="h-2 bg-slate-200 rounded w-[70%]"></div>
                          </div>
                          <div>
                            <div className="h-3 bg-slate-300 rounded w-[50%] mb-3"></div>
                            <div className="h-2 bg-slate-200 rounded w-[80%] mb-2"></div>
                            <div className="h-2 bg-slate-200 rounded w-[90%]"></div>
                          </div>
                        </div>
                      </div>
                   </div>
                 </div>
               )}
               
             </div>
          </div>
          
          {/* Footer Notice */}
          <div className="h-10 bg-[#fafafa] border-t border-slate-200 shrink-0 flex items-center justify-center">
            <span className="text-[10px] text-slate-500 text-center px-4 max-w-4xl truncate">
              Previews shown here are examples and don't include all possible formats. You're responsible for the content of your ads. Please make sure that your provided assets don't violate any Google policies or applicable laws, either individually, or in combination.
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
