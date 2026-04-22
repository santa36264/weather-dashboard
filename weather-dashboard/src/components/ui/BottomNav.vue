<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60 safe-area-pb">
    <div class="max-w-6xl mx-auto px-2 flex items-center justify-around">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl transition-colors min-w-0"
        :class="
          isActive(item.to)
            ? 'text-primary-500'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
        "
      >
        <component
          :is="item.icon"
          :size="22"
          :stroke-width="isActive(item.to) ? 2.5 : 1.8"
        />
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { Home, LayoutDashboard, CalendarDays, Search } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { to: '/',          label: 'Home',     icon: Home },
  { to: '/dashboard', label: 'Dashboard',icon: LayoutDashboard },
  { to: '/forecast',  label: 'Forecast', icon: CalendarDays },
  { to: '/search',    label: 'Search',   icon: Search },
]

const isActive = (path) => route.path === path
</script>
