import { useState } from "react";
import { BookOpen, Wrench } from "lucide-react";
import { useSharedSets, useCreateSharedSet } from "../../hooks/useCampaignManagement";
import { ErrorState } from "../ui/GoogleAdsShared";
import { SharedNegativeListTable } from "./SharedNegativeListTable";
import { CreateSharedNegativeListModal } from "./CreateSharedNegativeListModal";
import { EditSharedNegativeListModal } from "./EditSharedNegativeListModal";
import type { SharedSet } from "../../types/googleAds.types";

interface SharedNegativeListsPageProps {
  clientId: number;
}

export function SharedNegativeListsPage({ clientId }: SharedNegativeListsPageProps) {
  const { data, isLoading, isError, error } = useSharedSets(clientId);
  const createMutation = useCreateSharedSet(clientId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<SharedSet | null>(null);

  if (isError) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <ErrorState message={error?.message ?? "Failed to load shared library"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const handleCreateSubmit = (name: string) => {
    createMutation.mutate(name, {
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
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-slate-800">Negative keyword lists</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl">
          Create shared lists of negative keywords to easily apply them across multiple campaigns and avoid paying for unwanted clicks.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <SharedNegativeListTable 
          clientId={clientId}
          sharedSets={data?.sharedSets ?? []}
          isLoading={isLoading}
          onCreate={() => setIsCreateModalOpen(true)}
          onEdit={(set) => setEditingSet(set)}
        />
      </div>

      <CreateSharedNegativeListModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />

      {editingSet && (
        <EditSharedNegativeListModal 
          clientId={clientId}
          sharedSet={editingSet}
          open={!!editingSet}
          onOpenChange={(open) => !open && setEditingSet(null)}
        />
      )}
    </div>
  );
}
