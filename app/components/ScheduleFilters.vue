<script setup lang="ts">
defineProps<{ shown: number, total: number }>()

const filters = useScheduleFilters()
const open = ref(false)

// The search box writes to the URL a beat after typing stops.
const query = ref(filters.search.value)
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => filters.set({ q: value.trim() || null }), 200)
})
watch(filters.search, (value) => {
  if (value !== query.value.trim()) query.value = value
})
onBeforeUnmount(() => clearTimeout(timer))

const fromSelect = (key: string, e: Event) => filters.set({ [key]: (e.target as HTMLSelectElement).value || null })
const fromCheck = (key: string, on: string, e: Event) => filters.set({ [key]: (e.target as HTMLInputElement).checked ? on : null })

function clearAll() {
  query.value = ''
  filters.clear()
}
</script>

<template>
  <form class="filters" role="search" action="/" method="get" @submit.prevent>
    <input v-if="filters.day.value !== festivalDays[0]" type="hidden" name="day" :value="filters.day.value">
    <div class="flex items-end gap-2">
      <div class="min-w-0 flex-1">
        <label for="f-q" class="field-label">Search this day</label>
        <input
          id="f-q"
          v-model="query"
          class="field"
          type="search"
          name="q"
          autocomplete="off"
          spellcheck="false"
          placeholder="Fjord, Lukas Dhont, Japan"
        >
      </div>
      <button
        type="button"
        class="btn btn--quiet filters__toggle"
        :aria-expanded="open"
        aria-controls="f-more"
        @click="open = !open"
      >
        <AppIcon name="sliders" :size="16" />
        Filters<span v-if="filters.activeCount.value" class="num">&nbsp;({{ filters.activeCount.value }})</span>
      </button>
    </div>

    <div id="f-more" class="filters__more" :class="{ 'is-open': open }">
      <div>
        <label for="f-genre" class="field-label">Genre</label>
        <select id="f-genre" class="field" name="genre" :value="filters.genre.value" @change="fromSelect('genre', $event)">
          <option value="">
            Any genre
          </option>
          <option v-for="g in genres" :key="g" :value="g">
            {{ g }}
          </option>
        </select>
      </div>
      <div>
        <label for="f-after" class="field-label">Starts</label>
        <select id="f-after" class="field" name="after" :value="filters.after.value" @change="fromSelect('after', $event)">
          <option value="">
            Any time
          </option>
          <option v-for="t in START_AFTER" :key="t" :value="t">
            From {{ t }}
          </option>
        </select>
      </div>
      <div class="filters__checks">
        <label class="check">
          <input type="checkbox" name="subs" value="en" :checked="filters.englishSubs.value" @change="fromCheck('subs', 'en', $event)">
          English subtitles
        </label>
        <label class="check">
          <input type="checkbox" name="fits" value="1" :checked="filters.fitsPlan.value" @change="fromCheck('fits', '1', $event)">
          Fits my plan
        </label>
      </div>
    </div>

    <p class="status col-span-full text-sm" role="status">
      <span>
        <template v-if="shown === total">{{ plural(total, 'screening') }}</template>
        <template v-else>{{ shown }} of {{ plural(total, 'screening') }}</template>
      </span>
      <button v-if="filters.activeCount.value" type="button" class="textlink" @click="clearAll">
        Clear filters
      </button>
    </p>
  </form>
</template>
