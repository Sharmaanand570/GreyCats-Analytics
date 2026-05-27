import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiMeta } from "react-icons/si";
import { CheckCircle2, ShieldCheck, X, History, FileSearch } from "lucide-react";
import {
  useApproveDraft,
  useAuditLog,
  useDrafts,
  useRejectDraft,
} from "@/features/meta/hooks/useMetaAdmin";
import { useClients } from "@/hooks/useClients";
import { formatDistanceToNow } from "date-fns";

function MetaCompliancePage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const clientId = clientIdParam ? Number(clientIdParam) : null;

  const { data: clientsData } = useClients();
  const clients = clientsData || [];

  const [tab, setTab] = useState("approvals");
  const [auditFilter, setAuditFilter] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{
    campaignId: string;
    name: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: drafts, isLoading: isLoadingDrafts } = useDrafts(clientId);
  const { data: audit, isLoading: isLoadingAudit } = useAuditLog(clientId, {
    limit: 100,
  });
  const { mutate: approve, isPending: isApproving } = useApproveDraft();
  const { mutate: reject, isPending: isRejecting } = useRejectDraft();

  const filteredAudit = (audit ?? []).filter((row) => {
    if (!auditFilter.trim()) return true;
    const q = auditFilter.trim().toLowerCase();
    return (
      row.objectId.toLowerCase().includes(q) ||
      row.action.toLowerCase().includes(q) ||
      row.actorName?.toLowerCase().includes(q) ||
      row.objectType.toLowerCase().includes(q)
    );
  });

  const handleReject = () => {
    if (!clientId || !rejectTarget || !rejectReason.trim()) return;
    reject(
      {
        clientId,
        campaignId: rejectTarget.campaignId,
        reason: rejectReason.trim(),
      },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason("");
        },
      }
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#fafafa]">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm px-8 py-6">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList className="text-xs font-medium text-slate-400">
              <BreadcrumbItem>
                <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  to={clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads"}
                >
                  Meta Ads
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-900 font-bold">
                  Compliance
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Compliance
                  <SiMeta className="w-4 h-4 text-[#0866FF]" />
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Approvals, audit log, and version history.
                </p>
              </div>
            </div>
            <Select
              value={clientId?.toString() ?? ""}
              onValueChange={(v) => navigate(`/data-sources/meta-ads/compliance/${v}`)}
            >
              <SelectTrigger className="h-11 w-[240px] rounded-xl">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c: { id: number; name: string }) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!clientId ? (
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
            Select a client to view compliance data.
          </Card>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="approvals" className="gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approvals
                {drafts && drafts.length > 0 && (
                  <Badge className="ml-1 bg-rose-500 text-white text-[10px] px-1.5 py-0">
                    {drafts.filter((d) => d.state === "PENDING_APPROVAL").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-1.5">
                <FileSearch className="w-3.5 h-3.5" /> Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approvals">
              {isLoadingDrafts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : !drafts || drafts.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
                  <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <h2 className="text-lg font-bold text-slate-900">No drafts pending</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    New campaigns submitted for approval will appear here.
                  </p>
                </Card>
              ) : (
                <Card className="rounded-2xl border-slate-100 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Submitted by</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Approvers</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drafts.map((draft) => (
                        <TableRow key={draft.jobId}>
                          <TableCell className="font-bold">
                            {draft.campaignName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                draft.state === "PENDING_APPROVAL"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : draft.state === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : draft.state === "REJECTED"
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-slate-50 text-slate-700 border-slate-200"
                              }
                            >
                              {draft.state.replace("_", " ").toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {draft.submittedBy ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {draft.submittedAt
                              ? formatDistanceToNow(new Date(draft.submittedAt), {
                                  addSuffix: true,
                                })
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {draft.approvers?.length ?? 0} / {draft.approversNeeded ?? 1}
                          </TableCell>
                          <TableCell className="text-right">
                            {draft.state === "PENDING_APPROVAL" && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isApproving}
                                  onClick={() =>
                                    approve({
                                      clientId,
                                      campaignId: String(draft.jobId),
                                    })
                                  }
                                  className="h-8 rounded-lg gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setRejectTarget({
                                      campaignId: String(draft.jobId),
                                      name: draft.campaignName,
                                    })
                                  }
                                  className="h-8 rounded-lg gap-1.5"
                                >
                                  <X className="w-3.5 h-3.5 text-rose-500" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {draft.state === "REJECTED" && draft.rejectionReason && (
                              <span
                                className="text-xs text-rose-600 italic"
                                title={draft.rejectionReason}
                              >
                                rejected
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="audit">
              <Card className="rounded-2xl border-slate-100 overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                  <Input
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                    placeholder="Filter by actor, object, or action…"
                    className="h-9 rounded-lg max-w-md"
                  />
                </div>
                {isLoadingAudit ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                  </div>
                ) : !audit || audit.length === 0 ? (
                  <div className="p-12 text-center text-sm text-slate-500">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No audit entries yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">When</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Object</TableHead>
                        <TableHead>fbtrace</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAudit.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(row.createdAt), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            {row.actorName ?? `user ${row.actorUserId}`}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-bold"
                            >
                              {row.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">{row.objectType}</span>
                              <span className="text-slate-700">{row.objectId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] font-mono text-slate-400">
                            {row.fbtrace_id ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Reject reason modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject draft</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-slate-600">
              Rejecting{" "}
              <span className="font-bold">{rejectTarget?.name}</span>. The submitter
              will see your reason.
            </p>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why are you rejecting? (required)"
              className="rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || isRejecting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Reject draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MetaCompliancePage;
