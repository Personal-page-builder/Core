import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface DeleteResponse {
  success: boolean
  error?: string
}

export default defineEventHandler(async (event): Promise<DeleteResponse> => {
  try {
    console.log('📸 API: Удаление изображения')
    
    const body = await readBody(event)
    const { id } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID изображения не предоставлен'
      })
    }

    const galleryDir = join(process.cwd(), 'public', 'gallery')
    const thumbnailsDir = join(process.cwd(), 'public', 'gallery', 'thumbnails')

    const imagePath = join(galleryDir, `${id}.webp`)
    const thumbnailPath = join(thumbnailsDir, `${id}_thumb.webp`)

    // Удаляем основное изображение
    if (existsSync(imagePath)) {
      await unlink(imagePath)
      console.log(`✅ API: Удалено изображение ${id}.webp`)
    }

    // Удаляем превью
    if (existsSync(thumbnailPath)) {
      await unlink(thumbnailPath)
      console.log(`✅ API: Удалено превью ${id}_thumb.webp`)
    }

    return {
      success: true
    }

  } catch (error) {
    console.error('❌ API: Ошибка при удалении изображения:', error)
    return {
      success: false,
      error: 'Ошибка при удалении изображения'
    }
  }
}) 