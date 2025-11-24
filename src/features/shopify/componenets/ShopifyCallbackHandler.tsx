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

export default function ShopifyCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const status = searchParams.get("status");
    const shop = searchParams.get("shop");
    const reason = searchParams.get("reason");

    console.log("📥 Shopify Callback Params:", { status, shop, reason });

    if (status === "success" && shop) {
      toast.success(`Shopify store ${shop} connected successfully`);
      setIsProcessing(false);
      setTimeout(() => {
        navigate("/data-sources");
      }, 1500);
      return;
    }

    toast.error(reason || "Failed to connect Shopify");
    setIsProcessing(false);
    setTimeout(() => {
      navigate("/data-sources");
    }, 3000);
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connecting Shopify</CardTitle>
          <CardDescription>
            Please wait while we complete the connection...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing OAuth callback...</span>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Connection process completed. Redirecting...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
