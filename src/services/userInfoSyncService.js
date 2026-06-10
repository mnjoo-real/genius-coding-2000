const PROFILE_ID_STORAGE_KEY = "profile_id";

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

function readStorageValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
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
  if (typeof window === "undefined") {
    return;
  }

  if (value == null) {
    window.localStorage.removeItem(key);
    return;
  }

  if (key === "selectedZipCode") {
    window.localStorage.setItem(key, String(value));
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function createLocalProfileId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `local-profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getPreparednessProfileId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existingProfileId = window.localStorage.getItem(PROFILE_ID_STORAGE_KEY);

  if (existingProfileId) {
    window.localStorage.setItem(PROFILE_ID_STORAGE_KEY, existingProfileId);
    return existingProfileId;
  }

  const nextProfileId = createLocalProfileId();
  window.localStorage.setItem(PROFILE_ID_STORAGE_KEY, nextProfileId);
  return nextProfileId;
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
  const selectedZipCode = readStorageValue("selectedZipCode");
  const regionalRisk = readStorageValue("regionalRisk");
  const homeProfile = readStorageValue("homeProfile");

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
