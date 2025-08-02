<template>
  <div class="flex h-screen">
    <!-- Навигация - скрыта на малых экранах -->
    <div 
      v-show="showNavigation && !isMobile"
      class="flex flex-col"
      :style="{ width: navigationWidth + 'px' }"
    >
      <div class="p-4 space-y-4 flex-1 overflow-y-auto">
        <EditorController />
        <ContentTreeView />
      </div>
    </div>

    <!-- Разделитель навигации - скрыт на малых экранах -->
    <div 
      v-if="showNavigation && !isMobile"
      class="w-1 bg-gray-200 cursor-col-resize hover:bg-gray-300 transition-colors"
      @mousedown="startResizeNavigation"
    />

    <!-- Основной контент -->
    <div class="flex-1 flex flex-col">
      <!-- Верхняя панель с кнопками -->
      <div class="p-4 border-b flex items-center justify-between">
        <!-- Кнопка навигации для десктопа -->
        <UButton 
          v-if="!isMobile"
          :icon="showNavigation ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
          color="neutral" 
          variant="subtle" 
          size="sm"
          :title="showNavigation ? t('navigation.hide') : t('navigation.show')"
          @click="toggleNavigation"
        />
        
        <!-- Переключатель панелей для мобильных -->
        <div v-if="isMobile" class="flex items-center gap-1">
          <UButton
            :color="currentMobilePanel === 'navigation' ? 'primary' : 'neutral'"
            variant="soft"
            size="sm"
            icon="i-lucide-menu"
            :title="t('navigation.title')"
            @click="setMobilePanel('navigation')"
          />
          <UButton
            :color="currentMobilePanel === 'left' ? 'primary' : 'neutral'"
            variant="soft"
            size="sm"
            icon="i-lucide-file-edit"
            :title="t('editor.panels.left')"
            @click="setMobilePanel('left')"
          />
          <UButton
            v-if="showDualLocale"
            :color="currentMobilePanel === 'right' ? 'primary' : 'neutral'"
            variant="soft"
            size="sm"
            icon="i-lucide-eye"
            :title="t('editor.panels.right')"
            @click="setMobilePanel('right')"
          />
        </div>

        <!-- Заголовок текущей панели для мобильных -->
        <div v-if="isMobile" class="text-sm font-medium">
          {{ getMobilePanelTitle() }}
        </div>

        <!-- Пустое место для выравнивания -->
        <div v-if="!isMobile"></div>
      </div>

      <!-- Контент панелей -->
      <div class="flex-1 flex">
        <!-- Навигация для мобильных -->
        <div 
          v-if="isMobile && currentMobilePanel === 'navigation'"
          class="w-full"
        >
          <div class="p-4 space-y-4 flex-1 overflow-y-auto">
            <EditorController />
            <ContentTreeView />
          </div>
        </div>

        <!-- Левая панель -->
        <div 
          v-if="(!isMobile) || (isMobile && currentMobilePanel === 'left')"
          class="flex flex-col"
          :class="{ 'border-primary border-2': activePanel === 'left' }"
          :style="{ width: showDualLocale && !isMobile ? (splitRatio * 100) + '%' : '100%' }"
          @click="setActivePanel('left')"
        >
          <PanelToolbar 
            :title="getPanelTitle('left')"
            :mode="leftPanel.mode"
            :locale="leftPanel.locale"
            :current-file="leftPanel.currentFile ? String(leftPanel.currentFile) : null"
            @mode-change="(mode) => setPanelMode('left', mode)"
            @locale-change="(locale) => setPanelLocale('left', locale)"
          />
          
          <div class="flex-1 overflow-y-auto">
            <!-- Режим редактирования -->
            <MarkdownEditor
              v-if="leftPanel.mode === 'edit'"
              :content="leftPanel.content"
              :loading="leftPanel.loading"
              :error="leftPanel.error"
              @content-change="(content) => updatePanelContent('left', content)"
            />
            
            <!-- Режим предпросмотра -->
            <MarkdownRenderer
              v-else-if="leftPanel.mode === 'preview'"
              :path="getContentPath(leftPanel.currentFile)"
              :locale="leftPanel.locale"
            />
          </div>
        </div>

        <!-- Разделитель сплита - только для десктопа -->
        <div 
          v-if="showDualLocale && !isMobile"
          class="w-1 bg-gray-200 cursor-col-resize hover:bg-gray-300 transition-colors"
          @mousedown="startResizeSplit"
        />

        <!-- Правая панель -->
        <div 
          v-if="(showDualLocale && !isMobile) || (isMobile && currentMobilePanel === 'right')"
          class="flex flex-col"
          :class="{ 'border-primary border-2': activePanel === 'right' }"
          :style="{ width: showDualLocale && !isMobile ? (1 - splitRatio) * 100 + '%' : '100%' }"
          @click="setActivePanel('right')"
        >
          <PanelToolbar 
            :title="getPanelTitle('right')"
            :mode="rightPanel.mode"
            :locale="rightPanel.locale"
            :current-file="rightPanel.currentFile ? String(rightPanel.currentFile) : null"
            @mode-change="(mode) => setPanelMode('right', mode)"
            @locale-change="(locale) => setPanelLocale('right', locale)"
          />
          
          <div class="flex-1 overflow-y-auto">
            <!-- Режим редактирования -->
            <MarkdownEditor
              v-if="rightPanel.mode === 'edit'"
              :content="rightPanel.content"
              :loading="rightPanel.loading"
              :error="rightPanel.error"
              @content-change="(content) => updatePanelContent('right', content)"
            />
            
            <!-- Режим предпросмотра -->
            <MarkdownRenderer
              v-else-if="rightPanel.mode === 'preview'"
              :path="getContentPath(rightPanel.currentFile)"
              :locale="rightPanel.locale"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentTreeView from '~/component/content/TreeView.vue'
import EditorController from '~/component/common/EditorController.vue'
import PanelToolbar from '~/component/common/PanelToolbar.vue'
import MarkdownEditor from '~/component/common/MarkdownEditor.vue'
import MarkdownRenderer from '~/component/common/MarkdownRenderer.vue'
import { useEditorController } from '~/store/EditorController'

const editorController = useEditorController()
const { t } = useI18n()

const showNavigation = computed(() => editorController.showNavigation)
const showDualLocale = computed(() => editorController.showDualLocale)
const leftPanel = computed(() => editorController.leftPanel)
const rightPanel = computed(() => editorController.rightPanel)
const activePanel = computed(() => editorController.activePanel)

// Адаптивность
const isMobile = ref(false)
const currentMobilePanel = ref<'navigation' | 'left' | 'right'>('left')

// Проверка размера экрана
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
  if (isMobile.value && currentMobilePanel.value === 'right' && !showDualLocale.value) {
    currentMobilePanel.value = 'left'
  }
}

// Размеры панелей
const navigationWidth = ref(320)
const splitRatio = ref(0.5)

// Drag & Drop состояние
const isResizingNavigation = ref(false)
const isResizingSplit = ref(false)

const toggleNavigation = () => editorController.toggleNavigation()
const setPanelMode = (panelId: 'left' | 'right', mode: 'edit' | 'preview') => editorController.setPanelMode(panelId, mode)
const setPanelLocale = (panelId: 'left' | 'right', locale: string) => editorController.setPanelLocale(panelId, locale)
const getPanelTitle = (panelId: 'left' | 'right') => editorController.getPanelTitle(panelId)
const setActivePanel = (panelId: 'left' | 'right') => editorController.setActivePanel(panelId)
const updatePanelContent = (panelId: 'left' | 'right', content: string) => editorController.updatePanelContent(panelId, content)

// Функция для преобразования пути файла в путь для Nuxt Content
const getContentPath = (filePath: string | null): string => {
  if (!filePath) return ''
  
  // Убираем расширение .md и /index для Nuxt Content
  let pathWithoutExt = filePath.replace(/\.md$/, '')
  pathWithoutExt = pathWithoutExt.replace(/\/index$/, '')
  
  console.log('🔄 Преобразование пути:', filePath, '→', pathWithoutExt)
  return pathWithoutExt
}

// Мобильные методы
const setMobilePanel = (panel: 'navigation' | 'left' | 'right') => {
  currentMobilePanel.value = panel
  if (panel === 'left') {
    setActivePanel('left')
  } else if (panel === 'right') {
    setActivePanel('right')
  }
}

const getMobilePanelTitle = () => {
  switch (currentMobilePanel.value) {
    case 'navigation':
      return t('navigation.title')
    case 'left':
      return t('editor.panels.left')
    case 'right':
      return t('editor.panels.right')
    default:
      return ''
  }
}

// Обработчики resize
const startResizeNavigation = (e: MouseEvent) => {
  isResizingNavigation.value = true
  document.addEventListener('mousemove', handleResizeNavigation)
  document.addEventListener('mouseup', stopResizeNavigation)
  e.preventDefault()
}

const handleResizeNavigation = (e: MouseEvent) => {
  if (isResizingNavigation.value) {
    const newWidth = Math.max(200, Math.min(500, e.clientX))
    navigationWidth.value = newWidth
  }
}

const stopResizeNavigation = () => {
  isResizingNavigation.value = false
  document.removeEventListener('mousemove', handleResizeNavigation)
  document.removeEventListener('mouseup', stopResizeNavigation)
}

const startResizeSplit = (e: MouseEvent) => {
  isResizingSplit.value = true
  document.addEventListener('mousemove', handleResizeSplit)
  document.addEventListener('mouseup', stopResizeSplit)
  e.preventDefault()
}

const handleResizeSplit = (e: MouseEvent) => {
  if (isResizingSplit.value) {
    const container = document.querySelector('.flex-1.flex.flex-col') as HTMLElement
    if (container) {
      const rect = container.getBoundingClientRect()
      const ratio = Math.max(0.2, Math.min(0.8, (e.clientX - rect.left) / rect.width))
      splitRatio.value = ratio
    }
  }
}

const stopResizeSplit = () => {
  isResizingSplit.value = false
  document.removeEventListener('mousemove', handleResizeSplit)
  document.removeEventListener('mouseup', stopResizeSplit)
}

// Инициализация и очистка
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  document.removeEventListener('mousemove', handleResizeNavigation)
  document.removeEventListener('mouseup', stopResizeNavigation)
  document.removeEventListener('mousemove', handleResizeSplit)
  document.removeEventListener('mouseup', stopResizeSplit)
})
</script>

<style scoped>
/* Стили для курсора при resize */
.cursor-col-resize {
  cursor: col-resize;
}

/* Предотвращение выделения текста при drag */
* {
  user-select: none;
}
</style> 
