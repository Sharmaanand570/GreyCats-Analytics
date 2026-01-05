import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMetaBusinessCallback } from "@/features/meta/hooks/useMetaBusinessData";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function MetaBusinessCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);
  const { mutateAsync: handleCallback } = useMetaBusinessCallback();

  useEffect(() => {
    const processCallback = async () => {
      const status = searchParams.get("status");
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      // Handle error callback
      if (status === "error") {
        const errorMsg = "Failed to connect Meta Business. Please try again.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // Handle successful OAuth callback
      if (!code || !state) {
        toast.error("Missing OAuth parameters. Please try connecting again.");
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      try {
        const response = await handleCallback({ code, state });

        if (response.success) {
          const storedClientId = localStorage.getItem('pending_oauth_client_id');
          const storedIntegration = localStorage.getItem('pending_oauth_integration');

          if (storedClientId && storedIntegration) {
            setClientId(parseInt(storedClientId));
            setIntegrationType(storedIntegration as IntegrationType);
            setIsProcessing(false);
            setShowAccountModal(true);
          } else {
            setIsProcessing(false);
            setShowSuccessDialog(true);
            toast.success("Successfully connected to Meta Business!");
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to complete Meta Business connection";
        toast.error(errorMessage);
        setIsProcessing(false);
        // Redirect to data sources page after error
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  const handleAccountSelectionSuccess = () => {
    setShowAccountModal(false);
    setShowSuccessDialog(true);

    // Cleanup storage now
    localStorage.removeItem('pending_oauth_client_id');
    localStorage.removeItem('pending_oauth_integration');
  };

  const handleAccountSelectionCancel = () => {
    setShowAccountModal(false);
    toast.info("Account connection cancelled");
    // Cleanup storage
    localStorage.removeItem('pending_oauth_client_id');
    localStorage.removeItem('pending_oauth_integration');
    handleContinue();
  };

  const handleContinue = () => {
    if (clientId) {
      navigate(`/clients/${clientId}`);
    } else {
      navigate('/data-sources/meta-business');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      {!showAccountModal && !showSuccessDialog && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {errorMessage ? "Connection Failed" : "Connecting Meta Business"}
            </CardTitle>
            <CardDescription>
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
                  <span className="text-sm">Processing OAuth callback...</span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : errorMessage ? (
              <div className="space-y-3">
                <div className="text-sm text-destructive font-medium">
                  {errorMessage}
                </div>
                <div className="text-sm text-muted-foreground">
                  Redirecting to data sources...
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Connection process completed.
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
          onCancel={handleAccountSelectionCancel}
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

export default MetaBusinessCallbackHandler;
