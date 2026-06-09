import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

const variantMap = {
  low:    'success',
  medium: 'warning',
  high:   'danger',
};

const labelMap = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
};

export default function RiskCard({ disasterType, riskLevel = 'low', riskPercent = 0, description }) {
  const variant = variantMap[riskLevel] ?? 'neutral';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-medium text-stone-900">{disasterType}</h3>
        <Badge variant={variant} size="sm">{labelMap[riskLevel] ?? riskLevel}</Badge>
      </div>
      <ProgressBar value={riskPercent} color={variant} showLabel height="md" className="mb-3" />
      <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
    </Card>
  );
}
