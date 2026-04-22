<template>
  <RouterView />
  <BottomNav />
  <ToastNotification />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useTheme } from '@composables/useTheme'
import ToastNotification from '@components/ui/ToastNotification.vue'
import BottomNav from '@components/ui/BottomNav.vue'

// Initializes theme from persisted state or system preference on mount
useTheme()
</script>
