import type { Film, Screening } from '../types/festival'
import { FESTIVAL } from './festival'
import { span, utcStamp, wibToDate, duration } from './time'

function times(s: Screening) {
  const { start, end } = span(s)
  return {
    start: wibToDate(s.date, start, FESTIVAL.utcOffsetHours),
    end: wibToDate(s.date, end, FESTIVAL.utcOffsetHours),
  }
}

const SUBTITLES: Record<NonNullable<Screening['subtitles']>, string> = {
  'id': 'Indonesian subtitles',
  'en': 'English subtitles',
  'id-en': 'Indonesian and English subtitles',
}

export const subtitleLabel = (s: Screening['subtitles']) => (s ? SUBTITLES[s] : null)

function eventTitle(film: Film) {
  return `${film.title} (${FESTIVAL.name})`
}

function eventDetails(s: Screening, film: Film, siteUrl?: string) {
  const lines = [
    [film.directors.join(', '), film.countries.join(', '), film.year].filter(Boolean).join(', '),
    `The film runs ${duration(film.runtime)} after 10 minutes of ads.`,
    subtitleLabel(s.subtitles),
    film.letterboxdUrl ? `Letterboxd: ${film.letterboxdUrl}` : null,
    siteUrl ? `Planned at ${siteUrl.replace(/\/$/, '')}/films/${film.id}` : null,
  ]
  return lines.filter(Boolean).join('\n')
}

/** A prefilled "create event" link; Google Calendar opens it and the user saves. */
export function googleCalendarUrl(s: Screening, film: Film, siteUrl?: string) {
  const t = times(s)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(film),
    dates: `${utcStamp(t.start)}/${utcStamp(t.end)}`,
    details: eventDetails(s, film, siteUrl),
    location: FESTIVAL.venue.calendarLocation,
    ctz: FESTIVAL.timezone,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

/** The KlikFilm window as one all-day event (the end date is exclusive). */
export function onlineWindowCalendarUrl() {
  const compact = (iso: string) => iso.replaceAll('-', '')
  const [y = 0, m = 1, d = 1] = FESTIVAL.online.end.split('-').map(Number)
  const after = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${FESTIVAL.name} online on ${FESTIVAL.online.platform}`,
    dates: `${compact(FESTIVAL.online.start)}/${compact(after)}`,
    details: FESTIVAL.online.url,
    ctz: FESTIVAL.timezone,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

const escapeIcs = (v: string) => v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** RFC 5545 folds lines at 75 octets. */
function fold(line: string) {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const out: string[] = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length
    if (size + n > (out.length ? 74 : 75)) {
      out.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += n
  }
  out.push(current)
  return out.join('\r\n ')
}

/** One .ics file holding every pick, for calendars other than Google's or a bulk import. */
export function buildIcs(items: { screening: Screening, film: Film }[], siteUrl?: string, now = new Date()) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BWC Schedule Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(`${FESTIVAL.name} ${FESTIVAL.year}`)}`,
    `X-WR-TIMEZONE:${FESTIVAL.timezone}`,
  ]
  for (const { screening, film } of items) {
    const t = times(screening)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${screening.id}@bwc-planner`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${utcStamp(t.start)}`,
      `DTEND:${utcStamp(t.end)}`,
      `SUMMARY:${escapeIcs(eventTitle(film))}`,
      `LOCATION:${escapeIcs(FESTIVAL.venue.calendarLocation)}`,
      `DESCRIPTION:${escapeIcs(eventDetails(screening, film, siteUrl))}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return `${lines.map(fold).join('\r\n')}\r\n`
}
