export default defineNuxtPlugin((nuxtApp) => {
  const ids = useState<string[]>('plan', () => [])
  const loaded = useState('plan-loaded', () => false)
  const storageOk = useState('plan-storage-ok', () => true)

  function read(): string[] {
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      // Ids from an older schedule are dropped rather than shown as blanks.
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string' && !!getScreening(x)) : []
    }
    catch {
      storageOk.value = false
      return []
    }
  }

  // Not `app:mounted`: under <Suspense> the page can still be hydrating then,
  // and a plan that lands mid-hydration leaves classes the DOM never receives.
  nuxtApp.hook('app:suspense:resolve', () => {
    if (loaded.value) return
    ids.value = read()
    loaded.value = true

    watch(ids, (value) => {
      try {
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(value))
        storageOk.value = true
      }
      catch {
        storageOk.value = false
      }
    })

    // Another tab changed the plan.
    window.addEventListener('storage', (e) => {
      if (e.key === PLAN_STORAGE_KEY) ids.value = read()
    })
  })
})
