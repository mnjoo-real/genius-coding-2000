import { getAidStatusStyle } from "../../utils/getAidStatusStyle";

function getProgramName(program) {
  return program?.programName || program?.name || program?.title || "Aid Program";
}

function getStatusLabel(status) {
  switch (status) {
    case "overdue":
      return "Overdue";
    case "urgent":
      return "Urgent";
    case "soon":
      return "Due soon";
    case "open":
      return "Open";
    case "needs-date":
      return "Date needed";
    case "none":
      return "No fixed deadline";
    case "unknown":
    default:
      return "Unknown";
  }
}

function getDeadlineBasisLabel(deadlineBasis) {
  switch (deadlineBasis) {
    case "declarationDate":
      return "Based on declaration date";
    case "disasterDate":
      return "Based on disaster date";
    case "none":
      return "No fixed deadline listed";
    default:
      return "";
  }
}

function formatDaysRemaining(daysRemaining) {
  if (typeof daysRemaining !== "number" || Number.isNaN(daysRemaining)) {
    return "";
  }

  if (daysRemaining === 0) {
    return "Deadline is today";
  }

  const absoluteDays = Math.abs(daysRemaining);
  return `${absoluteDays} day${absoluteDays === 1 ? "" : "s"} ${daysRemaining < 0 ? "past" : "remaining"}`;
}

function getDeadlineMessage(item) {
  const status = item?.status || "unknown";
  const note = typeof item?.note === "string" ? item.note.trim() : "";
  const deadline = typeof item?.deadline === "string" && item.deadline ? item.deadline : "";
  const daysRemaining = item?.daysRemaining;

  if (status === "none") {
    return note || "No fixed deadline listed.";
  }

  if (status === "needs-date" || status === "unknown") {
    return note || "Deadline unknown. Verify official deadlines.";
  }

  const parts = [];

  if (deadline) {
    parts.push(`Estimated deadline: ${deadline}`);
  }

  if (typeof daysRemaining === "number" && !Number.isNaN(daysRemaining)) {
    parts.push(formatDaysRemaining(daysRemaining));
  }

  if (status === "overdue") {
    parts.push("This deadline may have passed.");
  }

  if (note) {
    parts.push(note);
  }

  return parts.join(" ");
}

function DeadlineItem({ item }) {
  const status = item?.status || "unknown";
  const statusStyle = getAidStatusStyle(status);
  const deadlineBasisLabel = getDeadlineBasisLabel(item?.deadlineBasis);
  const baseDate = typeof item?.baseDate === "string" && item.baseDate ? item.baseDate : "";
  const message = getDeadlineMessage(item);
  const programName = getProgramName(item);

  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-stone-900">{programName}</h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle}`}
          >
            {getStatusLabel(status)}
          </span>
        </div>

        {deadlineBasisLabel ? (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
            {deadlineBasisLabel}
          </p>
        ) : null}

        {baseDate ? <p className="text-sm text-stone-600">Base date: {baseDate}</p> : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{message}</p>
    </article>
  );
}

export default function DeadlineTracker({ programs = [] }) {
  const items = Array.isArray(programs) ? programs : [];

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">Aid Deadlines</h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-600">
          No deadline estimates are available yet. Complete the aid eligibility check first.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((program) => (
            <DeadlineItem
              key={program?.programId || program?.id || program?.name || program?.title}
              item={program}
            />
          ))}
        </div>
      )}
    </section>
  );
}
