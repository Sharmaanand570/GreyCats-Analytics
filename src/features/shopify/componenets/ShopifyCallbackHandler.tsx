import { useEffect, useState, useRef } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ShopifyCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasRun = useRef(false);

  useEffect(() => {
    const status = searchParams.get("status");
    const shop = searchParams.get("shop");
    const reason = searchParams.get("reason");

    if (hasRun.current) return;
    hasRun.current = true;

    console.log("📥 Shopify Callback Params:", { status, shop, reason });

    const handleSuccess = async () => {
      if (!shop) return;

      try {
        const storedClientId = localStorage.getItem('pending_oauth_client_id');

        if (storedClientId) {
          setIsProcessing(true);
          // 1. Fetch available accounts to find the new connection's ID
          const { getAvailableAccounts, assignAccountToClient } = await import("@/api/integrationApi");
          const accounts = await getAvailableAccounts("shopify");

          // 2. Find the account matching the shop domain
          const targetAccount = accounts.find(acc =>
            acc.identifier === shop || acc.name === shop
          );

          if (targetAccount) {
            // 3. Assign to client
            try {
              await assignAccountToClient(parseInt(storedClientId), "shopify", targetAccount.id);
              toast.success(`Shopify store ${shop} connected and assigned to client successfully`);
            } catch (assignError) {
              console.warn("Assignment warning (might be already assigned):", assignError);
              // Do not fail the whole flow if assignment fails - backend might have done it
              toast.success(`Shopify store ${shop} connected successfully`);
            }
          } else {
            console.warn("Could not find new Shopify account to assign");
            toast.success(`Shopify store ${shop} connected (assignment pending - account not found)`);
          }
        } else {
          toast.success(`Shopify store ${shop} connected successfully`);
        }
      } catch (error) {
        console.error("Callback processing error:", error);
        // Even if frontend logic fails, the OAuth was likely successful on backend
        // So we show success but maybe with a warning, or just generic success.
        toast.info(`Connection process completed for ${shop}`);
      } finally {
        setIsProcessing(false);
        setShowSuccessDialog(true);
      }
    };

    if (status === "success" && shop) {
      handleSuccess();
      return;
    }

    const errorMsg = reason || "Failed to connect Shopify";
    setErrorMessage(errorMsg);
    toast.error(errorMsg);
    setIsProcessing(false);
    setTimeout(() => {
      navigate("/data-sources");
    }, 3000);
  }, [searchParams, navigate]);

  const handleContinue = () => {
    const storedClientId = localStorage.getItem('pending_oauth_client_id');
    // Clear storage after use
    if (storedClientId) {
      localStorage.removeItem('pending_oauth_client_id');
      navigate(`/clients/${storedClientId}`);
    } else {
      navigate('/data-sources');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      <Card className="w-full max-w-md bg-black/40 border-white/10 text-white">
        <CardHeader>
          <CardTitle>
            {errorMessage ? "Connection Failed" : "Connecting Shopify"}
          </CardTitle>
          <CardDescription className="text-zinc-300">
            {errorMessage
              ? "There was an issue completing the connection"
              : "Please wait while we complete the connection..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-zinc-300">Processing OAuth callback...</span>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full /5" />
                <Skeleton className="h-4 w-3/4 /5" />
              </div>
            </div>
          ) : errorMessage ? (
            <div className="space-y-3">
              <div className="text-sm text-red-400 font-medium">
                {errorMessage}
              </div>
              <div className="text-sm text-zinc-400">
                Redirecting to data sources...
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-400">
              {showSuccessDialog ? "Connection successful! Waiting for confirmation..." : "Connection process completed."}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={handleContinue}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connection Successful! 🎉</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your data source has been connected successfully.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-700 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing Data...
                </p>
                <p className="mt-1">
                  Please allow up to 5 minutes for your historical data to be fully fetched and processed.
                  You can start building reports, but some metrics might be processing.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleContinue}>
              Got it, continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
