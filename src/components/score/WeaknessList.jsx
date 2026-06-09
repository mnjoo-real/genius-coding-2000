import ProgressBar from '../ui/ProgressBar';

function resolveBarColor(cssVar = '') {
  if (cssVar.includes('red'))   return 'danger';
  if (cssVar.includes('amber')) return 'warning';
  return 'success';
}

export default function WeaknessList({ categories = [] }) {
  return (
    <ul className="flex flex-col gap-4 list-none p-0 m-0">
      {categories.map(({ name, score, maxScore, color }) => {
        const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const barColor = resolveBarColor(color);

        return (
          <li key={name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-stone-700 truncate">{name}</span>
              </div>
              <span className="text-sm tabular-nums text-stone-500 shrink-0">
                {score} / {maxScore}
              </span>
            </div>
            <ProgressBar value={pct} color={barColor} height="sm" />
          </li>
        );
      })}
    </ul>
  );
}
