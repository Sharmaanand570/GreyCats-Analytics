import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles, Trash2, Users } from "lucide-react";
import type { CustomAudience } from "@/features/meta/API/metaAdsManagerApi";

const TYPE_META: Record<
  CustomAudience["type"],
  { label: string; icon: React.ReactNode; pillClass: string; iconColor: string }
> = {
  CUSTOM: {
    label: "Customer List",
    icon: <Users className="w-5 h-5" />,
    pillClass: "bg-emerald-50 border-emerald-100 text-emerald-700",
    iconColor: "text-emerald-600",
  },
  WEBSITE: {
    label: "Website Traffic",
    icon: <Globe className="w-5 h-5" />,
    pillClass: "bg-blue-50 border-blue-100 text-blue-700",
    iconColor: "text-blue-600",
  },
  LOOKALIKE: {
    label: "Lookalike",
    icon: <Sparkles className="w-5 h-5" />,
    pillClass: "bg-violet-50 border-violet-100 text-violet-700",
    iconColor: "text-violet-600",
  },
};

const formatDate = (iso?: string) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

type Props = {
  audience: CustomAudience;
  onDelete: () => void;
};

export function AudienceCard({ audience, onDelete }: Props) {
  const meta = TYPE_META[audience.type];
  const created = formatDate(audience.createdAt);
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-start gap-4 hover:border-slate-200 transition-colors">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.pillClass.replace("text-", "").split(" ")[0]} ${meta.iconColor}`}
      >
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-slate-900 truncate">{audience.name}</h3>
          <Badge variant="outline" className={`rounded-full text-[10px] ${meta.pillClass}`}>
            {meta.label}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
          {audience.approxSize !== undefined && (
            <span>
              <span className="font-mono font-bold text-slate-700">
                {audience.approxSize.toLocaleString()}
              </span>{" "}
              people
            </span>
          )}
          {audience.retentionDays !== undefined && (
            <span>
              <span className="font-mono font-bold text-slate-700">
                {audience.retentionDays}d
              </span>{" "}
              retention
            </span>
          )}
          {created && <span>Created {created}</span>}
          <span className="font-mono text-[10px] text-slate-400 truncate">{audience.id}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
        title="Delete audience"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
