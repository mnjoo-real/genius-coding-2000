import {
  calculateAidDeadline,
  getDaysUntilDeadline,
} from "../../utils/calculateAidDeadlines";

function getField(program, keys, fallback = "") {
  for (const key of keys) {
    if (program[key] !== undefined && program[key] !== null && program[key] !== "") {
      return program[key];
    }
  }

  return fallback;
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

  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {agency}
        </p>
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
