import { supabase, hasSupabaseConfig } from "../lib/supabaseClient";
import { getPreparednessProfileId } from "./userInfoSyncService";

const AUTH_PROFILE_LINKS_TABLE = "auth_profile_links";

export async function linkAuthUserToPreparednessProfile(
  authUserId,
  profileId
) {
  if (!hasSupabaseConfig || !supabase) {
    return {
      ok: false,
      reason: "supabase_not_configured",
      message: "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable account linking.",
    };
  }

  if (!authUserId) {
    return {
      ok: false,
      reason: "missing_auth_user_id",
      message: "Unable to read the authenticated user id from Supabase.",
    };
  }

  const resolvedProfileId = profileId ?? getPreparednessProfileId();

  if (!resolvedProfileId) {
    return {
      ok: false,
      reason: "missing_profile_id",
      message: "Unable to resolve the current guest profile_id.",
    };
  }

  const { error } = await supabase
    .from(AUTH_PROFILE_LINKS_TABLE)
    .upsert(
      {
        auth_user_id: authUserId,
        profile_id: resolvedProfileId,
      },
      { onConflict: "auth_user_id" }
    );

  if (error) {
    return {
      ok: false,
      reason: "supabase_error",
      message: error.message,
      error,
    };
  }

  return {
    ok: true,
    authUserId,
    profileId: resolvedProfileId,
  };
}
