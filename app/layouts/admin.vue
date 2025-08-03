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
      class="w-1 cursor-col-resize hover:transition-colors"
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

        <!-- Кнопка сохранения изменений -->
        <UButton
          v-if="hasUnsavedChanges && isClient"
          color="primary"
          variant="solid"
          size="sm"
          icon="i-lucide-save"
          :title="t('editor.saveChanges')"
          @click="saveAllChanges"
        >
          {{ t('editor.save') }}
        </UButton>

        <!-- Пустое место для выравнивания -->
        <div v-if="!isMobile && !hasUnsavedChanges"></div>
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
            :is-modified="isFileModified(leftPanel.currentFile || '', leftPanel.locale)"
            @mode-change="(mode) => setPanelMode('left', mode)"
            @locale-change="(locale) => setPanelLocale('left', locale)"
            @revert-changes="() => revertFileChanges(leftPanel.currentFile || '', leftPanel.locale)"
          />
          
          <div class="flex-1 overflow-y-auto">
            <!-- Режим редактирования -->
            <MarkdownEditor
              class="h-full w-full"
              v-if="leftPanel.mode === 'edit'"
              :content="getPanelContent('left')"
              :loading="getPanelLoading('left')"
              :error="getPanelError('left')"
              :is-modified="isFileModified(leftPanel.currentFile || '', leftPanel.locale)"
              @content-change="(content) => updatePanelContent('left', content)"
              @revert-changes="() => revertFileChanges(leftPanel.currentFile || '', leftPanel.locale)"
            />
            
            <!-- Режим предпросмотра -->
            <!-- TODO: Make preview interactive on client side -->
            <!--
            <MarkdownRenderer
              v-else-if="leftPanel.mode === 'preview'"
              :path="leftPanel.currentFile || ''"
              :locale="leftPanel.locale"
              :create-page-object="createPageObject"
            />
            -->
          </div>
        </div>

        <!-- Разделитель сплита - только для десктопа -->
        <div 
          v-if="showDualLocale && !isMobile"
          class="w-1 cursor-col-resize hover:transition-colors"
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
            :is-modified="isFileModified(rightPanel.currentFile || '', rightPanel.locale)"
            @mode-change="(mode) => setPanelMode('right', mode)"
            @locale-change="(locale) => setPanelLocale('right', locale)"
            @revert-changes="() => revertFileChanges(rightPanel.currentFile || '', rightPanel.locale)"
          />
          
          <div class="flex-1 overflow-y-auto">
            <!-- Режим редактирования -->
            <MarkdownEditor
              v-if="rightPanel.mode === 'edit'"
              :content="getPanelContent('right')"
              :loading="getPanelLoading('right')"
              :error="getPanelError('right')"
              :is-modified="isFileModified(rightPanel.currentFile || '', rightPanel.locale)"
              @content-change="(content) => updatePanelContent('right', content)"
              @revert-changes="() => revertFileChanges(rightPanel.currentFile || '', rightPanel.locale)"
            />
            
            <!-- Режим предпросмотра -->
            <!-- TODO: Make preview interactive on client side -->
            <!--
            <MarkdownRenderer
              v-else-if="rightPanel.mode === 'preview'"
              :path="rightPanel.currentFile || ''"
              :locale="rightPanel.locale"
              :create-page-object="createPageObject"
            />
            -->
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
// TODO: Make preview interactive on client side
// import MarkdownRenderer from '~/component/common/MarkdownRenderer.vue'
import { useEditorController } from '~/store/EditorController'

const editorController = useEditorController()
const { t } = useI18n()

// Проверка что мы на клиенте
const isClient = computed(() => typeof window !== 'undefined')

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
const hasUnsavedChanges = computed(() => {
  if (!isClient.value) return false
  return editorController.hasUnsavedChanges
})
const saveAllChanges = () => editorController.saveAllChanges()
const isFileModified = (filePath: string, locale: string) => {
  if (!isClient.value) return false
  return editorController.isFileModified(filePath, locale)
}
const revertFileChanges = (filePath: string, locale: string) => editorController.revertFileChanges(filePath, locale)
const getPanelContent = (panelId: 'left' | 'right') => editorController.getPanelContent(panelId)
const getPanelLoading = (panelId: 'left' | 'right') => editorController.getPanelLoading(panelId)
const getPanelError = (panelId: 'left' | 'right') => editorController.getPanelError(panelId)
// TODO: Make preview interactive on client side
// const createPageObject = (filePath: string, locale: string) => editorController.createPageObject(filePath, locale)

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
