<script setup lang="ts">
// Paths from Lucide (ISC licence), the page's one icon set.
const PATHS = {
  'plus': ['M5 12h14', 'M12 5v14'],
  'check': ['M20 6 9 17l-5-5'],
  'calendar-plus': ['M8 2v4', 'M16 2v4', 'M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8', 'M3 10h18', 'M16 19h6', 'M19 16v6'],
  'download': ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  'alert': ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  'x': ['M18 6 6 18', 'm6 6 12 12'],
  'sliders': ['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'],
} as const

const props = withDefaults(defineProps<{ name: keyof typeof PATHS, size?: number }>(), { size: 18 })
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.25"
    stroke-linecap="square"
    stroke-linejoin="miter"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="d in PATHS[props.name]" :key="d" :d="d" />
  </svg>
</template>
