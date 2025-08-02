<template>
  <div class="tree-view">
    <div v-if="loading" class="flex items-center justify-center p-4">
      <UIcon name="i-lucide-loader-2" class="animate-spin" />
      <span class="ml-2">Загрузка структуры...</span>
    </div>
    
    <div v-else-if="error" class="p-4 text-red-500">
      {{ error }}
    </div>
    
    <div v-else-if="treeItems && treeItems.length > 0">
      <UTree 
        :items="treeItems" 
        :loading="loading"
        @update:model-value="handleSelection"
      />
    </div>
    
    <div v-else class="p-4 text-gray-500">
      Нет данных для отображения
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorController } from '~/store/EditorController'

const editorController = useEditorController()

const loading = computed(() => editorController.loading)
const error = computed(() => editorController.error)
const treeItems = computed(() => editorController.treeItems)

const handleSelection = (selectedItems: string | undefined) => {
  if (selectedItems) {
    // Устанавливаем файл в активную панель
    editorController.setActivePanelFile(selectedItems)
  }
}

onMounted(async () => {
  try {
    await editorController.fetchStructure()
  } catch (err) {
    console.error('Ошибка при загрузке структуры:', err)
  }
})
</script>

<style scoped>
.tree-view {
  min-height: 200px;
}
</style>
