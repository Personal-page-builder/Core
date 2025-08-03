<template>
  <div v-if="loading" class="p-4">
    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
    <span class="ml-2">Загрузка...</span>
  </div>
  
  <div v-else-if="error" class="p-4">
    Ошибка загрузки структуры контента
  </div>
  
  <div v-else class="p-4">
    <div class="flex gap-2 mb-4">
      <UModal 
      title="Создать новый файл"
      description="Введите имя файла (только английские буквы, цифры, дефисы и подчеркивания)"
      :ui="{ content: 'max-w-[500px] max-h-[300px] min-w-[400px] min-h-[200px]' }"
    >
      <UButton
          icon="i-lucide-plus"
          variant="ghost"
          size="xl"
          :title="'Создать новый файл'"
          @click="showCreateDialog = true"
        />
        
      <template #body>
        <div class="flex flex-col gap-4 p-4">
          <UForm :state="formState" :validate="validateForm" class="space-y-4">
            <UFormField label="Имя файла" name="fileName">
              <UInput
                v-model="formState.fileName"
                placeholder="my-new-file.md или folder/"
              />
            </UFormField>
          </UForm>
        </div>
      </template>
      
      <template #footer>
        <div class="flex gap-2">
          <UButton
            @click="handleCreateFile"
            :disabled="!isValidFileName || fileExists"
          >
            Создать
          </UButton>
        </div>
      </template>
    </UModal>
      
    </div>
    
    <ClientOnly>
      <UTree
        class="pt-8"
        :items="treeItems"
        v-model="selectedFile"
        @update:model-value="handleFileSelect"
      />
    </ClientOnly>
    
    <!-- Модальное окно создания файла -->
    
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

// Состояние для создания файла
const showCreateDialog = ref(false)

// Состояние для выбранного файла
const selectedFile = ref<string | undefined>(undefined)

// Форма состояния
const formState = reactive({
  fileName: ''
})

// Валидация имени файла
const pathRegex = /^[a-zA-Z0-9_/.-]+$/
const isValidFileName = computed(() => {
  const value = formState.fileName.trim()
  console.log('🔍 Валидация файла:', value)
  
  if (!value) {
    console.log('❌ Пустое значение')
    return false
  }
  
  // Проверяем, что путь заканчивается на / или .md
  if (!value.endsWith('/') && !value.endsWith('.md')) {
    console.log('❌ Не заканчивается на / или .md')
    return false
  }
  
  // Если это файл (заканчивается на .md), проверяем весь путь
  if (value.endsWith('.md')) {
    const isValid = pathRegex.test(value)
    console.log('📄 Файл:', value, 'Валиден:', isValid)
    return isValid
  }
  
  // Если это папка (заканчивается на /), проверяем путь
  if (value.endsWith('/')) {
    const path = value.slice(0, -1) // убираем последний /
    const isValid = pathRegex.test(path)
    console.log('📁 Папка:', path, 'Валидна:', isValid)
    return isValid
  }
  
  console.log('❌ Неизвестный тип')
  return false
})

const fileExists = computed(() => {
  if (!formState.fileName || !isValidFileName.value) return false
  const fileName = formState.fileName.trim()
  
  // Убираем первый слеш если есть
  const normalizedFileName = fileName.startsWith('/') ? fileName.slice(1) : fileName
  
  console.log('🔍 Проверка существования:', fileName, 'Нормализованный:', normalizedFileName)
  
  const exists = editorController.structure.some(item => {
    // Проверяем точное совпадение
    if (item.path === normalizedFileName) {
      console.log('✅ Найдено точное совпадение:', item.path)
      return true
    }
    
    // Проверяем в дочерних элементах
    if (item.children) {
      const childExists = item.children.some(child => {
        if (child.path === normalizedFileName) {
          console.log('✅ Найдено в дочерних элементах:', child.path)
          return true
        }
        return false
      })
      if (childExists) return true
    }
    
    return false
  })
  
  console.log('🔍 Результат проверки существования:', normalizedFileName, 'Существует:', exists)
  return exists
})

// Функция валидации формы
const validateForm = (state: { fileName: string }) => {
  console.log('🔍 validateForm вызван с:', state.fileName)
  const errors = []
  if (!state.fileName) {
    console.log('❌ Ошибка: пустое имя файла')
    errors.push({ name: 'fileName', message: 'Имя файла обязательно' })
  } else {
    const value = state.fileName.trim()
    console.log('🔍 Проверяем значение:', value)
    
    if (!value.endsWith('/') && !value.endsWith('.md')) {
      console.log('❌ Ошибка: не заканчивается на / или .md')
      errors.push({ name: 'fileName', message: 'Путь должен заканчиваться на / (папка) или .md (файл)' })
    } else if (value.endsWith('.md')) {
      const isValid = pathRegex.test(value)
      console.log('📄 Проверка файла:', value, 'Валиден:', isValid)
      if (!isValid) {
        console.log('❌ Ошибка: невалидные символы в пути файла')
        errors.push({ name: 'fileName', message: 'Путь может содержать только английские буквы, цифры, дефисы, подчеркивания и /' })
      }
    } else if (value.endsWith('/')) {
      const path = value.slice(0, -1)
      const isValid = pathRegex.test(path)
      console.log('📁 Проверка папки:', path, 'Валидна:', isValid)
      if (!isValid) {
        console.log('❌ Ошибка: невалидные символы в пути папки')
        errors.push({ name: 'fileName', message: 'Путь может содержать только английские буквы, цифры, дефисы, подчеркивания и /' })
      }
    }
  }
  
  if (fileExists.value) {
    console.log('❌ Ошибка: файл или папка уже существует')
    errors.push({ name: 'fileName', message: 'Файл или папка с таким именем уже существует' })
  }
  
  console.log('🔍 Результат валидации:', errors)
  return errors
}

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
  console.log('🌳 TreeView: convertToTreeItemsWithIndicators вызван')
  console.log('📊 Количество элементов для обработки:', items.length)
  console.log('🔍 Текущие modifiedFiles:', Object.keys(editorController.modifiedFiles))
  
  return items.map(item => {
    const customItem = { ...item }
    
    if (item.value) {
      const fullPath = item.value as string
      const pathParts = fullPath.split('/')
      const fileName = pathParts[pathParts.length - 1] || fullPath
      const truncatedName = truncateFileName(fileName)
      
      if (!item.children) {
        // Нормализуем пути для корректного сравнения
        const normalizedFullPath = fullPath.startsWith('/') ? fullPath.slice(1) : fullPath
        const normalizedLeftPath = leftPanelFile.value ? (leftPanelFile.value.startsWith('/') ? leftPanelFile.value.slice(1) : leftPanelFile.value) : null
        const normalizedRightPath = rightPanelFile.value ? (rightPanelFile.value.startsWith('/') ? rightPanelFile.value.slice(1) : rightPanelFile.value) : null
        
        // Убираем локаль из путей для сравнения
        const fullPathWithoutLocale = normalizedFullPath.startsWith('en/') || normalizedFullPath.startsWith('ru/') 
          ? normalizedFullPath.split('/').slice(1).join('/') 
          : normalizedFullPath
        const leftPathWithoutLocale = normalizedLeftPath ? (normalizedLeftPath.startsWith('en/') || normalizedLeftPath.startsWith('ru/') 
          ? normalizedLeftPath.split('/').slice(1).join('/') 
          : normalizedLeftPath) : null
        const rightPathWithoutLocale = normalizedRightPath ? (normalizedRightPath.startsWith('en/') || normalizedRightPath.startsWith('ru/') 
          ? normalizedRightPath.split('/').slice(1).join('/') 
          : normalizedRightPath) : null
        
        const isInLeft = leftPathWithoutLocale === fullPathWithoutLocale
        const isInRight = rightPathWithoutLocale === fullPathWithoutLocale
        
        // Используем локаль из активной панели для проверки изменений
        const activeLocale = editorController.activePanel === 'left' 
          ? editorController.leftPanel.locale 
          : editorController.rightPanel.locale
        
        // Проверяем изменения используя путь с локалью
        const pathWithLocale = `${activeLocale}/${normalizedFullPath}`
        const isModified = editorController.isFileModified(pathWithLocale, activeLocale)
        
        console.log('🔍 Сравнение путей для статуса:', {
          fullPath,
          normalizedFullPath,
          fullPathWithoutLocale,
          leftPanelFile: leftPanelFile.value,
          leftPathWithoutLocale,
          rightPanelFile: rightPanelFile.value,
          rightPathWithoutLocale,
          isInLeft,
          isInRight,
          isModified,
          activeLocale,
          pathWithLocale,
          modifiedFiles: Object.keys(editorController.modifiedFiles),
          // Дополнительная отладка для изменений
          fileKey: `${pathWithLocale}_${activeLocale}`,
          hasModifiedFile: editorController.modifiedFiles[`${pathWithLocale}_${activeLocale}`] ? 'yes' : 'no'
        })
        
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
          console.log('✅ Файл помечен как измененный:', fullPath, 'Индикаторы:', indicators)
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
              console.log('🔄 Откат изменений для файла:', pathWithLocale)
              editorController.revertFileChanges(pathWithLocale, activeLocale)
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

const handleCreateFile = async () => {
  if (!formState.fileName.trim() || !isValidFileName.value || fileExists.value) return
  
  const fileName = formState.fileName.trim()
  const isDirectory = fileName.endsWith('/')
  const type = isDirectory ? 'directory' : 'file'
  
  // Нормализуем путь - убираем первый слеш если есть
  let path = isDirectory ? fileName.slice(0, -1) : fileName
  path = path.startsWith('/') ? path.slice(1) : path
  
  console.log('🚀 Создание элемента:', { fileName, type, path })
  
  try {
    const response = await $fetch<{ success: boolean; message: string }>('/api/content/structure', {
      method: 'POST',
      body: {
        path: path,
        type: type,
        content: type === 'file' ? '# Новый файл\n\nДобавьте содержимое здесь.' : undefined
      }
    })
    
    if (response.success) {
      console.log('✅ Элемент создан успешно')
      await editorController.fetchStructure()
      showCreateDialog.value = false
      formState.fileName = ''
    }
  } catch (err) {
    console.error('❌ Ошибка создания файла:', err)
  }
}

const handleFileSelect = (selectedItems: string | { value: string } | undefined) => {
  console.log('🔍 TreeView: handleFileSelect вызван')
  console.log('📁 Выбранный элемент:', selectedItems)
  console.log('🎯 Активная панель:', editorController.activePanel)
  
  // Извлекаем путь из объекта
  let filePath: string | null = null
  
  if (selectedItems) {
    if (typeof selectedItems === 'string') {
      filePath = selectedItems
    } else if (selectedItems && typeof selectedItems === 'object') {
      // Извлекаем value из Proxy объекта
      if (selectedItems.value && typeof selectedItems.value === 'string') {
        filePath = selectedItems.value
      }
    }
  }
  
  if (filePath && typeof filePath === 'string') {
    // Проверяем, что это файл, а не папка
    const isFile = !filePath.endsWith('/') && filePath.includes('.')
    console.log('📄 Это файл?', isFile, 'Путь:', filePath)
    
    if (isFile) {
      // Нормализуем путь - убираем первый слеш если есть
      const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
      console.log('📝 Исходный путь:', filePath)
      console.log('📝 Нормализованный путь:', normalizedPath)
      
      // Проверяем, содержит ли путь уже локаль
      const hasLocale = normalizedPath.startsWith('en/') || normalizedPath.startsWith('ru/')
      
      let finalPath: string
      if (hasLocale) {
        // Если путь уже содержит локаль, используем его как есть
        finalPath = normalizedPath
        console.log('📝 Путь уже содержит локаль:', finalPath)
      } else {
        // Если локаль отсутствует, добавляем её
        const activeLocale = editorController.activePanel === 'left' 
          ? editorController.leftPanel.locale 
          : editorController.rightPanel.locale
        finalPath = `${activeLocale}/${normalizedPath}`
        console.log('📝 Добавлена локаль к пути:', finalPath)
      }
      
      // Проверяем модификацию файла
      const activeLocale = editorController.activePanel === 'left' 
        ? editorController.leftPanel.locale 
        : editorController.rightPanel.locale
      const isModified = editorController.isFileModified(normalizedPath, activeLocale)
      console.log('🔍 Проверка модификации файла при выделении:', {
        normalizedPath,
        activeLocale,
        isModified,
        fileKey: `${normalizedPath}_${activeLocale}`,
        hasModifiedFile: editorController.modifiedFiles[`${normalizedPath}_${activeLocale}`] ? 'yes' : 'no'
      })
      
      console.log('✅ Устанавливаем файл в активную панель:', finalPath)
      console.log('🎯 Активная панель до установки:', editorController.activePanel)
      console.log('🌍 Локаль активной панели:', editorController.activePanel === 'left' 
        ? editorController.leftPanel.locale 
        : editorController.rightPanel.locale)
      
      editorController.setActivePanelFile(finalPath)
      console.log('✅ Файл установлен в панель:', editorController.activePanel)
      
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
