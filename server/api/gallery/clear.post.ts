import { readdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface ClearResponse {
  success: boolean
  deletedCount?: number
  error?: string
}

export default defineEventHandler(async (): Promise<ClearResponse> => {
  try {
    console.log('📸 API: Очистка галереи')
    
    const galleryDir = join(process.cwd(), 'public', 'gallery')
    const thumbnailsDir = join(process.cwd(), 'public', 'gallery', 'thumbnails')

    if (!existsSync(galleryDir)) {
      return {
        success: true,
        deletedCount: 0
      }
    }

    let deletedCount = 0

    // Удаляем все изображения
    const files = await readdir(galleryDir)
    const imageFiles = files.filter(file => 
      file.endsWith('.webp') && !file.includes('_thumb')
    )

    for (const filename of imageFiles) {
      try {
        const filePath = join(galleryDir, filename)
        await unlink(filePath)
        deletedCount++
        console.log(`✅ API: Удалено изображение ${filename}`)
      } catch (err) {
        console.error(`Ошибка удаления файла ${filename}:`, err)
      }
    }

    // Удаляем все превью
    if (existsSync(thumbnailsDir)) {
      const thumbnailFiles = await readdir(thumbnailsDir)
      const thumbnails = thumbnailFiles.filter(file => file.endsWith('.webp'))

      for (const filename of thumbnails) {
        try {
          const filePath = join(thumbnailsDir, filename)
          await unlink(filePath)
          console.log(`✅ API: Удалено превью ${filename}`)
        } catch (err) {
          console.error(`Ошибка удаления превью ${filename}:`, err)
        }
      }
    }

    console.log(`✅ API: Очистка завершена, удалено ${deletedCount} изображений`)

    return {
      success: true,
      deletedCount
    }

  } catch (error) {
    console.error('❌ API: Ошибка при очистке галереи:', error)
    return {
      success: false,
      error: 'Ошибка при очистке галереи'
    }
  }
}) 