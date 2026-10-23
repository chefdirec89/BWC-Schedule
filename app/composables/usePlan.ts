import type { Screening } from '#shared/types/festival'

export const PLAN_STORAGE_KEY = 'bwc-2026-plan'

/**
 * The screenings someone has picked. Held in localStorage on their device;
 * nothing is sent anywhere. `app/plugins/plan.client.ts` loads it after
 * hydration, so server and first client render agree on an empty plan.
 */
export function usePlan() {
  const ids = useState<string[]>('plan', () => [])
  const loaded = useState('plan-loaded', () => false)
  const storageOk = useState('plan-storage-ok', () => true)

  const picks = computed(() =>
    ids.value
      .map(getScreening)
      .filter((s): s is Screening => !!s)
      .sort((a, b) => a.date.localeCompare(b.date) || span(a).start - span(b).start),
  )
  const pickedIds = computed(() => new Set(ids.value))
  const clashesById = computed(() => clashMap(picks.value))

  const isPicked = (id: string) => pickedIds.value.has(id)
  const add = (id: string) => {
    if (!isPicked(id)) ids.value = [...ids.value, id]
  }
  const remove = (id: string) => {
    ids.value = ids.value.filter(x => x !== id)
  }
  const toggle = (id: string) => (isPicked(id) ? remove(id) : add(id))
  const replace = (next: string[]) => {
    ids.value = [...new Set(next)]
  }

  return {
    ids: readonly(ids),
    loaded: readonly(loaded),
    storageOk: readonly(storageOk),
    picks,
    clashesById,
    isPicked,
    add,
    remove,
    toggle,
    replace,
  }
}
