import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface GalleryImage {
  id: string
  filename: string // URL к полному изображению
  thumbnail: string // URL к превью
  originalName: string
  size: number
  width: number
  height: number
  uploadedAt: string
}

interface ListResponse {
  success: boolean
  data?: GalleryImage[]
  error?: string
}

export default defineEventHandler(async (): Promise<ListResponse> => {
  try {
    console.log('📸 API: Получение списка изображений')
    
    const galleryDir = join(process.cwd(), 'public', 'gallery')
    const thumbnailsDir = join(process.cwd(), 'public', 'gallery', 'thumbnails')

    if (!existsSync(galleryDir)) {
      return {
        success: true,
        data: []
      }
    }

    const files = await readdir(galleryDir)
    const imageFiles = files.filter(file => 
      file.endsWith('.webp') && !file.includes('_thumb')
    )

    const images: GalleryImage[] = []

    for (const filename of imageFiles) {
      try {
        const filePath = join(galleryDir, filename)
        const stats = await stat(filePath)
        
        // Извлекаем ID из имени файла (убираем расширение)
        const id = filename.replace('.webp', '')
        const thumbnail = `${id}_thumb.webp`
        
        // Проверяем существование превью
        const thumbnailPath = join(thumbnailsDir, thumbnail)
        const thumbnailExists = existsSync(thumbnailPath)

        // Создаем URL для изображений
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3000'

        images.push({
          id,
          filename: `${baseUrl}/gallery/${filename}`, // URL к полному изображению
          thumbnail: thumbnailExists 
            ? `${baseUrl}/gallery/thumbnails/${thumbnail}` 
            : `${baseUrl}/gallery/${filename}`, // Fallback к полному изображению
          originalName: filename, // В реальном приложении можно хранить оригинальные имена в БД
          size: stats.size,
          width: 0, // Можно получить через sharp.metadata()
          height: 0,
          uploadedAt: new Date(stats.mtime).toISOString() // Правильно создаем объект Date
        })
      } catch (err) {
        console.error(`Ошибка обработки файла ${filename}:`, err)
      }
    }

    // Сортируем по дате загрузки (новые сначала)
    images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    console.log(`✅ API: Найдено ${images.length} изображений`)

    return {
      success: true,
      data: images
    }

  } catch (error) {
    console.error('❌ API: Ошибка при получении списка изображений:', error)
    return {
      success: false,
      error: 'Ошибка при получении списка изображений'
    }
  }
}) 