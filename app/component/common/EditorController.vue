<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">{{ t('editor.title') }}</h3>
    
    <div class="space-y-3">
      <h4 class="font-medium text-sm">{{ t('editor.settings') }}</h4>
      
      <div class="space-y-2">
        <UButton
          :icon="showNavigation ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
          color="neutral"
          variant="soft"
          size="sm"
          @click="toggleNavigation"
        >
          {{ showNavigation ? t('navigation.hide') : t('navigation.show') }}
        </UButton>
        
        <UButton
          :icon="fixedNavigation ? 'i-lucide-pin' : 'i-lucide-pin-off'"
          color="neutral"
          variant="soft"
          size="sm"
          @click="toggleFixedNavigation"
        >
          {{ fixedNavigation ? t('navigation.unpin') : t('navigation.pin') }}
        </UButton>
        
        <UButton
          :icon="showDualLocale ? 'i-lucide-languages' : 'i-lucide-languages'"
          color="neutral"
          variant="soft"
          size="sm"
          @click="toggleDualLocale"
        >
          {{ showDualLocale ? t('editor.hideDual') : t('editor.showDual') }}
        </UButton>
      </div>
    </div>
    
    <div class="space-y-3">
      <h4 class="font-medium text-sm">{{ t('editor.panels.title') }}</h4>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>{{ t('editor.panels.left') }}</span>
          <span>{{ leftPanel.mode }} - {{ leftPanel.locale }}</span>
        </div>
        <div v-if="showDualLocale" class="flex justify-between">
          <span>{{ t('editor.panels.right') }}</span>
          <span>{{ rightPanel.mode }} - {{ rightPanel.locale }}</span>
        </div>
        <div class="flex justify-between">
          <span>{{ t('editor.panels.active') }}</span>
          <span class="font-medium">{{ activePanel === 'left' ? t('editor.panels.left') : t('editor.panels.right') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorController } from '~/store/EditorController'
import LanguageSwitcher from '~/component/common/settings/languageSwitch.vue'
import ThemeSwitcher from '~/component/common/settings/themeSwitch.vue'

const editorController = useEditorController()
const { t } = useI18n()
const colorMode = useColorMode()

const showDualLocale = computed(() => editorController.showDualLocale)
const leftPanel = computed(() => editorController.leftPanel)
const rightPanel = computed(() => editorController.rightPanel)
const activePanel = computed(() => editorController.activePanel)

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  }
})

const toggleDualLocale = () => editorController.toggleDualLocale()
</script>

<style scoped>
.editor-controller {
  min-width: 280px;
}
</style> 