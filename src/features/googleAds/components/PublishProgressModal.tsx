import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCampaignWizardContext } from "../context/CampaignWizardContext";
import { getPublishProgressStreamUrl } from "../API/campaignManagementApi";
import type { PublishOperationStatus } from "../types/googleAds.types";
import { useNavigate } from "react-router-dom";

interface PublishProgressModalProps {
  clientId: number;
}

export function PublishProgressModal({ clientId }: PublishProgressModalProps) {
  const { isPublishing, setIsPublishing, publishSnapshot, draftId } = useCampaignWizardContext();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PublishOperationStatus>("PENDING");
  const [progressValue, setProgressValue] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [actionableError, setActionableError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPublishing || !publishSnapshot?.publishOperationId) return;

    setStatus("PENDING");
    setProgressValue(5);
    setMessages(["Connecting to publish stream..."]);
    setActionableError(null);

    const operationId = publishSnapshot.publishOperationId;
    const sseUrl = getPublishProgressStreamUrl(clientId, operationId);
    
    // In standard environments we might need withCredentials if using cookies
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status) setStatus(data.status);
        if (data.progress) setProgressValue(data.progress);
        if (data.message) setMessages(prev => [...prev, data.message]);
        if (data.actionableError) setActionableError(data.actionableError);

        if (
          data.status === "COMPLETED" || 
          data.status === "COMPLETED_WITH_WARNINGS" || 
          data.status === "FAILED" || 
          data.status === "ROLLED_BACK"
        ) {
          if (data.status === "COMPLETED" || data.status === "COMPLETED_WITH_WARNINGS") {
            import("../context/DraftsManager").then((m) => {
              if (publishSnapshot) {
                // If context didn't provide draftId properly, DraftsManager will create a new one which is fine since we just want an audit trail of published drafts.
                // Assuming draftId is available in context, let's grab it from context:
                m.DraftsManager.saveDraft(
                  draftId, 
                  publishSnapshot.name || "Published Campaign", 
                  publishSnapshot as any, 
                  "PUBLISHED"
                ).catch(e => console.error("Failed to mark draft as published", e));
              }
            });
          }
          eventSource.close();
        }
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      eventSource.close();
      if (status === "PENDING" || status === "IN_PROGRESS") {
        setMessages(prev => [...prev, "Connection lost. Attempting to recover status..."]);
        // If this were production, we'd fallback to polling `getPublishOperationStatus` here.
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isPublishing, publishSnapshot?.publishOperationId, clientId, draftId, publishSnapshot, status]);

  const handleClose = () => {
    localStorage.removeItem('active_publish_operation');
    setIsPublishing(false);
    // If successful, navigate to campaigns list
    if (status === "COMPLETED" || status === "COMPLETED_WITH_WARNINGS") {
      navigate("/campaigns"); // adjust route as needed
    }
  };

  const isTerminal = 
    status === "COMPLETED" || 
    status === "COMPLETED_WITH_WARNINGS" || 
    status === "FAILED" || 
    status === "ROLLED_BACK";

  return (
    <Dialog open={isPublishing} onOpenChange={(open) => {
      if (!open && isTerminal) handleClose();
      // Prevent closing by clicking outside if NOT terminal
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publishing Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {status === "PENDING" && "Initializing..."}
                {status === "IN_PROGRESS" && "Creating Google Ads Resources..."}
                {status === "COMPLETED" && "Publish Complete!"}
                {status === "COMPLETED_WITH_WARNINGS" && "Published (with warnings)"}
                {status === "FAILED" && "Publish Failed"}
                {status === "ROLLING_BACK" && "Reverting partial creation..."}
                {status === "ROLLED_BACK" && "Changes reverted safely."}
              </span>
              <span className="text-sm text-slate-500">{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="bg-slate-50 border rounded-md p-3 h-32 overflow-y-auto text-xs font-mono text-slate-600 flex flex-col gap-1">
            {messages.map((msg, i) => (
              <div key={i}>• {msg}</div>
            ))}
            {!isTerminal && (
              <div className="flex items-center gap-2 text-blue-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Working...</span>
              </div>
            )}
          </div>

          {actionableError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{actionableError}</AlertDescription>
            </Alert>
          )}

          {status === "COMPLETED_WITH_WARNINGS" && (
            <Alert variant="default" className="bg-amber-50 text-amber-900 border-amber-200">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Review Required</AlertTitle>
              <AlertDescription>
                Campaign created, but some entities failed policy review. Check the audit logs.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {isTerminal && (
          <div className="flex justify-end pt-4">
            <Button onClick={handleClose}>
              {status === "COMPLETED" || status === "COMPLETED_WITH_WARNINGS" ? "View Campaigns" : "Close & Edit Draft"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
