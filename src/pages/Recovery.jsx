import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecoveryWorkspace from "../components/recovery/RecoveryWorkspace";
import FemaAssistanceEstimateForm from "../components/recovery/FemaAssistanceEstimateForm";
import { getFemaAssistanceEstimate } from "../services/femaAssistanceEstimateService";
import {
  readRecoveryFemaEstimator,
  saveRecoveryFemaEstimator,
} from "../services/userInfoSyncService";

const INITIAL_FEMA_ESTIMATOR_ANSWERS = {
  zipCode: "",
  state: "",
  county: "",
  ownRent: "",
  grossIncome: "",
  householdComposition: "",
  homeDamage: null,
  floodDamage: null,
};

const RECOVERY_SECTIONS = [
  {
    id: "fema",
    label: "FEMA Assistance Estimate",
    description: "Estimate FEMA IHP support from similar historical cases.",
  },
  {
    id: "workspace",
    label: "Damage Record Workspace",
    description: "Collect photos, dates, damage types, and receipts.",
  },
];

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "No match";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatRate(value) {
  if (value === null || value === undefined || value === "") {
    return "No match";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  if (number <= 1) {
    return `${(number * 100).toFixed(1)}%`;
  }

  return `${number.toFixed(1)}%`;
}

export default function Recovery() {
  const [activeSection, setActiveSection] = useState("workspace");
  const [femaEstimatorAnswers, setFemaEstimatorAnswers] = useState(() => ({
    ...INITIAL_FEMA_ESTIMATOR_ANSWERS,
    ...readRecoveryFemaEstimator(),
  }));
  const [femaEstimateResult, setFemaEstimateResult] = useState(null);
  const [femaEstimateLoading, setFemaEstimateLoading] = useState(false);
  const [femaEstimateError, setFemaEstimateError] = useState("");

  useEffect(() => {
    saveRecoveryFemaEstimator(femaEstimatorAnswers);
  }, [femaEstimatorAnswers]);

  const handleFemaEstimatorChange = (nextValues) => {
    setFemaEstimatorAnswers((currentValues) => ({
      ...currentValues,
      ...(nextValues && typeof nextValues === "object" && !Array.isArray(nextValues)
        ? nextValues
        : {}),
    }));
    setFemaEstimateError("");
  };

  const handleFemaEstimatorSubmit = async (submittedValues) => {
    const payload = {
      ...INITIAL_FEMA_ESTIMATOR_ANSWERS,
      ...(submittedValues && typeof submittedValues === "object" && !Array.isArray(submittedValues)
        ? submittedValues
        : {}),
    };

    setFemaEstimatorAnswers(payload);
    setFemaEstimateLoading(true);
    setFemaEstimateError("");

    try {
      const result = await getFemaAssistanceEstimate(payload);
      setFemaEstimateResult(result);
    } catch (error) {
      console.error("Failed to load FEMA assistance estimate:", error);
      setFemaEstimateResult(null);
      setFemaEstimateError(
        "We could not load the FEMA estimate right now. Please try again.",
      );
    } finally {
      setFemaEstimateLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-parchment px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Recovery Center
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-900">Recovery Center</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                This page organizes recovery evidence, damaged-home photo records, FEMA estimate
                inputs, receipt photos, and damage details so post-disaster records stay in one
                place.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>

        <nav
          aria-label="Recovery sections"
          className="grid gap-3 rounded-3xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-2"
        >
          {RECOVERY_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                aria-pressed={isActive}
                className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                  isActive
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-300 hover:bg-stone-100"
                }`}
              >
                <span className="block text-sm font-semibold">{section.label}</span>
                <span
                  className={`mt-1 block text-xs leading-5 ${
                    isActive ? "text-emerald-50" : "text-stone-500"
                  }`}
                >
                  {section.description}
                </span>
              </button>
            );
          })}
        </nav>

        {activeSection === "fema" ? (
          <section className="rounded-3xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  FEMA Assistance Estimate
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  FEMA Assistance Estimate
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                  Estimate a FEMA IHP range from similar historical cases.
                </p>
              </div>

              {femaEstimateError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-700">
                  {femaEstimateError}
                </p>
              ) : null}

              <div className={`flex flex-col gap-6 ${femaEstimateResult ? "lg:flex-row" : ""}`}>
                <section className={femaEstimateResult ? "min-w-0 lg:flex-[1.15]" : "w-full"}>
                  <FemaAssistanceEstimateForm
                    values={femaEstimatorAnswers}
                    onChange={handleFemaEstimatorChange}
                    onSubmit={handleFemaEstimatorSubmit}
                    isSubmitting={femaEstimateLoading}
                  />
                </section>

                {femaEstimateResult ? (
                  <section className="min-w-0 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:flex-[0.85]">
                    <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          Estimate Result
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-stone-900">
                          FEMA IHP estimate
                        </h3>
                      </div>
                      <div className="group relative">
                        <button
                          type="button"
                          aria-describedby="fema-estimate-disclaimer"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-sm font-bold text-amber-800 shadow-sm transition-colors hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        >
                          !
                        </button>
                        <p
                          id="fema-estimate-disclaimer"
                          role="tooltip"
                          className="pointer-events-none absolute right-0 top-9 z-10 w-72 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                        >
                          This estimate is based on historical FEMA Individuals and Households
                          Program records. It is not a guarantee of FEMA eligibility or payment.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
                          Eligibility rate
                        </p>
                        <p className="mt-2 text-lg font-semibold text-stone-950">
                          {formatRate(femaEstimateResult.eligibilityRate)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                          Estimated low
                        </p>
                        <p className="mt-2 text-lg font-semibold text-stone-900">
                          {formatMoney(femaEstimateResult.estimatedLow)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                          Estimated median
                        </p>
                        <p className="mt-2 text-lg font-semibold text-stone-900">
                          {formatMoney(femaEstimateResult.estimatedMedian)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                          Estimated high
                        </p>
                        <p className="mt-2 text-lg font-semibold text-stone-900">
                          {formatMoney(femaEstimateResult.estimatedHigh)}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "workspace" ? <RecoveryWorkspace /> : null}
      </div>
    </main>
  );
}
