import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";

interface AssetExtensionsStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export default function GoogleAdsAssetExtensionsStep({ onNext, onBack }: AssetExtensionsStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();

  const [sitelinks, setSitelinks] = useState<any[]>(payload.assetExtensions?.sitelinks || []);
  const [callouts, setCallouts] = useState<any[]>(payload.assetExtensions?.callouts || []);
  const [structuredSnippets, setStructuredSnippets] = useState<any[]>(payload.assetExtensions?.structuredSnippets || []);
  const [calls, setCalls] = useState<any[]>(payload.assetExtensions?.calls || []);
  const [activeTab, setActiveTab] = useState<'sitelinks' | 'callouts' | 'snippets' | 'calls'>('sitelinks');

  useEffect(() => {
    updatePayload({
      assetExtensions: {
        sitelinks,
        callouts,
        structuredSnippets,
        calls
      }
    });
  }, [sitelinks, callouts, structuredSnippets, calls, updatePayload]);

  return (
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <div className="mb-6">
        <h1 className="text-[24px] text-slate-800 font-normal mb-2">Asset Extensions</h1>
        <p className="text-[13px] text-slate-600">Get up to 15% higher clickthrough rate by showing additional information on your ads.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('sitelinks')}
          className={`pb-3 px-2 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'sitelinks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Sitelinks ({sitelinks.length})
        </button>
        <button 
          onClick={() => setActiveTab('callouts')}
          className={`pb-3 px-2 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'callouts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Callouts ({callouts.length})
        </button>
        <button 
          onClick={() => setActiveTab('snippets')}
          className={`pb-3 px-2 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'snippets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Structured Snippets ({structuredSnippets.length})
        </button>
        <button 
          onClick={() => setActiveTab('calls')}
          className={`pb-3 px-2 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'calls' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Calls ({calls.length})
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {activeTab === 'sitelinks' && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-[14px] text-slate-800 font-medium">Sitelinks</h2>
              <p className="text-[12px] text-slate-500 mt-1">Add links to specific pages of your website</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {sitelinks.map((sl, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 border border-slate-100 bg-slate-50 rounded-md">
                  <div className="flex-1 flex flex-col gap-3">
                    <input 
                      type="text" 
                      placeholder="Sitelink text (e.g. Shop Now)" 
                      value={sl.text}
                      onChange={(e) => {
                        const newLinks = [...sitelinks];
                        newLinks[idx].text = e.target.value;
                        setSitelinks(newLinks);
                      }}
                      className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full"
                    />
                    <input 
                      type="text" 
                      placeholder="Description 1 (recommended)" 
                      value={sl.description1}
                      onChange={(e) => {
                        const newLinks = [...sitelinks];
                        newLinks[idx].description1 = e.target.value;
                        setSitelinks(newLinks);
                      }}
                      className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full"
                    />
                    <input 
                      type="text" 
                      placeholder="Description 2 (recommended)" 
                      value={sl.description2}
                      onChange={(e) => {
                        const newLinks = [...sitelinks];
                        newLinks[idx].description2 = e.target.value;
                        setSitelinks(newLinks);
                      }}
                      className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full"
                    />
                    <input 
                      type="text" 
                      placeholder="Final URL" 
                      value={sl.finalUrl}
                      onChange={(e) => {
                        const newLinks = [...sitelinks];
                        newLinks[idx].finalUrl = e.target.value;
                        setSitelinks(newLinks);
                      }}
                      className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full"
                    />
                  </div>
                  <button onClick={() => setSitelinks(sitelinks.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setSitelinks([...sitelinks, { text: "", description1: "", description2: "", finalUrl: "" }])}
                className="flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:underline w-fit mt-2"
              >
                <Plus className="w-4 h-4" /> Add sitelink
              </button>
            </div>
          </div>
        )}

        {activeTab === 'callouts' && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-[14px] text-slate-800 font-medium">Callouts</h2>
              <p className="text-[12px] text-slate-500 mt-1">Add descriptive text to your ad to help people learn more</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {callouts.map((co, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <input 
                    type="text" 
                    placeholder="Callout text (e.g. Free shipping, 24/7 Support)" 
                    value={co.text}
                    onChange={(e) => {
                      const newCallouts = [...callouts];
                      newCallouts[idx].text = e.target.value;
                      setCallouts(newCallouts);
                    }}
                    className="border border-slate-300 rounded px-3 py-2 text-[13px] flex-1 max-w-[400px]"
                  />
                  <button onClick={() => setCallouts(callouts.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setCallouts([...callouts, { text: "" }])}
                className="flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:underline w-fit mt-2"
              >
                <Plus className="w-4 h-4" /> Add callout
              </button>
            </div>
          </div>
        )}

        {activeTab === 'snippets' && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-[14px] text-slate-800 font-medium">Structured Snippets</h2>
              <p className="text-[12px] text-slate-500 mt-1">Highlight specific aspects of your products or services</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {structuredSnippets.map((ss, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 border border-slate-100 bg-slate-50 rounded-md">
                  <div className="flex-1 flex flex-col gap-3">
                    <select 
                      value={ss.header}
                      onChange={(e) => {
                        const newSnippets = [...structuredSnippets];
                        newSnippets[idx].header = e.target.value;
                        setStructuredSnippets(newSnippets);
                      }}
                      className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full max-w-[200px]"
                    >
                      <option value="Amenities">Amenities</option>
                      <option value="Brands">Brands</option>
                      <option value="Courses">Courses</option>
                      <option value="Degree programs">Degree programs</option>
                      <option value="Destinations">Destinations</option>
                      <option value="Featured hotels">Featured hotels</option>
                      <option value="Insurance coverage">Insurance coverage</option>
                      <option value="Models">Models</option>
                      <option value="Neighborhoods">Neighborhoods</option>
                      <option value="Service catalog">Service catalog</option>
                      <option value="Shows">Shows</option>
                      <option value="Styles">Styles</option>
                      <option value="Types">Types</option>
                    </select>
                    
                    {ss.values.map((v: string, vIdx: number) => (
                      <div key={vIdx} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={`Value ${vIdx + 1}`} 
                          value={v}
                          onChange={(e) => {
                            const newSnippets = [...structuredSnippets];
                            newSnippets[idx].values[vIdx] = e.target.value;
                            setStructuredSnippets(newSnippets);
                          }}
                          className="border border-slate-300 rounded px-3 py-2 text-[13px] flex-1 max-w-[300px]"
                        />
                        <button onClick={() => {
                          const newSnippets = [...structuredSnippets];
                          newSnippets[idx].values.splice(vIdx, 1);
                          setStructuredSnippets(newSnippets);
                        }} className="text-slate-400 hover:text-red-500 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newSnippets = [...structuredSnippets];
                        newSnippets[idx].values.push("");
                        setStructuredSnippets(newSnippets);
                      }}
                      className="flex items-center gap-1 text-[12px] font-medium text-slate-600 hover:text-blue-600 w-fit"
                    >
                      <Plus className="w-3 h-3" /> Add value
                    </button>
                  </div>
                  <button onClick={() => setStructuredSnippets(structuredSnippets.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setStructuredSnippets([...structuredSnippets, { header: "Brands", values: ["", "", ""] }])}
                className="flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:underline w-fit mt-2"
              >
                <Plus className="w-4 h-4" /> Add structured snippet
              </button>
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-[14px] text-slate-800 font-medium">Call Assets</h2>
              <p className="text-[12px] text-slate-500 mt-1">Encourage people to call your business by adding a phone number to your ad</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {calls.map((c, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 border border-slate-100 bg-slate-50 rounded-md">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <select 
                        value={c.countryCode}
                        onChange={(e) => {
                          const newCalls = [...calls];
                          newCalls[idx].countryCode = e.target.value;
                          setCalls(newCalls);
                        }}
                        className="border border-slate-300 rounded px-3 py-2 text-[13px] w-[140px] bg-white"
                      >
                        <option value="US">United States</option>
                        <option value="IN">India</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Phone number" 
                        value={c.phoneNumber}
                        onChange={(e) => {
                          const newCalls = [...calls];
                          newCalls[idx].phoneNumber = e.target.value;
                          setCalls(newCalls);
                        }}
                        className="border border-slate-300 rounded px-3 py-2 text-[13px] flex-1 max-w-[300px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-slate-700">Conversion action (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Calls from ads" 
                        value={c.conversionAction || ""}
                        onChange={(e) => {
                          const newCalls = [...calls];
                          newCalls[idx].conversionAction = e.target.value;
                          setCalls(newCalls);
                        }}
                        className="border border-slate-300 rounded px-3 py-2 text-[13px] w-full max-w-[452px]"
                      />
                    </div>
                  </div>
                  <button onClick={() => setCalls(calls.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setCalls([...calls, { countryCode: "IN", phoneNumber: "", conversionAction: "" }])}
                className="flex items-center gap-2 text-[13px] font-medium text-blue-600 hover:underline w-fit mt-2"
              >
                <Plus className="w-4 h-4" /> Add call asset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center w-full">
         <button 
           onClick={onBack}
           className="text-blue-600 hover:underline text-[13px] font-medium"
         >
           Back
         </button>
         <button 
           onClick={onNext}
           className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-6 py-2 rounded shadow-sm transition-colors"
         >
           Next
         </button>
      </div>
    </div>
  );
}
