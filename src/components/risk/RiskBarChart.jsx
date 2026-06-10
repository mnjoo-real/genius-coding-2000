import { useEffect, useState } from 'react';
import { formatRiskScore, getRiskColor } from '../../utils/riskDisplay';

export default function RiskBarChart({ risks = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {risks.map(({ label, value }) => {
        const numericValue = Number(value);
        const normalized = Number.isFinite(numericValue)
          ? Math.min(1, Math.max(0, numericValue <= 1 ? numericValue : numericValue / 100))
          : 0;
        return (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-stone-600 truncate">{label}</span>
            <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${normalized * 100}%` : '0%',
                  backgroundColor: getRiskColor(normalized),
                  transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-sm tabular-nums text-stone-500">
              {formatRiskScore(normalized)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
