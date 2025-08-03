import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import JSZip from 'jszip'

export default defineEventHandler(async (event) => {
  try {
    console.log('📸 API: Экспорт галереи')
    
    const galleryDir = join(process.cwd(), 'public', 'gallery')
    const thumbnailsDir = join(process.cwd(), 'public', 'gallery', 'thumbnails')

    if (!existsSync(galleryDir)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Галерея пуста'
      })
    }

    const zip = new JSZip()
    const files = await readdir(galleryDir)
    const imageFiles = files.filter(file => 
      file.endsWith('.webp') && !file.includes('_thumb')
    )

    if (imageFiles.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Галерея пуста'
      })
    }

    // Добавляем изображения в ZIP
    for (const filename of imageFiles) {
      try {
        const filePath = join(galleryDir, filename)
        const fileContent = await readFile(filePath)
        zip.file(filename, fileContent)
        
        // Добавляем превью если существует
        const thumbnailName = filename.replace('.webp', '_thumb.webp')
        const thumbnailPath = join(thumbnailsDir, thumbnailName)
        if (existsSync(thumbnailPath)) {
          const thumbnailContent = await readFile(thumbnailPath)
          zip.file(`thumbnails/${thumbnailName}`, thumbnailContent)
        }
      } catch (err) {
        console.error(`Ошибка добавления файла ${filename} в ZIP:`, err)
      }
    }

    // Генерируем ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    console.log(`✅ API: Экспорт завершен, ${imageFiles.length} файлов`)

    // Устанавливаем заголовки для скачивания
    setHeader(event, 'Content-Type', 'application/zip')
    setHeader(event, 'Content-Disposition', 'attachment; filename="gallery-export.zip"')
    setHeader(event, 'Content-Length', zipBuffer.length)

    return zipBuffer

  } catch (error) {
    console.error('❌ API: Ошибка при экспорте галереи:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при экспорте галереи'
    })
  }
}) 