import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleCallback } from "@/features/YouTube/hooks/google/useGoogleConnect";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function GoogleCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { mutateAsync: handleCallback } = useGoogleCallback();
  console.log(searchParams);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

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
          toast.success(
            response.message || "Successfully connected to Google!"
          );
          // Redirect to data sources page after a short delay
          setTimeout(() => {
            navigate("/data-sources");
          }, 1500);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to complete Google connection";
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
          <CardTitle>Connecting Google</CardTitle>
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

export default GoogleCallbackHandler;


