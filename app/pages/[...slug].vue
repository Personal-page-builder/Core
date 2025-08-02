<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => withLeadingSlash(String(route.params.slug)))

const { data: page } = await useAsyncData('page-' + slug.value, async () => {
  // Build collection name based on current locale
  const collection = ('content_' + locale.value) as keyof Collections
  let content = await queryCollection(collection).path(slug.value).first()

  // Fallback to default locale if content is missing
  if (!content && locale.value !== 'en') {
    content = await queryCollection('content_en' as keyof Collections).path(slug.value).first()
  }

  return content
}, {
  watch: [locale], // Refetch when locale changes
})
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">{{ $t('error.titles.404') }}</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ $t('error.messages.404') }}
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
        {{ $t('error.pathInfo', { path: slug, locale: locale }) }}
      </p>
      <UButton @click="$router.push('/')">{{ $t('error.goHome') }}</UButton>
    </div>
  </div>
</template>
