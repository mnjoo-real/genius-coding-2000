function clampScore(score, maxScore = 100) {
  return Math.min(maxScore, Math.max(0, Number(score) || 0));
}

function addFallbackGain(projected, gain) {
  let remainingGain = Math.max(0, Number(gain) || 0);
  const controllableCategories = [
    'homeVulnerabilityScore',
    'ecoMitigationScore',
    'recoveryPreparednessScore',
  ];

  controllableCategories.forEach((category) => {
    if (remainingGain <= 0) return;
    const room = 25 - projected[category];
    const appliedGain = Math.min(room, remainingGain);
    projected[category] = clampScore(projected[category] + appliedGain, 25);
    remainingGain -= appliedGain;
  });
}

export function calculateProjectedScore(scoreInput = 0, selectedRecommendations = []) {
  const actions = Array.isArray(selectedRecommendations) ? selectedRecommendations : [];

  // Legacy fallback for ScoreDashboard.jsx until it passes full scoreData.
  if (typeof scoreInput === 'number') {
    const baseScore = Number(scoreInput) || 0;

    const improvement = actions.reduce((sum, recommendation) => {
      return sum + (Number(recommendation.scoreIncrease ?? recommendation.pointsGain) || 0);
    }, 0);

    return Math.min(100, Math.max(0, Math.round(baseScore + improvement)));
  }

  const categoryScores = scoreInput?.categoryScores;

  if (!categoryScores) {
    return 0;
  }

  const projected = {
    locationRiskScore: clampScore(categoryScores.locationRiskScore, 25),
    homeVulnerabilityScore: clampScore(categoryScores.homeVulnerabilityScore, 25),
    ecoMitigationScore: clampScore(categoryScores.ecoMitigationScore, 25),
    recoveryPreparednessScore: clampScore(categoryScores.recoveryPreparednessScore, 25),
  };

  actions.forEach((action) => {
    const affects = action?.affects;

    if (affects) {
      projected.homeVulnerabilityScore = clampScore(
        projected.homeVulnerabilityScore + (Number(affects.homeVulnerability) || 0),
        25,
      );
      projected.ecoMitigationScore = clampScore(
        projected.ecoMitigationScore + (Number(affects.ecoMitigation) || 0),
        25,
      );
      projected.recoveryPreparednessScore = clampScore(
        projected.recoveryPreparednessScore + (Number(affects.recoveryPreparedness) || 0),
        25,
      );
      return;
    }

    addFallbackGain(projected, action?.pointsGain ?? action?.scoreIncrease);
  });

  const projectedTotal =
    projected.locationRiskScore +
    projected.homeVulnerabilityScore +
    projected.ecoMitigationScore +
    projected.recoveryPreparednessScore;

  return Math.min(100, Math.max(0, Math.round(projectedTotal)));
}
