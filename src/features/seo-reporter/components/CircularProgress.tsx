import React, { useEffect, useState } from 'react';

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 120,
  strokeWidth = 8,
  color = '#10b981',
  label
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Animate the progress on mount with a slight delay for dramatic effect
    const timer = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Make sure progress is between 0 and 100
  const validProgress = Math.max(0, Math.min(100, progress));
  const offset = circumference - (validProgress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background track */}
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress track */}
        <circle
          className="transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] drop-shadow-sm"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-foreground" style={{ color }}>
          {label || score}
        </span>
      </div>
    </div>
  );
};
