export function getTopRisks(regionalRisk) {
  if (!regionalRisk) return [];

  const risks = [
    {
      label: "Flood",
      key: "floodRisk",
      score: Number(regionalRisk.floodRisk) || 0,
    },
    {
      label: "Wildfire",
      key: "wildfireRisk",
      score: Number(regionalRisk.wildfireRisk) || 0,
    },
    {
      label: "Heat Wave",
      key: "heatRisk",
      score: Number(regionalRisk.heatRisk) || 0,
    },
    {
      label: "Storm",
      key: "stormRisk",
      score: Number(regionalRisk.stormRisk) || 0,
    },
    {
      label: "Winter Storm",
      key: "winterStormRisk",
      score: Number(regionalRisk.winterStormRisk) || 0,
    },
  ];

  return risks.sort((a, b) => b.score - a.score).slice(0, 3);
}