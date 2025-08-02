<template>
  <div v-if="_pending" class="flex items-center justify-center p-8">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
    <span class="ml-2">{{ $t('common.loading') }}</span>
  </div>
  
  <div v-else-if="error" class="text-center py-8">
    <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-4" />
    <h3 class="text-lg font-semibold mb-2">
      {{ $t('common.error') }}
    </h3>
    <p class="mb-4">
      {{ error }}
    </p>
  </div>
  
  <div v-else-if="page" class="h-full overflow-y-auto p-4">
    <ContentRenderer :value="page" />
  </div>
  
  <div v-else class="text-center py-8">
    <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-4" />
    <h3 class="text-lg font-semibold mb-2">
      {{ $t('common.noContent') }}
    </h3>
    <p>
      {{ $t('common.noContentDescription') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Collections } from '@nuxt/content'

interface Props {
  path: string
  locale?: string
  fallbackLocale?: string
  page?: Record<string, unknown> // Готовый контент для ContentRenderer
  createPageObject?: (filePath: string, locale: string) => Record<string, unknown> | null
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'ru',
  fallbackLocale: 'en',
  page: undefined,
  createPageObject: undefined
})

const { locale: currentLocale } = useI18n()

// Use the provided locale or fallback to current locale
const targetLocale = computed(() => props.locale || currentLocale.value)

// Fetch content based on path and locale, или используем переданный page
const { data: page, pending: _pending, error, refresh } = await useAsyncData(
  `markdown-${props.path}-${targetLocale.value}`,
  async () => {
    // Если передан готовый page, используем его
    if (props.page) {
      console.log('📄 MarkdownRenderer: Используем переданный page')
      return props.page
    }
    
    // Если есть createPageObject, используем его
    if (props.createPageObject) {
      console.log('📄 MarkdownRenderer: Создаем page объект через createPageObject')
      const pageObject = props.createPageObject(props.path, props.locale || 'en')
      if (pageObject) {
        console.log('✅ MarkdownRenderer: Page объект создан')
        return pageObject
      }
    }
    
    console.log('🔍 MarkdownRenderer: Начинаем загрузку контента')
    console.log('📁 Путь:', props.path)
    console.log('🌍 Локаль:', targetLocale.value)
    console.log('🎯 Fallback локаль:', props.fallbackLocale)
    
    try {
      // Build collection name based on target locale
      const collection = (`content_${targetLocale.value}`) as keyof Collections
      console.log('📚 Коллекция:', collection)
      
      let content = await queryCollection(collection).path(props.path).first()
      console.log('📄 Контент из основной локали:', content ? 'найден' : 'не найден')

      // Fallback to fallback locale if content is missing
      if (!content && targetLocale.value !== props.fallbackLocale) {
        console.log('🔄 Пробуем fallback локаль:', props.fallbackLocale)
        const fallbackCollection = (`content_${props.fallbackLocale}`) as keyof Collections
        content = await queryCollection(fallbackCollection).path(props.path).first()
        console.log('📄 Контент из fallback локали:', content ? 'найден' : 'не найден')
      }

      console.log('✅ MarkdownRenderer: Загрузка завершена')
      console.log('📊 Результат:', content ? 'контент получен' : 'контент не найден')
      return content
    } catch (err) {
      console.error('❌ MarkdownRenderer: Ошибка при загрузке контента:', err)
      return null
    }
  },
  {
    watch: [targetLocale, () => props.page, () => props.createPageObject], // Refetch when locale, page or createPageObject changes
  }
)

// Handle refresh button click
const _handleRefresh = () => {
  refresh()
}
</script>