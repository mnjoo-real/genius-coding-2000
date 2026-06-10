import { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ScoreGauge from '../components/score/ScoreGauge';
import WeaknessList from '../components/score/WeaknessList';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import { ecoSolutions } from '../data/ecoSolutions';
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

function getActionPointTotal(action) {
  if (action?.affects) {
    return Object.values(action.affects).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );
  }

  return Number(action?.scoreIncrease) || 0;
}

function groupActionsByCategory(actions) {
  return actions.reduce((groups, action) => {
    const category = action.category || 'Other';
    const existingGroup = groups.find((group) => group.category === category);

    if (existingGroup) {
      existingGroup.actions.push(action);
      return groups;
    }

    return [...groups, { category, actions: [action] }];
  }, []);
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

function AllActionsModal({ actionGroups, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 px-4 py-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-actions-title"
        className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
              Action Library
            </p>
            <h2 id="all-actions-title" className="mt-1 text-2xl">
              All Recommended Actions
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg font-semibold leading-none text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
            aria-label="Close all recommended actions"
          >
            x
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-7">
            {actionGroups.map((group) => (
              <section key={group.category} className="scroll-mt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-stone-900">
                    {group.category}
                  </h3>
                  <span className="rounded-full bg-moss px-3 py-1 text-xs font-medium text-forest">
                    {group.actions.length} actions
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {group.actions.map((action) => {
                    const points = getActionPointTotal(action);

                    return (
                      <article
                        key={action.id}
                        className="rounded-xl border border-stone-200 bg-parchment/50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-semibold leading-snug text-stone-900">
                            {action.title}
                          </h4>
                          {points > 0 && (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                              +{points} pts
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-stone-500">
                          {action.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {action.estimatedCost && (
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-600">
                              {action.estimatedCost}
                            </span>
                          )}
                          {action.impactLevel && (
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-600">
                              {action.impactLevel} impact
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ScoreDashboard() {
  const [doneActionIds,   setDoneActionIds]   = useState([]);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
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

  const allActionGroups = useMemo(
    () => groupActionsByCategory(ecoSolutions),
    [],
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
                  <button
                    type="button"
                    onClick={() => setIsActionsModalOpen(true)}
                    className="rounded-sm text-left text-xs font-medium uppercase tracking-widest text-stone-400 underline-offset-4 transition-colors hover:text-forest hover:underline focus-visible:text-forest"
                  >
                    Recommended Actions
                  </button>
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

            {isActionsModalOpen && (
              <AllActionsModal
                actionGroups={allActionGroups}
                onClose={() => setIsActionsModalOpen(false)}
              />
            )}
          </>
        )}

      </div>
    </main>
  );
}
