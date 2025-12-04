import { FiBell, FiSearch } from "react-icons/fi";
import { FaCartShopping } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { WooCommerceKPICards } from "@/components/WooCommerceKPICards";
import { WooCommerceRevenueChart } from "@/components/WooCommerceRevenueChart";
import { WooCommerceTopProducts } from "@/components/WooCommerceTopProducts";
import {
  useWooCommerceAnalytics,
  useWooCommercePerProductPaginated,
  useWooCommerceAgencyRollup,
  useWooCommerceAccountInfo,
  useWooCommerceSyncStatus,
  useWooCommerceSyncProducts,
  useWooCommerceSyncOrders,
  useWooCommerceDisconnect,
  useWooCommerceReconnect,
  useWooCommerceAccounts,
  useWooCommerceProducts,
  useWooCommerceProduct,
  useWooCommerceOrders,
  useWooCommerceOrder,
} from "@/features/woocommerce/hooks/useWooCommerce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusBadgeClass } from "@/utils/statusColors";
import { MoreVertical, ExternalLink, RefreshCw, Loader2, Power, PowerOff, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function WooCommerceDetailPage() {
  const [accountId, setAccountId] = useState<number | null>(null);
  const [productsPage, setProductsPage] = useState(1);
  const [productsLimit] = useState(10);
  const [productsSearch, setProductsSearch] = useState<string>("");
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit] = useState(10);
  const [perProductPage] = useState(1);
  const [perProductLimit] = useState(10);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { data: accountsData, error: accountsError, isLoading: isLoadingAccounts } = useWooCommerceAccounts();

  // Mutations
  const { mutateAsync: syncProducts, isPending: isSyncingProducts } =
    useWooCommerceSyncProducts();
  const { mutateAsync: syncOrders, isPending: isSyncingOrders } =
    useWooCommerceSyncOrders();
  const { mutateAsync: disconnect, isPending: isDisconnecting } =
    useWooCommerceDisconnect();
  const { mutateAsync: reconnect, isPending: isReconnecting } =
    useWooCommerceReconnect();

  // Fetch account info and sync status
  const { data: accountInfo, isLoading: isLoadingAccountInfo } =
    useWooCommerceAccountInfo(accountId);
  const { data: syncStatus, isLoading: isLoadingSyncStatus } =
    useWooCommerceSyncStatus(accountId);

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useWooCommerceAnalytics(accountId);

  // Fetch per-product analytics data (for top products with revenue) - using paginated version
  const {
    data: productsAnalyticsData,
    isLoading: isLoadingProductsAnalytics,
    error: productsAnalyticsError,
  } = useWooCommercePerProductPaginated(
    accountId
      ? {
          accountId,
          page: perProductPage,
          limit: perProductLimit,
          sort: "revenue",
          direction: "desc",
        }
      : null
  );

  // Fetch orders list
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useWooCommerceOrders(
    accountId
      ? {
          accountId,
          page: ordersPage,
          limit: ordersLimit,
        }
      : null
  );

  // Fetch single product detail
  const {
    data: productDetailData,
    isLoading: isLoadingProductDetail,
  } = useWooCommerceProduct(selectedProductId, accountId);

  // Fetch single order detail
  const {
    data: orderDetailData,
    isLoading: isLoadingOrderDetail,
  } = useWooCommerceOrder(selectedOrderId, accountId);

  // Fetch products catalog
  const {
    data: productsCatalogData,
    isLoading: isLoadingProductsCatalog,
    error: productsCatalogError,
  } = useWooCommerceProducts(
    accountId
      ? {
          accountId,
          page: productsPage,
          limit: productsLimit,
          search: productsSearch || undefined,
        }
      : null
  );

  // Fetch agency rollup data for stores table
  const {
    data: rollupData,
    isLoading: isLoadingRollup,
    error: rollupError,
  } = useWooCommerceAgencyRollup();

  // Calculate active stores count from rollup data
  const activeStoresCount = rollupData?.accounts?.filter(acc => acc.revenue > 0 || acc.orders > 0).length || rollupData?.accounts?.length || 0;

  // Use account info for sync timestamps (more reliable than sync status alone)
  const lastProductsSync = accountInfo?.account?.lastProductsSync || syncStatus?.sync?.lastProductsSync;
  const lastOrdersSync = accountInfo?.account?.lastOrdersSync || syncStatus?.sync?.lastOrdersSync;

  // Transform revenue data for chart (mock data for now - would come from snapshots API in future)
  // For now, we can use a simple representation based on analytics data
  const revenueChartData = [
    { day: "Mon", revenue: 0 },
    { day: "Tue", revenue: 5 },
    { day: "Wed", revenue: 2.5 },
    { day: "Thu", revenue: 7.5 },
    { day: "Fri", revenue: 12.5 },
    { day: "Sat", revenue: 15 },
    { day: "Sun", revenue: 17.5 },
  ];

  // Set default account only if accountId is null (preserve user selection)
  useEffect(() => {
    if (accountId === null && accountsData?.success && accountsData?.accounts && accountsData.accounts.length > 0) {
      // Get the first active account, or the first account if none are active
      const activeAccount = accountsData.accounts.find((acc) => acc.isActive);
      const selectedAccount = activeAccount || accountsData.accounts[0];
      setAccountId(selectedAccount.id);
    }
  }, [accountsData, accountId]);

  const handleAccountChange = (value: string) => {
    const newAccountId = parseInt(value, 10);
    if (!isNaN(newAccountId)) {
      setAccountId(newAccountId);
      // Reset pagination and search when switching accounts
      setProductsPage(1);
      setOrdersPage(1);
      setProductsSearch("");
    }
  };

  const handleProductsSearchChange = (value: string) => {
    setProductsSearch(value);
    // Reset to first page when search changes
    setProductsPage(1);
  };

  const handleClearProductsSearch = () => {
    setProductsSearch("");
    setProductsPage(1);
  };

  const handleSyncProducts = async () => {
    if (!accountId) return;
    try {
      await syncProducts({ accountId });
    } catch (error) {
      // Error is handled in the hook with toast
    }
  };

  const handleSyncOrders = async () => {
    if (!accountId) return;
    try {
      await syncOrders({ accountId });
    } catch (error) {
      // Error is handled in the hook with toast
    }
  };

  const handleDisconnect = async () => {
    if (!accountId) return;
    try {
      await disconnect({ accountId });
    } catch (error) {
      // Error is handled in the hook with toast
    }
  };

  const handleReconnect = async () => {
    if (!accountId) return;
    try {
      await reconnect({ accountId });
    } catch (error) {
      // Error is handled in the hook with toast
    }
  };

  // Show loading state while fetching accounts
  if (isLoadingAccounts) {
    return (
      <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
        <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if accounts cannot be fetched
  if (accountsError) {
    return (
      <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
        <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Accounts</CardTitle>
                <CardDescription>
                  {accountsError instanceof Error
                    ? accountsError.message
                    : "Failed to load WooCommerce accounts"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Please ensure you have a connected WooCommerce account.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no accounts found
  if (accountsData?.success && (!accountsData.accounts || accountsData.accounts.length === 0)) {
    return (
      <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
        <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>No WooCommerce Accounts</CardTitle>
                <CardDescription>
                  You don't have any connected WooCommerce accounts yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Please connect a WooCommerce store to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5">
            <div className="flex items-center gap-3">
              <FaCartShopping
                className="text-2xl"
                style={{ color: "#96588A" }}
              />
              <span className="font-medium text-xl">
                WooCommerce Store Overview
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Account Selector */}
              {accountsData?.success && accountsData.accounts && accountsData.accounts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="account-select" className="text-sm text-gray-600 whitespace-nowrap">
                    Account:
                  </Label>
                  <Select
                    value={accountId?.toString() || ""}
                    onValueChange={handleAccountChange}
                  >
                    <SelectTrigger id="account-select" className="w-64">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountsData.accounts.map((account) => {
                        const displayUrl = account.storeUrl.replace(/^https?:\/\//, "");
                        const statusText = account.isActive ? " (Active)" : " (Inactive)";
                        return (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {displayUrl}{statusText}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
         
              <button className="relative">
                <FiBell className="text-xl text-gray-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>

          <div className="w-full px-5 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>WooCommerce</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Content */}
          <div className="w-full px-5 py-6 space-y-6">
            {/* Account Info & Actions Card */}
            {accountId && (
              <Card className=" border rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        Manage your WooCommerce connection and sync data
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {accountInfo?.account?.isActive ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDisconnect}
                          disabled={isDisconnecting}
                        >
                          {isDisconnecting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-4 h-4" />
                              Disconnect
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleReconnect}
                          disabled={isReconnecting}
                        >
                          {isReconnecting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Reconnecting...
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4" />
                              Reconnect
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAccountInfo || isLoadingSyncStatus ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Store Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">Store URL:</span>{" "}
                            <span className="font-medium">
                              {accountInfo?.account?.storeUrl || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Status:</span>{" "}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-md ${
                                accountInfo?.account?.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {accountInfo?.account?.isActive ? "Active" : "Inactive"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Sync Status
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">Last Products Sync:</span>{" "}
                            <span className="font-medium">
                              {lastProductsSync
                                ? format(
                                    new Date(lastProductsSync),
                                    "MMM dd, yyyy HH:mm"
                                  )
                                : "Never"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Last Orders Sync:</span>{" "}
                            <span className="font-medium">
                              {lastOrdersSync
                                ? format(
                                    new Date(lastOrdersSync),
                                    "MMM dd, yyyy HH:mm"
                                  )
                                : "Never"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSyncProducts}
                            disabled={isSyncingProducts || !accountInfo?.account?.isActive}
                          >
                            {isSyncingProducts ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Syncing Products...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                Sync Products
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSyncOrders}
                            disabled={isSyncingOrders || !accountInfo?.account?.isActive}
                          >
                            {isSyncingOrders ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Syncing Orders...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                Sync Orders
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Overview sections - only show when account is active */}
            {accountInfo?.account?.isActive ? (
              <>
                {/* Error States */}
                {analyticsError && (
                  <Card className=" border border-destructive/20 rounded-2xl">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive">
                        Failed to load analytics:{" "}
                        {analyticsError instanceof Error
                          ? analyticsError.message
                          : "Unknown error"}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {productsAnalyticsError && (
                  <Card className=" border border-destructive/20 rounded-2xl">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive">
                        Failed to load product analytics:{" "}
                        {productsAnalyticsError instanceof Error
                          ? productsAnalyticsError.message
                          : "Unknown error"}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {productsCatalogError && (
                  <Card className=" border border-destructive/20 rounded-2xl">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive">
                        Failed to load products:{" "}
                        {productsCatalogError instanceof Error
                          ? productsCatalogError.message
                          : "Unknown error"}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* KPI Cards - Use analytics data for current account, rollup totals for agency view */}
                <WooCommerceKPICards
                  totalRevenue={
                    analyticsData?.analytics?.totalRevenue || 
                    rollupData?.totals?.totalRevenue || 
                    0
                  }
                  totalOrders={
                    analyticsData?.analytics?.orderCount || 
                    rollupData?.totals?.totalOrders || 
                    0
                  }
                  avgOrderValue={
                    analyticsData?.analytics?.avgOrderValue || 
                    rollupData?.totals?.totalAvgOrder || 
                    0
                  }
                  activeStores={activeStoresCount}
                />

                {/* Chart and Products Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <div>
                    <WooCommerceRevenueChart
                      data={revenueChartData}
                      isLoading={isLoadingAnalytics}
                    />
                  </div>

                  {/* Top Products - Show top 3 from per-product analytics */}
                  <div>
                    {productsAnalyticsError ? (
                      <Card className=" border border-destructive/20 rounded-2xl">
                        <CardHeader>
                          <CardTitle>Top Performing Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-destructive">
                            Failed to load product analytics:{" "}
                            {productsAnalyticsError instanceof Error
                              ? productsAnalyticsError.message
                              : "Unknown error"}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <WooCommerceTopProducts
                        products={
                          productsAnalyticsData?.products && productsAnalyticsData.products.length > 0
                            ? productsAnalyticsData.products.slice(0, 3).map((p) => ({
                                productId: p.productId,
                                name: p.name,
                                revenue: p.revenue,
                                qty: p.qty,
                              }))
                            : []
                        }
                        isLoading={isLoadingProductsAnalytics}
                      />
                    )}
                  </div>
                </div>

                {/* Products and Orders Tables - Side by Side */}
                {accountId && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Products Catalog Table */}
                    <div className=" border rounded-2xl overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Products</h3>
                      {productsCatalogData && (
                        <p className="text-sm text-gray-500 mt-1">
                          Showing {productsCatalogData.products.length} of {productsCatalogData.total} products
                        </p>
                      )}
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-md">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  {/* Search Input */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search products by name or SKU..."
                      value={productsSearch}
                      onChange={(e) => handleProductsSearchChange(e.target.value)}
                      className="pl-10 pr-10 w-full max-w-md rounded-md border-gray-300"
                    />
                    {productsSearch && (
                      <button
                        onClick={handleClearProductsSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Clear search"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    )}
                  </div>
                </div>
                {isLoadingProductsCatalog ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : productsCatalogError ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-destructive">
                      Failed to load products:{" "}
                      {productsCatalogError instanceof Error
                        ? productsCatalogError.message
                        : "Unknown error"}
                    </p>
                  </div>
                ) : productsCatalogData?.products && productsCatalogData.products.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Product Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock Qty</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="pr-6"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsCatalogData.products.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <p className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {product.productId}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {product.sku || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {product.stockQty || 0}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                                  product.status === "publish"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {product.status || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="pr-6">
                              <button
                                onClick={() => setSelectedProductId(product.productId)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="View Product Details"
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {productsCatalogData.totalPages > 1 && (
                      <div className="p-4 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Page {productsCatalogData.page} of {productsCatalogData.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                            disabled={productsPage === 1 || isLoadingProductsCatalog}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProductsPage((p) => p + 1)}
                            disabled={
                              productsPage >= (productsCatalogData?.totalPages || 1) ||
                              isLoadingProductsCatalog
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No products found
                  </div>
                )}
                    </div>

                    {/* Orders Table */}
                    <div className=" border rounded-2xl overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Orders</h3>
                    {ordersData && (
                      <p className="text-sm text-gray-500 mt-1">
                        Showing {ordersData.orders.length} of {ordersData.total} orders
                      </p>
                    )}
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-md">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {isLoadingOrders ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : ordersError ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-destructive">
                      Failed to load orders:{" "}
                      {ordersError instanceof Error
                        ? ordersError.message
                        : "Unknown error"}
                    </p>
                  </div>
                ) : ordersData?.orders && ordersData.orders.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Order ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="pr-6"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordersData.orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <p className="text-sm font-medium text-gray-900">
                                  #{order.orderId}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {order.id}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${getStatusBadgeClass(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {order.currency} {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {order.currency}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                            </TableCell>
                            <TableCell className="pr-6">
                              <button
                                onClick={() => setSelectedOrderId(order.orderId)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="View Order Details"
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {ordersData.totalPages > 1 && (
                      <div className="p-4 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Page {ordersData.page} of {ordersData.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                            disabled={ordersPage === 1 || isLoadingOrders}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOrdersPage((p) => p + 1)}
                            disabled={
                              ordersPage >= (ordersData?.totalPages || 1) ||
                              isLoadingOrders
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No orders found
                  </div>
                )}
                    </div>
                  </div>
                )}

                {/* Active Stores Performance Table */}
                <div className=" border rounded-2xl overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Active Stores Performance
                </h3>
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              {isLoadingRollup ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : rollupError ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-destructive">
                    Failed to load stores:{" "}
                    {rollupError instanceof Error
                      ? rollupError.message
                      : "Unknown error"}
                  </p>
                </div>
              ) : rollupData?.accounts && rollupData.accounts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Store Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>AOV</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rollupData.accounts.map((account) => {
                      const storeInitial = account.storeUrl
                        .replace(/^https?:\/\//, "")
                        .charAt(0)
                        .toUpperCase();
                      const shortUrl =
                        account.storeUrl.length > 30
                          ? account.storeUrl.substring(0, 30) + "..."
                          : account.storeUrl;

                      return (
                        <TableRow key={account.accountId}>
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {storeInitial}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {account.storeUrl
                                    .replace(/^https?:\/\//, "")
                                    .split(".")[0]
                                    .charAt(0)
                                    .toUpperCase() +
                                    account.storeUrl
                                      .replace(/^https?:\/\//, "")
                                      .split(".")[0]
                                      .slice(1)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {shortUrl}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${getStatusBadgeClass(
                                "Active"
                              )}`}
                            >
                              Active
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {account.orders || 0}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            ${account.avgOrderValue?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            ${account.revenue?.toLocaleString() || "0"}
                          </TableCell>
                          <TableCell className="pr-6">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No stores found
                </div>
              )}
            </div>
              </>
            ) : accountId ? (
              <Card className=" border border-yellow-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Account is disconnected. Please reconnect to view the overview.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={selectedProductId !== null} onOpenChange={(open) => !open && setSelectedProductId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View detailed information about this product
            </DialogDescription>
          </DialogHeader>
          {isLoadingProductDetail ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : productDetailData?.product ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Product Name</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {productDetailData.product.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Product ID</p>
                  <p className="text-base text-gray-900 mt-1">
                    {productDetailData.product.productId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">SKU</p>
                  <p className="text-base text-gray-900 mt-1">
                    {productDetailData.product.sku || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    ${productDetailData.product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stock Quantity</p>
                  <p className="text-base text-gray-900 mt-1">
                    {productDetailData.product.stockQty || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-md ${
                      productDetailData.product.status === "publish"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {productDetailData.product.status || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Failed to load product details
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={selectedOrderId !== null} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about this order
            </DialogDescription>
          </DialogHeader>
          {isLoadingOrderDetail ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : orderDetailData?.order ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    #{orderDetailData.order.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className="inline-block mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${getStatusBadgeClass(
                        orderDetailData.order.status
                      )}`}
                    >
                      {orderDetailData.order.status}
                    </span>
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {orderDetailData.order.currency}{" "}
                    {orderDetailData.order.totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-base text-gray-900 mt-1">
                    {format(
                      new Date(orderDetailData.order.createdAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
              </div>

              {orderDetailData.order.items && orderDetailData.order.items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetailData.order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {item.productId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {item.sku || "N/A"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-gray-900">
                            {orderDetailData.order.currency}{" "}
                            {item.total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Failed to load order details
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WooCommerceDetailPage;
