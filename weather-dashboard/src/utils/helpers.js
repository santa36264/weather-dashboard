export const debounce = (fn, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
