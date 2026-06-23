import { useState } from "react";
import { X, Search } from "lucide-react";
import { useAssetGroups, useUpdateAssetGroup } from "../../hooks/useCampaignManagement";
import { Button } from "@/components/ui/button";

interface AssetGroupAssignmentDrawerProps {
  clientId: number;
  assetGroupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetGroupAssignmentDrawer({
  clientId,
  assetGroupId,
  isOpen,
  onClose,
}: AssetGroupAssignmentDrawerProps) {
  const { data } = useAssetGroups(clientId);
  const updateMutation = useUpdateAssetGroup(clientId);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const group = data?.assetGroups.find((g: any) => g.id === assetGroupId);
  const currentSignals = group?.audienceSignals || [];

  // Mock list of audiences that could be assigned as signals
  const availableAudiences = [
    { id: "aud_1", name: "All Website Visitors" },
    { id: "aud_2", name: "Cart Abandoners" },
    { id: "aud_3", name: "Past Purchasers" },
    { id: "aud_4", name: "Custom Intent: Competitor Keywords" }
  ];

  const filtered = availableAudiences.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleToggleSignal = (audienceId: string) => {
    const isAssigned = currentSignals.includes(audienceId);
    let newSignals = [...currentSignals];
    if (isAssigned) {
      newSignals = newSignals.filter(id => id !== audienceId);
    } else {
      newSignals.push(audienceId);
    }

    updateMutation.mutate({
      assetGroupId,
      payload: { audienceSignals: newSignals }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Assign Audience Signals</h2>
            <p className="text-sm text-slate-500 mt-1">
              Help Google AI optimize your asset group targeting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50">
          {filtered.map(aud => {
            const isAssigned = currentSignals.includes(aud.id);
            return (
              <div key={aud.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors">
                <div>
                  <div className="font-medium text-slate-900">{aud.name}</div>
                  <div className="text-xs text-slate-500 mt-1">ID: {aud.id}</div>
                </div>
                <Button 
                  variant={isAssigned ? "outline" : "default"}
                  className={isAssigned ? "text-slate-600" : "bg-blue-600 hover:bg-blue-700 text-white"}
                  onClick={() => handleToggleSignal(aud.id)}
                  disabled={updateMutation.isPending}
                >
                  {isAssigned ? "Remove" : "Assign"}
                </Button>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No audiences found matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white">
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
