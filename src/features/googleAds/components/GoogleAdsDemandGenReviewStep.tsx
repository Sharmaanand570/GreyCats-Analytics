import { Info } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { publishCompleteCampaign } from "../API/campaignManagementApi";
import { validateCampaignPayload } from "../utils/campaignValidation";
import { PublishProgressModal } from "./PublishProgressModal";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface ReviewStepProps {
  onNext: () => void;
}

export default function GoogleAdsDemandGenReviewStep(_props: ReviewStepProps) {
  const { payload, updatePayload, isPublishing, setIsPublishing, takePublishSnapshot } = useCampaignWizardContext();

  const handlePublish = async () => {
    const validation = validateCampaignPayload(payload as any);
    if (!validation.isValid) {
      toast.error(`Validation Failed: ${validation.errors[0].message}`);
      return;
    }

    const operationId = uuidv4();
    updatePayload({ publishOperationId: operationId });
    localStorage.setItem('active_publish_operation', operationId);

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

  const headlines = payload.assets?.filter(a => a.type === "HEADLINE").map(a => a.text) || [];
  const descriptions = payload.assets?.filter(a => a.type === "DESCRIPTION").map(a => a.text) || [];
  const cta = payload.assets?.find(a => a.type === "CALL_TO_ACTION")?.text || "Not provided";
  const audienceSignals = payload.adGroups?.[0]?.audienceSignals || [];
  
  const imagesCount = payload.assets?.filter(a => a.type === "IMAGE").length || 0;
  const logosCount = payload.assets?.filter(a => a.type === "LOGO").length || 0;
  const videosCount = payload.assets?.filter(a => a.type === "VIDEO").length || 0;

  return (
    <div className={`flex flex-col gap-6 w-full ${isPublishing ? 'pointer-events-none opacity-60' : ''}`}>
      <PublishProgressModal clientId={1} />
      
      <div className="flex flex-col gap-2">
        <div className="text-[14px] font-medium text-slate-800">The following suggestions will greatly improve your campaign's performance</div>
        <div className="border border-blue-300 rounded-md p-3 bg-white flex items-center gap-2 text-[13px] text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>End-user consent signals are required to use ad personalization features in the European Economic Area (EEA) <a href="#" className="text-blue-600 hover:underline">Learn more</a></span>
        </div>
      </div>

      <h2 className="text-[22px] font-normal text-slate-800 mt-2">Campaign Review</h2>
      
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col text-[13px]">
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Campaign name</div>
          <div className="flex-1 font-medium text-slate-800">{payload.name || "Unnamed Campaign"}</div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Budget</div>
          <div className="flex-1 text-slate-800">£{payload.budgetAmount?.toFixed(2) || "0.00"}/day</div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Bidding Strategy</div>
          <div className="flex-1 text-slate-800 capitalize">{payload.biddingFocus?.replace(/_/g, " ").toLowerCase() || "Not set"}</div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Images</div>
          <div className="flex-1 text-slate-800">{imagesCount} provided</div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Logos</div>
          <div className="flex-1 text-slate-800">{logosCount} provided</div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Videos</div>
          <div className="flex-1 text-slate-800">{videosCount} provided</div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Headlines</div>
          <div className="flex-1 flex flex-col gap-1">
            {headlines.length > 0 ? headlines.map((h, i) => <div key={i} className="text-slate-800">{h}</div>) : <span className="text-slate-500">None</span>}
          </div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Descriptions</div>
          <div className="flex-1 flex flex-col gap-1">
            {descriptions.length > 0 ? descriptions.map((d, i) => <div key={i} className="text-slate-800">{d}</div>) : <span className="text-slate-500">None</span>}
          </div>
        </div>
        <div className="flex p-4 border-b border-slate-100">
          <div className="w-[250px] text-slate-600">Call to action</div>
          <div className="flex-1 text-slate-800">{cta}</div>
        </div>
        <div className="flex p-4">
          <div className="w-[250px] text-slate-600">Audience Signals</div>
          <div className="flex-1 text-slate-800">
            {audienceSignals.length > 0 ? audienceSignals.join(", ") : "No audiences"}
          </div>
        </div>
      </div>

      <div className="flex justify-start mt-2 border-t border-slate-200 pt-4 pb-10">
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
