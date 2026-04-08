import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { BlogPostStatus } from '../api/types';

const STATUS_CONFIG: Record<BlogPostStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  PENDING: {
    label: 'Pending',
    icon: <Clock className="w-3 h-3" />,
    classes: 'bg-zinc-200/50 text-zinc-700 border-zinc-300',
  },
  PROCESSING: {
    label: 'Publishing...',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  PUBLISHED: {
    label: 'Published',
    icon: <CheckCircle2 className="w-3 h-3" />,
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  FAILED: {
    label: 'Failed',
    icon: <AlertCircle className="w-3 h-3" />,
    classes: 'bg-red-100 text-red-800 border-red-300',
  },
};

interface BlogPostStatusBadgeProps {
  status: BlogPostStatus;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function BlogPostStatusBadge({ status, className = '', onClick }: BlogPostStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${config.classes} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
