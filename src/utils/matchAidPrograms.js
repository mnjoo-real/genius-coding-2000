import { aidPrograms } from "../data/aidPrograms";

export function matchAidPrograms(answers = {}) {
  const {
    disasterType,
    ownershipStatus,
    recoveryNeeds = [],
  } = answers;

  const selectedNeeds = Array.isArray(recoveryNeeds) ? recoveryNeeds : [];
  const hasDisasterType = Boolean(disasterType);
  const hasRecoveryNeeds = selectedNeeds.length > 0;
  const isRenter = ownershipStatus === "Renter";

  if (!hasDisasterType && !hasRecoveryNeeds && !isRenter) {
    return [];
  }

  return aidPrograms.filter((program = {}) => {
    const disasterTypes = Array.isArray(program.disasterTypes)
      ? program.disasterTypes
      : [];
    const eligibilityTags = Array.isArray(program.eligibilityTags)
      ? program.eligibilityTags
      : [];

    if (hasDisasterType && !disasterTypes.includes(disasterType)) {
      return false;
    }

    if (
      hasRecoveryNeeds &&
      !selectedNeeds.some((need) => eligibilityTags.includes(need))
    ) {
      return false;
    }

    if (isRenter && eligibilityTags.includes("property-owner")) {
      return false;
    }

    return true;
  });
}
