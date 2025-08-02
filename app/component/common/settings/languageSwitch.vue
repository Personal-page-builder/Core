<template>
  <UModal 
    v-if="allLocales.length > 1"
    :title="t('language.selectTitle')"
    :description="t('language.selectDescription')"
    :ui="{ content: 'max-w-[800px] max-h-[600px] min-w-[400px] min-h-[300px]' }">
    <UButton 
      :label="currentLanguageName" 
      variant="ghost" 
      icon="i-heroicons-language"
    />

    <template #body>
      <div class="flex flex-row flex-wrap gap-4 h-full w-full justify-center items-center overflow-y-auto p-4 flex-1">
        <UButton
          v-for="locale in allLocales"
          :key="locale.code"
          :label="`${getFlag(locale.code)} ${locale.name}`"
          :variant="locale.code === currentLocale ? 'solid' : 'outline'"
          :color="locale.code === currentLocale ? 'primary' : 'neutral'"
          size="lg"
          class="justify-center text-center min-w-[250px] min-h-[80px] text-lg font-medium"
          @click="handleSetLocale(locale.code)"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Locale {
  code: string
  name: string
  language: string
  file: string
}

const { locale, locales, t, setLocale } = useI18n()

const currentLocale = computed(() => locale.value)

const allLocales = computed(() => {
  return (locales.value as Locale[])
})

const currentLanguageName = computed(() => {
  const currentLocale = (locales.value as Locale[]).find(l => l.code === locale.value)
  return currentLocale ? `${getFlag(currentLocale.code)} ${currentLocale.name}` : t('language.selectLanguage')
})

const getFlag = (code: string): string => {
  const flagMap: Record<string, string> = {
    'en': '🇺🇸',
    'kz': '🇰🇿',
    'ru': '🇷🇺',
    'uk': '🇺🇦',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'pt': '🇵🇹',
    'ar': '🇸🇦',
    'it': '🇮🇹'
  }
  return flagMap[code] || '🌐'
}

const handleSetLocale = (localeCode: string) => {
  // Проверяем, что локаль поддерживается
  if (localeCode === 'en' || localeCode === 'ru') {
    setLocale(localeCode as 'en' | 'ru')
  }
}
</script>
