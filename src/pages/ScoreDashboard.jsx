import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ScoreGauge from '../components/score/ScoreGauge';
import WeaknessList from '../components/score/WeaknessList';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import ScoreSimulationPanel from '../components/simulation/ScoreSimulationPanel';
import RecoveryPreviewCard from '../components/recovery/RecoveryPreviewCard';
import { calculateScore } from '../utils/calculateScore';
import { getTopRisks } from '../utils/getTopRisks';
import { generateRecommendations } from '../utils/generateRecommendations';
import { calculateProjectedScore } from '../utils/calculateProjectedScore';

function impactToPriority(impactLevel) {
  if (impactLevel === 'High')   return 'now';
  if (impactLevel === 'Medium') return 'soon';
  return 'later';
}

function getScoreLabel(score) {
  if (score >= 75) return { text: 'Prepared',  className: 'text-leaf'      };
  if (score >= 50) return { text: 'Moderate',  className: 'text-amber-500' };
  return             { text: 'At risk',   className: 'text-red-500'   };
}

export default function ScoreDashboard() {
  const navigate = useNavigate();
  const [homeProfile,  setHomeProfile]  = useState(null);
  const [regionalRisk, setRegionalRisk] = useState(null);
  const [scoreData,       setScoreData]       = useState(null);
  const [topRisks,        setTopRisks]        = useState(null);
  const [recommendations,   setRecommendations]   = useState([]);
  const [selectedActionIds, setSelectedActionIds] = useState([]);

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
      result               = calculateScore(regionalRisk, homeProfile);
      const topRisksResult = getTopRisks(regionalRisk);
      setScoreData(result);
      setTopRisks(topRisksResult);
    } catch {
      setScoreData(null);
      setTopRisks(null);
      setRecommendations([]);
      return;
    }
    try {
      setRecommendations(generateRecommendations(regionalRisk, homeProfile, result));
    } catch {
      setRecommendations([]);
    }
  }, [homeProfile, regionalRisk]);

  const handleToggle = (actionId) => {
    setSelectedActionIds(prev =>
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
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => navigate('/location')}
          >
            Start Over
          </Button>
        </div>
      </main>
    );
  }

  const label = scoreData ? getScoreLabel(scoreData.totalScore) : null;

  const categories = scoreData
    ? [
        { name: 'Location risk',         score: scoreData.categoryScores.locationRiskScore,         maxScore: 25, color: 'var(--color-red-500)'   },
        { name: 'Home vulnerability',    score: scoreData.categoryScores.homeVulnerabilityScore,    maxScore: 25, color: 'var(--color-red-500)'   },
        { name: 'Eco-mitigation',        score: scoreData.categoryScores.ecoMitigationScore,        maxScore: 25, color: 'var(--color-amber-400)' },
        { name: 'Recovery preparedness', score: scoreData.categoryScores.recoveryPreparednessScore, maxScore: 25, color: 'var(--color-amber-400)' },
      ]
    : [];
  const weakestArea = categories.length > 0
    ? categories.reduce((a, b) => (a.score < b.score ? a : b)).name
    : null;

  return (
    <main className="min-h-screen bg-parchment px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl">Your Canopy Score</h1>
          <p className="mt-2 text-stone-500">Based on your location and home assessment.</p>

          <div className="mt-10 flex flex-col gap-10">
            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Score &amp; Weaknesses
              </p>
              {!scoreData ? (
                <p className="text-center text-stone-500">Calculating your score...</p>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <ScoreGauge score={scoreData.totalScore} size="lg" />
                    <span className={`text-sm font-medium ${label.className}`}>
                      {label.text}
                    </span>
                  </div>
                  <WeaknessList categories={categories} />
                  <p className="text-sm text-stone-500">
                    Your weakest area: {weakestArea}
                  </p>
                </div>
              )}
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Recommended Actions
              </p>
              <h3 className="text-xl mb-4">Recommended actions</h3>
              {recommendations.length === 0 ? (
                <p className="text-sm text-stone-400">No recommendations available.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {recommendations.map(r => (
                    <RecommendationCard
                      key={r.id}
                      title={r.title}
                      detail={r.description}
                      priority={impactToPriority(r.impactLevel)}
                      pointsGain={r.pointsGain ?? r.scoreIncrease}
                      cost={r.estimatedCost}
                      onLearnMore={() => {}}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Score Simulator
              </p>
              <h3 className="text-xl mb-1">See your projected score</h3>
              <p className="text-sm text-stone-500 mb-6">
                Toggle actions to see how your score changes.
              </p>
              {scoreData && (
                <>
                  <ScoreSimulationPanel
                    baseScore={scoreData.totalScore}
                    actions={recommendations.map(r => ({
                      id: r.id,
                      title: r.title,
                      pointsGain: r.pointsGain ?? r.scoreIncrease,
                      selected: selectedActionIds.includes(r.id),
                    }))}
                    onToggle={handleToggle}
                  />
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-sm text-stone-500">Projected score:</span>
                    <span className="text-2xl font-bold text-leaf">
                      {calculateProjectedScore(
                        scoreData.totalScore,
                        recommendations
                          .filter(r => selectedActionIds.includes(r.id))
                          .map(r => ({
                            ...r,
                            scoreIncrease: r.pointsGain ?? r.scoreIncrease,
                          }))
                      )}
                    </span>
                  </div>
                </>
              )}
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Recovery Center
              </p>
              <h3 className="text-xl mb-1">Plan your recovery next</h3>
              <p className="text-sm text-stone-500 mb-6">
                Use the Recovery Center to organize documents, home photos, mock aid matching,
                deadlines, and application statuses after you finish preparedness.
              </p>
              <RecoveryPreviewCard />
            </section>
          </div>

          <div className="mt-12">
            <Button variant="secondary" size="sm" onClick={handleStartOver}>
              Start Over
            </Button>
          </div>
        </div>
      </main>
  );
}
