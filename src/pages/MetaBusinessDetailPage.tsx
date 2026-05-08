// @ts-nocheck
import { useNavigate, useParams } from "react-router-dom";

import { useState, useEffect, useMemo } from "react";
import {
    SiFacebook,
    SiInstagram,
    SiMeta
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Loader2,
    RefreshCw,
    AlertCircle,
    ExternalLink,
    MessageCircle,
    ThumbsUp,
    Video,
    Image as ImageIcon,
    BarChart3,
    LayoutGrid,
    TrendingUp,
    MousePointerClick,
    Smile,
    Eye,
    Heart,
    Share2,
    Play,
    Zap,
    Bookmark,
    Users,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

// API Hooks
import {
    useMetaBusinessSyncFacebook,
    useMetaBusinessSyncInstagram,
    useMetaBusinessSync,
    useInstagramProfile,
    useInstagramMedia,
    useInstagramMediaInsights,
    useFacebookPosts,
    useFacebookPostInsights,
} from "@/features/meta/hooks/useMetaBusinessData";
import { useFacebookPageInfo } from "@/features/meta/hooks/useFacebookPageInfo";
import { useClients, useClient } from "@/hooks/useClients";
import { PlatformNotConnected } from "@/components/PlatformNotConnected";
import { CommentsManager } from "@/features/meta/components/CommentsManager";

/**
 * Meta Business Detail Page
 * 
 * Top-notch UI/UX Redesign
 * Features:
 * - Client-specific data filtering
 * - Premium visual aesthetic (Clean, White/Slate theme)
 * - Interactive elements & smooth transitions
 * - Unified Facebook & Instagram management
 */
function MetaBusinessDetailPage() {
    const navigate = useNavigate();
    const { clientId } = useParams();
    const [activeTab, setActiveTab] = useState("facebook");
    const [selectedClientId, setSelectedClientId] = useState<number | null>(clientId ? Number(clientId) : null);

    // Auto-select client if passed in URL
    useEffect(() => {
        if (clientId) {
            setSelectedClientId(Number(clientId));
        }
    }, [clientId]);

    // Facebook State
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [syncingPageId, setSyncingPageId] = useState<string | null>(null);
    const [syncError, setSyncError] = useState<{ accountId: string; message: string } | null>(null);

    // Instagram State
    const [selectedIgMediaId, setSelectedIgMediaId] = useState<string | null>(null);

    // 1. Fetch Client Data
    const { data: clients } = useClients();

    // 2. Fetch Selected Client Details
    const { data: clientData } = useClient(selectedClientId);

    // DEBUG: Check data structure
    useEffect(() => {
        if (clientData?.metaBusinessAccounts) {
            console.log("DEBUG - rawAccounts:", clientData.metaBusinessAccounts);
            clientData.metaBusinessAccounts.forEach((acc: any, i: number) => {
                console.log(`DEBUG - Account ${i}:`, acc);
                console.log(`DEBUG - Account ${i} metaAccount:`, acc.metaAccount);
            });
        }
    }, [clientData]);

    // 3. Sync Hooks
    useMetaBusinessSyncFacebook();
    useMetaBusinessSyncInstagram();
    const { mutateAsync: syncBoth, isPending: isSyncingBoth } = useMetaBusinessSync();

    // Check if client has Meta Business integration
    const hasMetaBusinessIntegration = !!clientData?.integrations?.some(
        (i: any) => i.integrationType === "meta-business" || i.integrationType === "meta_facebook" || i.integrationType === "meta_instagram"
    ) || (clientData?.metaBusinessAccounts && clientData.metaBusinessAccounts.length > 0);

    // 4. Data Processing
    const rawAccounts = clientData?.metaBusinessAccounts ?? [];

    // Map raw accounts to usable Page objects
    // Using acc.metaAccountId (from join table) as the primary ID for sync operations
    const pages = useMemo(() => rawAccounts.map((acc: any) => ({
        id: acc.metaAccount?.pageId, // The Facebook Page ID (string)
        name: acc.metaAccount?.pageName || "Unknown Page",
        // Use instagramBusinessId if available, otherwise use instagramUsername as identifier
        // The backend returns instagramUsername but not instagramBusinessId for some accounts
        instagram_business_account: acc.metaAccount?.instagramBusinessId || acc.metaAccount?.instagramUsername,
        instagram_username: acc.metaAccount?.instagramUsername,
        // CRITICAL FIX: Use the correct account ID for sync endpoints. 
        // Trying metaAccountId first, falling back to id.
        accountId: acc.metaAccountId ?? acc.id,
    })), [rawAccounts]);

    // Auto-select the first page if none is selected OR if the selected page is no longer in the pages list
    useEffect(() => {
        if (pages.length > 0) {
            const currentIsFound = pages.some(p => p.id === selectedPageId);
            if (!selectedPageId || !currentIsFound) {
                setSelectedPageId(pages[0].id);
            }
        } else if (selectedPageId !== null) {
            setSelectedPageId(null);
        }
    }, [pages, selectedPageId]);

    // Get the selected account and its ID for API calls
    const selectedAccount = pages.find(p => p.id === selectedPageId);
    const accountId = selectedAccount?.accountId; // This is the metaAccountId (e.g., 7)
    const pageId = selectedAccount?.id; // This is the Facebook Page ID

    // Facebook Page Info (from Meta Insights API - basic info only)
    const { data: pageInfoData } = useFacebookPageInfo(accountId);

    // Facebook Data Hooks - use accountId not pageId
    const { data: postsData, isLoading: isLoadingPosts } = useFacebookPosts(accountId);

    // Facebook Post Insights - fetch insights for selected post
    const { data: postInsightsData, isLoading: isLoadingPostInsights, error: postInsightsError } = useFacebookPostInsights(selectedPostId || undefined);

    useEffect(() => {
        console.log("DEBUG_POST_INSIGHTS:", {
            selectedPostId,
            isLoadingPostInsights,
            postInsightsData,
            postInsightsError,
        });
    }, [selectedPostId, isLoadingPostInsights, postInsightsData, postInsightsError]);

    // Instagram Data Hooks
    // Use the metaAccountId (e.g., 7) for Instagram API calls
    const { data: igProfileData } = useInstagramProfile(accountId);
    const { data: igMediaData, isLoading: isLoadingIgMedia } = useInstagramMedia(accountId);
    const { data: igInsightsData, isLoading: isLoadingIgInsights, error: igInsightsError } = useInstagramMediaInsights(accountId, selectedIgMediaId || undefined);

    // New Unified Meta Insights Hooks (REMOVED - endpoints no longer exist)
    // Using mock/empty data to prevent breaking the page
    // const metaInsightsSummary: { success: boolean; data?: any } | null = null;
    // const isLoadingSummary = false;
    // const insightsSummaryError: { message?: string } | null = null;
    // const metaInsightsPosts = null;
    // const isLoadingMetaPosts = false;
    // const metaInsightsTrends = null;


    // Derived Data
    const posts = postsData?.data ?? [];
    const igMedia = igMediaData?.data ?? [];
    const igInsights = igInsightsData?.data?.data ?? [];

    // --- Handlers ---



    const handleSyncBoth = async (accountId: number) => {
        try {
            setSyncingPageId(accountId.toString());
            setSyncError(null); // Clear previous errors
            await syncBoth({ accountId });
        } catch (error: any) {
            console.error(error);
            // Display user-friendly error message
            const errorMessage = error?.userMessage || error?.message || "Failed to sync data. Please try again.";
            setSyncError({ accountId: accountId.toString(), message: errorMessage });
        } finally {
            setSyncingPageId(null);
        }
    };



    // --- Render ---

    return (
        <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <div className="w-full h-full flex flex-col px-8 py-4 space-y-8">

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
                                    <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider">Meta Business</span>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                <div className="relative p-3.5 bg-gradient-to-br from-[#0866FF] to-blue-700 rounded-2xl shadow-xl shadow-blue-900/10 ring-1 ring-white/20 flex items-center justify-center">
                                    <SiMeta className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meta Business Suite</h1>
                                <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Facebook & Instagram Insights</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <DataSyncBanner compact={true} />
                        <div className="w-full sm:w-[280px]">
                            <Select value={selectedClientId?.toString() || ""} onValueChange={(v) => setSelectedClientId(Number(v))}>
                                <SelectTrigger className="h-10 bg-white border-slate-200 shadow-sm rounded-xl transition-all focus:ring-slate-200 font-medium text-slate-700">
                                    <SelectValue placeholder="Select Client Account" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border shadow-lg">
                                    {clients?.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()} className="font-medium cursor-pointer rounded-lg m-1 hover:bg-muted focus:bg-muted">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                                                {client.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Sync Error Alert */}
                {syncError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-900 mb-1">Sync Failed</h3>
                            <p className="text-sm text-red-700">{syncError.message}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const accountId = parseInt(syncError.accountId);
                                handleSyncBoth(accountId);
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                            <RefreshCw className="w-4 h-4 mr-1.5" />
                            Retry
                        </Button>
                    </div>
                )}

                {/* --- 2. Accounts Overview Grid --- */}
                {selectedClientId && clientData && !hasMetaBusinessIntegration ? (
                    <PlatformNotConnected
                        platformName="Meta Business (Facebook & Instagram)"
                        icon={<SiMeta className="h-10 w-10 text-blue-500" />}
                        clientName={clientData.name}
                    />
                ) : selectedClientId ? (
                    <div className="space-y-6">
                        {pages.length === 0 ? (
                            <PlatformNotConnected
                                platformName="Meta Business (Facebook & Instagram)"
                                icon={<SiMeta className="h-10 w-10 text-blue-500" />}
                                clientName={clientData?.name}
                            />
                        ) : (
                            <div className="flex flex-col gap-4">
                                {pages.flatMap((page, index) => {
                                    const cards = [];
                                    
                                    // Always add Facebook Page card
                                    cards.push(
                                        <div
                                            key={`fb-${page.id}`}
                                            onClick={() => {
                                                setSelectedPageId(page.id);
                                                setSelectedPostId(null);
                                                setActiveTab("facebook");
                                            }}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                            className={cn(
                                                "group cursor-pointer transition-all duration-500 border rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5",
                                                selectedPageId === page.id && activeTab === "facebook"
                                                    ? "border-zinc-300 bg-white ring-1 ring-zinc-100"
                                                    : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 bg-white/50 opacity-90 hover:opacity-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                <Avatar className="h-12 w-12 border border-zinc-100 rounded-xl bg-blue-50/50">
                                                    <AvatarFallback className="bg-transparent text-blue-600 font-semibold text-sm rounded-xl">
                                                        <SiFacebook className="w-5 h-5" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-base text-foreground tracking-tight" title={page.name}>
                                                        {page.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                            <SiFacebook className="w-3.5 h-3.5 text-blue-600/80 saturate-50" />
                                                            <span className="hidden sm:inline">Facebook Page</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 px-4 font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSyncBoth(page.accountId);
                                                    }}
                                                    disabled={isSyncingBoth && syncingPageId === page.accountId.toString()}
                                                >
                                                    {isSyncingBoth && syncingPageId === page.accountId.toString() ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-4 h-4 mr-2 opacity-70" />
                                                    )}
                                                    Sync Data
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-9 px-4 font-medium transition-colors"
                                                >
                                                    {selectedPageId === page.id && activeTab === "facebook" ? (
                                                        <>Active View</>
                                                    ) : (
                                                        <>
                                                            <LayoutGrid className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );

                                    // Add Instagram Business card if linked
                                    if (page.instagram_business_account) {
                                        cards.push(
                                            <div
                                                key={`ig-${page.id}`}
                                                onClick={() => {
                                                    setSelectedPageId(page.id);
                                                    setSelectedPostId(null);
                                                    setActiveTab("instagram");
                                                }}
                                                style={{ animationDelay: `${(index * 100) + 50}ms` }}
                                                className={cn(
                                                    "group cursor-pointer transition-all duration-500 border rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5",
                                                    selectedPageId === page.id && activeTab === "instagram"
                                                        ? "border-zinc-300 bg-white ring-1 ring-zinc-100"
                                                        : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 bg-white/50 opacity-90 hover:opacity-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                    <Avatar className="h-12 w-12 border border-zinc-100 rounded-xl bg-pink-50/50">
                                                        <AvatarFallback className="bg-transparent text-pink-600 font-semibold text-sm rounded-xl">
                                                            <SiInstagram className="w-5 h-5" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold text-base text-foreground tracking-tight" title={page.instagram_business_account}>
                                                            @{page.instagram_business_account}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                                <SiInstagram className="w-3.5 h-3.5 text-pink-600/80 saturate-50" />
                                                                <span className="hidden sm:inline">Instagram Business</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-4 font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSyncBoth(page.accountId);
                                                        }}
                                                        disabled={isSyncingBoth && syncingPageId === page.accountId.toString()}
                                                    >
                                                        {isSyncingBoth && syncingPageId === page.accountId.toString() ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <RefreshCw className="w-4 h-4 mr-2 opacity-70" />
                                                        )}
                                                        Sync Data
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-9 px-4 font-medium transition-colors"
                                                    >
                                                        {selectedPageId === page.id && activeTab === "instagram" ? (
                                                            <>Active View</>
                                                        ) : (
                                                            <>
                                                                <LayoutGrid className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return cards;
                                })}
                            </div>
                        )}


                        {/* Meta Insights Summary Overview - COMMENTED OUT (endpoints removed) */}
                        {/* {selectedClientId && insightsSummaryError && (
                            <Card className="border-amber-200 bg-amber-50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-full bg-amber-100">
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-amber-900 mb-1">Unable to Load Insights</h4>
                                            <p className="text-sm text-amber-700">
                                                {insightsSummaryError.message || "Failed to load Meta Insights summary. Please try again or check your Meta Business connection."}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )} */}

                        {/* {selectedClientId && metaInsightsSummary?.success && (
                            ... insights summary cards ...
                        )} */}

                        {/* --- 3. Main Data Area --- */}
                        {selectedPageId && (
                            <div className="space-y-8">

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <TabsList className="bg-muted/30 border border-border/40 p-1.5 shadow-none h-12 rounded-xl">
                                            <TabsTrigger
                                                value="facebook"
                                                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-8 h-9 rounded-[10px] transition-all"
                                            >
                                                <SiFacebook className="w-4 h-4 mr-2 opacity-70" />
                                                Facebook
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="instagram"
                                                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-8 h-9 rounded-[10px] transition-all"
                                                disabled={!pages.find(p => p.id === selectedPageId)?.instagram_business_account}
                                            >
                                                <SiInstagram className="w-4 h-4 mr-2 opacity-70" />
                                                Instagram
                                            </TabsTrigger>
                                        </TabsList>
                                        
                                        <div className="hidden md:flex items-center gap-3">
                                            {/* Compact Followers (Tab Aware) */}
                                            {((activeTab === 'facebook' && 
                                                pageInfoData?.page?.fan_count !== undefined) || 
                                                (activeTab === 'instagram' && 
                                                igProfileData?.data?.followers_count !== undefined)) && (
                                                <div className="flex items-center gap-2 px-3 h-12 rounded-xl bg-muted/20 border border-border/40 text-muted-foreground whitespace-nowrap group hover:bg-muted/30 transition-colors">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        {activeTab === 'facebook' 
                                                            ? pageInfoData?.page?.fan_count?.toLocaleString() 
                                                            : igProfileData?.data?.followers_count?.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-0.5">Followers</span>
                                                </div>
                                            )}

                                            {/* Compact Category */}
                                            {pageInfoData?.page?.category_list?.[0] && (
                                                <div className="flex items-center gap-2 px-3 h-12 rounded-xl bg-muted/20 border border-border/40 text-muted-foreground whitespace-nowrap">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold text-foreground">{pageInfoData?.page?.category_list?.[0]?.name}</span>
                                                </div>
                                            )}

                                            {/* Actively Analyzing / Page Name */}
                                            <div className="flex items-center gap-3 px-4 h-12 rounded-xl bg-foreground/5 border border-foreground/10 transition-all">
                                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Live</span>
                                                <div className="w-px h-4 bg-foreground/10" />
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                    <span className="text-xs font-bold text-foreground tracking-tight">{pages.find(p => p.id === selectedPageId)?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <TabsContent value="facebook" className="mt-0">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                                            {/* FB Posts List */}
                                            <Card className="lg:col-span-4 flex flex-col h-full border-border/60 shadow-sm overflow-hidden bg-card rounded-2xl">
                                                <CardHeader className="bg-card border-b border-border/40 py-5 px-6">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-base font-bold text-foreground font-satoshi tracking-tight">Recent Posts</CardTitle>
                                                        <Badge variant="outline" className="bg-muted/30 border-border/60 text-foreground font-semibold px-2.5 rounded-md">{posts.length}</Badge>
                                                    </div>
                                                </CardHeader>
                                                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                                                    {isLoadingPosts ? (
                                                        <div className="p-4 grid grid-cols-3 gap-1">
                                                            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-square w-full" />)}
                                                        </div>
                                                    ) : posts.length === 0 ? (
                                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                                                            <MessageCircle className="w-10 h-10 mb-2 opacity-20" />
                                                            <p className="text-sm">No posts found</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-3 gap-1 p-1">
                                                            {posts.map((post) => (
                                                                <div
                                                                    key={post.id}
                                                                    onClick={() => setSelectedPostId(post.id)}
                                                                    className={cn(
                                                                        "aspect-square relative cursor-pointer group overflow-hidden rounded-xl border border-border/30",
                                                                        selectedPostId === post.id ? "ring-2 ring-foreground z-10 border-transparent shadow-sm" : "hover:border-foreground/30 hover:shadow-sm transition-all"
                                                                    )}
                                                                >
                                                                    {post.attachments?.data?.[0]?.media?.image?.src ? (
                                                                        <img src={post.attachments.data[0].media.image.src} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 ease-out" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                                                            <SiFacebook className="text-muted-foreground/30 w-8 h-8" />
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                        <div className="absolute bottom-2 left-2 flex items-center gap-2 text-white/90 text-xs font-medium drop-shadow-md">
                                                                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes?.summary?.total_count || 0}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>

                                            {/* FB Insights Detail */}
                                            <div className="lg:col-span-8 flex flex-col h-full space-y-6 overflow-y-auto pr-1">
                                                {selectedPostId ? (() => {
                                                    const selectedPost = posts.find(p => p.id === selectedPostId);
                                                    if (!selectedPost) return null;

                                                    const previewUrl = selectedPost.attachments?.data?.[0]?.media?.image?.src || selectedPost.full_picture;

                                                    return (
                                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                                {/* Left: Media Preview */}
                                                                <div className="md:col-span-5">
                                                                    <Card className="border-border/60 overflow-hidden shadow-sm bg-card rounded-2xl flex flex-col h-full">
                                                                        <div className="aspect-square bg-muted/20 flex items-center justify-center relative group">
                                                                            {previewUrl ? (
                                                                                <img
                                                                                    src={previewUrl}
                                                                                    alt="Post Preview"
                                                                                    className="max-h-full max-w-full object-contain"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                                                                    <ImageIcon className="w-12 h-12" />
                                                                                    <span className="text-xs font-medium">No Preview Available</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <CardContent className="p-5 bg-card flex-1 flex flex-col">
                                                                            <p className="text-sm text-foreground line-clamp-4 leading-relaxed flex-1 italic">
                                                                                {selectedPost.message || "No text content"}
                                                                            </p>
                                                                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/40 text-sm font-medium text-muted-foreground">
                                                                                <span className="flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-foreground/80" /> {selectedPost.likes?.summary?.total_count || 0}</span>
                                                                                <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-foreground/80" /> {selectedPost.comments?.summary?.total_count || 0}</span>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>

                                                                {/* Right: Insights */}
                                                                <div className="md:col-span-7 space-y-6">
                                                                    <Card className="border-border/60 shadow-sm bg-card rounded-2xl h-full flex flex-col">
                                                                        <CardHeader className="border-b border-border/40 py-5 px-6">
                                                                            <div className="flex items-center justify-between">
                                                                                <CardTitle className="text-sm font-bold text-foreground font-satoshi tracking-tight flex items-center gap-2">
                                                                                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                                                                    Performance Analytics
                                                                                </CardTitle>
                                                                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-full">
                                                                                    Facebook
                                                                                </span>
                                                                            </div>
                                                                        </CardHeader>
                                                                        <CardContent className="p-6 space-y-6 flex-1">
                                                                            {(() => {
                                                                                return (
                                                                                    <div className="space-y-6">
                                                                                        {/* Engagement Breakdown from post data */}
                                                                                        <div className="p-5 rounded-2xl border border-border/40 bg-card/50 space-y-4">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Engagement Breakdown</span>
                                                                                                <div className="h-px bg-border/40 flex-1 ml-4" />
                                                                                            </div>
                                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                                <div className="flex justify-between items-center px-2 py-1">
                                                                                                    <span className="text-xs text-muted-foreground flex items-center gap-2"><ThumbsUp className="w-3 h-3" /> Likes</span>
                                                                                                    <span className="text-sm font-bold">{selectedPost.likes?.summary?.total_count || 0}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between items-center px-2 py-1 border-l border-border/40">
                                                                                                    <span className="text-xs text-muted-foreground flex items-center gap-2"><MessageCircle className="w-3 h-3" /> Comments</span>
                                                                                                    <span className="text-sm font-bold">{selectedPost.comments?.summary?.total_count || 0}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between items-center px-2 py-1">
                                                                                                    <span className="text-xs text-muted-foreground flex items-center gap-2"><Share2 className="w-3 h-3" /> Shares</span>
                                                                                                    <span className="text-sm font-bold">{selectedPost.shares?.count || 0}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })()}

                                                                            <div className="pt-6 border-t border-border/40 mt-auto">
                                                                                <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold h-10 rounded-xl border-border/60 hover:bg-muted/10">
                                                                                    <a href={selectedPost.permalink_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                                                                        <SiFacebook className="w-3 h-3" />
                                                                                        View Official Post
                                                                                        <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                                                                                    </a>
                                                                                </Button>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })() : (
                                                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-2xl bg-card/50 text-muted-foreground">
                                                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 ring-1 ring-border/50">
                                                            <MousePointerClick className="w-8 h-8 text-muted-foreground/60" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Select a post</h3>
                                                        <p className="text-sm mt-1 max-w-xs text-center leading-relaxed">Click on a post from the grid to view detailed performance metrics</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* === INSTAGRAM TAB === */}
                                    <TabsContent value="instagram" className="mt-0">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                                            {/* IG Media List */}
                                            <Card className="lg:col-span-4 flex flex-col h-full border-slate-200 shadow-sm overflow-hidden">
                                                <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 ring-2 ring-background">
                                                                <AvatarImage src={igProfileData?.data?.profile_picture_url} />
                                                                <AvatarFallback className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white font-bold text-xs">IG</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground leading-none">{igProfileData?.data?.username || "Instagram"}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-1">{igProfileData?.data?.media_count || 0} Posts • {igProfileData?.data?.followers_count || 0} Followers</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <div className="flex-1 overflow-y-auto p-0">
                                                    {isLoadingIgMedia ? (
                                                        <div className="p-4 space-y-4">
                                                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                                                        </div>
                                                    ) : igMedia.length === 0 ? (
                                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                                            <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                                                            <p className="text-sm">No media found</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-3 gap-1 p-1">
                                                            {igMedia.map((item: any) => {
                                                                const previewUrl = item.media_type === "VIDEO"
                                                                    ? (item.thumbnail_url || item.media_url)
                                                                    : item.media_url;
                                                                return (
                                                                <div
                                                                    key={item.id}
                                                                    onClick={() => setSelectedIgMediaId(item.id)}
                                                                    className={cn(
                                                                        "aspect-square relative cursor-pointer group overflow-hidden rounded-xl border border-border/30",
                                                                        selectedIgMediaId === item.id ? "ring-2 ring-foreground z-10 border-transparent shadow-sm" : "hover:border-foreground/30 hover:shadow-sm transition-all"
                                                                    )}
                                                                >
                                                                    {previewUrl ? (
                                                                        <img src={previewUrl} alt="IG Media" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 ease-out" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                                                            <SiInstagram className="text-muted-foreground/30 w-8 h-8" />
                                                                        </div>
                                                                    )}
                                                                    {item.media_type === 'VIDEO' && (
                                                                        <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white backdrop-blur-md shadow-sm">
                                                                            <Video className="w-3.5 h-3.5" />
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                        <div className="absolute bottom-2 left-2 flex items-center gap-3 text-white/90 text-[10px] font-medium drop-shadow-md tracking-wider">
                                                                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {item.like_count || 0}</span>
                                                                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.comments_count || 0}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>

                                            {/* IG Insights Detail */}
                                            <div className="lg:col-span-8 flex flex-col h-full space-y-6 overflow-y-auto pr-1">
                                                {selectedIgMediaId ? (() => {
                                                    const selectedMedia = igMedia.find((m: any) => m.id === selectedIgMediaId);
                                                    if (!selectedMedia) return null;

                                                    return (
                                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                                {/* Media Preview */}
                                                                <div className="md:col-span-5">
                                                                    <Card className="border-border/60 overflow-hidden shadow-sm bg-card rounded-2xl flex flex-col h-full">
                                                                        <div className="aspect-square bg-muted/40 flex items-center justify-center relative group">
                                                                            {selectedMedia.media_type === 'VIDEO' ? (
                                                                                <div className="relative w-full h-full flex items-center justify-center">
                                                                                    <video
                                                                                        src={selectedMedia.media_url}
                                                                                        className="max-h-full max-w-full object-contain"
                                                                                        controls
                                                                                        playsInline
                                                                                        poster={selectedMedia.thumbnail_url}
                                                                                    />
                                                                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1.5 rounded-full ring-1 ring-white/20">
                                                                                        <Play className="w-3 h-3 text-white fill-white" />
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <img
                                                                                    src={selectedMedia.media_url}
                                                                                    alt="Instagram Content"
                                                                                    className="max-h-full max-w-full object-contain"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <CardContent className="p-5 bg-card flex-1 flex flex-col">
                                                                            <p className="text-sm text-foreground line-clamp-4 leading-relaxed flex-1 italic">
                                                                                {selectedMedia.caption || "No caption provided"}
                                                                            </p>
                                                                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/40 text-sm font-medium text-muted-foreground">
                                                                                <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500/80 fill-pink-500/10" /> {selectedMedia.like_count || 0}</span>
                                                                                <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-blue-500/80" /> {selectedMedia.comments_count || 0}</span>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>

                                                                {/* Insights */}
                                                                <div className="md:col-span-7 space-y-4">
                                                                    <Card className="border-border/60 bg-card rounded-2xl h-full shadow-sm flex flex-col">
                                                                        <CardHeader className="py-5 px-6 border-b border-border/40">
                                                                            <div className="flex items-center justify-between">
                                                                                <CardTitle className="text-sm font-bold text-foreground font-satoshi tracking-tight flex items-center gap-2">
                                                                                    <TrendingUp className="w-4 h-4 text-muted-foreground" /> Performance Analytics
                                                                                </CardTitle>
                                                                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-full">
                                                                                    Instagram
                                                                                </span>
                                                                            </div>
                                                                        </CardHeader>
                                                                        <CardContent className="p-6 space-y-6 flex-1">
                                                                            {(() => {
                                                                                return (
                                                                                    <div className="space-y-6">
                                                                                        {/* Engagement Breakdown */}
                                                                                        <div className="p-5 rounded-2xl border border-border/40 bg-card/50 space-y-4">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Breakdown</span>
                                                                                                <div className="h-px bg-border/40 flex-1 ml-4" />
                                                                                            </div>
                                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                                <div className="flex justify-between items-center px-2 py-1">
                                                                                                    <span className="text-xs text-muted-foreground flex items-center gap-2"><Heart className="w-3 h-3" /> Likes</span>
                                                                                                    <span className="text-sm font-bold">{selectedMedia.like_count || 0}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between items-center px-2 py-1 border-l border-border/40">
                                                                                                    <span className="text-xs text-muted-foreground flex items-center gap-2"><MessageCircle className="w-3 h-3" /> Comments</span>
                                                                                                    <span className="text-sm font-bold">{selectedMedia.comments_count || 0}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })()}

                                                                            <div className="pt-6 border-t border-border/40 mt-auto">
                                                                                <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold h-10 rounded-xl border-border/60 hover:bg-muted/10">
                                                                                    <a href={selectedMedia.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                                                                        <SiInstagram className="w-3 h-3" />
                                                                                        View Official Media
                                                                                        <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                                                                                    </a>
                                                                                </Button>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>

                                                                    <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
                                                                        <CardContent className="p-6">
                                                                            <CommentsManager mediaId={selectedIgMediaId} />
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })() : (
                                                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-2xl bg-card/50 text-muted-foreground">
                                                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 ring-1 ring-border/50">
                                                            <SiInstagram className="w-8 h-8 text-muted-foreground/60" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Select media</h3>
                                                        <p className="text-sm mt-1 max-w-xs text-center leading-relaxed">Choose an image or video from the grid to view detailed performance metrics</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <div className="relative w-24 h-24 bg-card border border-border/60 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:opacity-100 transition-opacity" />
                                <MousePointerClick className="w-10 h-10 text-foreground/80 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-3 font-satoshi tracking-tight">Select a Client</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            Choose a client from the dropdown above to unlock Meta Business insights, manage assets, and sync your cross-platform data.
                        </p>
                        <div className="mt-8 flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-border" />
                            <div className="w-2 h-2 rounded-full bg-border/60" />
                            <div className="w-2 h-2 rounded-full bg-border/30" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
}

export default MetaBusinessDetailPage;
