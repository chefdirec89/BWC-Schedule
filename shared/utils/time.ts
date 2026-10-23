import type { Screening } from '../types/festival'

const DAY = 24 * 60
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const toMinutes = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Start and end in minutes from the screening day's midnight; the end can pass 1440. */
export function span(s: Pick<Screening, 'start' | 'end'>) {
  const start = toMinutes(s.start)
  let end = toMinutes(s.end)
  if (end <= start) end += DAY
  return { start, end }
}

export const pad = (n: number) => String(n).padStart(2, '0')

/** 1505 -> "01:05" (wraps past midnight). */
export const clock = (mins: number) => `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`

function parts(iso: string) {
  const [y = 0, m = 1, d = 1] = iso.split('-').map(Number)
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return { y, m, d, weekday }
}

/** "2026-11-14" -> { weekday: "Sat", day: 14, month: "Nov" } */
export function dayParts(iso: string) {
  const { m, d, weekday } = parts(iso)
  return {
    weekday: WEEKDAYS[weekday]!,
    weekdayLong: WEEKDAYS_LONG[weekday]!,
    day: d,
    month: MONTHS[m - 1]!,
    monthLong: MONTHS_LONG[m - 1]!,
  }
}

/** "Sat 14 Nov" */
export function shortDay(iso: string) {
  const p = dayParts(iso)
  return `${p.weekday} ${p.day} ${p.month}`
}

/** "Saturday 14 November" */
export function longDay(iso: string) {
  const p = dayParts(iso)
  return `${p.weekdayLong} ${p.day} ${p.monthLong}`
}

/** Local wall time in Bandung -> a UTC Date. */
export function wibToDate(isoDate: string, minutes: number, utcOffsetHours = 7) {
  const { y, m, d } = parts(isoDate)
  return new Date(Date.UTC(y, m - 1, d, 0, minutes - utcOffsetHours * 60))
}

/** "20261114T033000Z", the form Google Calendar and iCalendar both read. */
export function utcStamp(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`
}

/** "1h 44m" */
export function duration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h}h ${pad(m)}m` : `${m}m`
}
