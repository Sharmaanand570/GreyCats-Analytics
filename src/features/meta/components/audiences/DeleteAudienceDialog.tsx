import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAudience } from "@/features/meta/hooks/useMetaAdsManager";
import type { CustomAudience } from "@/features/meta/API/metaAdsManagerApi";

type Props = {
  audience: CustomAudience | null;
  clientId: number;
  onClose: () => void;
};

export function DeleteAudienceDialog({ audience, clientId, onClose }: Props) {
  const { mutateAsync: deleteAudience, isPending } = useDeleteAudience();

  const handleDelete = async () => {
    if (!audience) return;
    try {
      await deleteAudience({ clientId, audienceId: audience.id });
      onClose();
    } catch {
      // toast surfaced by the mutation
    }
  };

  return (
    <AlertDialog open={!!audience} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this audience?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-bold text-slate-900">{audience?.name}</span> will be
            removed from Meta. Any ads currently using this audience for targeting will
            stop reaching that group. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isPending ? "Deleting…" : "Delete audience"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
