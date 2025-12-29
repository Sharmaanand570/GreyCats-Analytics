import { useMemo, useState } from "react";
import { format } from "date-fns";
import { SiShopify } from "react-icons/si";
import { FiSearch, FiBell } from "react-icons/fi";
import { RefreshCw, Trash2, Power, Loader2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ShopifyKPICards } from "@/components/ShopifyKPICards";
import { ShopifyRevenueChart } from "@/components/ShopifyRevenueChart";
import type { ShopifyRevenuePoint } from "@/components/ShopifyRevenueChart";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useShopifyDelete,
  useShopifyOrder,
  useShopifyOrdersList,
  useShopifyProduct,
  useShopifyProductsList,
  useShopifySyncProducts,
  // New client-specific hooks
  useShopifySummary,
  useShopifyTrends,
} from "@/features/shopify/hooks/useShopify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import { useClients, useClient } from "@/hooks/useClients";
import { useRemoveAccount } from "@/hooks/useIntegrations";

function ShopifyDetailPage() {
  // Get clients and auto-select first client (matching WooCommerce pattern)
  const { data: clientsData } = useClients();
  const clients = clientsData || [];
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Auto-select first client
  if (clients.length > 0 && !selectedClientId) {
    setSelectedClientId(clients[0].id);
  }

  // Use the selected client ID, or the first client's ID if available, otherwise null
  const clientId = selectedClientId || (clients.length > 0 ? clients[0].id : null);

  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsSearch, setProductsSearch] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const productsParams = useMemo(
    () => ({
      page: productsPage,
      limit: 10,
      search: productsSearch || undefined,
      sortBy: "updatedAt",
      sortOrder: "desc" as const,
    }),
    [productsPage, productsSearch]
  );

  const ordersParams = useMemo(
    () => ({
      page: ordersPage,
      limit: 10,
      sortBy: "totalPrice",
      sortOrder: "desc" as const,
      financialStatus: ordersStatus || undefined,
    }),
    [ordersPage, ordersStatus]
  );

  // Use new client-specific summary hook (only when clientId is available)
  const {
    data: summaryData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useShopifySummary(clientId || 0);

  // Use new client-specific trends hook (only when clientId is available)
  const {
    data: trendsData,
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useShopifyTrends(clientId || 0);

  // Use new client-specific products hook
  // const {
  //   data: productsDataNew,
  //   isLoading: isLoadingProductsNew,
  //   error: productsErrorNew,
  // } = useShopifySimpleProducts(clientId, 10);

  // Keep old products list hook for pagination
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useShopifyProductsList(clientId || 0, productsParams);

  // Use new client-specific orders hook
  // const {
  //   data: ordersDataNew,
  //   isLoading: isLoadingOrdersNew,
  //   error: ordersErrorNew,
  // } = useShopifySimpleOrders(clientId || 0, 10);

  // Keep old orders list hook for pagination
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useShopifyOrdersList(clientId || 0, ordersParams);

  const { data: productDetailData, isLoading: isLoadingProductDetail } =
    useShopifyProduct(clientId || 0, selectedProductId);

  const { data: orderDetailData, isLoading: isLoadingOrderDetail } = useShopifyOrder(clientId || 0, selectedOrderId);
  const { mutateAsync: syncProducts, isPending: isSyncing } = useShopifySyncProducts();
  const { mutateAsync: deleteShopify, isPending: isDeleting } = useShopifyDelete();

  const removeAccount = useRemoveAccount();

  // Find the Shopify integration to get the accountId
  // We need to look up the integration for the current client
  const { data: client } = useClient(clientId || 0);
  const activeIntegration = client?.integrations?.find(
    (i) => i.integrationType === "shopify"
  );

  const handleDisconnect = async () => {
    if (!clientId || !activeIntegration) return;

    try {
      await removeAccount.mutateAsync({
        clientId,
        integrationType: 'shopify',
        accountId: activeIntegration.accountId
      });
    } catch (error) {
      // handled in hook
    }
  };


  const revenueChartData: ShopifyRevenuePoint[] = useMemo(() => {
    if (!trendsData?.trends) return [];

    return trendsData.trends.map((trend) => ({
      label: format(new Date(trend.date), "MMM dd"),
      revenue: trend.revenue,
    }));
  }, [trendsData]);

  const handleProductsSearch = (value: string) => {
    setProductsSearch(value);
    setProductsPage(1);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5">
            <div className="flex items-center gap-3">
              <SiShopify className="text-2xl" style={{ color: "#96BF48" }} />
              <span className="font-medium text-xl">Shopify Overview</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative">
                <FiBell className="text-xl text-gray-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <DataSyncBanner compact={true} />
            </div>
          </div>

          <div className="w-full px-5 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink to="/data-sources">
                    Data Sources
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Shopify</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="w-full px-5 py-6 space-y-6">
            {!isLoadingAnalytics && !summaryData?.summary && <DataSyncBanner />}
            <Card className=" border rounded-2xl">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Connection Controls</CardTitle>
                  <CardDescription>
                    Manage syncs and disconnection actions
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncProducts(clientId || 0)}
                    disabled={isSyncing}
                    className="gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Manual Sync
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={removeAccount.isPending}
                    className="gap-2"
                  >
                    {removeAccount.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Disconnect
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteShopify(clientId || 0)}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {analyticsError && (
              <Card className=" border border-destructive/30 rounded-2xl">
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
            {revenueError && (
              <Card className=" border border-destructive/30 rounded-2xl">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">
                    Failed to load revenue trend:{" "}
                    {revenueError instanceof Error
                      ? revenueError.message
                      : "Unknown error"}
                  </p>
                </CardContent>
              </Card>
            )}
            {productsError && (
              <Card className=" border border-destructive/30 rounded-2xl">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">
                    Failed to load products:{" "}
                    {productsError instanceof Error
                      ? productsError.message
                      : "Unknown error"}
                  </p>
                </CardContent>
              </Card>
            )}
            {ordersError && (
              <Card className=" border border-destructive/30 rounded-2xl">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">
                    Failed to load orders:{" "}
                    {ordersError instanceof Error
                      ? ordersError.message
                      : "Unknown error"}
                  </p>
                </CardContent>
              </Card>
            )}

            <ShopifyKPICards
              totalRevenue={summaryData?.summary.totalRevenue}
              totalOrders={summaryData?.summary.totalOrders}
              avgOrderValue={summaryData?.summary.averageOrderValue}
              statusBreakdown={undefined}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ShopifyRevenueChart
                data={revenueChartData}
                isLoading={isLoadingRevenue}
              />
              <Card className=" border rounded-2xl">
                <CardHeader>
                  <CardTitle>Order Status Snapshot</CardTitle>
                  <CardDescription>
                    Financial status distribution for current orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalytics ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : summaryData?.summary ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${summaryData.summary.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Orders</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {summaryData.summary.totalOrders}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fulfilled Orders</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {summaryData.summary.fulfilledOrders}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No analytics data</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className=" border rounded-2xl overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Products</h3>
                      {productsData && (
                        <p className="text-sm text-gray-500 mt-1">
                          Showing {productsData.products.length} of{" "}
                          {productsData.total} products
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search products"
                          value={productsSearch}
                          onChange={(event) =>
                            handleProductsSearch(event.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                      {productsSearch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleProductsSearch("")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {isLoadingProducts ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : productsData?.products &&
                  productsData.products.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Product</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Inventory</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead className="pr-6" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsData.products.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                  {product.title}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ID: {product.productId}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {product.vendor || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              ${product.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {product.inventoryCount}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {format(
                                new Date(product.updatedAt),
                                "MMM dd, yyyy"
                              )}
                            </TableCell>
                            <TableCell className="pr-6">
                              <button
                                onClick={() =>
                                  setSelectedProductId(product.productId)
                                }
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
                    {productsData.totalPages > 1 && (
                      <div className="p-4 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Page {productsData.page} of {productsData.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={productsPage === 1}
                            onClick={() =>
                              setProductsPage((prev) => Math.max(1, prev - 1))
                            }
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={productsPage >= productsData.totalPages}
                            onClick={() => setProductsPage((prev) => prev + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No products found
                  </div>
                )}
              </Card>

              <Card className=" border rounded-2xl overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Orders</h3>
                      {ordersData && (
                        <p className="text-sm text-gray-500 mt-1">
                          Showing {ordersData.orders.length} of{" "}
                          {ordersData.total} orders
                        </p>
                      )}
                    </div>
                    <Select
                      value={ordersStatus}
                      onValueChange={(value) => {
                        setOrdersStatus(value === "all" ? "" : value);
                        setOrdersPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Financial Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {isLoadingOrders ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : ordersData?.orders && ordersData.orders.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Order</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Financial Status</TableHead>
                          <TableHead>Fulfillment</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="pr-6" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordersData.orders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                  #{order.orderId}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {order.currency}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {order.currency}{" "}
                              {order.totalPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(
                                  order.financialStatus
                                )}`}
                              >
                                {order.financialStatus}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 capitalize">
                              {order.fulfillmentStatus || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {format(
                                new Date(order.createdAtISO),
                                "MMM dd, yyyy"
                              )}
                            </TableCell>
                            <TableCell className="pr-6">
                              <button
                                onClick={() =>
                                  setSelectedOrderId(order.orderId)
                                }
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
                            disabled={ordersPage === 1}
                            onClick={() =>
                              setOrdersPage((prev) => Math.max(1, prev - 1))
                            }
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={ordersPage >= ordersData.totalPages}
                            onClick={() => setOrdersPage((prev) => prev + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No orders found
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>



      <Dialog
        open={selectedProductId !== null}
        onOpenChange={(open) => !open && setSelectedProductId(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Shopify product metadata from the last sync
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Title</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {productDetailData.product.title}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Product ID</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {productDetailData.product.productId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Vendor</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {productDetailData.product.vendor || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Inventory</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {productDetailData.product.inventoryCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    ${productDetailData.product.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span
                    className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(
                      productDetailData.product.status
                    )}`}
                  >
                    {productDetailData.product.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Product details unavailable
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedOrderId !== null}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Financial breakdown and timeline for this order
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    #{orderDetailData.order.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Financial Status</p>
                  <span
                    className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(
                      orderDetailData.order.financialStatus
                    )}`}
                  >
                    {orderDetailData.order.financialStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Total Price</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {orderDetailData.order.currency}{" "}
                    {orderDetailData.order.totalPrice.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Tax</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {orderDetailData.order.currency}{" "}
                    {orderDetailData.order.totalTax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {format(
                      new Date(orderDetailData.order.createdAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Updated At</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {format(
                      new Date(orderDetailData.order.updatedAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Order details unavailable
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ShopifyDetailPage;
