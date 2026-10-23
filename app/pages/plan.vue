<script setup lang="ts">
import type { Screening } from '#shared/types/festival'

const plan = usePlan()
const siteUrl = useSiteUrl()
const platform = FESTIVAL.online.platform

const byDay = computed(() => {
  const groups = new Map<string, Screening[]>()
  for (const s of plan.picks.value) groups.set(s.date, [...(groups.get(s.date) ?? []), s])
  return [...groups.entries()]
})
const clashCount = computed(() => plan.clashesById.value.size)
const pickedFilmCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const s of plan.picks.value) counts.set(s.filmId, (counts.get(s.filmId) ?? 0) + 1)
  return counts
})

const summary = computed(() => {
  const n = plan.picks.value.length
  const days = byDay.value.length
  const clashes = clashCount.value ? ` ${plural(clashCount.value, 'screening')} clash, marked below.` : ' No clashes.'
  return `${plural(n, 'screening')} across ${plural(days, 'day')}.${clashes}`
})

function downloadIcs() {
  const items = plan.picks.value.map(screening => ({ screening, film: getFilm(screening.filmId)! }))
  const blob = new Blob([buildIcs(items, siteUrl)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bwc-2026-plan.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Clearing runs at once and can be undone for eight seconds.
const cleared = ref<string[] | null>(null)
let undoTimer: ReturnType<typeof setTimeout> | undefined
function clearPlan() {
  cleared.value = [...plan.ids.value]
  plan.replace([])
  clearTimeout(undoTimer)
  undoTimer = setTimeout(() => (cleared.value = null), 8000)
}
function undoClear() {
  if (cleared.value) plan.replace(cleared.value)
  cleared.value = null
  clearTimeout(undoTimer)
}
onBeforeUnmount(() => clearTimeout(undoTimer))

useSeoMeta({
  title: 'My plan, Bandung World Cinema 2026',
  description: 'The screenings you picked for Bandung World Cinema 2026, ready for Google Calendar.',
})
</script>

<template>
  <div class="wrap pt-10">
    <h1 class="text-display-s text-paper lg:text-display">
      My plan
    </h1>

    <!-- Loading: the plan lives in this browser and arrives after the page renders. -->
    <div v-if="!plan.loaded.value" class="mt-10" aria-busy="true">
      <p class="sr-only">
        Loading your plan
      </p>
      <div class="skeleton h-6 max-w-md" />
      <div class="skeleton mt-10 h-24" />
      <div class="skeleton mt-2 h-24" />
    </div>

    <template v-else>
      <p v-if="!plan.storageOk.value" class="status mt-6 border-t-2 border-ink pt-2" role="status">
        <AppIcon name="alert" />
        This browser is not saving your plan, so it will be gone when you close the tab. Send each screening to Google Calendar as you go.
      </p>

      <!-- Empty -->
      <div v-if="!plan.picks.value.length" class="mt-6 max-w-[60ch]">
        <p class="text-lg font-semibold">
          Nothing picked yet.
        </p>
        <p class="mt-2">
          Tap the square on any screening and it lands here, with its clashes marked and a Google Calendar link beside it.
        </p>
        <NuxtLink to="/" class="btn mt-6">
          Open the schedule
        </NuxtLink>
        <p class="status mt-6" role="status">
          <template v-if="cleared">
            Plan cleared.
            <button type="button" class="textlink" @click="undoClear">
              Undo
            </button>
          </template>
        </p>
      </div>

      <!-- Full -->
      <template v-else>
        <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <p class="text-lg font-semibold">
            {{ summary }}
          </p>
          <div class="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
            <button type="button" class="btn" @click="downloadIcs">
              <AppIcon name="download" :size="16" />
              Download all as .ics
            </button>
            <button type="button" class="textlink" @click="clearPlan">
              Clear plan
            </button>
          </div>
        </div>
        <p class="mt-3 max-w-[60ch] text-sm">
          Google Calendar takes the .ics file under Settings, Import and export. Apple Calendar and Outlook open it directly.
        </p>

        <section v-for="[day, list] in byDay" :key="day" class="mt-16" :aria-labelledby="`d-${day}`">
          <h2 :id="`d-${day}`" class="min-w-0 text-section break-words">
            {{ longDay(day) }}
          </h2>
          <ol class="rows mt-6">
            <li v-for="s in list" :key="s.id" class="row" :class="{ 'row--clash': plan.clashesById.value.has(s.id) }">
              <p class="num">
                <time :datetime="`${s.date}T${s.start}`" class="block text-xl font-black [font-stretch:125%]">{{ s.start }}</time>
                to {{ s.end }}
              </p>
              <div>
                <h3>
                  <NuxtLink :to="`/films/${s.filmId}`" class="textlink">
                    {{ getFilm(s.filmId)!.title }}
                  </NuxtLink>
                </h3>
                <p class="mt-1 text-sm">
                  {{ listOf(getFilm(s.filmId)!.directors) }}<template v-if="subtitleLabel(s.subtitles)">
                    <br>{{ subtitleLabel(s.subtitles) }}
                  </template>
                </p>
                <p v-if="plan.clashesById.value.get(s.id)" class="mt-2 flex items-center gap-1 text-sm font-semibold">
                  <AppIcon name="alert" :size="16" />
                  Clashes with {{ plan.clashesById.value.get(s.id)!.map(c => `${getFilm(c.filmId)?.title} (${c.start})`).join(' and ') }}
                </p>
                <p v-else-if="(pickedFilmCounts.get(s.filmId) ?? 0) > 1" class="mt-2 text-sm font-semibold">
                  You picked this film more than once.
                </p>
              </div>
              <div class="row__actions">
                <CalendarLink :screening="s" :film="getFilm(s.filmId)!" />
                <button type="button" class="textlink" @click="plan.remove(s.id)">
                  Remove<span class="sr-only">: {{ getFilm(s.filmId)!.title }}, {{ shortDay(s.date) }} {{ s.start }}</span>
                </button>
              </div>
            </li>
          </ol>
        </section>
      </template>

      <section class="mt-24 border-t-2 border-ink pt-4" aria-labelledby="online-heading">
        <h2 id="online-heading" class="min-w-0 text-section break-words">
          Online on {{ platform }}
        </h2>
        <p class="mt-3 max-w-[60ch]">
          The online screenings run from 31 October to 21 November 2026, so the at-home window opens before Bandung and closes with it.
        </p>
        <div class="row__actions mt-6">
          <a :href="onlineWindowCalendarUrl()" class="btn btn--quiet" target="_blank" rel="noopener">
            <AppIcon name="calendar-plus" :size="16" />
            Add to Google Calendar
            <span class="sr-only">: the {{ FESTIVAL.online.platform }} dates</span>
          </a>
          <a :href="FESTIVAL.online.url" class="textlink" target="_blank" rel="noopener">Open {{ FESTIVAL.online.platform }}</a>
        </div>
      </section>
    </template>
  </div>
</template>
