import { useState } from "react";
import { Tag, Wrench } from "lucide-react";
import { useLabels, useCreateLabel, useUpdateLabel } from "../../../hooks/useCampaignManagement";
import { ErrorState } from "../../ui/GoogleAdsShared";
import { LabelsTable } from "./LabelsTable";
import { CreateLabelModal } from "./CreateLabelModal";
import { EditLabelModal } from "./EditLabelModal";
import type { GoogleAdsLabel } from "../../../types/googleAds.types";

interface LabelsPageProps {
  clientId: number;
}

export function LabelsPage({ clientId }: LabelsPageProps) {
  const { data, isLoading, isError, error } = useLabels(clientId);
  const createMutation = useCreateLabel(clientId);
  const updateMutation = useUpdateLabel(clientId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<GoogleAdsLabel | null>(null);

  if (isError) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <ErrorState message={error?.message ?? "Failed to load labels"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const handleCreateSubmit = (data: { name: string; backgroundColor: string; description: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      }
    });
  };

  const handleEditSubmit = (data: { labelId: string; name: string; backgroundColor: string; description: string }) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setEditingLabel(null);
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
          <Tag className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-slate-800">Labels</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl">
          Create and manage labels to organize your campaigns, ad groups, ads, and keywords into meaningful categories for reporting and filtering.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <LabelsTable 
          clientId={clientId}
          labels={data?.labels ?? []}
          isLoading={isLoading}
          onCreate={() => setIsCreateModalOpen(true)}
          onEdit={(label) => setEditingLabel(label)}
        />
      </div>

      <CreateLabelModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />

      {editingLabel && (
        <EditLabelModal 
          label={editingLabel}
          open={!!editingLabel}
          onOpenChange={(open) => !open && setEditingLabel(null)}
          onSubmit={handleEditSubmit}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}
