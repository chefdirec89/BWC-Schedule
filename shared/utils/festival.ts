import data from '../data/festival.json'
import type { FestivalData, Film, Screening } from '../types/festival'

export const FESTIVAL = {
  name: 'Bandung World Cinema',
  year: 2026,
  timezone: 'Asia/Jakarta',
  utcOffsetHours: 7,
  venue: {
    name: 'CGV Paris Van Java',
    city: 'Bandung',
    calendarLocation: 'CGV Paris Van Java, Bandung',
  },
  inPerson: { start: '2026-11-14', end: '2026-11-21' },
  online: { start: '2026-10-31', end: '2026-11-21', platform: 'KlikFilm', url: 'https://www.klikfilm.com' },
  /** Two picks closer than this are a clash: time to leave one hall and find the next. */
  clashBufferMinutes: 10,
} as const

const festival = data as FestivalData

export const films: Film[] = festival.films
export const screenings: Screening[] = festival.screenings
export const dataSource = festival.source

const filmsById = new Map(films.map(f => [f.id, f]))
const screeningsById = new Map(screenings.map(s => [s.id, s]))

export const getFilm = (id: string) => filmsById.get(id)
export const getScreening = (id: string) => screeningsById.get(id)
export const screeningsOf = (filmId: string) => screenings.filter(s => s.filmId === filmId)

export const festivalDays: string[] = [...new Set(screenings.map(s => s.date))].sort()

export const genres: string[] = [...new Set(films.flatMap(f => f.genres))].sort()
