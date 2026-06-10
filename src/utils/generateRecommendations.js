import { ecoSolutions } from "../data/ecoSolutions";

const MAX_PER_CATEGORY = 25;
const CONTROLLABLE_CATEGORY_KEYS = [
  "homeVulnerability",
  "ecoMitigation",
  "recoveryPreparedness",
];
const PRIORITY_ORDER = {
  now: 0,
  soon: 1,
  later: 2,
};

function includesAnswer(value, target) {
  if (Array.isArray(value)) {
    return value.includes(target);
  }

  return value === target;
}

function hasAnyAnswer(value, targets) {
  if (Array.isArray(value)) {
    return targets.some((target) => value.includes(target));
  }

  return targets.includes(value);
}

function findSolutionById(id) {
  return ecoSolutions.find((solution) => solution.id === id);
}

function clampScore(value, min = 0, max = MAX_PER_CATEGORY) {
  const score = Number(value) || 0;
  return Math.max(min, Math.min(max, score));
}

function normalizeCategoryScores(scoreInput = {}) {
  const categoryScores = scoreInput.categoryScores || scoreInput;

  return {
    locationRiskScore: clampScore(categoryScores.locationRiskScore),
    homeVulnerabilityScore: clampScore(categoryScores.homeVulnerabilityScore),
    ecoMitigationScore: clampScore(categoryScores.ecoMitigationScore),
    recoveryPreparednessScore: clampScore(
      categoryScores.recoveryPreparednessScore
    ),
  };
}

function getCategoryGaps(scoreInput) {
  const categoryScores = normalizeCategoryScores(scoreInput);

  return {
    homeVulnerability:
      MAX_PER_CATEGORY - categoryScores.homeVulnerabilityScore,
    ecoMitigation: MAX_PER_CATEGORY - categoryScores.ecoMitigationScore,
    recoveryPreparedness:
      MAX_PER_CATEGORY - categoryScores.recoveryPreparednessScore,
  };
}

function getPriorityRank(priority) {
  return PRIORITY_ORDER[priority] ?? PRIORITY_ORDER.later;
}

function getClampedRecommendation(action, categoryGaps) {
  if (action.affects) {
    const clampedAffects = CONTROLLABLE_CATEGORY_KEYS.reduce((result, key) => {
      const rawGain = Number(action.affects[key]) || 0;
      const clampedGain = Math.min(rawGain, categoryGaps[key]);

      if (clampedGain > 0) {
        result[key] = clampedGain;
      }

      return result;
    }, {});

    const pointsGain = Object.values(clampedAffects).reduce(
      (sum, value) => sum + value,
      0
    );

    return {
      ...action,
      affects: clampedAffects,
      pointsGain,
    };
  }

  // scoreIncrease is a legacy fallback and should be replaced by affects in ecoSolutions.
  // Clamp it to controllable category room so it never implies location risk can improve.
  const controllableGap = Object.values(categoryGaps).reduce(
    (sum, value) => sum + value,
    0
  );
  const pointsGain = Math.min(Number(action.scoreIncrease) || 0, controllableGap);

  return {
    ...action,
    affects: {},
    pointsGain,
  };
}

function addRecommendation(recommendations, id) {
  const solution = findSolutionById(id);

  if (!solution) return;

  const alreadyExists = recommendations.some(
    (recommendation) => recommendation.id === solution.id
  );

  if (!alreadyExists) {
    recommendations.push(solution);
  }
}

export function generateRecommendations(regionalRisk, homeProfile, scoreInput) {
  if (!regionalRisk || !homeProfile) return [];

  const recommendations = [];
  const categoryGaps = getCategoryGaps(scoreInput);

  const floodRisk = Number(regionalRisk.floodRisk) || 0;
  const wildfireRisk = Number(regionalRisk.wildfireRisk) || 0;
  const heatRisk = Number(regionalRisk.heatRisk) || 0;
  const stormRisk = Number(regionalRisk.stormRisk) || 0;
  const winterStormRisk = Number(regionalRisk.winterStormRisk) || 0;

  if (floodRisk >= 60) {
    addRecommendation(recommendations, "rainGarden");
    addRecommendation(recommendations, "downspoutRedirection");
  }

  if (stormRisk >= 60) {
    addRecommendation(recommendations, "gutterCleaning");
    addRecommendation(recommendations, "largeTreeTrimming");
  }

  if (wildfireRisk >= 60) {
    addRecommendation(recommendations, "defensibleSpace");
    addRecommendation(recommendations, "emberResistantVents");
  }

  if (heatRisk >= 60) {
    addRecommendation(recommendations, "coolRoofCoating");
    addRecommendation(recommendations, "nativeShadeTrees");
  }

  if (winterStormRisk >= 60) {
    addRecommendation(recommendations, "pipeInsulation");
    addRecommendation(recommendations, "emergencyHeatingBackupPower");
  }

  if (
    hasAnyAnswer(homeProfile.waterPooling, [
      "Yes",
      "Often",
      "Sometimes",
      "Major pooling",
    ])
  ) {
    addRecommendation(recommendations, "rainGarden");
    addRecommendation(recommendations, "bioswale");
    addRecommendation(recommendations, "downspoutRedirection");
  }

  if (
    hasAnyAnswer(homeProfile.pavedSurfaceLevel, [
      "High",
      "Mostly paved",
      "Large paved area",
    ])
  ) {
    addRecommendation(recommendations, "permeablePavement");
  }

  if (
    hasAnyAnswer(homeProfile.basementOrCrawlSpace, [
      "Yes",
      "Yes, basement",
      "Yes, crawl space",
    ])
  ) {
    addRecommendation(recommendations, "sumpPump");
    addRecommendation(recommendations, "basementSealing");
  }

  if (
    hasAnyAnswer(homeProfile.dryBrushDistance, [
      "Within 5 feet",
      "Within 10 feet",
      "Very close",
      "Near the home",
    ])
  ) {
    addRecommendation(recommendations, "defensibleSpace");
    addRecommendation(recommendations, "gutterCleaning");
  }

  if (
    hasAnyAnswer(homeProfile.windowDoorProtection, [
      "None",
      "No",
      "Standard windows",
      "Not sure",
    ])
  ) {
    addRecommendation(recommendations, "hurricaneShutters");
    addRecommendation(recommendations, "impactResistantWindows");
  }

  if (
    hasAnyAnswer(homeProfile.largeTreesNearby, [
      "Yes",
      "Yes, close to home",
      "Large branches over roof",
    ])
  ) {
    addRecommendation(recommendations, "largeTreeTrimming");
  }

  if (
    hasAnyAnswer(homeProfile.roofMaterial, [
      "Asphalt shingles",
      "Wood shake",
      "Unknown",
      "Not sure",
    ])
  ) {
    addRecommendation(recommendations, "coolRoofCoating");
  }

  if (
    hasAnyAnswer(homeProfile.energyOrDrainageAudit, [
      "No",
      "Never",
      "Not sure",
    ])
  ) {
    addRecommendation(recommendations, "atticInsulationVentilation");
  }

  if (
    !homeProfile.ecoFeatures ||
    includesAnswer(homeProfile.ecoFeatures, "None") ||
    includesAnswer(homeProfile.ecoFeatures, "Not sure")
  ) {
    addRecommendation(recommendations, "rainBarrel");
    addRecommendation(recommendations, "nativeShadeTrees");
  }

  if (
    hasAnyAnswer(homeProfile.digitalDocuments, [
      "No",
      "Not sure",
      "Only paper copies",
    ])
  ) {
    addRecommendation(recommendations, "documentBackup");
  }

  if (
    hasAnyAnswer(homeProfile.preDisasterPhotos, [
      "No",
      "Not sure",
      "I have not taken photos",
    ])
  ) {
    addRecommendation(recommendations, "homeInventory");
  }

  if (
    hasAnyAnswer(homeProfile.familyEmergencyPlan, [
      "No",
      "Not sure",
      "Informal only",
    ])
  ) {
    addRecommendation(recommendations, "householdEmergencyPlan");
  }

  if (
    hasAnyAnswer(homeProfile.emergencyKit, [
      "No",
      "Incomplete",
      "Not sure",
    ])
  ) {
    addRecommendation(recommendations, "emergencyKit");
  }

  if (
    hasAnyAnswer(homeProfile.localEmergencyRegistration, [
      "No",
      "Not sure",
      "I do not know",
    ])
  ) {
    addRecommendation(recommendations, "localEmergencyRegistration");
  }

  if (
    hasAnyAnswer(homeProfile.insurancePolicy, [
      "No",
      "Not sure",
      "I do not know",
    ]) ||
    hasAnyAnswer(homeProfile.knowsPolicyCoverage, [
      "No",
      "Not sure",
      "I do not know",
    ])
  ) {
    addRecommendation(recommendations, "insuranceReview");
  }

  return recommendations
    .map((recommendation) =>
      getClampedRecommendation(recommendation, categoryGaps)
    )
    .filter((recommendation) => recommendation.pointsGain > 0)
    .sort((a, b) => {
      const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority);

      if (priorityDiff !== 0) return priorityDiff;

      return b.pointsGain - a.pointsGain;
    })
    .slice(0, 8);
}
