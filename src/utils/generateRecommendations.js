import { ecoSolutions } from "../data/ecoSolutions";

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

export function generateRecommendations(regionalRisk, homeProfile) {
  if (!regionalRisk || !homeProfile) return [];

  const recommendations = [];

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

  return recommendations.slice(0, 8);
}