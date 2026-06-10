import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RecoveryChecklist from "../components/recovery/RecoveryChecklist";
import HomePhotoGallery from "../components/recovery/HomePhotoGallery";
import AidEligibilityForm from "../components/recovery/AidEligibilityForm";
import DeadlineTracker from "../components/recovery/DeadlineTracker";
import AidApplicationStatusList from "../components/recovery/AidApplicationStatusList";
import { calculateAidDeadlines } from "../utils/calculateAidDeadlines";
import { matchAidPrograms } from "../utils/matchAidPrograms";

const DISASTER_PROFILE_KEY = "disasterProfile";
const LEGACY_AID_ANSWERS_KEY = "aidEligibilityAnswers";

function safeParseAnswers(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to the safe default.
  }

  return null;
}

function getInitialState() {
  if (typeof window === "undefined") {
    return { answers: {}, hasDisasterProfile: false };
  }

  const disasterProfile = safeParseAnswers(
    window.localStorage.getItem(DISASTER_PROFILE_KEY)
  );
  if (disasterProfile) {
    return { answers: disasterProfile, hasDisasterProfile: true };
  }

  const legacyAnswers = safeParseAnswers(
    window.localStorage.getItem(LEGACY_AID_ANSWERS_KEY)
  );
  if (legacyAnswers) {
    return { answers: legacyAnswers, hasDisasterProfile: true };
  }

  return { answers: {}, hasDisasterProfile: false };
}

function persistDisasterProfile(nextAnswers) {
  if (typeof window === "undefined") {
    return;
  }

  const serializedAnswers = JSON.stringify(nextAnswers);
  window.localStorage.setItem(DISASTER_PROFILE_KEY, serializedAnswers);
  window.localStorage.setItem(LEGACY_AID_ANSWERS_KEY, serializedAnswers);
}

function clearDisasterProfile() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DISASTER_PROFILE_KEY);
  window.localStorage.removeItem(LEGACY_AID_ANSWERS_KEY);
}

export default function Recovery() {
  const initialState = getInitialState();
  const [answers, setAnswers] = useState(initialState.answers);
  const [hasMatched, setHasMatched] = useState(false);
  const [hasDisasterProfile, setHasDisasterProfile] = useState(initialState.hasDisasterProfile);
  const [isEditingDisasterProfile, setIsEditingDisasterProfile] = useState(false);

  const matchedPrograms = useMemo(() => {
    if (!hasMatched || !hasDisasterProfile) {
      return [];
    }

    try {
      return matchAidPrograms(answers);
    } catch {
      return [];
    }
  }, [answers, hasMatched, hasDisasterProfile]);

  const aidDeadlines = useMemo(() => {
    if (!hasMatched || !hasDisasterProfile || matchedPrograms.length === 0) {
      return [];
    }

    try {
      return calculateAidDeadlines(matchedPrograms, answers);
    } catch {
      return [];
    }
  }, [matchedPrograms, answers, hasMatched, hasDisasterProfile]);

  const handleSubmit = (nextAnswers) => {
    if (nextAnswers && typeof nextAnswers === "object" && !Array.isArray(nextAnswers)) {
      setAnswers(nextAnswers);
      persistDisasterProfile(nextAnswers);
    }

    setHasDisasterProfile(true);
    setHasMatched(true);
    setIsEditingDisasterProfile(false);
  };

  const handleCreateDisasterProfile = () => {
    setAnswers({});
    setHasMatched(false);
    setIsEditingDisasterProfile(true);
  };

  const handleEditDisasterProfile = () => {
    setHasMatched(false);
    setIsEditingDisasterProfile(true);
  };

  const handleReviewRecoveryPlan = () => {
    setHasMatched(true);
    setIsEditingDisasterProfile(false);
  };

  const handleStartNewDisasterProfile = () => {
    if (
      !window.confirm(
        "Are you sure you want to clear the current disaster profile and start a new one?"
      )
    ) {
      return;
    }

    clearDisasterProfile();
    setAnswers({});
    setHasMatched(false);
    setHasDisasterProfile(false);
    setIsEditingDisasterProfile(false);
  };

  const shouldShowIntroCard = !hasDisasterProfile && !isEditingDisasterProfile;
  const shouldShowSavedProfileCard = hasDisasterProfile && !isEditingDisasterProfile && !hasMatched;
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
            answers={answers}
            onChange={setAnswers}
            onSubmit={handleSubmit}
          />
        ) : null}

        {shouldShowRecoveryPlan ? (
          <>
            <RecoveryChecklist matchedPrograms={matchedPrograms ?? []} />
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
