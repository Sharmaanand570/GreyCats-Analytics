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
      <Card className="rounded-[28px] border-zinc-100 shadow-sm transition-all duration-300">
        <CardHeader className="py-6 px-8 border-b border-zinc-50">
           <CardTitle className="text-xl font-black text-zinc-900 tracking-tight uppercase">Top Sellers</CardTitle>
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Product performance</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-50 animate-pulse rounded-2xl" />
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
    <Card className="rounded-[28px] border-zinc-100 shadow-sm transition-all duration-500 hover:border-zinc-200 bg-white">
      <CardHeader className="py-6 px-8 border-b border-zinc-50 flex flex-row items-center justify-between">
        <div>
           <CardTitle className="text-xl font-black text-zinc-900 tracking-tight uppercase">Top Sellers</CardTitle>
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Product performance</p>
        </div>
        {products.length > 0 && (
          <Link
            to="#"
            className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
          >
            View All
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          {displayProducts.slice(0, 3).map((product, index) => {
            const rank = index + 1;
            const hasData = product !== null;

            return (
              <div key={product?.productId || `placeholder-${index}`} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-black text-zinc-900 bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center">
                        {rank}
                      </span>
                      <span
                        className={`text-sm font-bold tracking-tight ${hasData ? "text-zinc-900" : "text-zinc-300"
                          }`}
                      >
                        {hasData ? product.name : "Incoming Data..."}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ml-9 ${hasData ? "text-zinc-400" : "text-zinc-200"
                        }`}
                    >
                      {hasData
                        ? `${product.qty} Units Shipped`
                        : "Preparing statistics"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-black tracking-tight ${hasData && product.revenue > 0
                          ? "text-zinc-900"
                          : "text-zinc-300"
                        }`}
                    >
                      {hasData && product.revenue > 0
                        ? `₹${product.revenue.toLocaleString()}`
                        : "₹0"}
                    </span>
                  </div>
                </div>
                {hasData && (
                  <div className="ml-9 h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-zinc-900 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                     />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


