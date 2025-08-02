import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface MarkdownResponse {
  success: boolean
  data?: {
    content: string
    path: string
    locale: string
  }
  error?: string
}

export default defineEventHandler(async (event): Promise<MarkdownResponse> => {
  try {
    const query = getQuery(event)
    const { locale = 'en', path } = query

    console.log('📡 API: Запрос markdown контента')
    console.log('📁 Путь:', path)
    console.log('🌍 Локаль:', locale)

    if (!path || typeof path !== 'string') {
      console.log('❌ API: Путь к файлу не указан')
      return {
        success: false,
        error: 'Путь к файлу не указан'
      }
    }

    if (!locale || typeof locale !== 'string') {
      console.log('❌ API: Язык не указан')
      return {
        success: false,
        error: 'Язык не указан'
      }
    }

    // Строим полный путь к файлу
    const contentPath = join(process.cwd(), 'content', locale, path)
    console.log('📂 API: Полный путь к файлу:', contentPath)
    
    // Проверяем существование файла
    if (!existsSync(contentPath)) {
      console.log('❌ API: Файл не найден:', contentPath)
      return {
        success: false,
        error: `Файл не найден: ${contentPath}`
      }
    }

    // Проверяем что это файл, а не папка
    const stats = await stat(contentPath)
    if (!stats.isFile()) {
      console.log('❌ API: Путь ведет к папке, а не к файлу:', contentPath)
      return {
        success: false,
        error: `Путь ведет к папке: ${path}`
      }
    }

    console.log('✅ API: Файл найден, читаем содержимое...')
    // Читаем содержимое файла
    const content = await readFile(contentPath, 'utf-8')
    console.log('📄 API: Контент прочитан, длина:', content.length)

    return {
      success: true,
      data: {
        content,
        path,
        locale
      }
    }

  } catch (error) {
    console.error('❌ API: Ошибка при чтении markdown файла:', error)
    return {
      success: false,
      error: 'Ошибка при чтении файла'
    }
  }
}) 