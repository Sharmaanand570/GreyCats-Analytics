import { FiBell, FiSearch } from "react-icons/fi";
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
import { useClient } from "../hooks/useClients";

import type { ConnectedIntegration } from "@/types/client.types";

interface IntegrationsProps {
  clientId?: number;
  withLayout?: boolean;
  hideHeader?: boolean;
}

function Integrations({ clientId: propClientId, withLayout = true, hideHeader = false }: IntegrationsProps) {
  const params = useParams<{ clientId?: string }>();
  const clientId = propClientId ?? (params.clientId ? parseInt(params.clientId) : null);

  const { data: client, isLoading, error } = useClient(clientId);
  console.log("client", client);
  const removeAccount = useRemoveAccount();
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedIntegration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDisconnect = async () => {
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

  if (!clientId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please select a client to view integrations.
      </div>
    );
  }

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

      return {
        name: platformConfig?.name || integration.integrationType,
        icon: platformConfig?.icon,
        iconColor: platformConfig?.color,
        link,
        label: integration.accountName,
        identifier: integration.accountIdentifier,
        clientsConnected: 1,
        status: capitalizeStatus("connected"),
        onDisconnect: () => setDisconnectTarget(integration),
      };
    });
  }, [client, searchQuery]);

  console.log("tableData", tableData);

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
              "Identifier",
              "Clients Connected",
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeAccount.isPending ? "Disconnecting..." : "Disconnect"}
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
