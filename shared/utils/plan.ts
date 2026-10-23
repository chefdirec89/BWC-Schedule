import type { Screening } from '../types/festival'
import { FESTIVAL } from './festival'
import { span } from './time'

/** Minutes since 1970-01-01 in Bandung wall time, so screenings on different days compare. */
function absolute(s: Screening) {
  const [y = 0, m = 1, d = 1] = s.date.split('-').map(Number)
  const day = Date.UTC(y, m - 1, d) / 60_000
  const { start, end } = span(s)
  return { start: day + start, end: day + end }
}

/** True when you could not walk out of one and into the other in time. */
export function clashes(a: Screening, b: Screening, buffer: number = FESTIVAL.clashBufferMinutes) {
  if (a.id === b.id) return false
  const x = absolute(a)
  const y = absolute(b)
  return x.start < y.end + buffer && y.start < x.end + buffer
}

/** For each pick, the other picks it clashes with. Picks with no clash are absent. */
export function clashMap(picks: Screening[]) {
  const map = new Map<string, Screening[]>()
  for (const a of picks) {
    const hits = picks.filter(b => clashes(a, b))
    if (hits.length) map.set(a.id, hits)
  }
  return map
}

/** The picks a screening would clash with if you added it. */
export const clashingPicks = (s: Screening, picks: Screening[]) => picks.filter(p => clashes(s, p))

/** Greedy interval packing: the fewest lanes where no two screenings in a lane overlap. */
export function packLanes(list: Screening[]) {
  const sorted = [...list].sort((a, b) => span(a).start - span(b).start || span(b).end - span(a).end)
  const laneEnds: number[] = []
  const lanes = new Map<string, number>()
  for (const s of sorted) {
    const { start, end } = span(s)
    let lane = laneEnds.findIndex(e => e <= start)
    if (lane === -1) lane = laneEnds.push(end) - 1
    else laneEnds[lane] = end
    lanes.set(s.id, lane)
  }
  return { lanes, count: laneEnds.length }
}
