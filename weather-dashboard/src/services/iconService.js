/**
 * Icon Service
 * Maps OpenWeather icon codes to local assets, gradients, and animations.
 */

// ─── Icon Mappings ───────────────────────────────────────────────────────────

/**
 * Maps OpenWeather icon codes to local SVG file names.
 * @type {Record<string, string>}
 */
const ICON_MAP = {
  '01d': 'clear-day.svg',
  '01n': 'clear-night.svg',
  '02d': 'few-clouds-day.svg',
  '02n': 'few-clouds-night.svg',
  '03d': 'scattered-clouds.svg',
  '03n': 'scattered-clouds.svg',
  '04d': 'broken-clouds.svg',
  '04n': 'broken-clouds.svg',
  '09d': 'shower-rain.svg',
  '09n': 'shower-rain.svg',
  '10d': 'rain-day.svg',
  '10n': 'rain-night.svg',
  '11d': 'thunderstorm.svg',
  '11n': 'thunderstorm.svg',
  '13d': 'snow.svg',
  '13n': 'snow.svg',
  '50d': 'mist.svg',
  '50n': 'mist.svg',
}

/**
 * Maps weather condition IDs to human-readable descriptions.
 * @type {Record<number, string>}
 */
const CONDITION_MAP = {
  200: 'Thunderstorm with light rain',
  201: 'Thunderstorm with rain',
  202: 'Thunderstorm with heavy rain',
  210: 'Light thunderstorm',
  211: 'Thunderstorm',
  212: 'Heavy thunderstorm',
  221: 'Ragged thunderstorm',
  230: 'Thunderstorm with light drizzle',
  231: 'Thunderstorm with drizzle',
  232: 'Thunderstorm with heavy drizzle',
  300: 'Light drizzle',
  301: 'Drizzle',
  302: 'Heavy drizzle',
  310: 'Light drizzle rain',
  311: 'Drizzle rain',
  312: 'Heavy drizzle rain',
  313: 'Shower rain and drizzle',
  314: 'Heavy shower rain and drizzle',
  321: 'Shower drizzle',
  500: 'Light rain',
  501: 'Moderate rain',
  502: 'Heavy rain',
  503: 'Very heavy rain',
  504: 'Extreme rain',
  511: 'Freezing rain',
  520: 'Light shower rain',
  521: 'Shower rain',
  522: 'Heavy shower rain',
  531: 'Ragged shower rain',
  600: 'Light snow',
  601: 'Snow',
  602: 'Heavy snow',
  611: 'Sleet',
  612: 'Light shower sleet',
  613: 'Shower sleet',
  615: 'Light rain and snow',
  616: 'Rain and snow',
  620: 'Light shower snow',
  621: 'Shower snow',
  622: 'Heavy shower snow',
  701: 'Mist',
  711: 'Smoke',
  721: 'Haze',
  731: 'Sand/dust whirls',
  741: 'Fog',
  751: 'Sand',
  761: 'Dust',
  762: 'Volcanic ash',
  771: 'Squalls',
  781: 'Tornado',
  800: 'Clear sky',
  801: 'Few clouds',
  802: 'Scattered clouds',
  803: 'Broken clouds',
  804: 'Overcast clouds',
}

// ─── Background Gradients ────────────────────────────────────────────────────

/**
 * Returns Tailwind gradient classes based on weather condition.
 * @param {string} iconCode - OpenWeather icon code (e.g., '01d').
 * @returns {string} Tailwind gradient classes.
 */
export const getWeatherGradient = (iconCode) => {
  const gradients = {
    '01d': 'from-yellow-400 via-orange-400 to-pink-400', // Clear day
    '01n': 'from-indigo-900 via-purple-900 to-gray-900', // Clear night
    '02d': 'from-blue-400 via-cyan-400 to-teal-300', // Few clouds day
    '02n': 'from-indigo-800 via-blue-900 to-gray-800', // Few clouds night
    '03d': 'from-gray-400 via-gray-500 to-gray-600', // Scattered clouds
    '03n': 'from-gray-700 via-gray-800 to-gray-900',
    '04d': 'from-gray-500 via-gray-600 to-gray-700', // Broken clouds
    '04n': 'from-gray-800 via-gray-900 to-black',
    '09d': 'from-blue-500 via-blue-600 to-blue-700', // Shower rain
    '09n': 'from-blue-900 via-indigo-900 to-gray-900',
    '10d': 'from-blue-400 via-blue-500 to-blue-600', // Rain
    '10n': 'from-blue-800 via-blue-900 to-gray-900',
    '11d': 'from-purple-600 via-indigo-700 to-gray-800', // Thunderstorm
    '11n': 'from-purple-900 via-indigo-950 to-black',
    '13d': 'from-blue-100 via-blue-200 to-blue-300', // Snow
    '13n': 'from-blue-900 via-indigo-900 to-gray-900',
    '50d': 'from-gray-300 via-gray-400 to-gray-500', // Mist
    '50n': 'from-gray-600 via-gray-700 to-gray-800',
  }
  return gradients[iconCode] ?? 'from-blue-400 to-blue-600'
}

// ─── Animation Classes ───────────────────────────────────────────────────────

/**
 * Returns animation class names based on weather condition.
 * @param {string} iconCode - OpenWeather icon code.
 * @returns {string} Animation class names.
 */
export const getWeatherAnimation = (iconCode) => {
  const animations = {
    '01d': 'animate-pulse', // Clear day — pulsing sun
    '01n': 'animate-pulse',
    '02d': 'animate-fade-in',
    '02n': 'animate-fade-in',
    '03d': 'animate-slide-up',
    '03n': 'animate-slide-up',
    '04d': 'animate-slide-up',
    '04n': 'animate-slide-up',
    '09d': 'animate-bounce', // Rain — bouncing drops
    '09n': 'animate-bounce',
    '10d': 'animate-bounce',
    '10n': 'animate-bounce',
    '11d': 'animate-pulse', // Thunderstorm — flashing
    '11n': 'animate-pulse',
    '13d': 'animate-spin', // Snow — spinning flakes
    '13n': 'animate-spin',
    '50d': 'animate-fade-in', // Mist — fading in
    '50n': 'animate-fade-in',
  }
  return animations[iconCode] ?? 'animate-fade-in'
}

// ─── Service ─────────────────────────────────────────────────────────────────

const iconService = {
  /**
   * Returns the local SVG path for a given OpenWeather icon code.
   * Falls back to a default icon if code is unknown.
   * @param {string} iconCode - OpenWeather icon code (e.g., '01d').
   * @returns {string} Path to local SVG file.
   */
  getIconPath(iconCode) {
    const fileName = ICON_MAP[iconCode] ?? 'default.svg'
    return `/icons/${fileName}`
  },

  /**
   * Returns a human-readable description for a weather condition ID.
   * @param {number} conditionId - OpenWeather condition ID.
   * @returns {string} Weather description.
   */
  getConditionDescription(conditionId) {
    return CONDITION_MAP[conditionId] ?? 'Unknown condition'
  },

  /**
   * Returns a complete weather theme object with icon, gradient, and animation.
   * @param {string} iconCode - OpenWeather icon code.
   * @param {number} [conditionId] - Optional condition ID for description.
   * @returns {{ icon: string, gradient: string, animation: string, description: string }}
   */
  getWeatherTheme(iconCode, conditionId) {
    return {
      icon: this.getIconPath(iconCode),
      gradient: getWeatherGradient(iconCode),
      animation: getWeatherAnimation(iconCode),
      description: conditionId
        ? this.getConditionDescription(conditionId)
        : 'Weather condition',
    }
  },

  /**
   * Checks if a given icon code represents daytime.
   * @param {string} iconCode
   * @returns {boolean}
   */
  isDaytime(iconCode) {
    return iconCode?.endsWith('d') ?? true
  },

  /**
   * Returns the OpenWeather CDN URL as a fallback.
   * @param {string} iconCode
   * @returns {string}
   */
  getFallbackUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  },
}

export default iconService
