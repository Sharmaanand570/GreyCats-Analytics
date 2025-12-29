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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AccountSelectionModal } from "@/components/clients/AccountSelectionModal";
import type { IntegrationType } from "@/types/client.types";

function MetaCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // Extract parameters from URL
      const status = searchParams.get("status");
      const userId = searchParams.get("userId");
      const reason = searchParams.get("reason");

      console.log("Full URL:", window.location.href);
      const params = Object.fromEntries(searchParams.entries());
      console.log("Search Params:", params);

      // Check for error status
      if (status === "error") {
        const errorMessage = reason
          ? `Meta connection failed: ${reason.replace(/_/g, ' ')}`
          : "Meta connection failed. Please try again.";

        toast.error(errorMessage);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // Check for success status (allow case-insensitive)
      if (status?.toLowerCase() === "success") {
        // ✅ AUTH SUCCESS
        const storedClientId = localStorage.getItem('pending_oauth_client_id');
        const storedIntegration = localStorage.getItem('pending_oauth_integration');

        if (storedClientId && storedIntegration) {
          setClientId(parseInt(storedClientId));
          setIntegrationType(storedIntegration as IntegrationType);
          setIsProcessing(false);
          setShowAccountModal(true);
        } else {
          // Fallback if context is lost
          setIsProcessing(false);
          setShowSuccessDialog(true);
        }
        return;
      }

      // If we fall through here, parameters are missing or invalid
      console.warn("Missing or invalid callback parameters", params);
      toast.error("Invalid callback parameters. Please try connecting again.");
      setIsProcessing(false);
      setTimeout(() => {
        navigate("/data-sources");
      }, 3000);
    };

    // Small delay to ensure URL is fully loaded
    const timeoutId = setTimeout(() => {
      processCallback();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchParams, navigate]);

  const handleAccountSelectionSuccess = () => {
    setShowAccountModal(false);
    setShowSuccessDialog(true);

    // Cleanup storage now
    localStorage.removeItem('pending_oauth_client_id');
    localStorage.removeItem('pending_oauth_integration');
  };

  const handleContinue = () => {
    if (clientId) {
      navigate(`/clients/${clientId}`);
    } else {
      navigate('/data-sources');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      {!showAccountModal && !showSuccessDialog && (
        <Card className="w-full max-w-md bg-black/40 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Connecting Meta</CardTitle>
            <CardDescription className="text-zinc-300">
              Please wait while we complete the authentication process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isProcessing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-zinc-300">
                    Processing OAuth callback...
                  </span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full /5" />
                  <Skeleton className="h-4 w-3/4 /5" />
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-400">
                Connection failed. Redirecting...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {clientId && integrationType && (
        <AccountSelectionModal
          open={showAccountModal}
          onOpenChange={setShowAccountModal}
          clientId={clientId}
          integration={integrationType}
          onSuccess={handleAccountSelectionSuccess}
        />
      )}

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

export default MetaCallbackHandler;
