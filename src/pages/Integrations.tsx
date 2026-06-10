import { FiSearch, FiLoader, FiAlertCircle } from "react-icons/fi";
import { NotificationsPopover } from "../components/NotificationsPopover";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import DropDownFilter, { type FilterGroup } from "../components/DropDownFilter";
import TableComponent from "../components/TableComponent";
import ConnectDataSource from "../components/ConnectDataSource";
import { getPlatformConfig, capitalizeStatus } from "@/utils/platformMapping";
import React, { useMemo, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { useRemoveAccount, useSyncProgress } from "@/hooks/useIntegrations";
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
import { useClient, useAllClients } from "../hooks/useClients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";
import { Building2, ArrowRight, Database } from "lucide-react";
import { useSyncStatus } from "@/features/reports/hooks/useSyncStatus";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";
import { SyncProgressBar } from "@/components/SyncProgressBar";

import type { ConnectedIntegration } from "@/types/client.types";
import { useShopifyPolling } from "@/features/shopify/hooks/useShopifyPolling";
import { useWordPressTargets, useTelegramTargets } from "@/features/blog/hooks/useBlogPosts";
import { useIntegrations as useBroadcastIntegrations, useDeleteIntegration as useDeleteBroadcastIntegration } from "@/features/broadcasts/hooks/useBroadcasts";
import { FaWordpress } from "react-icons/fa6";
import { SiTelegram } from "react-icons/si";
import { Mail, MessageSquare } from "lucide-react";

interface IntegrationsProps {
  clientId?: number;
  withLayout?: boolean;
  hideHeader?: boolean;
}

// -------------------------------------------------------------------
// StatusCell: Decides between SyncProgressBar and SyncStatusBadge.
// Defined at module level so React sees a stable component reference
// (avoids remounts / polling resets on every parent render).
// -------------------------------------------------------------------
interface StatusCellProps {
  clientId: number;
  integrationType: import("@/types/client.types").IntegrationType;
  accountId: number;
  isSyncing: boolean;
  syncDetails: { total: number; synced: number } | null;
  hasInitialData?: boolean;
}

const StatusCell: React.FC<StatusCellProps> = ({
  clientId,
  integrationType,
  accountId,
  isSyncing,
  syncDetails,
  hasInitialData,
}) => {
  const { data: syncData, isLoading: syncLoading, isError } = useSyncProgress(
    clientId,
    integrationType,
    true
  );

  const awaitingDataBadge = hasInitialData === false ? (
    <div className="flex items-center px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-md whitespace-nowrap">
      Awaiting Data
    </div>
  ) : null;

  // Show progress bar when a sync is happening, recently finished, or failed
  if (syncLoading || isError || (syncData?.success && syncData?.status !== 'not_started')) {
    return (
      <div className="flex items-center gap-2">
        <SyncProgressBar
          clientId={clientId}
          integrationType={integrationType}
          accountId={accountId}
          compact={true}
        />
        {awaitingDataBadge}
      </div>
    );
  }

  // Fallback: static connected badge
  return (
    <div className="flex items-center gap-2">
      <SyncStatusBadge
        isSyncing={isSyncing}
        statusText={capitalizeStatus("connected")}
        syncDetails={syncDetails}
      />
      {awaitingDataBadge}
    </div>
  );
};

function Integrations({ clientId: propClientId, withLayout = true, hideHeader = false }: IntegrationsProps) {
  const params = useParams<{ clientId?: string }>();
  const clientId = propClientId ?? (params.clientId ? parseInt(params.clientId) : null);

  useShopifyPolling(clientId); // Add polling hook

  const { data: client, isLoading, error } = useClient(clientId);
  const { data: wordpressTargets = [] } = useWordPressTargets(clientId ?? undefined);
  const { data: telegramTargets = [] } = useTelegramTargets(clientId ?? undefined);
  const { data: broadcastIntegrations = [] } = useBroadcastIntegrations(clientId ?? undefined);
  console.log("client", client);
  const removeAccount = useRemoveAccount();
  const deleteBroadcastIntegration = useDeleteBroadcastIntegration();
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedIntegration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disconnectTarget || !clientId) return;

    try {
      if ((disconnectTarget as any)._isBroadcastIntegration) {
        await deleteBroadcastIntegration.mutateAsync(Number(disconnectTarget.accountId));
      } else {
        await removeAccount.mutateAsync({
          clientId,
          integrationType: disconnectTarget.integrationType,
          accountId: disconnectTarget.accountId,
        });
      }
      setDisconnectTarget(null);
    } catch (error) {
      console.error("Failed to disconnect", error);
    }
  };

  const { data: clients, isLoading: isLoadingClients } = useAllClients();
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

  const { isAccountSyncing, getIntegrationCounts, overallProgress, hasError, errorMessage, retrySync } = useSyncStatus(clientId);

  const [sortOrder, setSortOrder] = useState<string>("date_desc");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const availablePlatforms = useMemo(() => {
    if (!client?.integrations) return [];
    const platforms = new Set(client.integrations.map(i => i.integrationType));
    return Array.from(platforms);
  }, [client]);

  const filterGroups = useMemo<FilterGroup[]>(() => [
    {
      id: "sort",
      label: "Sort By",
      value: sortOrder,
      onChange: setSortOrder,
      options: [
        { label: "Newest First", value: "date_desc" },
        { label: "Oldest First", value: "date_asc" },
        { label: "Name (A-Z)", value: "name_asc" },
        { label: "Name (Z-A)", value: "name_desc" },
      ]
    },
    {
      id: "platform",
      label: "Platform",
      value: platformFilter,
      onChange: setPlatformFilter,
      options: [
        { label: "All Platforms", value: "all" },
        ...availablePlatforms.map(p => ({
          label: getPlatformConfig(p.toLowerCase().replace(/_/g, "-"))?.name || p,
          value: p
        }))
      ]
    }
  ], [sortOrder, platformFilter, availablePlatforms]);

  const tableData = useMemo(() => {
    if (!client?.integrations) {
      return [];
    }

    console.log('Client data:', client);
    console.log('Client integrations:', client.integrations);

    let integrations: any[] = [];

    // The Data Sources tab is the unified "everything this client is connected to"
    // view. Pull from all separate backend tables so the user sees one full picture:
    //  - WordPress sites           (BlogIntegration / blog API)
    //  - Telegram channels         (TelegramAccount / blog API, used by broadcasts)
    //  - SMS / Email gateways      (BroadcastIntegration / broadcast API)
    const wordpressExtras = (wordpressTargets || []).map(w => ({
      integrationType: 'wordpress',
      accountId: w.id,
      accountName: w.name || w.url,
      connectedAt: undefined,
      hasInitialData: undefined,
      _isBlogIntegration: true,
    }));

    const telegramExtras = (telegramTargets || []).map(t => ({
      integrationType: 'telegram',
      accountId: t.id,
      accountName: t.name,
      connectedAt: undefined,
      hasInitialData: undefined,
      _isTelegramTarget: true,
    }));

    const broadcastExtras = (broadcastIntegrations || []).map((b: any) => ({
      integrationType: b.type === 'SMS' ? 'broadcast-sms' : 'broadcast-email',
      accountId: String(b.id),
      accountName: b.name,
      provider: b.provider,
      connectedAt: b.createdAt,
      hasInitialData: undefined,
      _isBroadcastIntegration: true,
    }));

    const blogExtras = [...wordpressExtras, ...telegramExtras, ...broadcastExtras];

    if (client.integrations) {
      client.integrations.forEach(integration => {
        if (integration.integrationType === 'meta-business') {
          // Look up raw account to check for Instagram
          const rawAccount = client.metaBusinessAccounts?.find(
            (acc: any) => acc.metaAccountId === integration.accountId || acc.id === integration.accountId
          );
          
          // Always push Facebook Page
          integrations.push({
            ...integration,
            integrationType: 'meta-facebook',
            accountName: rawAccount?.metaAccount?.pageName || integration.accountName,
            _originalIntegrationType: 'meta-business'
          });

          // If it has Instagram, push an Instagram row
          if (rawAccount?.metaAccount?.instagramBusinessId || rawAccount?.metaAccount?.instagramUsername) {
            integrations.push({
              ...integration,
              integrationType: 'meta-instagram',
              accountName: `@${rawAccount.metaAccount.instagramUsername || rawAccount.metaAccount.instagramBusinessId}`,
              _originalIntegrationType: 'meta-business'
            });
          }
        } else {
          integrations.push(integration);
        }
      });
    }

    // Tack on WordPress / Telegram coming from /blog/integrations.
    integrations.push(...blogExtras);

    // Filter by platform
    if (platformFilter !== 'all') {
      integrations = integrations.filter(i => i.integrationType === platformFilter);
    }

    // Filter by search query if present
    const filtered = searchQuery.trim()
      ? integrations.filter(integration =>
        (integration.accountName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (integration.integrationType || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
      : integrations;

    // Apply Sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "date_desc":
          // Fallback to 0 if connectedAt is missing
          return new Date(b.connectedAt || 0).getTime() - new Date(a.connectedAt || 0).getTime();
        case "date_asc":
          return new Date(a.connectedAt || 0).getTime() - new Date(b.connectedAt || 0).getTime();
        case "name_asc":
          return (a.accountName || "").localeCompare(b.accountName || "");
        case "name_desc":
          return (b.accountName || "").localeCompare(a.accountName || "");
        default:
          return 0;
      }
    });

    return filtered.map((integration) => {
      const platformKey = (integration.integrationType || "").toLowerCase().replace(/_/g, "-");
      const platformConfig = getPlatformConfig(platformKey);

      // Special-case the blog-sourced WordPress / Telegram rows since they don't
      // live in client_integration_association and have no sync pipeline.
      if (integration._isBlogIntegration) {
        return {
          name: 'WordPress',
          icon: FaWordpress,
          iconColor: '#21759b',
          link: '/blog/scheduler' + (clientId ? `/${clientId}` : ''),
          label: integration.accountName,
          status: (
            <div className="flex items-center px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md whitespace-nowrap w-fit">
              Connected
            </div>
          ),
          renderActions: () => (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setDisconnectTarget({
                    ...integration,
                    integrationType: 'wordpress'
                  });
                }}
              >
                Disconnect
              </Button>
            </div>
          ),
        };
      }

      if (integration._isTelegramTarget) {
        return {
          name: 'Telegram',
          icon: SiTelegram,
          iconColor: '#229ED9',
          link: '/broadcasts',
          label: integration.accountName,
          status: (
            <div className="flex items-center px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md whitespace-nowrap w-fit">
              Connected
            </div>
          ),
          renderActions: () => (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setDisconnectTarget({
                    ...integration,
                    integrationType: 'telegram'
                  });
                }}
              >
                Disconnect
              </Button>
            </div>
          ),
        };
      }

      if (integration._isBroadcastIntegration) {
        const isSms = integration.integrationType === 'broadcast-sms';
        return {
          name: isSms ? 'SMS Gateway' : 'Email Gateway',
          icon: isSms ? MessageSquare : Mail,
          iconColor: isSms ? '#ea580c' : '#4f46e5',
          link: '/broadcasts',
          label: `${integration.accountName} · ${integration.provider}`,
          status: (
            <div className="flex items-center px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md whitespace-nowrap w-fit">
              Connected
            </div>
          ),
          renderActions: () => (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setDisconnectTarget({
                    ...integration,
                    integrationType: isSms ? 'broadcast-sms' : 'broadcast-email'
                  });
                }}
              >
                Disconnect
              </Button>
            </div>
          ),
        };
      }

      // Prefer mapped link; otherwise fall back to data-sources/<platform>
      let link = platformConfig?.link || `/data-sources/${platformKey}`;

      // Append Client ID for dynamic routes
      // List of platforms that support /:clientId
      const dynamicPlatforms = [
        'google-analytics', 'google-console', 'google-search-console',
        'youtube', 'meta-ads', 'google-ads',
        'meta-business', 'meta-facebook', 'meta-insights', 'meta-instagram',
        'twitter', 'linkedin', 'shopify', 'woocommerce', 'woo',
      ];
      if (clientId && dynamicPlatforms.includes(platformKey) && !link.endsWith(`/${clientId}`)) {
        link = `${link}/${clientId}`;
      }

      const originalType = integration._originalIntegrationType || integration.integrationType;
      const syncDetails = getIntegrationCounts(originalType);
      const isSyncing = isAccountSyncing(originalType, integration.accountId);


      return {
        name: platformConfig?.name || integration.integrationType,
        icon: platformConfig?.icon,
        iconColor: platformConfig?.color,
        link,
        label: integration.accountName,
        status: (
          <StatusCell
            clientId={clientId!}
            integrationType={originalType}
            accountId={integration.accountId}
            isSyncing={isSyncing}
            syncDetails={syncDetails}
            hasInitialData={integration.hasInitialData}
          />
        ),
        renderActions: () => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                // Pass original type to disconnect target so it disconnects the meta-business parent
                setDisconnectTarget({
                  ...integration,
                  integrationType: originalType
                });
              }}
            >
              Disconnect
            </Button>
          </div>
        ),
      };
    });
  }, [client, wordpressTargets, telegramTargets, broadcastIntegrations, searchQuery, isAccountSyncing, clientId, getIntegrationCounts, sortOrder, platformFilter]);



  const content = (
    <div className="w-full h-full flex flex-col">
      {!hideHeader && (
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <span className="font-medium text-xl">Platforms</span>
            <p className="text-sm text-slate-500 mt-1">Manage all your platform connections in one place.</p>
          </div>
          <div className="flex items-center">
            <span className="mx-2 text-lg text-gray-500">
              <FiSearch />
            </span>
            <span className="mx-2">
              <NotificationsPopover />
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
            <DropDownFilter groups={filterGroups} />
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
              {tableData.length} account{tableData.length !== 1 ? 's' : ''} connected
            </div>
          )}
        </div>
      </div>
      <div className="w-full px-5">
        {hasError && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <FiAlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-red-900 text-sm">Sync Status Unavailable</h4>
                <p className="text-red-700 text-xs mt-0.5">
                  {errorMessage || "Failed to fetch sync status"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={retrySync} className="text-red-700 border-red-200 hover:bg-red-100">
              Retry
            </Button>
          </div>
        )}

        {overallProgress.isSyncing && !hasError && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <FiLoader className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm">Syncing Data Sources</h4>
                <p className="text-blue-700 text-xs mt-0.5">
                  Synced {overallProgress.synced} of {overallProgress.total} integrations
                  {overallProgress.pending > 0 && ` (${overallProgress.pending} pending)`}
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
        ) : tableData.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-zinc-200/60 shadow-xl shadow-zinc-200/20 p-12 text-center max-w-3xl mx-auto my-10">
            <div className="w-24 h-24 bg-zinc-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-zinc-100 shadow-inner transform -rotate-6 transition-transform hover:rotate-0 duration-500">
              <Database className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-zinc-900 font-extrabold text-3xl tracking-tight mb-4">Connect Your First Platform</h3>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-10 max-w-xl mx-auto">
              Platforms are the engines that power your workspace. Connect data sources like Google Analytics, Facebook Ads, or Shopify to automatically feed data into your <span className="font-bold text-zinc-700">Reports</span> and train your <span className="font-bold text-zinc-700">Brand AI</span>.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
              <div className="bg-zinc-50/50 p-6 rounded-[24px] border border-zinc-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">1</div>
                <h4 className="font-bold text-zinc-900 mb-2">Connect</h4>
                <p className="text-xs text-zinc-500 font-medium">Securely authorize your favorite platforms with 1-click OAuth.</p>
              </div>
              <div className="bg-zinc-50/50 p-6 rounded-[24px] border border-zinc-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm mb-4">2</div>
                <h4 className="font-bold text-zinc-900 mb-2">Sync</h4>
                <p className="text-xs text-zinc-500 font-medium">We securely download your historical data to power insights.</p>
              </div>
              <div className="bg-zinc-50/50 p-6 rounded-[24px] border border-zinc-100">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mb-4">3</div>
                <h4 className="font-bold text-zinc-900 mb-2">Analyze</h4>
                <p className="text-xs text-zinc-500 font-medium">View instant reports and ask Brand AI questions about your data.</p>
              </div>
            </div>

            <ConnectDataSource clientId={clientId}>
              <Button className="rounded-2xl h-14 px-10 bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-xl shadow-zinc-200/50 transition-all active:scale-[0.98] text-base">
                Get Started
              </Button>
            </ConnectDataSource>
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
    <div className="w-full min-h-[100dvh] flex flex-col overflow-x-hidden bg-white">
      <div className="w-full h-full">
        {content}
      </div>
    </div>
  );
}

export default Integrations;
