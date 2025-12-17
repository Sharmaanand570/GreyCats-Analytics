import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useClient } from '../hooks/useClients';
import Integrations from './Integrations';
import { AccountSelectionModal } from '../components/clients/AccountSelectionModal';
import type { IntegrationType } from '../types/integration.types';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Loader2, LayoutDashboard, FileBarChart, Database } from 'lucide-react';
import { FiSearch, FiBell } from "react-icons/fi";
import { Input } from "../components/ui/input";

const ClientDetailPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const parsedClientId = clientId ? parseInt(clientId) : null;
    const { data: client, isLoading, error } = useClient(parsedClientId);
    const [activeTab, setActiveTab] = useState('overview');
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [pendingIntegration, setPendingIntegration] = useState<IntegrationType | null>(null);
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const storedClientId = localStorage.getItem("pending_oauth_client_id");
        const storedIntegration = localStorage.getItem("pending_oauth_integration");

        if (storedClientId && storedIntegration && parsedClientId) {
            if (parseInt(storedClientId) === parsedClientId) {
                setPendingIntegration(storedIntegration as IntegrationType);
                setAccountModalOpen(true);
                setActiveTab("data-sources");
            }
            // Clear storage
            localStorage.removeItem("pending_oauth_client_id");
            localStorage.removeItem("pending_oauth_integration");
        }
    }, [parsedClientId]);

    const handleAccountConnected = () => {
        // Refresh integrations
        queryClient.invalidateQueries({ queryKey: ["integrations", parsedClientId] });
        // Also refresh client details just in case
        queryClient.invalidateQueries({ queryKey: ["client", parsedClientId] });
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
                            <div className="relative hidden md:block w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    placeholder="Search details..."
                                />
                            </div>
                            <div className="flex items-center border-l pl-4 gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <FiBell className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="bg-zinc-100/50 p-1 border border-zinc-200/50">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <FileBarChart className="w-4 h-4 mr-2" />
                                    Reports
                                </TabsTrigger>
                                <TabsTrigger value="data-sources" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Database className="w-4 h-4 mr-2" />
                                    Data Sources
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
                                <div className="min-h-[500px]">
                                    {parsedClientId && (
                                        <Dashboard
                                            clientId={parsedClientId}
                                            onConnectIntegration={() => setActiveTab("data-sources")}
                                            withLayout={false}
                                            hideHeader={true}
                                        />
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="reports" className="space-y-4 focus-visible:outline-none">
                                <div className="rounded-xl border border-zinc-100 bg-white px-1 py-6 shadow-sm">
                                    <div className="flex justify-between items-start px-6 mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-zinc-900">Client Reports</h3>
                                            <p className="text-muted-foreground mt-1">
                                                Create and manage automated reports for {client.name}.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 px-6">
                                        <Button
                                            onClick={() => navigate(`/clients/${clientId}/reports`)}
                                            className="bg-zinc-900 hover:bg-zinc-800"
                                        >
                                            View All Reports
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/clients/${clientId}/reports/new`)}
                                        >
                                            Create New Report
                                        </Button>
                                    </div>
                                </div>
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
        </div>
    );
};

export default ClientDetailPage;
