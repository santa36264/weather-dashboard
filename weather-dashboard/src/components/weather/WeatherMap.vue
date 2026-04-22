<template>
  <div class="glass-card rounded-2xl overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white">
        Location Map
      </h3>

      <!-- Layer toggle -->
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          v-for="layer in layers"
          :key="layer.id"
          class="px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors"
          :class="
            activeLayer === layer.id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          "
          @click="setLayer(layer.id)"
        >
          {{ layer.label }}
        </button>
      </div>
    </div>

    <!-- Map container -->
    <div ref="mapContainer" class="w-full" style="height: 320px">
      <!-- Fallback while loading -->
      <div
        v-if="!mapReady"
        class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      >
        <Loader2 :size="28" class="text-primary-400 animate-spin" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Loader2 } from 'lucide-vue-next'

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps({
  coordinates: {
    type: Object, // { lat, lon }
    required: true,
  },
  cityName: {
    type: String,
    default: '',
  },
  temperature: {
    type: Number,
    default: null,
  },
  unit: {
    type: String,
    default: 'metric',
  },
})

// ─── State ────────────────────────────────────────────────────────────────────

const mapContainer = ref(null)
const mapReady     = ref(false)
const activeLayer  = ref('none')

let map         = null
let marker      = null
let weatherTile = null
let observer    = null

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const layers = [
  { id: 'none',  label: 'None' },
  { id: 'temp',  label: 'Temp' },
  { id: 'clouds', label: 'Clouds' },
]

const LAYER_URLS = {
  temp:   `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
  clouds: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
}

// ─── Leaflet init ─────────────────────────────────────────────────────────────

const initMap = async () => {
  try {
    // Dynamic import — only loads Leaflet when map is visible
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')

    // Fix Leaflet's broken default icon paths in Vite
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
      iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
      shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    })

    const { lat, lon } = props.coordinates

    map = L.map(mapContainer.value, {
      center: [lat, lon],
      zoom: 10,
      zoomControl: true,
      attributionControl: true,
    })

    // Base tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    // Custom marker with temperature popup
    marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(buildPopup(), { maxWidth: 200 })

    mapReady.value = true
  } catch (err) {
    console.warn('WeatherMap: failed to initialize Leaflet', err)
  }
}

const buildPopup = () => {
  const unit = props.unit === 'metric' ? '°C' : '°F'
  const temp = props.temperature != null ? `${props.temperature}${unit}` : '--'
  return `
    <div style="text-align:center;font-family:Inter,sans-serif">
      <strong style="font-size:14px">${props.cityName}</strong><br/>
      <span style="font-size:22px;font-weight:300">${temp}</span>
    </div>
  `
}

// ─── Layer management ─────────────────────────────────────────────────────────

const setLayer = async (id) => {
  activeLayer.value = id
  if (!map) return

  const L = (await import('leaflet')).default

  if (weatherTile) {
    map.removeLayer(weatherTile)
    weatherTile = null
  }

  if (id !== 'none' && LAYER_URLS[id]) {
    weatherTile = L.tileLayer(LAYER_URLS[id], { opacity: 0.6, maxZoom: 18 })
    weatherTile.addTo(map)
  }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

// Re-center and update marker when coordinates change
watch(
  () => props.coordinates,
  async (coords) => {
    if (!map || !coords) return
    const { lat, lon } = coords
    map.setView([lat, lon], 10)
    marker?.setLatLng([lat, lon])
    marker?.setPopupContent(buildPopup())
  },
  { deep: true }
)

// Update popup when temperature changes
watch(
  () => [props.temperature, props.unit],
  () => marker?.setPopupContent(buildPopup())
)

// ─── Lazy load via IntersectionObserver ──────────────────────────────────────

onMounted(() => {
  observer = new IntersectionObserver(
    async ([entry]) => {
      if (entry.isIntersecting && !map) {
        observer.disconnect()
        await nextTick()
        await initMap()
      }
    },
    { threshold: 0.1 }
  )
  if (mapContainer.value) observer.observe(mapContainer.value)
})

onUnmounted(() => {
  observer?.disconnect()
  map?.remove()
  map = null
})
</script>
