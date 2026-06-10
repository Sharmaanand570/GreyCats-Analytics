import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useYouTubeCallback } from "@/features/YouTube/hooks/useYouTubeCallback";
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
import { showConnectionResultToast } from "@/utils/connectionToasts";

function YouTubeCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);
  const { mutateAsync: handleCallback } = useYouTubeCallback();

  useEffect(() => {
    const processCallback = async () => {
      const status = searchParams.get("status");
      const reason = searchParams.get("reason");
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const warning = searchParams.get("warning");
      console.log("[YouTube callback] params:", Object.fromEntries(searchParams.entries()));

      // Handle error callback (e.g., status=error&reason=oauth_save_failed)
      if (status === "error") {
        const errorMsg = reason
          ? `Connection failed: ${reason.replace(/_/g, " ")}`
          : "Failed to connect YouTube. Please try again.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // Handle successful OAuth callback
      // If status is "success", we assume the backend handled the exchange or it's a confirmation redirect.
      // If code & state are present, we process them.
      if (status === "success") {
        showConnectionResultToast({ warning });
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
        }
        return;
      }

      if (!code || !state) {
        const msg = "Missing OAuth parameters. Please try connecting again.";
        setErrorMessage(msg);
        toast.error(msg);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      try {
        const response = await handleCallback({ code, state });
        console.log("[YouTube callback] response:", response);

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
          }

          const successMessage = response.channel
            ? `Connected to ${response.channel.channelTitle}!`
            : "Account connected successfully!";
          showConnectionResultToast({
            warning: response.warning,
            successMessage,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to complete YouTube connection";
        setErrorMessage(errorMessage); // Fix: Set localized error state so UI updates
        toast.error(errorMessage);
        setIsProcessing(false);
        // Redirect to data sources page after error
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
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
      navigate('/data-sources/youtube');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      {!showAccountModal && !showSuccessDialog && (
        <Card className="w-full max-w-md bg-black/40 border-white/10 text-white">
          <CardHeader>
            <CardTitle>
              {errorMessage ? "Connection Failed" : "Connecting YouTube"}
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

export default YouTubeCallbackHandler;
