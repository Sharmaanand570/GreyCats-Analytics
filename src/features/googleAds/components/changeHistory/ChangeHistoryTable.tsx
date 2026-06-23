import { useState } from "react";
import { format } from "date-fns";
import { TableToolbar, TableSkeletonRows, EmptyState } from "../ui/GoogleAdsShared";
import type { ChangeEvent } from "../../types/googleAds.types";
import { ChangeDetailsDrawer } from "./ChangeDetailsDrawer";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

export function ChangeHistoryTable({ changes, isLoading }: { changes: ChangeEvent[]; isLoading: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChange, setSelectedChange] = useState<ChangeEvent | null>(null);
  
  // Basic pagination
  const [page, setPage] = useState(0);
  const pageSize = 15;

  // Filter by search
  const filtered = changes.filter(c => 
    c.changeResourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case "CREATED": return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Created</span>;
      case "UPDATED": return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Updated</span>;
      case "REMOVED": return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Removed</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">Unknown</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-['Inter'] relative">
      <TableToolbar 
        searchTerm={searchTerm} 
        onSearchChange={(v) => { setSearchTerm(v); setPage(0); }} 
        actions={<div className="text-sm text-slate-500 mr-4">Total changes: {filtered.length}</div>} 
      />

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-white shadow-[0_1px_0_#e2e8f0] z-10">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-600 border-b border-slate-200">Date/Time</th>
              <th className="px-6 py-3 font-medium text-slate-600 border-b border-slate-200">User</th>
              <th className="px-6 py-3 font-medium text-slate-600 border-b border-slate-200">Change</th>
              <th className="px-6 py-3 font-medium text-slate-600 border-b border-slate-200">Resource</th>
              <th className="px-6 py-3 font-medium text-slate-600 border-b border-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableSkeletonRows columns={5} rows={10} />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <EmptyState title="No changes found" description="Try adjusting your filters or date range." />
                </td>
              </tr>
            ) : (
              paginated.map((change) => (
                <tr key={change.changeEventId} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                    {format(new Date(change.changeDateTime), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-700">{change.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(change.changeStatus)}
                      <span className="text-slate-500 text-xs">{change.changeResourceType.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-blue-600">{change.changeResourceName}</div>
                    {(change.campaignId || change.adGroupId) && (
                      <div className="text-xs text-slate-500 mt-1">
                        {change.campaignId && <span>Campaign ID: {change.campaignId}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => setSelectedChange(change)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white shrink-0">
          <div className="text-sm text-slate-500">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {selectedChange && (
        <ChangeDetailsDrawer 
          change={selectedChange} 
          open={!!selectedChange} 
          onClose={() => setSelectedChange(null)} 
        />
      )}
    </div>
  );
}
