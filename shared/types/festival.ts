export interface Film {
  /** Stable slug, used in URLs and screening ids. */
  id: string
  title: string
  year: number | null
  /** Minutes, without the pre-show ads. */
  runtime: number
  directors: string[]
  countries: string[]
  genres: string[]
  synopsis: string
  letterboxdUrl: string | null
  /** Out of 5, as of 12 Oct 2026. */
  letterboxdRating: number | null
  /** Pin a TMDB match by hand when the title search picks the wrong film. */
  tmdbId: number | null
}

export type Subtitles = 'id' | 'en' | 'id-en' | null

export interface Screening {
  id: string
  filmId: string
  /** Bandung date, YYYY-MM-DD, Asia/Jakarta. */
  date: string
  /** HH:MM, Asia/Jakarta. */
  start: string
  /** HH:MM; start + 10 min of ads + runtime. Earlier than `start` when it runs past midnight. */
  end: string
  subtitles: Subtitles
  /** Where the row came from in the Jakarta sheet. Not Bandung facts. */
  source: {
    row: number
    date: string
    hall: string | null
    remarks: string | null
  }
}

export interface FestivalData {
  source: string
  dayOffset: number
  films: Film[]
  screenings: Screening[]
}

/** What the film page shows beside the CSV, from TMDB once a key is set. */
export interface FilmMedia {
  status: 'tmdb' | 'unconfigured' | 'not-found' | 'error'
  tmdbId: number | null
  posterPath: string | null
  backdropPath: string | null
  overview: string | null
}
