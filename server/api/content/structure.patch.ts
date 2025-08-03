import { rename, stat, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

interface MoveRequest {
  oldPath: string
  newPath: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<MoveRequest>(event)
    const { oldPath, newPath } = body

    if (!oldPath || !newPath) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Старый и новый пути обязательны'
      })
    }

    const contentPath = join(process.cwd(), 'content', 'en')
    const fullOldPath = join(contentPath, oldPath)
    const fullNewPath = join(contentPath, newPath)

    // Проверяем, что пути находятся в пределах content/en
    if (!fullOldPath.startsWith(contentPath) || !fullNewPath.startsWith(contentPath)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Недопустимый путь'
      })
    }

    // Проверяем, что исходный элемент существует
    if (!existsSync(fullOldPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Исходный элемент не найден'
      })
    }

    // Проверяем, что целевой элемент не существует
    if (existsSync(fullNewPath)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Целевой элемент уже существует'
      })
    }

    const stats = await stat(fullOldPath)
    const isDirectory = stats.isDirectory()

    // Проверяем, что файл имеет расширение .md
    if (!isDirectory && !newPath.endsWith('.md')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Поддерживаются только .md файлы'
      })
    }

    // Создаем родительскую директорию если нужно
    const newDir = dirname(fullNewPath)
    if (!existsSync(newDir)) {
      await mkdir(newDir, { recursive: true })
    }

    // Перемещаем/переименовываем элемент
    await rename(fullOldPath, fullNewPath)

    return {
      success: true,
      message: `${isDirectory ? 'Папка' : 'Файл'} ${oldPath.includes('/') ? 'перемещен' : 'переименован'} успешно`
    }
  } catch (error) {
    console.error('Ошибка перемещения/переименования элемента:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при перемещении/переименовании элемента'
    })
  }
}) 