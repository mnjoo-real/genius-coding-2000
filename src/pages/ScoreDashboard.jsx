import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ScoreGauge from '../components/score/ScoreGauge';
import WeaknessList from '../components/score/WeaknessList';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import { calculateScore } from '../utils/calculateScore';
import { getProjectedScoreDetails } from '../utils/calculateProjectedScore';
import { generateRecommendations } from '../utils/generateRecommendations';
import { readHomeProfile, readRegionalRisk } from '../services/userInfoSyncService';

function impactToPriority(impactLevel) {
  if (impactLevel === 'High')   return 'now';
  if (impactLevel === 'Medium') return 'soon';
  return 'later';
}

function getScoreLabel(score) {
  if (score >= 66) return { text: 'Well Prepared', className: 'text-leaf'      };
  if (score >= 41) return { text: 'Moderate',      className: 'text-amber-500' };
  return              { text: 'High Risk',     className: 'text-red-500'   };
}

function InfoTooltip({ label, description }) {
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        aria-describedby={`${label}-tooltip`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 bg-white text-[11px] font-semibold text-stone-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 focus-visible:border-emerald-400 focus-visible:text-emerald-700"
      >
        ?
      </button>
      <div
        id={`${label}-tooltip`}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-2xl bg-stone-900 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {description}
      </div>
    </div>
  );
}

export default function ScoreDashboard() {
  const [doneActionIds,   setDoneActionIds]   = useState([]);
  const [homeProfile] = useState(() => readHomeProfile());
  const [regionalRisk] = useState(() => readRegionalRisk());
  const recommendationsTooltipId = useId();

  const scoreData = useMemo(() => {
    if (!homeProfile || !regionalRisk) return null;

    try {
      return calculateScore(regionalRisk, homeProfile);
    } catch {
      return null;
    }
  }, [homeProfile, regionalRisk]);

  const recommendations = useMemo(() => {
    if (!homeProfile || !regionalRisk || !scoreData) return [];

    try {
      return generateRecommendations(regionalRisk, homeProfile, scoreData);
    } catch {
      return [];
    }
  }, [homeProfile, regionalRisk, scoreData]);

  const completedRecommendations = useMemo(
    () => recommendations.filter((recommendation) => doneActionIds.includes(recommendation.id)),
    [recommendations, doneActionIds],
  );

  const projectedScore = useMemo(
    () => getProjectedScoreDetails(scoreData, completedRecommendations),
    [scoreData, completedRecommendations],
  );

  const handleDoneToggle = (actionId) => {
    setDoneActionIds(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  if (!homeProfile || !regionalRisk) {
    return (
      <main className="min-h-screen bg-parchment px-6 py-16">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center py-16">
          <h2 className="text-2xl">No data found</h2>
          <p className="mt-3 text-stone-500">
            Please complete the location and home assessment steps first.
          </p>
          <Link
            to="/location"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-leaf px-4 py-2 text-base font-medium text-white no-underline transition-colors hover:bg-forest"
          >
            Go to Location Setup
          </Link>
        </div>
      </main>
    );
  }

  const maxAchievableScore = scoreData?.maxAchievableScore ?? 100;
  const displayScore = projectedScore.totalScore;
  const displayCategoryScores = projectedScore.categoryScores ?? scoreData.categoryScores;
  const scoreImproved = displayScore > scoreData.totalScore;

  const label = getScoreLabel(displayScore);

  const categories = scoreData
    ? [
        { name: 'Location risk',         score: displayCategoryScores.locationRiskScore,         maxScore: 25 },
        { name: 'Home vulnerability',    score: displayCategoryScores.homeVulnerabilityScore,    maxScore: 25 },
        { name: 'Eco-mitigation',        score: displayCategoryScores.ecoMitigationScore,        maxScore: 25 },
        { name: 'Recovery preparedness', score: displayCategoryScores.recoveryPreparednessScore, maxScore: 25 },
      ]
    : [];

  return (
    <main className="min-h-screen bg-parchment px-6 py-12">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl">Your Canopy Score</h1>
        <p className="mt-2 mb-10 text-stone-500">Based on your location and home assessment.</p>

        {!scoreData ? (
          <p className="text-center text-stone-500">Calculating your score…</p>
        ) : (
          <>
            {/* ── Two-column layout (stacks on mobile) ─────────────── */}
            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-5 lg:gap-8 lg:items-start">

              {/* ── LEFT COLUMN: gauge + info (sticky on desktop) ───── */}
              <aside className="lg:col-span-2 flex flex-col gap-6 lg:sticky lg:top-8">

                {/* Gauge + dynamic label */}
                <div className="flex flex-col items-center gap-2">
                  <ScoreGauge score={displayScore} size="lg" />
                  <span className={`text-sm font-semibold ${label.className}`}>
                    {label.text}
                  </span>
                </div>

                {/* Score explanation */}
                <div>
                  <h3 className="text-sm font-semibold text-stone-700 mb-1.5">
                    What is your Canopy Score?
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Your Canopy Score measures how protected your home is from natural
                    disasters. A higher score means you're better prepared. Scores range
                    from 0–100: 0–40 is High Risk, 41–65 is Moderate, 66–100 is Well
                    Prepared.
                  </p>
                </div>

                {/* Category breakdown bars */}
                <WeaknessList categories={categories} />

                {/* Score info box */}
                <div className="rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-xs text-stone-500 space-y-0.5">
                  <p>
                    Current:{' '}
                    <span className="font-medium text-stone-700">{displayScore}</span> / 100
                  </p>
                  <p>
                    Max achievable:{' '}
                    <span className="font-medium text-stone-700">{maxAchievableScore}</span> / 100
                  </p>
                  <p className="mt-1.5">
                    Location risk is fixed by your ZIP code — your action plan focuses on
                    the categories you can improve.
                  </p>
                </div>

              </aside>

              {/* ── RIGHT COLUMN: recommendation cards ──────────────── */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
                    Recommended Actions
                  </p>
                  <InfoTooltip
                    label={recommendationsTooltipId}
                    description="These actions are ranked from your score gaps, home vulnerabilities, and the biggest score gains available first."
                  />
                </div>

                {recommendations.length === 0 ? (
                  <p className="text-sm text-stone-400">No recommendations available.</p>
                ) : (
                  recommendations.map(r => (
                    <RecommendationCard
                      key={r.id}
                      title={r.title}
                      detail={r.description}
                      priority={impactToPriority(r.impactLevel)}
                      pointsGain={r.pointsGain ?? r.scoreIncrease}
                      scoreImproved={scoreImproved}
                      cost={r.estimatedCost}
                      isDone={doneActionIds.includes(r.id)}
                      onToggle={() => handleDoneToggle(r.id)}
                    />
                  ))
                )}

                <Link
                  to="/recovery"
                  className="mt-6 inline-flex w-fit self-end items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-emerald-800"
                >
                  Open Recovery Center
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
