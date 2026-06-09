import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

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
  onLearnMore,
}) {
  const dotClass = priorityDot[priority] ?? priorityDot.later;

  return (
    <Card>
      <div className="flex items-start gap-2.5 mb-2">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${dotClass}`}
          aria-hidden="true"
        />
        <h3 className="text-base font-medium text-stone-900 leading-snug">{title}</h3>
      </div>

      <p className="text-sm text-stone-500 leading-relaxed mb-4">{detail}</p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {cost && <Badge variant="neutral" size="sm">{cost}</Badge>}
          {pointsGain != null && (
            <Badge variant="success" size="sm">+{pointsGain} pts</Badge>
          )}
        </div>
        {typeof onLearnMore === 'function' && (
          <Button variant="ghost" size="sm" onClick={onLearnMore}>
            Learn more
          </Button>
        )}
      </div>
    </Card>
  );
}
