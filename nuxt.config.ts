// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Site configuration for sitemap
  site: {
    url: process.env.SITE_URL || 'http://localhost:3000',
    name: 'Personal Page Builder'
  },
  
  modules: [
    '@nuxtjs/sitemap',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxtjs/seo'
  ],
  css: ['~/assets/css/main.css'],
  
  runtimeConfig: {
    // Database configuration
    database: {
      type: process.env.DATABASE_TYPE || 'sqlite',
      sqlite: {
        filename: process.env.SQLITE_FILENAME || '.data/app.db'
      },
      postgres: {
        url: process.env.POSTGRES_URL,
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DATABASE,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        ssl: process.env.POSTGRES_SSL === 'true'
      }
    },

    // Author personal information
    author: {
      name: process.env.AUTHOR_NAME || 'Nik Bulygin',
      jobTitle: process.env.AUTHOR_JOB_TITLE || 'Full-stack Developer',
      bio: process.env.AUTHOR_BIO || 'Passionate developer creating modern web applications',
      location: process.env.AUTHOR_LOCATION || 'Kazakhstan',
      timezone: process.env.AUTHOR_TIMEZONE || 'Asia/Almaty',
      experienceYears: parseInt(process.env.AUTHOR_EXPERIENCE_YEARS || '5'),
      
      // Technologies and skills
      technologies: process.env.AUTHOR_TECHNOLOGIES?.split(',') || ['vue.js', 'react', 'node.js', 'typescript'],
      skills: process.env.AUTHOR_SKILLS?.split(',') || ['frontend', 'backend', 'devops', 'ui/ux'],
      
      // Contact information
      email: process.env.AUTHOR_EMAIL || 'byluginnikita@gmail.com',
      phone: process.env.AUTHOR_PHONE || '+7-XXX-XXX-XXXX',
      whatsapp: process.env.AUTHOR_WHATSAPP || '+7-XXX-XXX-XXXX',
      
      // Social media and professional networks
      telegram: process.env.AUTHOR_TELEGRAM,
      twitter: process.env.AUTHOR_TWITTER,
      discord: process.env.AUTHOR_DISCORD,
      github: process.env.AUTHOR_GITHUB,
      gitlab: process.env.AUTHOR_GITLAB,
      matrix: process.env.AUTHOR_MATRIX,
      linkedin: process.env.AUTHOR_LINKEDIN,
      stackoverflow: process.env.AUTHOR_STACKOVERFLOW,
      medium: process.env.AUTHOR_MEDIUM,
      devto: process.env.AUTHOR_DEVTO,
      hashnode: process.env.AUTHOR_HASHNODE,
      reddit: process.env.AUTHOR_REDDIT,
      youtube: process.env.AUTHOR_YOUTUBE,
      twitch: process.env.AUTHOR_TWITCH,
      instagram: process.env.AUTHOR_INSTAGRAM,
      facebook: process.env.AUTHOR_FACEBOOK,
      vk: process.env.AUTHOR_VK
    },

    // Site configuration
    site: {
      name: process.env.SITE_NAME || 'Personal Page Builder',
      description: process.env.SITE_DESCRIPTION || 'Build and customize your personal page with ease',
      keywords: process.env.SITE_KEYWORDS?.split(',') || ['personal website', 'portfolio', 'blog', 'developer'],
      url: process.env.SITE_URL || 'http://localhost:3000',
      language: process.env.SITE_LANGUAGE || 'ru',
      timezone: process.env.SITE_TIMEZONE || 'Asia/Almaty',
      
      // SEO configuration
      author: process.env.SITE_AUTHOR || 'Nik Bulygin',
      twitterCreator: process.env.SITE_TWITTER_CREATOR || '@NikBulygin',
      ogLocale: process.env.SITE_OG_LOCALE || 'ru_RU'
    },

    // Analytics configuration
    analytics: {
      google: {
        id: process.env.GOOGLE_ANALYTICS_ID,
        debug: process.env.GOOGLE_ANALYTICS_DEBUG === 'true'
      },
      yandex: {
        id: process.env.YANDEX_METRIKA_ID,
        webvisor: process.env.YANDEX_METRIKA_WEBVISOR === 'true',
        hash: process.env.YANDEX_METRIKA_HASH === 'true'
      }
    }
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'ru',
    baseUrl: import.meta.env.DEV ? 'http://localhost:3000/' : 'http://localhost:3000/',
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
      filename: process.env.SQLITE_FILENAME || '.data/app.db'
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