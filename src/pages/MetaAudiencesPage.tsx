import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  ChevronDown,
  Globe,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
  UserSquare,
} from "lucide-react";
import { useAudiences } from "@/features/meta/hooks/useMetaAdsManager";
import { useAllClients } from "@/hooks/useClients";
import { AudienceCard } from "@/features/meta/components/audiences/AudienceCard";
import { CreateCustomerListModal } from "@/features/meta/components/audiences/CreateCustomerListModal";
import { CreateWebsiteTrafficModal } from "@/features/meta/components/audiences/CreateWebsiteTrafficModal";
import { CreateLookalikeModal } from "@/features/meta/components/audiences/CreateLookalikeModal";
import { DeleteAudienceDialog } from "@/features/meta/components/audiences/DeleteAudienceDialog";
import type { CustomAudience } from "@/features/meta/API/metaAdsManagerApi";

type CreateModal = "customer" | "website" | "lookalike" | null;

function MetaAudiencesPage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const clientId = clientIdParam ? Number(clientIdParam) : null;

  const { data: clientsData } = useAllClients();
  const clients = clientsData || [];

  const {
    data: audiencesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAudiences(clientId);
  const audiences = audiencesData?.audiences ?? [];

  const [openModal, setOpenModal] = useState<CreateModal>(null);
  const [audienceToDelete, setAudienceToDelete] = useState<CustomAudience | null>(null);

  // When the URL clientId changes (header dropdown, breadcrumb), close any
  // open create-modal and clear the delete target — both reference the old
  // client's data and would otherwise act on the wrong tenant.
  useEffect(() => {
    setOpenModal(null);
    setAudienceToDelete(null);
  }, [clientId]);

  const handleClientChange = (newClientId: number) => {
    if (newClientId === clientId) return;
    navigate(`/data-sources/meta-ads/audiences/${newClientId}`);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-[#fafafa]">
      <div className="w-full h-full flex flex-col">
        {/* Top Bar */}
        <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm">
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
                    Audiences
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_8px_16px_rgba(16,185,129,0.2)]">
                <UserSquare className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Audiences
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Custom lists, website retargeting, and lookalikes for this client
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[240px]">
              <Select
                value={clientId?.toString() ?? ""}
                onValueChange={(v) => handleClientChange(Number(v))}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white font-medium text-slate-700 shadow-sm">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-800" />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={!clientId || isFetching}
              className="h-11 w-11 rounded-xl border-slate-200"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={!clientId}
                  className="h-11 rounded-xl px-5 gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  New audience
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem
                  onClick={() => setOpenModal("customer")}
                  className="gap-3 py-3 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">Customer list</span>
                    <span className="text-[11px] text-slate-500">
                      Upload emails to retarget
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpenModal("website")}
                  className="gap-3 py-3 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">Website traffic</span>
                    <span className="text-[11px] text-slate-500">
                      Retarget Pixel-tracked visitors
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpenModal("lookalike")}
                  className="gap-3 py-3 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">Lookalike</span>
                    <span className="text-[11px] text-slate-500">
                      Find people similar to an existing audience
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {!clientId ? (
              <div className="rounded-[20px] border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
                Select a client to manage their audiences.
              </div>
            ) : isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </>
            ) : isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-rose-900">
                    Couldn't load audiences
                  </div>
                  <div className="text-sm text-rose-700 mt-0.5">
                    {(error as Error)?.message ?? "Unknown error"}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : audiences.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
                  <UserSquare className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">No audiences yet</h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    Create your first audience to retarget customers, build website-traffic
                    audiences, or scale with lookalikes.
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-11 rounded-xl px-6 gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-4 h-4" />
                      Create audience
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem
                      onClick={() => setOpenModal("customer")}
                      className="gap-3 py-3 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold">Customer list</span>
                        <span className="text-[11px] text-slate-500">
                          Upload emails to retarget
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setOpenModal("website")}
                      className="gap-3 py-3 cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold">Website traffic</span>
                        <span className="text-[11px] text-slate-500">
                          Retarget Pixel-tracked visitors
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setOpenModal("lookalike")}
                      className="gap-3 py-3 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold">Lookalike</span>
                        <span className="text-[11px] text-slate-500">
                          Find people similar to an existing audience
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              audiences.map((a) => (
                <AudienceCard
                  key={a.id}
                  audience={a}
                  onDelete={() => setAudienceToDelete(a)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {clientId !== null && (
        <>
          <CreateCustomerListModal
            open={openModal === "customer"}
            clientId={clientId}
            onClose={() => setOpenModal(null)}
          />
          <CreateWebsiteTrafficModal
            open={openModal === "website"}
            clientId={clientId}
            onClose={() => setOpenModal(null)}
          />
          <CreateLookalikeModal
            open={openModal === "lookalike"}
            clientId={clientId}
            onClose={() => setOpenModal(null)}
          />
          <DeleteAudienceDialog
            audience={audienceToDelete}
            clientId={clientId}
            onClose={() => setAudienceToDelete(null)}
          />
        </>
      )}
    </div>
  );
}

export default MetaAudiencesPage;
