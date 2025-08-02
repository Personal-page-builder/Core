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
  content?: string
  loading?: boolean
  error?: string | null
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
    title: '',
    content: '',
    loading: false,
    error: null
  })
  
  const rightPanel = ref<Panel>({
    id: 'right',
    mode: 'preview',
    locale: 'en',
    currentFile: null,
    title: '',
    content: '',
    loading: false,
    error: null
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

  // Загрузка markdown контента
  const loadMarkdownContent = async (panelId: 'left' | 'right', filePath: string, locale: string) => {
    console.log('🚀 EditorController: Загрузка markdown контента')
    console.log('📋 Панель:', panelId)
    console.log('📁 Файл:', filePath)
    console.log('🌍 Локаль:', locale)
    
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    
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
        panel.content = response.data.content
        console.log('💾 Контент сохранен в панель:', panelId)
      } else {
        console.log('❌ Ошибка загрузки:', response.error)
        panel.error = response.error || 'Ошибка загрузки контента'
        panel.content = ''
      }
    } catch (err) {
      console.error('❌ EditorController: Ошибка при загрузке markdown:', err)
      panel.error = 'Ошибка при загрузке файла'
      panel.content = ''
    } finally {
      panel.loading = false
      console.log('🏁 EditorController: Загрузка завершена для панели:', panelId)
    }
  }

  // Обновление контента панели
  const updatePanelContent = (panelId: 'left' | 'right', content: string) => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    panel.content = content
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
      // Загружаем контент если файл установлен
      if (filePath) {
        loadMarkdownContent('left', filePath, leftPanel.value.locale)
      }
    } else {
      console.log('📝 Устанавливаем файл в правую панель:', filePath)
      rightPanel.value.currentFile = filePath
      // Загружаем контент если файл установлен
      if (filePath) {
        loadMarkdownContent('right', filePath, rightPanel.value.locale)
      }
    }
    
    console.log('📊 Состояние панелей после setPanelFile:')
    console.log('   Левая панель:', leftPanel.value.currentFile)
    console.log('   Правая панель:', rightPanel.value.currentFile)
  }

  // Установка файла в активную панель
  const setActivePanelFile = (filePath: string | null) => {
    console.log('🎯 setActivePanelFile вызван:', { filePath, activePanel: activePanel.value })
    setPanelFile(activePanel.value, filePath)
  }

  const getPanelTitle = (panelId: 'left' | 'right'): string => {
    const panel = panelId === 'left' ? leftPanel.value : rightPanel.value
    if (panel.currentFile && typeof panel.currentFile === 'string') {
      // Показываем полный путь файла
      return `${panel.mode} - ${panel.currentFile}`
    }
    return panel.mode
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
    loadMarkdownContent,
    updatePanelContent,
    
    // Структура контента
    structure,
    loading,
    error,
    treeItems,
    fetchStructure
  }
}) 