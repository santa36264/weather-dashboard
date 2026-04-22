import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = import.meta.env.DEV
  ? '/api/weather'
  : 'https://api.openweathermap.org/data/2.5'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

// Axios instance
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  params: { appid: API_KEY },
})

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validates that the API key is set and not a placeholder.
 * @throws {Error}
 */
const validateApiKey = () => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('Missing API key. Set VITE_OPENWEATHER_API_KEY in your .env file.')
  }
}

/**
 * Pauses execution for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Wraps an async API call with retry logic on network/5xx errors.
 * @param {() => Promise<any>} fn - The async function to retry.
 * @param {number} retries - Number of retry attempts.
 * @returns {Promise<any>}
 */
const withRetry = async (fn, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const isLast = attempt === retries
      const shouldRetry =
        !err.response || err.response.status >= 500

      if (isLast || !shouldRetry) throw formatError(err)
      await sleep(RETRY_DELAY * attempt)
    }
  }
}

/**
 * Formats axios errors into readable messages.
 * @param {import('axios').AxiosError} err
 * @returns {Error}
 */
const formatError = (err) => {
  if (err.response) {
    const status = err.response.status
    const messages = {
      401: 'Invalid API key. Check your VITE_OPENWEATHER_API_KEY.',
      404: 'Location not found. Try a different city or coordinates.',
      429: 'API rate limit exceeded. Please wait before retrying.',
    }
    return new Error(messages[status] ?? `API error: ${status}`)
  }
  if (err.request) return new Error('Network error. Check your connection.')
  return new Error(err.message)
}

/**
 * Converts temperature between metric and imperial units.
 * @param {number} temp - Temperature in Celsius.
 * @param {'metric'|'imperial'} unit
 * @returns {number}
 */
export const convertTemperature = (temp, unit = 'metric') => {
  if (unit === 'imperial') return Math.round((temp * 9) / 5 + 32)
  return Math.round(temp)
}

// ─── Forecast Processing ─────────────────────────────────────────────────────

/**
 * Groups 3-hourly forecast entries by day and extracts daily min/max temps,
 * dominant weather condition, and average humidity.
 * @param {Array} list - Raw forecast list from OpenWeather API.
 * @returns {Array<{date: string, min: number, max: number, weather: object, humidity: number}>}
 */
const processForecast = (list) => {
  const days = {}

  list.forEach((entry) => {
    const date = entry.dt_txt.split(' ')[0]
    if (!days[date]) {
      days[date] = {
        date,
        temps: [],
        humidity: [],
        weather: entry.weather[0],
        icon: entry.weather[0].icon,
      }
    }
    days[date].temps.push(entry.main.temp)
    days[date].humidity.push(entry.main.humidity)
  })

  return Object.values(days).map((day) => ({
    date: day.date,
    min: Math.round(Math.min(...day.temps)),
    max: Math.round(Math.max(...day.temps)),
    weather: day.weather,
    icon: `https://openweathermap.org/img/wn/${day.icon}@2x.png`,
    humidity: Math.round(
      day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length
    ),
  }))
}

// ─── Service ─────────────────────────────────────────────────────────────────

const weatherService = {
  /**
   * Fetches current weather for a given location.
   * @param {number} lat - Latitude.
   * @param {number} lon - Longitude.
   * @param {'metric'|'imperial'} unit - Temperature unit.
   * @returns {Promise<object>} Normalized current weather data.
   */
  async getCurrentWeather(lat, lon, unit = 'metric') {
    validateApiKey()
    return withRetry(async () => {
      const { data } = await client.get('/weather', {
        params: { lat, lon, units: unit },
      })
      return {
        city: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDeg: data.wind.deg,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        iconCode: data.weather[0].icon,
        conditionId: data.weather[0].id,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        visibility: data.visibility,
        pressure: data.main.pressure,
        unit,
      }
    })
  },

  /**
   * Fetches a 5-day forecast (3-hour intervals) and returns processed daily data.
   * @param {number} lat - Latitude.
   * @param {number} lon - Longitude.
   * @param {'metric'|'imperial'} unit - Temperature unit.
   * @returns {Promise<{city: string, days: Array}>} Processed 5-day forecast.
   */
  async getForecast(lat, lon, unit = 'metric') {
    validateApiKey()
    return withRetry(async () => {
      const { data } = await client.get('/forecast', {
        params: { lat, lon, units: unit },
      })
      return {
        city: data.city.name,
        country: data.city.country,
        days: processForecast(data.list),
        unit,
      }
    })
  },

  /**
   * Fetches current weather by city name instead of coordinates.
   * @param {string} city - City name.
   * @param {'metric'|'imperial'} unit - Temperature unit.
   * @returns {Promise<object>} Same shape as getCurrentWeather.
   */
  async getWeatherByCity(city, unit = 'metric') {
    validateApiKey()
    return withRetry(async () => {
      const { data } = await client.get('/weather', {
        params: { q: city, units: unit },
      })
      return this.getCurrentWeather(data.coord.lat, data.coord.lon, unit)
    })
  },
}

export default weatherService
