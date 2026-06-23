import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState, TableSkeletonRows } from "../../ui/GoogleAdsShared";
import { useBiddingStrategies, useDeleteBiddingStrategy } from "../../../hooks/useCampaignManagement";
import type { BiddingStrategy } from "../../../types/googleAds.types";

import { PortfolioBidStrategiesTable } from "./PortfolioBidStrategiesTable";
import { PortfolioStrategyModal } from "./PortfolioStrategyModal";
import { CampaignAssociationDrawer } from "../CampaignAssociationDrawer";

interface PortfolioBidStrategiesPageProps {
  clientId: number;
}

export function PortfolioBidStrategiesPage({ clientId }: PortfolioBidStrategiesPageProps) {
  const { data, isLoading, isError, error } = useBiddingStrategies(clientId);
  const deleteMutation = useDeleteBiddingStrategy(clientId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<BiddingStrategy | null>(null);

  const [assigningStrategy, setAssigningStrategy] = useState<BiddingStrategy | null>(null);

  const handleCreate = () => {
    setEditingStrategy(null);
    setIsModalOpen(true);
  };

  const handleEdit = (strategy: BiddingStrategy) => {
    setEditingStrategy(strategy);
    setIsModalOpen(true);
  };

  const handleAssign = (strategy: BiddingStrategy) => {
    setAssigningStrategy(strategy);
  };

  const handleDelete = (strategy: BiddingStrategy) => {
    if (confirm(`Are you sure you want to delete the strategy "${strategy.name}"?`)) {
      deleteMutation.mutate(strategy.id);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bid Strategies</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your portfolio bid strategies across multiple campaigns
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          New portfolio strategy
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 min-h-[500px]">
        {isError && (
          <ErrorState 
            message={error?.message ?? "Failed to load bid strategies"} 
            onRetry={() => window.location.reload()} 
          />
        )}
        
        {isLoading && <TableSkeletonRows columns={8} rows={5} />}

        {!isLoading && !isError && (
          <PortfolioBidStrategiesTable 
            strategies={data?.strategies || []}
            onEdit={handleEdit}
            onAssign={handleAssign}
            onDelete={handleDelete}
          />
        )}
      </div>

      <PortfolioStrategyModal 
        clientId={clientId}
        isOpen={isModalOpen}
        strategy={editingStrategy}
        onClose={() => setIsModalOpen(false)}
      />

      {assigningStrategy && (
        <CampaignAssociationDrawer 
          clientId={clientId}
          isOpen={true}
          assignmentId={assigningStrategy.id}
          assignmentName={assigningStrategy.name}
          assignmentType="biddingStrategy"
          onClose={() => setAssigningStrategy(null)}
        />
      )}
    </div>
  );
}
