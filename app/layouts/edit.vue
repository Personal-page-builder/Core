<template>
  <div class="flex h-screen">
    <div 
      v-show="showNavigation && !isMobile"
      class="flex flex-col"
      :style="{ width: navigationWidth + 'px' }"
    >
      <div class="p-4 space-y-4 flex-1 overflow-y-auto">
        <ClientOnly>
          <EditorController />
        </ClientOnly>
        <ContentTreeView />
      </div>
    </div>

    <div 
      v-if="showNavigation && !isMobile"
      class="w-1 bg-neutral-200 dark:bg-neutral-800 cursor-col-resize hover:transition-colors"
      @mousedown="startResizeNavigation"
    />

    <div class="flex-1 flex flex-col">

      <div class="p-4 border-b flex items-center justify-between">

        <UButton 
          v-if="!isMobile"
          :icon="showNavigation ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
          color="neutral" 
          variant="subtle" 
          size="sm"
          :title="showNavigation ? t('navigation.hide') : t('navigation.show')"
          @click="toggleNavigation"
        />
        
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

        <div v-if="isMobile" class="text-sm font-medium">
          {{ getMobilePanelTitle() }}
        </div>

        <ClientOnly>
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
        </ClientOnly>

        <ClientOnly>
          <UButton
            v-if="isClient"
            color="error"
            variant="soft"
            size="sm"
            icon="i-lucide-trash-2"
            :title="t('editor.clearCache')"
            @click="clearLocalStorage"
          >
            {{ t('editor.clearCache') }}
          </UButton>
        </ClientOnly>

        <div v-if="!isMobile && !hasUnsavedChanges"></div>
      </div>

      <ClientOnly>
        <div class="flex-1 flex">
          <div 
            v-if="isMobile && currentMobilePanel === 'navigation'"
            class="w-full"
          >
            <div class="p-4 space-y-4 flex-1 overflow-y-auto">
              <ClientOnly>
                <EditorController />
              </ClientOnly>
              <ContentTreeView />
            </div>
          </div>

          <ClientOnly>
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
          </ClientOnly>

          <div 
            v-if="showDualLocale && !isMobile"
            class="w-1 bg-neutral-200 dark:bg-neutral-800 cursor-col-resize hover:transition-colors"
            @mousedown="startResizeSplit"
          />

          <ClientOnly>
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
                <MarkdownEditor
                  v-if="rightPanel.mode === 'edit'"
                  :content="getPanelContent('right')"
                  :loading="getPanelLoading('right')"
                  :error="getPanelError('right')"
                  :is-modified="isFileModified(rightPanel.currentFile || '', rightPanel.locale)"
                  @content-change="(content) => updatePanelContent('right', content)"
                  @revert-changes="() => revertFileChanges(rightPanel.currentFile || '', rightPanel.locale)"
                />
                
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
          </ClientOnly>
        </div>
      </ClientOnly>
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

const isClient = computed(() => typeof window !== 'undefined')

const showNavigation = computed(() => editorController.showNavigation)
const showDualLocale = computed(() => editorController.showDualLocale)
const leftPanel = computed(() => editorController.leftPanel)
const rightPanel = computed(() => editorController.rightPanel)
const activePanel = computed(() => editorController.activePanel)

const isMobile = ref(false)
const currentMobilePanel = ref<'navigation' | 'left' | 'right'>('left')

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
  if (isMobile.value && currentMobilePanel.value === 'right' && !showDualLocale.value) {
    currentMobilePanel.value = 'left'
  }
}

const navigationWidth = ref(320)
const splitRatio = ref(0.5)

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

const clearLocalStorage = () => {
  const toast = useToast()
  const toastResult = toast.add({
    title: t('editor.clearCache'),
    description: t('editor.clearCacheLoading'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })
  
  try {
    localStorage.clear()
    
    toast.update(toastResult.id, {
      title: t('editor.clearCache'),
      description: t('editor.clearCacheSuccess'),
      color: 'success',
      icon: 'i-lucide-check'
    })
    
    setTimeout(() => {
      window.location.reload()
    }, 1000)
    
  } catch (error) {
    console.error('Ошибка при очистке localStorage:', error)
    toast.update(toastResult.id, {
      title: t('error.titles.default'),
      description: t('editor.clearCacheError'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}
// TODO: Make preview interactive on client side
// const createPageObject = (filePath: string, locale: string) => editorController.createPageObject(filePath, locale)

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

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  const handleContextMenu = (e: Event) => {
    e.preventDefault()
    return false
  }
  
  document.addEventListener('contextmenu', handleContextMenu)
  
  const cleanup = () => {
    document.removeEventListener('contextmenu', handleContextMenu)
  }
  
  onUnmounted(() => {
    cleanup()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  document.removeEventListener('mousemove', handleResizeNavigation)
  document.removeEventListener('mouseup', stopResizeNavigation)
  document.removeEventListener('mousemove', handleResizeSplit)
  document.removeEventListener('mouseup', stopResizeSplit)
})
</script> 
