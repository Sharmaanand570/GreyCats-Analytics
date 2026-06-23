  // @ts-expect-error unused variable
import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { useAudiences, useExcludeAudienceFromCampaign, useExcludeAudienceFromAdGroup } from "../hooks/useCampaignManagement";

interface ExcludeAudienceModalProps {
  onClose: () => void;
  campaignId?: string;
  adGroupId?: string;
  clientId?: number;
}

export default function ExcludeAudienceModal({ onClose, campaignId, adGroupId, clientId = 1 }: ExcludeAudienceModalProps) {
  const { data: audiencesData, isLoading } = useAudiences(clientId);
  const excludeFromCampaign = useExcludeAudienceFromCampaign(clientId);
  const excludeFromAdGroup = useExcludeAudienceFromAdGroup(clientId);

  const [selectedAudienceId, setSelectedAudienceId] = useState<string | null>(null);
  const [search, setSearchTerm] = useState("");

  const audiences = audiencesData?.audiences || [];
  const filteredAudiences = audiences.filter(a => a.audienceName?.toLowerCase().includes(search.toLowerCase()));

  const handleExclude = () => {
    if (!selectedAudienceId) return;

    if (adGroupId) {
      excludeFromAdGroup.mutate({ adGroupId, audienceId: selectedAudienceId }, {
        onSuccess: onClose
      });
    } else if (campaignId) {
      excludeFromCampaign.mutate({ campaignId, audienceId: selectedAudienceId }, {
        onSuccess: onClose
      });
    }
  };

  const isPending = excludeFromCampaign.isPending || excludeFromAdGroup.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-800">Exclude Audience</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4 text-sm text-slate-600">
            Select an audience to exclude from this {adGroupId ? "ad group" : "campaign"}. Users in this audience will not see your ads.
          </div>

          <div className="mb-4 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search audiences..."
               value={search}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
             />
          </div>

          <div className="border border-slate-200 rounded-md max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading audiences...</div>
            ) : filteredAudiences.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No audiences found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAudiences.map(aud => (
                  <div
                    key={aud.id}
                    onClick={() => setSelectedAudienceId(aud.id)}
                    className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-slate-50 transition-colors ${selectedAudienceId === aud.id ? 'bg-red-50/50' : ''}`}
                  >
                    <input
                      type="radio"
                      checked={selectedAudienceId === aud.id}
                      onChange={() => setSelectedAudienceId(aud.id)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">{aud.audienceName}</div>
                      <div className="text-xs text-slate-500">{aud.audienceType || "Audience"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExclude}
            disabled={!selectedAudienceId || isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Excluding..." : "Exclude Audience"}
          </button>
        </div>
      </div>
    </div>
  );
}
