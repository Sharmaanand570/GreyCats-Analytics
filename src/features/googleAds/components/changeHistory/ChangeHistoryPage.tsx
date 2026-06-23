import { useState } from "react";
import { useChangeHistory } from "../../hooks/useCampaignManagement";
import { ChangeHistoryTable } from "./ChangeHistoryTable";
import type { ChangeHistoryFilterParams } from "../../types/googleAds.types";
import { Activity } from "lucide-react";

export function ChangeHistoryPage({ clientId }: { clientId: number }) {
  const [filters] = useState<ChangeHistoryFilterParams>({});
  
  const { data, isLoading } = useChangeHistory(clientId, filters);
  
  const changes = data?.changes || [];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-6 py-5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Activity className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-semibold text-slate-800">Change history</h1>
            </div>
            <p className="text-slate-500 text-sm max-w-3xl">
              View changes made to your account, campaigns, ad groups, and other resources.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">

        
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
          <ChangeHistoryTable changes={changes} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
