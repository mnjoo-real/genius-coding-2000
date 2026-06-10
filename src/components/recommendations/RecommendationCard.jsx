import Badge from '../ui/Badge';

const priorityDot = {
  now:   'bg-red-500',
  soon:  'bg-amber-400',
  later: 'bg-leaf',
};

export default function RecommendationCard({
  title,
  detail,
  priority = 'later',
  pointsGain,
  cost,
  isDone = false,
  onToggle,
}) {
  const dotClass = priorityDot[priority] ?? priorityDot.later;

  return (
    <div
      className={[
        'rounded-2xl border p-6 transition-all duration-200',
        isDone
          ? 'bg-leaf/5 border-leaf/30'
          : 'bg-white border-stone-200 hover:-translate-y-0.5 hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5 mb-2">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${dotClass}`}
          aria-hidden="true"
        />
        <h3 className="text-base font-medium text-stone-900 leading-snug">{title}</h3>
      </div>

      <p className="text-sm text-stone-500 leading-relaxed mb-4">{detail}</p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {cost && <Badge variant="neutral" size="sm">{cost}</Badge>}
          {pointsGain != null && (
            <Badge variant="success" size="sm">+{pointsGain} pts</Badge>
          )}
        </div>
        {typeof onToggle === 'function' && (
          <button
            type="button"
            onClick={onToggle}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-fast',
              isDone
                ? 'bg-leaf text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200',
            ].join(' ')}
          >
            {isDone ? '✓ Done' : 'Mark as done'}
          </button>
        )}
      </div>

      {isDone && (
        <p className="mt-3 text-xs text-leaf font-medium">
          Great choice! Your score improved.
        </p>
      )}
    </div>
  );
}
