import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnifiedBiddingConfiguration } from "../../bidding/UnifiedBiddingConfiguration";
import { useCreateBiddingStrategy, useUpdateBiddingStrategy } from "../../../hooks/useCampaignManagement";
import type { BiddingStrategy } from "../../../types/googleAds.types";
import type { BiddingConfigValue } from "../../bidding/UnifiedBiddingConfiguration";

interface PortfolioStrategyModalProps {
  clientId: number;
  strategy?: BiddingStrategy | null; // if passed, we are editing
  isOpen: boolean;
  onClose: () => void;
}

export function PortfolioStrategyModal({ clientId, strategy, isOpen, onClose }: PortfolioStrategyModalProps) {
  const [name, setName] = useState("");
  const [config, setConfig] = useState<Partial<BiddingConfigValue>>({ type: "MAXIMIZE_CONVERSIONS" });

  const createMutation = useCreateBiddingStrategy(clientId);
  const updateMutation = useUpdateBiddingStrategy(clientId);

  useEffect(() => {
    if (strategy) {
      setName(strategy.name);
      setConfig({
        type: strategy.type,
        targetCpa: strategy.targetCpa,
        targetRoas: strategy.targetRoas,
        targetImpressionShare: strategy.targetImpressionShare as any,
      });
    } else {
      setName("");
      setConfig({ type: "MAXIMIZE_CONVERSIONS" });
    }
  }, [strategy, isOpen]);

  if (!isOpen) return null;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (strategy) {
      updateMutation.mutate({
        strategyId: strategy.id,
        name,
        targetCpa: config.targetCpa,
        targetRoas: config.targetRoas,
        targetImpressionShare: config.targetImpressionShare as any
      }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate({
        name,
        type: (config.type || "MAXIMIZE_CONVERSIONS") as any,
        targetCpa: config.targetCpa,
        targetRoas: config.targetRoas,
        targetImpressionShare: config.targetImpressionShare as any
      }, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-medium text-slate-800">
            {strategy ? "Edit portfolio bid strategy" : "Create portfolio bid strategy"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="flex flex-col gap-6 max-w-[600px] mx-auto">
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-slate-800">Strategy name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Target CPA - Brand"
                className="bg-white"
              />
            </div>

            <div className="border border-slate-200 rounded-md bg-white p-5 shadow-sm">
              <UnifiedBiddingConfiguration
                clientId={clientId}
                value={config}
                onChange={setConfig}
                hidePortfolioSelector={true} // Since we are creating/editing the portfolio strategy itself
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0 bg-white rounded-b-lg">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save strategy"}
          </Button>
        </div>

      </div>
    </div>
  );
}
