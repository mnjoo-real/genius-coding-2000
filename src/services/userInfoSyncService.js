import { supabase, hasSupabaseConfig } from "../lib/supabaseClient";
import { calculateScore } from "../utils/calculateScore";

const ANONYMOUS_PROFILE_ID_KEY = "supabaseAnonymousProfileId";

export const USER_INFO_SUPABASE_TABLES = {
  profile: "user_profiles",
  location: "location_profiles",
  home: "home_profiles",
  // This table stores the latest readiness score snapshot for a profile_id,
  // not a full historical series of scores.
  score: "readiness_score_snapshots",
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

    if (typeof parsedValue === "string") {
      return parsedValue;
    }
  }

  return safeParseJson(rawValue) ?? rawValue;
}

function createAnonymousProfileId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getAnonymousProfileId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existingProfileId = window.localStorage.getItem(ANONYMOUS_PROFILE_ID_KEY);
  if (existingProfileId) {
    return existingProfileId;
  }

  const nextProfileId = createAnonymousProfileId();
  window.localStorage.setItem(ANONYMOUS_PROFILE_ID_KEY, nextProfileId);
  return nextProfileId;
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

export function getPreparednessProfileId() {
  return getAnonymousProfileId();
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

export async function fetchPreparednessSnapshotFromSupabase(profileId = getAnonymousProfileId()) {
  if (!hasSupabaseConfig || !supabase || !profileId) {
    return null;
  }

  const [
    profileResult,
    locationResult,
    homeResult,
    scoreResult,
  ] = await Promise.all([
    supabase
      .from(USER_INFO_SUPABASE_TABLES.profile)
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle(),
    supabase
      .from(USER_INFO_SUPABASE_TABLES.location)
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle(),
    supabase
      .from(USER_INFO_SUPABASE_TABLES.home)
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle(),
    supabase
      .from(USER_INFO_SUPABASE_TABLES.score)
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle(),
  ]);

  const firstError =
    profileResult.error ||
    locationResult.error ||
    homeResult.error ||
    scoreResult.error;

  if (firstError) {
    throw firstError;
  }

  const selectedZipCode =
    profileResult.data?.selected_zip_code ??
    locationResult.data?.selected_zip_code ??
    homeResult.data?.selected_zip_code ??
    scoreResult.data?.selected_zip_code ??
    null;

  const regionalRisk = locationResult.data?.regional_risk ?? null;
  const homeProfile = homeResult.data?.home_profile ?? null;
  const scoreRow = scoreResult.data ?? null;

  return {
    profileId,
    selectedZipCode,
    regionalRisk,
    homeProfile,
    scoreRow,
    profileRow: profileResult.data ?? null,
    locationRow: locationResult.data ?? null,
    homeRow: homeResult.data ?? null,
  };
}

export function buildPreparednessSyncPayload(snapshot = readPreparednessSnapshot()) {
  const profileId = getAnonymousProfileId();
  const syncedAt = new Date().toISOString();
  const scoreData =
    snapshot.selectedZipCode && snapshot.regionalRisk && snapshot.homeProfile
      ? calculateScore(snapshot.regionalRisk, snapshot.homeProfile)
      : null;

  return {
    profileId,
    syncedAt,
    scoreData,
    profileRow: {
      profile_id: profileId,
      selected_zip_code: snapshot.selectedZipCode,
      synced_at: syncedAt,
    },
    locationRow: {
      profile_id: profileId,
      selected_zip_code: snapshot.selectedZipCode,
      regional_risk: snapshot.regionalRisk,
      synced_at: syncedAt,
    },
    homeRow: {
      profile_id: profileId,
      selected_zip_code: snapshot.selectedZipCode,
      home_profile: snapshot.homeProfile,
      saved_at: snapshot.homeProfile?.savedAt ?? null,
      synced_at: syncedAt,
    },
    scoreRow: scoreData
      ? {
          profile_id: profileId,
          selected_zip_code: snapshot.selectedZipCode,
          total_score: scoreData.totalScore,
          max_achievable_score: scoreData.maxAchievableScore,
          category_scores: scoreData.categoryScores,
          weaknesses: scoreData.weaknesses,
          synced_at: syncedAt,
        }
      : null,
  };
}

export function canSyncPreparednessProfile(snapshot = readPreparednessSnapshot()) {
  return Boolean(
    hasSupabaseConfig &&
      supabase &&
      snapshot.selectedZipCode &&
      snapshot.regionalRisk &&
      snapshot.homeProfile
  );
}

export async function syncPreparednessProfileToSupabase(snapshot = readPreparednessSnapshot()) {
  if (!hasSupabaseConfig || !supabase) {
    return {
      ok: false,
      reason: "supabase_not_configured",
      message: "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sync.",
    };
  }

  if (!snapshot.selectedZipCode || !snapshot.regionalRisk || !snapshot.homeProfile) {
    return {
      ok: false,
      reason: "profile_incomplete",
      message: "Complete the location and home questionnaire before syncing.",
    };
  }

  const payload = buildPreparednessSyncPayload(snapshot);
  const operations = [
    supabase
      .from(USER_INFO_SUPABASE_TABLES.profile)
      .upsert(payload.profileRow, { onConflict: "profile_id" }),
    supabase
      .from(USER_INFO_SUPABASE_TABLES.location)
      .upsert(payload.locationRow, { onConflict: "profile_id" }),
    supabase
      .from(USER_INFO_SUPABASE_TABLES.home)
      .upsert(payload.homeRow, { onConflict: "profile_id" }),
  ];

  if (payload.scoreRow) {
    operations.push(
      supabase
        .from(USER_INFO_SUPABASE_TABLES.score)
        .upsert(payload.scoreRow, { onConflict: "profile_id" })
    );
  }

  const results = await Promise.all(operations);
  const firstError = results.find((result) => result.error)?.error;

  if (firstError) {
    throw firstError;
  }

  return {
    ok: true,
    profileId: payload.profileId,
    syncedAt: payload.syncedAt,
    scoreData: payload.scoreData,
    tables: USER_INFO_SUPABASE_TABLES,
  };
}
