<template>
  <div
    class="relative overflow-hidden rounded-3xl transition-all duration-500"
    :class="`bg-gradient-to-br ${gradient}`"
    style="min-height: 280px"
  >
    <!-- Background decorative circles -->
    <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
    <div class="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

    <div class="relative z-10 p-5 sm:p-6 md:p-8 h-full flex flex-col justify-between">

      <!-- Top row: location + icon -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <MapPin :size="14" class="text-white/70 shrink-0" />
            <span class="text-white/70 text-xs sm:text-sm font-medium">{{ weatherData.country }}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight truncate">
            {{ weatherData.city }}
          </h2>
          <p class="text-white/60 text-xs sm:text-sm mt-1">{{ currentTime }} · {{ currentDate }}</p>
        </div>

        <!-- Large weather icon -->
        <div class="flex flex-col items-center shrink-0">
          <img
            :src="theme?.icon"
            :alt="weatherData.description"
            class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-2xl"
            @error="onIconError"
          />
        </div>
      </div>

      <!-- Middle: temperature -->
      <div class="flex items-center gap-2 my-3 sm:my-4">
        <span class="text-7xl sm:text-8xl md:text-9xl font-extralight text-white leading-none">
          {{ weatherData.temp }}
        </span>

        <!-- Unit toggle -->
        <div class="flex flex-col gap-1 mt-2">
          <button
            class="text-xl sm:text-2xl font-semibold transition-all leading-none"
            :class="unit === 'metric' ? 'text-white' : 'text-white/40 hover:text-white/70'"
            @click="$emit('unit-toggle')"
          >°C</button>
          <div class="w-full h-px bg-white/30" />
          <button
            class="text-xl sm:text-2xl font-semibold transition-all leading-none"
            :class="unit === 'imperial' ? 'text-white' : 'text-white/40 hover:text-white/70'"
            @click="$emit('unit-toggle')"
          >°F</button>
        </div>
      </div>

      <!-- Bottom: condition + stats -->
      <div>
        <p class="text-lg sm:text-xl font-semibold text-white capitalize mb-0.5">
          {{ weatherData.description }}
        </p>
        <p class="text-white/60 text-xs sm:text-sm mb-4 sm:mb-5">
          Feels like <span class="text-white font-medium">{{ weatherData.feelsLike }}°</span>
        </p>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div class="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 sm:py-2.5 text-center">
            <Droplets :size="14" class="text-white/70 mx-auto mb-1" />
            <p class="text-white font-bold text-sm sm:text-base">{{ weatherData.humidity }}%</p>
            <p class="text-white/60 text-[10px] sm:text-xs uppercase tracking-wide">Humidity</p>
          </div>
          <div class="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 sm:py-2.5 text-center">
            <Wind :size="14" class="text-white/70 mx-auto mb-1" />
            <p class="text-white font-bold text-sm sm:text-base">{{ weatherData.windSpeed }}</p>
            <p class="text-white/60 text-[10px] sm:text-xs uppercase tracking-wide">Wind</p>
          </div>
          <div class="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 sm:py-2.5 text-center">
            <Eye :size="14" class="text-white/70 mx-auto mb-1" />
            <p class="text-white font-bold text-sm sm:text-base">{{ visibilityKm }}</p>
            <p class="text-white/60 text-[10px] sm:text-xs uppercase tracking-wide">Vis.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { MapPin, Droplets, Wind, Eye } from 'lucide-vue-next'
import { useUiStore } from '@stores/uiStore'
import iconService, { getWeatherGradient } from '@services/iconService'
import { formatTime, formatDate } from '@utils/formatters'

const props = defineProps({
  weatherData: { type: Object, required: true },
  unit: { type: String, default: 'metric' },
})

defineEmits(['unit-toggle'])

const ui = useUiStore()
const isDark = computed(() => ui.isDark)

const theme = computed(() =>
  props.weatherData?.iconCode
    ? iconService.getWeatherTheme(props.weatherData.iconCode, props.weatherData.conditionId)
    : null
)

const gradient = computed(() =>
  props.weatherData?.iconCode
    ? getWeatherGradient(props.weatherData.iconCode)
    : 'from-blue-400 to-blue-600'
)

const onIconError = (e) => {
  if (props.weatherData?.iconCode)
    e.target.src = iconService.getFallbackUrl(props.weatherData.iconCode)
}

const currentTime = ref(formatTime(new Date()))
const currentDate = ref(formatDate(new Date(), 'EEE, MMM d'))
let clockTimer = null

onMounted(() => {
  clockTimer = setInterval(() => {
    currentTime.value = formatTime(new Date())
    currentDate.value = formatDate(new Date(), 'EEE, MMM d')
  }, 60000)
})
onUnmounted(() => clearInterval(clockTimer))

const visibilityKm = computed(() =>
  props.weatherData?.visibility != null
    ? (props.weatherData.visibility / 1000).toFixed(1)
    : '--'
)
</script>
