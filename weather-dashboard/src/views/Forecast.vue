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

    <main class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-4 sm:space-y-5">

      <!-- Loading -->
      <div v-if="isLoading && !forecast" class="space-y-4">
        <LoadingSkeleton type="forecast-chart" />
        <LoadingSkeleton type="metrics-grid" />
      </div>

      <!-- No city selected -->
      <div v-else-if="!store.selectedCity" class="flex flex-col items-center justify-center py-24 text-center px-4">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-secondary-100 to-primary-100 dark:from-secondary-900/30 dark:to-primary-900/30 flex items-center justify-center mb-6">
          <CalendarDays :size="44" class="text-secondary-400" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">No city selected</h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-xs text-sm">Search for a city to see its 5-day forecast.</p>
      </div>

      <!-- Forecast content -->
      <template v-else-if="forecast?.days">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">5-Day Forecast</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ store.selectedCity?.fullName }}</p>
          </div>
          <button
            class="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'animate-spin': isLoading }"
            aria-label="Refresh"
            @click="refreshWeather"
          >
            <RefreshCw :size="18" />
          </button>
        </div>

        <!-- Daily cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            v-for="(day, i) in formattedForecast"
            :key="day.date"
            class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center gap-2 cursor-pointer transition-all duration-200"
            :class="selectedDay === i ? 'ring-2 ring-primary-400 shadow-lg' : 'hover:shadow-md'"
            @click="selectedDay = i"
          >
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">{{ day.label }}</p>
            <p class="text-xs text-gray-400">{{ day.fullDate }}</p>
            <img
              :src="`/icons/${iconFile(day.icon)}`"
              :alt="day.weather?.description"
              class="w-12 h-12"
              @error="(e) => e.target.src = day.icon"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize text-center leading-tight">
              {{ day.weather?.description }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm font-bold text-primary-500">{{ day.max }}°</span>
              <span class="text-sm text-gray-400">{{ day.min }}°</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-blue-400">
              <Droplets :size="12" />
              {{ day.humidity }}%
            </div>
          </div>
        </div>

        <!-- Chart -->
        <ForecastChart :forecast-data="formattedForecast" :unit="store.unit" />

        <!-- Selected day detail -->
        <Transition name="slide-up">
          <div
            v-if="selectedDay !== null && formattedForecast[selectedDay]"
            class="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div class="flex items-center gap-3 mb-4">
              <img
                :src="`/icons/${iconFile(formattedForecast[selectedDay].icon)}`"
                :alt="formattedForecast[selectedDay].weather?.description"
                class="w-14 h-14"
                @error="(e) => e.target.src = formattedForecast[selectedDay].icon"
              />
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ formattedForecast[selectedDay].label }} — {{ formattedForecast[selectedDay].fullDate }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {{ formattedForecast[selectedDay].weather?.description }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p class="text-xs text-gray-400 mb-1">High</p>
                <p class="text-xl font-bold text-primary-500">{{ formattedForecast[selectedDay].max }}°</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p class="text-xs text-gray-400 mb-1">Low</p>
                <p class="text-xl font-bold text-secondary-500">{{ formattedForecast[selectedDay].min }}°</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p class="text-xs text-gray-400 mb-1">Humidity</p>
                <p class="text-xl font-bold text-blue-500">{{ formattedForecast[selectedDay].humidity }}%</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p class="text-xs text-gray-400 mb-1">Range</p>
                <p class="text-xl font-bold text-gray-700 dark:text-gray-200">
                  {{ formattedForecast[selectedDay].max - formattedForecast[selectedDay].min }}°
                </p>
              </div>
            </div>
          </div>
        </Transition>

      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RefreshCw, CalendarDays, Droplets } from 'lucide-vue-next'
import { useWeatherStore } from '@stores/weatherStore'
import { useTheme } from '@composables/useTheme'
import { useWeather } from '@composables/useWeather'

import CitySearch      from '@components/weather/CitySearch.vue'
import ForecastChart   from '@components/weather/ForecastChart.vue'
import ThemeToggle     from '@components/ui/ThemeToggle.vue'
import LoadingSkeleton from '@components/ui/LoadingSkeleton.vue'

const store = useWeatherStore()
useTheme()

const { forecast, isLoading, fetchWeather, refreshWeather, formattedForecast } = useWeather()

const selectedDay = ref(0)

const onCitySelected = (city) => fetchWeather(city)

// Maps OWM icon URL to local SVG filename
const iconFile = (iconUrl = '') => {
  const code = iconUrl.match(/\/([0-9]{2}[dn])@/)?.[1] ?? iconUrl.split('/').pop()?.replace('@2x.png', '')
  const map = {
    '01d': 'clear-day.svg',      '01n': 'clear-night.svg',
    '02d': 'few-clouds-day.svg', '02n': 'few-clouds-night.svg',
    '03d': 'scattered-clouds.svg','03n': 'scattered-clouds.svg',
    '04d': 'broken-clouds.svg',  '04n': 'broken-clouds.svg',
    '09d': 'shower-rain.svg',    '09n': 'shower-rain.svg',
    '10d': 'rain-day.svg',       '10n': 'rain-night.svg',
    '11d': 'thunderstorm.svg',   '11n': 'thunderstorm.svg',
    '13d': 'snow.svg',           '13n': 'snow.svg',
    '50d': 'mist.svg',           '50n': 'mist.svg',
  }
  return map[code] ?? 'default.svg'
}

onMounted(async () => {
  if (store.selectedCity) await fetchWeather(store.selectedCity)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
