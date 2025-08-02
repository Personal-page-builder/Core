<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import CommonMarkdownRenderer from '~/component/common/MarkdownRenderer.vue'

const route = useRoute()
const { locale } = useI18n()

const slug = computed(() => withLeadingSlash(String(route.params.slug)))
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <CommonMarkdownRenderer 
          :path="slug" 
          :locale="locale"
          fallback-locale="en"
        />
      </div>
    </div>
  </div>
</template>
