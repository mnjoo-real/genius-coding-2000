import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { formatRiskScore, getRiskBand } from '../../utils/riskDisplay';

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
  const numericRisk = Number(riskPercent);
  const normalizedRisk = Number.isFinite(numericRisk)
    ? Math.min(1, Math.max(0, numericRisk <= 1 ? numericRisk : numericRisk / 100))
    : 0;
  const band = getRiskBand(normalizedRisk);
  const variant = variantMap[riskLevel] ?? variantMap[band] ?? 'neutral';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-medium text-stone-900">{disasterType}</h3>
        <Badge variant={variant} size="sm">{labelMap[riskLevel] ?? labelMap[band] ?? riskLevel}</Badge>
      </div>
      <ProgressBar value={normalizedRisk * 100} color={variant} showLabel height="md" className="mb-3" />
      <p className="mb-3 text-xs text-stone-500">Risk score: {formatRiskScore(normalizedRisk)}</p>
      <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
    </Card>
  );
}
