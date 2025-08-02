import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const commonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date().optional()
})

export default defineContentConfig({
  collections: {
    // English content collection
    content_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/**',
        prefix: '',
      },
      schema: commonSchema,
    }),
    // Russian content collection
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
