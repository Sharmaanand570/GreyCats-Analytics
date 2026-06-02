import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { DateRangePicker } from '../components/DateRangePicker';
import { getDefaultDateRange } from '../components/Dashboard';
import { type DateRange } from "react-day-picker";
import Dashboard from '../components/Dashboard';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useClient } from '../hooks/useClients';
import Integrations from './Integrations';
import Reports from '../components/Reports';
import { AccountSelectionModal } from '../components/clients/AccountSelectionModal';
import type { IntegrationType } from '../types/integration.types';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Loader2, LayoutDashboard, FileBarChart, Database, CalendarDays, Edit2, Sparkles, Palette } from 'lucide-react';
import { NotificationsPopover } from '../components/NotificationsPopover';
import { ReportSchedules } from '../components/ReportSchedules';
import { useSyncStatus } from '@/features/reports/hooks/useSyncStatus';
import ClientFormModal from '../components/clients/ClientFormModal';
import BrandSettings from '../components/clients/BrandSettings';
import CreativeSuite from '../components/creative/CreativeSuite';
import { getProfileImageUrl } from "@/utils/imageUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { clientKeys } from '../hooks/useClients';
import type { Client } from "@/types/client.types";

const ClientDetailPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const parsedClientId = clientId ? parseInt(clientId) : null;
    const { data: client, isLoading, error } = useClient(parsedClientId);
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [pendingIntegration, setPendingIntegration] = useState<IntegrationType | null>(null);
    const [dateRange, setDateRangeRaw] = useState<DateRange | undefined>(() => {
        if (parsedClientId) {
            try {
                const saved = localStorage.getItem(`dashboard-daterange-${parsedClientId}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const from = new Date(parsed.from);
                    const to = new Date(parsed.to);
                    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
                        return { from, to };
                    }
                }
            } catch { /* ignore */ }
        }
        return getDefaultDateRange();
    });
    const setDateRange = React.useCallback((range: DateRange | undefined) => {
        setDateRangeRaw(range);
        if (range?.from && range?.to && parsedClientId) {
            const fmt = (d: Date) => d.toISOString().slice(0, 10);
            localStorage.setItem(`dashboard-daterange-${parsedClientId}`, JSON.stringify({ from: fmt(range.from), to: fmt(range.to) }));
        }
    }, [parsedClientId]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [hasPendingOAuthForClient, setHasPendingOAuthForClient] = useState(false);
    const queryClient = useQueryClient();
    const { overallProgress } = useSyncStatus(parsedClientId);
    const isReportAccessLocked = overallProgress.isSyncing || hasPendingOAuthForClient;

    React.useEffect(() => {
        const storedClientId = localStorage.getItem("pending_oauth_client_id");
        const storedIntegration = localStorage.getItem("pending_oauth_integration");

        if (storedClientId && storedIntegration && parsedClientId) {
            if (parseInt(storedClientId) === parsedClientId) {
                setHasPendingOAuthForClient(true);
                setPendingIntegration(storedIntegration as IntegrationType);
                setAccountModalOpen(true);
                setActiveTab("data-sources");
                return;
            }
        }

        setHasPendingOAuthForClient(false);
    }, [parsedClientId]);

    React.useEffect(() => {
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

    React.useEffect(() => {
        if (isReportAccessLocked && activeTab === "reports") {
            setActiveTab("data-sources");
        }
    }, [activeTab, isReportAccessLocked]);

    const handleAccountConnected = () => {
        if (!parsedClientId) return;
        // Refresh client details to update integrations list
        // Use the standardized key factory to ensure matches
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(parsedClientId) });
    };

    if (isLoading) {
        return (
            <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
                <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
                <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] flex flex-col items-center justify-center gap-4">
                    <p className="text-xl text-red-500">Failed to load client</p>
                    <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
                <div className="w-full h-full flex flex-col">
                    {/* Sticky Header */}
                    <div className="w-full h-[4.8em] border-b flex justify-between items-center px-5 bg-white/50 backdrop-blur-sm sticky top-0 z-10 transition-all">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/clients')}
                                className="rounded-full hover:bg-zinc-100 -ml-2 text-zinc-500"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Avatar className="h-10 w-10 border border-zinc-200">
                                <AvatarImage src={client.logo ? `${getProfileImageUrl(client.logo)}?v=${new Date(client.updatedAt).getTime()}` : undefined} className="object-contain" />
                                <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="font-semibold text-lg text-zinc-900 leading-none">{client.name}</h1>
                                {client.description && (
                                    <p className="text-sm text-muted-foreground mt-0.5 max-w-md truncate">
                                        {client.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {activeTab === 'overview' && parsedClientId && (
                                <>
                                    <Button
                                        onClick={() => setIsEditModalOpen(true)}
                                        variant="outline"
                                        size="sm"
                                        className="shadow-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" /> Edit Client
                                    </Button>
                                    <Link to={`/clients/${parsedClientId}/edit-dashboard`}>
                                        <Button variant="outline" size="sm" className="shadow-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                                            Edit Layout
                                        </Button>
                                    </Link>
                                    <DateRangePicker
                                        value={dateRange}
                                        // @ts-ignore
                                        onChange={setDateRange}
                                    />
                                </>
                            )}
                            <div className="flex items-center border-l pl-4 gap-3">
                                <NotificationsPopover />
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => {
                                if (value === "reports" && isReportAccessLocked) {
                                    setActiveTab("data-sources");
                                    return;
                                }
                                setActiveTab(value);
                            }}
                            className="space-y-6"
                        >
                            <TabsList className="bg-zinc-100/50 p-1 border border-zinc-200/50">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="reports" disabled={isReportAccessLocked} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <FileBarChart className="w-4 h-4 mr-2" />
                                    Reports
                                </TabsTrigger>
                                <TabsTrigger value="schedules" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <CalendarDays className="w-4 h-4 mr-2" />
                                    Schedules
                                </TabsTrigger>
                                <TabsTrigger value="data-sources" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Database className="w-4 h-4 mr-2" />
                                    Data Sources
                                </TabsTrigger>
                                <TabsTrigger value="brand-ai" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Brand AI
                                </TabsTrigger>
                                <TabsTrigger value="creative-suite" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Palette className="w-4 h-4 mr-2" />
                                    Creative Suite
                                </TabsTrigger>
                            </TabsList>
                            {isReportAccessLocked && (
                                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                                    Reports are temporarily disabled while data source connection/sync is in progress.
                                </p>
                            )}

                            <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
                                <div className="min-h-[500px]">
                                    {parsedClientId && (
                                        <Dashboard
                                            clientId={parsedClientId}
                                            onConnectIntegration={() => setActiveTab("data-sources")}
                                            withLayout={false}
                                            hideHeader={true}
                                            dateRange={dateRange}
                                            onDateRangeChange={setDateRange}
                                        />
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="reports" className="space-y-4 focus-visible:outline-none">
                                {parsedClientId && (
                                    <Reports viewMode="embedded" clientId={parsedClientId} />
                                )}
                            </TabsContent>

                            <TabsContent value="schedules" className="space-y-4 focus-visible:outline-none">
                                {parsedClientId && (
                                    <ReportSchedules clientId={parsedClientId} />
                                )}
                            </TabsContent>

                            <TabsContent value="data-sources" className="space-y-4 focus-visible:outline-none">
                                <div className="min-h-[500px]">
                                    {parsedClientId && (
                                        <Integrations
                                            clientId={parsedClientId}
                                            withLayout={false}
                                            hideHeader={true}
                                        />
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="brand-ai" className="space-y-4 focus-visible:outline-none">
                                <div className="min-h-[500px]">
                                    {parsedClientId && (
                                        <BrandSettings clientId={parsedClientId} />
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="creative-suite" className="space-y-4 focus-visible:outline-none">
                                <div className="min-h-[500px]">
                                    {parsedClientId && (
                                        <CreativeSuite clientId={parsedClientId} />
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {parsedClientId && (
                <AccountSelectionModal
                    open={accountModalOpen}
                    onOpenChange={setAccountModalOpen}
                    clientId={parsedClientId}
                    integration={pendingIntegration}
                    onSuccess={handleAccountConnected}
                />
            )}

            <ClientFormModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                client={client as unknown as Client}
            />
        </div>
    );
};

export default ClientDetailPage;
