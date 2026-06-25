import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { publishCompleteCampaign } from "../API/campaignManagementApi";
import { validateCampaignPayload } from "../utils/campaignValidation";
import { PublishProgressModal } from "./PublishProgressModal";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface SummaryStepProps {
  onNext: () => void;
}

export default function GoogleAdsShoppingSummaryStep(_props: SummaryStepProps) {
  const { payload, updatePayload, isPublishing, setIsPublishing, takePublishSnapshot } = useCampaignWizardContext();

  const handlePublish = async () => {
    const validation = validateCampaignPayload(payload as any);
    if (!validation.isValid) {
      toast.error(`Validation Failed: ${validation.errors[0].message}`);
      return;
    }
    const operationId = uuidv4();
    updatePayload({ publishOperationId: operationId });
    localStorage.setItem("active_publish_operation", operationId);
    setIsPublishing(true);
    const snapshot = { ...payload, publishOperationId: operationId };
    takePublishSnapshot();
    try {
      await publishCompleteCampaign(1, snapshot as any);
    } catch (err: any) {
      setIsPublishing(false);
      toast.error(err.message || "Failed to start publish operation");
    }
  };

  const budget = payload.budgetAmount ?? 0;

  return (
    <div className={`flex flex-col gap-6 max-w-[800px] w-full pb-10 ${isPublishing ? "pointer-events-none opacity-60" : ""}`}>
      <PublishProgressModal clientId={1} />
      <h2 className="text-[22px] font-normal text-slate-800">Your campaign is almost ready to publish</h2>

      {/* Overview */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Overview</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Campaign name</div>
            <div className="flex-1 font-medium text-slate-800">{payload.name || "Unnamed Campaign"}</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Campaign type</div>
            <div className="flex-1 text-slate-800">Shopping</div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Merchant Center</div>
            <div className="flex-1 text-slate-800">{payload.merchantId || "Not linked"}</div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600 shrink-0">Country of sale</div>
            <div className="flex-1 text-slate-800">{payload.salesCountry || "Not set"}</div>
          </div>
        </div>
      </div>

      {/* Budget and bidding optimization */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Budget and bidding optimization</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Budget</div>
            <div className="flex-1 flex flex-col gap-1 text-slate-800">
              <span>₹{budget.toFixed(2)}/day</span>
              {budget <= 0 && (
                <div className="flex items-center gap-1 text-[#c5221f] text-[12px]">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-bold text-[10px]">!</div>
                  Enter a budget
                </div>
              )}
            </div>
          </div>
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Bidding</div>
            <div className="flex-1 text-slate-800">Manual CPC</div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600 shrink-0">Customer acquisition</div>
            <div className="flex-1 text-slate-800">{payload.onlyNewCustomers ? "Only bid for new customers" : "Bid equally for new and existing customers"}</div>
          </div>
        </div>
      </div>

      {/* Campaign settings */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-slate-800">Campaign settings</h3>
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
          <div className="flex p-4 border-b border-slate-100">
            <div className="w-[250px] text-slate-600 shrink-0">Locations</div>
            <div className="flex-1 text-slate-800 capitalize">{payload.locations?.type?.toLowerCase() || "all"}</div>
          </div>
          <div className="flex p-4">
            <div className="w-[250px] text-slate-600 shrink-0">Ad group</div>
            <div className="flex-1 text-slate-800">{payload.adGroups?.[0]?.name || "Ad group 1"}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-start mt-2 border-t border-slate-200 pt-4">
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2 px-6 rounded transition-colors disabled:opacity-50"
        >
          {isPublishing ? "Publishing..." : "Publish campaign"}
        </button>
      </div>
    </div>
  );
}
