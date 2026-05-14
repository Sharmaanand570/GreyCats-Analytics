import { useRef, useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface GlowingEffectProps {
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
  variant?: 'default' | 'white';
  className?: string;
}

export const GlowingEffect = memo(({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  variant = 'default',
  className,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (disabled) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const distanceToEdge = Math.max(
        0,
        x < 0 ? -x : x > rect.width ? x - rect.width : 0,
        y < 0 ? -y : y > rect.height ? y - rect.height : 0
      );

      if (distanceToEdge <= proximity) {
        setPosition({ x, y });
        const newOpacity = glow ? 1 : Math.max(0.1, 1 - distanceToEdge / proximity);
        setOpacity(newOpacity);
      } else {
        setOpacity(glow ? 0.4 : 0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [disabled, proximity, glow]);

  if (disabled) return null;

  const colorGlow = variant === 'white' 
    ? 'rgba(255, 255, 255, 0.5)' 
    : 'rgba(66, 133, 244, 0.5)'; // Premium Google blue/accent glow

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden transition-opacity duration-500',
        className
      )}
    >
      {/* Animated glowing border stroke using pseudo/masking layer */}
      <div
        className="absolute inset-0 rounded-[inherit] border border-transparent"
        style={{
          opacity,
          background: `radial-gradient(${spread * 3}px circle at ${position.x}px ${position.y}px, ${colorGlow}, transparent 80%)`,
          WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1.5px',
        }}
      />
      {/* Soft spotlight radial wash underneath content */}
      {glow && (
        <div
          className="absolute inset-0 rounded-[inherit] mix-blend-overlay pointer-events-none transition-opacity duration-500"
          style={{
            opacity: opacity * 0.4,
            background: `radial-gradient(${spread * 5}px circle at ${position.x}px ${position.y}px, ${variant === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(66,133,244,0.15)'}, transparent)`,
          }}
        />
      )}
    </div>
  );
});

GlowingEffect.displayName = 'GlowingEffect';
