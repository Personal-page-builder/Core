<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <GlobalImageUploader />
    <GlobalAnalytics />
  </UApp>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const i18nHead = useLocaleHead({ seo: true })
const colorMode = useColorMode()

const themeHandler = computed(() => (colorMode.value === 'dark' ? '#0c0c0d' : '#ffffff'))

useHead(() => ({
  htmlAttrs: { lang: i18nHead.value.htmlAttrs!.lang },
  link: [...(i18nHead.value.link || [])],
  title: t('title' as ULocaleKey),
  meta: [
    { name: 'theme-color', content: themeHandler.value },
    ...(i18nHead.value.meta || []),
    { name: 'description', content: t('core.desc') },
  ],
}))
</script>