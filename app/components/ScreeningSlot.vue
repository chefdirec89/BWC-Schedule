<script setup lang="ts">
import type { Screening } from '#shared/types/festival'

const props = defineProps<{
  screening: Screening
  lane: number
  /** Minutes from midnight where the day's axis starts. */
  axisStart: number
}>()

const plan = usePlan()
const film = computed(() => getFilm(props.screening.filmId)!)
const picked = computed(() => plan.isPicked(props.screening.id))
const minutes = computed(() => span(props.screening))

// A pick that clashes with another pick, or an unpicked slot that would clash with one.
const clashWith = computed(() => (picked.value ? plan.clashesById.value.get(props.screening.id) ?? [] : []))
const blocked = computed(() => !picked.value && clashingPicks(props.screening, plan.picks.value).length > 0)

const meta = computed(() => {
  const f = film.value
  return [listOf(f.directors), f.countries[0], duration(f.runtime)].filter(Boolean).join(', ')
})

const clashText = computed(() =>
  clashWith.value.map(s => `${getFilm(s.filmId)?.title} (${s.start})`).join(' and '),
)
</script>

<template>
  <li
    class="slot"
    :class="{ 'is-picked': picked, 'is-blocked': blocked }"
    :style="{ '--lane': lane, '--from': minutes.start - axisStart, '--len': minutes.end - minutes.start }"
  >
    <p class="slot__time">
      <time :datetime="`${screening.date}T${screening.start}`" class="slot__start">{{ screening.start }}</time>
      <span class="slot__to"> to </span>
      <time :datetime="screening.end">{{ screening.end }}</time>
    </p>
    <h3 class="slot__title">
      <NuxtLink :to="`/films/${film.id}`" class="slot__link">
        {{ film.title }}
      </NuxtLink>
    </h3>
    <p class="slot__meta">
      {{ meta }}
    </p>
    <p v-if="clashWith.length" class="slot__note">
      <AppIcon name="alert" :size="16" />
      Clashes with {{ clashText }}
    </p>
    <p v-else-if="blocked" class="sr-only">
      Clashes with your plan
    </p>
    <div class="slot__actions">
      <CalendarLink v-if="picked" :screening="screening" :film="film" compact />
      <PickToggle :screening="screening" :film="film" />
    </div>
  </li>
</template>
