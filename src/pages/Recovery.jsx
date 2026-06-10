import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RecoveryChecklist from "../components/recovery/RecoveryChecklist";
import HomePhotoGallery from "../components/recovery/HomePhotoGallery";
import AidEligibilityForm from "../components/recovery/AidEligibilityForm";
import DeadlineTracker from "../components/recovery/DeadlineTracker";
import AidApplicationStatusList from "../components/recovery/AidApplicationStatusList";
import { matchAidPrograms } from "../utils/matchAidPrograms";

const STORAGE_KEY = "aidEligibilityAnswers";

function safeParseAnswers(rawValue) {
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to the safe default.
  }

  return {};
}

function getInitialAnswers() {
  if (typeof window === "undefined") {
    return {};
  }

  return safeParseAnswers(window.localStorage.getItem(STORAGE_KEY));
}

export default function Recovery() {
  const [answers, setAnswers] = useState(getInitialAnswers);
  const [hasMatched, setHasMatched] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const matchedPrograms = useMemo(() => {
    if (!hasMatched) {
      return [];
    }

    return matchAidPrograms(answers);
  }, [answers, hasMatched]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setHasMatched(true);
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

        <RecoveryChecklist />
        <HomePhotoGallery />
        <AidEligibilityForm
          answers={answers}
          onChange={setAnswers}
          onSubmit={handleSubmit}
        />

        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Aid matches, estimated amounts, and deadlines shown here are mock educational estimates
          for MVP demonstration. They are not official FEMA, SBA, insurance, state, or local
          government determinations.
        </p>

        <DeadlineTracker programs={matchedPrograms} disasterDate={answers.disasterDate} />
        <AidApplicationStatusList />
      </div>
    </main>
  );
}
