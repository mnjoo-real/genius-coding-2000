const ZIPPOPOTAMUS_US_URL = 'https://api.zippopotam.us/us'

const parseCoordinate = (value) => {
  const coordinate = Number(value)

  return Number.isFinite(coordinate) ? coordinate : value
}

// Zippopotam.us is used only for ZIP-to-region lookup, not official disaster risk scoring.
export async function lookupZipCode(zipCode) {
  try {
    const normalizedZipCode = String(zipCode ?? '').trim()

    if (!normalizedZipCode) {
      return null
    }

    const response = await fetch(
      `${ZIPPOPOTAMUS_US_URL}/${encodeURIComponent(normalizedZipCode)}`,
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const place = data?.places?.[0]

    if (!place) {
      return null
    }

    return {
      zipCode: data['post code'] ?? normalizedZipCode,
      city: place['place name'] ?? '',
      state: place.state ?? '',
      stateCode: place['state abbreviation'] ?? '',
      latitude: parseCoordinate(place.latitude),
      longitude: parseCoordinate(place.longitude),
      source: 'zippopotam.us',
    }
  } catch {
    return null
  }
}
