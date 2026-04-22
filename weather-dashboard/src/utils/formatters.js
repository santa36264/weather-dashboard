import { format } from 'date-fns'

export const formatTemperature = (temp, unit = 'C') => {
  return `${Math.round(temp)}°${unit}`
}

export const formatDate = (date, pattern = 'PPP') => {
  return format(new Date(date), pattern)
}

export const formatTime = (date) => {
  return format(new Date(date), 'HH:mm')
}
