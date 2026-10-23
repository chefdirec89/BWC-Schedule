<script setup lang="ts">
const route = useRoute()
const filters = useScheduleFilters()
const plan = usePlan()

const onSchedule = computed(() => route.path === '/')
const isCurrentDay = (iso: string) => onSchedule.value && filters.day.value === iso

// On a phone the strip scrolls; keep the current day in view.
const days = useTemplateRef<HTMLOListElement>('days')
function revealCurrent() {
  const strip = days.value
  const link = strip?.querySelector<HTMLElement>('[aria-current="page"]')
  if (!strip || !link) return
  const li = link.parentElement!
  if (li.offsetLeft < strip.scrollLeft || li.offsetLeft + li.offsetWidth > strip.scrollLeft + strip.clientWidth) {
    strip.scrollLeft = li.offsetLeft - (strip.clientWidth - li.offsetWidth) / 2
  }
}
onMounted(revealCurrent)
watch(() => filters.day.value, () => nextTick(revealCurrent))
</script>

<template>
  <nav class="band" aria-label="Festival">
    <div class="band__inner wrap">
      <ol ref="days" class="band__days" aria-label="Days at CGV Paris Van Java">
        <li v-for="iso in festivalDays" :key="iso">
          <NuxtLink
            class="band__link"
            :to="{ path: '/', query: onSchedule ? filters.queryForDay(iso) : (iso === festivalDays[0] ? {} : { day: iso }) }"
            :aria-current="isCurrentDay(iso) ? 'page' : undefined"
            :aria-label="longDay(iso)"
          >
            <span class="band__weekday">{{ dayParts(iso).weekday }}</span>
            <span class="band__date">{{ dayParts(iso).day }}</span>
          </NuxtLink>
        </li>
      </ol>
      <ul class="band__pages">
        <li>
          <NuxtLink to="/films" class="band__link band__page" :aria-current="route.path.startsWith('/films') ? 'page' : undefined">
            Films
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/plan" class="band__link band__page" :aria-current="route.path === '/plan' ? 'page' : undefined">
            <span class="band__long">My plan</span>
            <span class="band__short" aria-hidden="true">Plan</span>
            <span v-if="plan.ids.value.length" class="band__count">
              {{ plan.ids.value.length }}<span class="sr-only"> screenings</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
