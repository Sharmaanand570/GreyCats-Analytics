import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConnectedPlatformIcon = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

interface ConnectPlatformsButtonProps extends Omit<ButtonProps, 'children'> {
  connected: ConnectedPlatformIcon[];
  label?: string;
}

export const ConnectPlatformsButton = React.forwardRef<
  HTMLButtonElement,
  ConnectPlatformsButtonProps
>(({ connected, label = 'Connect', className, variant = 'outline', ...rest }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      className={cn(
        'h-9 gap-1.5 px-3 text-xs shrink-0 bg-white border-zinc-200 hover:bg-zinc-50 transition-colors rounded-xl shadow-sm',
        className,
      )}
      {...rest}
    >
      <Plus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      <span className="font-bold text-zinc-800">{label}</span>
      {connected.length > 0 && (
        <span className="flex items-center -space-x-1 ml-0.5 pl-1 border-l border-zinc-100">
          {connected.map((p, i) => (
            <span
              key={p.id}
              title={p.name}
              className="w-5 h-5 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm [&_svg]:w-3 [&_svg]:h-3 shrink-0 ring-2 ring-white"
              style={{ zIndex: connected.length - i }}
            >
              {p.icon}
            </span>
          ))}
        </span>
      )}
    </Button>
  );
});

ConnectPlatformsButton.displayName = 'ConnectPlatformsButton';
