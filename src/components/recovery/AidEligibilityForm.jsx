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
}) {
  const currentAnswers = normalizeAnswers(answers);
  const recoveryNeeds = normalizeMultiValue(currentAnswers.recoveryNeeds);
  const questionMap = getQuestionMap();
  const updateAnswers = onChange ?? setAnswers;

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
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">Aid Eligibility Check</h2>
      </div>

      <form
        className="mt-6 grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.(buildNextAnswers(currentAnswers, { recoveryNeeds }));
        }}
      >
        {recoveryQuestionTiers.map((tier) => {
          const tierQuestions = Array.isArray(tier.questionIds) && tier.questionIds.length > 0
            ? tier.questionIds
                .map((questionId) => questionMap.get(questionId))
                .filter(Boolean)
            : recoveryQuestions.filter((question) => question.tier === tier.id);

          if (tierQuestions.length === 0) {
            return null;
          }

          return (
            <section key={tier.id} className="grid gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <div className="grid gap-1">
                <h3 className="text-lg font-semibold text-stone-900">{tier.title}</h3>
                {tier.description ? (
                  <p className="text-sm leading-6 text-stone-600">{tier.description}</p>
                ) : null}
              </div>

              <div className="grid gap-5">
                {tierQuestions.map((question) => renderField(question))}
              </div>
            </section>
          );
        })}

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
