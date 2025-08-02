<template>
  <div class="flex h-screen">
    <div 
      v-show="showNavigation"
      class="flex flex-col"
      :style="{ width: navigationWidth + 'px' }"
    >
      <div class="p-4 space-y-4 flex-1 overflow-y-auto">
        <EditorController />
        <ContentTreeView />
      </div>
    </div>

    <div 
      v-if="showNavigation"
      class="w-1 bg-gray-200 cursor-col-resize hover:bg-gray-300 transition-colors"
      @mousedown="startResizeNavigation"
    />

    <div class="flex-1 flex flex-col">
      <div class="p-4 border-b">
        <UButton 
          :icon="showNavigation ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
          color="neutral" 
          variant="subtle" 
          size="sm"
          :title="showNavigation ? t('navigation.hide') : t('navigation.show')"
          @click="toggleNavigation"
        />
      </div>

      <div class="flex-1 flex">
        <div 
          class="flex flex-col"
          :class="{ 'border-primary border-2': activePanel === 'left' }"
          :style="{ width: showDualLocale ? (splitRatio * 100) + '%' : '100%' }"
          @click="setActivePanel('left')"
        >
          <PanelToolbar 
            :title="getPanelTitle('left')"
            :mode="leftPanel.mode"
            :locale="leftPanel.locale"
            @mode-change="(mode) => setPanelMode('left', mode)"
            @locale-change="(locale) => setPanelLocale('left', locale)"
          />
          
          <div class="flex-1 overflow-y-auto">
            <slot name="left" />
          </div>
        </div>

        <div 
          v-if="showDualLocale"
          class="w-1 bg-gray-200 cursor-col-resize hover:bg-gray-300 transition-colors"
          @mousedown="startResizeSplit"
        />

        <div 
          v-if="showDualLocale"
          class="flex flex-col"
          :class="{ 'border-primary border-2': activePanel === 'right' }"
          :style="{ width: (1 - splitRatio) * 100 + '%' }"
          @click="setActivePanel('right')"
        >
          <PanelToolbar 
            :title="getPanelTitle('right')"
            :mode="rightPanel.mode"
            :locale="rightPanel.locale"
            @mode-change="(mode) => setPanelMode('right', mode)"
            @locale-change="(locale) => setPanelLocale('right', locale)"
          />
          
          <div class="flex-1 overflow-y-auto">
            <slot name="right" />
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
import { useEditorController } from '~/store/EditorController'

const editorController = useEditorController()
const { t } = useI18n()

const showNavigation = computed(() => editorController.showNavigation)
const showDualLocale = computed(() => editorController.showDualLocale)
const leftPanel = computed(() => editorController.leftPanel)
const rightPanel = computed(() => editorController.rightPanel)
const activePanel = computed(() => editorController.activePanel)

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

// Очистка при размонтировании
onUnmounted(() => {
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
