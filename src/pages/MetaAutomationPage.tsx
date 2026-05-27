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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { SiMeta } from "react-icons/si";
import { Plus, Play, Trash2, Zap } from "lucide-react";
import {
  useAdRules,
  useCreateAdRule,
  useDeleteAdRule,
  useExecuteAdRule,
} from "@/features/meta/hooks/useMetaAdmin";
import type { AdRuleCreatePayload } from "@/features/meta/API/metaAdminApi";
import { useClients } from "@/hooks/useClients";

// Default new-rule shape — Mon-Fri daily at 09:00 schedule, pause on
// CPC > $5 over the last 3 days, scoped to all campaigns by default.
const blankRule = (): AdRuleCreatePayload => ({
  name: "",
  status: "ENABLED",
  evaluation_spec: {
    evaluation_type: "SCHEDULE",
    filters: [
      { field: "cpc", operator: "GREATER_THAN", value: 5, time_window: 3 },
    ],
  },
  execution_spec: { execution_type: "PAUSE" },
  schedule_spec: {
    schedule_type: "DAILY",
    schedule: [{ days: [0, 1, 2, 3, 4], hours: [9] }],
  },
  scope: { object_type: "CAMPAIGN", object_ids: [] },
});

const FIELD_OPTIONS = [
  { value: "spend", label: "Spend ($)" },
  { value: "cpc", label: "CPC ($)" },
  { value: "cpm", label: "CPM ($)" },
  { value: "ctr", label: "CTR (%)" },
  { value: "frequency", label: "Frequency" },
  { value: "purchase_roas", label: "Purchase ROAS" },
  { value: "impressions", label: "Impressions" },
  { value: "clicks", label: "Clicks" },
];

const OPERATOR_OPTIONS = [
  { value: "GREATER_THAN", label: ">" },
  { value: "LESS_THAN", label: "<" },
  { value: "EQUAL", label: "=" },
];

const EXECUTION_OPTIONS = [
  { value: "PAUSE", label: "Pause", hint: "Stop spending on matching objects" },
  { value: "UNPAUSE", label: "Resume", hint: "Activate matching objects" },
  { value: "NOTIFICATION", label: "Notify only", hint: "Just send an alert" },
  {
    value: "CHANGE_BUDGET",
    label: "Adjust budget",
    hint: "Increase or decrease daily budget",
  },
];

const SCOPE_OPTIONS = [
  { value: "CAMPAIGN", label: "Campaigns" },
  { value: "ADSET", label: "Ad Sets" },
  { value: "AD", label: "Ads" },
];

function MetaAutomationPage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const clientId = clientIdParam ? Number(clientIdParam) : null;

  const { data: clientsData } = useClients();
  const clients = clientsData || [];

  const { data: rules, isLoading } = useAdRules(clientId);
  const { mutate: createRule, isPending: isCreating } = useCreateAdRule();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteAdRule();
  const { mutate: executeRule } = useExecuteAdRule();

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<AdRuleCreatePayload>(blankRule());

  const handleCreate = () => {
    if (!clientId || !draft.name.trim()) return;
    createRule(
      { clientId, payload: draft },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setDraft(blankRule());
        },
      }
    );
  };

  const filter = draft.evaluation_spec.filters[0];

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
                  Automation
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
                <Zap className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Automation Rules
                  <SiMeta className="w-4 h-4 text-[#0866FF]" />
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Auto-pause, scale, or notify based on performance thresholds.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={clientId?.toString() ?? ""}
                onValueChange={(v) => navigate(`/data-sources/meta-ads/automation/${v}`)}
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
              <Button
                onClick={() => setCreateOpen(true)}
                disabled={!clientId}
                className="h-11 rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                <Plus className="w-4 h-4" />
                New Rule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!clientId ? (
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
            Select a client to manage automation rules.
          </Card>
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !rules || rules.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
            <Zap className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h2 className="text-lg font-bold text-slate-900">No automation rules yet</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Rules run on a schedule, evaluate your ads against a metric threshold, and
              automatically pause / resume / notify.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="mt-5 rounded-xl gap-2"
              variant="outline"
            >
              <Plus className="w-4 h-4" /> Create your first rule
            </Button>
          </Card>
        ) : (
          <Card className="rounded-2xl border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => {
                  const f = rule.evaluation_spec.filters[0];
                  const fieldLabel = FIELD_OPTIONS.find((o) => o.value === f?.field)
                    ?.label;
                  const opLabel = OPERATOR_OPTIONS.find((o) => o.value === f?.operator)
                    ?.label;
                  return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-bold">{rule.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            rule.status === "ENABLED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }
                        >
                          {rule.status === "ENABLED" ? "On" : "Off"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {fieldLabel} {opLabel} {String(f?.value ?? "—")} over {f?.time_window}d
                      </TableCell>
                      <TableCell className="text-sm">
                        {EXECUTION_OPTIONS.find(
                          (o) => o.value === rule.execution_spec.execution_type
                        )?.label ?? rule.execution_spec.execution_type}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 capitalize">
                        {rule.schedule_spec.schedule_type.toLowerCase()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              executeRule({ clientId, ruleId: rule.id })
                            }
                            title="Run now"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() =>
                              deleteRule({ clientId, ruleId: rule.id })
                            }
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Create modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
            <DialogDescription>
              Rules evaluate on a schedule and act when your threshold is breached.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Rule Name
              </label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Pause expensive campaigns"
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                When this happens…
              </div>
              <div className="grid grid-cols-[1fr_80px_120px_120px] gap-2">
                <Select
                  value={filter.field}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      evaluation_spec: {
                        ...draft.evaluation_spec,
                        filters: [{ ...filter, field: v }],
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filter.operator}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      evaluation_spec: {
                        ...draft.evaluation_spec,
                        filters: [{ ...filter, operator: v as typeof filter.operator }],
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={typeof filter.value === "number" ? filter.value : 0}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      evaluation_spec: {
                        ...draft.evaluation_spec,
                        filters: [{ ...filter, value: Number(e.target.value) || 0 }],
                      },
                    })
                  }
                  className="h-10 rounded-lg"
                />
                <Select
                  value={String(filter.time_window)}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      evaluation_spec: {
                        ...draft.evaluation_spec,
                        filters: [{ ...filter, time_window: Number(v) }],
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 3, 7, 14, 30].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        Last {d}d
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Do this…
              </div>
              <Select
                value={draft.execution_spec.execution_type}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    execution_spec: {
                      execution_type: v as typeof draft.execution_spec.execution_type,
                    },
                  })
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXECUTION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">{o.label}</span>
                        <span className="text-[10px] text-slate-400">{o.hint}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Apply to…
              </div>
              <Select
                value={draft.scope.object_type}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    scope: { ...draft.scope, object_type: v as typeof draft.scope.object_type },
                  })
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      All {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400">
                Empty scope means "all" — narrow to specific objects via the Meta API.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Schedule
              </div>
              <Select
                value={draft.schedule_spec.schedule_type}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    schedule_spec: {
                      schedule_type: v as typeof draft.schedule_spec.schedule_type,
                    },
                  })
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !draft.name.trim()}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
            >
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MetaAutomationPage;
