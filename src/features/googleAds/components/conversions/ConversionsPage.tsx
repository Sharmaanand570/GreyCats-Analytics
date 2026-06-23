import { useState, useMemo } from "react";
  // @ts-expect-error unused variable
import { Plus, Target, Settings, Info, Activity, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
  // @ts-expect-error unused variable
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useConversionActions, useCreateConversionAction, useRemoveConversionAction, useUpdateConversionAction } from "../../hooks/useCampaignManagement";
  // @ts-expect-error unused variable
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import { TableToolbar, TableSkeletonRows, EmptyState, ErrorState, fmtNumber, fmtCurrency } from "../ui/GoogleAdsShared";
import { ConversionTrackingStatusBadge } from "./ConversionTrackingStatusBadge";
import { CreateConversionActionModal } from "./CreateConversionActionModal";
  // @ts-expect-error unused variable
import type { ConversionAction } from "../../types/googleAds.types";

interface ConversionsPageProps {
  clientId: number;
}

export function ConversionsPage({ clientId }: ConversionsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading, isError, error } = useConversionActions(clientId);
  const createMutation = useCreateConversionAction(clientId);
  // @ts-expect-error unused variable
  const updateMutation = useUpdateConversionAction(clientId);
  const removeMutation = useRemoveConversionAction(clientId);

  const actions = useMemo(() => data?.conversionActions ?? [], [data?.conversionActions]);

  const filtered = useMemo(() => {
    let result = actions;
    if (activeTab === "active") {
      result = result.filter(a => a.status === "ENABLED");
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
    }
    return result;
  }, [actions, searchTerm, activeTab]);

  function toggleAll() {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const handleRemove = (id: string) => {
    if (window.confirm("Are you sure you want to remove this conversion action?")) {
      removeMutation.mutate(id);
    }
  };

  const handleCreateSubmit = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      }
    });
  };

  if (isError) {
    return (
      <ErrorState
        message={(error as Error)?.message ?? "Failed to load conversion actions"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-1">
          <Target className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-slate-800">Conversions</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl">
          Measure what happens after a customer interacts with your ads – whether they purchased a product, signed up for your newsletter, or called your business.
        </p>
      </div>

      <TableToolbar
        title="Conversion actions"
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
                if (window.confirm(`Remove ${selectedIds.size} conversion actions?`)) {
                  selectedIds.forEach((id) => removeMutation.mutate(id));
                  setSelectedIds(new Set());
                }
              }}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" />
              New conversion action
            </Button>
          </>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-4">
          <TabsList className="h-8">
            <TabsTrigger value="active" className="text-xs px-3">Active</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </TableToolbar>

      <div className="flex-1 overflow-auto bg-slate-50">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Conversion action</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking status</TableHead>
              <TableHead className="text-right">All conv.</TableHead>
              <TableHead className="text-right">All conv. value</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={8} rows={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64">
                  <EmptyState
                    icon={Target}
                    title="No conversion actions found"
                    description="Set up conversion tracking to see how your ads lead to valuable actions."
                    actionLabel="New conversion action"
                    onAction={() => setIsCreateModalOpen(true)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((action) => {
                const isSelected = selectedIds.has(action.id);
                return (
                  <TableRow
                    key={action.id}
                    className="hover:bg-slate-50 transition-colors group"
                    data-state={isSelected ? "selected" : undefined}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(action.id)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                          {action.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 capitalize">{action.category.toLowerCase().replace(/_/g, " ")}</span>
                          {action.primaryForGoal && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-slate-600 capitalize">
                        {action.type.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${action.status === "ENABLED" ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className="text-sm text-slate-700 capitalize">{action.status.toLowerCase()}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <ConversionTrackingStatusBadge status={action.trackingStatus} />
                    </TableCell>

                    <TableCell className="text-right text-slate-700 font-medium">
                      {fmtNumber(action.metrics.allConversions)}
                    </TableCell>

                    <TableCell className="text-right text-slate-700">
                      {fmtCurrency(action.metrics.allConversionValue)}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={() => handleRemove(action.id)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateConversionActionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
