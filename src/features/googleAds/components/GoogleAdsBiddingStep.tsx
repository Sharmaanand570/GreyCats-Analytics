import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, HelpCircle, TriangleAlert } from "lucide-react";

interface BiddingStepProps {
  onNext: () => void;
  activeSubStep?: string;
  onSubStepChange?: (step: string) => void;
  campaignType?: string;
}

export default function GoogleAdsBiddingStep({ onNext, activeSubStep, onSubStepChange, campaignType = "Search" }: BiddingStepProps) {
  const [biddingFocus, setBiddingFocus] = useState("Conversions");
  const [isBiddingDropdownOpen, setIsBiddingDropdownOpen] = useState(false);
  const [setTargetAction, setSetTargetAction] = useState(true); // Checked by default in screenshot
  
  const [acquireNew, setAcquireNew] = useState(false);
  const [showAcquireModal, setShowAcquireModal] = useState(false);
  const [acquireStrategy, setAcquireStrategy] = useState("maximize");
  
  const [reengageLapsed, setReengageLapsed] = useState(false);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (!onSubStepChange) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible panel
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position to find the highest one on screen
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const activeId = visibleEntries[0].target.id.replace('panel-', '');
          onSubStepChange(activeId);
        }
      },
      { rootMargin: "-10% 0px -80% 0px" } // triggers when element is near top of viewport
    );
    
    const panels = document.querySelectorAll('.bidding-panel-section');
    panels.forEach(p => observer.observe(p));
    
    return () => observer.disconnect();
  }, [onSubStepChange]);

  const handleAcquireCheck = () => {
    if (!acquireNew) {
      setShowAcquireModal(true);
    } else {
      setAcquireNew(false);
    }
  };

  const confirmAcquireModal = () => {
    setAcquireNew(true);
    setShowAcquireModal(false);
  };

  return (
    <div className="flex flex-col max-w-[800px] mx-auto pb-20 relative">
      <h1 className="text-[24px] font-normal text-slate-800 mb-6">Bidding</h1>

      <div className="flex flex-col gap-4">
        {/* Bidding Panel */}
        <div 
          id="panel-bidding" 
          onClick={() => onSubStepChange?.('bidding')}
          className={`bidding-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'bidding' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'bidding' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Bidding</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6">
             <div className="mb-6">
               {campaignType === "Search" ? (
                 <div className="text-[13px] text-slate-800 mb-4 font-medium">Maximize conversions</div>
               ) : (
                 <>
                   <div className="flex items-center gap-1 mb-2">
                     <label className="text-[13px] text-slate-800">What do you want to focus on?</label>
                     <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                   </div>
                   <div className="relative">
                     <div 
                       className="border border-slate-300 rounded-md px-3 py-2 flex items-center justify-between w-[200px] cursor-pointer hover:bg-slate-50"
                       onClick={() => setIsBiddingDropdownOpen(!isBiddingDropdownOpen)}
                     >
                        <span className="text-[13px] text-slate-800">{biddingFocus}</span>
                        <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </div>
                     {isBiddingDropdownOpen && (
                       <div className="absolute top-[100%] mt-1 left-0 w-[200px] bg-white border border-slate-200 shadow-lg rounded-md z-10 py-1">
                         <div 
                           className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-slate-100 ${biddingFocus === "Conversions" ? "bg-slate-50" : ""}`}
                           onClick={() => { setBiddingFocus("Conversions"); setIsBiddingDropdownOpen(false); }}
                         >
                           Conversions
                         </div>
                         <div 
                           className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-slate-100 ${biddingFocus === "Conversion value" ? "bg-slate-50" : ""}`}
                           onClick={() => { setBiddingFocus("Conversion value"); setIsBiddingDropdownOpen(false); }}
                         >
                           Conversion value
                         </div>
                       </div>
                     )}
                   </div>
                 </>
               )}
             </div>

             <div className="flex flex-col gap-4">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={setTargetAction}
                   onChange={() => setSetTargetAction(!setTargetAction)}
                   className="w-4 h-4 rounded border-slate-300 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">
                   {biddingFocus === "Conversions" ? "Set a target cost per action (optional)" : "Set a target return on ad spend (optional)"}
                 </span>
               </label>
               
               {setTargetAction && biddingFocus === "Conversions" && (
                 <div className="pl-7">
                   <div className="flex items-center gap-1 mb-2">
                     <span className="text-[13px] text-slate-800">Target CPA</span>
                     <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                   </div>
                   <input 
                     type="text" 
                     defaultValue="₹ "
                     className="w-[120px] border border-slate-300 rounded px-3 py-1.5 text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-2"
                   />
                   
                   {campaignType === "Search" && (
                     <div className="mb-4">
                       <a href="#" className="text-[13px] text-blue-600 hover:underline flex items-center gap-1 w-max">
                         Change bid strategy <HelpCircle className="w-3.5 h-3.5" />
                       </a>
                     </div>
                   )}
                   
                   <div className="bg-[#f8fbff] border border-blue-100 rounded p-4 flex items-center justify-between mb-4 max-w-[700px]">
                     <div className="flex items-start gap-3">
                       <div className="mt-0.5"><svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></div>
                       <div className="text-[12px] text-slate-800">
                         <strong>Set a target CPA:</strong> Get more conversions at a similar CPA by setting a target and staying unconstrained by budget. <HelpCircle className="w-3.5 h-3.5 text-slate-500 inline ml-1 mb-0.5" />
                       </div>
                     </div>
                     <button className="text-[13px] font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4">
                       Apply
                     </button>
                   </div>
                 </div>
               )}

               <div className="text-[12px] text-slate-500 mt-2">
                 Alternative bid strategies like portfolios are available in settings after you create your campaign
               </div>
             </div>
          </div>
        </div>

        {/* Customer Acquisition Panel */}
        <div 
          id="panel-acquisition" 
          onClick={() => onSubStepChange?.('acquisition')}
          className={`bidding-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'acquisition' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
        >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <div className="flex items-center gap-12 w-full">
               <h2 className={`text-[14px] w-[180px] ${activeSubStep === 'acquisition' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Customer acquisition</h2>
               {activeSubStep !== 'acquisition' && (
                 <span className="text-[13px] text-slate-600">Bid equally for new and existing customers</span>
               )}
             </div>
             {activeSubStep === 'acquisition' ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
          </div>
          {activeSubStep === 'acquisition' && (
            <div className="p-6 flex items-start">
             <div className="flex-1 pr-6 flex flex-col">
               <label className="flex items-center gap-3 cursor-pointer mt-1">
                 <input 
                   type="checkbox" 
                   checked={acquireNew}
                   onChange={handleAcquireCheck}
                   className="w-4 h-4 rounded border-slate-300 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">Adjust your bidding to help acquire new customers</span>
               </label>
               
               {acquireNew && (
                 <div className="pl-7 pt-4 flex flex-col gap-6 mt-2">
                   <label className="flex items-start gap-3 cursor-pointer">
                     <input 
                       type="radio" 
                       name="acq_strat_main"
                       checked={acquireStrategy === "maximize"}
                       onChange={() => setAcquireStrategy("maximize")}
                       className="mt-1 w-4 h-4 text-blue-600" 
                     />
                     <div>
                       <div className="text-[13px] font-medium text-slate-800 mb-1">Bid higher for new customers (recommended)</div>
                       <div className="text-[12px] text-slate-500 mb-3 max-w-[400px]">
                         Your campaign will help you acquire new customers, while driving overall purchases by reaching all customers
                       </div>
                       <button className="border border-slate-300 text-blue-600 text-[13px] font-medium px-4 py-1.5 rounded hover:bg-blue-50 transition-colors">
                         Set up
                       </button>
                     </div>
                   </label>

                   <div className="bg-[#fef7e0] border border-[#fce8b2] rounded-md p-4 ml-7 flex flex-col gap-4 w-full max-w-[500px]">
                     <div className="flex gap-3">
                       <TriangleAlert className="w-5 h-5 text-amber-700 shrink-0" />
                       <div className="text-[13px] text-slate-800">
                         To use customer acquisition, you need to include an audience segment with at least 1,000 active members in at least one network to help identify existing customers.
                         <div className="mt-2"><a href="#" className="text-amber-700 font-medium hover:underline">Define existing customer list</a></div>
                       </div>
                     </div>
                   </div>

                   <div className="bg-[#fef7e0] border border-[#fce8b2] rounded-md p-4 ml-7 flex gap-3 w-full max-w-[500px]">
                     <TriangleAlert className="w-5 h-5 text-amber-700 shrink-0" />
                     <div className="text-[13px] text-slate-800">
                       To use this customer acquisition option, change your bidding strategy type to <strong>Maximize conversion value</strong>.
                     </div>
                   </div>

                   <label className="flex items-start gap-3 cursor-pointer mt-2">
                     <input 
                       type="radio" 
                       name="acq_strat_main"
                       checked={acquireStrategy === "only"}
                       onChange={() => setAcquireStrategy("only")}
                       className="mt-1 w-4 h-4 text-blue-600" 
                     />
                     <div>
                       <div className="text-[13px] font-medium text-slate-800 mb-1">Only bid for new customers</div>
                       <div className="text-[12px] text-slate-500 max-w-[400px]">
                         Your campaign will be limited to only new customers, regardless of your bid strategy
                       </div>
                     </div>
                   </label>
                 </div>
               )}
             </div>

             <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600">
               {!acquireNew ? (
                 <div className="leading-snug">
                   By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" className="text-blue-600 hover:underline">Learn more about customer acquisition</a>
                 </div>
               ) : (
                 <div className="leading-snug">
                   <div className="text-slate-800 mb-2">To set up customer acquisition:</div>
                   <ul className="list-disc pl-4 flex flex-col gap-1 mb-4">
                     <li>Use a "Purchases" conversion goal</li>
                     <li>Use "Maximize conversion value" bid strategy</li>
                     <li>Set up an "Incremental conversion value from new customers"</li>
                     <li>Add an audience segment with more than 1,000 members in at least 1 network in your customer acquisition settings</li>
                   </ul>
                   <a href="#" className="text-blue-600 hover:underline">Learn more about how to acquire new customers</a>
                 </div>
               )}
             </div>
            </div>
          )}
        </div>

        {/* Customer Retention Panel */}
        {campaignType === "Performance Max" && (
          <div 
            id="panel-retention" 
            onClick={() => onSubStepChange?.('retention')}
            className={`bidding-panel-section bg-white border shadow-sm rounded-md overflow-hidden transition-all duration-200 ${activeSubStep === 'retention' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200'}`}
          >
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50">
             <h2 className={`text-[14px] ${activeSubStep === 'retention' ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>Customer retention</h2>
             <ChevronUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="p-6 flex items-start">
             <div className="flex-1 pr-6 flex flex-col">
               <label className="flex items-center gap-3 cursor-pointer mt-1">
                 <input 
                   type="checkbox" 
                   checked={reengageLapsed}
                   onChange={() => setReengageLapsed(!reengageLapsed)}
                   className="w-4 h-4 rounded border-slate-300 text-blue-600" 
                 />
                 <span className="text-[13px] text-slate-800">Adjust your bidding to help re-engage lapsed customers</span>
               </label>
               
               {reengageLapsed && (
                 <div className="pl-7 pt-4 flex flex-col gap-4 mt-2">
                   <button className="border border-slate-300 text-blue-600 text-[13px] font-medium px-4 py-1.5 rounded hover:bg-blue-50 transition-colors self-start">
                     Set up
                   </button>
                   
                   <div className="bg-red-50 border border-red-100 rounded-md p-4 flex gap-3 w-full max-w-[500px]">
                     <div className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full border border-red-700 text-red-700 mt-0.5">
                       <span className="text-xs font-bold">!</span>
                     </div>
                     <div className="text-[13px] text-slate-800">
                       To use this customer retention option, enter additional value for lapsed customers. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                       <div className="mt-4"><button className="text-red-700 font-medium hover:bg-red-100 px-2 py-1 -ml-2 rounded transition-colors">Add value</button></div>
                     </div>
                   </div>
                 </div>
               )}
             </div>

             <div className="w-[300px] shrink-0 border-l border-slate-200 pl-6 text-[12px] text-slate-600">
               {!reengageLapsed ? (
                 <div className="leading-snug">
                   By default, your campaign does not adjust bidding to re-engage lapsed customers. However, you can configure your customer acquisition settings to optimize for winning back lapsed customers.
                   <div className="mt-1"><a href="#" className="text-blue-600 hover:underline">Learn more about how to re-engage lapsed customers</a></div>
                 </div>
               ) : (
                 <div className="leading-snug">
                   <div className="text-slate-800 mb-2">To set up customer retention:</div>
                   <ul className="list-disc pl-4 flex flex-col gap-1 mb-4">
                     <li>Use a "Purchases" conversion goal</li>
                     <li>Use "Maximize conversion value" bid strategy</li>
                     <li>Set up an "Incremental conversion value from lapsed customers"</li>
                     <li>Add an audience segment with more than 1,000 members in at least 1 network in your customer retention settings</li>
                   </ul>
                   <a href="#" className="text-blue-600 hover:underline">Learn more about how to re-engage lapsed customers</a>
                 </div>
               )}
             </div>
          </div>
        </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-6 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* Customer Acquisition Modal */}
      {showAcquireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] overflow-hidden flex flex-col">
            <div className="p-6">
              <h2 className="text-[18px] font-normal text-slate-800 mb-3">Start optimizing for new customer acquisition</h2>
              <div className="text-[13px] text-slate-600 leading-relaxed mb-6">
                This campaign is currently using the "--" bid strategy. You need to use a value-based bidding strategy in order to bid more for new customers than existing customers.
              </div>
              
              <div className="text-[13px] font-medium text-slate-800 mb-3">Choose how to proceed</div>
              
              <div className="border border-slate-200 rounded-md p-5 flex flex-col gap-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="acq_strat" 
                      checked={acquireStrategy === "maximize"}
                      onChange={() => setAcquireStrategy("maximize")}
                      className="w-4 h-4 text-blue-600" 
                    />
                    <span className="text-[13px] text-slate-800">Use the "Maximize conversion value" bid strategy (recommended)</span>
                  </label>
                  {acquireStrategy === "maximize" && (
                    <div className="ml-7 mt-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                        <span className="text-[13px] text-slate-800">Set a target return on ad spend (optional)</span>
                      </label>
                    </div>
                  )}
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="acq_strat" 
                    checked={acquireStrategy === "only"}
                    onChange={() => setAcquireStrategy("only")}
                    className="w-4 h-4 text-blue-600" 
                  />
                  <span className="text-[13px] text-slate-800">Only bid for new customers without changing bid strategy</span>
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setShowAcquireModal(false)}
                className="text-blue-600 text-[13px] font-medium hover:bg-blue-50 px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAcquireModal}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
