import { getLocalAuthSession } from "./localAuthService";

const PROFILE_ID_STORAGE_KEY = "profile_id";
const PROFILE_STORAGE_PREFIX = "canopyProfile";
const RECOVERY_PROFILE_STORAGE_KEY = "recoveryProfile";
const RECOVERY_STORAGE_PREFIX = "recoveryData";
const RECOVERY_DAMAGE_RECORD_STORAGE_KEY = "recoveryDamageRecord";
const HOME_PHOTO_CHECKLIST_STORAGE_KEY = "homePhotoChecklist";
const HOME_PHOTO_EVIDENCE_STORAGE_KEY = "homePhotoEvidence";
const LEGACY_RECOVERY_PROFILE_KEYS = ["disasterProfile", "aidEligibilityAnswers"];
const PROFILE_DATA_KEYS = {
  selectedZipCode: "selectedZipCode",
  regionalRisk: "regionalRisk",
  homeProfile: "homeProfile",
  recoveryProfile: RECOVERY_PROFILE_STORAGE_KEY,
};

function safeParseJson(rawValue) {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function getProfileScope() {
  const userId = getLocalAuthSession()?.user?.id;
  return userId ? { type: "user", id: userId } : { type: "guest", id: "guest" };
}

function getScopedStorageKey(key) {
  const scope = getProfileScope();
  return scope.type === "guest" ? key : `${PROFILE_STORAGE_PREFIX}:${scope.id}:${key}`;
}

function getScopedRecoveryStorageKey(key) {
  const scope = getProfileScope();
  return scope.type === "guest" ? key : `${RECOVERY_STORAGE_PREFIX}:${scope.id}:${key}`;
}

function readStorageValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(getScopedStorageKey(key));
  if (rawValue == null) {
    return null;
  }

  if (key === "selectedZipCode") {
    const parsedValue = safeParseJson(rawValue);
    return typeof parsedValue === "string" ? parsedValue : rawValue;
  }

  return safeParseJson(rawValue) ?? rawValue;
}

function writeStorageValue(key, value) {
  if (!canUseLocalStorage()) {
    return;
  }

  const storageKey = getScopedStorageKey(key);

  if (value == null) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  if (key === "selectedZipCode") {
    window.localStorage.setItem(storageKey, String(value));
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function readScopedRecoveryValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(getScopedRecoveryStorageKey(key));
  if (rawValue == null) {
    return null;
  }

  return safeParseJson(rawValue) ?? rawValue;
}

function writeScopedRecoveryValue(key, value) {
  if (!canUseLocalStorage()) {
    return;
  }

  const storageKey = getScopedRecoveryStorageKey(key);

  if (value == null) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function readLegacyRecoveryProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of LEGACY_RECOVERY_PROFILE_KEYS) {
    const parsedValue = safeParseJson(window.localStorage.getItem(key));
    if (parsedValue && typeof parsedValue === "object" && !Array.isArray(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

function normalizeObjectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function mergeRecoveryProfile(existingProfile, nextProfile) {
  const existingRecoveryProfile = normalizeObjectValue(existingProfile) ?? {};
  const nextRecoveryProfile = normalizeObjectValue(nextProfile) ?? {};

  const mergedRecoveryProfile = {
    ...existingRecoveryProfile,
    ...nextRecoveryProfile,
  };

  if (!Object.prototype.hasOwnProperty.call(nextRecoveryProfile, "femaEstimator") &&
      Object.prototype.hasOwnProperty.call(existingRecoveryProfile, "femaEstimator")) {
    mergedRecoveryProfile.femaEstimator = existingRecoveryProfile.femaEstimator;
  }

  return mergedRecoveryProfile;
}

function createLocalProfileId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `local-profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getPreparednessProfileId() {
  if (!canUseLocalStorage()) {
    return null;
  }

  const storageKey = getScopedStorageKey(PROFILE_ID_STORAGE_KEY);
  const existingProfileId = window.localStorage.getItem(storageKey);

  if (existingProfileId) {
    window.localStorage.setItem(storageKey, existingProfileId);
    return existingProfileId;
  }

  const nextProfileId = createLocalProfileId();
  window.localStorage.setItem(storageKey, nextProfileId);
  return nextProfileId;
}

export function getPreparednessStorageScope() {
  return getProfileScope();
}

export function hydratePreparednessSnapshotToLocalStorage(snapshot) {
  if (!snapshot) {
    return;
  }

  if (snapshot.selectedZipCode) {
    writeStorageValue("selectedZipCode", snapshot.selectedZipCode);
  }

  if (snapshot.regionalRisk) {
    writeStorageValue("regionalRisk", snapshot.regionalRisk);
  }

  if (snapshot.homeProfile) {
    writeStorageValue("homeProfile", snapshot.homeProfile);
  }
}

export function readPreparednessSnapshot() {
  const selectedZipCode = readStorageValue(PROFILE_DATA_KEYS.selectedZipCode);
  const regionalRisk = readStorageValue(PROFILE_DATA_KEYS.regionalRisk);
  const homeProfile = readStorageValue(PROFILE_DATA_KEYS.homeProfile);

  return {
    selectedZipCode: typeof selectedZipCode === "string" ? selectedZipCode : null,
    regionalRisk:
      regionalRisk && typeof regionalRisk === "object" && !Array.isArray(regionalRisk)
        ? regionalRisk
        : null,
    homeProfile:
      homeProfile && typeof homeProfile === "object" && !Array.isArray(homeProfile)
        ? homeProfile
        : null,
  };
}

export function readSelectedZipCode() {
  const selectedZipCode = readStorageValue(PROFILE_DATA_KEYS.selectedZipCode);
  return typeof selectedZipCode === "string" ? selectedZipCode : "";
}

export function readRegionalRisk() {
  const regionalRisk = readStorageValue(PROFILE_DATA_KEYS.regionalRisk);
  return regionalRisk && typeof regionalRisk === "object" && !Array.isArray(regionalRisk)
    ? regionalRisk
    : null;
}

export function readHomeProfile() {
  const homeProfile = readStorageValue(PROFILE_DATA_KEYS.homeProfile);
  return homeProfile && typeof homeProfile === "object" && !Array.isArray(homeProfile)
    ? homeProfile
    : null;
}

export function saveResolvedLocationProfile(submittedZipCode, regionalRiskProfile) {
  writeStorageValue(PROFILE_DATA_KEYS.selectedZipCode, submittedZipCode);
  writeStorageValue(PROFILE_DATA_KEYS.regionalRisk, regionalRiskProfile);
}

export function saveHomeProfile(homeProfile) {
  writeStorageValue(PROFILE_DATA_KEYS.homeProfile, homeProfile);
}

export function readRecoveryProfile() {
  const recoveryProfile = readStorageValue(PROFILE_DATA_KEYS.recoveryProfile);
  if (recoveryProfile && typeof recoveryProfile === "object" && !Array.isArray(recoveryProfile)) {
    return recoveryProfile;
  }

  return readLegacyRecoveryProfile() || {};
}

export function saveRecoveryProfile(recoveryProfile, options = {}) {
  const normalizedRecoveryProfile = normalizeObjectValue(recoveryProfile) ?? {};

  if (options && options.replace) {
    writeStorageValue(PROFILE_DATA_KEYS.recoveryProfile, normalizedRecoveryProfile);
    return;
  }

  const existingRecoveryProfile = readRecoveryProfile();
  writeStorageValue(
    PROFILE_DATA_KEYS.recoveryProfile,
    mergeRecoveryProfile(existingRecoveryProfile, normalizedRecoveryProfile),
  );
}

export function readRecoveryFemaEstimator() {
  const recoveryProfile = readRecoveryProfile();
  const femaEstimator = normalizeObjectValue(recoveryProfile.femaEstimator);

  return femaEstimator || {};
}

export function saveRecoveryFemaEstimator(femaEstimator) {
  const existingRecoveryProfile = readRecoveryProfile();
  const nextRecoveryProfile = mergeRecoveryProfile(existingRecoveryProfile, {
    femaEstimator: normalizeObjectValue(femaEstimator) || {},
  });

  writeStorageValue(PROFILE_DATA_KEYS.recoveryProfile, nextRecoveryProfile);
}

export function clearLegacyRecoveryProfile() {
  if (!canUseLocalStorage()) {
    return;
  }

  LEGACY_RECOVERY_PROFILE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function clearPreparednessProfile() {
  writeStorageValue(PROFILE_DATA_KEYS.selectedZipCode, null);
  writeStorageValue(PROFILE_DATA_KEYS.regionalRisk, null);
  writeStorageValue(PROFILE_DATA_KEYS.homeProfile, null);
}

export function clearRecoveryProfile() {
  writeStorageValue(PROFILE_DATA_KEYS.recoveryProfile, null);
  clearLegacyRecoveryProfile();
}

export function readRecoveryDamageRecord() {
  const recoveryDamageRecord = readScopedRecoveryValue(RECOVERY_DAMAGE_RECORD_STORAGE_KEY);
  return recoveryDamageRecord && typeof recoveryDamageRecord === "object" && !Array.isArray(recoveryDamageRecord)
    ? recoveryDamageRecord
    : {};
}

export function saveRecoveryDamageRecord(recoveryDamageRecord) {
  const normalizedRecoveryDamageRecord =
    recoveryDamageRecord && typeof recoveryDamageRecord === "object" && !Array.isArray(recoveryDamageRecord)
      ? recoveryDamageRecord
      : {};

  writeScopedRecoveryValue(RECOVERY_DAMAGE_RECORD_STORAGE_KEY, normalizedRecoveryDamageRecord);
}

export function readHomePhotoChecklist() {
  const homePhotoChecklist = readScopedRecoveryValue(HOME_PHOTO_CHECKLIST_STORAGE_KEY);
  return homePhotoChecklist && typeof homePhotoChecklist === "object" && !Array.isArray(homePhotoChecklist)
    ? homePhotoChecklist
    : {};
}

export function saveHomePhotoChecklist(homePhotoChecklist) {
  const normalizedHomePhotoChecklist =
    homePhotoChecklist && typeof homePhotoChecklist === "object" && !Array.isArray(homePhotoChecklist)
      ? homePhotoChecklist
      : {};

  writeScopedRecoveryValue(HOME_PHOTO_CHECKLIST_STORAGE_KEY, normalizedHomePhotoChecklist);
}

export function readHomePhotoEvidence() {
  const homePhotoEvidence = readScopedRecoveryValue(HOME_PHOTO_EVIDENCE_STORAGE_KEY);
  return Array.isArray(homePhotoEvidence) ? homePhotoEvidence : [];
}

export function saveHomePhotoEvidence(homePhotoEvidence) {
  const normalizedHomePhotoEvidence = Array.isArray(homePhotoEvidence) ? homePhotoEvidence : [];
  writeScopedRecoveryValue(HOME_PHOTO_EVIDENCE_STORAGE_KEY, normalizedHomePhotoEvidence);
}

export function buildRecoveryBaseAnswers(preparednessSnapshot = {}) {
  const selectedZipCode =
    typeof preparednessSnapshot.selectedZipCode === "string"
      ? preparednessSnapshot.selectedZipCode.trim()
      : "";
  const homeProfile =
    preparednessSnapshot.homeProfile &&
    typeof preparednessSnapshot.homeProfile === "object" &&
    !Array.isArray(preparednessSnapshot.homeProfile)
      ? preparednessSnapshot.homeProfile
      : {};

  const baseAnswers = {};

  if (selectedZipCode) {
    baseAnswers.addressOrZip = selectedZipCode;
  }

  const ownershipStatus = typeof homeProfile.ownershipStatus === "string" ? homeProfile.ownershipStatus : "";
  if (ownershipStatus === "Own") {
    baseAnswers.ownershipStatus = "Owner";
  } else if (ownershipStatus === "Rent") {
    baseAnswers.ownershipStatus = "Renter";
  } else if (ownershipStatus) {
    baseAnswers.ownershipStatus = "Other";
  }

  const insurancePolicy = typeof homeProfile.insurancePolicy === "string" ? homeProfile.insurancePolicy.toLowerCase() : "";
  if (insurancePolicy.includes("homeowner") || insurancePolicy.includes("renter")) {
    baseAnswers.insuranceStatus = "Insured";
  } else if (insurancePolicy === "no") {
    baseAnswers.insuranceStatus = "Uninsured";
  } else if (insurancePolicy.includes("unsure") || insurancePolicy.includes("not sure")) {
    baseAnswers.insuranceStatus = "Not sure";
  }

  const digitalDocuments = Array.isArray(homeProfile.digitalDocuments)
    ? homeProfile.digitalDocuments
    : [];
  const hasGovernmentId = digitalDocuments.some(
    (document) => typeof document === "string" && document.trim() === "Government-issued ID",
  );
  if (hasGovernmentId) {
    baseAnswers.hasGovernmentId = "Yes";
  }

  return baseAnswers;
}
