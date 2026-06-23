import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, EyeOff, HelpCircle, XCircle } from "lucide-react";
import type { ConversionTrackingStatus } from "../../types/googleAds.types";

export function ConversionTrackingStatusBadge({ status }: { status: ConversionTrackingStatus }) {
  switch (status) {
    case "TRACKING":
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 gap-1 font-normal">
          <CheckCircle2 className="w-3 h-3" />
          Recording conversions
        </Badge>
      );
    case "NO_RECENT_CONVERSIONS":
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 gap-1 font-normal">
          <Clock className="w-3 h-3" />
          No recent conversions
        </Badge>
      );
    case "UNVERIFIED":
      return (
        <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 gap-1 font-normal">
          <AlertCircle className="w-3 h-3" />
          Unverified
        </Badge>
      );
    case "HIDDEN":
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 gap-1 font-normal">
          <EyeOff className="w-3 h-3" />
          Hidden
        </Badge>
      );
    case "REMOVED":
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 gap-1 font-normal">
          <XCircle className="w-3 h-3" />
          Removed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-slate-500 gap-1 font-normal">
          <HelpCircle className="w-3 h-3" />
          Unknown
        </Badge>
      );
  }
}
