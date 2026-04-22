<template>
  <button
    class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
    :class="isDark ? 'bg-indigo-600' : 'bg-amber-400'"
    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    :aria-pressed="isDark"
    role="switch"
    @click="toggleTheme"
  >
    <!-- Track icons -->
    <span class="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
      <Moon :size="13" class="text-indigo-200 transition-opacity duration-300" :class="isDark ? 'opacity-100' : 'opacity-0'" />
      <Sun  :size="13" class="text-amber-100 transition-opacity duration-300" :class="isDark ? 'opacity-0' : 'opacity-100'" />
    </span>

    <!-- Thumb -->
    <span
      class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300"
      :class="isDark ? 'translate-x-7' : 'translate-x-0'"
      aria-hidden="true"
    >
      <Sun  v-if="!isDark" :size="14" class="text-amber-500" />
      <Moon v-else          :size="14" class="text-indigo-600" />
    </span>
  </button>
</template>

<script setup>
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>
