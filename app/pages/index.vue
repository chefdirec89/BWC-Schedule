<script setup lang="ts">
const filters = useScheduleFilters()
const plan = usePlan()

const allOfDay = computed(() => screenings.filter(s => s.date === filters.day.value))

const visible = computed(() => {
  const q = filters.search.value.toLowerCase()
  const after = filters.after.value ? toMinutes(filters.after.value) : null
  return allOfDay.value.filter((s) => {
    const f = getFilm(s.filmId)!
    if (q && ![f.title, ...f.directors, ...f.countries].some(v => v.toLowerCase().includes(q))) return false
    if (filters.genre.value && !f.genres.includes(filters.genre.value)) return false
    if (after !== null && span(s).start < after) return false
    if (filters.englishSubs.value && s.subtitles !== 'en' && s.subtitles !== 'id-en') return false
    if (filters.fitsPlan.value && !plan.isPicked(s.id) && clashingPicks(s, plan.picks.value).length) return false
    return true
  })
})

const dayTitle = computed(() => longDay(filters.day.value))
const weekday = computed(() => dayParts(filters.day.value).weekdayLong)
const date = computed(() => dayParts(filters.day.value).day)
const month = computed(() => dayParts(filters.day.value).monthLong)
const picksToday = computed(() => plan.picks.value.filter(s => s.date === filters.day.value))
const blockedToday = computed(() => visible.value.some(s => !plan.isPicked(s.id) && clashingPicks(s, plan.picks.value).length))

useSeoMeta({
  title: () => `${longDay(filters.day.value)}, Bandung World Cinema 2026`,
  description: 'Plan your Bandung World Cinema 2026 screenings at CGV Paris Van Java, 14 to 21 November, and send them to Google Calendar.',
})
</script>

<template>
  <section class="wrap pt-10" aria-labelledby="day-heading">
    <div class="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
      <h2 id="day-heading" class="day-head">
        <span class="day-head__weekday">{{ weekday }}</span>
        <span class="day-head__num">{{ date }}</span>
        <span class="day-head__month">{{ month }}</span>
      </h2>
      <p v-if="picksToday.length || blockedToday" class="legend" aria-hidden="true">
        <span class="legend__key"><span class="legend__swatch legend__swatch--picked" /> In your plan</span>
        <span class="legend__key"><span class="legend__swatch legend__swatch--blocked" /> Clashes with your plan</span>
      </p>
    </div>

    <ScheduleFilters class="mt-6" :shown="visible.length" :total="allOfDay.length" />

    <div class="mt-6">
      <DaySchedule v-if="visible.length" :screenings="visible" :axis-from="filters.activeCount.value ? visible : allOfDay" />
      <div v-else class="border-t-2 border-ink py-10">
        <p class="text-lg font-semibold">
          Nothing on {{ dayTitle }} matches these filters.
        </p>
        <p class="mt-2">
          Loosen one, or look at another day in the band above.
        </p>
        <button type="button" class="btn mt-6" @click="filters.clear()">
          Clear filters
        </button>
      </div>
    </div>
  </section>
</template>
