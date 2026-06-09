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

const RECOVERY_DOCS = [
  { id: 'insurance',  docName: 'Home insurance policy',    status: 'missing',  required: true  },
  { id: 'id',         docName: 'Government-issued ID',      status: 'missing',  required: true  },
  { id: 'proof_addr', docName: 'Proof of address',          status: 'missing',  required: true  },
  { id: 'deed_lease', docName: 'Property deed or lease',    status: 'missing',  required: true  },
  { id: 'pre_photos', docName: 'Pre-disaster home photos',  status: 'missing',  required: true  },
  { id: 'medical',    docName: 'Medical needs document',    status: 'optional', required: false },
  { id: 'inventory',  docName: 'Home inventory list',       status: 'optional', required: false },
];

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

// Derives the four 0–25 sub-scores from raw inputs.
// calculateScore only returns { totalScore, weaknesses }; sub-scores are
// computed here using the same penalty rules so the breakdown stays consistent.
function deriveSubScores(regionalRisk, homeProfile) {
  const chk = (val, targets) =>
    Array.isArray(val)
      ? targets.some(t => val.includes(t))
      : targets.includes(val ?? '');

  const riskVals = [
    Number(regionalRisk.floodRisk)       || 0,
    Number(regionalRisk.wildfireRisk)    || 0,
    Number(regionalRisk.heatRisk)        || 0,
    Number(regionalRisk.stormRisk)       || 0,
    Number(regionalRisk.winterStormRisk) || 0,
  ];
  const avgRisk = riskVals.reduce((a, b) => a + b, 0) / 5;
  const locationRiskScore = Math.max(0, Math.round(25 - (avgRisk / 100) * 25));

  const hp = homeProfile;
  let sv = 0;
  if (chk(hp.basementOrCrawlSpace, ['Yes, basement', 'Yes, crawl space', 'Yes'])) sv += 6;
  if (chk(hp.homeAge,              ['Built before 1980', 'Before 1980', 'Older than 40 years'])) sv += 6;
  if (chk(hp.roofMaterial,         ['Asphalt shingles', 'Wood shake', 'Unknown', 'Not sure'])) sv += 5;
  if (chk(hp.windowDoorProtection, ['None', 'No', 'Standard windows', 'Not sure'])) sv += 6;
  if (chk(hp.pavedSurfaceLevel,    ['High', 'Mostly paved', 'Large paved area'])) sv += 6;
  if (chk(hp.waterPooling,         ['Yes', 'Often', 'Sometimes', 'Major pooling'])) sv += 8;
  if (chk(hp.dryBrushDistance,     ['Within 5 feet', 'Within 10 feet', 'Very close', 'Near the home'])) sv += 7;
  if (chk(hp.areaDensity,          ['Dense urban', 'Very dense', 'High density'])) sv += 4;
  const homeVulnerabilityScore = Math.max(0, Math.round(25 - (sv / 48) * 25));

  let ep = 0;
  if (!hp.ecoFeatures || chk(hp.ecoFeatures, ['None', 'Not sure'])) ep += 7;
  if (chk(hp.largeTreesNearby,        ['Yes, close to home', 'Yes', 'Large branches over roof'])) ep += 5;
  if (chk(hp.energyOrDrainageAudit,   ['No', 'Never', 'Not sure'])) ep += 4;
  const ecoMitigationScore = Math.max(0, Math.round(25 - (ep / 16) * 25));

  let rp = 0;
  if (chk(hp.insurancePolicy,            ['No', 'Not sure', 'I do not know'])) rp += 6;
  if (chk(hp.knowsPolicyCoverage,        ['No', 'Not sure', 'I do not know'])) rp += 5;
  if (chk(hp.digitalDocuments,           ['No', 'Not sure', 'Only paper copies'])) rp += 5;
  if (chk(hp.preDisasterPhotos,          ['No', 'Not sure', 'I have not taken photos'])) rp += 4;
  if (chk(hp.emergencyKit,               ['No', 'Incomplete', 'Not sure'])) rp += 6;
  if (chk(hp.familyEmergencyPlan,        ['No', 'Not sure', 'Informal only'])) rp += 6;
  if (chk(hp.localEmergencyRegistration, ['No', 'Not sure', 'I do not know'])) rp += 3;
  const recoveryPreparednessScore = Math.max(0, Math.round(25 - (rp / 35) * 25));

  const cats = [
    { name: 'Location risk',          score: locationRiskScore },
    { name: 'Home vulnerability',     score: homeVulnerabilityScore },
    { name: 'Eco-mitigation',         score: ecoMitigationScore },
    { name: 'Recovery preparedness',  score: recoveryPreparednessScore },
  ];
  const weakestArea = cats.reduce((a, b) => (a.score < b.score ? a : b)).name;

  return { locationRiskScore, homeVulnerabilityScore, ecoMitigationScore, recoveryPreparednessScore, weakestArea };
}

export default function ScoreDashboard() {
  const navigate = useNavigate();
  const [homeProfile,  setHomeProfile]  = useState(null);
  const [regionalRisk, setRegionalRisk] = useState(null);
  const [scoreData,       setScoreData]       = useState(null);
  const [topRisks,        setTopRisks]        = useState(null);
  const [recommendations,   setRecommendations]   = useState([]);
  const [selectedActionIds, setSelectedActionIds] = useState([]);
  const [uploadedDocIds,    setUploadedDocIds]    = useState([]);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('homeProfile'));
    const risk    = JSON.parse(localStorage.getItem('regionalRisk'));
    setHomeProfile(profile);
    setRegionalRisk(risk);
  }, []);

  useEffect(() => {
    if (!homeProfile || !regionalRisk) return;
    try {
      const result         = calculateScore(regionalRisk, homeProfile);
      const topRisksResult = getTopRisks(regionalRisk);
      const subScores      = deriveSubScores(regionalRisk, homeProfile);
      setScoreData({ ...result, ...subScores });
      setTopRisks(topRisksResult);
    } catch {
      setScoreData(null);
      setTopRisks(null);
    }
    try {
      setRecommendations(generateRecommendations(regionalRisk, homeProfile));
    } catch {
      setRecommendations([]);
    }
  }, [homeProfile, regionalRisk]);

  const handleUpload = (docId) => {
    setUploadedDocIds(prev =>
      prev.includes(docId) ? prev : [...prev, docId]
    );
  };

  const handleToggle = (actionId) => {
    setSelectedActionIds(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleStartOver = () => {
    if (!window.confirm('Are you sure? This will reset all your data.')) return;
    localStorage.removeItem('homeProfile');
    localStorage.removeItem('regionalRisk');
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

  const totalRequired    = RECOVERY_DOCS.filter(d => d.required).length;
  const uploadedRequired = RECOVERY_DOCS.filter(
    d => d.required && uploadedDocIds.includes(d.id)
  ).length;
  const vaultColorClass =
    uploadedRequired === totalRequired ? 'text-leaf'
    : uploadedRequired === 0           ? 'text-red-500'
    :                                    'text-amber-500';

  const categories = scoreData
    ? [
        { name: 'Location risk',         score: scoreData.locationRiskScore,         maxScore: 25, color: 'var(--color-red-500)'   },
        { name: 'Home vulnerability',    score: scoreData.homeVulnerabilityScore,    maxScore: 25, color: 'var(--color-red-500)'   },
        { name: 'Eco-mitigation',        score: scoreData.ecoMitigationScore,        maxScore: 25, color: 'var(--color-amber-400)' },
        { name: 'Recovery preparedness', score: scoreData.recoveryPreparednessScore, maxScore: 25, color: 'var(--color-amber-400)' },
      ]
    : [];

  return (
    <main className="min-h-screen bg-parchment px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl">Your DisasterReady Score</h1>
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
                    Your weakest area: {scoreData.weakestArea}
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
                      pointsGain={r.scoreIncrease}
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
                      pointsGain: r.scoreIncrease,
                      selected: selectedActionIds.includes(r.id),
                    }))}
                    onToggle={handleToggle}
                  />
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-sm text-stone-500">Projected score:</span>
                    <span className="text-2xl font-bold text-leaf">
                      {calculateProjectedScore(
                        scoreData.totalScore,
                        recommendations.filter(r => selectedActionIds.includes(r.id))
                      )}
                    </span>
                  </div>
                </>
              )}
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                Recovery Vault
              </p>
              <h3 className="text-xl mb-1">Recovery vault</h3>
              <p className="text-sm text-stone-500 mb-6">
                Upload your key documents now so you're ready to file a claim immediately after a disaster.
              </p>
              <div className="flex flex-col gap-3">
                {RECOVERY_DOCS.map(doc => {
                  const runtimeStatus = uploadedDocIds.includes(doc.id) ? 'uploaded' : doc.status;
                  return (
                    <RecoveryPreviewCard
                      key={doc.id}
                      docName={doc.docName}
                      status={runtimeStatus}
                      onUpload={() => handleUpload(doc.id)}
                    />
                  );
                })}
              </div>
              <p className={`mt-4 text-sm font-medium ${vaultColorClass}`}>
                {uploadedRequired} of {totalRequired} required documents uploaded
              </p>
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
