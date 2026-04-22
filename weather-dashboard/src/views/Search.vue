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
        <ThemeToggle />
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-5">

      <!-- Loading -->
      <LoadingSkeleton v-if="isLoading" type="weather-card" />

      <!-- Selected city weather preview -->
      <template v-else-if="weather && store.selectedCity">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Search Results</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ store.selectedCity.fullName }}</p>
          </div>
          <button
            class="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Refresh"
            @click="refreshWeather"
          >
            <RefreshCw :size="18" />
          </button>
        </div>

        <!-- Weather card -->
        <WeatherCard
          :weather-data="weather"
          :unit="store.unit"
          @unit-toggle="store.toggleUnit"
        />

        <!-- Metrics -->
        <MetricsGrid :weather-data="weather" />

        <!-- Map -->
        <WeatherMap
          :coordinates="{ lat: store.selectedCity.lat, lon: store.selectedCity.lon }"
          :city-name="store.selectedCity.name"
          :temperature="weather.temp"
          :unit="store.unit"
        />

      </template>

      <!-- Recent searches + empty state -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-16 text-center px-4">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center mb-5">
            <SearchIcon :size="36" class="text-primary-400" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Search for a city</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
            Type a city name above to get current weather conditions.
          </p>
        </div>

        <!-- Recent searches -->
        <div v-if="store.recentSearches.length" class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Searches</h2>
            <button
              class="text-xs text-primary-500 hover:text-primary-600 transition-colors"
              @click="clearRecent"
            >Clear all</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              v-for="city in store.recentSearches"
              :key="`${city.lat}-${city.lon}`"
              class="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group"
              @click="onCitySelected(city)"
            >
              <div class="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                <MapPin :size="16" class="text-primary-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ city.name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ city.fullName }}</p>
              </div>
              <ArrowRight :size="16" class="text-gray-300 group-hover:text-primary-400 transition-colors shrink-0" />
            </button>
          </div>
        </div>

        <!-- Popular cities -->
        <div class="space-y-3">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Popular Cities</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              v-for="city in popularCities"
              :key="city.name"
              class="flex flex-col items-center gap-2 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
              @click="onCitySelected(city)"
            >
              <span class="text-2xl">{{ city.emoji }}</span>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ city.name }}</p>
              <p class="text-xs text-gray-400">{{ city.country }}</p>
            </button>
          </div>
        </div>
      </template>

    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RefreshCw, Search as SearchIcon, MapPin, ArrowRight } from 'lucide-vue-next'
import { useWeatherStore } from '@stores/weatherStore'
import { useTheme } from '@composables/useTheme'
import { useWeather } from '@composables/useWeather'

import CitySearch      from '@components/weather/CitySearch.vue'
import WeatherCard     from '@components/weather/WeatherCard.vue'
import MetricsGrid     from '@components/weather/MetricsGrid.vue'
import WeatherMap      from '@components/weather/WeatherMap.vue'
import ThemeToggle     from '@components/ui/ThemeToggle.vue'
import LoadingSkeleton from '@components/ui/LoadingSkeleton.vue'

const store = useWeatherStore()
useTheme()

const { weather, isLoading, fetchWeather, refreshWeather } = useWeather()

const onCitySelected = (city) => fetchWeather(city)

const clearRecent = () => {
  store.recentSearches = []
}

const popularCities = [
  { name: 'New York',  country: 'US', emoji: '🗽', lat: 40.7128,  lon: -74.006,  fullName: 'New York, US' },
  { name: 'London',    country: 'GB', emoji: '🎡', lat: 51.5074,  lon: -0.1278,  fullName: 'London, GB' },
  { name: 'Tokyo',     country: 'JP', emoji: '🗼', lat: 35.6762,  lon: 139.6503, fullName: 'Tokyo, JP' },
  { name: 'Paris',     country: 'FR', emoji: '🗼', lat: 48.8566,  lon: 2.3522,   fullName: 'Paris, FR' },
  { name: 'Dubai',     country: 'AE', emoji: '🏙️', lat: 25.2048,  lon: 55.2708,  fullName: 'Dubai, AE' },
  { name: 'Sydney',    country: 'AU', emoji: '🦘', lat: -33.8688, lon: 151.2093, fullName: 'Sydney, AU' },
]

onMounted(async () => {
  if (store.selectedCity) await fetchWeather(store.selectedCity)
})
</script>
