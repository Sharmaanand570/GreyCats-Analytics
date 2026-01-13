import { FiBell, FiSearch, FiLoader } from "react-icons/fi";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import DropDownFilter from "../components/DropDownFilter";
import TableComponent from "../components/TableComponent";
import ConnectDataSource from "../components/ConnectDataSource";
import { getPlatformConfig, capitalizeStatus } from "@/utils/platformMapping";
import { useMemo, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { useRemoveAccount } from "@/hooks/useIntegrations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

import { useParams } from "react-router-dom";
import { useClient, useClients } from "../hooks/useClients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";
import { Building2, ArrowRight } from "lucide-react";
import { useSyncStatus } from "@/features/reports/hooks/useSyncStatus";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";

import type { ConnectedIntegration } from "@/types/client.types";
import { useShopifyPolling } from "@/features/shopify/hooks/useShopifyPolling";

interface IntegrationsProps {
  clientId?: number;
  withLayout?: boolean;
  hideHeader?: boolean;
}

function Integrations({ clientId: propClientId, withLayout = true, hideHeader = false }: IntegrationsProps) {
  const params = useParams<{ clientId?: string }>();
  const clientId = propClientId ?? (params.clientId ? parseInt(params.clientId) : null);

  useShopifyPolling(clientId); // Add polling hook

  const { data: client, isLoading, error } = useClient(clientId);
  console.log("client", client);
  const removeAccount = useRemoveAccount();
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedIntegration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disconnectTarget || !clientId) return;

    try {
      await removeAccount.mutateAsync({
        clientId,
        integrationType: disconnectTarget.integrationType,
        accountId: disconnectTarget.accountId,
      });
      setDisconnectTarget(null);
    } catch (error) {
      console.error("Failed to disconnect", error);
    }
  };

  const { data: clients, isLoading: isLoadingClients } = useClients();
  const navigate = useNavigate();

  if (!clientId) {
    if (isLoadingClients) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Skeleton className="h-[400px] w-[600px] rounded-xl" />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-gray-50 to-white">
        <Card className="w-full max-w-2xl shadow-xl border-zinc-200">
          <CardHeader className="text-center pb-8 border-b bg-white rounded-t-xl">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-zinc-800">Select a Client</CardTitle>
            <CardDescription className="text-base text-zinc-500 mt-2">
              Choose a client to manage their data sources and integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {clients?.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}?tab=data-sources`)}
                    className="w-full group flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl border border-transparent hover:border-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <span className="font-semibold text-sm">
                          {client.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-sm text-zinc-500 truncate max-w-[300px]">
                          {client.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
                {clients?.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No clients found. Create a client first.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { isAccountSyncing, getIntegrationCounts, overallProgress } = useSyncStatus(clientId);

  const tableData = useMemo(() => {
    if (!client?.integrations) {
      return [];
    }

    console.log('Client data:', client);
    console.log('Client integrations:', client.integrations);

    const integrations = client.integrations;

    // Filter by search query if present
    const filtered = searchQuery.trim()
      ? integrations.filter(integration =>
        (integration.accountName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (integration.integrationType || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
      : integrations;

    return filtered.map((integration) => {
      const platformKey = (integration.integrationType || "").toLowerCase().replace(/_/g, "-");
      const platformConfig = getPlatformConfig(platformKey);

      // Prefer mapped link; otherwise fall back to data-sources/<platform>
      let link = platformConfig?.link || `/data-sources/${platformKey}`;

      // Append Client ID for dynamic routes
      // List of platforms that support /:clientId
      const dynamicPlatforms = ['google-analytics', 'google-console', 'youtube', 'meta-ads', 'meta-business', 'meta-facebook', 'meta-instagram'];
      if (clientId && dynamicPlatforms.includes(platformKey) && !link.endsWith(`/${clientId}`)) {
        link = `${link}/${clientId}`;
      }

      const isSyncing = isAccountSyncing(integration.integrationType, integration.accountId);
      const syncDetails = getIntegrationCounts(integration.integrationType);

      return {
        name: platformConfig?.name || integration.integrationType,
        icon: platformConfig?.icon,
        iconColor: platformConfig?.color,
        link,
        label: integration.accountName,
        status: <SyncStatusBadge isSyncing={isSyncing} statusText={capitalizeStatus("connected")} syncDetails={syncDetails} />,
        onDisconnect: () => setDisconnectTarget(integration),
      };
    });
  }, [client, searchQuery, isAccountSyncing, clientId, getIntegrationCounts]);



  const content = (
    <div className="w-full h-full flex flex-col">
      {!hideHeader && (
        <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5 ">
          <span className="font-medium text-xl">Data Sources</span>
          <div className="flex items-center">
            <span className="mx-2 text-lg text-gray-500">
              <FiSearch />
            </span>
            <span className="mx-2 text-lg text-gray-500 ">
              {" "}
              <FiBell />
            </span>
            <span className="ml-4">
              <ConnectDataSource clientId={clientId}>
                <Button className="rounded-[0.4rem]">
                  Connect Data Source
                </Button>
              </ConnectDataSource>
            </span>
          </div>
        </div>
      )}

      <div className="w-full justify-between items-center flex px-5">
        <div className="flex w-[30%]  gap-3 py-6">
          <div className="w-[60%]">
            <Input
              className="w-full rounded-[0.5rem] p-4 py-5"
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <DropDownFilter />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hideHeader && (
            <ConnectDataSource clientId={clientId}>
              <Button className="rounded-[0.4rem]">
                Connect Data Source
              </Button>
            </ConnectDataSource>
          )}
          {client?.integrations && (
            <div className="text-sm text-muted-foreground">
              {client.integrations.length} account{client.integrations.length !== 1 ? 's' : ''} connected
            </div>
          )}
        </div>
      </div>
      <div className="w-full px-5">
        {overallProgress.isSyncing && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <FiLoader className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm">Syncing Data Sources</h4>
                <p className="text-blue-700 text-xs mt-0.5">
                  Synced {overallProgress.synced} of {overallProgress.total} integrations
                </p>
              </div>
            </div>
            <div className="w-48 bg-blue-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="border w-full rounded-[0.7rem] overflow-hidden p-6 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="border w-full rounded-[0.7rem] overflow-hidden p-6">
            <div className="text-destructive">
              <p className="font-medium">Failed to load integrations</p>
              <p className="text-sm text-muted-foreground mt-1">
                Failed to load integrations
              </p>
            </div>
          </div>
        ) : (
          <TableComponent
            header={[
              "Integration",
              "Label",
              "Status",
              "Action",
            ]}
            bodyData={tableData}
          />
        )}
      </div>

      <AlertDialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Integration?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect <span className="font-semibold">{disconnectTarget?.accountName}</span>?
              This will remove access to this account's data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              isLoading={removeAccount.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (!withLayout) {
    return content;
  }

  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        {content}
      </div>
    </div>
  );
}

export default Integrations;
