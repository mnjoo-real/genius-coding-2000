import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RecoveryChecklist from "../components/recovery/RecoveryChecklist";
import HomePhotoGallery from "../components/recovery/HomePhotoGallery";
import AidEligibilityForm from "../components/recovery/AidEligibilityForm";
import FemaAssistanceEstimateForm from "../components/recovery/FemaAssistanceEstimateForm";
import DeadlineTracker from "../components/recovery/DeadlineTracker";
import AidApplicationStatusList from "../components/recovery/AidApplicationStatusList";
import { recoveryQuestionTiers } from "../data/recoveryQuestions";
import { getFemaAssistanceEstimate } from "../services/femaAssistanceEstimateService";
import { calculateAidDeadlines } from "../utils/calculateAidDeadlines";
import { matchAidPrograms } from "../utils/matchAidPrograms";
import {
  buildRecoveryBaseAnswers,
  clearLegacyRecoveryProfile,
  clearRecoveryProfile,
  readPreparednessSnapshot,
  readRecoveryProfile,
  saveRecoveryProfile,
} from "../services/userInfoSyncService";

function stripBaseAnswers(answers, baseAnswers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return {};
  }

  const sanitizedAnswers = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (!(key in baseAnswers)) {
      sanitizedAnswers[key] = value;
    }
  });

  return sanitizedAnswers;
}

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
  const [preparednessSnapshot] = useState(() => readPreparednessSnapshot());
  const baseRecoveryAnswers = useMemo(
    () => buildRecoveryBaseAnswers(preparednessSnapshot),
    [preparednessSnapshot]
  );
  const initialRecoveryAnswers = useMemo(
    () => stripBaseAnswers(readRecoveryProfile(), baseRecoveryAnswers),
    [baseRecoveryAnswers]
  );
  const [recoveryAnswers, setRecoveryAnswers] = useState(initialRecoveryAnswers);
  const [hasMatched, setHasMatched] = useState(false);
  const [isEditingDisasterProfile, setIsEditingDisasterProfile] = useState(false);
  const [activeRecoveryTierId, setActiveRecoveryTierId] = useState(
    recoveryQuestionTiers[0]?.id ?? null
  );
  const [femaEstimatorAnswers, setFemaEstimatorAnswers] = useState(
    INITIAL_FEMA_ESTIMATOR_ANSWERS
  );
  const [femaEstimateResult, setFemaEstimateResult] = useState(null);
  const [femaEstimateLoading, setFemaEstimateLoading] = useState(false);
  const [femaEstimateError, setFemaEstimateError] = useState("");
  const hasBaseRecoveryContext = Object.keys(baseRecoveryAnswers).length > 0;
  const hasSavedRecoveryAnswers = Object.keys(recoveryAnswers).length > 0;
  const hasDisasterProfile = hasBaseRecoveryContext || hasSavedRecoveryAnswers;
  const combinedRecoveryAnswers = useMemo(
    () => ({ ...baseRecoveryAnswers, ...recoveryAnswers }),
    [baseRecoveryAnswers, recoveryAnswers]
  );
  const inheritedQuestionIds = useMemo(
    () => Object.keys(baseRecoveryAnswers),
    [baseRecoveryAnswers]
  );

  useEffect(() => {
    if (Object.keys(recoveryAnswers).length === 0) {
      clearRecoveryProfile();
      return;
    }

    saveRecoveryProfile(recoveryAnswers);
    clearLegacyRecoveryProfile();
  }, [recoveryAnswers]);

  const matchedPrograms = useMemo(() => {
    if (!hasMatched || !hasDisasterProfile) {
      return [];
    }

    try {
      return matchAidPrograms(combinedRecoveryAnswers);
    } catch {
      return [];
    }
  }, [combinedRecoveryAnswers, hasMatched, hasDisasterProfile]);

  const aidDeadlines = useMemo(() => {
    if (!hasMatched || !hasDisasterProfile || matchedPrograms.length === 0) {
      return [];
    }

    try {
      return calculateAidDeadlines(matchedPrograms, combinedRecoveryAnswers);
    } catch {
      return [];
    }
  }, [matchedPrograms, combinedRecoveryAnswers, hasMatched, hasDisasterProfile]);

  const handleSubmit = (nextAnswers) => {
    if (nextAnswers && typeof nextAnswers === "object" && !Array.isArray(nextAnswers)) {
      const nextRecoveryAnswers = stripBaseAnswers(nextAnswers, baseRecoveryAnswers);
      setRecoveryAnswers(nextRecoveryAnswers);
      if (Object.keys(nextRecoveryAnswers).length === 0) {
        clearRecoveryProfile();
      } else {
        saveRecoveryProfile(nextRecoveryAnswers);
      }
      clearLegacyRecoveryProfile();
    }

    setHasMatched(true);
    setIsEditingDisasterProfile(false);
    setActiveRecoveryTierId(null);
  };

  const handleCreateDisasterProfile = () => {
    setRecoveryAnswers({});
    setHasMatched(false);
    setIsEditingDisasterProfile(true);
    setActiveRecoveryTierId(recoveryQuestionTiers[0]?.id ?? null);
  };

  const handleEditDisasterProfile = () => {
    setHasMatched(false);
    setIsEditingDisasterProfile(true);
    setActiveRecoveryTierId(recoveryQuestionTiers[0]?.id ?? null);
  };

  const handleReviewRecoveryPlan = () => {
    setHasMatched(true);
    setIsEditingDisasterProfile(false);
    setActiveRecoveryTierId(null);
  };

  const handleCloseDisasterProfileEditor = () => {
    setIsEditingDisasterProfile(false);
    setActiveRecoveryTierId(null);
  };

  const handleStartNewDisasterProfile = () => {
    if (
      !window.confirm(
        "Are you sure you want to clear the current disaster profile and start a new one?"
      )
    ) {
      return;
    }

    clearRecoveryProfile();
    setRecoveryAnswers({});
    setHasMatched(false);
    setIsEditingDisasterProfile(false);
    setActiveRecoveryTierId(null);
  };

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
        "We could not load the FEMA estimate right now. Please try again."
      );
    } finally {
      setFemaEstimateLoading(false);
    }
  };

  const shouldShowIntroCard = !hasDisasterProfile && !isEditingDisasterProfile;
  const shouldShowBaseContextCard =
    hasBaseRecoveryContext && !hasSavedRecoveryAnswers && !isEditingDisasterProfile && !hasMatched;
  const shouldShowSavedProfileCard =
    hasSavedRecoveryAnswers && !isEditingDisasterProfile && !hasMatched;
  const shouldShowForm = isEditingDisasterProfile;
  const shouldShowRecoveryPlan = hasDisasterProfile && hasMatched;

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
                This page organizes recovery documents, home photo records, mock aid matching,
                deadlines, and application statuses so you can keep post-disaster steps in one
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

        {shouldShowIntroCard ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">Create Disaster Profile</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              If your home or household was affected by a disaster, create a disaster profile to
              organize aid programs, documents, evidence photos, deadlines, and application
              status.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCreateDisasterProfile}
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Create Disaster Profile
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100"
              >
                Back to Dashboard
              </Link>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                FEMA Estimate
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                Historical FEMA IHP estimate
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                Use this form to estimate assistance from historical FEMA Individuals and
                Households Program records for a damaged home.
              </p>
            </div>

            <FemaAssistanceEstimateForm
              values={femaEstimatorAnswers}
              onChange={handleFemaEstimatorChange}
              onSubmit={handleFemaEstimatorSubmit}
              isSubmitting={femaEstimateLoading}
            />

            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              This estimate is based on historical FEMA Individuals and Households Program
              records. It is not a guarantee of FEMA eligibility or payment.
            </p>

            {femaEstimateError ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-700">
                {femaEstimateError}
              </p>
            ) : null}

            {femaEstimateResult ? (
              <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 border-b border-stone-100 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Estimate Result
                  </p>
                  <h3 className="text-xl font-semibold text-stone-900">Estimated FEMA IHP range</h3>
                  <p className="text-sm leading-6 text-stone-600">
                    Match level: <span className="font-semibold text-stone-900">{femaEstimateResult.matchLevel || "none"}</span>
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Eligibility rate
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-900">
                      {formatRate(femaEstimateResult.eligibilityRate)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Sample size
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-900">
                      {femaEstimateResult.sampleSize ?? "No match"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Match level
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-900">
                      {femaEstimateResult.matchLevel || "none"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Housing
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatMoney(femaEstimateResult.assistanceBreakdown?.housing)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Other needs
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatMoney(femaEstimateResult.assistanceBreakdown?.otherNeeds)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Rental
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatMoney(femaEstimateResult.assistanceBreakdown?.rental)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Repair
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatMoney(femaEstimateResult.assistanceBreakdown?.repair)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                      Personal property
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatMoney(femaEstimateResult.assistanceBreakdown?.personalProperty)}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </section>

        {shouldShowBaseContextCard ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">Aid Eligibility Check</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              We already know some of this from My Info, so the checklist only asks what is still
              missing.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {baseRecoveryAnswers.addressOrZip ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                    ZIP code
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {baseRecoveryAnswers.addressOrZip}
                  </p>
                </div>
              ) : null}
              {baseRecoveryAnswers.ownershipStatus ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                    Housing
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {baseRecoveryAnswers.ownershipStatus}
                  </p>
                </div>
              ) : null}
              {baseRecoveryAnswers.insuranceStatus ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                    Insurance
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {baseRecoveryAnswers.insuranceStatus}
                  </p>
                </div>
              ) : null}
              {baseRecoveryAnswers.hasGovernmentId ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                    ID
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {baseRecoveryAnswers.hasGovernmentId}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCreateDisasterProfile}
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Continue Aid Eligibility Check
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100"
              >
                Back to Dashboard
              </Link>
            </div>
          </section>
        ) : null}

        {shouldShowSavedProfileCard ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">
              Disaster profile already created
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              You already created a disaster recovery profile. You can review the matched aid plan
              or edit your responses.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleReviewRecoveryPlan}
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Review Recovery Plan
              </button>
              <button
                type="button"
                onClick={handleEditDisasterProfile}
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100"
              >
                Edit Response
              </button>
              <button
                type="button"
                onClick={handleStartNewDisasterProfile}
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                Start New Disaster Profile
              </button>
            </div>
          </section>
        ) : null}

        {shouldShowForm ? (
          <AidEligibilityForm
            answers={combinedRecoveryAnswers}
            onChange={(nextAnswers) => {
              const nextRecoveryAnswers = stripBaseAnswers(nextAnswers, baseRecoveryAnswers);
              setRecoveryAnswers(nextRecoveryAnswers);
            }}
            onSubmit={handleSubmit}
            activeTierId={activeRecoveryTierId}
            onActiveTierChange={setActiveRecoveryTierId}
            onClose={handleCloseDisasterProfileEditor}
            hiddenQuestionIds={inheritedQuestionIds}
          />
        ) : null}

        {shouldShowRecoveryPlan ? (
          <>
            <RecoveryChecklist matchedPrograms={matchedPrograms ?? []} answers={combinedRecoveryAnswers} />
            <HomePhotoGallery />

            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Aid matches, estimated amounts, and deadlines shown here are mock educational
              estimates for MVP demonstration. They are not official FEMA, SBA, insurance, state,
              or local government determinations.
            </p>

            <DeadlineTracker programs={aidDeadlines} />
            <AidApplicationStatusList />
          </>
        ) : null}
      </div>
    </main>
  );
}
