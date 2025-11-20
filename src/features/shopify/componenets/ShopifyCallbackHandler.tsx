import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopifyCallback } from "@/features/shopify/hooks/useShopifyConnect";

function ShopifyCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { mutateAsync: handleCallback } = useShopifyCallback();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const hmac = searchParams.get("hmac");
      const host = searchParams.get("host");
      const shop = searchParams.get("shop");
      const state = searchParams.get("state");
      const timestamp = searchParams.get("timestamp");

      if (!code || !hmac || !host || !shop || !state || !timestamp) {
        toast.error("Missing Shopify OAuth parameters. Please try again.");
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      try {
        const response = await handleCallback({
          code,
          hmac,
          host,
          shop,
          state,
          timestamp,
        });

        if (response.success) {
          toast.success(
            response.message ||
              `Shopify store ${response.shop ?? shop} connected successfully`
          );
          setTimeout(() => {
            navigate("/data-sources");
          }, 1500);
        } else {
          toast.error(response.message || "Failed to connect Shopify store");
          setTimeout(() => {
            navigate("/data-sources");
          }, 3000);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to complete Shopify connection";
        toast.error(errorMessage);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      <Card className="w-full max-w-md bg-black/40 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Finalizing Shopify Connection</CardTitle>
          <CardDescription className="text-zinc-300">
            Please wait while we complete the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3 text-sm text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Shopify authorization…</span>
          </div>
          <Skeleton className="h-10 w-full bg-white/5" />
          <Skeleton className="h-10 w-full bg-white/5" />
          {!isProcessing && (
            <p className="text-sm text-zinc-400">
              Redirecting you back to the data sources page…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ShopifyCallbackHandler;

