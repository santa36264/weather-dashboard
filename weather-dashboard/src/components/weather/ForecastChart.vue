<template>
  <div class="glass-card rounded-2xl p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white">
        5-Day Forecast
      </h3>

      <!-- Line / Bar toggle -->
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          v-for="type in ['line', 'bar']"
          :key="type"
          class="px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors"
          :class="
            chartType === type
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          "
          @click="chartType = type"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <!-- Chart -->
    <div class="relative w-full" style="height: 260px">
      <component
        :is="chartType === 'line' ? Line : Bar"
        :data="chartData"
        :options="chartOptions"
      />
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
      <span class="flex items-center gap-2">
        <span class="w-6 h-0.5 rounded bg-primary-500 inline-block" />
        High
      </span>
      <span class="flex items-center gap-2">
        <span class="w-6 h-0.5 rounded bg-secondary-500 inline-block" />
        Low
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'
import { useUiStore } from '@stores/uiStore'
import { formatDate } from '@utils/formatters'

// Register Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps({
  forecastData: {
    type: Array,
    required: true,
  },
  unit: {
    type: String,
    default: 'metric',
  },
})

// ─── State ────────────────────────────────────────────────────────────────────

const chartType = ref('line')
const ui = useUiStore()
const isDark = computed(() => ui.isDark)

// ─── Colors ───────────────────────────────────────────────────────────────────

const gridColor  = computed(() => isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
const labelColor = computed(() => isDark.value ? '#9ca3af' : '#6b7280')
const unitSymbol = computed(() => props.unit === 'metric' ? '°C' : '°F')

// ─── Chart Data ───────────────────────────────────────────────────────────────

const chartData = computed(() => ({
  labels: props.forecastData.map((d) => formatDate(d.date, 'EEE')),
  datasets: [
    {
      label: `High (${unitSymbol.value})`,
      data: props.forecastData.map((d) => d.max),
      borderColor: '#f95738',
      backgroundColor: chartType.value === 'bar'
        ? 'rgba(249,87,56,0.7)'
        : 'rgba(249,87,56,0.12)',
      pointBackgroundColor: '#f95738',
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2.5,
      tension: 0.4,
      fill: chartType.value === 'line',
    },
    {
      label: `Low (${unitSymbol.value})`,
      data: props.forecastData.map((d) => d.min),
      borderColor: '#0c8fe7',
      backgroundColor: chartType.value === 'bar'
        ? 'rgba(12,143,231,0.7)'
        : 'rgba(12,143,231,0.12)',
      pointBackgroundColor: '#0c8fe7',
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2.5,
      tension: 0.4,
      fill: chartType.value === 'line',
    },
  ],
}))

// ─── Chart Options ────────────────────────────────────────────────────────────

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
      titleColor: isDark.value ? '#f9fafb' : '#111827',
      bodyColor: isDark.value ? '#d1d5db' : '#374151',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx) =>
          ` ${ctx.dataset.label}: ${ctx.parsed.y}${unitSymbol.value}`,
        title: (items) => {
          const day = props.forecastData[items[0].dataIndex]
          return formatDate(day.date, 'EEEE, MMM d')
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: gridColor.value, drawBorder: false },
      ticks: { color: labelColor.value, font: { size: 13 } },
      border: { display: false },
    },
    y: {
      grid: { color: gridColor.value, drawBorder: false },
      ticks: {
        color: labelColor.value,
        font: { size: 12 },
        callback: (v) => `${v}${unitSymbol.value}`,
      },
      border: { display: false },
    },
  },
}))
</script>
