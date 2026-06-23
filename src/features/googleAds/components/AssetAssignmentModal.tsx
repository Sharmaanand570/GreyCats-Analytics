  // @ts-expect-error unused variable
import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { useAssets, useAssignAssetToCampaign, useAssignAssetToAdGroup } from "../hooks/useCampaignManagement";

interface AssetAssignmentModalProps {
  onClose: () => void;
  campaignId?: string;
  adGroupId?: string;
  clientId?: number;
}

export default function AssetAssignmentModal({ onClose, campaignId, adGroupId, clientId = 1 }: AssetAssignmentModalProps) {
  const { data: assetsData, isLoading } = useAssets(clientId);
  const assignToCampaign = useAssignAssetToCampaign(clientId);
  const assignToAdGroup = useAssignAssetToAdGroup(clientId);

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [fieldType, setFieldType] = useState<string>("HEADLINE");
  const [search, setSearchTerm] = useState("");

  const assets = assetsData?.assets || [];
  const filteredAssets = assets.filter((a) => {
    const assetName = a.text || a.calloutText || a.videoId || a.imageUrl || "Unnamed Asset";
    return assetName.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
  });

  const handleAssign = () => {
    if (!selectedAssetId) return;

    if (adGroupId) {
      assignToAdGroup.mutate({ adGroupId, assetId: selectedAssetId, fieldType }, {
        onSuccess: onClose
      });
    } else if (campaignId) {
      assignToCampaign.mutate({ campaignId, assetId: selectedAssetId, fieldType }, {
        onSuccess: onClose
      });
    }
  };

  const isPending = assignToCampaign.isPending || assignToAdGroup.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-800">Assign Asset</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Field Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="HEADLINE">Headline</option>
              <option value="DESCRIPTION">Description</option>
              <option value="BUSINESS_NAME">Business Name</option>
              <option value="LOGO">Logo</option>
              <option value="MARKETING_IMAGE">Marketing Image</option>
              <option value="SITELINK">Sitelink</option>
              <option value="CALLOUT">Callout</option>
              <option value="CALL">Call</option>
            </select>
          </div>

          <div className="mb-4 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search assets..."
               value={search}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
             />
          </div>

          <div className="border border-slate-200 rounded-md max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading assets...</div>
            ) : filteredAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No assets found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAssets.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-slate-50 transition-colors ${selectedAssetId === asset.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <input
                      type="radio"
                      checked={selectedAssetId === asset.id}
                      onChange={() => setSelectedAssetId(asset.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">{asset.text || asset.calloutText || asset.videoId || asset.imageUrl || "Unnamed Asset"}</div>
                      <div className="text-xs text-slate-500">{asset.type}</div>
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
            onClick={handleAssign}
            disabled={!selectedAssetId || isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
