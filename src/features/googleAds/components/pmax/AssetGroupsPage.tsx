import { useState, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAssetGroups } from "../../hooks/useCampaignManagement";
import {
  StatusBadge,
  fmtCurrency,
  fmtNumber,
  TableSkeletonRows,
  EmptyState,
} from "../ui/GoogleAdsShared";
import { AssetGroupBuilder } from "./AssetGroupBuilder";

interface AssetGroupsPageProps {
  clientId: number;
}

export function AssetGroupsPage({ clientId }: AssetGroupsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Use a blank string for campaignId so we fetch ALL asset groups for the client
  const { data, isLoading } = useAssetGroups(clientId, undefined);

  const assetGroups = useMemo(() => data?.assetGroups ?? [], [data?.assetGroups]);

  const filtered = useMemo(() => {
    let result = assetGroups;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (ag: any) =>
          ag.name.toLowerCase().includes(q) ||
          ag.status.toLowerCase().includes(q)
      );
    }
    return result;
  }, [assetGroups, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Performance Max Asset Groups
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your combinations of images, videos, and text used in Performance Max campaigns.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Asset Group
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search asset groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button variant="outline" className="bg-white">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead>Asset Group Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Assets</TableHead>
              <TableHead className="text-right">Impr.</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={7} rows={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64">
                  <EmptyState
                    icon={Plus}
                    title="No Asset Groups Found"
                    description="You haven't created any Asset Groups yet."
                    actionLabel="Create Asset Group"
                    onAction={() => setCreateOpen(true)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ag: any) => {
                const m = ag.metrics || { impressions: 0, clicks: 0, cost: 0, conversions: 0 };
                return (
                  <TableRow
                    key={ag.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <TableCell className="font-medium text-blue-600 hover:underline">
                      {ag.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ag.status} />
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {ag.assets?.length || 0} Assets
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      {fmtNumber(m.impressions)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      {fmtNumber(m.clicks)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      {fmtCurrency(m.cost)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      {m.conversions.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {createOpen && (
        <AssetGroupBuilder
          clientId={clientId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </div>
  );
}
