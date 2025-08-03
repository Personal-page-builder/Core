import { mkdir, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

interface CreateRequest {
  path: string
  type: 'file' | 'directory'
  content?: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateRequest>(event)
    const { path, type, content } = body

    if (!path) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Путь обязателен'
      })
    }

    const contentPath = join(process.cwd(), 'content', 'en')
    const fullPath = join(contentPath, path)

    // Проверяем, что путь находится в пределах content/en
    if (!fullPath.startsWith(contentPath)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Недопустимый путь'
      })
    }

    // Проверяем, что файл имеет расширение .md
    if (type === 'file' && !path.endsWith('.md')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Поддерживаются только .md файлы'
      })
    }

    // Проверяем, что элемент не существует
    if (existsSync(fullPath)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Элемент уже существует'
      })
    }

    if (type === 'directory') {
      // Создаем папку
      await mkdir(fullPath, { recursive: true })
    } else {
      // Создаем файл
      const dir = dirname(fullPath)
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
      
      const fileContent = content || '# Новый файл\n\nДобавьте содержимое здесь.'
      await writeFile(fullPath, fileContent, 'utf-8')
    }

    return {
      success: true,
      message: `${type === 'directory' ? 'Папка' : 'Файл'} создан успешно`
    }
  } catch (error) {
    console.error('Ошибка создания элемента:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при создании элемента'
    })
  }
}) 