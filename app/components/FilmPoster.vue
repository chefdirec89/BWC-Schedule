<script setup lang="ts">
import type { Film } from '#shared/types/festival'

/** A real poster from TMDB. The page renders nothing in its place when there is none. */
defineProps<{ film: Film, src: string }>()
const emit = defineEmits<{ failed: [] }>()
</script>

<template>
  <figure class="poster">
    <img
      :src="src"
      :alt="`Poster for ${film.title}`"
      width="500"
      height="750"
      decoding="async"
      @error="emit('failed')"
    >
  </figure>
</template>
