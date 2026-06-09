import { useEffect, useState } from 'react';

const colorClasses = {
  success: 'bg-leaf',
  warning: 'bg-amber-400',
  danger:  'bg-red-500',
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({ value = 0, color = 'success', showLabel = false, height = 'md', className = '', ...props }) {
  const clamped = Math.min(100, Math.max(0, value));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      <div className={`flex-1 overflow-hidden rounded-full bg-stone-100 ${heightClasses[height] ?? heightClasses.md}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${colorClasses[color] ?? colorClasses.success}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 text-right text-sm font-medium tabular-nums text-stone-600">
          {clamped}%
        </span>
      )}
    </div>
  );
}
