import { useEffect, useMemo, useState } from "react";
import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "./ui/button";
import TableComponent from "./TableComponent";
import { Input } from "./ui/input";
import DropDownFilter from "./DropDownFilter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteReportTemplate,
  listReportTemplates,
} from "@/features/reports/api/reportingApi";
import type { ReportTemplateSummary } from "@/features/reports/api/types";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";
import { useSyncStatus } from "@/features/reports/hooks/useSyncStatus";
import { Loader2 } from "lucide-react";

const TABLE_HEADERS = [
  "Name",
  "Created",
  "Actions",
];

function mapTemplateToRow(template: ReportTemplateSummary) {
  return {
    id: template.id,
    name: template.name,
    created: template.createdAt
      ? new Date(template.createdAt).toLocaleDateString()
      : "—",
  };
}

interface ReportsProps {
  viewMode?: "full" | "embedded";
  clientId?: number;
}

function Reports({ viewMode = "full", clientId: propClientId }: ReportsProps) {
  const { clientId } = useParams<{ clientId: string }>();
  const parsedClientId = propClientId ?? (clientId ? parseInt(clientId) : null);

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const {
    data: rawTemplates,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["report-templates", "list", parsedClientId],
    queryFn: async () => {
      if (!parsedClientId) return [];
      const response = await listReportTemplates(parsedClientId);
      const allTemplates = response.templates ?? [];

      console.log('[Reports] Fetched templates for client', parsedClientId);

      // Client-side isolation filter: ensure we only show templates for this client
      // This defends against the API ignoring the query param
      return allTemplates.filter(t => {
        const remoteClientId = t.clientId ?? t.client_id;

        if (remoteClientId && remoteClientId !== parsedClientId) {
          console.warn('[Reports] Filtered out template', t.id, 'belonging to client', remoteClientId);
          return false;
        }
        return true;
      });
    },
    enabled: !!parsedClientId,
  });

  const {
    data: integrationsData,
    isLoading: isLoadingIntegrations,
  } = useIntegrations(parsedClientId);

  // New: Check sync status
  const { overallProgress } = useSyncStatus(parsedClientId);
  const isSyncing = overallProgress.isSyncing;
  const [hasPendingOAuthForClient, setHasPendingOAuthForClient] = useState(false);

  useEffect(() => {
    const checkPendingOAuth = () => {
      if (!parsedClientId) {
        setHasPendingOAuthForClient(false);
        return;
      }

      const pendingClientId = localStorage.getItem("pending_oauth_client_id");
      const pendingIntegration = localStorage.getItem("pending_oauth_integration");
      const matchesClient = pendingClientId && Number(pendingClientId) === parsedClientId;
      setHasPendingOAuthForClient(Boolean(matchesClient && pendingIntegration));
    };

    checkPendingOAuth();
    window.addEventListener("storage", checkPendingOAuth);
    window.addEventListener("focus", checkPendingOAuth);

    return () => {
      window.removeEventListener("storage", checkPendingOAuth);
      window.removeEventListener("focus", checkPendingOAuth);
    };
  }, [parsedClientId]);

  const isReportAccessLocked = isSyncing || hasPendingOAuthForClient;

  // Broadcast and Blog are now built-in platforms, so we always have at least these data sources available
  const hasIntegrations = true;

  console.log('Reports - Integration check:', {
    clientId: parsedClientId,
    integrationsData,
    hasIntegrations,
    isLoadingIntegrations,
    isSyncing,
    hasPendingOAuthForClient,
    isReportAccessLocked,
  });

  const handleCreateReportClick = () => {
    if (isLoadingIntegrations || isReportAccessLocked) {
      if (hasPendingOAuthForClient) {
        toast.info("Connection is in progress. Please complete setup in Data Sources.");
      }
      return;
    }

    if (!hasIntegrations) {
      toast.error(
        "You need to connect at least one data source before creating a report."
      );
      return;
    }

    navigate(`/clients/${parsedClientId}/reports/new`);
  };

  const templates = (rawTemplates ?? []) as ReportTemplateSummary[];

  // Simple client-side search by name
  const filteredTemplates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((template) =>
      [template.name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term))
    );
  }, [templates, searchTerm]);

  const { mutate: deleteTemplate } = useMutation({
    mutationFn: async (id: number) => {
      await deleteReportTemplate(id);
    },
    onSuccess: () => {
      toast.success("Report template deleted");
      void refetch();
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to delete report template";
      toast.error(message);
    },
  });

  const tableRows = useMemo(() => {
    if (!filteredTemplates.length) return [];
    return filteredTemplates.map((template) => ({
      ...mapTemplateToRow(template),
      link: `/clients/${parsedClientId}/reports/${template.id}`,
      onDelete: () => deleteTemplate(template.id),
      disabled: isReportAccessLocked, // Disable row if syncing/connecting
    }));
  }, [filteredTemplates, deleteTemplate, isReportAccessLocked, parsedClientId]);

  const showTable = tableRows.length > 0;

  if (!parsedClientId) {
    return <div>Loading client...</div>;
  }



  const Content = (
    <div className="w-full h-full flex flex-col space-y-4">
      {viewMode === "full" && (
        <div className="w-full h-[4.8em] border-b flex justify-between items-center px-5 ">
          <span className="font-medium text-xl">Reports</span>
          <div className="flex items-center">
            <span className="mx-2 text-lg text-gray-500"><FiSearch /></span>
            <span className="mx-2 text-lg text-gray-500 "><FiBell /></span>
            <span className="ml-4">
              <Button
                className="rounded-[0.4rem]"
                onClick={handleCreateReportClick}
                disabled={isLoadingIntegrations || isReportAccessLocked}
              >
                {isReportAccessLocked ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {hasPendingOAuthForClient ? "Connecting..." : "Syncing..."}
                  </>
                ) : (
                  "Create Report"
                )}
              </Button>
            </span>
          </div>
        </div>
      )}

      <div className="w-full justify-between items-center flex px-5 py-6">
        <div className="flex w-full md:w-[60%] lg:w-[40%] gap-3">
          <div className="w-full">
            <Input
              className="w-full rounded-[0.5rem] p-4 py-5"
              type="text"
              placeholder="Search reports"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <DropDownFilter />
          </div>
        </div>
        {viewMode === "embedded" && (
          <div>
            <Button
              className="rounded-[0.4rem]"
              onClick={handleCreateReportClick}
              disabled={isLoadingIntegrations || isReportAccessLocked}
            >
              {isReportAccessLocked ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {hasPendingOAuthForClient ? "Connecting..." : "Syncing..."}
                </>
              ) : (
                "Create Report"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="w-full px-5 pb-10 space-y-6">
        {isLoading ? (
          <div>Loading templates...</div>
        ) : isError ? (
          <div>Error loading templates</div>
        ) : showTable ? (
          <TableComponent
            header={TABLE_HEADERS}
            bodyData={tableRows}
          />
        ) : (
          <div className="text-center py-10 opacity-60">
            No custom report templates yet.
          </div>
        )}
      </div>
    </div>
  );

  if (viewMode === "embedded") {
    return Content;
  }

  return (
    <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] ">
        {Content}
      </div>
    </div>
  );
}



export default Reports;

