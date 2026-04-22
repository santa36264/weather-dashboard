import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentWeather: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchWeather(city) {
      this.loading = true
      this.error = null
      try {
        // API call will go here
        this.currentWeather = { city, temp: 0 }
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
})
