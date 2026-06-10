const statusStyles = {
  Preparing: "border border-amber-200 bg-amber-50 text-amber-800",
  Submitted: "border border-blue-200 bg-blue-50 text-blue-800",
  Approved: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  Denied: "border border-red-200 bg-red-50 text-red-800",
};

const defaultStatusStyle = "border border-slate-200 bg-slate-50 text-slate-700";

export function getAidStatusStyle(status) {
  if (typeof status !== "string") {
    return defaultStatusStyle;
  }

  return statusStyles[status] || defaultStatusStyle;
}
