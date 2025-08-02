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

interface Panel {
  id: 'left' | 'right'
  mode: 'edit' | 'preview'
  locale: string
  currentFile: string | null
  title: string
}

export const useEditorController = defineStore('editorController', () => {
  // Навигация
  const showNavigation = ref(true)
  const fixedNavigation = ref(false)
  
  // Локали
  const currentLocale = ref('en')
  const showDualLocale = ref(false)
  const primaryLocale = ref('en')
  
  // Предпросмотр
  const showPreview = ref(false)
  
  // Текущий файл
  const currentFile = ref<string | null>(null)
  
  // Активная панель
  const activePanel = ref<'left' | 'right'>('left')
  
  // Панели
  const leftPanel = ref<Panel>({
    id: 'left',
    mode: 'edit',
    locale: 'en',
    currentFile: null,
    title: 'edit'
  })
  
  const rightPanel = ref<Panel>({
    id: 'right',
    mode: 'preview',
    locale: 'en',
    currentFile: null,
    title: 'preview'
  })

  // Получение доступных панелей
  const availablePanels = computed(() => {
    const panels: ('left' | 'right')[] = ['left']
    if (showDualLocale.value) {
      panels.push('right')
    }
    return panels
  })

  // Автоматическое переключение активной панели при скрытии
  watch(showDualLocale, (newValue) => {
    if (!newValue && activePanel.value === 'right') {
      // Если правая панель скрывается и она была активной, переключаемся на левую
      activePanel.value = 'left'
    }
  })

  // Структура контента
  const structure = ref<FileNode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  // Методы управления навигацией
  const toggleNavigation = () => {
    showNavigation.value = !showNavigation.value
  }

  const toggleFixedNavigation = () => {
    fixedNavigation.value = !fixedNavigation.value
  }

  // Методы управления локалями
  const setCurrentLocale = (locale: string) => {
    currentLocale.value = locale
  }

  const toggleDualLocale = () => {
    showDualLocale.value = !showDualLocale.value
  }

  const setPrimaryLocale = (locale: string) => {
    primaryLocale.value = locale
  }

  // Методы управления предпросмотром
  const togglePreview = () => {
    showPreview.value = !showPreview.value
  }

  // Методы управления файлами
  const setCurrentFile = (filePath: string | null) => {
    currentFile.value = filePath
  }

  // Методы управления панелями
  const setActivePanel = (panelId: 'left' | 'right') => {
    // Проверяем, что панель доступна
    if (availablePanels.value.includes(panelId)) {
      activePanel.value = panelId
    }
  }

  const setPanelMode = (panelId: 'left' | 'right', mode: 'edit' | 'preview') => {
    if (panelId === 'left') {
      leftPanel.value.mode = mode
      leftPanel.value.title = mode
    } else {
      rightPanel.value.mode = mode
      rightPanel.value.title = mode
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
    if (panelId === 'left') {
      leftPanel.value.currentFile = filePath
    } else {
      rightPanel.value.currentFile = filePath
    }
  }

  // Установка файла в активную панель
  const setActivePanelFile = (filePath: string | null) => {
    setPanelFile(activePanel.value, filePath)
  }

  const getPanelTitle = (panelId: 'left' | 'right'): string => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    if (panel.currentFile) {
      const fileName = panel.currentFile.split('/').pop() || panel.currentFile
      return `${panel.title} - ${fileName}`
    }
    return panel.title
  }

  // Получение уникальных файлов для рендера
  const getUniqueFiles = computed(() => {
    const files = new Set<string | null>()
    if (leftPanel.value.currentFile) files.add(leftPanel.value.currentFile)
    if (rightPanel.value.currentFile) files.add(rightPanel.value.currentFile)
    return Array.from(files)
  })

  return {
    // Навигация
    showNavigation,
    fixedNavigation,
    toggleNavigation,
    toggleFixedNavigation,
    
    // Локали
    currentLocale,
    showDualLocale,
    primaryLocale,
    setCurrentLocale,
    toggleDualLocale,
    setPrimaryLocale,
    
    // Предпросмотр
    showPreview,
    togglePreview,
    
    // Текущий файл
    currentFile,
    setCurrentFile,
    
    // Активная панель
    activePanel,
    availablePanels,
    setActivePanel,
    setActivePanelFile,
    
    // Панели
    leftPanel,
    rightPanel,
    setPanelMode,
    setPanelLocale,
    setPanelFile,
    getPanelTitle,
    getUniqueFiles,
    
    // Структура контента
    structure,
    loading,
    error,
    treeItems,
    fetchStructure
  }
}) 