<template>
  <div class="tree-view">
    <div v-if="loading" class="flex items-center justify-center p-4">
      <UIcon name="i-lucide-loader-2" class="animate-spin" />
      <span class="ml-2">{{ t('common.loading') }}</span>
    </div>
    
    <div v-else-if="error" class="p-4 text-red-500">
      {{ error }}
    </div>
    
    <div v-else-if="treeItems && treeItems.length > 0">
      <UTree 
        :items="treeItems" 
        :loading="loading"
        @update:model-value="handleSelection"
        :selectable="(item: any) => !item.children"
      />
    </div>
    
    <div v-else class="p-4 text-gray-500">
      {{ t('common.noContent') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorController } from '~/store/EditorController'
import type { TreeItem } from '@nuxt/ui'

const editorController = useEditorController()
const { t } = useI18n()

const loading = computed(() => editorController.loading)
const error = computed(() => editorController.error)

// Получаем информацию о файлах в панелях
const leftPanelFile = computed(() => editorController.leftPanel.currentFile)
const rightPanelFile = computed(() => editorController.rightPanel.currentFile)

const treeItems = computed(() => {
  return convertToTreeItemsWithIndicators(editorController.treeItems)
})

// Функция для сокращения длинных названий
const truncateFileName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name
  
  const extension = name.includes('.') ? name.split('.').pop() : ''
  const nameWithoutExt = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name
  
  if (extension) {
    const availableLength = maxLength - extension.length - 3 // 3 для "..."
    const truncatedName = nameWithoutExt.substring(0, availableLength) + '...'
    return truncatedName + '.' + extension
  } else {
    return name.substring(0, maxLength - 3) + '...'
  }
}

// Добавляем индикаторы к элементам дерева
const convertToTreeItemsWithIndicators = (items: TreeItem[]): TreeItem[] => {
  return items.map(item => {
    const customItem = { ...item }
    
    // Показываем полный путь в label
    if (item.value) {
      const fullPath = item.value as string
      const pathParts = fullPath.split('/')
      const fileName = pathParts[pathParts.length - 1] || fullPath
      const truncatedName = truncateFileName(fileName)
      
      // Добавляем индикаторы только для файлов
      if (!item.children) {
        const isInLeft = leftPanelFile.value === fullPath
        const isInRight = rightPanelFile.value === fullPath
        
        let indicators = ''
        if (isInLeft && isInRight) {
          indicators = ' [L-R]'
        } else if (isInLeft) {
          indicators = ' [L]'
        } else if (isInRight) {
          indicators = ' [R]'
        }
        
        customItem.label = `${truncatedName}${indicators}`
        // Добавляем полный путь в title для tooltip
        customItem.title = fullPath
      } else {
        // Для папок показываем только название
        customItem.label = truncatedName
        customItem.title = fullPath
      }
    }
    
    // Рекурсивно обрабатываем дочерние элементы
    if (item.children && item.children.length > 0) {
      customItem.children = convertToTreeItemsWithIndicators(item.children)
    }
    
    return customItem
  })
}

const handleSelection = (selectedItems: string | undefined) => {
  console.log('🔍 TreeView: handleSelection вызван')
  console.log('📁 Выбранный элемент:', selectedItems)
  console.log('🎯 Активная панель:', editorController.activePanel)
  
  // Извлекаем значение из Proxy объекта
  let filePath: string | null = null
  
  if (selectedItems) {
    if (typeof selectedItems === 'string') {
      filePath = selectedItems
    } else if (selectedItems && typeof selectedItems === 'object') {
      // Пытаемся извлечь значение из Proxy объекта
      const obj = selectedItems as Record<string, unknown>
      if (obj && 'value' in obj && typeof obj.value === 'string') {
        filePath = obj.value
      }
    }
  }
  
  if (filePath && typeof filePath === 'string') {
    // Проверяем, что это файл, а не папка
    const isFile = !filePath.endsWith('/') && filePath.includes('.')
    
    if (isFile) {
      console.log('✅ Устанавливаем файл в активную панель:', filePath)
      // Устанавливаем файл в активную панель
      editorController.setActivePanelFile(filePath)
      
      // Проверяем результат
      console.log('📊 Состояние панелей после установки:')
      console.log('   Левая панель:', editorController.leftPanel.currentFile)
      console.log('   Правая панель:', editorController.rightPanel.currentFile)
      console.log('   Активная панель:', editorController.activePanel)
    } else {
      console.log('❌ Выбрана папка, файл не установлен:', filePath)
    }
  } else {
    console.log('❌ Не удалось извлечь путь к файлу из:', selectedItems)
  }
}

onMounted(async () => {
  console.log('🚀 TreeView: компонент смонтирован')
  try {
    console.log('📂 Начинаем загрузку структуры...')
    await editorController.fetchStructure()
    console.log('✅ Структура загружена успешно')
    console.log('📊 Количество элементов в дереве:', editorController.treeItems.length)
  } catch (err) {
    console.error('❌ Ошибка при загрузке структуры:', err)
  }
})
</script>

<style scoped>
.tree-view {
  min-height: 200px;
}
</style>
