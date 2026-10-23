<script setup lang="ts">
const counts = new Map<string, number>()
for (const s of screenings) counts.set(s.filmId, (counts.get(s.filmId) ?? 0) + 1)

useSeoMeta({
  title: 'All films, Bandung World Cinema 2026',
  description: `The ${films.length} films at Bandung World Cinema 2026, with directors, countries and how many times each one screens.`,
})
</script>

<template>
  <div class="wrap pt-10">
    <h1 class="text-display-s text-paper lg:text-display">
      All {{ films.length }} films
    </h1>
    <p class="mt-3 text-lg font-semibold">
      A to Z. Open a film for its screenings and calendar links.
    </p>

    <table class="ledger mt-10">
      <thead>
        <tr>
          <th scope="col">
            Film
          </th>
          <th scope="col">
            Directed by
          </th>
          <th scope="col">
            Country
          </th>
          <th scope="col" class="num">
            Runtime
          </th>
          <th scope="col" class="num">
            Screenings
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in films" :key="f.id">
          <td>
            <NuxtLink :to="`/films/${f.id}`" class="textlink">
              {{ f.title }}
            </NuxtLink>
            <span v-if="f.year" class="num">&nbsp;({{ f.year }})</span>
          </td>
          <td class="text-sm">
            {{ listOf(f.directors) }}
          </td>
          <td class="text-sm">
            {{ listOf(f.countries) }}
          </td>
          <td class="num text-sm">
            {{ duration(f.runtime) }}
          </td>
          <td class="num text-sm">
            {{ counts.get(f.id) }}<span class="ledger__unit">{{ counts.get(f.id) === 1 ? ' screening' : ' screenings' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
