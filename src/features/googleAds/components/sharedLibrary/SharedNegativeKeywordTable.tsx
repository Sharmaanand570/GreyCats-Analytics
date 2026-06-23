import { useState, useMemo } from "react";
  // @ts-expect-error unused variable
import { Plus, Trash2, Search, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
  // @ts-expect-error unused variable
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSharedCriteria, useAddSharedCriteria, useDeleteSharedCriterion } from "../../hooks/useCampaignManagement";
  // @ts-expect-error unused variable
import { EmptyState, ErrorState, TableSkeletonRows, TableToolbar } from "../ui/GoogleAdsShared";

interface SharedNegativeKeywordTableProps {
  clientId: number;
  sharedSetId: string;
}

export function SharedNegativeKeywordTable({ clientId, sharedSetId }: SharedNegativeKeywordTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newKeywords, setNewKeywords] = useState("");

  const { data, isLoading, isError, error } = useSharedCriteria(clientId, sharedSetId);
  const addMutation = useAddSharedCriteria(clientId, sharedSetId);
  const removeMutation = useDeleteSharedCriterion(clientId, sharedSetId);

  const filtered = useMemo(() => {
    const criteria = data?.criteria ?? [];
    if (!searchTerm) return criteria;
    const q = searchTerm.toLowerCase();
    return criteria.filter(c => c.keyword?.text.toLowerCase().includes(q));
  }, [data?.criteria, searchTerm]);

  const toggleAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
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

  const handleAddSubmit = () => {
    const lines = newKeywords.split("\\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const parsed = lines.map(line => {
      let matchType = "BROAD";
      let text = line;
      if (line.startsWith("[") && line.endsWith("]")) {
        matchType = "EXACT";
        text = line.slice(1, -1);
      } else if (line.startsWith('"') && line.endsWith('"')) {
        matchType = "PHRASE";
        text = line.slice(1, -1);
      }
      return { text, matchType };
    });

    addMutation.mutate(parsed, {
      onSuccess: () => {
        setNewKeywords("");
        setIsAdding(false);
      }
    });
  };

  if (isError) {
    return <ErrorState message={error?.message ?? "Failed to load keywords"} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm">
      <TableToolbar
        title="Negative keywords"
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
                if (window.confirm(`Remove ${selectedIds.size} keywords?`)) {
                  selectedIds.forEach((id) => removeMutation.mutate(id));
                  setSelectedIds(new Set());
                }
              }}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
            <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAdding ? "Cancel" : "Add keywords"}
            </Button>
          </>
        }
      />

      {isAdding && (
        <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-800">Add negative keywords</label>
          <p className="text-xs text-slate-500">
            Paste your keywords here, one per line. Use quotes for "phrase match" and brackets for [exact match].
          </p>
          <textarea
            className="w-full h-32 p-3 border border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-sm font-mono outline-none"
            placeholder={'free\n"cheap"\n[scam]'}
            value={newKeywords}
            onChange={e => setNewKeywords(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddSubmit} disabled={!newKeywords.trim() || addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Match type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={3} rows={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-48 text-center">
                  <span className="text-slate-500 text-sm">No negative keywords in this list.</span>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 group">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleOne(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-800">
                      {item.keyword?.text}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      {item.keyword?.matchType}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
