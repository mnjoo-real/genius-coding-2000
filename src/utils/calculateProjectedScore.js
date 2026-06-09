export function calculateProjectedScore(currentScore = 0, selectedRecommendations = []) {
  const baseScore = Number(currentScore) || 0;

  const improvement = selectedRecommendations.reduce((sum, recommendation) => {
    return sum + (Number(recommendation.scoreIncrease) || 0);
  }, 0);

  return Math.min(100, Math.round(baseScore + improvement));
}