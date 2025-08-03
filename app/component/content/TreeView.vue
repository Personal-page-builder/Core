<template>
  <div v-if="loading" class="p-4">
    <UIcon name="i-lucide-rotate-ccw" class="w-6 h-6 animate-spin" />
    <span class="ml-2">{{ t('treeView.loading') }}</span>
  </div>
  
  <div v-else-if="error" class="p-4">
    {{ t('treeView.error') }}
  </div>
  
  <div v-else class="p-4">
    <div class="flex gap-2 mb-4">
      <UModal 
      :title="t('treeView.createFile.title')"
      :description="t('treeView.createFile.description')"
      :ui="{ content: 'max-w-[500px] max-h-[300px] min-w-[400px] min-h-[200px]' }"
    >
      <UButton
          icon="i-lucide-plus"
          variant="ghost"
          size="xl"
          :title="t('treeView.createFile.title')"
        />
        
      <template #body>
        <div class="flex flex-col gap-4 p-4">
          <UForm :state="formState" :validate="validateForm" class="space-y-4">
            <UFormField :label="t('treeView.createFile.newName')" name="fileName">
              <UInput
                v-model="formState.fileName"
                :placeholder="t('treeView.createFile.placeholder')"
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
            {{ t('treeView.createFile.create') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Кнопка экспорта -->
    <ClientOnly>
      <UButton
        icon="i-lucide-download"
        variant="ghost"
        size="xl"
        :title="t('treeView.actions.export')"
        @click="handleExport"
      />
    </ClientOnly>

    <!-- Кнопка импорта -->
    <ClientOnly>
      <UButton
        icon="i-lucide-upload"
        variant="ghost"
        size="xl"
        :title="t('treeView.actions.import')"
        @click="handleImport"
      />
    </ClientOnly>

    <!-- Скрытый input для загрузки файла -->
    <ClientOnly>
      <input
        ref="fileInput"
        type="file"
        accept=".zip"
        style="display: none"
        @change="handleFileUpload"
      />
    </ClientOnly>
      
    </div>
    
    <ClientOnly>
      <UTree
        v-model="selectedFile"
        class="pt-8"
        :items="treeItems"
        @update:model-value="handleFileSelect"
      >
        <template #item-trailing="{ item }">
          <div class="flex items-center gap-1">
            <UIcon 
              v-if="item.children && item.children.length > 0"
              :name="item.defaultExpanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              class="w-4 h-4 text-gray-500"
            />
            
            <div class="flex items-center gap-1">
              <UBadge 
                v-if="getItemStatus(item).isInLeft" 
                color="primary" 
                variant="soft" 
                size="xs"
              >
                {{ t('treeView.status.left') }}
              </UBadge>
              <UBadge 
                v-if="getItemStatus(item).isInRight" 
                color="success" 
                variant="soft" 
                size="xs"
              >
                {{ t('treeView.status.right') }}
              </UBadge>
              <UBadge 
                v-if="getItemStatus(item).isModified" 
                color="warning" 
                variant="soft" 
                size="xs"
              >
                {{ t('treeView.status.modified') }}
              </UBadge>
            </div>
            
            <div class="flex items-center gap-1">

              <UModal 
              v-model="showRenameDialog"
              :title="t('treeView.rename.title', { type: itemToRename?.children ? t('treeView.rename.folder') : t('treeView.rename.file') })"
              :description="t('treeView.rename.description', { type: itemToRename?.children ? t('treeView.rename.folder') : t('treeView.rename.file') })"
              :ui="{ content: 'max-w-[500px] max-h-[300px] min-w-[400px] min-h-[200px]' }"
              >
              
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-edit-3"
                  :title="t('treeView.actions.rename')"
                  @click.stop="handleRename(item)"
                />
                
                <template #body>
                  <div class="flex flex-col gap-4 p-4">
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        <strong>
                          {{ t('treeView.rename.fullPath') }}:
                        </strong> {{ itemToRename?.value }}
                      </p>
                      <p>
                        <strong>
                          {{ t('treeView.rename.type') }}:
                        </strong> {{ itemToRename?.children ?
                        t('treeView.rename.folder') :
                        t('treeView.rename.file') }}
                      </p>
                    </div>
                    <UForm :state="renameFormState" :validate="validateRenameForm" class="space-y-4">
                      <UFormField :label="t('treeView.rename.newName')" name="newName">
                        <UInput
                        v-model="renameFormState.newName"
                        :placeholder="itemToRename?.value"
                        />
                      </UFormField>
                    </UForm>
                  </div>
                </template>
                
                <template #footer>
                  <div class="flex gap-2">
                    <UButton
                    :disabled="!isValidRenameName || renameNameExists"
                    @click="handleRenameConfirm"
                    >
                    {{ t('treeView.rename.rename') }}
                  </UButton>
                  <UButton
                  color="neutral"
                  variant="soft"
                  @click="showRenameDialog = false"
                  >
                  {{ t('treeView.rename.cancel') }}
                </UButton>
              </div>
            </template>
          </UModal>
          
          <UModal 
          v-model="showDeleteDialog"
          :title="t('treeView.delete.title', { type: itemToDelete?.children ? t('treeView.rename.folder') : t('treeView.rename.file') })"
          :description="getDeleteDescription()"
          :ui="{ content: 'max-w-[500px] max-h-[300px] min-w-[400px] min-h-[200px]' }"
          >
          
            <UButton
              color="error"
              variant="ghost"
              size="xs"
              icon="i-lucide-trash-2"
              :title="t('treeView.actions.delete')"
              @click.stop="handleDelete(item)"
            />
            
            <template #body>
              <div class="p-4">
                <div class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <p>
                    <strong>
                      {{ t('treeView.delete.fullPath') }}:
                    </strong> {{ itemToDelete?.value }}
                  </p>
                  <p>
                    <strong>
                      {{ t('treeView.delete.type') }}:
                    </strong> {{ itemToDelete?.children ?
                      t('treeView.rename.folder') : 
                      t('treeView.rename.file') }}
                  </p>
                  
                  <div 
                    v-if="itemToDelete?.children" 
                    class="mt-3 p-3 
                      bg-warning 
                      border 
                      border-warning 
                      rounded">
                      <p class="font-medium">
                        {{ t('treeView.delete.warning') }}
                      </p>
                      <p class="text-xs">
                        {{ t('treeView.delete.folderWarning', { count: getFolderFileCount(itemToDelete) }) }}
                      </p>
                    </div>
                  </div>
                </div>
            </template>
            
            <template #footer>
              <div class="flex gap-2">
                <UButton
                  color="error"
                  @click="handleDeleteConfirm"
                >
                  {{ t('treeView.delete.delete') }}
                </UButton>
                
                <UButton
                  color="neutral"
                  variant="soft"
                  @click="showDeleteDialog = false"
                >
                  {{ t('treeView.delete.cancel') }}
                </UButton>
              </div>
            </template>
          </UModal>
                
                <!-- TODO: Реализовать drag & drop для перемещения файлов/папок
                - Добавить draggable атрибут к элементам дерева
                - Обработчики dragstart, dragover, drop
                - Визуальная индикация зоны drop
                - API для перемещения файлов между папками
                -->
              </div>
            </div>
          </template>
        </UTree>
      </ClientOnly>
      
      
      
    </div>
  </template>

<script setup lang="ts">
import { useEditorController } from '~/store/EditorController'
import type { TreeItem } from '@nuxt/ui'

const editorController = useEditorController()
const { t } = useI18n()

const isClient = computed(() => typeof window !== 'undefined')

const loading = computed(() => editorController.loading)
const error = computed(() => editorController.error)

const leftPanelFile = computed(() => editorController.leftPanel.currentFile)
const rightPanelFile = computed(() => editorController.rightPanel.currentFile)

// Состояние для создания файла
const showCreateDialog = ref(false)

// Состояние для переименования
const showRenameDialog = ref(false)
const itemToRename = ref<TreeItem | null>(null)
const renameFormState = reactive({
  oldName: '',
  newName: ''
})

// Состояние для удаления
const showDeleteDialog = ref(false)
const itemToDelete = ref<TreeItem | null>(null)

// Состояние для выбранного файла
const selectedFile = ref<string | undefined>(undefined)

// Ссылка на input для загрузки файла
const fileInput = ref<HTMLInputElement>()

// Функция экспорта
const handleExport = async () => {
  if (!isClient.value) return
  
  const toast = useToast()
  const toastResult = toast.add({
    title: t('treeView.export.title'),
    description: t('treeView.export.downloading'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })

  try {
    // Создаем ссылку для скачивания
    const link = document.createElement('a')
    link.href = '/api/content/export'
    link.download = 'markdown-export.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.update(toastResult.id, {
      title: t('treeView.export.title'),
      description: t('treeView.export.success'),
      color: 'success',
      icon: 'i-lucide-check'
    })
  } catch (error) {
    console.error('❌ Ошибка экспорта:', error)
    toast.update(toastResult.id, {
      title: t('error.titles.default'),
      description: t('treeView.export.error'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}

// Функция импорта
const handleImport = () => {
  if (!isClient.value) return
  
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Функция обработки выбора файла
const handleFileUpload = async (event: Event) => {
  if (!isClient.value) return
  
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  const toast = useToast()
  const toastResult = toast.add({
    title: t('treeView.import.title'),
    description: t('treeView.import.uploading'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })

  try {
    // Читаем файл как ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Отправляем файл на сервер
    const response = await $fetch<{ success: boolean; message: string; importedCount?: number }>('/api/content/import', {
      method: 'POST',
      body: {
        files: [{ name: file.name, content: Array.from(uint8Array) }]
      }
    })

    if (response.success) {
      toast.update(toastResult.id, {
        title: t('treeView.import.title'),
        description: t('treeView.import.importedCount', { count: response.importedCount || 0 }),
        color: 'success',
        icon: 'i-lucide-check'
      })

      // Ждем немного и перезагружаем страницу
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      throw new Error(response.message || 'Ошибка импорта')
    }
  } catch (error) {
    console.error('❌ Ошибка импорта:', error)
    toast.update(toastResult.id, {
      title: t('error.titles.default'),
      description: t('treeView.import.error'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }

  // Очищаем input
  if (target) {
    target.value = ''
  }
}

// Форма состояния
const formState = reactive({
  fileName: ''
})

// Валидация имени файла для переименования
const pathRegex = /^[a-zA-Z0-9_/.-]+$/

// Валидация имени файла для создания
const isValidFileName = computed(() => {
  const value = formState.fileName.trim()
  
  if (!value) return false
  
  // Проверяем, что путь заканчивается на / или .md
  if (!value.endsWith('/') && !value.endsWith('.md')) return false
  
  // Если это файл (заканчивается на .md), проверяем весь путь
  if (value.endsWith('.md')) {
    return pathRegex.test(value)
  }
  
  // Если это папка (заканчивается на /), проверяем путь
  if (value.endsWith('/')) {
    const path = value.slice(0, -1) // убираем последний /
    return pathRegex.test(path)
  }
  
  return false
})

const fileExists = computed(() => {
  if (!formState.fileName || !isValidFileName.value) return false
  const fileName = formState.fileName.trim()
  
  // Убираем первый слеш если есть
  const normalizedFileName = fileName.startsWith('/') ? fileName.slice(1) : fileName
  
  const exists = editorController.structure.some(item => {
    if (item.path === normalizedFileName) return true
    if (item.children) {
      return item.children.some(child => child.path === normalizedFileName)
    }
    return false
  })
  
  return exists
})

// Функция валидации формы создания
const validateForm = (state: { fileName: string }) => {
  const errors = []
  if (!state.fileName) {
    errors.push({ name: 'fileName', message: t('treeView.createFile.fileNameRequired') })
  } else {
    const value = state.fileName.trim()
    
    if (!value.endsWith('/') && !value.endsWith('.md')) {
      errors.push({ name: 'fileName', message: t('treeView.createFile.invalidPath') })
    } else if (value.endsWith('.md')) {
      const isValid = pathRegex.test(value)
      if (!isValid) {
        errors.push({ name: 'fileName', message: t('treeView.createFile.invalidCharacters') })
      }
    } else if (value.endsWith('/')) {
      const path = value.slice(0, -1)
      const isValid = pathRegex.test(path)
      if (!isValid) {
        errors.push({ name: 'fileName', message: t('treeView.createFile.invalidCharacters') })
      }
    }
  }
  
  if (fileExists.value) {
    errors.push({ name: 'fileName', message: t('treeView.createFile.fileExists') })
  }
  
  return errors
}

const getItemStatus = (item: TreeItem) => {
  if (!item.value) return { isInLeft: false, isInRight: false, isModified: false }
  
  const fullPath = item.value as string
  
  const normalizedFullPath = fullPath.startsWith('/') ? fullPath.slice(1) : fullPath
  const normalizedLeftPath = leftPanelFile.value ? (leftPanelFile.value.startsWith('/') ? leftPanelFile.value.slice(1) : leftPanelFile.value) : null
  const normalizedRightPath = rightPanelFile.value ? (rightPanelFile.value.startsWith('/') ? rightPanelFile.value.slice(1) : rightPanelFile.value) : null
  
  const { locales } = useI18n()
  const localeKeys = locales.value.map(locale => typeof locale === 'string' ? locale : locale.code)
  const localePattern = localeKeys.join('|')
  const localeRegex = new RegExp(`^(${localePattern})/`)
  
  const fullPathWithoutLocale = localeRegex.test(normalizedFullPath)
    ? normalizedFullPath.split('/').slice(1).join('/') 
    : normalizedFullPath
  const leftPathWithoutLocale = normalizedLeftPath ? (localeRegex.test(normalizedLeftPath)
    ? normalizedLeftPath.split('/').slice(1).join('/') 
    : normalizedLeftPath) : null
  const rightPathWithoutLocale = normalizedRightPath ? (localeRegex.test(normalizedRightPath)
    ? normalizedRightPath.split('/').slice(1).join('/') 
    : normalizedRightPath) : null
  
  const isInLeft = leftPathWithoutLocale === fullPathWithoutLocale
  const isInRight = rightPathWithoutLocale === fullPathWithoutLocale
  
  const activeLocale = editorController.activePanel === 'left' 
    ? editorController.leftPanel.locale 
    : editorController.rightPanel.locale
  
  const pathWithLocale = `${activeLocale}/${normalizedFullPath}`
  const isModified = editorController.isFileModified(pathWithLocale, activeLocale)
  
  return { isInLeft, isInRight, isModified }
}

const isValidRenameName = computed(() => {
  const value = renameFormState.newName.trim()
  
  if (!value) return false
  
  if (!value.endsWith('/') && !value.endsWith('.md')) return false
  
  if (value.endsWith('.md')) {
    return pathRegex.test(value)
  }
  
  if (value.endsWith('/')) {
    const path = value.slice(0, -1)
    return pathRegex.test(path)
  }
  
  return false
})

const renameNameExists = computed(() => {
  if (!renameFormState.newName || !isValidRenameName.value) return false
  const newName = renameFormState.newName.trim()
  
  const normalizedNewName = newName.startsWith('/') ? newName.slice(1) : newName
  
  const exists = editorController.structure.some(item => {
    if (item.path === normalizedNewName) return true
    if (item.children) {
      return item.children.some(child => child.path === normalizedNewName)
    }
    return false
  })
  
  return exists
})

const validateRenameForm = (state: { newName: string }) => {
  const errors = []
  if (!state.newName) {
    errors.push({ name: 'newName', message: t('treeView.rename.newNameRequired') })
  } else {
    const value = state.newName.trim()
    
    if (!value.endsWith('/') && !value.endsWith('.md')) {
      errors.push({ name: 'newName', message: t('treeView.createFile.invalidPath') })
    } else if (value.endsWith('.md')) {
      const isValid = pathRegex.test(value)
      if (!isValid) {
        errors.push({ name: 'newName', message: t('treeView.createFile.invalidCharacters') })
      }
    } else if (value.endsWith('/')) {
      const path = value.slice(0, -1)
      const isValid = pathRegex.test(path)
      if (!isValid) {
        errors.push({ name: 'newName', message: t('treeView.createFile.invalidCharacters') })
      }
    }
  }
  
  if (renameNameExists.value) {
    errors.push({ name: 'newName', message: t('treeView.createFile.fileExists') })
  }
  
  return errors
}

const handleRename = (item: TreeItem) => {
  itemToRename.value = item
  renameFormState.oldName = item.label || ''
  renameFormState.newName = item.value || ''
  showRenameDialog.value = true
}

const handleRenameConfirm = async () => {
  if (!itemToRename.value || !isValidRenameName.value || renameNameExists.value) return
  
  const oldPath = itemToRename.value.value as string
  const newName = renameFormState.newName.trim()
  
  const normalizedOldPath = oldPath.startsWith('/') ? oldPath.slice(1) : oldPath
  const normalizedNewName = newName.startsWith('/') ? newName.slice(1) : newName
  
  const toast = useToast()
  const toastResult = toast.add({
    title: t('treeView.rename.rename'),
    description: t('common.loading'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })
  
  try {
    const response = await $fetch<{ success: boolean; message: string }>('/api/content/structure', {
      method: 'PATCH',
      body: {
        oldPath: normalizedOldPath,
        newPath: normalizedNewName
      }
    })
    
    if (response.success) {
      await editorController.fetchStructure()
      showRenameDialog.value = false
      renameFormState.newName = ''
      itemToRename.value = null
      
      toast.update(toastResult.id, {
        title: t('treeView.rename.rename'),
        description: t('treeView.rename.success'),
        color: 'success',
        icon: 'i-lucide-check'
      })
    }
  } catch (err) {
    console.error('❌ Ошибка переименования:', err)
    toast.update(toastResult.id, {
      title: t('error.titles.default'),
      description: t('treeView.rename.error'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}

const handleDelete = (item: TreeItem) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const handleDeleteConfirm = async () => {
  if (!itemToDelete.value) return
  
  const path = itemToDelete.value.value as string
  
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  
  const toast = useToast()
  const toastResult = toast.add({
    title: t('treeView.delete.delete'),
    description: t('common.loading'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })
  
  try {
    const response = await $fetch<{ success: boolean; message: string }>('/api/content/structure', {
      method: 'DELETE',
      body: {
        path: normalizedPath
      }
    })
    
    if (response.success) {
      await editorController.fetchStructure()
      showDeleteDialog.value = false
      itemToDelete.value = null
      
      toast.update(toastResult.id, {
        title: t('treeView.delete.delete'),
        description: t('treeView.delete.success'),
        color: 'success',
        icon: 'i-lucide-check'
      })
    }
  } catch (err) {
    console.error('❌ Ошибка удаления:', err)
    toast.update(toastResult.id, {
      title: t('error.titles.default'),
      description: t('treeView.delete.error'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}

// TODO: Реализовать drag & drop для перемещения файлов/папок
// - Добавить draggable атрибут к элементам дерева
// - Обработчики dragstart, dragover, drop
// - Визуальная индикация зоны drop
// - API для перемещения файлов между папками

// Функция для получения описания удаления
const getDeleteDescription = () => {
  if (!itemToDelete.value) return ''
  
  if (itemToDelete.value.children) {
    return t('treeView.delete.description', { 
      type: t('treeView.rename.folder'), 
      name: itemToDelete.value.label 
    })
  } else {
    return t('treeView.delete.description', { 
      type: t('treeView.rename.file'), 
      name: itemToDelete.value.label 
    })
  }
}

// Функция для подсчета файлов в папке
const getFolderFileCount = (item: { children?: unknown[] }): number => {
  if (!item.children || !Array.isArray(item.children)) return 0
  
  return item.children.length
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
        const normalizedFullPath = fullPath.startsWith('/') ? fullPath.slice(1) : fullPath
        const normalizedLeftPath = leftPanelFile.value ? (leftPanelFile.value.startsWith('/') ? leftPanelFile.value.slice(1) : leftPanelFile.value) : null
        const normalizedRightPath = rightPanelFile.value ? (rightPanelFile.value.startsWith('/') ? rightPanelFile.value.slice(1) : rightPanelFile.value) : null
        
        const { locales } = useI18n()
        const localeKeys = locales.value.map(locale => typeof locale === 'string' ? locale : locale.code)
        const localePattern = localeKeys.join('|')
        const localeRegex = new RegExp(`^(${localePattern})/`)
        
        const fullPathWithoutLocale = localeRegex.test(normalizedFullPath)
          ? normalizedFullPath.split('/').slice(1).join('/') 
          : normalizedFullPath
        const leftPathWithoutLocale = normalizedLeftPath ? (localeRegex.test(normalizedLeftPath)
          ? normalizedLeftPath.split('/').slice(1).join('/') 
          : normalizedLeftPath) : null
        const rightPathWithoutLocale = normalizedRightPath ? (localeRegex.test(normalizedRightPath)
          ? normalizedRightPath.split('/').slice(1).join('/') 
          : normalizedRightPath) : null
        
        const isInLeft = leftPathWithoutLocale === fullPathWithoutLocale
        const isInRight = rightPathWithoutLocale === fullPathWithoutLocale
        
        const activeLocale = editorController.activePanel === 'left' 
          ? editorController.leftPanel.locale 
          : editorController.rightPanel.locale
        
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
          fileKey: `${pathWithLocale}_${activeLocale}`,
          hasModifiedFile: editorController.modifiedFiles[`${pathWithLocale}_${activeLocale}`] ? 'yes' : 'no'
        })
        
        customItem.label = truncatedName
        customItem.title = fullPath
        
        if (isModified && isClient.value) {
          customItem.suffix = {
            icon: 'i-lucide-rotate-ccw',
            color: 'error',
            variant: 'soft',
            size: 'xs',
            title: t('treeView.actions.revertChanges'),
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
  
  let path = isDirectory ? fileName.slice(0, -1) : fileName
  path = path.startsWith('/') ? path.slice(1) : path
  
  console.log('🚀 Создание элемента:', { fileName, type, path })
  
  const toast = useToast()
  const toastResult = toast.add({
    title: t('treeView.createFile.create'),
    description: t('common.loading'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })
  
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
      
      toast.update(toastResult.id, {
        title: t('treeView.createFile.create'),
        description: t('treeView.createFile.success'),
        color: 'success',
        icon: 'i-lucide-check'
      })
    }
  } catch (err) {
    console.error('❌ Ошибка создания файла:', err)
    toast.update(toastResult.id, {
      title: t('error.titles.default'),
      description: t('treeView.createFile.error'),
      color: 'error',
      icon: 'i-lucide-x'
    })
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
        console.log('�� Добавлена локаль к пути:', finalPath)
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
