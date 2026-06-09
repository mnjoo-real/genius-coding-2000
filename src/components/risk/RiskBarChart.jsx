import { useEffect, useState } from 'react';

export default function RiskBarChart({ risks = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {risks.map(({ label, value, color }) => {
        const clamped = Math.min(100, Math.max(0, value));
        return (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-stone-600 truncate">{label}</span>
            <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${clamped}%` : '0%',
                  backgroundColor: color,
                  transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-sm tabular-nums text-stone-500">
              {clamped}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
