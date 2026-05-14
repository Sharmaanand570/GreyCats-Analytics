
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTwitterSummary, useTwitterAudienceHistory, useTwitterProfile } from "@/features/twitter/hooks/useTwitter";
import { useClient } from "@/hooks/useClients";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, MessageCircle, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TwitterDetailPage = () => {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const parsedClientId = clientId ? parseInt(clientId) : undefined;

    const { 
        data: summaryData, 
        isLoading: isLoadingSummary, 
        error: summaryError 
    } = useTwitterSummary(parsedClientId);

    const {
        data: historyData,
        isLoading: isLoadingHistory,
        error: historyError,
    } = useTwitterAudienceHistory(parsedClientId, 90);
    const { data: clientData } = useClient(parsedClientId || null);
    const accountId = clientData?.integrations?.find(i => i.integrationType === 'twitter')?.accountId;

    const parsedAccountId = typeof accountId === 'number' ? accountId : accountId ? parseInt(accountId as string) || undefined : undefined;
    const {
        data: profileResponse,
        isLoading: isLoadingProfile,
    } = useTwitterProfile(parsedAccountId);

    const account = profileResponse?.profile || summaryData?.account;
    const summary = summaryData?.summary;

    const formatNumber = (num?: number) => {
        if (num === undefined) return "—";
        return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] shadow-sm flex flex-col">
                {/* Header */}
                <div className="w-full border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-6 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-sky-50 rounded-lg border border-sky-100">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 text-black fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.918H5.078z"></path></g></svg>
                        </div>
                        <div>
                            <h1 className="font-semibold text-xl text-zinc-900 leading-none">
                                Twitter (X) Analytics
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Explore Twitter profile growth and engagement metrics
                            </p>
                        </div>
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="w-full px-6 py-3 border-b bg-zinc-50/40">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                                    Data Sources
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium text-foreground">Twitter (X)</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        
                        {/* Profile & Top Stats */}
                        {isLoadingSummary || isLoadingProfile ? (
                            <div className="grid gap-6 md:grid-cols-4">
                                <Skeleton className="h-32 col-span-1" />
                                <Skeleton className="h-32 col-span-3" />
                            </div>
                        ) : summaryError ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm flex gap-3 items-center">
                                <Users className="w-5 h-5 text-red-500" />
                                {(summaryError as Error).message || "Failed to load Twitter summary. Ensure the account is connected."}
                            </div>
                        ) : !account ? (
                            <div className="p-6 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-md text-center text-sm">
                                No Twitter account data found. Please connect an account.
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                                {/* Profile Card */}
                                <Card className="border shadow-sm">
                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        <Avatar className="h-20 w-20 border-2 border-zinc-100 mb-4 shadow-sm">
                                            <AvatarImage src={account.profileImageUrl} />
                                            <AvatarFallback>{account.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <h2 className="text-xl font-bold text-zinc-900">{account.name}</h2>
                                        <p className="text-zinc-500 font-medium">@{account.username}</p>
                                        
                                        <div className="flex gap-4 mt-6 w-full pt-4 border-t border-zinc-100">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-zinc-900">{formatNumber(account.followingCount)}</p>
                                                <p className="text-xs text-zinc-500">Following</p>
                                            </div>
                                            <div className="flex-1 border-l border-zinc-100">
                                                <p className="text-sm font-semibold text-zinc-900">{formatNumber(account.tweetCount)}</p>
                                                <p className="text-xs text-zinc-500">Tweets</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top Metrics Card */}
                                <Card className="border shadow-sm flex flex-col justify-center">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Performance Summary</CardTitle>
                                        <CardDescription>Last 30 Days Overview</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-zinc-500 font-medium mb-1">Total Followers</p>
                                                <h3 className="text-3xl font-bold text-zinc-900">{formatNumber(summary?.totalFollowers)}</h3>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="p-2 bg-sky-100 text-sky-600 rounded-full mb-2">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                {summary?.followersGained !== undefined && (
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${summary.followersGained >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                        {summary.followersGained >= 0 ? '+' : ''}{summary.followersGained}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-zinc-50 border rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-zinc-500 font-medium mb-1">Tweets Published</p>
                                                <h3 className="text-3xl font-bold text-zinc-900">{formatNumber(summary?.tweetsPublishedLast30Days)}</h3>
                                            </div>
                                            <div className="p-2 bg-sky-100 text-sky-600 rounded-full">
                                                <MessageCircle className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Audience Growth Chart */}
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-zinc-500" />
                                    Audience Growth History
                                </CardTitle>
                                <CardDescription>Followers over the last 90 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingHistory ? (
                                    <Skeleton className="w-full h-[350px]" />
                                ) : historyError ? (
                                    <div className="w-full h-[350px] flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                                        {(historyError as Error).message || "Failed to load history data."}
                                    </div>
                                ) : !historyData?.history || historyData.history.length === 0 ? (
                                    <div className="w-full h-[350px] flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg text-zinc-500 text-sm">
                                        No historical data available yet.
                                    </div>
                                ) : (
                                    <div className="w-full h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={historyData.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tickMargin={10}
                                                    tick={{ fontSize: 12, fill: "#71717A" }}
                                                    tickFormatter={formatDate}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    tick={{ fontSize: 12, fill: "#71717A" }}
                                                    tickFormatter={formatNumber}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    labelFormatter={formatDate}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="followers" 
                                                    name="Followers"
                                                    stroke="#0ea5e9" 
                                                    strokeWidth={3}
                                                    dot={false}
                                                    activeDot={{ r: 6, fill: "#0ea5e9" }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwitterDetailPage;
