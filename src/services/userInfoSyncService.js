import { getLocalAuthSession } from "./localAuthService";

const PROFILE_ID_STORAGE_KEY = "profile_id";
const PROFILE_STORAGE_PREFIX = "canopyProfile";
const PROFILE_DATA_KEYS = {
  selectedZipCode: "selectedZipCode",
  regionalRisk: "regionalRisk",
  homeProfile: "homeProfile",
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

export function clearPreparednessProfile() {
  writeStorageValue(PROFILE_DATA_KEYS.selectedZipCode, null);
  writeStorageValue(PROFILE_DATA_KEYS.regionalRisk, null);
  writeStorageValue(PROFILE_DATA_KEYS.homeProfile, null);
}
