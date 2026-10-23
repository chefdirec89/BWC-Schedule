import type { FilmMedia } from '#shared/types/festival'

/**
 * GET /api/films/:id/media
 *
 * Poster, backdrop and overview from TMDB. Until NUXT_TMDB_API_KEY or
 * NUXT_TMDB_READ_TOKEN is set this answers `unconfigured`, and the page
 * falls back to the CSV synopsis and a type-set poster.
 */
export default defineEventHandler(async (event): Promise<FilmMedia> => {
  const film = getFilm(getRouterParam(event, 'id') ?? '')
  if (!film) throw createError({ statusCode: 404, statusMessage: 'No film with that id' })

  if (!tmdbCredentials()) return emptyMedia('unconfigured')
  return fetchFilmMedia(film)
})
