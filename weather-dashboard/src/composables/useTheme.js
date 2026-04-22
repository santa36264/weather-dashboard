import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useUiStore } from '@stores/uiStore'

const TRANSITION_CLASS = 'theme-transitioning'
const TRANSITION_DURATION = 300 // ms — match this in CSS

/**
 * Applies or removes the `dark` class and triggers a smooth transition.
 * @param {'light'|'dark'} value
 */
const applyTheme = (value) => {
  const html = document.documentElement
  html.classList.add(TRANSITION_CLASS)
  html.classList.toggle('dark', value === 'dark')
  setTimeout(() => html.classList.remove(TRANSITION_CLASS), TRANSITION_DURATION)
}

export const useTheme = () => {
  const ui = useUiStore()

  // ─── Computed ──────────────────────────────────────────────────────────────

  const isDark = computed(() => ui.isDark)
  const theme = computed(() => ui.theme)

  // ─── System Preference ─────────────────────────────────────────────────────

  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')

  /**
   * Handles OS-level theme changes and syncs the store if the user
   * hasn't explicitly set a preference (i.e. store matches system).
   * @param {MediaQueryListEvent} e
   */
  const onSystemChange = (e) => {
    const systemTheme = e.matches ? 'dark' : 'light'
    // Only follow system if current theme already matches what system was before
    if (ui.theme === (e.matches ? 'light' : 'dark')) {
      ui.setTheme(systemTheme)
      applyTheme(systemTheme)
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Toggles between light and dark, with a smooth CSS transition.
   */
  const toggleTheme = () => {
    const next = ui.theme === 'light' ? 'dark' : 'light'
    ui.setTheme(next)
    applyTheme(next)
  }

  /**
   * Sets a specific theme explicitly.
   * @param {'light'|'dark'} value
   */
  const setTheme = (value) => {
    ui.setTheme(value)
    applyTheme(value)
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  onMounted(() => {
    // If no preference stored yet, fall back to system preference
    if (!ui.theme && mediaQuery) {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      ui.setTheme(systemTheme)
    }
    applyTheme(ui.theme)
    mediaQuery?.addEventListener('change', onSystemChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', onSystemChange)
  })

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme,
  }
}
