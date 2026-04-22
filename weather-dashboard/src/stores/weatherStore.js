import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import weatherService, { convertTemperature } from '@services/weatherService'
import geocodingService from '@services/geocodingService'
import iconService from '@services/iconService'

const MAX_RECENT = 5

export const useWeatherStore = defineStore(
  'weather',
  () => {
    // ─── State ─────────────────────────────────────────────────────────────

    const currentWeather = ref(null)
    const forecastData = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const selectedCity = ref(null)   // { name, fullName, lat, lon, country }
    const unit = ref('metric')       // 'metric' | 'imperial'
    const recentSearches = ref([])   // [{ name, fullName, lat, lon, country }]

    // ─── Getters ────────────────────────────────────────────────────────────

    /** Formatted current temperature with unit symbol */
    const formattedTemperature = computed(() => {
      if (!currentWeather.value) return '--'
      const symbol = unit.value === 'metric' ? '°C' : '°F'
      return `${currentWeather.value.temp}${symbol}`
    })

    /** Formatted feels-like temperature with unit symbol */
    const feelsLikeTemp = computed(() => {
      if (!currentWeather.value) return '--'
      const symbol = unit.value === 'metric' ? '°C' : '°F'
      return `${currentWeather.value.feelsLike}${symbol}`
    })

    /** Full weather theme: icon path, gradient, animation, description */
    const weatherTheme = computed(() => {
      if (!currentWeather.value) return null
      return iconService.getWeatherTheme(
        currentWeather.value.iconCode,
        currentWeather.value.conditionId
      )
    })

    /** Chart-ready data from forecast for temperature line chart */
    const chartData = computed(() => {
      if (!forecastData.value?.days) return null
      return {
        labels: forecastData.value.days.map((d) => d.date),
        datasets: [
          {
            label: `Max (${unit.value === 'metric' ? '°C' : '°F'})`,
            data: forecastData.value.days.map((d) => d.max),
            borderColor: '#f95738',
            backgroundColor: 'rgba(249,87,56,0.15)',
            tension: 0.4,
            fill: true,
          },
          {
            label: `Min (${unit.value === 'metric' ? '°C' : '°F'})`,
            data: forecastData.value.days.map((d) => d.min),
            borderColor: '#0c8fe7',
            backgroundColor: 'rgba(12,143,231,0.15)',
            tension: 0.4,
            fill: true,
          },
        ],
      }
    })

    // ─── Helpers ────────────────────────────────────────────────────────────

    /** Normalizes raw weather data and injects iconCode/conditionId */
    const normalizeWeather = (data) => {
      // icon from API is like "04n", extract directly
      const rawIcon = data.icon?.match(/([0-9]{2}[dn])@/)?.[1]
        ?? data.icon?.split('/').pop()?.replace('@2x.png', '')
        ?? '01d'
      return {
        ...data,
        iconCode: rawIcon,
        conditionId: data.conditionId ?? null,
      }
    }

    /** Shared fetch logic used by both city and coords actions */
    const fetchBoth = async (lat, lon) => {
      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeather(lat, lon, unit.value),
        weatherService.getForecast(lat, lon, unit.value),
      ])
      currentWeather.value = normalizeWeather(weather)
      forecastData.value = forecast
    }

    // ─── Actions ────────────────────────────────────────────────────────────

    /**
     * Fetches weather for a city object (from geocoding results).
     * @param {{ name: string, fullName: string, lat: number, lon: number, country: string }} city
     */
    const fetchWeatherByCity = async (city) => {
      isLoading.value = true
      error.value = null
      try {
        selectedCity.value = city
        await fetchBoth(city.lat, city.lon)
        addToRecentSearches(city)
      } catch (err) {
        error.value = err.message
        currentWeather.value = null
        forecastData.value = null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Fetches weather by raw coordinates (e.g. from geolocation API).
     * Reverse geocodes to populate selectedCity.
     * @param {number} lat
     * @param {number} lon
     */
    const fetchWeatherByCoords = async (lat, lon) => {
      isLoading.value = true
      error.value = null
      try {
        const location = await geocodingService.reverseGeocode(lat, lon)
        selectedCity.value = location
        await fetchBoth(lat, lon)
        addToRecentSearches(location)
      } catch (err) {
        error.value = err.message
        currentWeather.value = null
        forecastData.value = null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Toggles between metric and imperial and re-fetches if a city is selected.
     */
    const toggleUnit = async () => {
      unit.value = unit.value === 'metric' ? 'imperial' : 'metric'
      if (selectedCity.value) {
        await fetchWeatherByCity(selectedCity.value)
      }
    }

    /**
     * Adds a city to recent searches, deduplicating and capping at MAX_RECENT.
     * @param {{ name: string, lat: number, lon: number }} city
     */
    const addToRecentSearches = (city) => {
      const exists = recentSearches.value.findIndex(
        (c) => c.lat === city.lat && c.lon === city.lon
      )
      if (exists !== -1) recentSearches.value.splice(exists, 1)
      recentSearches.value.unshift(city)
      if (recentSearches.value.length > MAX_RECENT) {
        recentSearches.value = recentSearches.value.slice(0, MAX_RECENT)
      }
    }

    /** Clears the current error boundary */
    const clearError = () => {
      error.value = null
    }

    /** Resets all weather data (e.g. on logout or city clear) */
    const reset = () => {
      currentWeather.value = null
      forecastData.value = null
      selectedCity.value = null
      error.value = null
      isLoading.value = false
    }

    return {
      // state
      currentWeather,
      forecastData,
      isLoading,
      error,
      selectedCity,
      unit,
      recentSearches,
      // getters
      formattedTemperature,
      feelsLikeTemp,
      weatherTheme,
      chartData,
      // actions
      fetchWeatherByCity,
      fetchWeatherByCoords,
      toggleUnit,
      addToRecentSearches,
      clearError,
      reset,
    }
  },
  {
    // Only persist user preferences and recent searches — not weather data
    persist: {
      key: 'weather-store',
      pick: ['unit', 'recentSearches', 'selectedCity'],
    },
  }
)
