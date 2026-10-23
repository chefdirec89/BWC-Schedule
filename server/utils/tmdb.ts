import type { Film, FilmMedia } from '#shared/types/festival'

const API = 'https://api.themoviedb.org/3'

interface TmdbMovie {
  id: number
  title: string
  overview: string | null
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
}

export const emptyMedia = (status: FilmMedia['status']): FilmMedia => ({
  status,
  tmdbId: null,
  posterPath: null,
  backdropPath: null,
  overview: null,
})

export function tmdbCredentials() {
  const { tmdbApiKey, tmdbReadToken } = useRuntimeConfig()
  if (!tmdbApiKey && !tmdbReadToken) return null
  return { apiKey: tmdbApiKey, readToken: tmdbReadToken }
}

function tmdb<T>(path: string, query: Record<string, string | number | boolean> = {}) {
  const creds = tmdbCredentials()!
  return $fetch<T>(`${API}${path}`, {
    query: { language: 'en-US', ...query, ...(creds.readToken ? {} : { api_key: creds.apiKey }) },
    headers: creds.readToken ? { Authorization: `Bearer ${creds.readToken}` } : {},
    timeout: 6000,
    retry: 1,
  })
}

async function findMovie(film: Film): Promise<TmdbMovie | null> {
  if (film.tmdbId) return tmdb<TmdbMovie>(`/movie/${film.tmdbId}`)

  // Festival years often trail the TMDB release year, so retry without it.
  for (const year of [film.year, null]) {
    const res = await tmdb<{ results: TmdbMovie[] }>('/search/movie', {
      query: film.title,
      include_adult: false,
      ...(year ? { year } : {}),
    })
    if (res.results[0]) return res.results[0]
  }
  return null
}

/** Cached per film for a day; only called once credentials exist. */
export const fetchFilmMedia = defineCachedFunction(
  async (film: Film): Promise<FilmMedia> => {
    // Masterclasses and surprise slots have no Letterboxd page and no TMDB entry.
    if (!film.letterboxdUrl && !film.tmdbId) return emptyMedia('not-found')
    try {
      const movie = await findMovie(film)
      if (!movie) return emptyMedia('not-found')
      return {
        status: 'tmdb',
        tmdbId: movie.id,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        overview: movie.overview || null,
      }
    }
    catch {
      return emptyMedia('error')
    }
  },
  {
    name: 'tmdb-film-media',
    maxAge: 60 * 60 * 24,
    getKey: (film: Film) => film.id,
    // A failed lookup is retried next time rather than cached for a day.
    validate: entry => entry.value?.status !== 'error',
  },
)
