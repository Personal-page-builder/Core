// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'ru',
    baseUrl: import.meta.env.DEV ? 'http://localhost:3300/' : 'https://core.mfgm.kz/',
    locales: [
      { code: 'en', name: 'English', language: 'en', file: 'en.ts' },
      { code: 'ru', name: 'Русский', language: 'ru', file: 'ru.ts' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18nRed',
      redirectOn: 'root',
    },
  },
  // ui: {
  //   colorMode: false
  // }
})