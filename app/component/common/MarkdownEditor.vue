<template>
  <div v-if="loading" class="flex items-center justify-center p-8">
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
    <UButton @click="$emit('revert-changes')">
      {{ $t('common.revert') }}
    </UButton>
  </div>
  
  <div v-else-if="content" class="h-full flex flex-col">
    <div v-if="isModified && isClient" class="p-2 border-b flex items-center justify-between">
      <span class="text-sm">
        {{ $t('editor.modified') }}
      </span>
      <UButton
        size="xs"
        color="error"
        variant="soft"
        icon="i-lucide-rotate-ccw"
        @click="$emit('revert-changes')"
      >
        {{ $t('common.revert') }}
      </UButton>
    </div>
    
    <textarea
      :value="content"
      @input="$emit('content-change', ($event.target as HTMLTextAreaElement).value)"
      class="flex-1 w-full p-4 font-mono text-sm border-0 outline-none resize-none"
      :placeholder="$t('editor.placeholder')"
    />
  </div>
  
  <div v-else class="text-center py-8">
    <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-4" />
    <h3 class="text-lg font-semibold mb-2">
      {{ $t('editor.noFile') }}
    </h3>
    <p>
      {{ $t('editor.selectFile') }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  content?: string
  loading?: boolean
  error?: string | null
  isModified?: boolean
}

const _props = defineProps<Props>()

const _emit = defineEmits<{
  'content-change': [content: string]
  'revert-changes': []
}>()

const isClient = computed(() => typeof window !== 'undefined')
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