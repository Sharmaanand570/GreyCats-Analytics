import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SiGoogleads } from "react-icons/si";
import { TrendingUp, MousePointerClick, Eye, Percent, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useClients } from "@/hooks/useClients";
import ConnectDataSource from "@/components/ConnectDataSource";
import { toast } from "sonner";
import type { GoogleAdsCampaign } from "@/features/googleAds/API/googleAdsApi";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number | undefined, type: "currency" | "percent" | "number" = "number"): string {
    if (value === undefined || value === null) return "—";
    if (type === "currency") return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (type === "percent") return `${(value * 100).toFixed(2)}%`;
    return value.toLocaleString("en-US");
}

function statusBadge(status: string) {
    const lcStatus = status?.toLowerCase() ?? "";
    const map: Record<string, string> = {
        enabled: "bg-green-100 text-green-700",
        paused: "bg-yellow-100 text-yellow-700",
        removed: "bg-red-100 text-red-700",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[lcStatus] ?? "bg-gray-100 text-gray-600"}`}>
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

function MetricCard({ label, value, icon, isLoading }: MetricCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <span className="text-muted-foreground">{icon}</span>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                    <p className="text-2xl font-bold">{value}</p>
                )}
            </CardContent>
        </Card>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GoogleAdsDetailPage() {
    const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
    const navigate = useNavigate();

    const selectedClientId = clientIdParam ? Number(clientIdParam) : null;

    const { data: clients } = useClients();

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
    if (selectedClientId && !isLoadingSummary && !isConnected) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh] px-4">
                <SiGoogleads className="h-14 w-14 text-[#4285F4]" />
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-semibold">Connect Google Ads</h2>
                    <p className="text-muted-foreground text-sm max-w-md">
                        Link your Google Ads account to track spend, impressions, clicks, CTR, CPC, and campaign performance.
                    </p>
                </div>
                <ConnectDataSource clientId={selectedClientId ?? undefined}>
                    <Button size="lg" className="rounded-[0.4rem]">Connect Google Ads</Button>
                </ConnectDataSource>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* --- 1. Top Navigation Bar --- */}
            <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm rounded-t-[32px] mb-6">
                <div className="flex flex-col gap-2 relative">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 hover:text-slate-800 transition-colors font-medium">Data Sources</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-slate-300" />
                            <BreadcrumbItem>
                                <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-sm tracking-wide">Google Ads</span>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-zinc-800 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                            <div className="relative p-3.5 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl shadow-xl shadow-zinc-900/10 ring-1 ring-white/20">
                                <SiGoogleads className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Google Ads</h1>
                            <p className="text-sm text-slate-500 mt-1 font-medium">{summaryData?.accountName || "Campaign performance"}</p>
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
                                        <SelectItem key={c.id} value={c.id.toString()}>
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
                                <Button variant="destructive" className="h-10 rounded-xl px-4 shadow-sm">
                                    Disconnect
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Disconnect Google Ads?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove the Google Ads integration for this client. All existing report data will remain, but live metrics will stop updating.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDisconnect}
                                        className="bg-destructive hover:bg-destructive/90"
                                        disabled={isDisconnecting}
                                    >
                                        {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricCard
                    label="Total Spend"
                    value={fmt(summary?.spend, "currency")}
                    icon={<DollarSign className="h-4 w-4" />}
                    isLoading={isLoadingSummary}
                />
                <MetricCard
                    label="Impressions"
                    value={fmt(summary?.impressions)}
                    icon={<Eye className="h-4 w-4" />}
                    isLoading={isLoadingSummary}
                />
                <MetricCard
                    label="Clicks"
                    value={fmt(summary?.clicks)}
                    icon={<MousePointerClick className="h-4 w-4" />}
                    isLoading={isLoadingSummary}
                />
                <MetricCard
                    label="CTR"
                    value={fmt(summary?.ctr, "percent")}
                    icon={<Percent className="h-4 w-4" />}
                    isLoading={isLoadingSummary}
                />
                <MetricCard
                    label="Avg. CPC"
                    value={fmt(summary?.cpc, "currency")}
                    icon={<TrendingUp className="h-4 w-4" />}
                    isLoading={isLoadingSummary}
                />
                <MetricCard
                    label="ROAS"
                    value={summary?.roas !== undefined ? `${summary.roas.toFixed(2)}x` : "—"}
                    icon={<BarChart3 className="h-4 w-4" />}
                    isLoading={isLoadingSummary}
                />
            </div>

            {/* Campaign Table */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-base font-semibold">Campaign Performance</CardTitle>
                        <input
                            type="text"
                            placeholder="Search campaigns…"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="text-sm border rounded-md px-3 py-1.5 w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[180px]">Campaign</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Spend</TableHead>
                                    <TableHead className="text-right">Impressions</TableHead>
                                    <TableHead className="text-right">Clicks</TableHead>
                                    <TableHead className="text-right">CTR</TableHead>
                                    <TableHead className="text-right">CPC</TableHead>
                                    <TableHead className="text-right">Conv. Rate</TableHead>
                                    <TableHead className="text-right">ROAS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingCampaigns ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 9 }).map((__, j) => (
                                                <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredCampaigns.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                                            {searchFilter ? "No campaigns match your search." : "No campaign data available."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCampaigns.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell className="font-medium text-sm">{campaign.name}</TableCell>
                                            <TableCell>{statusBadge(campaign.status)}</TableCell>
                                            <TableCell className="text-right text-sm">{fmt(campaign.cost, "currency")}</TableCell>
                                            <TableCell className="text-right text-sm">{fmt(campaign.impressions)}</TableCell>
                                            <TableCell className="text-right text-sm">{fmt(campaign.clicks)}</TableCell>
                                            <TableCell className="text-right text-sm">{fmt(campaign.ctr, "percent")}</TableCell>
                                            <TableCell className="text-right text-sm">{fmt(campaign.cpc, "currency")}</TableCell>
                                            <TableCell className="text-right text-sm">{fmt(campaign.conversionRate, "percent")}</TableCell>
                                            <TableCell className="text-right text-sm font-medium">
                                                {campaign.roas !== undefined ? `${campaign.roas.toFixed(2)}x` : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
