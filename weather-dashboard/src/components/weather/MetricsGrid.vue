<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <MetricCard
      v-for="metric in metrics"
      :key="metric.id"
      v-bind="metric"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricCard from './MetricCard.vue'
import { degreesToCardinal } from '@composables/useWeather'

const props = defineProps({
  weatherData: {
    type: Object,
    required: true,
  },
})

// ─── Humidity ─────────────────────────────────────────────────────────────────

const humidityLevel = computed(() => {
  const h = props.weatherData.humidity
  if (h >= 80) return { label: 'Very High', color: 'text-blue-500' }
  if (h >= 60) return { label: 'High',      color: 'text-cyan-500' }
  if (h >= 40) return { label: 'Moderate',  color: 'text-green-500' }
  return              { label: 'Low',        color: 'text-yellow-500' }
})

// ─── Visibility ───────────────────────────────────────────────────────────────

const visibilityKm = computed(() =>
  props.weatherData.visibility != null
    ? (props.weatherData.visibility / 1000).toFixed(1)
    : '--'
)

const visibilityQuality = computed(() => {
  const v = props.weatherData.visibility
  if (v >= 10000) return { label: 'Excellent', color: 'text-green-500' }
  if (v >= 5000)  return { label: 'Good',      color: 'text-lime-500' }
  if (v >= 2000)  return { label: 'Moderate',  color: 'text-yellow-500' }
  return                 { label: 'Poor',       color: 'text-red-500' }
})

// ─── Pressure ─────────────────────────────────────────────────────────────────

const pressureTrend = computed(() => {
  const p = props.weatherData.pressure
  if (p > 1020) return { icon: 'TrendingUp',   label: 'High',   color: 'text-blue-500' }
  if (p < 1000) return { icon: 'TrendingDown',  label: 'Low',    color: 'text-orange-500' }
  return               { icon: 'Minus',          label: 'Normal', color: 'text-green-500' }
})

// ─── Metrics config ───────────────────────────────────────────────────────────

const metrics = computed(() => [
  {
    id: 'humidity',
    icon: 'Droplets',
    iconColor: 'text-blue-400',
    label: 'Humidity',
    value: props.weatherData.humidity,
    unit: '%',
    sub: humidityLevel.value.label,
    subColor: humidityLevel.value.color,
    progress: props.weatherData.humidity,
    progressColor: 'bg-blue-400',
  },
  {
    id: 'wind',
    icon: 'Wind',
    iconColor: 'text-teal-400',
    label: 'Wind Speed',
    value: props.weatherData.windSpeed,
    unit: 'm/s',
    sub: degreesToCardinal(props.weatherData.windDeg),
    subColor: 'text-teal-500',
    windDeg: props.weatherData.windDeg,
  },
  {
    id: 'visibility',
    icon: 'Eye',
    iconColor: 'text-purple-400',
    label: 'Visibility',
    value: visibilityKm.value,
    unit: 'km',
    sub: visibilityQuality.value.label,
    subColor: visibilityQuality.value.color,
  },
  {
    id: 'pressure',
    icon: 'Gauge',
    iconColor: 'text-orange-400',
    label: 'Pressure',
    value: props.weatherData.pressure,
    unit: 'hPa',
    sub: pressureTrend.value.label,
    subColor: pressureTrend.value.color,
    trendIcon: pressureTrend.value.icon,
  },
])
</script>
