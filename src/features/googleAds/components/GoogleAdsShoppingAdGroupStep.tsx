import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";

interface AdGroupStepProps {
  onNext: () => void;
}

export default function GoogleAdsShoppingAdGroupStep({ onNext }: AdGroupStepProps) {
  const { payload, updatePayload } = useCampaignWizardContext();
  const [adGroupName, setAdGroupName] = useState(payload.adGroups?.[0]?.name || "Ad group 1");
  const [adGroupBid, setAdGroupBid] = useState("");
  const [listingGroupType, setListingGroupType] = useState("all"); // 'all' or 'specific'

  useEffect(() => {
    let listingGroupFilters: any[] = [];
    if (listingGroupType === "all") {
      listingGroupFilters = [{ type: "UNIT_INCLUDED" }];
    } else {
      // Create a valid nested Listing Group Tree
      listingGroupFilters = [
        {
          type: "SUBDIVISION",
          children: [
            {
              type: "UNIT_INCLUDED",
              dimension: { type: "BRAND", value: "Nike" }
            },
            {
              type: "UNIT_INCLUDED",
              dimension: { type: "BRAND", "value": "Adidas" }
            },
            {
              type: "UNIT_EXCLUDED" // Everything Else
            }
          ]
        }
      ];
    }

    updatePayload({
      adGroups: [{
        name: adGroupName,
        cpcBid: adGroupBid ? parseFloat(adGroupBid) : undefined,
        listingGroupFilters
      }] as any
    });
  }, [adGroupName, adGroupBid, listingGroupType, updatePayload]);
  return (
    <div className="flex flex-col gap-6 max-w-[1000px]">
      <div>
        <h2 className="text-[22px] font-normal text-slate-800 mb-1">Create ad group</h2>
        <p className="text-[13px] text-slate-600">An ad group contains one or more ads and a set of related keywords.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="p-6 flex flex-col gap-6 bg-white">
          <div className="flex flex-col gap-2 w-full max-w-[400px]">
            <label className="text-[13px] font-medium text-slate-800">Ad group name</label>
            <input 
              type="text" 
              value={adGroupName}
              onChange={(e) => setAdGroupName(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="flex flex-col gap-2 w-full max-w-[400px]">
            <label className="text-[13px] font-medium text-slate-800 flex items-center gap-1">
              Ad group bid <Info className="w-3.5 h-3.5 text-slate-500" />
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-[13px]">₹</span>
              </div>
              <input 
                type="number" 
                value={adGroupBid}
                onChange={(e) => setAdGroupBid(e.target.value)}
                placeholder="0.00"
                className="w-full border border-slate-300 rounded px-3 py-2 pl-7 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="flex flex-col gap-2 w-full max-w-[400px]">
            <label className="text-[13px] font-medium text-slate-800">Listing groups</label>
            <p className="text-[12px] text-slate-500 mb-2">Choose which products from your Merchant Center account to include in this ad group.</p>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="listingGroup" 
                checked={listingGroupType === "all"}
                onChange={() => setListingGroupType("all")}
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-[13px] text-slate-800">All products</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="listingGroup" 
                checked={listingGroupType === "specific"}
                onChange={() => setListingGroupType("specific")}
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-[13px] text-slate-800">Specific products (Brand, Category, Custom Label)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded">
          Next
        </button>
      </div>
    </div>
  );
}
