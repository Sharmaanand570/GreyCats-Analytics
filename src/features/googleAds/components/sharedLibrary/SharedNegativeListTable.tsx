import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeletonRows, EmptyState, TableToolbar } from "../ui/GoogleAdsShared";
import { BookOpen, Trash2, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SharedSet } from "../../types/googleAds.types";
import { useDeleteSharedSet } from "../../hooks/useCampaignManagement";

interface SharedNegativeListTableProps {
  clientId: number;
  sharedSets: SharedSet[];
  isLoading: boolean;
  onEdit: (set: SharedSet) => void;
  onCreate: () => void;
}

export function SharedNegativeListTable({ clientId, sharedSets, isLoading, onEdit, onCreate }: SharedNegativeListTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const deleteMutation = useDeleteSharedSet(clientId);

  const filtered = useMemo(() => {
    if (!searchTerm) return sharedSets;
    const q = searchTerm.toLowerCase();
    return sharedSets.filter(s => s.name.toLowerCase().includes(q));
  }, [sharedSets, searchTerm]);

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
        title="Negative keyword lists"
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
                if (window.confirm(`Delete ${selectedIds.size} lists?`)) {
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
              New list
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
              <TableHead>List name</TableHead>
              <TableHead className="text-right">Keywords</TableHead>
              <TableHead className="text-right">Applied campaigns</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={5} rows={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64">
                  <EmptyState
                    icon={BookOpen}
                    title="No negative keyword lists"
                    description="Create a shared list of negative keywords to apply across multiple campaigns."
                    actionLabel="Create list"
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
                      <button 
                        onClick={() => onEdit(item)}
                        className="font-medium text-blue-600 hover:underline flex items-center gap-2"
                      >
                        {item.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">{item.memberCount}</TableCell>
                    <TableCell className="text-right font-medium text-slate-700">{item.referenceCount}</TableCell>
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
