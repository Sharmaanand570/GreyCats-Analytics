import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, HelpCircle, Plus, Smartphone, Share2, ThumbsUp, ThumbsDown, MessageSquare, PlusCircle } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { uploadAssetBinary } from "../API/campaignManagementApi";

export default function GoogleAdsDemandGenAdStep() {
  const [openSections, setOpenSections] = useState({
    adType: true,
    adName: true,
    finalUrl: true,
    media: true,
    text: true,
    assetOpt: true,
  });

  const { payload, updatePayload } = useCampaignWizardContext();

  const initialHeadline = payload.assets?.find(a => a.type === "HEADLINE")?.text || "";
  const initialDescription = payload.assets?.find(a => a.type === "DESCRIPTION")?.text || "";

  const [headline] = useState(initialHeadline);
  const [description] = useState(initialDescription);
  const [cta] = useState("Learn More");
  const [audiences] = useState<any[]>(payload.adGroups?.[0]?.audienceSignals || []);

  const [assets, setAssets] = useState<any[]>(payload.assets || []);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [logoIds, setLogoIds] = useState<string[]>([]);
  const [videoIds, setVideoIds] = useState<string[]>([]);

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

        if (type === "IMAGE") setImageIds(prev => [...prev, res.assetId]);
        if (type === "LOGO") setLogoIds(prev => [...prev, res.assetId]);
        if (type === "VIDEO") setVideoIds(prev => [...prev, res.assetId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    updatePayload({
      adGroups: [
        {
          name: "Demand Gen Ad Group",
          audienceSignals: audiences
        }
      ] as any,
      ads: [
        {
          type: "DEMAND_GEN_AD",
          finalUrls: ["https://example.com"],
          demandGenAd: {
            headlines: headline ? [headline] : [],
            descriptions: description ? [description] : [],
            callToAction: cta,
            images: imageIds,
            logos: logoIds,
            videos: videoIds
          }
        }
      ],
      assets: assets
    } as any);
  }, [headline, description, cta, audiences, imageIds, logoIds, videoIds, assets, updatePayload]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex gap-6 items-start">
      {/* Left Column: Forms */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Choose which type of ad to create */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('adType')}>
             <h2 className="text-[14px] text-slate-800 font-medium">Choose which type of ad to create</h2>
             {openSections.adType ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {openSections.adType && (
            <div className="p-6 flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="adType" className="mt-1 w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-[13px] text-slate-800 font-medium">Single image ad</div>
                  <div className="text-[12px] text-slate-500">Show ads with a single image</div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="adType" defaultChecked className="mt-1 w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-[13px] text-slate-800 font-medium">Video ad</div>
                  <div className="text-[12px] text-slate-500">Show ads with a single video</div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="adType" className="mt-1 w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-[13px] text-slate-800 font-medium">Carousel image ad</div>
                  <div className="text-[12px] text-slate-500">Show ads with multiple images in a carousel</div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Ad name */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('adName')}>
             <h2 className="text-[14px] text-slate-800 font-medium">Ad name</h2>
             {openSections.adName ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {openSections.adName && (
            <div className="p-6">
              <div className="relative">
                <input type="text" defaultValue="Ad 1" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <div className="absolute right-3 top-2.5 text-[11px] text-slate-400">4 / 255</div>
              </div>
            </div>
          )}
        </div>

        {/* Final URL */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('finalUrl')}>
             <h2 className="text-[14px] text-slate-800 font-medium">Final URL</h2>
             {openSections.finalUrl ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {openSections.finalUrl && (
            <div className="p-6">
              <div className="flex">
                <select className="border border-slate-300 border-r-0 rounded-l px-3 py-2 text-[13px] text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option>https://</option>
                  <option>http://</option>
                </select>
                <div className="relative flex-1">
                  <input type="text" placeholder="Final URL" className="w-full border border-slate-300 rounded-r px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <HelpCircle className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>
              <div className="text-[11px] text-red-600 mt-1 pl-[86px]">Required</div>
            </div>
          )}
        </div>

        {/* Media */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('media')}>
             <h2 className="text-[14px] text-slate-800 font-medium">Media</h2>
             {openSections.media ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {openSections.media && (
            <div className="p-6 flex flex-col gap-6">
              
              {/* Images */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-[13px] font-medium text-slate-800">Images</div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-500 mb-3">Add up to 20 images</div>
                <label className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer w-max mb-1">
                  <Plus className="w-4 h-4" /> Add
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(e, "IMAGE")} />
                </label>
                <div className="text-[11px] text-red-600">Required</div>
              </div>

              <div className="border-t border-slate-100"></div>

              {/* Videos */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-[13px] font-medium text-slate-800">Videos</div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-500 mb-3">Add up to 5 videos</div>
                
                <div className="relative mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
                  <input type="text" placeholder="Search for a video or paste the URL from YouTube" className="w-full border border-slate-300 rounded pl-9 pr-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="text-[11px] text-red-600 mb-3">Required</div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add
                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleAssetUpload(e, "VIDEO")} />
                  </label>
                  <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" /> Create video <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-1 text-[10px] uppercase font-bold ml-1">Beta</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100"></div>

              {/* Logos */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-[13px] font-medium text-slate-800">Logos</div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-500 mb-3">Add a logo</div>
                
                <label className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700 mb-1 cursor-pointer w-max">
                  <Plus className="w-4 h-4" /> Add
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(e, "LOGO")} />
                </label>
                <div className="text-[11px] text-red-600">Required</div>
              </div>

            </div>
          )}
        </div>

        {/* Text */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('text')}>
             <h2 className="text-[14px] text-slate-800 font-medium">Text</h2>
             {openSections.text ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {openSections.text && (
            <div className="p-6 flex flex-col gap-6">
              
              {/* Headline */}
              <div>
                <div className="text-[13px] font-medium text-slate-800 mb-1">Headline</div>
                <div className="text-[11px] text-slate-500 mb-3">Add up to 5 headlines</div>
                <div className="relative mb-1">
                  <input type="text" placeholder="Headline" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <div className="absolute right-3 top-2.5 text-[11px] text-slate-400">0/40</div>
                </div>
                <div className="text-[11px] text-red-600 mb-3">Required</div>
                <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="w-4 h-4" /> Headline
                </button>
              </div>

              {/* Long Headline */}
              <div>
                <div className="text-[13px] font-medium text-slate-800 mb-1">Long headline</div>
                <div className="text-[11px] text-slate-500 mb-3">Add up to 5 long headlines</div>
                <div className="relative mb-1">
                  <input type="text" placeholder="Long headline" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <div className="absolute right-3 top-2.5 text-[11px] text-slate-400">0/90</div>
                </div>
                <div className="text-[11px] text-red-600 mb-3">Required</div>
                <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="w-4 h-4" /> Long headline
                </button>
              </div>

              {/* Description */}
              <div>
                <div className="text-[13px] font-medium text-slate-800 mb-1">Description</div>
                <div className="text-[11px] text-slate-500 mb-3">Add up to 5 descriptions</div>
                <div className="relative mb-1">
                  <input type="text" placeholder="Description" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <div className="absolute right-3 top-2.5 text-[11px] text-slate-400">0/90</div>
                </div>
                <div className="text-[11px] text-red-600 mb-3">Required</div>
                <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="w-4 h-4" /> Description
                </button>
              </div>

              {/* CTA */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="text-[13px] font-medium text-slate-800">Call to action text</div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <select className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>(Automated)</option>
                  <option>Learn more</option>
                  <option>Shop now</option>
                  <option>Sign up</option>
                </select>
              </div>

              {/* Business Name */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="text-[13px] font-medium text-slate-800">Business name</div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="relative mb-1">
                  <input type="text" placeholder="Business name" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <div className="absolute right-3 top-2.5 text-[11px] text-slate-400">0/25</div>
                </div>
                <div className="text-[11px] text-red-600 mb-3">Required</div>
              </div>

              {/* Sitelinks */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-[13px] font-medium text-slate-800">Sitelinks</div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-500 mb-3">Add 4 or more to maximize performance</div>
                <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="w-4 h-4" /> Sitelinks
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Asset optimization */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50" onClick={() => toggleSection('assetOpt')}>
             <h2 className="text-[14px] text-slate-800 font-medium">Asset optimization</h2>
             {openSections.assetOpt ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
          {openSections.assetOpt && (
            <div className="p-6">
              <div className="text-[12px] text-slate-600 mb-6 leading-relaxed">
                Let Google AI use your existing ad content to create optimized assets. This helps improve ad coverage and drive conversions. <a href="#" className="text-blue-600 hover:underline border-b border-blue-600 border-dashed pb-[1px]">How it works</a>
              </div>
              
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-800 mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M8 8l8 4-8 4V8z"/></svg>
                    Video
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-800">Shorter videos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">✓</div>
                      <span className="text-[12px] text-blue-600 font-medium">On</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-800">Resized videos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">✓</div>
                      <span className="text-[12px] text-blue-600 font-medium">On</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-800 mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Image
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[13px] text-slate-800">Landing page previews</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">✓</div>
                      <span className="text-[12px] text-blue-600 font-medium">On</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[13px] text-blue-600 font-medium cursor-pointer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Manage
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed mt-2">
                  By turning on landing page previews, you confirm that you own all legal rights to the images and have permission to share them with Google for use on your behalf for advertising or other commercial purposes.
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Preview */}
      <div className="w-[380px] shrink-0 flex flex-col gap-4 sticky top-0">
        
        {/* Ad Strength */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden p-6">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full border-4 border-slate-100 flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-blue-500 rotate-45"></div>
               </div>
               <div className="text-[13px] font-medium text-slate-800">Ad strength: <span className="font-normal text-slate-600">Incomplete</span></div>
             </div>
             <HelpCircle className="w-4 h-4 text-slate-400" />
           </div>

           <div className="grid grid-cols-2 gap-y-3 mb-6">
             <div className="flex items-center gap-2 text-[12px] text-slate-600">
               <div className="w-3 h-3 rounded-full border border-blue-600"></div>
               Videos
             </div>
             <div className="flex items-center gap-2 text-[12px] text-slate-600">
               <div className="w-3 h-3 rounded-full border border-blue-600"></div>
               Headlines
             </div>
             <div className="flex items-center gap-2 text-[12px] text-slate-600">
               <div className="w-3 h-3 rounded-full border border-blue-600"></div>
               Descriptions
             </div>
           </div>

           <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[12px] text-slate-500">
             Add a final URL
             <div className="flex items-center gap-2">
               <ChevronUp className="w-4 h-4 rotate-[-90deg] text-slate-300" />
               <ChevronUp className="w-4 h-4 rotate-[90deg] text-slate-600" />
             </div>
           </div>
        </div>

        {/* Preview Frame */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-[14px] font-medium text-slate-800">Preview</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 cursor-pointer">
                <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[12px] text-slate-700">Mobile</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-center gap-1 cursor-pointer text-blue-600">
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[12px] font-medium">Share</span>
              </div>
              <div className="text-[12px] font-medium text-blue-600 cursor-pointer">View more</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <div className="flex-1 flex flex-col items-center justify-center py-2 border-b-2 border-blue-600 bg-slate-50 cursor-pointer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600 mb-1"><path d="M21.582 6.186a2.665 2.665 0 0 0-1.875-1.882c-1.654-.446-8.272-.446-8.272-.446s-6.618 0-8.272.446a2.665 2.665 0 0 0-1.875 1.882C.843 7.846.843 11.8.843 11.8s0 3.954.445 5.614a2.665 2.665 0 0 0 1.875 1.882c1.654.446 8.272.446 8.272.446s6.618 0 8.272-.446a2.665 2.665 0 0 0 1.875-1.882c.445-1.66.445-5.614.445-5.614s0-3.954-.445-5.614z"/><path fill="white" d="M10.156 15.086l6.098-3.286-6.098-3.286z"/></svg>
              <span className="text-[11px] font-medium text-blue-600">YouTube</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-slate-50">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mb-1"><path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z" fill="#EA4335"/><path d="M12 17L18 21L16 14L22 9H15L12 2L12 17Z" fill="#FBBC05"/><path d="M12 2L9 9H2L8 14L6 21L12 17V2Z" fill="#4285F4"/><path d="M8 14L2 9H9L12 2L12 17L6 21L8 14Z" fill="#34A853"/></svg>
              <span className="text-[11px] font-medium text-slate-600">Discover</span>
            </div>
          </div>

          <div className="text-center py-3 text-[13px] text-slate-800 font-medium">
            YouTube shorts ad
          </div>

          {/* Phone Frame */}
          <div className="flex-1 bg-white p-6 flex justify-center items-center relative min-h-[500px]">
             <ChevronUp className="w-5 h-5 text-slate-300 absolute left-2 rotate-[-90deg] cursor-pointer" />
             
             <div className="w-[260px] h-[520px] rounded-[32px] border-[6px] border-slate-100 shadow-sm relative overflow-hidden bg-slate-50 flex flex-col">
                <div className="w-1/3 h-4 bg-slate-100 absolute top-0 left-1/2 transform -translate-x-1/2 rounded-b-xl z-10"></div>
                
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden mt-8 mb-16">
                  {/* Video Area */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-500">
                    <span className="text-white text-xs font-medium tracking-widest text-center px-4 leading-loose">THIS IS A DEMO VIDEO</span>
                  </div>

                  {/* Overlay Controls */}
                  <div className="absolute right-2 bottom-4 flex flex-col items-center gap-4">
                    <ThumbsUp className="w-6 h-6 text-white" />
                    <ThumbsDown className="w-6 h-6 text-white" />
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-4 left-3 right-12">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-white/20"></div>
                      <span className="text-white text-[11px] font-medium">Business name</span>
                      <button className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">Subscribe</button>
                    </div>
                    <div className="text-white text-[11px]">Description</div>
                  </div>
                </div>

                {/* Fixed Bottom CTA */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4 px-4 z-20">
                  <button className="w-full bg-white text-slate-800 text-[13px] font-medium py-2 rounded-full shadow flex items-center justify-center gap-2">
                    Learn more
                  </button>
                </div>
                
                {/* Bottom App Navigation Fake */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-white flex items-center justify-around border-t border-slate-200">
                  <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                  <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                  <PlusCircle className="w-6 h-6 text-slate-800" />
                  <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                  <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                </div>
             </div>

             <ChevronUp className="w-5 h-5 text-slate-600 absolute right-2 rotate-[90deg] cursor-pointer" />
          </div>

          <div className="flex justify-center gap-1.5 pb-4 bg-white">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed text-center">
            Previews shown here are examples and don't include all possible formats. You're responsible for the content of your ads. Please make sure that your provided assets don't violate any Google policies or applicable laws, either individually, or in combination.
          </div>
        </div>
        
      </div>
    </div>
  );
}
