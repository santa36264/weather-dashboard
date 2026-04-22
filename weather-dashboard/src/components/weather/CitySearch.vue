<template>
  <div class="relative w-full" ref="containerRef">

    <!-- Input row -->
    <div
      class="flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-200"
      :class="[
        isFocused
          ? 'border-primary-400 shadow-lg shadow-primary-100 dark:shadow-primary-900/20'
          : 'border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800',
      ]"
    >
      <!-- Search icon / spinner -->
      <Loader2 v-if="isLoading" :size="18" class="text-primary-400 animate-spin shrink-0" />
      <Search v-else :size="18" class="text-gray-400 shrink-0" />

      <input
        ref="inputRef"
        v-model="query"
        type="text"
        placeholder="Search city..."
        class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <!-- Clear button -->
      <button
        v-if="query"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        @mousedown.prevent="clearSearch"
        aria-label="Clear search"
      >
        <X :size="16" />
      </button>

      <!-- Divider -->
      <span class="w-px h-5 bg-gray-200 dark:bg-gray-600" />

      <!-- Geolocation button -->
      <button
        class="text-gray-400 hover:text-primary-500 transition-colors"
        :class="{ 'animate-pulse text-primary-400': geoLoading }"
        :disabled="geoLoading"
        @mousedown.prevent="onGeolocate"
        aria-label="Use my location"
      >
        <LocateFixed :size="18" />
      </button>
    </div>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="absolute z-50 w-full mt-2 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
      >
        <!-- Error -->
        <div v-if="error" class="px-4 py-3 text-sm text-red-500 flex items-center gap-2">
          <AlertCircle :size="16" />
          {{ error }}
        </div>

        <!-- Results -->
        <template v-else-if="results.length">
          <p class="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Results
          </p>
          <ul role="listbox">
            <li
              v-for="(city, i) in results"
              :key="`${city.lat}-${city.lon}`"
              role="option"
              :aria-selected="activeIndex === i"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-sm"
              :class="
                activeIndex === i
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              "
              @mousedown.prevent="selectCity(city)"
            >
              <MapPin :size="15" class="text-gray-400 shrink-0" />
              <span class="flex-1 truncate">{{ city.fullName }}</span>
              <span class="text-xs text-gray-400 shrink-0">{{ city.country }}</span>
            </li>
          </ul>
        </template>

        <!-- Recent searches -->
        <template v-if="!query && recentSearches.length">
          <p class="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Recent
          </p>
          <ul>
            <li
              v-for="(city, i) in recentSearches"
              :key="`recent-${city.lat}-${city.lon}`"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              @mousedown.prevent="selectCity(city)"
            >
              <Clock :size="15" class="text-gray-400 shrink-0" />
              <span class="flex-1 truncate">{{ city.fullName }}</span>
            </li>
          </ul>
        </template>

        <!-- Empty state -->
        <div
          v-if="!error && !results.length && query && !isLoading"
          class="px-4 py-6 text-center text-sm text-gray-400"
        >
          No cities found for "{{ query }}"
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  Search, X, LocateFixed, MapPin, Clock,
  Loader2, AlertCircle,
} from 'lucide-vue-next'
import { debouncedSearchCities } from '@services/geocodingService'
import { useGeolocation } from '@composables/useGeolocation'
import { useWeatherStore } from '@stores/weatherStore'

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits(['city-selected'])

// ─── State ────────────────────────────────────────────────────────────────────

const query       = ref('')
const results     = ref([])
const isLoading   = ref(false)
const error       = ref(null)
const isFocused   = ref(false)
const activeIndex = ref(-1)
const inputRef    = ref(null)
const containerRef = ref(null)

const store = useWeatherStore()
const recentSearches = computed(() => store.recentSearches)

const { getLocation, city: geoCity, isLoading: geoLoading } = useGeolocation()

const showDropdown = computed(() =>
  isFocused.value && (results.value.length > 0 || !!error.value || (!query.value && recentSearches.value.length > 0) || (query.value && !isLoading.value))
)

// ─── Search ───────────────────────────────────────────────────────────────────

watch(query, async (val) => {
  activeIndex.value = -1
  error.value = null
  results.value = []

  if (!val.trim()) return

  isLoading.value = true
  try {
    results.value = await debouncedSearchCities(val)
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

// ─── Actions ──────────────────────────────────────────────────────────────────

const selectCity = (city) => {
  query.value = city.fullName
  results.value = []
  isFocused.value = false
  emit('city-selected', city)
}

const clearSearch = () => {
  query.value = ''
  results.value = []
  error.value = null
  activeIndex.value = -1
  inputRef.value?.focus()
}

const onGeolocate = async () => {
  await getLocation()
  if (geoCity.value) {
    selectCity(geoCity.value)
  }
}

// ─── Keyboard navigation ──────────────────────────────────────────────────────

const onKeydown = (e) => {
  const list = results.value
  if (!list.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, list.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault()
    selectCity(list[activeIndex.value])
  } else if (e.key === 'Escape') {
    isFocused.value = false
    inputRef.value?.blur()
  }
}

// ─── Focus / blur ─────────────────────────────────────────────────────────────

const onFocus = () => { isFocused.value = true }
const onBlur  = () => {
  // small delay so mousedown on dropdown items fires first
  setTimeout(() => { isFocused.value = false }, 150)
}

// Close on outside click
const onOutsideClick = (e) => {
  if (!containerRef.value?.contains(e.target)) isFocused.value = false
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
