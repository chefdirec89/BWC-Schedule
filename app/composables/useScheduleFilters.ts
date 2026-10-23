import type { LocationQueryRaw } from 'vue-router'

export const START_AFTER = ['12:00', '15:00', '17:00', '19:00'] as const

/** Every filter lives in the URL, so a filtered day can be shared or bookmarked. */
export function useScheduleFilters() {
  const route = useRoute()
  const router = useRouter()

  const read = (key: string) => {
    const v = route.query[key]
    return typeof v === 'string' ? v : ''
  }

  const day = computed(() => (festivalDays.includes(read('day')) ? read('day') : festivalDays[0]!))
  const search = computed(() => read('q').trim())
  const genre = computed(() => (genres.includes(read('genre')) ? read('genre') : ''))
  const after = computed(() => ((START_AFTER as readonly string[]).includes(read('after')) ? read('after') : ''))
  const englishSubs = computed(() => read('subs') === 'en')
  const fitsPlan = computed(() => read('fits') === '1')

  const activeCount = computed(
    () => [search.value, genre.value, after.value].filter(Boolean).length + Number(englishSubs.value) + Number(fitsPlan.value),
  )

  function set(patch: Record<string, string | null>) {
    const query: LocationQueryRaw = { ...route.query }
    for (const [key, value] of Object.entries(patch)) {
      if (value) query[key] = value
      else delete query[key]
    }
    return router.replace({ query })
  }

  const clear = () => set({ q: null, genre: null, after: null, subs: null, fits: null })

  /** The query for another day, keeping the filters. */
  const queryForDay = (iso: string): LocationQueryRaw => ({ ...route.query, day: iso === festivalDays[0] ? undefined : iso })

  return { day, search, genre, after, englishSubs, fitsPlan, activeCount, set, clear, queryForDay }
}
