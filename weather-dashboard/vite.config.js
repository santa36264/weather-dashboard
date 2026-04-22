import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      vue(),

      // SVG optimization — import SVGs as Vue components
      svgr(),

      // Legacy browser support (ES5 transpilation + polyfills)
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
    ],

    // Path aliases
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      },
    },

    // Only expose VITE_ prefixed env vars to client
    envPrefix: 'VITE_',

    // Dev server + API proxy to avoid CORS
    server: {
      port: 5173,
      proxy: {
        '/api/weather': {
          target: 'https://api.openweathermap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/weather/, '/data/2.5'),
        },
        '/api/geo': {
          target: 'https://api.openweathermap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/geo/, '/geo/1.0'),
        },
      },
    },

    // Build optimizations
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('vue-router') || id.includes('pinia')) return 'vue-core'
            if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'charts'
            if (id.includes('leaflet')) return 'maps'
            if (id.includes('axios') || id.includes('date-fns') || id.includes('@vueuse')) return 'utils'
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
