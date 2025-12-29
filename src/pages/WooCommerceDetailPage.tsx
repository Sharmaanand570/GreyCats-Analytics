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
  useWooCommerceSyncStatus,
  useWooCommerceSyncProducts,
  useWooCommerceSyncOrders,
  useWooCommerceAccounts,
  useWooCommerceProducts,
  useWooCommerceProduct,
  useWooCommerceOrders,
  useWooCommerceOrder,
  useWooCommerceTrends,
  useWooCommerceAccountInfo,
} from "@/features/woocommerce/hooks/useWooCommerce";
import { useRemoveAccount } from "@/hooks/useIntegrations";
import { useClients } from "@/hooks/useClients";
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
import { MoreVertical, ExternalLink, RefreshCw, Loader2, PowerOff, Eye } from "lucide-react";
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
import { DataSyncBanner } from "@/components/DataSyncBanner";

const WooCommerceDetailPage = () => {
  // Get clients list and auto-select first client (matching pattern from MetaDetailPage, GoogleAnalyticsDetailPage)
  const { data: clientsData } = useClients();
  const clients = clientsData || [];

  // State management
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [productsSearch, setProductsSearch] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Pagination state (for future use)
  const perProductPage = 1;
  const perProductLimit = 10;

  // Auto-select first client (matching pattern from MetaDetailPage - NOT in useEffect!)
  console.log('DEBUG: clients =', clients, 'selectedClientId =', selectedClientId);
  if (clients.length > 0 && !selectedClientId) {
    console.log('DEBUG: Auto-selecting client:', clients[0]);
    setSelectedClientId(clients[0].id);
  }

  const { data: accountsData, error: accountsError, isLoading: isLoadingAccounts } = useWooCommerceAccounts();
  console.log(accountsData);

  // Mutations
  const { mutateAsync: syncProducts, isPending: isSyncingProducts } =
    useWooCommerceSyncProducts();
  const { mutateAsync: syncOrders, isPending: isSyncingOrders } =
    useWooCommerceSyncOrders();

  const removeAccount = useRemoveAccount();

  // Derive account info from accountsData instead of making a separate API call
  // Fetch detailed account info including currency, version etc
  const {
    data: accountInfoResponse,
    isLoading: isLoadingAccountInfo
  } = useWooCommerceAccountInfo(1, accountId); // Defaulting clientId to 1 until route params are fixed

  const accountInfo = accountInfoResponse?.success ? accountInfoResponse : null;

  const { data: syncStatus, isLoading: isLoadingSyncStatus } =
    useWooCommerceSyncStatus(1, accountId);

  // Fetch analytics data
  const {
    data: analyticsData,
    error: analyticsError,
  } = useWooCommerceAnalytics(selectedClientId || 0); // Use selected client

  // Fetch per-product analytics data (for top products with revenue) - using paginated version
  const {
    data: productsAnalyticsData,
    isLoading: isLoadingProductsAnalytics,
    error: productsAnalyticsError,
  } = useWooCommercePerProductPaginated(
    1,
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
  } = useWooCommerceOrders(selectedClientId || 0); // Use selected client

  // Fetch single product detail
  const {
    data: productDetailData,
    isLoading: isLoadingProductDetail,
  } = useWooCommerceProduct(1, selectedProductId ?? '', accountId ?? 0);

  // Fetch single order detail
  const {
    data: orderDetailData,
    isLoading: isLoadingOrderDetail,
  } = useWooCommerceOrder(1, selectedOrderId, accountId);

  // Fetch products catalog
  const {
    data: productsCatalogData,
    isLoading: isLoadingProductsCatalog,
    error: productsCatalogError,
  } = useWooCommerceProducts(selectedClientId || 0); // Use selected client

  // Fetch agency rollup data for stores table
  const {
    data: rollupData,
    isLoading: isLoadingRollup,
    error: rollupError,
  } = useWooCommerceAgencyRollup(1);

  // Calculate active stores count from rollup data
  const activeStoresCount = rollupData?.accounts?.filter(acc => acc.revenue > 0 || acc.orders > 0).length || rollupData?.accounts?.length || 0;

  // Use sync status for sync timestamps
  const lastProductsSync = syncStatus?.sync?.lastProductsSync;
  const lastOrdersSync = syncStatus?.sync?.lastOrdersSync;

  // Fetch trends data for revenue chart
  const {
    data: trendsData,
    isLoading: isLoadingTrends,
  } = useWooCommerceTrends(selectedClientId || 0); // Use selected client

  // Transform trends data for chart
  const revenueChartData = trendsData?.trends?.map((trend) => ({
    day: new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' }),
    revenue: trend.revenue,
  })) || [];

  // Set default account only if accountId is null (preserve user selection)
  useEffect(() => {
    if (accountId === null && accountsData && accountsData.length > 0) {
      // Get the first active account, or the first account if none are active
      const activeAccount = accountsData.find((acc: any) => acc.original?.isActive);
      const selectedAccount = activeAccount || accountsData[0];
      setAccountId(selectedAccount.id as number);
    }
  }, [accountsData, accountId]);

  const handleAccountChange = (value: string) => {
    const newAccountId = parseInt(value, 10);
    if (!isNaN(newAccountId)) {
      setAccountId(newAccountId);
      // Reset search when switching accounts
      setProductsSearch("");
    }
  };

  const handleProductsSearchChange = (value: string) => {
    setProductsSearch(value);
  };

  const handleClearProductsSearch = () => {
    setProductsSearch("");
  };

  const handleSyncProducts = async () => {
    if (!accountId) return;
    try {
      await syncProducts();
    } catch (error) {
      // Error is handled in the hook with toast
    }
  };

  const handleSyncOrders = async () => {
    if (!accountId) return;
    try {
      await syncOrders();
    } catch (error) {
      // Error is handled in the hook with toast
    }
  };

  const handleDisconnect = async () => {
    if (!accountId || !selectedClientId) return;
    try {
      await removeAccount.mutateAsync({
        clientId: selectedClientId,
        integrationType: 'woocommerce',
        accountId: accountId
      });
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
  if (accountsData && accountsData.length === 0) {
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
              <DataSyncBanner compact={true} />
              {/* Account Selector */}
              {accountsData && accountsData.length > 0 && (
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
                      {accountsData.map((account) => {
                        const displayUrl = account.name || "Unknown Store";
                        const statusText = account.original?.isActive ? " (Active)" : " (Inactive)";
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
            {/* Show banner if no analytics data found (likely specific to selected client) */}

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
                      {accountInfo?.account?.isActive && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDisconnect}
                          disabled={removeAccount.isPending}
                        >
                          {removeAccount.isPending ? (
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
                              className={`px-2 py-1 text-xs font-medium rounded-md ${accountInfo?.account?.isActive
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

            {/* Overview sections */}
            {accountId && (
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
                    analyticsData?.summary?.totalRevenue ||
                    rollupData?.totals?.totalRevenue ||
                    0
                  }
                  totalOrders={
                    analyticsData?.summary?.totalOrders ||
                    rollupData?.totals?.totalOrders ||
                    0
                  }
                  avgOrderValue={
                    analyticsData?.summary?.averageOrderValue ||
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
                      isLoading={isLoadingTrends}
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
                              productId: p.id.toString(),
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
                                Showing {productsCatalogData.products.length} products
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
                                <TableRow key={product.id}>
                                  <TableCell className="pl-6">
                                    <div className="flex flex-col">
                                      <p className="text-sm font-medium text-gray-900">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        ID: {product.id}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {product.sku || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    ${parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {product.stockQuantity || 0}
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${product.stockStatus === "instock"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                      {product.stockStatus || "N/A"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="pr-6">
                                    <button
                                      onClick={() => setSelectedProductId(product.id.toString())}
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
                              Showing {ordersData.orders.length} orders
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
                                        #{order.orderNumber}
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
                                    {order.currency} {parseFloat(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {order.currency}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {format(new Date(order.dateCreated), "MMM dd, yyyy HH:mm")}
                                  </TableCell>
                                  <TableCell className="pr-6">
                                    <button
                                      onClick={() => setSelectedOrderId(order.orderNumber)}
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
                            <TableRow key={account.id}>
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
            )}
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
                    {productDetailData.product.id}
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
                    ${parseFloat(productDetailData.product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stock Quantity</p>
                  <p className="text-base text-gray-900 mt-1">
                    {productDetailData.product.stockQuantity || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-md ${productDetailData.product.stockStatus === "instock"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {productDetailData.product.stockStatus || "N/A"}
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
                    #{orderDetailData.order.orderNumber}
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
                    {parseFloat(orderDetailData.order.total).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-base text-gray-900 mt-1">
                    {format(
                      new Date(orderDetailData.order.dateCreated),
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
                            {orderDetailData?.order?.currency}{" "}
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
