import {
  calculateAidDeadline,
  getDaysUntilDeadline,
} from "../../utils/calculateAidDeadlines";
import { getAidStatusStyle } from "../../utils/getAidStatusStyle";

function getField(program, keys, fallback = "") {
  for (const key of keys) {
    if (program[key] !== undefined && program[key] !== null && program[key] !== "") {
      return program[key];
    }
  }

  return fallback;
}

function getStatusLabel(status) {
  switch (status) {
    case "likely-eligible":
      return "Likely match";
    case "needs-verification":
      return "Needs verification";
    default:
      return "Review needed";
  }
}

function getPreviewList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.slice(0, 3);
}

export default function AidProgramCard({ program, disasterDate }) {
  if (!program) {
    return null;
  }

  const agency = getField(program, ["agency", "provider", "organization"], "Recovery Program");
  const name = getField(program, ["name", "title"], "Aid Program");
  const description = getField(program, ["description"], "No description available.");
  const amount = getField(
    program,
    ["estimatedAmount", "estimated_amount", "amount", "benefitAmount"],
    "Not specified"
  );
  const windowDays = getField(
    program,
    ["applicationWindowDays", "application_window_days", "windowDays", "deadlineDays"],
    null
  );

  const deadline = disasterDate ? calculateAidDeadline(disasterDate, windowDays) : null;
  const daysRemaining = deadline ? getDaysUntilDeadline(deadline) : null;
  const hasPassed = typeof daysRemaining === "number" && daysRemaining < 0;
  const eligibilityStatus = getField(program, ["eligibilityStatus"], "");
  const matchReasons = getPreviewList(program?.matchReasons);
  const cautionReasons = getPreviewList(program?.cautionReasons);
  const documentReadinessWarnings = getPreviewList(program?.documentReadinessWarnings);

  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {agency}
          </p>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getAidStatusStyle(
              eligibilityStatus
            )}`}
          >
            {getStatusLabel(eligibilityStatus)}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-stone-900">{name}</h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>

      <dl className="mt-5 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Estimated Amount
          </dt>
          <dd className="mt-1 font-medium text-stone-900">{amount}</dd>
        </div>

        <div className="rounded-2xl bg-stone-50 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Application Window
          </dt>
          <dd className="mt-1 font-medium text-stone-900">
            {windowDays !== null ? `${windowDays} days` : "Not specified"}
          </dd>
        </div>
      </dl>

      {matchReasons.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
            Why this matched
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-emerald-900">
            {matchReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {cautionReasons.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
            Check before applying
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-900">
            {cautionReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {documentReadinessWarnings.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Documents to prepare
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            {documentReadinessWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
        {disasterDate ? (
          deadline ? (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-stone-900">Estimated deadline: {deadline}</span>
              {hasPassed ? (
                <span className="font-semibold text-red-700">Deadline passed</span>
              ) : (
                <span className="text-stone-600">
                  {daysRemaining === 0
                    ? "Deadline is today"
                    : `${daysRemaining} day${Math.abs(daysRemaining) === 1 ? "" : "s"} remaining`}
                </span>
              )}
            </div>
          ) : (
            <span className="font-medium text-stone-700">Unable to calculate deadline</span>
          )
        ) : (
          <span className="font-medium text-stone-700">Enter disaster date</span>
        )}
      </div>
    </article>
  );
}
