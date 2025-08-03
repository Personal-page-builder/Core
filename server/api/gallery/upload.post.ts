import { mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

interface UploadResponse {
  success: boolean
  data?: {
    filename: string
    originalName: string
    size: number
    width: number
    height: number
  }
  error?: string
}

export default defineEventHandler(async (event): Promise<UploadResponse> => {
  try {
    console.log('📸 API: Начинаем загрузку изображения')
    
    const body = await readBody(event)
    const { image, originalName } = body

    if (!image || !originalName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Изображение не предоставлено'
      })
    }

    // Создаем папки если не существуют
    const publicDir = join(process.cwd(), 'public')
    const galleryDir = join(publicDir, 'gallery')
    const thumbnailsDir = join(publicDir, 'gallery', 'thumbnails')

    if (!existsSync(galleryDir)) {
      await mkdir(galleryDir, { recursive: true })
    }
    if (!existsSync(thumbnailsDir)) {
      await mkdir(thumbnailsDir, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const fileId = randomUUID()
    const filename = `${fileId}.webp`
    const thumbnailFilename = `${fileId}_thumb.webp`

    // Пути к файлам
    const fullImagePath = join(galleryDir, filename)
    const thumbnailPath = join(thumbnailsDir, thumbnailFilename)

    // Конвертируем base64 в буфер
    let imageBuffer: Buffer
    if (typeof image === 'string') {
      // Убираем data:image/...;base64, если есть
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '')
      imageBuffer = Buffer.from(base64Data, 'base64')
    } else if (Array.isArray(image)) {
      imageBuffer = Buffer.from(image)
    } else {
      throw new Error('Неподдерживаемый формат изображения')
    }

    // Получаем метаданные изображения
    const metadata = await sharp(imageBuffer).metadata()
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Не удалось получить размеры изображения')
    }

    // Создаем полное изображение в webp
    await sharp(imageBuffer)
      .webp({ quality: 90 })
      .toFile(fullImagePath)

    // Создаем превью (сжатое качество)
    await sharp(imageBuffer)
      .resize(300, 300, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 70 })
      .toFile(thumbnailPath)

    console.log(`✅ API: Изображение загружено: ${filename}`)

    return {
      success: true,
      data: {
        filename,
        originalName,
        size: imageBuffer.length,
        width: metadata.width,
        height: metadata.height
      }
    }

  } catch (error) {
    console.error('❌ API: Ошибка при загрузке изображения:', error)
    return {
      success: false,
      error: 'Ошибка при загрузке изображения'
    }
  }
}) 