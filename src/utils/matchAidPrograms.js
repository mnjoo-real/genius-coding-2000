import { aidPrograms } from "../data/aidPrograms";

// MVP eligibility guidance only; this is not an official benefits determination.

function normalizeAnswers(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMultiValue(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
}

function isYes(value) {
  return normalizeString(value) === "Yes";
}

function isNo(value) {
  return normalizeString(value) === "No";
}

function hasAnyValue(values, targets) {
  const source = normalizeMultiValue(values).map((item) => normalizeString(item).toLowerCase());
  const targetSet = new Set(normalizeMultiValue(targets).map((item) => normalizeString(item).toLowerCase()));

  return source.some((value) => targetSet.has(value));
}

function normalizeDisasterValue(value) {
  const normalized = normalizeString(value).toLowerCase();

  if (!normalized) {
    return [];
  }

  if (normalized === "heat" || normalized === "extreme heat") {
    return ["heat", "extreme heat"];
  }

  if (normalized === "hurricane") {
    return ["hurricane", "storm"];
  }

  return [normalized];
}

function buildDisasterSet(values) {
  return normalizeMultiValue(values).flatMap((value) => normalizeDisasterValue(value));
}

function buildDocumentWarnings(program = {}, answers = {}) {
  const requiredDocumentIds = Array.isArray(program.requiredDocumentIds)
    ? program.requiredDocumentIds
    : [];
  const missingDocuments = [];
  const warnings = [];

  const check = (documentId, condition, warning) => {
    if (!requiredDocumentIds.includes(documentId) || !condition) {
      return;
    }

    missingDocuments.push(documentId);
    warnings.push(warning);
  };

  check(
    "government-id",
    ["No", "Not sure"].includes(normalizeString(answers.hasGovernmentId)),
    "Government ID may be needed.",
  );
  check(
    "ssn-or-itin",
    ["Neither", "Not sure"].includes(normalizeString(answers.hasSsnOrItin)),
    "SSN or ITIN may be needed.",
  );
  check(
    "proof-of-occupancy",
    normalizeString(answers.isPrimaryResidence) === "No" || !isYes(answers.isPrimaryResidence),
    "Proof of occupancy may be needed.",
  );
  check(
    "proof-of-ownership",
    normalizeString(answers.ownershipStatus) !== "Owner",
    "Proof of ownership may be needed.",
  );
  check(
    "insurance-settlement-or-denial",
    ["Not filed", "Pending", "Not applicable", "Not sure"].includes(normalizeString(answers.insuranceClaimStatus)) ||
      ["Insured", "Partially Insured"].includes(normalizeString(answers.insuranceStatus)),
    "Insurance settlement or denial documents may be needed.",
  );
  check(
    "damage-photos",
    ["No", "Not yet"].includes(normalizeString(answers.hasDamagePhotos)),
    "Damage photos may be needed.",
  );
  check(
    "repair-estimates",
    ["No", "Not yet"].includes(normalizeString(answers.hasRepairEstimates)),
    "Repair estimates may be needed.",
  );
  check(
    "emergency-receipts",
    ["No", "Not yet"].includes(normalizeString(answers.hasEmergencyReceipts)),
    "Emergency expense receipts may be needed.",
  );
  check(
    "tax-returns",
    ["No", "Not sure"].includes(normalizeString(answers.hasTaxReturns)),
    "Recent tax returns may be needed.",
  );
  check(
    "proof-of-income",
    ["No", "Not sure"].includes(normalizeString(answers.hasPayStubs)),
    "Proof of income may be needed.",
  );
  check(
    "bank-account-details",
    ["No", "Not sure"].includes(normalizeString(answers.hasBankAccount)),
    "Bank account details may be needed.",
  );

  return { missingDocuments, warnings };
}

function hasEnoughContext(answers) {
  return [
    answers.disasterType,
    answers.recoveryNeeds,
    answers.ownershipStatus,
    answers.hasDisasterDeclaration,
    answers.declarationDate,
    answers.disasterDate,
    answers.citizenshipStatus,
    answers.hasEligibleHouseholdMember,
    answers.isPrimaryResidence,
    answers.homeLivability,
    answers.insuranceStatus,
    answers.insuranceTypes,
    answers.insuranceClaimStatus,
    answers.floodDamageExceedsPolicyLimit,
    answers.damageTypes,
    answers.lostJobOrIncome,
    answers.employmentType,
    answers.hasTaxReturns,
    answers.hasPayStubs,
    answers.hasBankAccount,
    answers.preferredPaymentMethod,
    answers.needsAlternativePayment,
    answers.hasGovernmentId,
    answers.hasSsnOrItin,
    answers.hasDamagePhotos,
    answers.hasRepairEstimates,
    answers.hasEmergencyReceipts,
    answers.annualHouseholdIncome,
  ].some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(normalizeString(value));
  });
}

function matchDisasterType(answersDisasterType, programDisasterTypes) {
  const selected = buildDisasterSet([answersDisasterType]);
  const allowed = buildDisasterSet(programDisasterTypes);

  return selected.some((value) => allowed.includes(value));
}

function findLegacyNeedMatch(recoveryNeeds, eligibilityTags) {
  return hasAnyValue(recoveryNeeds, eligibilityTags);
}

function evaluateProgram(program = {}, answers = {}) {
  const matchReasons = [];
  const cautionReasons = [];
  const blockedReasons = [];
  let matchScore = 0;

  const disasterType = normalizeString(answers.disasterType);
  const recoveryNeeds = normalizeMultiValue(answers.recoveryNeeds);
  const damageTypes = normalizeMultiValue(answers.damageTypes);
  const ownershipStatus = normalizeString(answers.ownershipStatus);
  const citizenshipStatus = normalizeString(answers.citizenshipStatus);
  const insuranceStatus = normalizeString(answers.insuranceStatus);
  const insuranceClaimStatus = normalizeString(answers.insuranceClaimStatus);

  const programDisasterTypes = Array.isArray(program.disasterTypes)
    ? program.disasterTypes
    : [];
  const programEligibilityTags = Array.isArray(program.eligibilityTags)
    ? program.eligibilityTags
    : [];
  const programEligibleOwnershipStatuses = Array.isArray(program.eligibleOwnershipStatuses)
    ? program.eligibleOwnershipStatuses
    : [];
  const programEligibleDamageTypes = Array.isArray(program.eligibleDamageTypes)
    ? program.eligibleDamageTypes
    : [];
  const requiresDeclaredDisaster = Boolean(program.requiresDeclaredDisaster);
  const requiresPrimaryResidence = Boolean(program.requiresPrimaryResidence);
  const requiresEligibleCitizenshipStatus = Boolean(program.requiresEligibleCitizenshipStatus);
  const acceptsMixedStatusHousehold = Boolean(program.acceptsMixedStatusHousehold);
  const requiresWorkLoss = Boolean(program.requiresWorkLoss);
  const insuranceDependency = normalizeString(program.insuranceDependency);
  const hasStructuredEligibility =
    programEligibleOwnershipStatuses.length > 0 ||
    requiresDeclaredDisaster ||
    requiresPrimaryResidence ||
    requiresEligibleCitizenshipStatus ||
    requiresWorkLoss ||
    programEligibleDamageTypes.length > 0;
  const documentReadiness = buildDocumentWarnings(program, answers);

  if (!hasEnoughContext(answers)) {
    return null;
  }

  if (requiresDeclaredDisaster) {
    if (isNo(answers.hasDisasterDeclaration)) {
      blockedReasons.push("Official disaster declaration is required.");
    } else if (isYes(answers.hasDisasterDeclaration)) {
      matchReasons.push("Official disaster declaration is confirmed.");
      matchScore += 3;
    } else {
      cautionReasons.push("Official disaster declaration needs to be verified.");
    }
  }

  if (disasterType && programDisasterTypes.length > 0) {
    if (matchDisasterType(disasterType, programDisasterTypes)) {
      matchReasons.push("Disaster type appears to align with this program.");
      matchScore += 2;
    } else {
      blockedReasons.push("Disaster type does not appear to fit this program.");
    }
  }

  if (programEligibleOwnershipStatuses.length > 0) {
    if (ownershipStatus) {
      if (programEligibleOwnershipStatuses.includes(ownershipStatus)) {
        matchReasons.push("Ownership status fits this program.");
        matchScore += 2;
      } else {
        blockedReasons.push("Ownership status does not fit this program.");
      }
    } else {
      cautionReasons.push("Ownership status needs to be verified.");
    }
  } else if (!hasStructuredEligibility && ownershipStatus === "Renter" && programEligibilityTags.includes("property-owner")) {
    blockedReasons.push("This legacy program appears to be for owners only.");
  }

  if (requiresPrimaryResidence) {
    if (isNo(answers.isPrimaryResidence)) {
      blockedReasons.push("Primary residence status is required.");
    } else if (isYes(answers.isPrimaryResidence) || hasAnyValue(recoveryNeeds, ["primary-residence"])) {
      matchReasons.push("Primary residence requirement appears to be met.");
      matchScore += 2;
    } else {
      cautionReasons.push("Primary residence status needs to be verified.");
    }
  }

  if (requiresEligibleCitizenshipStatus) {
    const eligibleStatuses = ["U.S. citizen or national", "Qualified non-citizen"];
    const mixedStatusEligible =
      citizenshipStatus === "Mixed-status household" &&
      acceptsMixedStatusHousehold &&
      isYes(answers.hasEligibleHouseholdMember);

    if (eligibleStatuses.includes(citizenshipStatus) || mixedStatusEligible) {
      matchReasons.push("Citizenship or household eligibility appears to fit.");
      matchScore += 2;
    } else if (citizenshipStatus === "Undocumented") {
      if (acceptsMixedStatusHousehold && isYes(answers.hasEligibleHouseholdMember)) {
        cautionReasons.push("Citizenship or qualified household eligibility needs to be verified.");
      } else {
        blockedReasons.push("Citizenship or household eligibility does not fit this program.");
      }
    } else {
      cautionReasons.push("Citizenship or qualified household eligibility needs to be verified.");
    }
  }

  if (requiresWorkLoss) {
    if (isYes(answers.lostJobOrIncome)) {
      matchReasons.push("Work or income loss fits this program.");
      matchScore += 2;
    } else if (isNo(answers.lostJobOrIncome)) {
      blockedReasons.push("Work or income loss is required.");
    } else {
      cautionReasons.push("Work or income loss needs to be verified.");
    }
  }

  if (programEligibleDamageTypes.length > 0) {
    if (damageTypes.length > 0) {
      const damageMatch = damageTypes.some((damage) =>
        programEligibleDamageTypes.some(
          (eligibleDamage) => normalizeString(eligibleDamage).toLowerCase() === normalizeString(damage).toLowerCase(),
        ),
      );

      if (damageMatch) {
        matchReasons.push("Damage scope appears to align with this program.");
        matchScore += 2;
      } else {
        blockedReasons.push("Damage scope does not appear to fit this program.");
      }
    } else if (recoveryNeeds.length > 0 && findLegacyNeedMatch(recoveryNeeds, programEligibilityTags)) {
      matchReasons.push("Recovery needs align with the program's legacy categories.");
      matchScore += 2;
    }
  } else if (hasStructuredEligibility) {
    if (recoveryNeeds.length > 0 && findLegacyNeedMatch(recoveryNeeds, programEligibilityTags)) {
      matchReasons.push("Recovery needs align with this program.");
      matchScore += 2;
    }
  } else if (recoveryNeeds.length > 0) {
    if (findLegacyNeedMatch(recoveryNeeds, programEligibilityTags)) {
      matchReasons.push("Recovery needs align with the program's legacy categories.");
      matchScore += 2;
    } else {
      blockedReasons.push("Recovery needs do not appear to fit this program.");
    }
  }

  if (
    insuranceDependency === "last-resort-gap-aid" ||
    insuranceDependency === "must-file-insurance-first"
  ) {
    if (["Insured", "Partially Insured"].includes(insuranceStatus)) {
      cautionReasons.push("Insurance settlement or denial may be needed before final aid is calculated.");
    }

    if (insuranceClaimStatus === "Pending") {
      cautionReasons.push("Pending insurance claims may delay final award calculation.");
    }

    if (["Denied", "Loss not covered"].includes(insuranceClaimStatus)) {
      matchReasons.push("Insurance denial or uncovered loss may support gap-aid review.");
    }
  }

  if (program.requiredDocumentIds) {
    const { missingDocuments, warnings } = documentReadiness;

    if (missingDocuments.length > 0) {
      matchReasons.push("Some required documents may still need to be gathered.");
    }

    if (warnings.length > 0) {
      cautionReasons.push(...warnings);
    }
  }

  if (blockedReasons.length > 0) {
    return null;
  }

  const adjustedScore = matchScore - cautionReasons.length;
  const eligibilityStatus = cautionReasons.length > 0 ? "needs-verification" : "likely-eligible";
  const { missingDocuments, warnings: documentReadinessWarnings } = documentReadiness;

  return {
    ...program,
    eligibilityStatus,
    matchScore: adjustedScore,
    matchReasons: Array.from(new Set(matchReasons)),
    cautionReasons: Array.from(new Set(cautionReasons)),
    blockedReasons: [],
    missingDocuments,
    documentReadinessWarnings,
  };
}

export function matchAidPrograms(answers = {}) {
  const normalizedAnswers = normalizeAnswers(answers);

  if (!hasEnoughContext(normalizedAnswers)) {
    return [];
  }

  return aidPrograms
    .map((program) => evaluateProgram(program, normalizedAnswers))
    .filter(Boolean)
    .sort((a, b) => {
      if (a.eligibilityStatus !== b.eligibilityStatus) {
        return a.eligibilityStatus === "likely-eligible" ? -1 : 1;
      }

      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }

      const aWindow = typeof a.applicationWindowDays === "number" ? a.applicationWindowDays : Number.POSITIVE_INFINITY;
      const bWindow = typeof b.applicationWindowDays === "number" ? b.applicationWindowDays : Number.POSITIVE_INFINITY;

      return aWindow - bWindow;
    });
}
