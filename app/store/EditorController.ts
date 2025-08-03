import type { TreeItem } from '@nuxt/ui'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
}

interface ContentStructure {
  success: boolean
  data: FileNode[]
}

interface FileContent {
  path: string
  locale: string
  originalContent: string
  modifiedContent: string
  isModified: boolean
  lastModified: number
}

interface Panel {
  id: 'left' | 'right'
  mode: 'edit' | 'preview'
  locale: string
  currentFile: string | null
  title: string
  loading?: boolean
  error?: string | null
}

export const useEditorController = defineStore('editorController', () => {
  const showNavigation = ref(true)
  const fixedNavigation = ref(false)
  
  const currentLocale = ref('en')
  const showDualLocale = ref(false)
  const primaryLocale = ref('en')
  
  // TODO: Make preview interactive on client side
  const showPreview = ref(false)
  
  const currentFile = ref<string | null>(null)
  
  const activePanel = ref<'left' | 'right'>('left')
  
  const leftPanel = ref<Panel>({
    id: 'left',
    mode: 'edit',
    locale: 'en',
    currentFile: null,
    title: '',
    loading: false,
    error: null
  })
  
  const rightPanel = ref<Panel>({
    id: 'right',
    mode: 'preview',
    locale: 'en',
    currentFile: null,
    title: '',
    loading: false,
    error: null
  })

  const availablePanels = computed(() => {
    const panels: ('left' | 'right')[] = ['left']
    if (showDualLocale.value) {
      panels.push('right')
    }
    return panels
  })

  watch(showDualLocale, (newValue) => {
    if (!newValue && activePanel.value === 'right') {
      activePanel.value = 'left'
    }
  })

  const structure = ref<FileNode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const modifiedFiles = ref<Record<string, FileContent>>({})
  const hasUnsavedChanges = computed(() => Object.keys(modifiedFiles.value).length > 0)

  const fetchStructure = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<ContentStructure>('/api/content/structure')
      structure.value = response.data
    } catch (err) {
      error.value = 'Ошибка при загрузке структуры контента'
      console.error('Ошибка загрузки структуры:', err)
    } finally {
      loading.value = false
    }
  }

  const convertToTreeItems = (nodes: FileNode[]): TreeItem[] => {
    return nodes.map(node => {
      const item: TreeItem = {
        label: node.name,
        value: node.path,
        icon: node.type === 'directory' ? 'i-lucide-folder' : 'i-lucide-file',
        defaultExpanded: node.type === 'directory'
      }

      if (node.children && node.children.length > 0) {
        item.children = convertToTreeItems(node.children)
      }

      return item
    })
  }

  const treeItems = computed(() => {
    return convertToTreeItems(structure.value)
  })

  const toggleNavigation = () => {
    showNavigation.value = !showNavigation.value
  }

  const toggleFixedNavigation = () => {
    fixedNavigation.value = !fixedNavigation.value
  }

  const setCurrentLocale = (locale: string) => {
    currentLocale.value = locale
  }

  const toggleDualLocale = () => {
    showDualLocale.value = !showDualLocale.value
  }

  const setPrimaryLocale = (locale: string) => {
    primaryLocale.value = locale
  }

  // TODO: Make preview interactive on client side
  const togglePreview = () => {
    showPreview.value = !showPreview.value
  }

  const setCurrentFile = (filePath: string | null) => {
    currentFile.value = filePath
  }

  const loadMarkdownContent = async (panelId: 'left' | 'right', filePath: string, locale: string) => {
    console.log('🚀 EditorController: Загрузка markdown контента')
    console.log('📋 Панель:', panelId)
    console.log('📁 Файл:', filePath)
    console.log('🌍 Локаль:', locale)
    
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    const fileKey = getFileKey(filePath, locale)
    
    const existingFile = modifiedFiles.value[fileKey]
    
    if (existingFile) {
      console.log('📄 Используем сохраненный контент для файла:', fileKey)
      panel.loading = false
      panel.error = null
      return
    }
    
    panel.loading = true
    panel.error = null
    
    try {
      console.log('📡 Отправка запроса к API...')
      const response = await $fetch('/api/content/markdown', {
        query: {
          path: filePath,
          locale
        }
      })
      
      console.log('✅ EditorController: Ответ получен')
      console.log('📊 Успех:', response.success)
      
      if (response.success && response.data) {
        console.log('📄 Контент загружен, длина:', response.data.content.length)
        
        const fileContent: FileContent = {
          path: filePath,
          locale,
          originalContent: response.data.content,
          modifiedContent: response.data.content,
          isModified: false,
          lastModified: Date.now()
        }
        modifiedFiles.value[fileKey] = fileContent
        
        console.log('💾 Контент сохранен в панель:', panelId)
      } else {
        console.log('❌ Ошибка загрузки:', response.error)
        panel.error = response.error || 'Ошибка загрузки контента'
      }
    } catch (err) {
      console.error('❌ EditorController: Ошибка при загрузке markdown:', err)
      panel.error = 'Ошибка при загрузке файла'
    } finally {
      panel.loading = false
      console.log('🏁 EditorController: Загрузка завершена для панели:', panelId)
    }
  }

  const updatePanelContent = (panelId: 'left' | 'right', content: string) => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    
    if (panel.currentFile) {
      const fileKey = `${panel.currentFile}_${panel.locale}`
      const existingFile = modifiedFiles.value[fileKey]
      
      if (existingFile) {
        existingFile.modifiedContent = content
        existingFile.isModified = content !== existingFile.originalContent
        existingFile.lastModified = Date.now()
        modifiedFiles.value[fileKey] = existingFile
      } else {
        const fileContent: FileContent = {
          path: panel.currentFile,
          locale: panel.locale,
          originalContent: content,
          modifiedContent: content,
          isModified: false,
          lastModified: Date.now()
        }
        modifiedFiles.value[fileKey] = fileContent
      }
      
      console.log('📝 Файл обновлен:', fileKey, 'Изменен:', existingFile?.isModified || false)
    }
  }

  const getFileKey = (filePath: string, locale: string): string => {
    const fileKey = `${filePath}_${locale}`
    console.log('🔑 getFileKey:', { filePath, locale, fileKey })
    return fileKey
  }

  const isFileModified = (filePath: string, locale: string): boolean => {
    const fileKey = getFileKey(filePath, locale)
    const fileContent = modifiedFiles.value[fileKey]
    const isModified = fileContent?.isModified || false
    
    console.log('🔍 isFileModified:', {
      filePath,
      locale,
      fileKey,
      fileContent: fileContent ? 'exists' : 'not found',
      isModified
    })
    
    return isModified
  }

  const revertFileChanges = (filePath: string, locale: string) => {
    const fileKey = getFileKey(filePath, locale)
    const fileContent = modifiedFiles.value[fileKey]
    
    if (fileContent) {
      fileContent.modifiedContent = fileContent.originalContent
      fileContent.isModified = false
      fileContent.lastModified = Date.now()
      modifiedFiles.value[fileKey] = fileContent
      
      console.log('🔄 Изменения откачены для файла:', fileKey)
    }
  }

  const saveFile = async (fileContent: FileContent) => {
    try {
      const response = await $fetch<{ success: boolean }>('/api/content/markdown', {
        method: 'PUT',
        body: {
          path: fileContent.path,
          locale: fileContent.locale,
          content: fileContent.modifiedContent
        }
      })
      
      return response.success
    } catch (err) {
      console.error('❌ Ошибка сохранения файла:', err)
      return false
    }
  }

  const saveAllChanges = async () => {
    console.log('💾 Сохранение всех изменений...')
    
    for (const [fileKey, fileContent] of Object.entries(modifiedFiles.value)) {
      if (fileContent.isModified) {
        const success = await saveFile(fileContent)
        
        if (success) {
          fileContent.originalContent = fileContent.modifiedContent
          fileContent.isModified = false
          fileContent.lastModified = Date.now()
          modifiedFiles.value[fileKey] = fileContent
          
          console.log('✅ Файл сохранен:', fileKey)
        } else {
          console.log('❌ Ошибка сохранения файла:', fileKey)
        }
      }
    }
    
    console.log('🏁 Сохранение завершено')
  }

  const setActivePanel = (panelId: 'left' | 'right') => {
    if (availablePanels.value.includes(panelId)) {
      activePanel.value = panelId
    }
  }

  const setPanelMode = (panelId: 'left' | 'right', mode: 'edit' | 'preview') => {
    if (panelId === 'left') {
      leftPanel.value.mode = mode
    } else {
      rightPanel.value.mode = mode
    }
  }

  const setPanelLocale = (panelId: 'left' | 'right', locale: string) => {
    if (panelId === 'left') {
      leftPanel.value.locale = locale
    } else {
      rightPanel.value.locale = locale
    }
  }

  const setPanelFile = (panelId: 'left' | 'right', filePath: string | null) => {
    console.log('🔧 setPanelFile вызван:', { panelId, filePath })
    
    if (panelId === 'left') {
      console.log('📝 Устанавливаем файл в левую панель:', filePath)
      leftPanel.value.currentFile = filePath
      if (filePath) {
        loadMarkdownContent('left', filePath, leftPanel.value.locale)
      }
    } else {
      console.log('📝 Устанавливаем файл в правую панель:', filePath)
      rightPanel.value.currentFile = filePath
      if (filePath) {
        loadMarkdownContent('right', filePath, rightPanel.value.locale)
      }
    }
    
    console.log('📊 Состояние панелей после setPanelFile:')
    console.log('   Левая панель:', leftPanel.value.currentFile)
    console.log('   Правая панель:', rightPanel.value.currentFile)
  }

  const setActivePanelFile = (filePath: string | null) => {
    console.log('🎯 setActivePanelFile вызван:', { filePath, activePanel: activePanel.value })
    setPanelFile(activePanel.value, filePath)
  }

  const getPanelTitle = (panelId: 'left' | 'right'): string => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    if (panel.currentFile && typeof panel.currentFile === 'string') {
      return `${panel.mode} - ${panel.currentFile}`
    }
    return panel.mode
  }

  const getUniqueFiles = computed(() => {
    const files = new Set<string | null>()
    if (leftPanel.value.currentFile) files.add(leftPanel.value.currentFile)
    if (rightPanel.value.currentFile) files.add(rightPanel.value.currentFile)
    return Array.from(files)
  })

  const getFileContent = (filePath: string, locale: string): string => {
    const fileKey = getFileKey(filePath, locale)
    const fileContent = modifiedFiles.value[fileKey]
    return fileContent?.modifiedContent || ''
  }

  const getPanelContent = (panelId: 'left' | 'right'): string => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    if (!panel.currentFile) return ''
    return getFileContent(panel.currentFile, panel.locale)
  }

  const getPanelLoading = (panelId: 'left' | 'right'): boolean => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    return panel.loading || false
  }

  const getPanelError = (panelId: 'left' | 'right'): string | null => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    return panel.error || null
  }

  const createPageObject = (filePath: string, locale: string) => {
    const content = getFileContent(filePath, locale)
    if (!content) return null
    
    return {
      _path: filePath,
      _dir: filePath.split('/').slice(0, -1).join('/'),
      _draft: false,
      _partial: false,
      _empty: false,
      title: filePath.split('/').pop() || filePath,
      description: '',
      body: {
        type: 'root',
        children: [
          {
            type: 'element',
            tag: 'div',
            props: {},
            children: [
              {
                type: 'text',
                value: content
              }
            ]
          }
        ]
      },
      _id: filePath,
      _source: 'content',
      _file: filePath,
      _extension: 'md'
    }
  }

  return {
    showNavigation,
    fixedNavigation,
    toggleNavigation,
    toggleFixedNavigation,
    
    currentLocale,
    showDualLocale,
    primaryLocale,
    setCurrentLocale,
    toggleDualLocale,
    setPrimaryLocale,
    
    // TODO: Make preview interactive on client side
    showPreview,
    togglePreview,
    
    currentFile,
    setCurrentFile,
    
    activePanel,
    availablePanels,
    setActivePanel,
    setActivePanelFile,
    
    leftPanel,
    rightPanel,
    setPanelMode,
    setPanelLocale,
    setPanelFile,
    getPanelTitle,
    getUniqueFiles,
    loadMarkdownContent,
    updatePanelContent,
    isFileModified,
    revertFileChanges,
    saveAllChanges,
    saveFile,
    
    structure,
    loading,
    error,
    treeItems,
    fetchStructure,
    modifiedFiles,
    hasUnsavedChanges,
    getFileContent,
    getPanelContent,
    getPanelLoading,
    getPanelError,
    createPageObject
  }
}, {
  persist: true
}) 