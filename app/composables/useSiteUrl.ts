/** The public site URL for calendar descriptions; the request origin until NUXT_PUBLIC_SITE_URL is set. */
export function useSiteUrl() {
  const { siteUrl } = useRuntimeConfig().public
  return siteUrl || useRequestURL().origin
}
