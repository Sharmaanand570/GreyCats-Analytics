  // @ts-expect-error unused variable
import { useState } from "react";
import { Building2 } from "lucide-react";
import { useCustomerHierarchy } from "../../hooks/useCampaignManagement";
import { AccountHierarchyTree } from "./AccountHierarchyTree";
import { MCCOverviewDashboard } from "./MCCOverviewDashboard";
import { ErrorState, TableSkeletonRows } from "../ui/GoogleAdsShared";
  // @ts-expect-error unused variable
import type { GoogleAdsAccount } from "../../types/googleAds.types";
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";

interface MCCHierarchyPageProps {
  clientId: number;
  onSelectClient: (clientId: number) => void;
}

export function MCCHierarchyPage({ clientId, onSelectClient }: MCCHierarchyPageProps) {
  const { data, isLoading, isError, error } = useCustomerHierarchy(clientId);

  if (isError) {
    return (
      <div className="h-full bg-white p-6">
        <ErrorState message={error?.message ?? "Failed to load hierarchy"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full bg-white">
        <div className="w-[300px] border-r border-slate-200 p-4">
          <Table>
            <TableHeader><TableRow><TableHead>Loading hierarchy...</TableHead></TableRow></TableHeader>
            <TableBody><TableSkeletonRows columns={1} rows={10} /></TableBody>
          </Table>
        </div>
        <div className="flex-1 p-6">
          <Table>
            <TableHeader><TableRow><TableHead>Loading overview...</TableHead></TableRow></TableHeader>
            <TableBody><TableSkeletonRows columns={4} rows={4} /></TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!data?.hierarchy) {
    return null;
  }

  return (
    <div className="flex h-full bg-white border-t border-slate-200">
      <div className="w-[320px] border-r border-slate-200 flex flex-col h-full bg-slate-50 shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Account Hierarchy
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <AccountHierarchyTree 
            account={data.hierarchy} 
            selectedId={clientId}
            onSelect={(account) => {
              if (account.id !== clientId) {
                onSelectClient(account.id);
              }
            }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-slate-50/50">
        <MCCOverviewDashboard 
          hierarchy={data.hierarchy} 
          onAccountSelect={(account) => {
            if (account.id !== clientId) {
              onSelectClient(account.id);
            }
          }}
        />
      </div>
    </div>
  );
}
