import { useState } from "react";
import { femaEstimatorQuestions } from "../../data/femaEstimatorQuestions";

const REQUIRED_FIELDS = new Set([
  "zipCode",
  "ownRent",
  "grossIncome",
  "householdComposition",
  "homeDamage",
  "floodDamage",
]);

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
      value === undefined || value === null || value === "" || (typeof value === "number" && Number.isNaN(value));

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

  const handleFieldChange = (fieldId, nextValue) => {
    onChange?.({
      ...currentValues,
      [fieldId]: nextValue,
    });
  };

  const handleBlur = (fieldId) => {
    setTouched((previousTouched) => new Set(previousTouched).add(fieldId));
    const nextErrors = buildErrors(currentValues);
    setErrors(nextErrors);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

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

    return (
      <label key={question.id} className="grid gap-2">
        <span className="text-sm font-medium text-stone-700">{question.label}</span>
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Recovery Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">FEMA Assistance Estimate</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          Enter details about the damaged home to estimate FEMA IHP assistance. Required fields
          are validated before the form is submitted.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 p-6">
        {femaEstimatorQuestions.map((question) => {
          if (question.type === "text") {
            return renderTextField(question);
          }

          if (question.type === "single") {
            const hasBooleanOptions = Array.isArray(question.options) && question.options.some(isBooleanOption);
            return hasBooleanOptions ? renderBooleanField(question) : renderSelectField(question);
          }

          return null;
        })}

        <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-stone-500">
            Required fields: ZIP code, ownership, income range, household size, home damage, and
            flood damage.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isSubmitting ? "Estimating..." : "Estimate Assistance"}
          </button>
        </div>
      </form>
    </section>
  );
}
