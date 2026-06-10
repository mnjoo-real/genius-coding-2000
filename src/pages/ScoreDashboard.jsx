import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ScoreGauge from '../components/score/ScoreGauge';
import WeaknessList from '../components/score/WeaknessList';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import RecoveryPreviewCard from '../components/recovery/RecoveryPreviewCard';
import { calculateScore } from '../utils/calculateScore';
import { generateRecommendations } from '../utils/generateRecommendations';

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

export default function ScoreDashboard() {
  const navigate = useNavigate();
  const [homeProfile,     setHomeProfile]     = useState(null);
  const [regionalRisk,    setRegionalRisk]    = useState(null);
  const [scoreData,       setScoreData]       = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [doneActionIds,   setDoneActionIds]   = useState([]);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('homeProfile'));
    const risk    = JSON.parse(localStorage.getItem('regionalRisk'));
    setHomeProfile(profile);
    setRegionalRisk(risk);
  }, []);

  useEffect(() => {
    if (!homeProfile || !regionalRisk) return;
    let result;
    try {
      result = calculateScore(regionalRisk, homeProfile);
      setScoreData(result);
    } catch {
      setScoreData(null);
      setRecommendations([]);
      return;
    }
    try {
      setRecommendations(generateRecommendations(regionalRisk, homeProfile, result));
    } catch {
      setRecommendations([]);
    }
  }, [homeProfile, regionalRisk]);

  const handleDoneToggle = (actionId) => {
    setDoneActionIds(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleStartOver = () => {
    if (!window.confirm('Are you sure? This will reset all your data.')) return;
    localStorage.removeItem('selectedZipCode');
    localStorage.removeItem('regionalRisk');
    localStorage.removeItem('homeProfile');
    navigate('/location');
  };

  if (!homeProfile || !regionalRisk) {
    return (
      <main className="min-h-screen bg-parchment px-6 py-16">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center py-16">
          <h2 className="text-2xl">No data found</h2>
          <p className="mt-3 text-stone-500">
            Please complete the location and home assessment steps first.
          </p>
          <Button variant="primary" className="mt-6" onClick={() => navigate('/location')}>
            Start Over
          </Button>
        </div>
      </main>
    );
  }

  const maxAchievableScore = scoreData?.maxAchievableScore ?? 100;

  // Add up points for every action the user has marked done, capped at max
  const doneGain = scoreData
    ? recommendations
        .filter(r => doneActionIds.includes(r.id))
        .reduce((sum, r) => sum + (r.pointsGain ?? r.scoreIncrease ?? 0), 0)
    : 0;
  const displayScore = scoreData
    ? Math.min(maxAchievableScore, scoreData.totalScore + doneGain)
    : 0;

  const label = getScoreLabel(displayScore);

  const categories = scoreData
    ? [
        { name: 'Location risk',         score: scoreData.categoryScores.locationRiskScore,         maxScore: 25, color: 'var(--color-red-500)'   },
        { name: 'Home vulnerability',    score: scoreData.categoryScores.homeVulnerabilityScore,    maxScore: 25, color: 'var(--color-red-500)'   },
        { name: 'Eco-mitigation',        score: scoreData.categoryScores.ecoMitigationScore,        maxScore: 25, color: 'var(--color-amber-400)' },
        { name: 'Recovery preparedness', score: scoreData.categoryScores.recoveryPreparednessScore, maxScore: 25, color: 'var(--color-amber-400)' },
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
                <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
                  Recommended Actions
                </p>

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
                      cost={r.estimatedCost}
                      isDone={doneActionIds.includes(r.id)}
                      onToggle={() => handleDoneToggle(r.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ── Recovery CTA (full-width below both columns) ─────── */}
            <section className="mt-14">
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Recovery Center
              </p>
              <RecoveryPreviewCard />
            </section>
          </>
        )}

        <div className="mt-10">
          <Button variant="secondary" size="sm" onClick={handleStartOver}>
            Start Over
          </Button>
        </div>

      </div>
    </main>
  );
}
