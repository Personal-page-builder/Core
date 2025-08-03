<template>
  <div class="editor-controller">
    <UCard class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ t('editor.title') }}</h3>
        </div>
      </template>

      <div class="space-y-4">
        <div class="space-y-2">
          <h4 class="font-medium text-sm">{{ t('editor.settings') }}</h4>
          <div class="flex items-center gap-2">
            
            <UTooltip :text="isDark ? t('editor.theme.light') : t('editor.theme.dark')">
              <ThemeSwitcher />
            </UTooltip>

            <UTooltip :text="t('language.selectLanguage')">
              <LanguageSwitcher />
            </UTooltip>

            <UTooltip :text="showDualLocale ? t('editor.split.disable') : t('editor.split.enable')">
              <UButton
                :color="showDualLocale ? 'primary' : 'neutral'"
                variant="soft"
                size="sm"
                icon="i-lucide-split-square-horizontal"
                @click="toggleDualLocale"
              />
            </UTooltip>
          </div>
        </div>

        <!-- Информация о панелях -->
        <div class="space-y-2">
          <h4 class="font-medium text-sm">{{ t('editor.panels.title') }}</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span>{{ t('editor.panels.leftPanel') }}:</span>
              <span class="text-gray-600">{{ leftPanel.mode }} - {{ leftPanel.locale }}</span>
            </div>
            <div v-if="showDualLocale" class="flex items-center justify-between">
              <span>{{ t('editor.panels.rightPanel') }}:</span>
              <span class="text-gray-600">{{ rightPanel.mode }} - {{ rightPanel.locale }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('editor.panels.activePanel') }}:</span>
              <span class="text-primary font-medium">{{ activePanel === 'left' ? t('editor.panels.left') : t('editor.panels.right') }}</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
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