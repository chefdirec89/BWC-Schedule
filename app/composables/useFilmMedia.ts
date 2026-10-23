import type { FilmMedia } from '#shared/types/festival'

type PosterSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original'
type BackdropSize = 'w780' | 'w1280' | 'original'

/**
 * Poster and backdrop for a film from TMDB, through our own server route so
 * the key never reaches the browser. Resolved during server rendering, so the
 * page knows before it paints whether there is a poster to lay out; when TMDB
 * is not configured the page uses the CSV synopsis and shows no poster.
 */
export function useFilmMedia(filmId: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig()

  const { data, status } = useLazyFetch<FilmMedia>(() => `/api/films/${toValue(filmId)}/media`, {
    key: computed(() => `film-media-${toValue(filmId)}`),
  })

  const image = (path: string | null | undefined, size: string) =>
    path ? `${config.public.tmdbImageBase}/${size}${path}` : null

  return {
    media: data,
    status,
    posterUrl: (size: PosterSize = 'w500') => image(data.value?.posterPath, size),
    backdropUrl: (size: BackdropSize = 'w1280') => image(data.value?.backdropPath, size),
  }
}
