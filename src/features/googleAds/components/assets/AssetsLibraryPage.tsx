import { useState, useMemo } from "react";
import {
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  List,
  Youtube,
  Phone,
  Tag,
  FileText,
  Trash2,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
  // @ts-expect-error unused variable
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
  // @ts-expect-error unused variable
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAssets, useRemoveAsset } from "../../hooks/useCampaignManagement";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import {
  StatusBadge,
  fmtCurrency,
  fmtNumber,
  TableToolbar,
  TableSkeletonRows,
  EmptyState,
  ErrorState,
} from "../ui/GoogleAdsShared";
import type { AssetType } from "../../types/googleAds.types";
import { CreateAssetModal } from "./CreateAssetModal";

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────

interface AssetsLibraryPageProps {
  clientId: number;
}

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const ASSET_TABS = [
  { id: "SITELINK", label: "Sitelinks", icon: LinkIcon },
  { id: "CALLOUT", label: "Callouts", icon: MessageSquare },
  { id: "STRUCTURED_SNIPPET", label: "Structured snippets", icon: List },
  { id: "IMAGE", label: "Images", icon: ImageIcon },
  { id: "LOGO", label: "Logos", icon: ImageIcon },
  { id: "YOUTUBE_VIDEO", label: "Videos", icon: Youtube },
  { id: "CALL", label: "Calls", icon: Phone },
  { id: "PROMOTION", label: "Promotions", icon: Tag },
  { id: "LEAD_FORM", label: "Lead forms", icon: FileText },
] as const;

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function AssetsLibraryPage({ clientId }: AssetsLibraryPageProps) {
  const { dateRange } = useGoogleAdsStore();
  const [activeTab, setActiveTab] = useState<string>("SITELINK");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  // API Calls
  const { data, isLoading, isError, error } = useAssets(clientId, {
    type: activeTab,
    ...dateRange,
  });

  const removeMutation = useRemoveAsset(clientId);

  const assets = useMemo(() => data?.assets ?? [], [data?.assets]);

  const filtered = useMemo(() => {
    let result = assets;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          (a.text && a.text.toLowerCase().includes(q)) ||
          (a.calloutText && a.calloutText.toLowerCase().includes(q)) ||
          (a.finalUrl && a.finalUrl.toLowerCase().includes(q))
      );
    }
    return result;
  }, [assets, searchTerm]);

  // Selection
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
    if (window.confirm("Are you sure you want to remove this asset?")) {
      removeMutation.mutate(id);
    }
  };

  if (isError) {
    return (
      <ErrorState
        message={(error as Error)?.message ?? "Failed to load assets"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* TOOLBAR */}
      <TableToolbar
        title="Assets Library"
        count={assets.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.size === 0 || removeMutation.isPending}
              onClick={() => {
                if (window.confirm(`Remove ${selectedIds.size} assets?`)) {
                  selectedIds.forEach((id) => removeMutation.mutate(id));
                  setSelectedIds(new Set());
                }
              }}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove Selected
            </Button>
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Asset
            </Button>
          </>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSelectedIds(new Set());
          setSearchTerm("");
        }}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="border-b border-slate-200 bg-white px-6">
          <TabsList className="h-auto p-0 bg-transparent gap-1 rounded-none flex-wrap justify-start">
            {ASSET_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-sm rounded-none border-b-2 border-transparent px-3 py-3 gap-2 transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={
                      filtered.length > 0 && selectedIds.size === filtered.length
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Asset Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Impr.</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
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
                      icon={ASSET_TABS.find((t) => t.id === activeTab)?.icon ?? FileText}
                      title={`No ${ASSET_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} found`}
                      description="Add assets to use them across your campaigns."
                      actionLabel="Add Asset"
                      onAction={() => setCreateOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((asset) => {
                  const isSelected = selectedIds.has(asset.id);
                  const m = asset.metrics;

                  return (
                    <TableRow
                      key={asset.id}
                      className="hover:bg-slate-50 transition-colors group"
                      data-state={isSelected ? "selected" : undefined}
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(asset.id)}
                        />
                      </TableCell>

                      <TableCell className="font-medium text-slate-900">
                        {(asset.type === "IMAGE" || asset.type === "LOGO") && (asset.imageUrl || asset.assetUrl) && (
                          <div className="flex items-center gap-3">
                            <img
                              src={asset.imageUrl || asset.assetUrl}
                              alt="Asset"
                              className="w-12 h-12 object-cover rounded border border-slate-200 bg-white"
                            />
                            <span className="text-xs text-slate-500">{asset.type === "LOGO" ? "Logo Asset" : "Image Asset"}</span>
                          </div>
                        )}
                        {(asset.type === "YOUTUBE_VIDEO" || asset.type === "VIDEO") && (asset.videoId || asset.assetUrl) && (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center">
                              <Youtube className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-sm">Video ID: {asset.videoId || asset.assetUrl}</span>
                          </div>
                        )}
                        {(asset.type === "SITELINK" || asset.type === "CALLOUT") && (
                          <div className="flex flex-col gap-0.5">
                            <span>{asset.text || asset.calloutText}</span>
                            {asset.finalUrl && (
                              <a
                                href={asset.finalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <LinkIcon className="w-3 h-3" />
                                {asset.finalUrl}
                              </a>
                            )}
                          </div>
                        )}
                        {!["IMAGE", "LOGO", "YOUTUBE_VIDEO", "VIDEO", "SITELINK", "CALLOUT"].includes(
                          asset.type
                        ) && <span>{asset.text || asset.id}</span>}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={asset.status} />
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

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                              onClick={() => handleRemove(asset.id)}
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
      </Tabs>

      <CreateAssetModal
        clientId={clientId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultType={activeTab as AssetType}
      />
    </div>
  );
}
