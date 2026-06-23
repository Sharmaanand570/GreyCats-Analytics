import { useState } from "react";
import { ShieldBan, Wrench } from "lucide-react";
import { usePlacementExclusionLists, useCreatePlacementExclusionList } from "../../hooks/useCampaignManagement";
import { ErrorState } from "../ui/GoogleAdsShared";
import { PlacementExclusionTable } from "./PlacementExclusionTable";
import { CreatePlacementExclusionModal } from "./CreatePlacementExclusionModal";
import { EditPlacementExclusionModal } from "./EditPlacementExclusionModal";
import type { PlacementExclusionList } from "../../types/googleAds.types";

interface PlacementExclusionListsPageProps {
  clientId: number;
}

export function PlacementExclusionListsPage({ clientId }: PlacementExclusionListsPageProps) {
  const { data, isLoading, isError, error } = usePlacementExclusionLists(clientId);
  const createMutation = useCreatePlacementExclusionList(clientId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<PlacementExclusionList | null>(null);

  if (isError) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <ErrorState message={error?.message ?? "Failed to load shared library"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const handleCreateSubmit = (name: string) => {
    createMutation.mutate({ name }, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Wrench className="w-4 h-4" /> Tools & Settings / Shared Library
        </div>
        <div className="flex items-center gap-3 mb-1">
          <ShieldBan className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-semibold text-slate-800">Placement exclusion lists</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl">
          Create shared lists of placement exclusions to avoid showing your ads on specific websites, YouTube channels, or mobile apps across multiple campaigns.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <PlacementExclusionTable 
          clientId={clientId}
          lists={data?.lists ?? []}
          isLoading={isLoading}
          onCreate={() => setIsCreateModalOpen(true)}
          onEdit={(list) => setEditingList(list)}
        />
      </div>

      <CreatePlacementExclusionModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />

      {editingList && (
        <EditPlacementExclusionModal 
          clientId={clientId}
          list={editingList}
          open={!!editingList}
          onOpenChange={(open) => !open && setEditingList(null)}
        />
      )}
    </div>
  );
}
