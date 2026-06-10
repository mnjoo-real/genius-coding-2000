export default function PhotoCategoryCard({ category, checked, onToggle }) {
  if (!category) {
    return null;
  }

  const label = category.label || category.id || "Photo Category";
  const description = category.description || "";
  const statusLabel = checked ? "Documented" : "Needed";
  const statusClasses = checked
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-stone-900">{label}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}
        >
          {statusLabel}
        </span>
      </div>
    </button>
  );
}
