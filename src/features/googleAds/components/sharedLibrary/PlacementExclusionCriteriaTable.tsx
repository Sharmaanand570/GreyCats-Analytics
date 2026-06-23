import { useState, useMemo } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePlacementExclusions, useAddPlacementExclusions, useRemovePlacementExclusion } from "../../hooks/useCampaignManagement";
import { EmptyState, ErrorState, TableSkeletonRows, TableToolbar } from "../ui/GoogleAdsShared";
import { ShieldBan } from "lucide-react";

interface PlacementExclusionCriteriaTableProps {
  clientId: number;
  listId: string;
}

export function PlacementExclusionCriteriaTable({ clientId, listId }: PlacementExclusionCriteriaTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newPlacementText, setNewPlacementText] = useState("");
  const [placementType, setPlacementType] = useState<"WEBSITE" | "YOUTUBE_CHANNEL" | "YOUTUBE_VIDEO" | "MOBILE_APP">("WEBSITE");

  const { data, isLoading, isError, error } = usePlacementExclusions(clientId, listId);
  const addMutation = useAddPlacementExclusions(clientId);
  const removeMutation = useRemovePlacementExclusion(clientId);

  const filtered = useMemo(() => {
    const exclusions = data?.exclusions ?? [];
    if (!searchTerm) return exclusions;
    const q = searchTerm.toLowerCase();
    return exclusions.filter(e => e.placement.toLowerCase().includes(q));
  }, [data?.exclusions, searchTerm]);

  const toggleAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
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

  const handleAdd = () => {
    if (!newPlacementText.trim()) return;

    const items = newPlacementText
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean)
      .map(placement => ({
        placement,
        type: placementType
      }));

    if (items.length === 0) return;

    addMutation.mutate({ listId, placements: items }, {
      onSuccess: () => {
        setIsAdding(false);
        setNewPlacementText("");
      }
    });
  };

  if (isError) {
    return <ErrorState message={error?.message ?? "Failed to load exclusions"} />;
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm">
      {isAdding ? (
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-slate-800">Add placement exclusions</h3>
              <p className="text-sm text-slate-500">Add URLs, channel IDs, or app IDs (one per line)</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="w-48 shrink-0">
              <Select value={placementType} onValueChange={(val: any) => setPlacementType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Placement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBSITE">Website URL</SelectItem>
                  <SelectItem value="YOUTUBE_CHANNEL">YouTube Channel</SelectItem>
                  <SelectItem value="YOUTUBE_VIDEO">YouTube Video</SelectItem>
                  <SelectItem value="MOBILE_APP">Mobile App</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <textarea
                className="w-full h-32 p-3 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                placeholder={`example.com\nanotherexample.com`}
                value={newPlacementText}
                onChange={(e) => setNewPlacementText(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)} disabled={addMutation.isPending}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!newPlacementText.trim() || addMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {addMutation.isPending ? "Adding..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <TableToolbar
          title="Placements"
          count={filtered.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.size === 0 || removeMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Remove ${selectedIds.size} exclusions?`)) {
                    selectedIds.forEach((id) => removeMutation.mutate({ listId, criterionId: id }));
                    setSelectedIds(new Set());
                  }
                }}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
              <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4" />
                Add placements
              </Button>
            </>
          }
        />
      )}

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={3} rows={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64">
                  <EmptyState
                    icon={ShieldBan}
                    title="No placements"
                    description="Add placement exclusions to this list."
                    actionLabel="Add placements"
                    onAction={() => setIsAdding(true)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50" data-state={isSelected ? "selected" : undefined}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{item.placement}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        {item.type.replace(/_/g, " ")}
                      </span>
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
