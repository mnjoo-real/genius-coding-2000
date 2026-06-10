import { Link } from 'react-router-dom';

export default function RecoveryPreviewCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Recovery Center
      </p>
      <h3 className="mt-2 text-lg font-semibold text-stone-900">
        Get recovery-ready in one place
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Prepare recovery documents, organize home photo records, and track mock aid application
        steps before disaster recovery becomes urgent.
      </p>
      <Link
        to="/recovery"
        className="mt-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
      >
        Open Recovery Center
      </Link>
    </div>
  );
}
