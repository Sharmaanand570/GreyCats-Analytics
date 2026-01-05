"use client";
import { useNavigate, useParams } from "react-router-dom";

import { useState, useEffect } from "react";
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
    Smile
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

    // 4. Data Processing
    const rawAccounts = clientData?.metaBusinessAccounts ?? [];

    // Map raw accounts to usable Page objects
    // Using acc.metaAccountId (from join table) as the primary ID for sync operations
    const pages = rawAccounts.map((acc: any) => ({
        id: acc.metaAccount?.pageId, // The Facebook Page ID (string)
        name: acc.metaAccount?.pageName || "Unknown Page",
        // Use instagramBusinessId if available, otherwise use instagramUsername as identifier
        // The backend returns instagramUsername but not instagramBusinessId for some accounts
        instagram_business_account: acc.metaAccount?.instagramBusinessId || acc.metaAccount?.instagramUsername,
        instagram_username: acc.metaAccount?.instagramUsername,
        // CRITICAL FIX: Use the correct account ID for sync endpoints. 
        // Trying metaAccountId first, falling back to id.
        accountId: acc.metaAccountId ?? acc.id,
    }));

    // Get the selected account and its ID for API calls
    const selectedAccount = pages.find(p => p.id === selectedPageId);
    const accountId = selectedAccount?.accountId; // This is the metaAccountId (e.g., 7)
    const pageId = selectedAccount?.id; // This is the Facebook Page ID

    // Facebook Page Info (from Meta Insights API - basic info only)
    const { data: pageInfoData } = useFacebookPageInfo(pageId);

    // Facebook Data Hooks - use accountId not pageId
    const { data: postsData, isLoading: isLoadingPosts } = useFacebookPosts(accountId);

    // Facebook Post Insights - fetch insights for selected post
    const { data: postInsightsData } = useFacebookPostInsights(selectedPostId || undefined);

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
            await syncBoth({ accountId });
        } catch (error) {
            console.error(error);
        } finally {
            setSyncingPageId(null);
        }
    };



    // --- Render ---

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto p-6 space-y-8">

                {/* --- 1. Top Navigation Bar --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <span onClick={() => navigate(-1)} className="hover:text-primary cursor-pointer transition-colors">Data Sources</span>
                            <span className="text-muted-foreground/30">/</span>
                            <span className="font-medium text-foreground">Meta Business</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <SiMeta className="w-6 h-6 text-primary" />
                            Meta Business Center
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 md:items-center">
                        <DataSyncBanner compact={true} />
                        <div className="w-full md:w-[320px]">
                            <Select value={selectedClientId?.toString() || ""} onValueChange={(v) => setSelectedClientId(Number(v))}>
                                <SelectTrigger className="h-10 bg-card border-border shadow-sm transition-all focus:ring-primary/20">
                                    <SelectValue placeholder="Select Client Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients?.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                {client.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* --- 2. Accounts Overview Grid --- */}
                {selectedClientId ? (
                    <div className="space-y-6">
                        {pages.length === 0 ? (
                            <Card className="border-dashed border-2 bg-muted/30 border-muted-foreground/20">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">No Meta Accounts Connected</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                        This client doesn't have any Meta Business accounts connected yet. Connect them in the Integrations settings.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pages.map((page) => (
                                    <Card
                                        key={page.id}
                                        onClick={() => {
                                            setSelectedPageId(page.id);
                                            setSelectedPostId(null);
                                        }}
                                        className={cn(
                                            "group cursor-pointer transition-all duration-300 border-l-4 hover:shadow-md",
                                            selectedPageId === page.id
                                                ? "border-l-primary ring-2 ring-primary/10 shadow-md bg-card"
                                                : "border-l-transparent border-border hover:border-primary/50 bg-card/80"
                                        )}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                                            {page.name?.substring(0, 2).toUpperCase() || 'FB'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold text-sm text-foreground line-clamp-1" title={page.name}>
                                                            {page.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded text-[10px] text-blue-600 font-medium dark:text-blue-400">
                                                                <SiFacebook className="w-3 h-3" />
                                                                <span className="hidden sm:inline">Page</span>
                                                            </div>
                                                            {page.instagram_business_account && (
                                                                <div className="flex items-center gap-1 bg-pink-500/10 px-1.5 py-0.5 rounded text-[10px] text-pink-600 font-medium dark:text-pink-400">
                                                                    <SiInstagram className="w-3 h-3" />
                                                                    <span className="hidden sm:inline">Linked</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSyncBoth(page.accountId);
                                                    }}
                                                    disabled={isSyncingBoth && syncingPageId === page.accountId.toString()}
                                                >
                                                    {isSyncingBoth && syncingPageId === page.accountId.toString() ? (
                                                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-3 h-3 mr-1.5" />
                                                    )}
                                                    Sync All
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs font-medium text-muted-foreground hover:text-pink-600 hover:bg-pink-500/10 disabled:opacity-50"
                                                    disabled={!page.instagram_business_account}
                                                >
                                                    <LayoutGrid className="w-3 h-3 mr-1.5" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
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
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <TabsList className="bg-card border border-border p-1 shadow-sm h-11">
                                            <TabsTrigger
                                                value="facebook"
                                                className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 px-6 h-9"
                                            >
                                                <SiFacebook className="w-4 h-4 mr-2" />
                                                Facebook Page
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="instagram"
                                                className="data-[state=active]:bg-pink-500/10 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 px-6 h-9"
                                                disabled={!pages.find(p => p.id === selectedPageId)?.instagram_business_account}
                                            >
                                                <SiInstagram className="w-4 h-4 mr-2" />
                                                Instagram
                                            </TabsTrigger>
                                        </TabsList>

                                        <div className="text-sm text-muted-foreground">
                                            Showing data for <span className="font-semibold text-foreground">{pages.find(p => p.id === selectedPageId)?.name}</span>
                                        </div>
                                    </div>

                                    {/* === FACEBOOK TAB === */}
                                    <TabsContent value="facebook" className="mt-0">
                                        {/* Page Overview Section */}
                                        {pageInfoData?.success && pageInfoData.page && (
                                            <Card className="mb-6 border-border shadow-sm bg-card">
                                                <CardHeader className="border-b border-border pb-4">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <LayoutGrid className="w-4 h-4 text-blue-600" />
                                                        Page Overview
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Followers */}
                                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border">
                                                            <div className="p-2 rounded-full bg-blue-500/10">
                                                                <ThumbsUp className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Page Followers</p>
                                                                <p className="text-2xl font-bold text-foreground">{pageInfoData.page.fan_count.toLocaleString()}</p>
                                                            </div>
                                                        </div>

                                                        {/* Category */}
                                                        {pageInfoData.page.category_list && pageInfoData.page.category_list.length > 0 && (
                                                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border">
                                                                <div className="p-2 rounded-full bg-purple-500/10">
                                                                    <LayoutGrid className="w-5 h-5 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Category</p>
                                                                    <p className="text-sm font-semibold text-foreground">{pageInfoData.page.category_list[0].name}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Page Link */}
                                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border">
                                                            <div className="p-2 rounded-full bg-green-500/10">
                                                                <ExternalLink className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-muted-foreground mb-1">Facebook Page</p>
                                                                <a
                                                                    href={pageInfoData.page.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm font-semibold text-blue-600 hover:underline truncate block"
                                                                >
                                                                    View Page
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                                            {/* FB Posts List */}
                                            <Card className="lg:col-span-4 flex flex-col h-full border-border shadow-sm overflow-hidden bg-card">
                                                <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-sm font-semibold text-foreground">Recent Posts</CardTitle>
                                                        <Badge variant="outline" className="bg-card border-border text-foreground">{posts.length}</Badge>
                                                    </div>
                                                </CardHeader>
                                                <div className="flex-1 overflow-y-auto p-0">
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
                                                                        "aspect-square relative cursor-pointer group overflow-hidden rounded-sm",
                                                                        selectedPostId === post.id ? "ring-2 ring-blue-500 z-10" : ""
                                                                    )}
                                                                >
                                                                    {post.attachments?.data?.[0]?.media?.image?.src ? (
                                                                        <img src={post.attachments.data[0].media.image.src} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                            <SiFacebook className="text-muted-foreground/30 w-8 h-8" />
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
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

                                                    return (
                                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                                            <Card className="border-border shadow-sm bg-card">
                                                                <CardHeader className="border-b border-border pb-4">
                                                                    <CardTitle className="text-base flex items-center gap-2">
                                                                        <BarChart3 className="w-4 h-4 text-blue-600" />
                                                                        Post Details
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="p-6 space-y-4">
                                                                    {/* Post Message */}
                                                                    {selectedPost.message && (
                                                                        <div>
                                                                            <h4 className="text-sm font-semibold text-foreground mb-2">Caption</h4>
                                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedPost.message}</p>
                                                                        </div>
                                                                    )}

                                                                    {/* Engagement Metrics */}
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-foreground mb-3">Engagement</h4>
                                                                        <div className="grid grid-cols-3 gap-4">
                                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border">
                                                                                <ThumbsUp className="w-4 h-4 text-blue-600" />
                                                                                <div>
                                                                                    <p className="text-xs text-muted-foreground">Likes</p>
                                                                                    <p className="text-lg font-bold text-foreground">{selectedPost.likes?.summary?.total_count || 0}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border">
                                                                                <MessageCircle className="w-4 h-4 text-green-600" />
                                                                                <div>
                                                                                    <p className="text-xs text-muted-foreground">Comments</p>
                                                                                    <p className="text-lg font-bold text-foreground">{selectedPost.comments?.summary?.total_count || 0}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border">
                                                                                <ExternalLink className="w-4 h-4 text-purple-600" />
                                                                                <div>
                                                                                    <p className="text-xs text-muted-foreground">Shares</p>
                                                                                    <p className="text-lg font-bold text-foreground">{selectedPost.shares?.count || 0}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Post Date */}
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-foreground mb-2">Posted</h4>
                                                                        <p className="text-sm text-muted-foreground">{new Date(selectedPost.created_time).toLocaleString()}</p>
                                                                    </div>

                                                                    {/* Post Insights (Custom Layout) */}
                                                                    {postInsightsData?.data?.data && (() => {
                                                                        // Helper to get metric value safely
                                                                        const getMetricValue = (metricName: string): number => {
                                                                            const metric = postInsightsData.data.data.find((m: any) => m.name === metricName);
                                                                            // console.log(`Metric ${metricName}:`, metric); // Debug individual metric
                                                                            if (!metric?.values?.[0]?.value) return 0;

                                                                            // Handle object values (like reactions/clicks map) by summing values
                                                                            if (typeof metric.values[0].value === 'object') {
                                                                                return Object.values(metric.values[0].value).reduce((a: any, b: any) => a + b, 0) as number;
                                                                            }

                                                                            return metric.values[0].value as number;
                                                                        };

                                                                        console.log("Post Insights Data:", postInsightsData);

                                                                        // Try multiple click metrics to find available data
                                                                        const clicks = getMetricValue('post_clicks') ||
                                                                            getMetricValue('post_clicks_unique') ||
                                                                            getMetricValue('post_clicks_by_type');

                                                                        const reactions = getMetricValue('post_reactions_by_type_total');
                                                                        const reach = getMetricValue('post_impressions_unique');
                                                                        const impressions = getMetricValue('post_impressions');

                                                                        return (
                                                                            <div>
                                                                                <h4 className="text-sm font-semibold text-foreground mb-3">Performance</h4>

                                                                                {/* Row 1: Engagement Cards */}
                                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                                                    {/* Likes (from Post Object) */}
                                                                                    <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-border">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <ThumbsUp className="w-4 h-4 text-blue-600" />
                                                                                            <p className="text-xs text-muted-foreground">Likes</p>
                                                                                        </div>
                                                                                        <p className="text-lg font-bold text-foreground">{selectedPost.likes?.summary?.total_count || 0}</p>
                                                                                    </div>

                                                                                    {/* Comments (from Post Object) */}
                                                                                    <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-border">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <MessageCircle className="w-4 h-4 text-green-600" />
                                                                                            <p className="text-xs text-muted-foreground">Comments</p>
                                                                                        </div>
                                                                                        <p className="text-lg font-bold text-foreground">{selectedPost.comments?.summary?.total_count || 0}</p>
                                                                                    </div>

                                                                                    {/* Shares (from Post Object) */}
                                                                                    <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-border">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <ExternalLink className="w-4 h-4 text-purple-600" />
                                                                                            <p className="text-xs text-muted-foreground">Shares</p>
                                                                                        </div>
                                                                                        <p className="text-lg font-bold text-foreground">{selectedPost.shares?.count || 0}</p>
                                                                                    </div>

                                                                                    {/* Reactions (from Insights) */}
                                                                                    <div className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-border">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <Smile className="w-4 h-4 text-orange-600" />
                                                                                            <p className="text-xs text-muted-foreground">Reactions</p>
                                                                                        </div>
                                                                                        <p className="text-lg font-bold text-foreground">{reactions || 0}</p>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Row 2: Clicks */}
                                                                                <div className="p-4 rounded-lg bg-muted/20 border border-border mb-4">
                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                        <MousePointerClick className="w-4 h-4 text-foreground" />
                                                                                        <p className="text-sm font-medium text-foreground">Post Clicks</p>
                                                                                    </div>
                                                                                    <p className="text-3xl font-bold text-foreground">{clicks.toLocaleString()}</p>
                                                                                </div>

                                                                                {/* Row 3: Reach & Impressions */}
                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                                                                                        <p className="text-xs text-muted-foreground">Reach</p>
                                                                                        <p className="text-lg font-bold text-foreground">{reach.toLocaleString()}</p>
                                                                                    </div>
                                                                                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                                                                                        <p className="text-xs text-muted-foreground">Impressions</p>
                                                                                        <p className="text-lg font-bold text-foreground">{impressions.toLocaleString()}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </CardContent>
                                                            </Card>

                                                            <div className="flex justify-end">
                                                                <Button variant="outline" size="sm" asChild className="text-xs">
                                                                    <a
                                                                        href={selectedPost.permalink_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <ExternalLink className="w-3 h-3" />
                                                                        View Original Post
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })() : (<div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card text-muted-foreground">
                                                    <MousePointerClick className="w-12 h-12 mb-3 opacity-20" />
                                                    <h3 className="text-lg font-medium text-foreground">Select a post</h3>
                                                    <p className="text-sm">Click on a post from the list to view detailed performance metrics</p>
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
                                                            {igMedia.map((item: any) => (
                                                                <div
                                                                    key={item.id}
                                                                    onClick={() => setSelectedIgMediaId(item.id)}
                                                                    className={cn(
                                                                        "aspect-square relative cursor-pointer group overflow-hidden rounded-sm",
                                                                        selectedIgMediaId === item.id ? "ring-2 ring-pink-500 z-10" : ""
                                                                    )}
                                                                >
                                                                    {item.media_url ? (
                                                                        <img src={item.media_url} alt="IG Media" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                            <SiInstagram className="text-muted-foreground/30 w-8 h-8" />
                                                                        </div>
                                                                    )}
                                                                    {item.media_type === 'VIDEO' && (
                                                                        <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white backdrop-blur-sm">
                                                                            <Video className="w-3 h-3" />
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>

                                            {/* IG Insights Detail */}
                                            <div className="lg:col-span-8 flex flex-col h-full space-y-6 overflow-y-auto pr-1">
                                                {selectedIgMediaId ? (
                                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Media Preview */}
                                                            <Card className="border-border overflow-hidden shadow-sm bg-card">
                                                                <div className="aspect-square bg-muted/80 flex items-center justify-center">
                                                                    {(() => {
                                                                        const selectedMedia = igMedia.find((m: any) => m.id === selectedIgMediaId);
                                                                        if (!selectedMedia?.media_url) {
                                                                            return <div className="text-muted-foreground/50">No Media</div>;
                                                                        }

                                                                        // Check if it's a video
                                                                        if (selectedMedia.media_type === 'VIDEO') {
                                                                            return (
                                                                                <video
                                                                                    src={selectedMedia.media_url}
                                                                                    className="max-h-full max-w-full object-contain"
                                                                                    controls
                                                                                    loop
                                                                                    muted
                                                                                    playsInline
                                                                                    onMouseEnter={(e) => e.currentTarget.play()}
                                                                                    onMouseLeave={(e) => e.currentTarget.pause()}
                                                                                    poster={selectedMedia.thumbnail_url || undefined}
                                                                                />
                                                                            );
                                                                        }

                                                                        // Otherwise show image
                                                                        return (
                                                                            <img
                                                                                src={selectedMedia.media_url}
                                                                                alt="Selected"
                                                                                className="max-h-full max-w-full object-contain"
                                                                            />
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <CardContent className="p-4 bg-card">
                                                                    <p className="text-sm text-foreground line-clamp-2">
                                                                        {igMedia.find((m: any) => m.id === selectedIgMediaId)?.caption || "No caption"}
                                                                    </p>
                                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {igMedia.find((m: any) => m.id === selectedIgMediaId)?.like_count || 0}</span>
                                                                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {igMedia.find((m: any) => m.id === selectedIgMediaId)?.comments_count || 0}</span>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>

                                                            {/* Insights Metrics */}
                                                            <div className="space-y-4">
                                                                <Card className="border-pink-100 bg-pink-50/30">
                                                                    <CardHeader className="py-3 px-4 border-b border-pink-100/50">
                                                                        <CardTitle className="text-sm font-semibold text-pink-900 flex items-center gap-2">
                                                                            <TrendingUp className="w-4 h-4" /> Performance
                                                                        </CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent className="p-4">
                                                                        {isLoadingIgInsights ? (
                                                                            <div className="space-y-3">
                                                                                <Skeleton className="h-12 w-full" />
                                                                                <Skeleton className="h-12 w-full" />
                                                                            </div>
                                                                        ) : igInsightsError ? (
                                                                            <div className="text-red-500 text-sm">Failed to load insights</div>
                                                                        ) : (
                                                                            <div className="space-y-3">
                                                                                {igInsights.map((metric: any) => (
                                                                                    <div key={metric.name} className="bg-card p-3 rounded-lg border border-pink-500/10 shadow-sm flex justify-between items-center">
                                                                                        <span className="text-xs font-medium text-pink-700 dark:text-pink-300 uppercase tracking-wide">{metric.name.replace(/_/g, ' ')}</span>
                                                                                        <span className="text-lg font-bold text-foreground">{metric.values[0]?.value}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card text-muted-foreground">
                                                        <SiInstagram className="w-12 h-12 mb-3 opacity-20" />
                                                        <h3 className="text-lg font-medium text-foreground">Select media</h3>
                                                        <p className="text-sm">Choose an image or video to view performance</p>
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
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <MousePointerClick className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Select a Client</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Choose a client from the dropdown above to manage their Meta Business assets, view insights, and sync data.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MetaBusinessDetailPage;
