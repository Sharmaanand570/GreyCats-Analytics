import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Link, List, HelpCircle, Image as ImageIcon, Plus, CheckCircle2, MessageSquareText, Search, Phone, TriangleAlert, Pencil, Pin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { useKeywordIdeas } from "../hooks/useCampaignLookups";

interface KeywordsAndAdsStepProps {
  onNext: () => void;
}

export default function GoogleAdsKeywordsAndAdsStep({ onNext }: KeywordsAndAdsStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const rsa = payload.ads?.[0]?.responsiveSearchAd;
  const initialHeadlines = rsa?.headlines?.map(h => h.text) || [];
  const initialDescriptions = rsa?.descriptions?.map(d => d.text) || [];
  const posKeywords = payload.keywords?.filter(k => !k.negative) || [];
  const negKeywords = payload.keywords?.filter(k => k.negative) || [];

  const [activePanel, setActivePanel] = useState("ads");
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [adGroupName, setAdGroupName] = useState(payload.adGroups?.[0]?.name || "Ad Group 1");
  const [headlines, setHeadlines] = useState<string[]>(Array.from({ length: 8 }, (_, i) => initialHeadlines[i] || ""));
  const [headlinePins, setHeadlinePins] = useState<string[]>(Array.from({ length: 8 }, (_, i) => rsa?.headlines?.[i]?.pinnedField || "UNSPECIFIED"));
  const [descriptions, setDescriptions] = useState<string[]>(Array.from({ length: 4 }, (_, i) => initialDescriptions[i] || ""));
  const [descriptionPins, setDescriptionPins] = useState<string[]>(Array.from({ length: 4 }, (_, i) => rsa?.descriptions?.[i]?.pinnedField || "UNSPECIFIED"));
  const [finalUrl, setFinalUrl] = useState(payload.ads?.[0]?.finalUrls?.[0] || "");
  const [path1, setPath1] = useState(rsa?.path1 || "");
  const [path2, setPath2] = useState(rsa?.path2 || "");
  const [adTrackingTemplate, setAdTrackingTemplate] = useState<string>(payload.ads?.[0]?.trackingUrlTemplate || "");
  const [adFinalUrlSuffix, setAdFinalUrlSuffix] = useState<string>(payload.ads?.[0]?.finalUrlSuffix || "");
  const [keywordsText, setKeywordsText] = useState(posKeywords.map(k => k.text).join("\n"));
  const [negativeKeywordsText, setNegativeKeywordsText] = useState(negKeywords.map(k => k.text).join("\n"));
  const [keywordMatchType, setKeywordMatchType] = useState<"BROAD" | "PHRASE" | "EXACT">(
    (posKeywords[0]?.matchType as any) || "BROAD"
  );

  // Keyword suggestion inputs (Google Ads keyword ideas)
  const [kwSeedUrl, setKwSeedUrl] = useState("");
  const [kwSeedProducts, setKwSeedProducts] = useState("");
  const keywordIdeas = useKeywordIdeas();

  const handleGetKeywordSuggestions = () => {
    if (!kwSeedUrl.trim() && !kwSeedProducts.trim()) {
      toast.error("Enter a URL or products/services to get suggestions");
      return;
    }
    keywordIdeas.mutate(
      {
        payload: {
          url: kwSeedUrl.trim() || undefined,
          description: kwSeedProducts.trim() || undefined,
        },
        params: { clientId: payload.clientId || 1 },
      },
      {
        onSuccess: (ideas) => {
          if (!ideas.length) {
            toast.info("No keyword ideas found for that input");
            return;
          }
          const existing = new Set(
            keywordsText.split(/[\n,]+/).map((k) => k.trim().toLowerCase()).filter(Boolean)
          );
          const additions = ideas
            .map((i) => i.text.trim())
            .filter((t) => t && !existing.has(t.toLowerCase()));
          if (!additions.length) {
            toast.info("Those keyword ideas are already in your list");
            return;
          }
          setKeywordsText((prev) => (prev.trim() ? `${prev.trim()}\n${additions.join("\n")}` : additions.join("\n")));
          toast.success(`Added ${additions.length} keyword idea${additions.length === 1 ? "" : "s"}`);
        },
      }
    );
  };

  // Validation
  const filledHeadlinesCount = headlines.filter(h => h.trim().length > 0).length;
  const filledDescriptionsCount = descriptions.filter(d => d.trim().length > 0).length;
  const keywordsCount = keywordsText.split(/[\n,]+/).filter(k => k.trim().length > 0).length;
  
  const hasMinHeadlines = filledHeadlinesCount >= 3;
  const hasMinDescriptions = filledDescriptionsCount >= 2;
  const hasMinKeywords = keywordsCount >= 1;
  const hasFinalUrl = finalUrl.trim().length > 0;

  const adStrength = 
    hasMinHeadlines && hasMinDescriptions && hasMinKeywords && hasFinalUrl 
      ? (filledHeadlinesCount >= 5 && filledDescriptionsCount >= 3 ? "Excellent" : "Good")
      : "Incomplete";

  useEffect(() => {
    // Sync keywords
    const keywordsList = keywordsText
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .map(k => ({ text: k, matchType: keywordMatchType, negative: false }));

    const negativeList = negativeKeywordsText
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .map(k => ({ text: k, matchType: keywordMatchType, negative: true }));

    updatePayload({
      adGroups: [{ name: adGroupName, status: "ENABLED" }],
      keywords: [...keywordsList, ...negativeList] as any,
      ads: [
        {
          type: "RESPONSIVE_SEARCH_AD",
          finalUrls: finalUrl ? [finalUrl] : [],
          trackingUrlTemplate: adTrackingTemplate || undefined,
          finalUrlSuffix: adFinalUrlSuffix || undefined,
          responsiveSearchAd: {
            headlines: headlines.filter(h => h.trim().length > 0).map((text, i) => ({ text, assetId: "", pinnedField: headlinePins[i] || "UNSPECIFIED" })) as any,
            descriptions: descriptions.filter(d => d.trim().length > 0).map((text, i) => ({ text, assetId: "", pinnedField: descriptionPins[i] || "UNSPECIFIED" })) as any,
            path1,
            path2
          }
        }
      ]
    });
  }, [keywordsText, negativeKeywordsText, keywordMatchType, headlines, headlinePins, descriptions, descriptionPins, finalUrl, path1, path2, adGroupName, adTrackingTemplate, adFinalUrlSuffix, updatePayload]);
  
  return (
    <div className="flex flex-col h-full w-full max-w-[1200px]">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-[22px] text-slate-800 font-normal mb-1">Keywords and ads</h1>
          <p className="text-[13px] text-slate-600 max-w-[800px]">
            Ad groups help you organize your ads around a common theme. For the best results, focus your ads and keywords on one product or service.
          </p>
        </div>
        <div>
          <button className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      <div className="text-[15px] font-medium text-slate-800 mb-4">
        Add details to match your ads to the right searches
      </div>

      <div className="mb-6">
        <label className="text-[13px] font-medium text-slate-800 block mb-1">Ad group name</label>
        <input 
          type="text" 
          value={adGroupName}
          onChange={(e) => setAdGroupName(e.target.value)}
          className="w-full max-w-[400px] border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>

      <div className="flex gap-6 items-start pb-20">
        
        {/* Left Column - Forms */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Keywords Panel */}
          <div className={`bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activePanel === 'keywords' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
            <div 
              className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50"
              onClick={() => setActivePanel("keywords")}
            >
               <h2 className={`text-[14px] ${activePanel === 'keywords' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Keywords</h2>
               {activePanel === 'keywords' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </div>
            
            {activePanel === 'keywords' && (
              <div className="p-6">
                <div className="mb-6">
                  <div className="text-[13px] font-medium text-slate-800 mb-1">Get keyword suggestions (optional)</div>
                  <div className="text-[12px] text-slate-500 mb-3">Google Ads can find keywords for you by scanning a web page or seeing what's working for similar products or services.</div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Final URL"
                        value={kwSeedUrl}
                        onChange={(e) => setKwSeedUrl(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <List className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter products or services to advertise"
                        value={kwSeedProducts}
                        onChange={(e) => setKwSeedProducts(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={handleGetKeywordSuggestions}
                      disabled={keywordIdeas.isPending || (!kwSeedUrl.trim() && !kwSeedProducts.trim())}
                      className="text-[13px] font-medium text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                    >
                      {keywordIdeas.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {keywordIdeas.isPending ? "Getting suggestions…" : "Get keyword suggestions"}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1 justify-between">
                    <span className="text-[13px] font-medium text-slate-800">Enter keywords</span>
                    <select
                      value={keywordMatchType}
                      onChange={(e) => setKeywordMatchType(e.target.value as any)}
                      className="border border-slate-300 rounded px-2 py-1 text-[12px] text-slate-800 outline-none"
                    >
                      <option value="BROAD">Broad match</option>
                      <option value="PHRASE">Phrase match</option>
                      <option value="EXACT">Exact match</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[12px] text-slate-500">Keywords are words or phrases that are used to match your ads with the terms people are searching for</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <textarea 
                    rows={6}
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="Enter or paste keywords. You can separate each keyword by commas or enter one per line."
                    className="block w-full p-3 border border-slate-300 rounded-md text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none mb-4"
                  ></textarea>

                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[13px] font-medium text-slate-800">Negative keywords</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[12px] text-slate-500">Prevent your ad from showing on searches with these terms</span>
                  </div>
                  <textarea 
                    rows={4}
                    value={negativeKeywordsText}
                    onChange={(e) => setNegativeKeywordsText(e.target.value)}
                    placeholder="Enter negative keywords..."
                    className="block w-full p-3 border border-slate-300 rounded-md text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Ad group settings for AI Max (Collapsed) */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden transition-all duration-200 hover:bg-slate-50 cursor-pointer">
            <div className="px-6 py-4 flex justify-between items-center">
               <div className="flex items-center gap-12">
                 <h2 className="text-[14px] text-slate-800 font-medium">Ad group settings for AI Max</h2>
                 <span className="text-[13px] text-slate-500">Turned off for your ad group</span>
               </div>
               <ChevronDown className="w-5 h-5 text-slate-500" />
            </div>
          </div>

          {/* Ads Panel */}
          <div className={`bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activePanel === 'ads' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
            <div 
              className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50"
              onClick={() => setActivePanel("ads")}
            >
               <h2 className={`text-[14px] ${activePanel === 'ads' ? 'text-blue-700 font-medium' : 'text-slate-800 font-medium'}`}>Ads</h2>
               {activePanel === 'ads' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </div>
            
            {activePanel === 'ads' && (
              <div>
                {!isCreatingAd ? (
                  <div className="p-6">
                    <button 
                      onClick={() => setIsCreatingAd(true)}
                      className="flex items-center gap-2 text-[14px] text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-md transition-colors border border-transparent"
                    >
                      <Plus className="w-5 h-5 bg-blue-600 text-white rounded-full p-0.5" />
                      Responsive search ad
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Ad Strength Header Area */}
                    <div className="bg-[#f8fbff] p-6 border-b border-blue-100 flex items-start gap-8">
                      <div className="flex gap-4 items-center flex-1">
                        <button className="text-slate-400 hover:text-slate-700">&lt;</button>
                        <button className="text-slate-400 hover:text-slate-700">&gt;</button>
                        <div className="text-[13px] text-slate-600 leading-snug">
                          Add a final URL to see<br/>headline and description<br/>suggestions
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-slate-200"></div>
                        </div>
                          <div className="flex flex-col">
                            <div className="text-[13px] font-medium text-slate-800 flex items-center gap-1">
                              Ad strength <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className={`text-[13px] font-medium ${adStrength === 'Incomplete' ? 'text-slate-500' : 'text-blue-600'}`}>{adStrength}</div>
                          </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pl-6 border-l border-blue-100">
                        <div className="flex items-center gap-2 text-[11px]">
                          <div className="w-3 h-3 rounded-full border border-blue-400"></div>
                          <span className="text-blue-600">Add headlines</span>
                          <a href="#" className="text-blue-400 hover:underline">View ideas</a>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <div className="w-3 h-3 rounded-full border border-blue-400"></div>
                          <span className="text-blue-600">Include popular keywords</span>
                          <a href="#" className="text-blue-400 hover:underline">View ideas</a>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <div className="w-3 h-3 rounded-full border border-blue-400"></div>
                          <span className="text-blue-600">Make headlines unique</span>
                          <a href="#" className="text-blue-400 hover:underline">View ideas</a>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <div className="w-3 h-3 rounded-full border border-blue-400"></div>
                          <span className="text-blue-600">Make descriptions unique</span>
                          <a href="#" className="text-blue-400 hover:underline">View ideas</a>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-slate-800">Add more sitelinks</span>
                          <a href="#" className="text-blue-600 hover:underline">View ideas</a>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 flex flex-col gap-4">
                      {/* Final URL Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-3">
                           <span className="text-[14px] font-medium text-slate-800">Final URL</span>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <input 
                           type="text" 
                           value={finalUrl}
                           onChange={(e) => setFinalUrl(e.target.value)}
                           placeholder="Final URL"
                           className="block w-full px-3 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                         />
                         <div className="text-[11px] text-slate-500 mt-2 leading-tight">
                           This will be used to suggest assets for your ad
                         </div>
                      </div>

                      {/* Display path Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-3">
                           <span className="text-[14px] font-medium text-slate-800">Display path</span>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <div className="flex items-center gap-2 text-[13px] text-slate-600">
                           <span>www.example.com</span>
                           <span>/</span>
                           <div className="relative w-full max-w-[120px]">
                             <input type="text" value={path1} onChange={(e) => setPath1(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                             <span className="absolute right-2 top-2 text-[10px] text-slate-400">0/15</span>
                           </div>
                           <span>/</span>
                           <div className="relative w-full max-w-[120px]">
                             <input type="text" value={path2} onChange={(e) => setPath2(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                             <span className="absolute right-2 top-2 text-[10px] text-slate-400">0/15</span>
                           </div>
                         </div>
                      </div>

                      {/* Ask Advisor Banner */}
                      <div className="bg-[#e8f0fe] rounded-md p-4 flex gap-4">
                        <MessageSquareText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-3 w-full">
                          <div className="text-[13px] text-slate-800 font-medium leading-snug">
                            Want more personalized help? Chat with Ask Advisor to get keyword & asset suggestions.
                          </div>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-1.5 rounded w-max transition-colors">
                            Open chat
                          </button>
                        </div>
                      </div>

                      {/* Headlines Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-2">
                               <span className="text-slate-500 font-serif font-bold text-[16px] leading-none italic">T</span>
                               <span className="text-[14px] font-medium text-slate-800">Headlines</span>
                               <span className={`text-[11px] ${hasMinHeadlines ? 'text-blue-600' : 'text-slate-500'}`}>{filledHeadlinesCount}/15</span>
                               <a href="#" className="text-[12px] text-blue-600 hover:underline ml-2">View ideas</a>
                             </div>
                             <ChevronUp className="w-4 h-4 text-slate-500" />
                           </div>
                           <div className="flex flex-col gap-1">
                             {[...Array(8)].map((_, i) => (
                               <div key={i}>
                                 <div className="relative">
                                   <input
                                     type="text"
                                     value={headlines[i]}
                                     maxLength={30}
                                     onChange={(e) => {
                                       const newH = [...headlines];
                                       newH[i] = e.target.value;
                                       setHeadlines(newH);
                                     }}
                                     placeholder="Headline"
                                     className="block w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                   />
                                   <button 
                                     className="absolute right-2 top-2 p-0.5 hover:bg-slate-100 rounded text-slate-400 focus:outline-none"
                                     onClick={(e) => {
                                       e.preventDefault();
                                       const newPins = [...headlinePins];
                                       const cur = newPins[i] || "UNSPECIFIED";
                                       newPins[i] = cur === "UNSPECIFIED" ? "POSITION_1" : (cur === "POSITION_1" ? "POSITION_2" : (cur === "POSITION_2" ? "POSITION_3" : "UNSPECIFIED"));
                                       setHeadlinePins(newPins);
                                     }}
                                     title={`Pin position: ${headlinePins[i] || 'Unpinned'}`}
                                   >
                                     <Pin className={`w-3.5 h-3.5 ${headlinePins[i] && headlinePins[i] !== "UNSPECIFIED" ? 'text-blue-600 fill-blue-600' : ''}`} />
                                     {headlinePins[i] && headlinePins[i] !== "UNSPECIFIED" ? <span className="absolute -bottom-1 -right-1 text-[9px] bg-blue-100 text-blue-700 rounded-full w-3 h-3 flex items-center justify-center font-bold">{headlinePins[i].replace("POSITION_", "")}</span> : null}
                                   </button>
                                 </div>
                                 <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 px-0.5">
                                   {i < 3 ? <span className={headlines[i] ? "text-slate-500" : "text-[#c5221f]"}>Required</span> : <span />}
                                   <span className={headlines[i].length > 30 ? "text-[#c5221f]" : "text-slate-400"}>{headlines[i].length} / 30</span>
                                 </div>
                               </div>
                             ))}
                           </div>
                         <button className="text-[13px] text-blue-600 font-medium flex items-center gap-1 hover:underline mt-3">
                           <Plus className="w-4 h-4" /> Headline
                         </button>
                      </div>

                      {/* Descriptions Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-3">
                           <div className="flex items-center gap-2">
                             <span className="text-slate-500 font-serif font-bold text-[16px] leading-none italic">T</span>
                             <span className="text-[14px] font-medium text-slate-800">Descriptions</span>
                             <span className={`text-[11px] ${hasMinDescriptions ? 'text-blue-600' : 'text-slate-500'}`}>{filledDescriptionsCount}/4</span>
                             <a href="#" className="text-[12px] text-blue-600 hover:underline ml-2">View ideas</a>
                           </div>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <div className="flex flex-col gap-1">
                           {[0, 1, 2, 3].map((i) => (
                             <div key={i}>
                               <div className="relative">
                                  <input
                                    type="text"
                                    value={descriptions[i]}
                                    maxLength={90}
                                    onChange={(e) => {
                                      const newD = [...descriptions];
                                      newD[i] = e.target.value;
                                      setDescriptions(newD);
                                    }}
                                    placeholder="Description"
                                    className="block w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <button 
                                    className="absolute right-2 top-2 p-0.5 hover:bg-slate-100 rounded text-slate-400 focus:outline-none"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newPins = [...descriptionPins];
                                      const cur = newPins[i] || "UNSPECIFIED";
                                      newPins[i] = cur === "UNSPECIFIED" ? "POSITION_1" : (cur === "POSITION_1" ? "POSITION_2" : "UNSPECIFIED");
                                      setDescriptionPins(newPins);
                                    }}
                                    title={`Pin position: ${descriptionPins[i] || 'Unpinned'}`}
                                  >
                                    <Pin className={`w-3.5 h-3.5 ${descriptionPins[i] && descriptionPins[i] !== "UNSPECIFIED" ? 'text-blue-600 fill-blue-600' : ''}`} />
                                    {descriptionPins[i] && descriptionPins[i] !== "UNSPECIFIED" ? <span className="absolute -bottom-1 -right-1 text-[9px] bg-blue-100 text-blue-700 rounded-full w-3 h-3 flex items-center justify-center font-bold">{descriptionPins[i].replace("POSITION_", "")}</span> : null}
                                  </button>
                                </div>
                               <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 px-0.5">
                                 {i < 2 ? <span className={descriptions[i] ? "text-slate-500" : "text-[#c5221f]"}>Required</span> : <span />}
                                 <span className={descriptions[i].length > 90 ? "text-[#c5221f]" : "text-slate-400"}>{descriptions[i].length} / 90</span>
                               </div>
                             </div>
                           ))}
                         </div>
                         <button className="text-[13px] text-blue-600 font-medium flex items-center gap-1 hover:underline mt-3">
                           <Plus className="w-4 h-4" /> Description
                         </button>
                      </div>

                      {/* Ad URL Options Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-[14px] font-medium text-slate-800">Ad URL options</h3>
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="text-[12px] font-medium text-slate-700 mb-1.5 block">Tracking template</label>
                            <input
                              type="text"
                              value={adTrackingTemplate}
                              onChange={(e) => setAdTrackingTemplate(e.target.value)}
                              placeholder="e.g. https://www.tracking.com/?url={lpurl}&id=5"
                              className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-medium text-slate-700 mb-1.5 block">Final URL suffix</label>
                            <input
                              type="text"
                              value={adFinalUrlSuffix}
                              onChange={(e) => setAdFinalUrlSuffix(e.target.value)}
                              placeholder="e.g. param1=value1&param2=value2"
                              className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Images Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-3">
                           <div className="flex items-center gap-2">
                             <ImageIcon className="w-4 h-4 text-slate-500" />
                             <span className="text-[14px] font-medium text-slate-800">Images</span>
                             <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                           </div>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <p className="text-[12px] text-slate-500 mb-3">Add images to your campaign</p>
                         <div className="bg-[#e8f4fd] border border-blue-100 rounded-md p-3 mb-3 flex gap-2">
                           <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0 mt-0.5 text-blue-600 font-bold text-[9px]">i</div>
                           <p className="text-[11.5px] text-slate-700 leading-relaxed">
                             Images must meet the quality standards of Google Ads. Logo overlay, icon overlay, gif, and blurry or poorly cropped images aren't allowed.{" "}
                             <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                           </p>
                         </div>
                         <button className="text-[13px] text-blue-600 font-medium flex items-center gap-1 hover:underline">
                           <Plus className="w-4 h-4" /> Add images
                         </button>
                      </div>

                      {/* Business name Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-[14px] font-medium text-slate-800">Business name</span>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <p className="text-[11.5px] text-slate-500 mb-3 leading-relaxed">
                           This name should match your URL or your verified advertiser name, which is{" "}
                           <span className="font-medium text-slate-700">Shobha Shringer Jewellers</span>.
                         </p>
                         <input
                           type="text"
                           className="block w-full px-3 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                         />
                         <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                           Until you add a{" "}
                           <a href="#" className="text-blue-600 hover:underline">proposed name</a>, your campaign will run with a placeholder name created from your URL.
                         </p>
                      </div>

                      {/* Business logo Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                             <ImageIcon className="w-4 h-4 text-slate-500" />
                             <span className="text-[14px] font-medium text-slate-800">Business logo</span>
                           </div>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <p className="text-[11.5px] text-slate-500 mb-3">Add business logo to your campaign</p>
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center overflow-hidden shrink-0">
                             <span className="text-[10px] font-bold text-amber-800">LOGO</span>
                           </div>
                           <button className="flex items-center gap-1 text-[13px] text-blue-600 hover:underline font-medium">
                             <Pencil className="w-3.5 h-3.5" /> Edit
                           </button>
                         </div>
                      </div>

                      {/* Sitelinks Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-2">
                             <Link className="w-4 h-4 text-slate-500" />
                             <span className="text-[14px] font-medium text-slate-800">Sitelinks <HelpCircle className="w-3.5 h-3.5 text-slate-400 inline" /></span>
                           </div>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <div className="text-[12px] text-slate-600 mb-4">
                           Add links to your ads to take people to specific pages on your website.
                         </div>
                         <div className="flex flex-col gap-2 mb-3">
                           {[...Array(6)].map((_, i) => (
                             <div key={i} className="flex justify-between items-center p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
                               <div className="flex flex-col">
                                 <span className="text-[13px] text-slate-800">Sitelink {i + 1}</span>
                                 <span className="text-[11px] text-blue-600">Recommended</span>
                               </div>
                               <Plus className="w-4 h-4 text-blue-500" />
                             </div>
                           ))}
                         </div>
                         <button className="text-[13px] text-blue-600 font-medium flex items-center gap-1 hover:underline">
                           <Plus className="w-4 h-4" /> Sitelinks
                         </button>
                      </div>

                      {/* Callouts Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-2">
                             <List className="w-4 h-4 text-slate-500" />
                             <span className="text-[14px] font-medium text-slate-800">Callouts</span>
                             <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                           </div>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <p className="text-[12px] text-slate-500 mb-3">Add more business information</p>
                         <button className="text-[13px] text-blue-600 font-medium flex items-center gap-1 hover:underline">
                           <Plus className="w-4 h-4" /> Callouts
                         </button>
                      </div>

                      {/* Calls Sub-panel */}
                      <div className="bg-white border border-slate-200 rounded-md p-4">
                         <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                             <Phone className="w-4 h-4 text-slate-500" />
                             <span className="text-[14px] font-medium text-slate-800">Calls</span>
                             <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                           </div>
                           <ChevronUp className="w-4 h-4 text-slate-500" />
                         </div>
                         <p className="text-[12px] text-slate-500 mb-3">Add a phone number</p>
                         <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3 flex gap-2">
                           <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                           <p className="text-[11.5px] text-slate-700 leading-relaxed">
                             Because you selected <span className="font-medium">phone calls</span> as a campaign goal, add a call asset to use with your ads.
                           </p>
                         </div>
                         <button className="text-[13px] text-blue-600 font-medium flex items-center gap-1 hover:underline">
                           <Plus className="w-4 h-4" /> Calls
                         </button>
                      </div>

                      {/* More asset types */}
                      <div className="flex items-center gap-2 cursor-pointer mt-1 w-max">
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                        <span className="text-[13px] font-medium text-blue-600 hover:underline">More asset types (0/8)</span>
                      </div>
                      <div className="text-[12px] text-slate-500 pl-6 leading-tight max-w-[300px]">
                        Improve your ad performance and make your ad more interactive by adding more details about your business and website
                      </div>

                      {/* Ad URL options */}
                      <div className="flex items-center gap-2 cursor-pointer mt-1 w-max">
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                        <span className="text-[13px] font-medium text-blue-600 hover:underline">Ad URL options</span>
                      </div>

                    </div>

                    <div className="p-4 border-t border-slate-200 bg-white flex gap-4">
                      <button 
                        onClick={() => setIsCreatingAd(false)}
                        className="text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded transition-colors"
                      >
                        Done
                      </button>
                      <button 
                        onClick={() => setIsCreatingAd(false)}
                        className="text-[13px] font-medium text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview (Only when creating ad) */}
        {isCreatingAd && (
          <div className="w-[380px] shrink-0 sticky top-4">
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-slate-100">
                <span className="text-[14px] font-medium text-slate-800">Preview</span>
                <div className="flex gap-4">
                  <button className="text-[13px] text-blue-600 hover:underline">Share</button>
                  <button className="text-[13px] text-blue-600 hover:underline">Preview ads</button>
                </div>
              </div>
              
              <div className="p-6 flex flex-col items-center bg-slate-50 min-h-[500px]">
                 {/* Mobile Phone Mockup */}
                 <div className="w-[280px] h-[500px] border-[6px] border-slate-200 rounded-[32px] bg-white overflow-hidden shadow-sm relative flex flex-col">
                   <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-4">
                     <div className="w-4 h-0.5 bg-slate-400"></div>
                     <div className="text-blue-500 font-medium text-[15px] font-sans">Google</div>
                   </div>
                   <div className="p-4 flex-1">
                     <div className="w-full h-8 rounded-full border border-slate-200 mb-6 flex items-center px-3">
                       <Search className="w-3.5 h-3.5 text-slate-400" />
                     </div>
                     
                     {/* Ad Mockups */}
                     {[...Array(3)].map((_, i) => (
                       <div key={i} className="mb-6">
                         <div className="flex gap-2 mb-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                           <div className="flex flex-col gap-1">
                             <div className="w-24 h-2.5 bg-slate-200 rounded"></div>
                             <div className="w-16 h-2 bg-slate-100 rounded"></div>
                           </div>
                         </div>
                         <div className="w-full h-3 bg-slate-200 rounded mb-1.5"></div>
                         <div className="w-3/4 h-3 bg-slate-200 rounded mb-2"></div>
                         <div className="w-full h-2 bg-slate-100 rounded mb-1"></div>
                         <div className="w-5/6 h-2 bg-slate-100 rounded"></div>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="flex gap-1.5 mt-6">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                 </div>
              </div>
              
              <div className="px-4 pb-2 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed text-center pt-3">
                Previews shown here are examples and don't include all possible formats. You're responsible for the content of your ads. Please make sure that your provided assets don't violate any Google policies or applicable laws, either individually, or in combination.
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                 <div className="border border-slate-200 rounded-md p-3 flex gap-3 shadow-sm bg-white">
                   <List className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                   <div className="text-[11.5px] text-slate-700 leading-snug">
                     <strong>Add callouts:</strong> Help your ads show more prominently by adding callouts.{" "}
                     <HelpCircle className="w-3 h-3 inline text-slate-400" />
                   </div>
                 </div>
                 <div className="border border-slate-200 rounded-md p-3 flex gap-3 shadow-sm bg-white">
                   <ImageIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                   <div className="text-[11.5px] text-slate-700 leading-snug">
                     <strong>Add images:</strong> Draw more attention to your ads by adding at least 4 images.{" "}
                     <HelpCircle className="w-3 h-3 inline text-slate-400" />
                   </div>
                 </div>
                 <div className="border border-slate-200 rounded-md p-3 flex gap-3 shadow-sm bg-white">
                   <Link className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                   <div className="text-[11.5px] text-slate-700 leading-snug">
                     <strong>Add sitelinks:</strong> Draw more attention to your ads by adding at least 4 sitelinks.{" "}
                     <HelpCircle className="w-3 h-3 inline text-slate-400" />
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 w-full">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
