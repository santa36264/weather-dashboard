<template>
  <button
    class="px-4 py-2 rounded-lg font-medium transition-colors"
    :class="variant === 'primary' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
})
</script>
