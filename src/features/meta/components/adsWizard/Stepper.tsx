import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Settings", description: "Account & budget" },
  { label: "Audience", description: "Location & interests" },
  { label: "Creative", description: "Copy & image" },
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
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ring-1",
                  isComplete && "bg-emerald-500 text-white ring-emerald-500",
                  isActive && "bg-slate-900 text-white ring-slate-900 shadow-md",
                  !isActive && !isComplete && "bg-white text-slate-400 ring-slate-200"
                )}
              >
                {isComplete ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <div className="hidden md:flex flex-col">
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
                  "h-px flex-1 mx-4 transition-all",
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
