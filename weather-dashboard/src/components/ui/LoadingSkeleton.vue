<template>
  <div>
    <!-- Weather Card Skeleton -->
    <div v-if="type === 'weather-card'" class="rounded-3xl p-6 md:p-8 bg-gray-200 dark:bg-gray-800">
      <div class="flex items-start justify-between mb-6">
        <div class="flex-1">
          <div class="shimmer h-8 w-40 rounded-lg mb-2" />
          <div class="shimmer h-4 w-32 rounded" />
        </div>
        <div class="shimmer w-16 h-16 md:w-20 md:h-20 rounded-full" />
      </div>

      <div class="flex items-end gap-4 mb-2">
        <div class="shimmer h-24 w-32 rounded-lg" />
        <div class="shimmer h-16 w-12 rounded-lg mb-3" />
      </div>

      <div class="shimmer h-6 w-48 rounded mb-1" />
      <div class="shimmer h-4 w-36 rounded" />

      <div class="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 grid grid-cols-3 gap-2">
        <div v-for="i in 3" :key="i" class="text-center">
          <div class="shimmer h-3 w-16 rounded mx-auto mb-2" />
          <div class="shimmer h-5 w-12 rounded mx-auto" />
        </div>
      </div>
    </div>

    <!-- Metrics Grid Skeleton -->
    <div v-else-if="type === 'metrics-grid'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="glass-card rounded-2xl p-5"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="shimmer w-10 h-10 rounded-xl" />
          <div class="shimmer h-4 w-20 rounded" />
        </div>

        <div class="flex items-baseline gap-2 mb-2">
          <div class="shimmer h-10 w-16 rounded" />
          <div class="shimmer h-6 w-10 rounded" />
        </div>

        <div class="shimmer h-4 w-24 rounded mb-3" />
        <div class="shimmer h-2 w-full rounded-full" />
      </div>
    </div>

    <!-- Forecast Chart Skeleton -->
    <div v-else-if="type === 'forecast-chart'" class="glass-card rounded-2xl p-5">
      <div class="flex items-center justify-between mb-5">
        <div class="shimmer h-5 w-32 rounded" />
        <div class="shimmer h-8 w-24 rounded-lg" />
      </div>

      <div class="relative w-full" style="height: 260px">
        <!-- Chart bars placeholder -->
        <div class="flex items-end justify-around h-full gap-4 px-4">
          <div v-for="i in 5" :key="i" class="flex-1 flex flex-col items-center gap-2">
            <div class="shimmer w-full rounded-t-lg" :style="{ height: `${50 + Math.random() * 50}%` }" />
            <div class="shimmer h-3 w-8 rounded" />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 mt-4">
        <div class="shimmer h-4 w-16 rounded" />
        <div class="shimmer h-4 w-16 rounded" />
      </div>
    </div>

    <!-- Search Skeleton -->
    <div v-else-if="type === 'search'" class="w-full">
      <div class="shimmer h-12 w-full rounded-2xl" />
    </div>

    <!-- Map Skeleton -->
    <div v-else-if="type === 'map'" class="glass-card rounded-2xl overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4">
        <div class="shimmer h-5 w-28 rounded" />
        <div class="shimmer h-8 w-32 rounded-lg" />
      </div>
      <div class="shimmer w-full" style="height: 320px" />
    </div>

    <!-- Full Dashboard Skeleton -->
    <div v-else-if="type === 'dashboard'" class="space-y-6">
      <LoadingSkeleton type="search" />
      <LoadingSkeleton type="weather-card" />
      <LoadingSkeleton type="metrics-grid" />
      <LoadingSkeleton type="forecast-chart" />
    </div>

    <!-- Generic Skeleton -->
    <div v-else class="shimmer h-32 w-full rounded-2xl" />
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'generic',
    validator: (v) =>
      ['weather-card', 'metrics-grid', 'forecast-chart', 'search', 'map', 'dashboard', 'generic'].includes(v),
  },
})
</script>
