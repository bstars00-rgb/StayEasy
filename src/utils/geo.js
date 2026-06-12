// Geolocation helpers for the "find hotels near me" recommendation.

const toRad = (deg) => (deg * Math.PI) / 180

// Great-circle distance in km between two {lat,lng} points (haversine).
export function distanceKm(a, b) {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Nearest city (with lat/lng) to a point. Returns { id, km } or null.
export function nearestCity(point, cities) {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null
  let best = null
  for (const c of cities) {
    if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) continue
    const km = distanceKm(point, c)
    if (!best || km < best.km) best = { id: c.id, km }
  }
  return best
}

// Promise wrapper around the browser Geolocation API.
export function getCurrentPosition(options = { timeout: 10000, maximumAge: 300000 }) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      options,
    )
  })
}
