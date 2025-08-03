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
    // Проверяем, содержит ли путь уже локаль
    const hasLocale = path.startsWith('en/') || path.startsWith('ru/')
    let finalPath: string
    
    if (hasLocale) {
      // Если путь уже содержит локаль, используем его как есть
      finalPath = join(process.cwd(), 'content', path)
      console.log('📂 API: Путь уже содержит локаль, используем как есть')
    } else {
      // Если локаль отсутствует, добавляем её
      finalPath = join(process.cwd(), 'content', locale, path)
      console.log('📂 API: Добавлена локаль к пути')
    }
    
    console.log('📂 API: Полный путь к файлу:', finalPath)
    
    // Проверяем существование файла
    if (!existsSync(finalPath)) {
      console.log('❌ API: Файл не найден:', finalPath)
      return {
        success: false,
        error: `Файл не найден: ${finalPath}`
      }
    }

    // Проверяем что это файл, а не папка
    const stats = await stat(finalPath)
    if (!stats.isFile()) {
      console.log('❌ API: Путь ведет к папке, а не к файлу:', finalPath)
      return {
        success: false,
        error: `Путь ведет к папке: ${path}`
      }
    }

    console.log('✅ API: Файл найден, читаем содержимое...')
    // Читаем содержимое файла
    const content = await readFile(finalPath, 'utf-8')
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