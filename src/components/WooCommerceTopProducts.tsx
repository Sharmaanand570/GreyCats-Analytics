import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Link } from "react-router-dom";

type Product = {
  productId: string;
  name: string;
  revenue: number;
  qty: number;
};

type WooCommerceTopProductsProps = {
  products?: Product[];
  isLoading?: boolean;
};

export function WooCommerceTopProducts({
  products = [],
  isLoading = false,
}: WooCommerceTopProductsProps) {
  // Calculate max revenue for progress bar scaling
  const maxRevenue = products.length > 0
    ? Math.max(...products.map((p) => p.revenue))
    : 1;

  if (isLoading) {
    return (
      <Card className=" border rounded-2xl">
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure we have at least 3 placeholder products
  const displayProducts = products.length > 0
    ? [...products, ...Array(Math.max(0, 3 - products.length)).fill(null)]
    : Array(3).fill(null);

  return (
    <Card className=" border rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Top Performing Products</CardTitle>
          {products.length > 0 && (
            <Link
              to="#"
              className="text-sm font-medium"
              style={{ color: "#96588A" }}
            >
              View All
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProducts.slice(0, 3).map((product, index) => {
            const rank = index + 1;
            const hasData = product !== null;

            return (
              <div key={product?.productId || `placeholder-${index}`} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        #{rank}
                      </span>
                      <span
                        className={`text-sm ${hasData ? "text-gray-900 font-medium" : "text-gray-400"
                          }`}
                      >
                        {hasData ? product.name : "Product Placeholder"}
                      </span>
                    </div>
                    <p
                      className={`text-xs ${hasData ? "text-gray-600" : "text-gray-400"
                        }`}
                    >
                      {hasData
                        ? `${product.qty} Unit(s) Sold`
                        : "0 Units Sold"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasData && product.revenue > 0 && (
                      <div
                        className="h-2 w-16 rounded-full"
                        style={{
                          backgroundColor: "#96588A",
                          opacity: product.revenue / maxRevenue,
                        }}
                      />
                    )}
                    <span
                      className={`text-sm font-semibold ${hasData && product.revenue > 0
                          ? "text-gray-900"
                          : "text-gray-400"
                        }`}
                    >
                      {hasData && product.revenue > 0
                        ? `₹${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "₹0.00"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

