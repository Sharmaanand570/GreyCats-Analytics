import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Objective", description: "Goal & type" },
  { label: "Settings", description: "Targeting & schedule" },
  { label: "Bidding", description: "Strategy & budget" },
  { label: "Ad Group", description: "Keywords" },
  { label: "Creative", description: "Headlines & assets" },
  { label: "Review", description: "Publish" },
];

export function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => {
        const isComplete = idx < current;
        const isActive = idx === current;
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ring-1",
                  isComplete && "bg-emerald-500 text-white ring-emerald-500",
                  isActive && "bg-[#1A73E8] text-white ring-[#1A73E8] shadow-md",
                  !isActive && !isComplete && "bg-white text-slate-400 ring-slate-200"
                )}
              >
                {isComplete ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <div className="hidden lg:flex flex-col">
                <span
                  className={cn(
                    "text-xs font-black uppercase tracking-widest leading-none",
                    isActive ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">
                  {step.description}
                </span>
              </div>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-px flex-1 mx-3 transition-all",
                  isComplete ? "bg-emerald-500" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
