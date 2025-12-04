import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useYouTubeCallback } from "@/features/YouTube/hooks/useYouTubeCallback";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function YouTubeCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: handleCallback } = useYouTubeCallback();

  useEffect(() => {
    const processCallback = async () => {
      const status = searchParams.get("status");
      const reason = searchParams.get("reason");
      const code = searchParams.get("code");
      const state = searchParams.get("state");

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
        console.log("response", response);

        if (response.success && response.channel) {
          toast.success(
            `Successfully connected to ${response.channel.title}!`
          );
          // Redirect to YouTube detail page after a short delay
          setTimeout(() => {
            navigate("/data-sources/youtube");
          }, 1500);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to complete YouTube connection";
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {errorMessage ? "Connection Failed" : "Connecting YouTube"}
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
              Connection process completed. Redirecting...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default YouTubeCallbackHandler;

