function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

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

export function calculateScore(regionalRisk, homeProfile) {
  if (!regionalRisk || !homeProfile) {
    return {
      totalScore: 0,
      weaknesses: ["Complete the location and home questionnaire first."],
    };
  }

  let score = 100;
  const weaknesses = [];

  const riskValues = [
    Number(regionalRisk.floodRisk) || 0,
    Number(regionalRisk.wildfireRisk) || 0,
    Number(regionalRisk.heatRisk) || 0,
    Number(regionalRisk.stormRisk) || 0,
    Number(regionalRisk.winterStormRisk) || 0,
  ];

  const averageRegionalRisk =
    riskValues.reduce((sum, value) => sum + value, 0) / riskValues.length;

  const regionalPenalty = Math.round(averageRegionalRisk * 0.18);
  score -= regionalPenalty;

  if (averageRegionalRisk >= 70) {
    weaknesses.push("Your region has high overall disaster exposure.");
  } else if (averageRegionalRisk >= 45) {
    weaknesses.push("Your region has moderate disaster exposure.");
  }

  if (
    hasAnyAnswer(homeProfile.basementOrCrawlSpace, [
      "Yes, basement",
      "Yes, crawl space",
      "Yes",
    ])
  ) {
    score -= 6;
    weaknesses.push("Basement or crawl space may increase flood vulnerability.");
  }

  if (
    hasAnyAnswer(homeProfile.homeAge, [
      "Built before 1980",
      "Before 1980",
      "Older than 40 years",
    ])
  ) {
    score -= 6;
    weaknesses.push("Older homes may need structural and efficiency upgrades.");
  }

  if (
    hasAnyAnswer(homeProfile.roofMaterial, [
      "Asphalt shingles",
      "Wood shake",
      "Unknown",
      "Not sure",
    ])
  ) {
    score -= 5;
    weaknesses.push("Roof material may be vulnerable to wind, heat, or wildfire exposure.");
  }

  if (
    hasAnyAnswer(homeProfile.windowDoorProtection, [
      "None",
      "No",
      "Standard windows",
      "Not sure",
    ])
  ) {
    score -= 6;
    weaknesses.push("Windows and doors may need stronger storm protection.");
  }

  if (
    hasAnyAnswer(homeProfile.pavedSurfaceLevel, [
      "High",
      "Mostly paved",
      "Large paved area",
    ])
  ) {
    score -= 6;
    weaknesses.push("High paved surface coverage can worsen stormwater runoff.");
  }

  if (
    hasAnyAnswer(homeProfile.waterPooling, [
      "Yes",
      "Often",
      "Sometimes",
      "Major pooling",
    ])
  ) {
    score -= 8;
    weaknesses.push("Water pooling near the home increases flood and foundation risk.");
  }

  if (
    hasAnyAnswer(homeProfile.dryBrushDistance, [
      "Within 5 feet",
      "Within 10 feet",
      "Very close",
      "Near the home",
    ])
  ) {
    score -= 7;
    weaknesses.push("Dry vegetation close to the home increases wildfire vulnerability.");
  }

  if (
    hasAnyAnswer(homeProfile.areaDensity, [
      "Dense urban",
      "Very dense",
      "High density",
    ])
  ) {
    score -= 4;
    weaknesses.push("Dense surroundings can increase heat and drainage stress.");
  }

  if (
    !homeProfile.ecoFeatures ||
    includesAnswer(homeProfile.ecoFeatures, "None") ||
    includesAnswer(homeProfile.ecoFeatures, "Not sure")
  ) {
    score -= 7;
    weaknesses.push("Few existing eco-mitigation features were reported.");
  }

  if (
    hasAnyAnswer(homeProfile.largeTreesNearby, [
      "Yes, close to home",
      "Yes",
      "Large branches over roof",
    ])
  ) {
    score -= 5;
    weaknesses.push("Large nearby trees or overhanging branches may increase storm damage risk.");
  }

  if (
    hasAnyAnswer(homeProfile.energyOrDrainageAudit, [
      "No",
      "Never",
      "Not sure",
    ])
  ) {
    score -= 4;
    weaknesses.push("No recent home energy or drainage audit was reported.");
  }

  if (
    hasAnyAnswer(homeProfile.insurancePolicy, [
      "No",
      "Not sure",
      "I do not know",
    ])
  ) {
    score -= 6;
    weaknesses.push("Insurance readiness is unclear or incomplete.");
  }

  if (
    hasAnyAnswer(homeProfile.knowsPolicyCoverage, [
      "No",
      "Not sure",
      "I do not know",
    ])
  ) {
    score -= 5;
    weaknesses.push("Policy coverage details are not clearly understood.");
  }

  if (
    hasAnyAnswer(homeProfile.digitalDocuments, [
      "No",
      "Not sure",
      "Only paper copies",
    ])
  ) {
    score -= 5;
    weaknesses.push("Important documents may not be backed up digitally.");
  }

  if (
    hasAnyAnswer(homeProfile.preDisasterPhotos, [
      "No",
      "Not sure",
      "I have not taken photos",
    ])
  ) {
    score -= 4;
    weaknesses.push("Pre-disaster home photos are missing or incomplete.");
  }

  if (
    hasAnyAnswer(homeProfile.emergencyKit, [
      "No",
      "Incomplete",
      "Not sure",
    ])
  ) {
    score -= 6;
    weaknesses.push("Emergency kit readiness is incomplete.");
  }

  if (
    hasAnyAnswer(homeProfile.familyEmergencyPlan, [
      "No",
      "Not sure",
      "Informal only",
    ])
  ) {
    score -= 6;
    weaknesses.push("Household emergency plan is missing or informal.");
  }

  if (
    hasAnyAnswer(homeProfile.localEmergencyRegistration, [
      "No",
      "Not sure",
      "I do not know",
    ])
  ) {
    score -= 3;
    weaknesses.push("Local emergency alert registration may be missing.");
  }

  if (weaknesses.length === 0) {
    weaknesses.push("No major vulnerabilities detected from your answers.");
  }

  return {
    totalScore: clampScore(score),
    weaknesses,
  };
}