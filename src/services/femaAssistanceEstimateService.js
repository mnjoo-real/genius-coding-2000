import { supabase } from '../lib/supabaseClient'

const NO_MATCH = {
  found: false,
  matchLevel: 'none',
  estimatedLow: null,
  estimatedMedian: null,
  estimatedHigh: null,
  eligibilityRate: null,
  sampleSize: null,
  assistanceBreakdown: {
    housing: null,
    otherNeeds: null,
    rental: null,
    repair: null,
    personalProperty: null,
  },
  raw: null,
}

export const normalizeZip = (zipCode) => {
  const trimmedZipCode = String(zipCode ?? '').trim()

  return trimmedZipCode ? trimmedZipCode.padStart(5, '0') : ''
}

export const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const normalizeEstimateRow = (row, matchLevel) => {
  if (!row) {
    return NO_MATCH
  }

  return {
    found: true,
    matchLevel,
    estimatedLow: toNumberOrNull(row.p25_ihp_amount),
    estimatedMedian: toNumberOrNull(row.median_ihp_amount),
    estimatedHigh: toNumberOrNull(row.p75_ihp_amount),
    eligibilityRate: toNumberOrNull(row.eligibility_rate),
    sampleSize: toNumberOrNull(row.total_cases),
    assistanceBreakdown: {
      housing: toNumberOrNull(row.avg_ha_amount),
      otherNeeds: toNumberOrNull(row.avg_ona_amount),
      rental: toNumberOrNull(row.avg_rental_assistance_amount),
      repair: toNumberOrNull(row.avg_repair_amount),
      personalProperty: toNumberOrNull(row.avg_personal_property_amount),
    },
    raw: row,
  }
}

const selectTopSummaryRow = async (applyFilters) => {
  let query = supabase
    .from('fema_ihp_assistance_summary')
    .select('*')
    .order('total_cases', { ascending: false })
    .limit(1)

  query = applyFilters(query)

  const { data, error } = await query

  if (error) {
    console.error('Failed to look up FEMA assistance estimate:', error)
    return null
  }

  return data?.[0] ?? null
}

export async function getFemaAssistanceEstimate(input = {}) {
  if (!supabase) {
    return NO_MATCH
  }

  const {
    zipCode,
    state,
    county,
    ownRent,
    grossIncome,
    householdComposition,
    homeDamage,
    floodDamage,
  } = input

  const normalizedZipCode = normalizeZip(zipCode)
  const normalizedState = String(state ?? '').trim().toUpperCase()
  const normalizedCounty = String(county ?? '').trim()
  const hasExactProfileValues = [
    ownRent,
    grossIncome,
    householdComposition,
    homeDamage,
    floodDamage,
  ].every((value) => value !== null && value !== undefined && value !== '')

  if (normalizedZipCode) {
    if (hasExactProfileValues) {
      const exactZipRow = await selectTopSummaryRow((query) =>
        query
          .eq('damaged_zip_code', normalizedZipCode)
          .eq('own_rent', ownRent)
          .eq('gross_income', grossIncome)
          .eq('household_composition', householdComposition)
          .eq('home_damage', homeDamage)
          .eq('flood_damage', floodDamage),
      )

      if (exactZipRow) {
        return normalizeEstimateRow(exactZipRow, 'exact_zip')
      }
    }

    const zipRow = await selectTopSummaryRow((query) =>
      query.eq('damaged_zip_code', normalizedZipCode),
    )

    if (zipRow) {
      return normalizeEstimateRow(zipRow, 'zip')
    }
  }

  if (normalizedState && normalizedCounty) {
    const countyRow = await selectTopSummaryRow((query) =>
      query
        .eq('damaged_state_abbreviation', normalizedState)
        .eq('county', normalizedCounty),
    )

    if (countyRow) {
      return normalizeEstimateRow(countyRow, 'county')
    }
  }

  return NO_MATCH
}
