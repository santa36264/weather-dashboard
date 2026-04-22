import { computed, onMounted, onUnmounted } from 'vue'
import { useWeatherStore } from '@stores/weatherStore'
import { useUiStore } from '@stores/uiStore'
import { formatDate, formatTime } from '@utils/formatters'

const REFRESH_INTERVAL = 10 * 60 * 1000 // 10 minutes

// ─── Wind Direction ───────────────────────────────────────────────────────────

const CARDINAL = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']

/**
 * Converts wind degrees to a cardinal direction string.
 * @param {number} deg
 * @returns {string}
 */
export const degreesToCardinal = (deg) => {
  if (deg == null) return '--'
  return CARDINAL[Math.round(deg / 22.5) % 16]
}

// ─── Composable ───────────────────────────────────────────────────────────────

export const useWeather = () => {
  const store = useWeatherStore()
  const ui = useUiStore()

  let refreshTimer = null

  // ─── Computed ──────────────────────────────────────────────────────────────

  const weather = computed(() => store.currentWeather)
  const forecast = computed(() => store.forecastData)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)

  /** Wind direction as cardinal string */
  const windDirection = computed(() =>
    degreesToCardinal(store.currentWeather?.windDeg)
  )

  /** Formatted sunrise time */
  const sunrise = computed(() => {
    if (!store.currentWeather?.sunrise) return '--'
    return formatTime(new Date(store.currentWeather.sunrise * 1000))
  })

  /** Formatted sunset time */
  const sunset = computed(() => {
    if (!store.currentWeather?.sunset) return '--'
    return formatTime(new Date(store.currentWeather.sunset * 1000))
  })

  /** Forecast days with formatted date labels */
  const formattedForecast = computed(() => {
    if (!store.forecastData?.days) return []
    return store.forecastData.days.map((day) => ({
      ...day,
      label: formatDate(day.date, 'EEE'),       // 'Mon'
      fullDate: formatDate(day.date, 'MMM d'),  // 'Apr 22'
    }))
  })

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Fetches weather for a city object from geocoding results.
   * @param {{ name: string, lat: number, lon: number, country: string }} city
   */
  const fetchWeather = async (city) => {
    await store.fetchWeatherByCity(city)
    if (store.error) {
      ui.toast.error(store.error)
      store.clearError()
    } else {
      scheduleRefresh()
    }
  }

  /**
   * Re-fetches weather for the currently selected city.
   * No-op if no city is selected.
   */
  const refreshWeather = async () => {
    if (!store.selectedCity) return
    await store.fetchWeatherByCity(store.selectedCity)
    if (store.error) {
      ui.toast.warning('Could not refresh weather data.')
      store.clearError()
    }
  }

  /**
   * Gets the user's current location via the Geolocation API
   * and fetches weather for those coordinates.
   * @returns {Promise<void>}
   */
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation is not supported by your browser.'
        ui.toast.error(msg)
        return reject(new Error(msg))
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          await store.fetchWeatherByCoords(coords.latitude, coords.longitude)
          if (store.error) {
            ui.toast.error(store.error)
            store.clearError()
            reject(new Error(store.error))
          } else {
            scheduleRefresh()
            resolve()
          }
        },
        (err) => {
          const messages = {
            1: 'Location access denied. Please allow location permissions.',
            2: 'Location unavailable. Try searching by city name.',
            3: 'Location request timed out.',
          }
          const msg = messages[err.code] ?? 'Could not get your location.'
          ui.toast.error(msg)
          reject(new Error(msg))
        },
        { timeout: 10000, maximumAge: 60000 }
      )
    })
  }

  // ─── Auto Refresh ──────────────────────────────────────────────────────────

  const scheduleRefresh = () => {
    clearRefresh()
    refreshTimer = setInterval(refreshWeather, REFRESH_INTERVAL)
  }

  const clearRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // Start refresh timer if a city is already selected (e.g. after page reload)
  onMounted(() => {
    if (store.selectedCity) scheduleRefresh()
  })

  onUnmounted(() => clearRefresh())

  return {
    // state
    weather,
    forecast,
    isLoading,
    error,
    // formatted
    windDirection,
    sunrise,
    sunset,
    formattedForecast,
    // actions
    fetchWeather,
    refreshWeather,
    getUserLocation,
  }
}
