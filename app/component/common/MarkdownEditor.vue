<template>
  <div class="markdown-editor">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-8">
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
        {{ error }}
      </p>
    </div>

    <!-- Editor state -->
    <div v-else-if="content || !loading" class="h-full">
      <textarea
        v-model="content"
        class="w-full h-full p-4 font-mono text-sm border-0 outline-none resize-none bg-transparent"
        placeholder="Начните писать markdown..."
        @input="handleContentChange"
      />
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
interface Props {
  content?: string
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  loading: false,
  error: null
})

const emit = defineEmits<{
  'content-change': [content: string]
}>()

const content = ref(props.content)

// Синхронизируем с внешним контентом
watch(() => props.content, (newContent) => {
  if (newContent !== content.value) {
    content.value = newContent || ''
  }
})

const handleContentChange = () => {
  emit('content-change', content.value)
}
</script>

<style scoped>
.markdown-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

textarea {
  flex: 1;
  min-height: 0;
}
</style> 