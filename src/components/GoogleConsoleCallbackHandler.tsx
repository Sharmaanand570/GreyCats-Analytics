import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function GoogleConsoleCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const processCallback = () => {
      const status = searchParams.get("status");
      const reason = searchParams.get("reason");

      // If status is error, handle error case
      if (status === "error") {
        const errorMessage = reason
          ? decodeURIComponent(reason)
          : "Google Console connection failed";

        toast.error(errorMessage);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // If status is success or not provided (assuming success)
      if (!status || status === "success") {
        // Invalidate queries to refetch after successful connection
        queryClient.invalidateQueries({ queryKey: ["google-console", "connect"] });

        toast.success("Successfully connected to Google Console!");
        setIsProcessing(false);
        // Redirect to data sources page after a short delay
        setTimeout(() => {
          setTimeout(() => {
            const storedClientId = localStorage.getItem('pending_oauth_client_id');
            if (storedClientId) {
              navigate(`/clients/${storedClientId}`);
            } else {
              navigate('/data-sources');
            }
          }, 1500);
        }, 1500);
      } else {
        // Unknown status
        toast.error("Unknown connection status. Please try again.");
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, queryClient]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connecting Google Console</CardTitle>
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

export default GoogleConsoleCallbackHandler;

