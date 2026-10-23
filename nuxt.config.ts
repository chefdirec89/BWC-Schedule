import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Bandung World Cinema 2026 schedule planner',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Plan your Bandung World Cinema 2026 screenings at CGV Paris Van Java, 14 to 21 November, and send them to Google Calendar.',
        },
        { name: 'theme-color', content: '#63072C' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100,400;100,600;125,900&family=IBM+Plex+Mono:wght@500&display=swap',
        },
      ],
      script: [
        // Lets CSS scope anything that needs script (Hallmark gate 62).
        { innerHTML: "document.documentElement.classList.add('js')" },
      ],
    },
  },

  runtimeConfig: {
    // Server-only. Injected later from .env as NUXT_TMDB_API_KEY / NUXT_TMDB_READ_TOKEN.
    tmdbApiKey: '',
    tmdbReadToken: '',
    public: {
      siteUrl: '',
      tmdbImageBase: 'https://image.tmdb.org/t/p',
    },
  },

  typescript: {
    strict: true,
  },
})
