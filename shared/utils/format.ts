const conjunction = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

/** ["Yuval Abraham", "Rachel Szor"] -> "Yuval Abraham and Rachel Szor" */
export const listOf = (items: readonly string[]) => conjunction.format(items)

/** 1 -> "1 screening", 3 -> "3 screenings" */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
