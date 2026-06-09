import ScoreGauge from '../score/ScoreGauge';

export default function ScoreSimulationPanel({ baseScore = 0, actions = [], onToggle }) {
  const projected = Math.min(
    100,
    baseScore +
      actions
        .filter((a) => a.selected)
        .reduce((sum, a) => sum + (a.pointsGain ?? 0), 0),
  );
  const improvement = projected - baseScore;

  return (
    <div className="flex flex-col gap-6">
      {/* Score summary */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
          Projected Score
        </p>
        <ScoreGauge score={projected} size="md" />
        <div className="flex items-center gap-3 text-sm">
          <span className="text-stone-400">
            Current: <span className="font-medium text-stone-600">{baseScore}</span>
          </span>
          {improvement > 0 && (
            <span className="font-semibold text-forest">+{improvement} pts</span>
          )}
        </div>
        {improvement === 0 && (
          <p className="text-xs text-stone-400">Select actions below to see your projected score</p>
        )}
      </div>

      {/* Toggleable action list */}
      {actions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-stone-600">Select actions to simulate</p>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {actions.map((action) => (
              <li key={action.id}>
                <label
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm cursor-pointer transition-fast',
                    action.selected
                      ? 'bg-leaf/10 border-leaf'
                      : 'bg-white border-stone-200 hover:border-leaf hover:bg-moss/20',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={action.selected}
                    onChange={() => typeof onToggle === 'function' && onToggle(action.id)}
                    className="sr-only"
                  />
                  <span
                    className={[
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                      action.selected ? 'bg-leaf border-leaf' : 'bg-white border-stone-300',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {action.selected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5l2.5 2.5 3.5-4"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={[
                      'flex-1 leading-snug',
                      action.selected ? 'font-medium text-forest' : 'text-stone-700',
                    ].join(' ')}
                  >
                    {action.title}
                  </span>
                  <span
                    className={[
                      'text-xs font-semibold tabular-nums shrink-0',
                      action.selected ? 'text-forest' : 'text-stone-400',
                    ].join(' ')}
                  >
                    +{action.pointsGain} pts
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
