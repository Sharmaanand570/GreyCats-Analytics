
import { useCampaignWizardContext } from "../context/CampaignWizardContext";

interface GoogleAdsSummaryStepProps {
  onNavigateToStep?: (stepId: number, subStepId: string) => void;
  campaignType?: string;
}

export default function GoogleAdsSummaryStep({ campaignType = "Search" }: GoogleAdsSummaryStepProps) {
  const { payload } = useCampaignWizardContext();

  const isVideo = campaignType === "Video";

  const videoId = payload.ads?.[0]?.videoAd?.videoId || "dQw4w9WgXcQ";
  const videoFormat = payload.ads?.[0]?.videoAd?.format || "IN_STREAM";
  const cta = payload.assets?.find(a => a.type === "CALL_TO_ACTION")?.text || "Not provided";
  const headline = payload.assets?.find(a => a.type === "HEADLINE")?.text || "Not provided";

  return (
    <div className="flex flex-col h-full max-w-[800px] pb-20 relative">
      <h1 className="text-[24px] font-normal text-slate-800 mb-6">Your campaign is almost ready to publish</h1>

      {/* Campaign settings */}
      <div>
        <h2 className="text-[14px] font-medium text-slate-800 mb-3">Campaign settings</h2>
        <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
          <div className="flex p-4">
            <div className="w-[200px] text-[13px] text-blue-700 font-medium">Campaign name</div>
            <div className="flex-1 text-[13px] text-slate-800">{payload.name || "Unnamed Campaign"}</div>
          </div>
          <div className="flex p-4">
            <div className="w-[200px] text-[13px] text-blue-700 font-medium">Locations</div>
            <div className="flex-1 text-[13px] text-slate-800">{payload.locations?.type || "All"}</div>
          </div>
        </div>
      </div>

      {/* Video specifics */}
      {isVideo && (
        <div className="mt-6">
          <h2 className="text-[14px] font-medium text-slate-800 mb-3">Video ad settings</h2>
          <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-200">
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Video ID</div>
              <div className="flex-1 text-[13px] text-slate-800">{videoId}</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Video Format</div>
              <div className="flex-1 text-[13px] text-slate-800">{videoFormat}</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Headline</div>
              <div className="flex-1 text-[13px] text-slate-800">{headline}</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Call to action</div>
              <div className="flex-1 text-[13px] text-slate-800">{cta}</div>
            </div>
            <div className="flex p-4">
              <div className="w-[200px] text-[13px] text-blue-700 font-medium">Final URL</div>
              <div className="flex-1 text-[13px] text-slate-800">{payload.ads?.[0]?.finalUrls?.[0] || "Not provided"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Budget */}
      <div className="mt-6">
        <h2 className="text-[14px] font-medium text-slate-800 mb-3">Budget</h2>
        <div className="border border-slate-200 rounded-md bg-white">
          <div className="flex p-4">
            <div className="w-[200px] text-[13px] text-blue-700 font-medium">Budget</div>
            <div className="flex-1 text-[13px] text-slate-800">£{payload.budgetAmount?.toFixed(2) || "0.00"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
