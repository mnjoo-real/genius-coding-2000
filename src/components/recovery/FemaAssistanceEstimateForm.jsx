import { useState } from "react";
import ProgressStepper from "../layout/ProgressStepper";
import { femaEstimatorQuestions } from "../../data/femaEstimatorQuestions";

const REQUIRED_FIELDS = new Set([
  "zipCode",
  "ownRent",
  "grossIncome",
  "householdComposition",
  "homeDamage",
  "floodDamage",
]);

const FORM_STEPS = [
  {
    id: "location",
    title: "Location",
    description: "Start with where the damaged home is located.",
    questionIds: ["zipCode", "state", "county"],
    requiredIds: ["zipCode"],
  },
  {
    id: "housing",
    title: "Housing",
    description: "Tell us whether the home was owned or rented.",
    questionIds: ["ownRent"],
    requiredIds: ["ownRent"],
  },
  {
    id: "household",
    title: "Household",
    description: "Estimate the household's size and income range.",
    questionIds: ["grossIncome", "householdComposition"],
    requiredIds: ["grossIncome", "householdComposition"],
  },
  {
    id: "damage",
    title: "Damage",
    description: "Confirm the type of disaster damage that occurred.",
    questionIds: ["homeDamage", "floodDamage"],
    requiredIds: ["homeDamage", "floodDamage"],
  },
];

function normalizeValues(values) {
  return values && typeof values === "object" && !Array.isArray(values) ? values : {};
}

function getOptionValue(option) {
  if (option && typeof option === "object" && "value" in option) {
    return option.value;
  }

  return option;
}

function getOptionLabel(option) {
  if (option && typeof option === "object" && typeof option.label === "string") {
    return option.label;
  }

  if (typeof option === "string") {
    return option;
  }

  if (typeof option === "boolean") {
    return option ? "Yes" : "No";
  }

  return "Option";
}

function isBooleanOption(option) {
  return typeof getOptionValue(option) === "boolean";
}

function buildErrors(values) {
  const errors = {};

  REQUIRED_FIELDS.forEach((fieldId) => {
    const value = values[fieldId];
    const isMissing =
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value));

    if (isMissing) {
      errors[fieldId] = "This field is required.";
    }
  });

  return errors;
}

export default function FemaAssistanceEstimateForm({
  values,
  onChange,
  onSubmit,
  isSubmitting = false,
}) {
  const currentValues = normalizeValues(values);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(new Set());
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const currentStep = FORM_STEPS[activeStepIndex] ?? FORM_STEPS[0];
  const currentStepQuestions = femaEstimatorQuestions.filter((question) =>
    currentStep.questionIds.includes(question.id)
  );
  const isFinalStep = activeStepIndex === FORM_STEPS.length - 1;
  const stepperSteps = FORM_STEPS.map((step) => ({ label: step.title }));

  const handleFieldChange = (fieldId, nextValue) => {
    const nextValues = {
      ...currentValues,
      [fieldId]: nextValue,
    };

    onChange?.(nextValues);
    setErrors(buildErrors(nextValues));
  };

  const handleBlur = (fieldId) => {
    setTouched((previousTouched) => new Set(previousTouched).add(fieldId));
    setErrors(buildErrors(currentValues));
  };

  const handleBack = () => {
    setActiveStepIndex((currentStepIndex) => Math.max(currentStepIndex - 1, 0));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isFinalStep) {
      const nextErrors = buildErrors(currentValues);
      const nextTouched = new Set(touched);

      currentStep.requiredIds.forEach((fieldId) => {
        nextTouched.add(fieldId);
      });

      setErrors(nextErrors);
      setTouched(nextTouched);

      const hasStepErrors = currentStep.requiredIds.some((fieldId) => nextErrors[fieldId]);

      if (hasStepErrors) {
        return;
      }

      setActiveStepIndex((currentStepIndex) =>
        Math.min(currentStepIndex + 1, FORM_STEPS.length - 1)
      );
      return;
    }

    const nextErrors = buildErrors(currentValues);
    setErrors(nextErrors);
    setTouched(new Set(REQUIRED_FIELDS));

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit?.(currentValues);
  };

  const renderTextField = (question) => {
    const value = currentValues[question.id];
    const error = touched.has(question.id) ? errors[question.id] : "";
    const isOptional = !REQUIRED_FIELDS.has(question.id);

    return (
      <label key={question.id} className="grid gap-2">
        <span className="text-sm font-medium text-stone-700">
          {question.label}
          {isOptional ? <span className="ml-2 text-xs font-semibold text-stone-400">Optional</span> : null}
        </span>
        {question.helperText ? (
          <p className="text-sm leading-6 text-stone-500">{question.helperText}</p>
        ) : null}
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => handleFieldChange(question.id, event.target.value)}
          onBlur={() => handleBlur(question.id)}
          className={`rounded-2xl border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:ring-2 ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : "border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
          }`}
        />
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </label>
    );
  };

  const renderSelectField = (question) => {
    const value = currentValues[question.id];
    const error = touched.has(question.id) ? errors[question.id] : "";
    const options = Array.isArray(question.options) ? question.options : [];

    return (
      <label key={question.id} className="grid gap-2">
        <span className="text-sm font-medium text-stone-700">{question.label}</span>
        {question.helperText ? (
          <p className="text-sm leading-6 text-stone-500">{question.helperText}</p>
        ) : null}
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(event) => handleFieldChange(question.id, event.target.value)}
          onBlur={() => handleBlur(question.id)}
          className={`rounded-2xl border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:ring-2 ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : "border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
          }`}
        >
          <option value="">Select an option</option>
          {options.map((option) => {
            const optionValue = getOptionValue(option);
            const optionKey =
              typeof optionValue === "boolean" ? String(optionValue) : String(optionValue ?? "");

            return (
              <option key={optionKey} value={optionKey}>
                {getOptionLabel(option)}
              </option>
            );
          })}
        </select>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </label>
    );
  };

  const renderBooleanField = (question) => {
    const value = currentValues[question.id];
    const error = touched.has(question.id) ? errors[question.id] : "";
    const options = Array.isArray(question.options) ? question.options : [];

    return (
      <fieldset key={question.id} className="grid gap-3">
        <legend className="text-sm font-medium text-stone-700">{question.label}</legend>
        {question.helperText ? (
          <p className="text-sm leading-6 text-stone-500">{question.helperText}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const optionValue = getOptionValue(option);
            const checked = value === optionValue;

            return (
              <label
                key={String(optionValue)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  checked
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={checked}
                  onChange={() => handleFieldChange(question.id, optionValue)}
                  onBlur={() => handleBlur(question.id)}
                  className="h-4 w-4 border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>{getOptionLabel(option)}</span>
              </label>
            );
          })}
        </div>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </fieldset>
    );
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-6 py-5">
        <div className="space-y-5">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Recovery Center
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                FEMA Assistance Estimate
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Answer the questionnaire one step at a time. We validate each section before moving
                forward and only submit when the full profile is complete.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 sm:px-5">
              <ProgressStepper steps={stepperSteps} currentStep={activeStepIndex} />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 p-6">
        <div className="grid gap-6 rounded-3xl border border-stone-200 bg-stone-50/60 p-5 sm:p-6">
          {currentStepQuestions.map((question) => {
            const isOptional = !REQUIRED_FIELDS.has(question.id);
            const hasBooleanOptions =
              question.type === "single" &&
              Array.isArray(question.options) &&
              question.options.some(isBooleanOption);

            return (
              <div key={question.id} className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {currentStep.title}
                  </span>
                  {isOptional ? (
                    <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Optional
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Required
                    </span>
                  )}
                </div>

                {question.type === "text"
                  ? renderTextField(question)
                  : hasBooleanOptions
                    ? renderBooleanField(question)
                    : renderSelectField(question)}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-stone-500">
            Required fields are checked before each step advances.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            {activeStepIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                Back
              </button>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? "Estimating..." : isFinalStep ? "Estimate Assistance" : "Continue"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
