import { rm, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface DeleteRequest {
  path: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<DeleteRequest>(event)
    const { path } = body

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

    // Проверяем, что элемент существует
    if (!existsSync(fullPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Элемент не найден'
      })
    }

    const stats = await stat(fullPath)
    const isDirectory = stats.isDirectory()

    // Удаляем элемент
    await rm(fullPath, { recursive: true, force: true })

    return {
      success: true,
      message: `${isDirectory ? 'Папка' : 'Файл'} удален успешно`
    }
  } catch (error) {
    console.error('Ошибка удаления элемента:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при удалении элемента'
    })
  }
}) 