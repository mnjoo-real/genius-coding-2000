const statusStyles = {
  Preparing: "border border-amber-200 bg-amber-50 text-amber-800",
  Submitted: "border border-blue-200 bg-blue-50 text-blue-800",
  Approved: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  Denied: "border border-red-200 bg-red-50 text-red-800",
  overdue: "border border-red-200 bg-red-50 text-red-800",
  urgent: "border border-red-200 bg-red-50 text-red-800",
  soon: "border border-amber-200 bg-amber-50 text-amber-800",
  open: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  "needs-date": "border border-amber-200 bg-amber-50 text-amber-800",
  unknown: "border border-slate-200 bg-slate-50 text-slate-700",
  none: "border border-slate-200 bg-slate-50 text-slate-700",
};

const defaultStatusStyle = "border border-slate-200 bg-slate-50 text-slate-700";

export function getAidStatusStyle(status) {
  if (typeof status !== "string") {
    return defaultStatusStyle;
  }

  return statusStyles[status] || defaultStatusStyle;
}
