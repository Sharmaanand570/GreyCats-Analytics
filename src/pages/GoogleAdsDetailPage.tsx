import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SiGoogleads } from "react-icons/si";
import { TrendingUp, MousePointerClick, Eye, Percent, DollarSign, BarChart3, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useGoogleAdsSummary, useGoogleAdsCampaigns, useDisconnectGoogleAds } from "@/features/googleAds/hooks/useGoogleAds";
import { useAllClients, useClient } from "@/hooks/useClients";
import { PlatformNotConnected } from "@/components/PlatformNotConnected";
import { toast } from "sonner";
import type { GoogleAdsCampaign } from "@/features/googleAds/API/googleAdsApi";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number | undefined, type: "currency" | "percent" | "number" = "number"): string {
    if (value === undefined || value === null) return "—";
    if (type === "currency") return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (type === "percent") return `${(value * 100).toFixed(2)}%`;
    return value.toLocaleString("en-IN");
}

function statusBadge(status: string) {
    const lcStatus = status?.toLowerCase() ?? "";
    const map: Record<string, string> = {
        enabled: "bg-green-100/50 text-green-700 ring-1 ring-green-100",
        paused: "bg-yellow-100/50 text-yellow-700 ring-1 ring-yellow-100",
        removed: "bg-red-100/50 text-red-700 ring-1 ring-red-100",
    };
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${map[lcStatus] ?? "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}

// ── MetricCard ────────────────────────────────────────────────────────────────

type MetricCardProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
    isLoading?: boolean;
};

function MetricCard({ label, value, icon, isLoading, color = "blue" }: MetricCardProps & { color?: "blue" | "violet" | "emerald" | "orange" | "rose" | "zinc" }) {
    const colorMap = {
        blue: { text: "text-blue-600", bg: "bg-blue-50" },
        violet: { text: "text-violet-600", bg: "bg-violet-50" },
        emerald: { text: "text-emerald-600", bg: "bg-emerald-50" },
        orange: { text: "text-orange-600", bg: "bg-orange-50" },
        rose: { text: "text-rose-600", bg: "bg-rose-50" },
        zinc: { text: "text-zinc-600", bg: "bg-zinc-50" },
    };
    const c = colorMap[color];

    return (
        <div className="group p-6 bg-white border border-zinc-100 rounded-[28px] transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50/30">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
                <div className={cn("p-2 rounded-xl ring-1 ring-zinc-50", c.bg)}>
                    <div className={cn("h-4 w-4", c.text)}>{icon}</div>
                </div>
            </div>
            {isLoading ? (
                <Skeleton className="h-9 w-24 rounded-lg" />
            ) : (
                <div className="flex flex-col">
                    <div className="text-3xl font-bold tracking-tight text-zinc-900">{value}</div>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Cumulative Total</p>
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GoogleAdsDetailPage() {
    const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
    const navigate = useNavigate();

    const selectedClientId = clientIdParam ? Number(clientIdParam) : null;

    const { data: clients } = useAllClients();
    const { data: clientData } = useClient(selectedClientId);

    const hasGoogleAdsIntegration = !!clientData?.integrations?.some(
        (i: any) => i.integrationType === "google-ads"
    );

    const handleClientChange = (newClientId: string) => {
        navigate(`/data-sources/google-ads/${newClientId}`);
    };

    const {
        data: summaryData,
        isLoading: isLoadingSummary,
    } = useGoogleAdsSummary(selectedClientId ?? 0);

    const {
        data: campaignsData,
        isLoading: isLoadingCampaigns,
    } = useGoogleAdsCampaigns(selectedClientId ?? 0);

    const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectGoogleAds(selectedClientId ?? 0);

    const handleDisconnect = () => {
        if (!selectedClientId) return;
        disconnect(undefined, {
            onSuccess: () => {
                toast.success("Google Ads disconnected successfully.");
                navigate("/data-sources/google-ads");
            },
            onError: (err) => {
                toast.error(err.message || "Failed to disconnect Google Ads.");
            },
        });
    };

    const [searchFilter, setSearchFilter] = useState("");

    const summary = summaryData?.summary;
    const campaigns: GoogleAdsCampaign[] = campaignsData?.campaigns ?? [];

    const filteredCampaigns = campaigns.filter((c) =>
        c.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const isConnected = !isLoadingSummary && !!summaryData?.customerId;

    // ── Not Connected State ─────────────────────────────────────────────────────
    if (selectedClientId && clientData && !hasGoogleAdsIntegration) {
        return (
            <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
                <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] animate-in fade-in slide-in-from-bottom-2 duration-1000">
                    <PlatformNotConnected
                        platformName="Google Ads"
                        icon={<SiGoogleads className="h-10 w-10 text-blue-500" />}
                        clientName={clientData.name}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-0 md:p-0 space-y-0">
             <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <div className="w-full h-full flex flex-col">
                    {/* --- 1. Top Navigation Bar --- */}
                    <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm rounded-t-[32px] mb-6">
                        <div className="flex flex-col gap-2 relative">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 hover:text-slate-800 transition-colors font-medium text-xs">Data Sources</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="text-slate-300" />
                                    <BreadcrumbItem>
                                        <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider">Google Ads</span>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            
                            <div className="flex items-center gap-5">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                    <div className="relative p-3.5 bg-gradient-to-br from-[#4285F4] to-blue-700 rounded-2xl shadow-xl shadow-blue-900/10 ring-1 ring-white/20">
                                        <SiGoogleads className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Google Ads</h1>
                                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">{summaryData?.accountName || "Campaign performance"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-[280px]">
                                {clients && clients.length > 0 && (
                                    <Select
                                        value={selectedClientId?.toString() ?? ""}
                                        onValueChange={handleClientChange}
                                    >
                                        <SelectTrigger className="h-10 bg-white border-slate-200 shadow-sm rounded-xl transition-all focus:ring-slate-200 font-medium text-slate-700">
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()} className="font-medium cursor-pointer rounded-lg m-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-zinc-800" />
                                                        {c.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Disconnect */}
                            {isConnected && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="h-10 rounded-xl px-4 shadow-sm text-xs font-bold uppercase tracking-wider">
                                            Disconnect
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-[32px] p-10">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl font-black uppercase text-zinc-950 tracking-tighter">Disconnect Google Ads?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-zinc-500 text-sm font-medium leading-relaxed">
                                                This will remove the Google Ads integration for this client. Live metrics will stop updating immediately.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-8 gap-3">
                                            <AlertDialogCancel className="rounded-xl font-bold uppercase text-[10px] tracking-widest border-zinc-100">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDisconnect}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-6"
                                                disabled={isDisconnecting}
                                            >
                                                {isDisconnecting ? "Processing…" : "Confirm Termination"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    <div className="w-full px-8 py-4 space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
                            <MetricCard
                                label="Total Spend"
                                value={fmt(summary?.spend, "currency")}
                                icon={<DollarSign className="h-4 w-4" />}
                                isLoading={isLoadingSummary}
                                color="blue"
                            />
                            <MetricCard
                                label="Impressions"
                                value={fmt(summary?.impressions)}
                                icon={<Eye className="h-4 w-4" />}
                                isLoading={isLoadingSummary}
                                color="violet"
                            />
                            <MetricCard
                                label="Clicks"
                                value={fmt(summary?.clicks)}
                                icon={<MousePointerClick className="h-4 w-4" />}
                                isLoading={isLoadingSummary}
                                color="emerald"
                            />
                            <MetricCard
                                label="CTR"
                                value={fmt(summary?.ctr, "percent")}
                                icon={<Percent className="h-4 w-4" />}
                                isLoading={isLoadingSummary}
                                color="orange"
                            />
                            <MetricCard
                                label="Avg. CPC"
                                value={fmt(summary?.cpc, "currency")}
                                icon={<TrendingUp className="h-4 w-4" />}
                                isLoading={isLoadingSummary}
                                color="rose"
                            />
                            <MetricCard
                                label="ROAS"
                                value={summary?.roas !== undefined ? `${summary.roas.toFixed(2)}x` : "—"}
                                icon={<BarChart3 className="h-4 w-4" />}
                                isLoading={isLoadingSummary}
                                color="zinc"
                            />
                        </div>

                        {/* Campaign Table container */}
                        <div className="bg-white border border-zinc-100 rounded-[32px] p-8 transition-all hover:border-zinc-200 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-3 uppercase">
                                        <TrendingUp className="h-6 w-6 text-blue-500" />
                                        Campaign Performance
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Live Ad Engagement analysis</p>
                                </div>
                                <div className="relative group min-w-[320px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-blue-500 transition-colors duration-300" />
                                    <input
                                        type="text"
                                        placeholder="Filter by campaign name…"
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        className="h-12 w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-11 pr-4 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-zinc-400 transition-all group-hover:bg-white group-hover:border-zinc-200"
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-b border-zinc-50/50">
                                            <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">Campaign</TableHead>
                                            <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">Status</TableHead>
                                            <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">Spend</TableHead>
                                            <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">Impressions</TableHead>
                                            <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">Clicks</TableHead>
                                            <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">CTR</TableHead>
                                            <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">CPC</TableHead>
                                            <TableHead className="text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-0 py-4">ROAS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingCampaigns ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i} className="border-b border-zinc-50/50">
                                                    {Array.from({ length: 8 }).map((__, j) => (
                                                        <TableCell key={j} className="py-6 px-0"><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : filteredCampaigns.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-20">
                                                    <div className="flex flex-col items-center justify-center opacity-40">
                                                        <Search className="h-10 w-10 mb-4" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">{searchFilter ? "No matches found" : "Campaign Data Pending"}</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredCampaigns.map((campaign) => (
                                                <TableRow key={campaign.id} className="group border-b border-zinc-50/50 hover:bg-zinc-50/50 transition-colors">
                                                    <TableCell className="py-5 px-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-zinc-900 leading-none truncate max-w-[200px]" title={campaign.name}>
                                                                {campaign.name}
                                                            </span>
                                                            <ChevronRight className="h-3 w-3 text-zinc-300 group-hover:text-blue-500 transition-colors duration-300" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-5 px-0">{statusBadge(campaign.status)}</TableCell>
                                                    <TableCell className="text-right py-5 px-0 font-bold text-sm text-zinc-900">{fmt(campaign.cost, "currency")}</TableCell>
                                                    <TableCell className="text-right py-5 px-0 text-sm text-zinc-500 font-medium">{fmt(campaign.impressions)}</TableCell>
                                                    <TableCell className="text-right py-5 px-0 text-sm text-zinc-500 font-medium">{fmt(campaign.clicks)}</TableCell>
                                                    <TableCell className="text-right py-5 px-0">
                                                        <span className="inline-flex py-1 px-2.5 bg-blue-50 rounded-lg text-xs font-black text-blue-600 ring-1 ring-blue-100">
                                                            {fmt(campaign.ctr, "percent")}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right py-5 px-0 text-sm text-zinc-500 font-medium">{fmt(campaign.cpc, "currency")}</TableCell>
                                                    <TableCell className="text-right py-5 px-0 font-black text-sm text-zinc-900">
                                                        {campaign.roas !== undefined ? `${campaign.roas.toFixed(2)}x` : "—"}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
}
