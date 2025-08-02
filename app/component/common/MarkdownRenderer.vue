<template>
  <div class="markdown-renderer">
    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-500" />
      <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-8">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ $t('error.titles.default') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ $t('error.messages.default') }}
      </p>
      <UButton @click="handleRefresh" color="primary">
        {{ $t('error.tryAgain') }}
      </UButton>
    </div>

    <!-- Content state -->
    <div v-else-if="page" class="prose prose-gray dark:prose-invert max-w-none">
      <ContentRenderer :value="page" />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ $t('common.noContent') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('common.noContentDescription') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Collections } from '@nuxt/content'

interface Props {
  path: string
  locale?: string
  fallbackLocale?: string
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'ru',
  fallbackLocale: 'en'
})

const { locale: currentLocale } = useI18n()

// Use the provided locale or fallback to current locale
const targetLocale = computed(() => props.locale || currentLocale.value)

// Fetch content based on path and locale
const { data: page, pending, error, refresh } = await useAsyncData(
  `markdown-${props.path}-${targetLocale.value}`,
  async () => {
    try {
      // Build collection name based on target locale
      const collection = (`content_${targetLocale.value}`) as keyof Collections
      let content = await queryCollection(collection).path(props.path).first()

      // Fallback to fallback locale if content is missing
      if (!content && targetLocale.value !== props.fallbackLocale) {
        const fallbackCollection = (`content_${props.fallbackLocale}`) as keyof Collections
        content = await queryCollection(fallbackCollection).path(props.path).first()
      }

      return content
    } catch (err) {
      console.error('Error fetching markdown content:', err)
      return null
    }
  },
  {
    watch: [targetLocale], // Refetch when locale changes
  }
)

// Handle refresh button click
const handleRefresh = () => {
  refresh()
}
</script>