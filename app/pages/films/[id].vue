<script setup lang="ts">
const route = useRoute()
const film = computed(() => getFilm(String(route.params.id)))
if (!film.value) throw createError({ statusCode: 404, statusMessage: 'No film at this address', fatal: true })

const f = computed(() => film.value!)
const plan = usePlan()
const venue = FESTIVAL.venue.name
const { media, posterUrl } = useFilmMedia(() => f.value.id)
const posterFailed = ref(false)
const poster = computed(() => (posterFailed.value ? null : posterUrl('w500')))

const shows = computed(() => screeningsOf(f.value.id))
const synopsis = computed(() => f.value.synopsis || media.value?.overview || '')
const firstDay = computed(() => shows.value[0]?.date)

const details = computed(() => [
  { term: f.value.directors.length > 1 ? 'Directors' : 'Director', value: listOf(f.value.directors) },
  { term: f.value.countries.length > 1 ? 'Countries' : 'Country', value: listOf(f.value.countries) },
  { term: 'Year', value: f.value.year ? String(f.value.year) : '' },
  { term: 'Runtime', value: duration(f.value.runtime) },
  { term: f.value.genres.length > 1 ? 'Genres' : 'Genre', value: listOf(f.value.genres) },
].filter(d => d.value))

useSeoMeta({
  title: () => `${f.value.title}, Bandung World Cinema 2026`,
  description: () => synopsis.value.slice(0, 155) || `${f.value.title} at Bandung World Cinema 2026.`,
})
</script>

<template>
  <article class="wrap pt-10">
    <NuxtLink :to="firstDay && firstDay !== festivalDays[0] ? { path: '/', query: { day: firstDay } } : '/'" class="textlink">
      Back to the schedule
    </NuxtLink>
    <h1
      class="mt-4 max-w-[22ch] text-paper"
      :class="f.title.length > 40 ? 'text-display-s' : 'text-display-s lg:text-display'"
    >
      {{ f.title }}
    </h1>

    <!-- The poster column exists only when TMDB has a real poster; the screenings come first on a phone. -->
    <div class="mt-10 grid gap-10" :class="{ 'lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]': poster }">
      <div :class="{ 'lg:order-2': poster }">
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 border-t-2 border-ink pt-4 sm:grid-cols-3" :class="{ 'lg:grid-cols-6': !poster }">
          <div v-for="d in details" :key="d.term">
            <dt class="text-sm">
              {{ d.term }}
            </dt>
            <dd class="font-semibold">
              {{ d.value }}
            </dd>
          </div>
          <div v-if="f.letterboxdRating">
            <dt class="text-sm">
              Letterboxd, 12 Oct
            </dt>
            <dd class="font-semibold">
              <a v-if="f.letterboxdUrl" :href="f.letterboxdUrl" class="textlink num" target="_blank" rel="noopener">{{ f.letterboxdRating.toFixed(1) }} out of 5</a>
              <span v-else class="num">{{ f.letterboxdRating.toFixed(1) }} out of 5</span>
            </dd>
          </div>
        </dl>

        <p v-if="synopsis" class="prose mt-10">
          {{ synopsis }}
        </p>

        <section class="mt-16" aria-labelledby="shows-heading">
          <h2 id="shows-heading" class="min-w-0 text-section break-words">
            {{ shows.length === 1 ? 'One screening' : `${shows.length} screenings` }} at {{ venue }}
          </h2>
          <ol class="rows mt-6">
            <li v-for="s in shows" :key="s.id" class="row" :class="{ 'row--boxed inverted': plan.isPicked(s.id) }">
              <p>
                <time :datetime="s.date" class="block font-semibold">{{ shortDay(s.date) }}</time>
                <span class="num">{{ s.start }} to {{ s.end }}</span>
              </p>
              <p class="text-sm">
                {{ subtitleLabel(s.subtitles) ?? 'Subtitles not listed' }}
                <template v-if="plan.clashesById.value.get(s.id)">
                  <br><strong>Clashes with {{ plan.clashesById.value.get(s.id)!.map(c => `${getFilm(c.filmId)?.title} (${c.start})`).join(' and ') }}</strong>
                </template>
              </p>
              <div class="row__actions">
                <PickToggle :screening="s" :film="f" variant="text" />
                <CalendarLink :screening="s" :film="f" />
              </div>
            </li>
          </ol>
        </section>
      </div>

      <div v-if="poster" class="max-w-sm lg:order-1 lg:max-w-none">
        <FilmPoster :film="f" :src="poster" @failed="posterFailed = true" />
      </div>
    </div>
  </article>
</template>
