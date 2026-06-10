const disasterTypeOptions = [
  "Flood",
  "Hurricane",
  "Storm",
  "Wildfire",
  "Winter Storm",
  "Heat",
];

const ownershipOptions = ["Owner", "Renter"];

const insuranceOptions = ["Insured", "Partially Insured", "Uninsured"];

const recoveryNeedOptions = [
  "home-damage",
  "temporary-housing",
  "uninsured-loss",
  "repair-needed",
  "urgent-need",
  "primary-residence",
];

function normalizeRecoveryNeeds(value) {
  return Array.isArray(value) ? value : [];
}

function buildNextAnswers(answers, patch) {
  const nextRecoveryNeeds =
    patch.recoveryNeeds !== undefined
      ? normalizeRecoveryNeeds(patch.recoveryNeeds)
      : normalizeRecoveryNeeds(answers.recoveryNeeds);

  return {
    ...answers,
    ...patch,
    recoveryNeeds: nextRecoveryNeeds,
  };
}

export default function AidEligibilityForm({
  answers = {},
  onChange,
  onSubmit,
}) {
  const currentAnswers = answers && typeof answers === "object" ? answers : {};
  const recoveryNeeds = normalizeRecoveryNeeds(currentAnswers.recoveryNeeds);

  const handleFieldChange = (field, value) => {
    const nextAnswers = buildNextAnswers(currentAnswers, { [field]: value });
    onChange?.(nextAnswers);
  };

  const handleNeedToggle = (need) => {
    const nextRecoveryNeeds = recoveryNeeds.includes(need)
      ? recoveryNeeds.filter((item) => item !== need)
      : [...recoveryNeeds, need];

    onChange?.(buildNextAnswers(currentAnswers, { recoveryNeeds: nextRecoveryNeeds }));
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">Aid Eligibility Check</h2>
      </div>

      <form
        className="mt-6 grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.(currentAnswers);
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Disaster Date</span>
          <input
            type="date"
            value={currentAnswers.disasterDate || ""}
            onChange={(event) => handleFieldChange("disasterDate", event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Disaster Type</span>
          <select
            value={currentAnswers.disasterType || ""}
            onChange={(event) => handleFieldChange("disasterType", event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Select a disaster type</option>
            {disasterTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Ownership Status</span>
          <select
            value={currentAnswers.ownershipStatus || ""}
            onChange={(event) => handleFieldChange("ownershipStatus", event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Select ownership status</option>
            {ownershipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Insurance Status</span>
          <select
            value={currentAnswers.insuranceStatus || ""}
            onChange={(event) => handleFieldChange("insuranceStatus", event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Select insurance status</option>
            {insuranceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium text-stone-700">Recovery Needs</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {recoveryNeedOptions.map((need) => {
              const checked = recoveryNeeds.includes(need);

              return (
                <label
                  key={need}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-300"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleNeedToggle(need)}
                    className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{need}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            Check Eligibility
          </button>
        </div>
      </form>
    </section>
  );
}
