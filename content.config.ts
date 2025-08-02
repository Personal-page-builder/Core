import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'
import { z } from 'zod'

const commonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date().optional(),
  sitemap: z.object({
    lastmod: z.string().optional(),
    changefreq: z.string().optional(),
    priority: z.number().optional()
  }).optional()
})

export default defineContentConfig({
  collections: {
    // Russian content collection
    content_ru: defineCollection(
      asSitemapCollection({
        type: 'page',
        source: {
          include: 'ru/**',
          prefix: '',
        },
        schema: commonSchema,
      }),
    ),
    // English content collection
    content_en: defineCollection(
      asSitemapCollection({
        type: 'page',
        source: {
          include: 'en/**',
          prefix: '',
        },
        schema: commonSchema,
      }),
    ),
  },
})
