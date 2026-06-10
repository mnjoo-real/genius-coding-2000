import { useEffect, useRef, useState } from 'react';
import { getScoreBandStyles } from '../../utils/scoreDisplay';

const sizeConfig = {
  sm: { px: 80,  strokeWidth: 8,  fontSize: '1.25rem'  },
  md: { px: 120, strokeWidth: 10, fontSize: '1.875rem' },
  lg: { px: 160, strokeWidth: 12, fontSize: '2.5rem'   },
};

export default function ScoreGauge({ score = 0, size = 'md' }) {
  const { px, strokeWidth, fontSize } = sizeConfig[size] ?? sizeConfig.md;
  const clamped = Math.min(100, Math.max(0, score));

  const center       = px / 2;
  const radius       = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset  = circumference * (1 - clamped / 100);
  const color         = getScoreBandStyles(clamped).color;

  const [offset, setOffset] = useState(circumference);
  const [pulse,  setPulse]  = useState(false);
  const prevScoreRef        = useRef(null);

  // Animate arc on mount and whenever score changes
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(raf);
  }, [targetOffset]);

  // Pulse the score number when it changes after first render
  useEffect(() => {
    if (prevScoreRef.current !== null && prevScoreRef.current !== score) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(t);
    }
    prevScoreRef.current = score;
  }, [score]);

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      role="img"
      aria-label={`Canopy Score: ${clamped} out of 100`}
    >
      {/* Background track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-stone-200)"
        strokeWidth={strokeWidth}
      />

      {/* Score arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{
          stroke: color,
          transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Score number — scales up briefly when score changes */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize,
          fontWeight: 700,
          fill: 'var(--color-stone-900)',
          fontFamily: 'inherit',
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transform: pulse ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 200ms ease',
        }}
      >
        {clamped}
      </text>
    </svg>
  );
}
