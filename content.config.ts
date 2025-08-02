import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const commonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date().optional()
})

export default defineContentConfig({
  collections: {
    // CV Collections
    cv_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/cv/**',
        prefix: '',
      },
      schema: commonSchema,
    }),
    cv_ru: defineCollection({
      type: 'page',
      source: {
        include: 'ru/cv/**',
        prefix: '',
      },
      schema: commonSchema,
    }),

    // Portfolio Collections
    portfolio_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/portfolio/**',
        prefix: '',
      },
      schema: commonSchema,
    }),
    portfolio_ru: defineCollection({
      type: 'page',
      source: {
        include: 'ru/portfolio/**',
        prefix: '',
      },
      schema: commonSchema,
    }),

    // Store Collections
    store_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/store/**',
        prefix: '',
      },
      schema: commonSchema,
    }),
    store_ru: defineCollection({
      type: 'page',
      source: {
        include: 'ru/store/**',
        prefix: '',
      },
      schema: commonSchema,
    }),

    // Blog Collections
    blog_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/blog/**',
        prefix: '',
      },
      schema: commonSchema,
    }),
    blog_ru: defineCollection({
      type: 'page',
      source: {
        include: 'ru/blog/**',
        prefix: '',
      },
      schema: commonSchema,
    }),

    // Main content collections
    content_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/**',
        prefix: '',
      },
      schema: commonSchema,
    }),
    content_ru: defineCollection({
      type: 'page',
      source: {
        include: 'ru/**',
        prefix: '',
      },
      schema: commonSchema,
    }),
  },
})
