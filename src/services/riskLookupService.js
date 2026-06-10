import { supabase } from '../lib/supabaseClient'

const ZIP_CODE_PATTERN = /^\d{5}$/

const toNumberOrNull = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const normalizeZipCode = (zipCode) => {
  const normalized = String(zipCode ?? '').trim()

  if (!ZIP_CODE_PATTERN.test(normalized)) {
    return null
  }

  return normalized
}

const getBestCountyMatch = (crosswalkRows) => {
  if (!Array.isArray(crosswalkRows) || crosswalkRows.length === 0) {
    return null
  }

  return [...crosswalkRows].sort((a, b) => {
    const aRatio = toNumberOrNull(a.tot_ratio) ?? toNumberOrNull(a.res_ratio) ?? 0
    const bRatio = toNumberOrNull(b.tot_ratio) ?? toNumberOrNull(b.res_ratio) ?? 0

    return bRatio - aRatio
  })[0]
}

const buildRegionalRisk = ({ zipCode, crosswalkRow, riskProfile }) => {
  const selectedRatio =
    toNumberOrNull(crosswalkRow.tot_ratio) ??
    toNumberOrNull(crosswalkRow.res_ratio) ??
    0

  return {
    zipCode,
    city: crosswalkRow.city ?? '',
    state: riskProfile.state_abbr ?? '',
    county: riskProfile.county_name ?? '',
    countyFips: crosswalkRow.county_fips ?? '',
    stcofips: crosswalkRow.stcofips ?? '',
    selectedRatio,
    dataLevel: 'County',
    source: 'FEMA National Risk Index + HUD-USPS ZIP Code Crosswalk',
    methodologyNote: riskProfile.methodology_note ?? '',

    compositeRiskScore: toNumberOrNull(riskProfile.composite_risk_score),
    compositeRiskRating: riskProfile.composite_risk_rating ?? '',

    floodRisk: toNumberOrNull(riskProfile.flood_risk),
    floodRiskRelative: toNumberOrNull(riskProfile.flood_risk_relative),
    wildfireRisk: toNumberOrNull(riskProfile.wildfire_risk),
    wildfireRiskRelative: toNumberOrNull(riskProfile.wildfire_risk_relative),
    heatRisk: toNumberOrNull(riskProfile.heat_risk),
    heatRiskRelative: toNumberOrNull(riskProfile.heat_risk_relative),
    stormRisk: toNumberOrNull(riskProfile.storm_risk),
    stormRiskRelative: toNumberOrNull(riskProfile.storm_risk_relative),
    winterStormRisk: toNumberOrNull(riskProfile.winter_storm_risk),
    winterStormRiskRelative: toNumberOrNull(riskProfile.winter_storm_risk_relative),

    riskRatings: {
      flood: riskProfile.flood_risk_rating ?? '',
      wildfire: riskProfile.wildfire_risk_rating ?? '',
      heat: riskProfile.heat_risk_rating ?? '',
      storm: riskProfile.storm_risk_rating ?? '',
      winterStorm: riskProfile.winter_storm_risk_rating ?? '',
    },
  }
}

export async function getRegionalRiskByZip(zipCode) {
  const normalizedZipCode = normalizeZipCode(zipCode)

  if (!normalizedZipCode) {
    return null
  }

  try {
    const { data: crosswalkRows, error: crosswalkError } = await supabase
      .from('zip_county_crosswalk')
      .select(
        'zip, county_fips, stcofips, city, state_abbr, county_name, res_ratio, tot_ratio',
      )
      .eq('zip', normalizedZipCode)

    if (crosswalkError) {
      console.error('Failed to look up ZIP county crosswalk:', crosswalkError)
      return null
    }

    const selectedCounty = getBestCountyMatch(crosswalkRows)

    if (!selectedCounty?.stcofips) {
      return null
    }

    const { data: riskProfile, error: riskError } = await supabase
      .from('county_risk_profiles')
      .select(
        `
        stcofips,
        state_abbr,
        county_name,
        composite_risk_score,
        composite_risk_rating,
        flood_risk,
        flood_risk_relative,
        flood_risk_rating,
        wildfire_risk,
        wildfire_risk_relative,
        wildfire_risk_rating,
        heat_risk,
        heat_risk_relative,
        heat_risk_rating,
        storm_risk,
        storm_risk_relative,
        storm_risk_rating,
        winter_storm_risk,
        winter_storm_risk_relative,
        winter_storm_risk_rating,
        methodology_note
      `,
      )
      .eq('stcofips', selectedCounty.stcofips)
      .maybeSingle()

    if (riskError) {
      console.error('Failed to look up county risk profile:', riskError)
      return null
    }

    if (!riskProfile) {
      return null
    }

    return buildRegionalRisk({
      zipCode: normalizedZipCode,
      crosswalkRow: selectedCounty,
      riskProfile,
    })
  } catch (error) {
    console.error('Unexpected regional risk lookup error:', error)
    return null
  }
}
