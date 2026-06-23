import { useState } from "react";
import { ReportBuilderLayout } from "./ReportBuilderLayout";
import { ReportResultTable } from "./ReportResultTable";
import { useRunGaqlQuery } from "../../hooks/useCampaignManagement";

interface GoogleAdsReportsPageProps {
  clientId: number;
}

export function GoogleAdsReportsPage({ clientId }: GoogleAdsReportsPageProps) {
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const runMutation = useRunGaqlQuery(clientId);

  const handleRunReport = (query: string) => {
    setCurrentQuery(query);
    runMutation.mutate(query);
  };

  return (
    <ReportBuilderLayout onRunReport={handleRunReport} isRunning={runMutation.isPending}>
      {currentQuery ? (
        <ReportResultTable 
          data={runMutation.data} 
          isLoading={runMutation.isPending} 
          isError={runMutation.isError} 
          error={runMutation.error} 
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-slate-50 border-t border-slate-200">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-medium text-slate-800 mb-2">Build your custom report</h3>
            <p className="text-sm text-slate-500">
              Select metrics, dimensions, and segments from the left sidebar, then click "Run Report" to view your data.
            </p>
          </div>
        </div>
      )}
    </ReportBuilderLayout>
  );
}
