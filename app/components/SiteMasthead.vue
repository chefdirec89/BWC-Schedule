<script setup lang="ts">
defineProps<{ full: boolean }>()

const filmCount = films.length
const screeningCount = screenings.length
</script>

<template>
  <header v-if="full" class="masthead wrap">
    <h1 class="wordmark">
      CineRoute
    </h1>
    <p class="mt-3 text-lg font-semibold">
      An unofficial planner for Bandung World Cinema 2026.
    </p>
    <p class="sticker mt-4">
      14–21 Nov 2026
    </p>
    <div class="facts mt-6">
      <p class="facts__lede">
        {{ screeningCount }} screenings of {{ filmCount }} films. Pick yours, then send them to Google Calendar.
      </p>
      <dl class="contents">
        <div>
          <dt>In cinemas</dt>
          <dd>14 to 21 November 2026</dd>
          <dd>{{ FESTIVAL.venue.name }}, {{ FESTIVAL.venue.city }}</dd>
        </div>
        <div>
          <dt>Online</dt>
          <dd>31 October to 21 November 2026</dd>
          <dd>
            <a :href="FESTIVAL.online.url" class="textlink" rel="noopener" target="_blank">{{ FESTIVAL.online.platform }}</a>
          </dd>
        </div>
      </dl>
    </div>
  </header>

  <header v-else class="wrap pt-4 pb-4">
    <NuxtLink to="/" class="wordmark wordmark--small" aria-label="CineRoute, back to the schedule">
      CineRoute
    </NuxtLink>
  </header>
</template>
