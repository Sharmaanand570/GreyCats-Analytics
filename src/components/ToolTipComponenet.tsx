import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function ToolTipComponenet({
  children,
  content,
  side = "right",
  align = "center",
}: {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="bg-accent-foreground text-accent"
        >
        <span className="text-[0.6rem] text-accent line-clamp-3 max-w-[200px]">{content}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ToolTipComponenet
