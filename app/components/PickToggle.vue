<script setup lang="ts">
import type { Film, Screening } from '#shared/types/festival'

/**
 * `square`: the icon toggle on the timeline, a pressed/unpressed button with a fixed name.
 * `text`: a labelled button whose label is the action it will take.
 */
const props = withDefaults(defineProps<{ screening: Screening, film: Film, variant?: 'square' | 'text' }>(), { variant: 'square' })

const plan = usePlan()
const picked = computed(() => plan.isPicked(props.screening.id))
const when = computed(() => `${shortDay(props.screening.date)}, ${props.screening.start}`)
</script>

<template>
  <button
    v-if="variant === 'square'"
    type="button"
    class="pick"
    :aria-pressed="picked"
    :disabled="!plan.loaded.value"
    @click="plan.toggle(screening.id)"
  >
    <AppIcon :name="picked ? 'check' : 'plus'" :size="16" />
    <span class="sr-only">Pick {{ film.title }}, {{ when }}</span>
  </button>

  <button
    v-else
    type="button"
    :class="picked ? 'btn btn--quiet' : 'btn'"
    :disabled="!plan.loaded.value"
    @click="plan.toggle(screening.id)"
  >
    <AppIcon :name="picked ? 'x' : 'plus'" :size="16" />
    {{ picked ? 'Remove from plan' : 'Add to plan' }}
    <span class="sr-only">: {{ film.title }}, {{ when }}</span>
  </button>
</template>
