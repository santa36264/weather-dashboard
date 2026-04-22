<template>
  <div
    class="glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
  >
    <!-- Header: icon + label -->
    <div class="flex items-center gap-3 mb-4">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center"
        :class="`bg-${iconColor.split('-')[1]}-100 dark:bg-${iconColor.split('-')[1]}-900/30`"
      >
        <component :is="iconComponent" :size="20" :class="iconColor" />
      </div>
      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
        {{ label }}
      </span>
    </div>

    <!-- Value + unit -->
    <div class="flex items-baseline gap-2 mb-2">
      <span class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ value }}
      </span>
      <span class="text-lg text-gray-500 dark:text-gray-400">
        {{ unit }}
      </span>

      <!-- Wind direction arrow -->
      <component
        v-if="windDeg != null"
        :is="Navigation"
        :size="20"
        class="text-teal-500 ml-auto"
        :style="{ transform: `rotate(${windDeg}deg)` }"
      />

      <!-- Trend icon -->
      <component
        v-if="trendIcon"
        :is="trendIcons[trendIcon]"
        :size="20"
        :class="subColor"
        class="ml-auto"
      />
    </div>

    <!-- Sub label -->
    <p v-if="sub" class="text-sm font-medium mb-3" :class="subColor">
      {{ sub }}
    </p>

    <!-- Progress bar (humidity) -->
    <div v-if="progress != null" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="progressColor"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Navigation,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-vue-next'

const props = defineProps({
  icon: { type: String, required: true },
  iconColor: { type: String, default: 'text-gray-500' },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  sub: { type: String, default: null },
  subColor: { type: String, default: 'text-gray-500' },
  progress: { type: Number, default: null },
  progressColor: { type: String, default: 'bg-blue-500' },
  windDeg: { type: Number, default: null },
  trendIcon: { type: String, default: null },
})

const iconMap = { Droplets, Wind, Eye, Gauge, Navigation }
const trendIcons = { TrendingUp, TrendingDown, Minus }

const iconComponent = computed(() => iconMap[props.icon] || Gauge)
</script>
