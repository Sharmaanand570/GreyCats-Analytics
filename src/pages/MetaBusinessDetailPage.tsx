"use client";

import { useState } from "react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Loader2,
    RefreshCw,
    AlertCircle,
    ExternalLink,
    MessageCircle,
    ThumbsUp,
    Share2,
    Video,
    Image as ImageIcon,
    BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import Meta Business API hooks
import { useMetaBusinessAccounts, useMetaBusinessSyncFacebook, useMetaBusinessSyncInstagram, useMetaBusinessSync } from "@/features/meta/hooks/useMetaBusinessData.ts";

// Import Meta Insights API hooks (existing)
import {
    useFacebookPagePosts,
    useFacebookPostInsights,
    useInstagramMedia,
    useInstagramMediaInsights,
    useInstagramProfile,
} from "@/features/meta/hooks/useMetaData";

function MetaBusinessDetailPage() {
    const [activeTab, setActiveTab] = useState("facebook");

    // Facebook State
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [syncingPageId, setSyncingPageId] = useState<string | null>(null);

    // Instagram State
    const [selectedIgPageId, setSelectedIgPageId] = useState<string | null>(null);
    const [selectedIgMediaId, setSelectedIgMediaId] = useState<string | null>(null);
    const [syncingIgId, setSyncingIgId] = useState<string | null>(null);

    // Meta Business Accounts (from metaBusinessApi)
    const { data: accountsData, isLoading: isLoadingAccounts } = useMetaBusinessAccounts();

    // Sync hooks
    const { mutateAsync: syncFacebook, isPending: isSyncingFacebook } = useMetaBusinessSyncFacebook();
    const { mutateAsync: syncInstagram, isPending: isSyncingInstagram } = useMetaBusinessSyncInstagram();
    const { mutateAsync: syncBoth, isPending: isSyncingBoth } = useMetaBusinessSync();

    // Data Processing - Get accounts first
    const accounts = accountsData?.accounts ?? [];

    // Meta Business accounts ARE the pages - no need for separate API call
    // Each account represents a Facebook Page with optional Instagram Business Account
    const pages = accounts.map((acc: any) => ({
        id: acc.pageId,
        name: acc.pageName,
        instagram_business_account: acc.instagramBusinessId,
        accountId: acc.id, // Store the Meta Business account ID for API calls
    }));
    const isLoadingPages = isLoadingAccounts;

    // Get the selected account's Meta Business ID for API calls
    const selectedAccount = accounts.find((acc: any) => acc.pageId === selectedPageId);
    const selectedAccountId = selectedAccount?.id;

    // Facebook Data - Use Meta Business API for posts
    // Note: Posts should come from /metabusiness/facebook/posts/:accountId
    // But we're currently using Meta Insights API - this might need backend support
    const { data: postsData, isLoading: isLoadingPosts } = useFacebookPagePosts(selectedPageId || undefined, 10);
    const { data: postInsightsData, isLoading: isLoadingPostInsights } = useFacebookPostInsights(selectedPostId || undefined, selectedPageId || undefined);

    // Instagram Data - Using Meta Business Account ID
    const accountIdForInstagram = selectedIgPageId || undefined;

    const { data: igProfileData, isLoading: isLoadingIgProfile } = useInstagramProfile(accountIdForInstagram);
    const { data: igMediaData, isLoading: isLoadingIgMedia } = useInstagramMedia(accountIdForInstagram, 20);
    const { data: igInsightsData, isLoading: isLoadingIgInsights, error: igInsightsError } = useInstagramMediaInsights(accountIdForInstagram, selectedIgMediaId || undefined);

    // More Data Processing
    const posts = postsData?.posts ?? [];
    const postInsights = postInsightsData?.insights ?? [];
    const postEngagement = postInsightsData?.engagement;
    const igMedia = igMediaData?.data ?? [];
    const igInsights = igInsightsData?.data?.data ?? [];

    // Handlers
    const handleSyncFacebook = async (accountId: number) => {
        try {
            setSyncingPageId(accountId.toString());
            await syncFacebook({ accountId });
        } catch (error) {
            console.error(error);
        } finally {
            setSyncingPageId(null);
        }
    };

    const handleSyncInstagram = async (accountId: number) => {
        try {
            setSyncingIgId(accountId.toString());
            await syncInstagram({ accountId });
        } catch (error) {
            console.error(error);
        } finally {
            setSyncingIgId(null);
        }
    };

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

    if (isLoadingAccounts || isLoadingPages) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl bg-white min-h-screen">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/data-sources">Data Sources</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Meta Business</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            <h1 className="text-3xl font-bold text-slate-900 mt-2">Meta Business</h1>
                            <p className="text-slate-500 mt-1">Manage your Facebook Pages and Instagram Business accounts</p>
                        </div>
                    </div>

                    {/* Accounts Summary */}
                    {accounts.length > 0 && (
                        <Card className="border-blue-100 bg-blue-50/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <SiFacebook className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">
                                            {accounts.length} Connected Account{accounts.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {accounts.filter((a: any) => a.instagramBusinessId).length} with Instagram Business
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-slate-100 p-1">
                            <TabsTrigger value="facebook" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                                <SiFacebook className="w-4 h-4 mr-2" />
                                Facebook Pages
                            </TabsTrigger>
                            <TabsTrigger value="instagram" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                                <SiInstagram className="w-4 h-4 mr-2" />
                                Instagram
                            </TabsTrigger>
                        </TabsList>

                        {/* Facebook Tab */}
                        <TabsContent value="facebook" className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Facebook Pages</h2>
                                    <p className="text-sm text-slate-500">View and manage your Facebook Page posts and insights</p>
                                </div>
                            </div>

                            {pages.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="p-12 text-center">
                                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-700">No Facebook Pages Found</h3>
                                        <p className="text-slate-500 mt-2">Connect your Meta Business account to get started</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Pages Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pages.map((page) => (
                                            <Card
                                                key={page.id}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:shadow-lg border-2",
                                                    selectedPageId === page.id ? "border-blue-500 bg-blue-50/30" : "border-slate-100"
                                                )}
                                                onClick={() => {
                                                    setSelectedPageId(page.id);
                                                    setSelectedPostId(null);
                                                }}
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                                                {page.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {page.instagram_business_account && (
                                                            <Badge variant="secondary" className="bg-pink-50 text-pink-600 border-pink-200">
                                                                <SiInstagram className="w-3 h-3 mr-1" />
                                                                IG Linked
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardTitle className="text-base mt-3">{page.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSyncFacebook(page.accountId);
                                                            }}
                                                            disabled={isSyncingFacebook && syncingPageId === page.accountId.toString()}
                                                        >
                                                            {isSyncingFacebook && syncingPageId === page.accountId.toString() ? (
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <SiFacebook className="w-3 h-3 mr-1" />
                                                            )}
                                                            Facebook
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSyncInstagram(page.accountId);
                                                            }}
                                                            disabled={!page.instagram_business_account || (isSyncingInstagram && syncingIgId === page.accountId.toString())}
                                                        >
                                                            {isSyncingInstagram && syncingIgId === page.accountId.toString() ? (
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <SiInstagram className="w-3 h-3 mr-1" />
                                                            )}
                                                            Instagram
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="w-full text-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSyncBoth(page.accountId);
                                                        }}
                                                        disabled={isSyncingBoth && syncingPageId === page.accountId.toString()}
                                                    >
                                                        {isSyncingBoth && syncingPageId === page.accountId.toString() ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                        )}
                                                        Sync Both
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Posts Section */}
                                    {selectedPageId && (
                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[750px]">
                                            {/* Left: Posts List */}
                                            <Card className="xl:col-span-4 h-full flex flex-col overflow-hidden">
                                                <CardHeader className="border-b">
                                                    <CardTitle className="text-base">Recent Posts</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-0 flex-1 overflow-y-auto">
                                                    {isLoadingPosts ? (
                                                        <div className="p-4 space-y-4">
                                                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                                                        </div>
                                                    ) : posts.length === 0 ? (
                                                        <div className="p-8 text-center text-slate-400">
                                                            <p>No posts found</p>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y">
                                                            {posts.map((post) => (
                                                                <div
                                                                    key={post.id}
                                                                    onClick={() => setSelectedPostId(post.id)}
                                                                    className={cn(
                                                                        "p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4",
                                                                        selectedPostId === post.id ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
                                                                    )}
                                                                >
                                                                    <p className="text-sm font-medium text-slate-700 line-clamp-2 mb-2">
                                                                        {post.message || "No caption"}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400">
                                                                        {new Date(post.created_time).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Right: Post Details */}
                                            <div className="xl:col-span-8 h-full overflow-y-auto">
                                                {selectedPostId ? (
                                                    <Card>
                                                        <CardHeader className="border-b">
                                                            <CardTitle className="text-base">Post Insights</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-6">
                                                            {isLoadingPostInsights ? (
                                                                <div className="space-y-4">
                                                                    <Skeleton className="h-24 w-full" />
                                                                    <Skeleton className="h-24 w-full" />
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-6">
                                                                    {/* Engagement */}
                                                                    {postEngagement && (
                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                                                <ThumbsUp className="w-5 h-5 text-blue-600 mb-2" />
                                                                                <p className="text-xs text-slate-600">Likes</p>
                                                                                <p className="text-xl font-bold text-slate-900">{postEngagement.likes}</p>
                                                                            </div>
                                                                            <div className="p-4 bg-green-50 rounded-lg">
                                                                                <MessageCircle className="w-5 h-5 text-green-600 mb-2" />
                                                                                <p className="text-xs text-slate-600">Comments</p>
                                                                                <p className="text-xl font-bold text-slate-900">{postEngagement.comments}</p>
                                                                            </div>
                                                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                                                <Share2 className="w-5 h-5 text-purple-600 mb-2" />
                                                                                <p className="text-xs text-slate-600">Shares</p>
                                                                                <p className="text-xl font-bold text-slate-900">{postEngagement.shares}</p>
                                                                            </div>
                                                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                                                <BarChart3 className="w-5 h-5 text-orange-600 mb-2" />
                                                                                <p className="text-xs text-slate-600">Reactions</p>
                                                                                <p className="text-xl font-bold text-slate-900">{postEngagement.reactions}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Insights */}
                                                                    {postInsights.length > 0 && (
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            {postInsights.map((insight) => (
                                                                                <div key={insight.name} className="p-4 border rounded-lg">
                                                                                    <p className="text-xs text-slate-500 uppercase mb-1">
                                                                                        {insight.name.replace(/_/g, ' ')}
                                                                                    </p>
                                                                                    <p className="text-2xl font-bold text-slate-900">
                                                                                        {insight.values[0]?.value || 0}
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    <div className="pt-4 border-t">
                                                                        <a
                                                                            href={posts.find(p => p.id === selectedPostId)?.permalink_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                                                        >
                                                                            View on Facebook <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl">
                                                        <p className="text-slate-400">Select a post to view insights</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        {/* Instagram Tab */}
                        <TabsContent value="instagram" className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Instagram Insights</h2>
                                    <p className="text-sm text-slate-500">Select a Meta Business account to view Instagram performance</p>
                                </div>
                                <Select value={selectedIgPageId || ""} onValueChange={(v) => { setSelectedIgPageId(v); setSelectedIgMediaId(null); }}>
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((acc: any) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()} disabled={!acc.instagramBusinessId}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{acc.pageName}</span>
                                                    {acc.instagramBusinessId ? (
                                                        <Badge variant="secondary" className="ml-2 h-5 text-[10px] bg-pink-50 text-pink-600">
                                                            @{acc.instagramUsername || 'Instagram'}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 ml-2">(No IG)</span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedIgPageId && accountIdForInstagram && (
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[750px]">
                                    {/* Left: Media List */}
                                    <Card className="xl:col-span-4 h-full flex flex-col overflow-hidden">
                                        <CardHeader className="border-b">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white font-bold text-xs">
                                                            IG
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold leading-none">{igProfileData?.data?.username || "Instagram User"}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{igProfileData?.data?.media_count || 0} Posts</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSyncInstagram(Number(accountIdForInstagram))}
                                                    disabled={isSyncingInstagram && syncingIgId === accountIdForInstagram}
                                                >
                                                    {isSyncingInstagram && syncingIgId === accountIdForInstagram ? (
                                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                    ) : (
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                    )}
                                                    Sync
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0 flex-1 overflow-y-auto">
                                            {isLoadingIgMedia ? (
                                                <div className="p-4 space-y-4">
                                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                                                </div>
                                            ) : igMedia.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400">
                                                    <ImageIcon className="w-8 h-8 mb-2 opacity-20 mx-auto" />
                                                    <p>No media found</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {igMedia.map((item: any) => {
                                                        const isSelected = selectedIgMediaId === item.id;
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                onClick={() => setSelectedIgMediaId(item.id)}
                                                                className={cn(
                                                                    "p-3 cursor-pointer hover:bg-slate-50 transition-all flex gap-3 border-l-4",
                                                                    isSelected ? "bg-pink-50/30 border-l-pink-500" : "border-l-transparent"
                                                                )}
                                                            >
                                                                <div className="h-16 w-16 bg-slate-100 rounded overflow-hidden flex items-center justify-center text-slate-300">
                                                                    {item.media_type === 'VIDEO' ? <Video className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0 py-1">
                                                                    <p className={cn("text-xs font-medium line-clamp-2 mb-1.5", isSelected ? "text-pink-900" : "text-slate-700")}>
                                                                        {item.caption || "No caption"}
                                                                    </p>
                                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                                        {item.media_type.replace(/_/g, ' ')}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Right: Media Details */}
                                    <div className="xl:col-span-8 h-full overflow-y-auto">
                                        {selectedIgMediaId ? (
                                            <Card>
                                                <CardHeader className="border-b">
                                                    <CardTitle className="text-base">Media Insights</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    {isLoadingIgInsights ? (
                                                        <div className="space-y-4">
                                                            <Skeleton className="h-24 w-full" />
                                                            <Skeleton className="h-24 w-full" />
                                                        </div>
                                                    ) : igInsightsError ? (
                                                        <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                                                            Unable to load insights for this media.
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {igInsights.map((metric: any) => (
                                                                <div key={metric.name} className="p-4 bg-white border rounded-xl shadow-sm hover:border-pink-200 transition-colors">
                                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                                        {metric.name.replace(/_/g, ' ')}
                                                                    </p>
                                                                    <p className="text-xl font-bold text-slate-900">
                                                                        {(metric.values?.[0]?.value || 0).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl">
                                                <div className="text-center">
                                                    <SiInstagram className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                                                    <p className="text-slate-400">Select media to view insights</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedIgPageId && !accountIdForInstagram && !isLoadingIgProfile && (
                                <Card className="border-dashed">
                                    <CardContent className="p-12 text-center">
                                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                        <h3 className="text-lg font-semibold text-slate-800">No Instagram Account Linked</h3>
                                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                            The selected Facebook Page does not have a linked Instagram Business Account.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {!selectedIgPageId && (
                                <div className="h-[400px] flex items-center justify-center border border-slate-200 rounded-xl bg-slate-50/30">
                                    <p className="text-slate-400">Select a Facebook Page above to start</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div >
    );
}

export default MetaBusinessDetailPage;
