import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const badgeVariant = {
  uploaded: 'success',
  missing:  'danger',
  optional: 'neutral',
};

const badgeLabel = {
  uploaded: 'Uploaded',
  missing:  'Missing',
  optional: 'Optional',
};

function CheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 9l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecoveryPreviewCard({ docName, status = 'optional', onUpload }) {
  const variant = badgeVariant[status] ?? 'neutral';
  const label = badgeLabel[status] ?? status;

  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <span className="flex-1 text-sm font-medium text-stone-800 truncate">{docName}</span>
        <Badge variant={variant} size="sm">{label}</Badge>
        {status === 'uploaded' && (
          <span className="text-leaf shrink-0">
            <CheckCircle />
          </span>
        )}
        {status === 'missing' && (
          <Button variant="primary" size="sm" onClick={onUpload}>
            Upload
          </Button>
        )}
        {status === 'optional' && (
          <span className="text-xs text-stone-400 shrink-0">not required</span>
        )}
      </div>
    </Card>
  );
}
