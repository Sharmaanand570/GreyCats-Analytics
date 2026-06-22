import { useQuery } from "@tanstack/react-query";
import { aiApi } from "@/api/aiApi";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isCollapsed: boolean;
}

export function AIQuotaSidebarWidget({ isCollapsed }: Props) {
  const { data: configData } = useQuery({
    queryKey: ["aiConfigEffective"],
    queryFn: aiApi.getEffectiveConfig,
    refetchInterval: 3000,
  });

  if (!configData?.data) return null;

  const { usingSystemTextKey, usingSystemImageKey, usingSystemDefault, usage } = configData.data;

  const isSystemText = usingSystemTextKey ?? usingSystemDefault;
  const isSystemImage = usingSystemImageKey ?? usingSystemDefault;

  const promptUsage = isSystemText ? usage?.prompt : null;
  const imageUsage = isSystemImage ? usage?.image : null;

  if (!promptUsage && !imageUsage) return null;

  return (
    <div className={cn("flex flex-col mb-2 transition-all duration-300 w-full", isCollapsed ? "items-center px-1" : "px-3")}>
      <div className={cn("flex flex-col gap-1 w-full rounded-md border border-zinc-800/80 bg-zinc-900/40 p-2 shadow-sm", isCollapsed && "items-center px-1 py-1.5")}>
        
        {/* Text Generation Quota */}
        {promptUsage && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
              {!isCollapsed && <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Prompts</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-zinc-300">
                {promptUsage.limit === -1 ? "∞" : promptUsage.remaining}
              </span>
            )}
          </div>
        )}

        {/* Image Generation Quota */}
        {imageUsage && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
              {!isCollapsed && <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Images</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-zinc-300">
                {imageUsage.limit === -1 ? "∞" : imageUsage.remaining}
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
