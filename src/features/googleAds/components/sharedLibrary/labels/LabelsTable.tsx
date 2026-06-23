import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeletonRows, EmptyState, TableToolbar } from "../../ui/GoogleAdsShared";
import { Tag, Trash2, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoogleAdsLabel } from "../../../types/googleAds.types";
import { useDeleteLabel } from "../../../hooks/useCampaignManagement";
import { LabelBadge } from "./LabelBadge";

interface LabelsTableProps {
  clientId: number;
  labels: GoogleAdsLabel[];
  isLoading: boolean;
  onEdit: (label: GoogleAdsLabel) => void;
  onCreate: () => void;
}

export function LabelsTable({ clientId, labels, isLoading, onEdit, onCreate }: LabelsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const deleteMutation = useDeleteLabel(clientId);

  const filtered = useMemo(() => {
    if (!searchTerm) return labels;
    const q = searchTerm.toLowerCase();
    return labels.filter(s => s.name.toLowerCase().includes(q));
  }, [labels, searchTerm]);

  const toggleAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <TableToolbar
        title="Labels"
        count={filtered.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.size === 0 || deleteMutation.isPending}
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.size} labels?`)) {
                  selectedIds.forEach((id) => deleteMutation.mutate(id));
                  setSelectedIds(new Set());
                }
              }}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
            <Button size="sm" onClick={onCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" />
              New label
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto bg-white border-y border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={4} rows={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64">
                  <EmptyState
                    icon={Tag}
                    title="No labels"
                    description="Create labels to organize your campaigns, ad groups, ads, and keywords."
                    actionLabel="Create label"
                    onAction={onCreate}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50 group" data-state={isSelected ? "selected" : undefined}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <LabelBadge label={item} />
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[300px] truncate">
                      {item.textLabel?.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="opacity-0 group-hover:opacity-100 h-8 px-2 text-slate-500 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
