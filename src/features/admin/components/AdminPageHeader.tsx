import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode; // Extra slots (e.g. search)
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ComponentType<{ className?: string }>;
    };
}

export function AdminPageHeader({ title, description, action, children }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="space-y-1.5">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {children}
                {action && (
                    <Button
                        onClick={action.onClick}
                        className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                        {action.icon ? <action.icon className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                        {action.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
