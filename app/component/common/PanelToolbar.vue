<template>
  <div class="p-3 border-b flex items-center justify-between">
    <h3 class="text-sm font-medium">{{ translatedTitle }}</h3>
    <div class="flex items-center gap-1">
      <!-- Выбор языка -->
      <USelect
        v-model="selectedLocale"
        :items="availableLocales"
        size="xs"
        class="w-20"
      />
      
      <!-- Режим редактирования -->
      <UButton
        :color="mode === 'edit' ? 'primary' : 'neutral'"
        variant="soft"
        size="xs"
        icon="i-lucide-edit"
        @click.stop="$emit('modeChange', 'edit')"
      />
      
      <!-- Режим предпросмотра -->
      <UButton
        :color="mode === 'preview' ? 'primary' : 'neutral'"
        variant="soft"
        size="xs"
        icon="i-lucide-eye"
        @click.stop="$emit('modeChange', 'preview')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Locale {
  code: string
  name: string
  language: string
  file: string
}

interface Props {
  title: string
  mode: 'edit' | 'preview'
  locale: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  modeChange: [mode: 'edit' | 'preview']
  localeChange: [locale: string]
}>()

const { locales, t } = useI18n()

const selectedLocale = computed({
  get: () => props.locale,
  set: (value) => {
    if (typeof value === 'string') {
      emit('localeChange', value)
    }
  }
})

const availableLocales = computed(() => {
  return (locales.value as Locale[]).map(locale => ({
    label: locale.name,
    value: locale.code
  }))
})

// Перевод заголовка панели на лету
const translatedTitle = computed(() => {
  if (props.title === 'edit') {
    return t('editor.panels.edit')
  } else if (props.title === 'preview') {
    return t('editor.panels.preview')
  }
  return props.title
})
</script> 