// Turns the Jakarta World Cinema 2026 sheet into the Bandung schedule.
//
//   npm run data
//
// The lineup is the same in both cities; only the dates move. Jakarta runs
// Sat 31 Oct to Sat 7 Nov, Bandung runs Sat 14 Nov to Sat 21 Nov, so every
// screening shifts by exactly 14 days and keeps its weekday and start time.
// Jakarta-only details (CGV Grand Indonesia halls, Q&A guests, giveaways)
// are kept under `source` for reference and are not shown as Bandung facts.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(root, 'Jakarta World Cinema 2026 Schedule - @cinephileintern.xlsx - JWC.csv')
const OUTPUT = resolve(root, 'shared/data/festival.json')

const DAY_OFFSET = 14
const PRE_ADS_MINUTES = 10
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// RFC 4180: quoted fields may hold commas, quotes and line breaks.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    }
    else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    }
    else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

// The sheet has one title saved through the wrong encoding ("í" read as Shift-JIS).
const REPAIRS = [['Aquﾃｭ', 'Aquí']]
const repair = s => REPAIRS.reduce((acc, [bad, good]) => acc.replaceAll(bad, good), s)

const clean = s => repair(s ?? '').replace(/\s+/g, ' ').trim()
const blank = s => !s || s === '-' || s === 'N/A'
const list = s => (blank(clean(s)) ? [] : clean(s).split(',').map(clean).filter(Boolean))

function slugify(s) {
  return s
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function runtimeMinutes(s) {
  const m = clean(s).match(/^(\d+)h(\d+)m$/)
  if (!m) throw new Error(`Unreadable runtime: ${s}`)
  return Number(m[1]) * 60 + Number(m[2])
}

function rating(s) {
  const m = clean(s).match(/^(\d(?:\.\d)?)(?:\/5)?$/)
  return m ? Number(m[1]) : null
}

function subtitles(s) {
  switch (clean(s)) {
    case 'ID': return 'id'
    case 'EN': return 'en'
    case 'ID & EN': return 'id-en'
    default: return null
  }
}

const pad = n => String(n).padStart(2, '0')
const toMinutes = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
const toClock = mins => `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`

function shiftDate(label) {
  // "Sat, 31 Oct 2026"
  const m = clean(label).match(/^(\w{3}), (\d{1,2}) (\w{3}) (\d{4})$/)
  if (!m) throw new Error(`Unreadable date: ${label}`)
  const jakarta = new Date(Date.UTC(Number(m[4]), MONTHS[m[3]], Number(m[2])))
  if (WEEKDAYS[jakarta.getUTCDay()] !== m[1]) throw new Error(`Weekday mismatch: ${label}`)
  const bandung = new Date(jakarta.getTime() + DAY_OFFSET * 86_400_000)
  const iso = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  return { jakarta: iso(jakarta), bandung: iso(bandung) }
}

const rows = parseCsv(readFileSync(SOURCE, 'utf8'))
const films = new Map()
const screenings = []
const warnings = []

for (const r of rows) {
  if (!/^\d+$/.test(clean(r[0]))) continue
  const [no, title, year, url, runtime, lbRating, director, country, genre, description, sub, date, start, finish, hall, remarks] = r.map(clean)

  const letterboxdUrl = url.startsWith('http') ? url : null
  const filmKey = letterboxdUrl ?? title
  if (!films.has(filmKey)) {
    films.set(filmKey, {
      id: slugify(title),
      title,
      year: /^\d{4}$/.test(year) ? Number(year) : null,
      runtime: runtimeMinutes(runtime),
      directors: list(director),
      countries: list(country),
      genres: list(genre),
      synopsis: blank(description) ? '' : description,
      letterboxdUrl,
      letterboxdRating: rating(lbRating),
      tmdbId: null,
    })
  }
  const film = films.get(filmKey)

  const dates = shiftDate(date)
  const startMin = toMinutes(start)
  const endMin = startMin + PRE_ADS_MINUTES + film.runtime
  const end = toClock(endMin)
  if (toMinutes(finish) !== endMin % (24 * 60)) warnings.push(`Row ${no} "${title}": sheet says it ends ${finish}, start + ads + runtime gives ${end}`)

  // The closing film plays two halls at the same minute; both stay, so the
  // second one takes a suffix.
  let id = `${dates.bandung}-${start.replace(':', '')}-${film.id}`
  for (let n = 2; screenings.some(s => s.id === id); n++) id = `${dates.bandung}-${start.replace(':', '')}-${film.id}-${n}`

  screenings.push({
    id,
    filmId: film.id,
    date: dates.bandung,
    start,
    end,
    subtitles: subtitles(sub),
    source: { row: Number(no), date: dates.jakarta, hall: hall || null, remarks: remarks || null },
  })
}

const ids = new Set()
for (const f of films.values()) {
  if (ids.has(f.id)) throw new Error(`Two films share the id "${f.id}"`)
  ids.add(f.id)
}
const screeningIds = new Set(screenings.map(s => s.id))
if (screeningIds.size !== screenings.length) throw new Error('Two screenings share an id')

screenings.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.filmId.localeCompare(b.filmId))
const filmList = [...films.values()].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base', numeric: true }))

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, `${JSON.stringify({
  source: 'Jakarta World Cinema 2026 schedule sheet by @cinephileintern (KlikFilm App & IG/jakartaworldcinema)',
  dayOffset: DAY_OFFSET,
  films: filmList,
  screenings,
}, null, 2)}\n`)

console.log(`${filmList.length} films, ${screenings.length} screenings -> ${OUTPUT}`)
for (const w of warnings) console.warn(`note: ${w}`)
