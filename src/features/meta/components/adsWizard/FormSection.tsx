import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type FormSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function FormSection({ title, description, icon: Icon, children, className }: FormSectionProps) {
  return (
    <div className={cn("flex flex-col lg:flex-row gap-6 lg:gap-12 py-8 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0", className)}>
      <div className="lg:w-1/3 shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 tracking-tight">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          {title}
        </div>
        {description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>}
      </div>
      <div className="lg:w-2/3 space-y-6">
        {children}
      </div>
    </div>
  );
}
