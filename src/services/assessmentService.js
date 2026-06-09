import { supabase } from "../lib/supabaseClient";

export async function saveAssessment({
  selectedZipCode,
  regionalRisk,
  homeProfile,
  scoreResult,
  recommendations,
  projectedScore,
}) {
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      selected_zip_code: selectedZipCode,
      regional_risk: regionalRisk,
      home_profile: homeProfile,
      score_result: scoreResult,
      recommendations,
      projected_score: projectedScore,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
