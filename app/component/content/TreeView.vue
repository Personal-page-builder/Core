<template>
  <div v-if="loading" class="p-4">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
    <span class="ml-2">Загрузка...</span>
  </div>
  
  <div v-else-if="error" class="p-4">
    Ошибка загрузки структуры контента
  </div>
  
  <div v-else class="p-4">
    <UTree
      :items="treeItems"
      @select="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditorController } from '~/store/EditorController'
import type { TreeItem } from '@nuxt/ui'

const editorController = useEditorController()
const { t: _t } = useI18n()

const isClient = computed(() => typeof window !== 'undefined')

const loading = computed(() => editorController.loading)
const error = computed(() => editorController.error)

const leftPanelFile = computed(() => editorController.leftPanel.currentFile)
const rightPanelFile = computed(() => editorController.rightPanel.currentFile)

const treeItems = computed(() => {
  if (!isClient.value) {
    return []
  }
  return convertToTreeItemsWithIndicators(editorController.treeItems)
})

const truncateFileName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name
  
  const extension = name.includes('.') ? name.split('.').pop() : ''
  const nameWithoutExt = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name
  
  if (extension) {
    const availableLength = maxLength - extension.length - 3
    const truncatedName = nameWithoutExt.substring(0, availableLength) + '...'
    return truncatedName + '.' + extension
  } else {
    return name.substring(0, maxLength - 3) + '...'
  }
}

const convertToTreeItemsWithIndicators = (items: TreeItem[]): TreeItem[] => {
  return items.map(item => {
    const customItem = { ...item }
    
    if (item.value) {
      const fullPath = item.value as string
      const pathParts = fullPath.split('/')
      const fileName = pathParts[pathParts.length - 1] || fullPath
      const truncatedName = truncateFileName(fileName)
      
      if (!item.children) {
        const isInLeft = leftPanelFile.value === fullPath
        const isInRight = rightPanelFile.value === fullPath
        const isModified = editorController.isFileModified(fullPath, 'en')
        
        let indicators = ''
        if (isInLeft && isInRight) {
          indicators = ' [L-R]'
        } else if (isInLeft) {
          indicators = ' [L]'
        } else if (isInRight) {
          indicators = ' [R]'
        }
        
        if (isModified) {
          indicators += ' [M]'
        }
        
        customItem.label = `${truncatedName}${indicators}`
        customItem.title = fullPath
        
        if (isModified && isClient.value) {
          customItem.suffix = {
            icon: 'i-lucide-rotate-ccw',
            color: 'error',
            variant: 'soft',
            size: 'xs',
            title: 'Отменить изменения',
            onClick: () => {
              console.log('🔄 Откат изменений для файла:', fullPath)
              editorController.revertFileChanges(fullPath, 'en')
            }
          }
        }
      } else {
        customItem.label = truncatedName
        customItem.title = fullPath
      }
    }
    
    if (item.children && item.children.length > 0) {
      customItem.children = convertToTreeItemsWithIndicators(item.children)
    }
    
    return customItem
  })
}

const handleFileSelect = (selectedItems: string | undefined) => {
  console.log('🔍 TreeView: handleFileSelect вызван')
  console.log('📁 Выбранный элемент:', selectedItems)
  console.log('🎯 Активная панель:', editorController.activePanel)
  
  if (selectedItems && typeof selectedItems === 'string') {
    console.log('📝 Устанавливаем файл в активную панель:', selectedItems)
    editorController.setActivePanelFile(selectedItems)
  }
}

const _handleSelection = (selectedItems: string | undefined) => {
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
