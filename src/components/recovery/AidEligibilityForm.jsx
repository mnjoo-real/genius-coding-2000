import { recoveryQuestionTiers, recoveryQuestions } from "../../data/recoveryQuestions";

function normalizeAnswers(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeMultiValue(value) {
  return Array.isArray(value) ? value : [];
}

function getOptionParts(option) {
  if (typeof option === "string") {
    return { value: option, label: option };
  }

  if (option && typeof option === "object") {
    const value = typeof option.value === "string" ? option.value : "";
    const label =
      typeof option.label === "string"
        ? option.label
        : value || "Option";

    return { value, label };
  }

  return { value: "", label: "Option" };
}

function buildNextAnswers(answers, patch) {
  const nextAnswers = {
    ...answers,
    ...patch,
  };

  if (patch.recoveryNeeds !== undefined || answers.recoveryNeeds !== undefined) {
    nextAnswers.recoveryNeeds = normalizeMultiValue(
      patch.recoveryNeeds !== undefined ? patch.recoveryNeeds : answers.recoveryNeeds,
    );
  }

  return nextAnswers;
}

function getQuestionMap() {
  return new Map(recoveryQuestions.map((question) => [question.id, question]));
}

export default function AidEligibilityForm({
  answers = {},
  onChange,
  setAnswers,
  onSubmit,
  activeTierId,
  onActiveTierChange,
  onClose,
}) {
  const currentAnswers = normalizeAnswers(answers);
  const recoveryNeeds = normalizeMultiValue(currentAnswers.recoveryNeeds);
  const questionMap = getQuestionMap();
  const updateAnswers = onChange ?? setAnswers;
  const tiers = Array.isArray(recoveryQuestionTiers) ? recoveryQuestionTiers : [];
  const resolvedActiveTierId =
    tiers.some((tier) => tier.id === activeTierId) ? activeTierId : tiers[0]?.id ?? "";
  const activeTierIndex = Math.max(
    0,
    tiers.findIndex((tier) => tier.id === resolvedActiveTierId)
  );
  const activeTier = tiers[activeTierIndex] ?? tiers[0] ?? null;

  const activeTierQuestions = activeTier
    ? (Array.isArray(activeTier.questionIds) && activeTier.questionIds.length > 0
        ? activeTier.questionIds
            .map((questionId) => questionMap.get(questionId))
            .filter(Boolean)
        : recoveryQuestions.filter((question) => question.tier === activeTier.id))
    : [];

  const handleFieldChange = (field, value) => {
    const nextAnswers = buildNextAnswers(currentAnswers, { [field]: value });
    updateAnswers?.(nextAnswers);
  };

  const handleMultiToggle = (field, optionValue) => {
    const currentValues = normalizeMultiValue(currentAnswers[field]);
    const nextValues = currentValues.includes(optionValue)
      ? currentValues.filter((item) => item !== optionValue)
      : [...currentValues, optionValue];

    updateAnswers?.(buildNextAnswers(currentAnswers, { [field]: nextValues }));
  };

  const renderField = (question) => {
    const value = currentAnswers[question.id];
    const helperText = question.helperText || "";
    const options = Array.isArray(question.options) ? question.options : [];
    const normalizedOptions = options.map(getOptionParts).filter((option) => option.value);

    if (question.type === "text" || question.type === "date") {
      return (
        <label key={question.id} className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">{question.label}</span>
          {helperText ? (
            <p className="text-sm leading-6 text-stone-500">{helperText}</p>
          ) : null}
          <input
            type={question.type}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => handleFieldChange(question.id, event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
      );
    }

    if (question.type === "single") {
      return (
        <label key={question.id} className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">{question.label}</span>
          {helperText ? (
            <p className="text-sm leading-6 text-stone-500">{helperText}</p>
          ) : null}
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(event) => handleFieldChange(question.id, event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Select an option</option>
            {normalizedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (question.type === "multi") {
      const selectedValues = normalizeMultiValue(value);

      return (
        <fieldset key={question.id} className="grid gap-3">
          <legend className="text-sm font-medium text-stone-700">{question.label}</legend>
          {helperText ? <p className="text-sm leading-6 text-stone-500">{helperText}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {normalizedOptions.map((option) => {
              const checked = selectedValues.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-300"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleMultiToggle(question.id, option.value)}
                    className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    }

    return null;
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Recovery Center
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Aid Eligibility Check</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Work through one section at a time. Your answers stay on the page, and you can close
            the editor at any point without losing progress.
          </p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700"
            aria-label="Close disaster profile editor"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-stone-100 bg-stone-50 p-4 lg:border-b-0 lg:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            Sections
          </p>
          <div className="mt-3 grid gap-2">
            {tiers.map((tier, index) => {
              const isActive = tier.id === resolvedActiveTierId;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onActiveTierChange?.(tier.id)}
                  className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                    isActive
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-stone-600 shadow-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{tier.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                        {tier.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <form
          className="p-6"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.(buildNextAnswers(currentAnswers, { recoveryNeeds }));
          }}
        >
          {activeTier ? (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Step {activeTierIndex + 1} of {tiers.length}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-stone-900">{activeTier.title}</h3>
                  {activeTier.description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                      {activeTier.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const previousTier = tiers[activeTierIndex - 1];
                      if (previousTier) {
                        onActiveTierChange?.(previousTier.id);
                      }
                    }}
                    disabled={activeTierIndex === 0}
                    className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextTier = tiers[activeTierIndex + 1];
                      if (nextTier) {
                        onActiveTierChange?.(nextTier.id);
                      }
                    }}
                    disabled={activeTierIndex >= tiers.length - 1}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                {activeTierQuestions.map((question) => renderField(question))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
            >
              Check Eligibility
            </button>
            <p className="text-xs leading-5 text-stone-500">
              This saves your profile locally and updates the recovery match results.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
