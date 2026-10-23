<script setup lang="ts">
import type { Screening } from '#shared/types/festival'

const props = defineProps<{
  /** What to show, after filters. */
  screenings: Screening[]
  /**
   * What sets the hour axis: the whole day, so it holds still as the plan
   * changes, or just the matches while filters are on, so they open the view.
   */
  axisFrom: Screening[]
}>()

const axis = computed(() => {
  const spans = props.axisFrom.map(span)
  const start = Math.floor(Math.min(...spans.map(s => s.start)) / 60) * 60
  const end = Math.ceil(Math.max(...spans.map(s => s.end)) / 60) * 60
  return { start, end }
})

const hours = computed(() => {
  const list: number[] = []
  for (let m = axis.value.start; m < axis.value.end; m += 60) list.push(m)
  return list
})

const packed = computed(() => packLanes(props.screenings))
const ordered = computed(() => [...props.screenings].sort((a, b) => span(a).start - span(b).start || a.filmId.localeCompare(b.filmId)))
</script>

<template>
  <div class="day" :style="{ '--span': axis.end - axis.start, '--lanes': Math.max(packed.count, 1) }">
    <ol class="day__hours" aria-hidden="true">
      <li v-for="h in hours" :key="h" :style="{ '--at': h - axis.start }">
        {{ clock(h) }}
      </li>
    </ol>
    <ol class="day__list">
      <ScreeningSlot
        v-for="s in ordered"
        :key="s.id"
        :screening="s"
        :lane="packed.lanes.get(s.id) ?? 0"
        :axis-start="axis.start"
      />
    </ol>
  </div>
</template>
