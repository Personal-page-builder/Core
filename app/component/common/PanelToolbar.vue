<template>
  <div class="p-3 border-b flex items-center justify-between">
    <h3 class="text-sm font-medium">{{ translatedTitle }}</h3>
    <div class="flex items-center gap-1">
      <!-- Кнопка отмены изменений -->
      <UButton
        v-if="isModified && isClient"
        color="error"
        variant="soft"
        size="xs"
        icon="i-lucide-rotate-ccw"
        @click.stop="$emit('revertChanges')"
      />
      
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
      <!-- TODO: Make preview interactive on client side -->
      <!--
      <UButton
        :color="mode === 'preview' ? 'primary' : 'neutral'"
        variant="soft"
        size="xs"
        icon="i-lucide-eye"
        @click.stop="$emit('modeChange', 'preview')"
      />
      -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorController } from '~/store/EditorController'

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
  currentFile?: string | null
  isModified?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  modeChange: [mode: 'edit' | 'preview']
  localeChange: [locale: string]
  revertChanges: []
}>()

const { locales, t } = useI18n()
const editorController = useEditorController()

// Проверка что мы на клиенте
const isClient = computed(() => typeof window !== 'undefined')

const selectedLocale = computed({
  get: () => props.locale,
  set: (value) => {
    if (typeof value === 'string') {
      emit('localeChange', value)
      
      // Проверяем есть ли файл в localStorage для новой локали
      if (props.currentFile && isClient.value) {
        const fileKey = `${props.currentFile}_${value}`
        const existingFile = editorController.modifiedFiles[fileKey]
        
        if (!existingFile) {
          console.log('🔄 Файл не найден в localStorage для новой локали, загружаем с сервера')
          // Определяем ID панели по контексту (можно передать как prop)
          const panelId = props.title.includes('left') || props.mode === 'edit' ? 'left' : 'right'
          editorController.loadMarkdownContent(panelId, props.currentFile, value)
        }
      }
    }
  }
})

const availableLocales = computed(() => {
  return (locales.value as Locale[]).map(locale => ({
    label: locale.name,
    value: locale.code
  }))
})

// Перевод заголовка панели на лету с именем файла
const translatedTitle = computed(() => {
  let baseTitle = ''
  
  if (props.title === 'edit') {
    baseTitle = t('editor.panels.edit')
  } else if (props.title === 'preview') {
    baseTitle = t('editor.panels.preview')
  } else {
    baseTitle = props.title
  }
  
  // Добавляем имя файла если оно есть
  if (props.currentFile && typeof props.currentFile === 'string') {
    const fileName = props.currentFile.split('/').pop() || props.currentFile
    return `${baseTitle} - ${fileName}`
  }
  
  return baseTitle
})
</script> 