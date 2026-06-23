import { useQuery } from "@tanstack/react-query";
import { aiApi } from "@/api/aiApi";
import { Zap, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  className?: string;
}

export function AIBadge({ className }: AIBadgeProps) {
  const { data: configData, isLoading } = useQuery({
    queryKey: ["aiConfigEffective"],
    queryFn: aiApi.getEffectiveConfig,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !configData?.data) {
    return null;
  }

  const { usingSystemTextKey, usingSystemDefault, usage } = configData.data;
  const isSystem = usingSystemTextKey ?? usingSystemDefault;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold shadow-sm border whitespace-nowrap",
        isSystem
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700"
          : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700",
        className
      )}
    >
      {isSystem ? (
        <>
          <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>
            Powered by Greycats AI
            {usage?.prompt && (
              <span className="ml-1 opacity-80 font-normal normal-case tracking-normal">
                ({usage.prompt.limit === -1 ? "Unlimited" : `${usage.prompt.remaining} left`})
              </span>
            )}
          </span>
        </>
      ) : (
        <>
          <Key className="w-3.5 h-3.5 text-amber-600" />
          <span>Using Custom AI Key</span>
        </>
      )}
    </div>
  );
}
