import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = import.meta.env.DEV
  ? '/api/geo'
  : 'https://api.openweathermap.org/geo/1.0'

const CACHE_KEY = 'weather_geo_cache'
const CACHE_MAX = 20 // max entries to store

// Axios instance for geocoding
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  params: { appid: API_KEY },
})

// ─── Cache ───────────────────────────────────────────────────────────────────

/**
 * Reads the geocoding cache from localStorage.
 * @returns {Record<string, object>}
 */
const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/**
 * Writes an entry to the geocoding cache, evicting oldest if over limit.
 * @param {string} key
 * @param {any} value
 */
const writeCache = (key, value) => {
  try {
    const cache = readCache()
    const keys = Object.keys(cache)
    if (keys.length >= CACHE_MAX) delete cache[keys[0]]
    cache[key] = { value, ts: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage unavailable — silently skip
  }
}

/**
 * Retrieves a cached value by key.
 * @param {string} key
 * @returns {any|null}
 */
const fromCache = (key) => {
  const cache = readCache()
  return cache[key]?.value ?? null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalizes a raw OpenWeather geocoding entry into a consistent shape.
 * @param {object} entry
 * @returns {{ name: string, fullName: string, lat: number, lon: number, country: string, state: string }}
 */
const normalizeLocation = (entry) => ({
  name: entry.name,
  fullName: [entry.name, entry.state, entry.country].filter(Boolean).join(', '),
  lat: entry.lat,
  lon: entry.lon,
  country: entry.country,
  state: entry.state ?? null,
  localNames: entry.local_names ?? {},
})

/**
 * Formats axios errors into readable messages.
 * @param {import('axios').AxiosError} err
 * @returns {Error}
 */
const formatError = (err) => {
  if (err.response) {
    const status = err.response.status
    const messages = {
      401: 'Invalid API key.',
      404: 'City not found.',
      429: 'Rate limit exceeded. Please wait before searching again.',
    }
    return new Error(messages[status] ?? `Geocoding error: ${status}`)
  }
  if (err.request) return new Error('Network error. Check your connection.')
  return new Error(err.message)
}

// ─── Debounce ────────────────────────────────────────────────────────────────

/**
 * Returns a debounced version of an async function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) =>
    new Promise((resolve, reject) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args).then(resolve).catch(reject), delay)
    })
}

// ─── Service ─────────────────────────────────────────────────────────────────

const geocodingService = {
  /**
   * Searches for cities matching a query string (for autocomplete).
   * Results are cached in localStorage by query.
   * @param {string} query - City name to search (supports special characters).
   * @param {number} limit - Max number of results (1–5).
   * @returns {Promise<Array>} List of matching locations.
   */
  async searchCities(query, limit = 5) {
    if (!query?.trim()) return []

    // Normalize and encode query to handle special characters
    const normalized = query.trim().normalize('NFC')
    const cacheKey = `search:${normalized.toLowerCase()}:${limit}`
    const cached = fromCache(cacheKey)
    if (cached) return cached

    try {
      const { data } = await client.get('/direct', {
        params: { q: encodeURIComponent(normalized), limit },
      })

      if (!data.length) throw new Error(`No cities found for "${query}".`)

      const results = data.map(normalizeLocation)
      writeCache(cacheKey, results)
      return results
    } catch (err) {
      if (err.message.includes('No cities found')) throw err
      throw formatError(err)
    }
  },

  /**
   * Converts coordinates to a city name (reverse geocoding).
   * Results are cached by lat/lon.
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<object>} Normalized location object.
   */
  async reverseGeocode(lat, lon) {
    const cacheKey = `reverse:${lat.toFixed(3)}:${lon.toFixed(3)}`
    const cached = fromCache(cacheKey)
    if (cached) return cached

    try {
      const { data } = await client.get('/reverse', {
        params: { lat, lon, limit: 1 },
      })

      if (!data.length) throw new Error('No location found for these coordinates.')

      const result = normalizeLocation(data[0])
      writeCache(cacheKey, result)
      return result
    } catch (err) {
      if (err.message.includes('No location found')) throw err
      throw formatError(err)
    }
  },

  /**
   * Returns the list of recently searched locations from localStorage cache.
   * @returns {Array<{ key: string, value: any, ts: number }>}
   */
  getRecentSearches() {
    const cache = readCache()
    return Object.entries(cache)
      .filter(([key]) => key.startsWith('search:'))
      .sort((a, b) => b[1].ts - a[1].ts)
      .slice(0, 5)
      .flatMap(([, entry]) => entry.value)
  },

  /**
   * Clears all geocoding cache from localStorage.
   */
  clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      // silently ignore
    }
  },
}

/**
 * Debounced version of searchCities — use this in search inputs
 * to avoid hammering the API on every keystroke.
 * @type {(query: string, limit?: number) => Promise<Array>}
 */
export const debouncedSearchCities = debounce(
  geocodingService.searchCities.bind(geocodingService),
  350
)

export default geocodingService
