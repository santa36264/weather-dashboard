<template>
  <div class="min-h-screen transition-colors duration-300 bg-gray-100 dark:bg-gray-950">

    <!-- Navbar -->
    <header class="sticky top-0 z-40 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80">
      <div class="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-4">
        <div class="flex items-center gap-2 shrink-0">
          <img src="/logo.webp" alt="WeatherDash logo" class="w-8 h-8 rounded-xl object-cover" />
          <span class="font-bold text-gray-900 dark:text-white text-base hidden md:block">WeatherDash</span>
        </div>

        <div class="flex-1">
          <CitySearch @city-selected="onCitySelected" />
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            v-if="weather"
            class="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'animate-spin': isLoading }"
            aria-label="Refresh"
            @click="refreshWeather"
          >
            <RefreshCw :size="18" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-4 sm:space-y-5">

      <!-- Loading -->
      <LoadingSkeleton v-if="isLoading && !weather" type="dashboard" />

      <!-- Error -->
      <div v-else-if="error && !weather" class="flex flex-col items-center justify-center py-24 text-center px-4">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle :size="30" class="text-red-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">Something went wrong</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-5 max-w-xs text-sm">{{ error }}</p>
        <button
          class="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium text-sm"
          @click="store.clearError"
        >Try again</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!weather" class="flex flex-col items-center justify-center py-24 text-center px-4">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center mb-6">
          <CloudSun :size="44" class="text-primary-400" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">Detecting your location…</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-xs text-sm">Allow location access or search for a city manually.</p>
        <button
          class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200 dark:shadow-primary-900/30 font-semibold text-sm"
          @click="onUseLocation"
        >
          <LocateFixed :size="16" />
          Use my location
        </button>
      </div>

      <!-- Dashboard content -->
      <template v-else>

        <!-- Stats bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="stat in quickStats"
            :key="stat.label"
            class="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="stat.bg">
              <component :is="stat.icon" :size="18" :class="stat.color" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-gray-400 truncate">{{ stat.label }}</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ stat.value }}</p>
            </div>
          </div>
        </div>

        <!-- Row 1: WeatherCard + side panel -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div class="lg:col-span-2">
            <WeatherCard
              :weather-data="weather"
              :unit="store.unit"
              @unit-toggle="store.toggleUnit"
            />
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <!-- Sun times -->
            <div class="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Sun Schedule</p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <Sunrise :size="18" class="text-amber-500" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Sunrise</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">{{ sunrise }}</p>
                  </div>
                </div>
                <div class="h-px bg-gray-100 dark:bg-gray-800" />
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <Sunset :size="18" class="text-orange-500" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Sunset</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">{{ sunset }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wind -->
            <div class="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Wind</p>
              <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
                  <Navigation
                    :size="18"
                    class="text-teal-500"
                    :style="{ transform: `rotate(${weather.windDeg ?? 0}deg)` }"
                  />
                </div>
                <div>
                  <p class="text-xs text-gray-400">Direction</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ windDirection }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Wind :size="18" class="text-blue-500" />
                </div>
                <div>
                  <p class="text-xs text-gray-400">Speed</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ weather.windSpeed }} m/s</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Metrics -->
        <MetricsGrid :weather-data="weather" />

        <!-- Row 3: Forecast chart -->
        <ForecastChart
          v-if="forecast?.days"
          :forecast-data="formattedForecast"
          :unit="store.unit"
        />

        <!-- Row 4: Map -->
        <WeatherMap
          v-if="store.selectedCity"
          :coordinates="{ lat: store.selectedCity.lat, lon: store.selectedCity.lon }"
          :city-name="store.selectedCity.name"
          :temperature="weather.temp"
          :unit="store.unit"
        />

      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import {
  CloudSun, LocateFixed, RefreshCw, AlertCircle,
  Sunrise, Sunset, Navigation, Wind, Thermometer,
  Droplets, Eye, Gauge,
} from 'lucide-vue-next'
import { useWeatherStore } from '@stores/weatherStore'
import { useTheme } from '@composables/useTheme'
import { useWeather } from '@composables/useWeather'
import { useGeolocation } from '@composables/useGeolocation'

import CitySearch      from '@components/weather/CitySearch.vue'
import WeatherCard     from '@components/weather/WeatherCard.vue'
import MetricsGrid     from '@components/weather/MetricsGrid.vue'
import ForecastChart   from '@components/weather/ForecastChart.vue'
import WeatherMap      from '@components/weather/WeatherMap.vue'
import ThemeToggle     from '@components/ui/ThemeToggle.vue'
import LoadingSkeleton from '@components/ui/LoadingSkeleton.vue'

const store = useWeatherStore()
useTheme()

const {
  weather, forecast, isLoading, error,
  fetchWeather, refreshWeather,
  windDirection, sunrise, sunset, formattedForecast,
} = useWeather()

const { getLocation, city: geoCity } = useGeolocation()

const onCitySelected = (city) => fetchWeather(city)
const onUseLocation = async () => {
  await getLocation()
  if (geoCity.value) fetchWeather(geoCity.value)
}

const quickStats = computed(() => {
  if (!weather.value) return []
  const unitSymbol = store.unit === 'metric' ? '°C' : '°F'
  return [
    {
      label: 'Temperature',
      value: `${weather.value.temp}${unitSymbol}`,
      icon: Thermometer,
      color: 'text-primary-500',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      label: 'Humidity',
      value: `${weather.value.humidity}%`,
      icon: Droplets,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Visibility',
      value: `${(weather.value.visibility / 1000).toFixed(1)} km`,
      icon: Eye,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Pressure',
      value: `${weather.value.pressure} hPa`,
      icon: Gauge,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]
})

onMounted(async () => {
  if (store.selectedCity) {
    await fetchWeather(store.selectedCity)
  } else {
    await getLocation()
    if (geoCity.value) fetchWeather(geoCity.value)
  }
})
</script>
