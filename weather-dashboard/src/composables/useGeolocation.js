import { ref, onUnmounted } from 'vue'
import geocodingService from '@services/geocodingService'
import { useUiStore } from '@stores/uiStore'

const DEFAULT_CITY = {
  name: 'Addis Ababa',
  fullName: 'Addis Ababa, ET',
  lat: 9.0249,
  lon: 38.7469,
  country: 'ET',
  state: null,
}

const MAX_RETRIES = 3
const GEO_OPTIONS = { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }

const ERROR_MESSAGES = {
  1: 'Location access denied. Using default city.',
  2: 'Location unavailable. Check your connection.',
  3: 'Location request timed out.',
}

export const useGeolocation = () => {
  const ui = useUiStore()

  const coords = ref(null)       // { lat, lon }
  const city = ref(null)         // normalized location from reverse geocoding
  const isLoading = ref(false)
  const error = ref(null)

  let watchId = null
  let retryCount = 0

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const setError = (msg) => {
    error.value = msg
    ui.toast.error(msg)
  }

  const applyCoords = async (latitude, longitude) => {
    coords.value = { lat: latitude, lon: longitude }
    try {
      city.value = await geocodingService.reverseGeocode(latitude, longitude)
    } catch {
      // reverse geocoding failed — coords are still valid, city just won't be set
      city.value = null
    }
  }

  const useFallback = () => {
    city.value = DEFAULT_CITY
    coords.value = { lat: DEFAULT_CITY.lat, lon: DEFAULT_CITY.lon }
    ui.toast.info(`Using default city: ${DEFAULT_CITY.name}`)
  }

  // ─── Get Location ──────────────────────────────────────────────────────────

  /**
   * Requests the user's current position once.
   * Retries up to MAX_RETRIES on non-permission errors, then falls back.
   * @returns {Promise<{ lat: number, lon: number }>}
   */
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        useFallback()
        return resolve(coords.value)
      }

      isLoading.value = true
      error.value = null

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          retryCount = 0
          await applyCoords(pos.coords.latitude, pos.coords.longitude)
          isLoading.value = false
          resolve(coords.value)
        },
        async (err) => {
          const msg = ERROR_MESSAGES[err.code] ?? 'Could not get your location.'

          // Permission denied — no point retrying
          if (err.code === 1) {
            setError(msg)
            useFallback()
            isLoading.value = false
            return resolve(coords.value)
          }

          // Retry on timeout or position unavailable
          if (retryCount < MAX_RETRIES) {
            retryCount++
            ui.toast.warning(`Retrying location… (${retryCount}/${MAX_RETRIES})`)
            isLoading.value = false
            try {
              const result = await getLocation()
              resolve(result)
            } catch (e) {
              reject(e)
            }
            return
          }

          // All retries exhausted
          setError(msg)
          useFallback()
          isLoading.value = false
          resolve(coords.value)
        },
        GEO_OPTIONS
      )
    })
  }

  // ─── Watch Location ────────────────────────────────────────────────────────

  /**
   * Continuously watches for location changes.
   * Calls onUpdate(coords) whenever position changes.
   * @param {(coords: { lat: number, lon: number }) => void} onUpdate
   */
  const watchLocation = (onUpdate) => {
    if (!navigator.geolocation) {
      useFallback()
      onUpdate?.(coords.value)
      return
    }

    stopWatch()

    watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        await applyCoords(pos.coords.latitude, pos.coords.longitude)
        onUpdate?.(coords.value)
      },
      (err) => {
        const msg = ERROR_MESSAGES[err.code] ?? 'Location watch error.'
        setError(msg)
        if (err.code === 1) stopWatch()
      },
      GEO_OPTIONS
    )
  }

  /**
   * Stops the active location watcher.
   */
  const stopWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  onUnmounted(() => stopWatch())

  return {
    coords,
    city,
    isLoading,
    error,
    getLocation,
    watchLocation,
    stopWatch,
    defaultCity: DEFAULT_CITY,
  }
}
