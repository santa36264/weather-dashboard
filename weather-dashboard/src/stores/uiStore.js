import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

let toastId = 0

export const useUiStore = defineStore(
  'ui',
  () => {
    // ─── State ───────────────────────────────────────────────────────────────

    const theme = ref('light')           // 'light' | 'dark'
    const sidebarOpen = ref(false)       // mobile sidebar
    const chartView = ref('line')        // 'line' | 'bar'
    const loadingOverlay = ref(false)
    const toasts = ref([])               // [{ id, type, message, duration }]
    const modal = ref(null)              // { id, props } | null

    // ─── Getters ─────────────────────────────────────────────────────────────

    const isDark = computed(() => theme.value === 'dark')

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Syncs the `dark` class on <html> with current theme state */
    const applyTheme = (value) => {
      document.documentElement.classList.toggle('dark', value === 'dark')
    }

    // ─── Theme ───────────────────────────────────────────────────────────────

    /**
     * Toggles between light and dark theme and applies it to the DOM.
     */
    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
      applyTheme(theme.value)
    }

    /**
     * Sets a specific theme.
     * @param {'light'|'dark'} value
     */
    const setTheme = (value) => {
      theme.value = value
      applyTheme(value)
    }

    /**
     * Initializes theme from persisted state — call once on app mount.
     */
    const initTheme = () => {
      applyTheme(theme.value)
    }

    // ─── Sidebar ─────────────────────────────────────────────────────────────

    const openSidebar = () => { sidebarOpen.value = true }
    const closeSidebar = () => { sidebarOpen.value = false }
    const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }

    // ─── Chart View ──────────────────────────────────────────────────────────

    /**
     * Sets the preferred chart type.
     * @param {'line'|'bar'} type
     */
    const setChartView = (type) => {
      if (['line', 'bar'].includes(type)) chartView.value = type
    }

    // ─── Loading Overlay ─────────────────────────────────────────────────────

    const showOverlay = () => { loadingOverlay.value = true }
    const hideOverlay = () => { loadingOverlay.value = false }

    // ─── Toasts ──────────────────────────────────────────────────────────────

    /**
     * Adds a toast notification and auto-removes it after duration.
     * @param {{ message: string, type?: 'success'|'error'|'warning'|'info', duration?: number }} options
     * @returns {number} Toast ID (use to manually remove if needed)
     */
    const addToast = ({ message, type = 'info', duration = 4000 }) => {
      const id = ++toastId
      toasts.value.push({ id, message, type, duration })
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
      return id
    }

    /**
     * Removes a toast by ID.
     * @param {number} id
     */
    const removeToast = (id) => {
      const idx = toasts.value.findIndex((t) => t.id === id)
      if (idx !== -1) toasts.value.splice(idx, 1)
    }

    // Convenience toast shorthands
    const toast = {
      success: (message, duration) => addToast({ message, type: 'success', duration }),
      error:   (message, duration) => addToast({ message, type: 'error',   duration }),
      warning: (message, duration) => addToast({ message, type: 'warning', duration }),
      info:    (message, duration) => addToast({ message, type: 'info',    duration }),
    }

    // ─── Modal ───────────────────────────────────────────────────────────────

    /**
     * Opens a modal by component ID with optional props.
     * @param {string} id - Modal component identifier.
     * @param {object} [props={}] - Props to pass to the modal component.
     */
    const openModal = (id, props = {}) => {
      modal.value = { id, props }
    }

    /**
     * Closes the currently open modal.
     */
    const closeModal = () => {
      modal.value = null
    }

    return {
      // state
      theme,
      sidebarOpen,
      chartView,
      loadingOverlay,
      toasts,
      modal,
      // getters
      isDark,
      // theme
      toggleTheme,
      setTheme,
      initTheme,
      // sidebar
      openSidebar,
      closeSidebar,
      toggleSidebar,
      // chart
      setChartView,
      // overlay
      showOverlay,
      hideOverlay,
      // toasts
      addToast,
      removeToast,
      toast,
      // modal
      openModal,
      closeModal,
    }
  },
  {
    persist: {
      key: 'weather-ui',
      pick: ['theme', 'chartView'],
    },
  }
)
