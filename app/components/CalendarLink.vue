<script setup lang="ts">
import type { Film, Screening } from '#shared/types/festival'

const props = withDefaults(defineProps<{ screening: Screening, film: Film, compact?: boolean }>(), { compact: false })

const siteUrl = useSiteUrl()
const href = computed(() => googleCalendarUrl(props.screening, props.film, siteUrl))
const when = computed(() => `${shortDay(props.screening.date)}, ${props.screening.start}`)
</script>

<template>
  <a v-if="compact" :href="href" class="cal-icon" target="_blank" rel="noopener">
    <AppIcon name="calendar-plus" :size="16" />
    <span class="sr-only">Add {{ film.title }}, {{ when }}, to Google Calendar (opens in a new tab)</span>
  </a>
  <a v-else :href="href" class="btn btn--quiet" target="_blank" rel="noopener">
    <AppIcon name="calendar-plus" :size="16" />
    Add to Google Calendar
    <span class="sr-only">: {{ film.title }}, {{ when }} (opens in a new tab)</span>
  </a>
</template>
