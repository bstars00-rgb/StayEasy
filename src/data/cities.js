// Centralized city data. Display names are translated via i18n (cities.<id>).
// `emoji` is a lightweight stand-in for a city image in this frontend-only MVP.
//
// To add a city later: add an entry here and a label in every src/i18n file
// under the `cities` group.
export const cities = [
  { id: 'ho-chi-minh', country: 'vietnam', emoji: '🏙️' },
  { id: 'da-nang', country: 'vietnam', emoji: '🏖️' },
  { id: 'hanoi', country: 'vietnam', emoji: '🏯' },
  { id: 'seoul', country: 'korea', emoji: '🌆' },
  { id: 'bangkok', country: 'thailand', emoji: '🛕' },
  { id: 'tokyo', country: 'japan', emoji: '🗼' },
]

export const CITY_IDS = cities.map((c) => c.id)

export const DEFAULT_CITY = 'ho-chi-minh'

export function getCity(id) {
  return cities.find((c) => c.id === id)
}
