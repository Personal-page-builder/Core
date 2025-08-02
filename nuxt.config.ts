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
  
  runtimeConfig: {
    database: {
      type: process.env.DATABASE_TYPE || 'sqlite',
      sqlite: {
        filename: process.env.SQLITE_FILENAME || '.data/content.db'
      },
      postgres: {
        url: process.env.POSTGRES_URL,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DATABASE,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        ssl: process.env.POSTGRES_SSL === 'true'
      }
    }
  },

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

  content: {
    database: process.env.DATABASE_TYPE === 'postgres' && process.env.POSTGRES_URL ? {
      type: 'postgres' as const,
      url: process.env.POSTGRES_URL
    } : {
      type: 'sqlite' as const,
      filename: process.env.SQLITE_FILENAME || '.data/content.db'
    },

    build: {
      markdown: {
        toc: {
          depth: 3,
          searchDepth: 2
        },
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          }
        }
      }
    },

    renderer: {
      anchorLinks: { h2: true, h3: true, h4: true }
    }
  }
})