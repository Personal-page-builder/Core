import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

interface MarkdownUpdateRequest {
  path: string
  locale: string
  content: string
}

interface MarkdownUpdateResponse {
  success: boolean
  data?: {
    path: string
    locale: string
    content: string
  }
  error?: string
}

export default defineEventHandler(async (event): Promise<MarkdownUpdateResponse> => {
  try {
    const body = await readBody<MarkdownUpdateRequest>(event)
    const { path, locale, content } = body

    console.log('📝 API: Запрос на сохранение markdown файла')
    console.log('📁 Путь:', path)
    console.log('🌍 Локаль:', locale)
    console.log('📄 Длина контента:', content.length)

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

    if (!content || typeof content !== 'string') {
      console.log('❌ API: Контент не указан')
      return {
        success: false,
        error: 'Контент не указан'
      }
    }

    // Строим полный путь к файлу
    const contentPath = join(process.cwd(), 'content', locale, path)
    console.log('📂 API: Полный путь к файлу:', contentPath)
    
    // Создаем директорию если не существует
    const dir = dirname(contentPath)
    if (!existsSync(dir)) {
      console.log('📁 API: Создаем директорию:', dir)
      await mkdir(dir, { recursive: true })
    }

    console.log('💾 API: Сохраняем файл...')
    // Записываем содержимое файла
    await writeFile(contentPath, content, 'utf-8')
    console.log('✅ API: Файл успешно сохранен')

    return {
      success: true,
      data: {
        path,
        locale,
        content
      }
    }

  } catch (error) {
    console.error('❌ API: Ошибка при сохранении markdown файла:', error)
    return {
      success: false,
      error: 'Ошибка при сохранении файла'
    }
  }
}) 