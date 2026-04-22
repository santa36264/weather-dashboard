<template>
  <Teleport to="body">
    <div
      class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-64 max-w-sm border text-sm font-medium"
          :class="styles[toast.type]"
          role="alert"
        >
          <!-- Icon -->
          <component :is="icons[toast.type]" :size="18" class="shrink-0 mt-0.5" />

          <!-- Message -->
          <span class="flex-1 leading-snug">{{ toast.message }}</span>

          <!-- Dismiss -->
          <button
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            :aria-label="`Dismiss notification`"
            @click="ui.removeToast(toast.id)"
          >
            <X :size="15" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useUiStore } from '@stores/uiStore'

const ui = useUiStore()
const toasts = computed(() => ui.toasts)

const styles = {
  success: 'bg-green-50  dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
  error:   'bg-red-50    dark:bg-red-900/30   border-red-200   dark:border-red-700   text-red-800   dark:text-red-200',
  warning: 'bg-amber-50  dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200',
  info:    'bg-blue-50   dark:bg-blue-900/30  border-blue-200  dark:border-blue-700  text-blue-800  dark:text-blue-200',
}

const icons = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.25s ease;
}
</style>
