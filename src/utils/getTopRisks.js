import { getRelativeRiskValue } from './riskDisplay';

export function getTopRisks(regionalRisk) {
  if (!regionalRisk) return [];

  const risks = [
    {
      label: "Flood",
      key: "floodRisk",
      score: getRelativeRiskValue(regionalRisk, "floodRisk"),
    },
    {
      label: "Wildfire",
      key: "wildfireRisk",
      score: getRelativeRiskValue(regionalRisk, "wildfireRisk"),
    },
    {
      label: "Heat Wave",
      key: "heatRisk",
      score: getRelativeRiskValue(regionalRisk, "heatRisk"),
    },
    {
      label: "Storm",
      key: "stormRisk",
      score: getRelativeRiskValue(regionalRisk, "stormRisk"),
    },
    {
      label: "Winter Storm",
      key: "winterStormRisk",
      score: getRelativeRiskValue(regionalRisk, "winterStormRisk"),
    },
  ];

  return risks.sort((a, b) => b.score - a.score).slice(0, 3);
}
