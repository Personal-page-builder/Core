import { writeFile, mkdir, readdir, unlink, rmdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import unzipper from 'unzipper'

export default defineEventHandler(async (event) => {
  try {
    console.log('📦 API: Начинаем импорт markdown файлов')
    
    const body = await readBody(event)
    const { files } = body

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Файлы не предоставлены'
      })
    }

    const contentPath = join(process.cwd(), 'content')
    
    // Очищаем папку content
    console.log('🧹 API: Очищаем папку content')
    if (existsSync(contentPath)) {
      await clearDirectory(contentPath)
    }

    // Создаем структуру папок
    await mkdir(join(contentPath, 'en'), { recursive: true })
    await mkdir(join(contentPath, 'ru'), { recursive: true })

    let importedCount = 0

    // Обрабатываем каждый файл
    for (const file of files) {
      if (file.name && file.content) {
        try {
          // Правильно обрабатываем file.content
          let buffer: Buffer
          
          if (file.content instanceof Uint8Array) {
            buffer = Buffer.from(file.content)
          } else if (Array.isArray(file.content)) {
            buffer = Buffer.from(file.content)
          } else if (typeof file.content === 'string') {
            buffer = Buffer.from(file.content, 'base64')
          } else {
            console.error('❌ API: Неподдерживаемый тип file.content:', typeof file.content)
            continue
          }
          
          // Распаковываем ZIP
          const directory = await unzipper.Open.buffer(buffer)
          
          for (const entry of directory.files) {
            if (entry.type === 'File' && entry.path.endsWith('.md')) {
              const content = await entry.buffer()
              const filePath = entry.path
              
              // Определяем локаль из пути
              const pathParts = filePath.split('/')
              const locale = pathParts[0] // en или ru
              
              if (locale === 'en' || locale === 'ru') {
                // Убираем локаль из пути
                const relativePath = pathParts.slice(1).join('/')
                const fullPath = join(contentPath, locale, relativePath)
                
                // Создаем папки если нужно
                const dirPath = join(contentPath, locale, pathParts.slice(1, -1).join('/'))
                if (dirPath !== join(contentPath, locale)) {
                  await mkdir(dirPath, { recursive: true })
                }
                
                // Записываем файл
                await writeFile(fullPath, content, 'utf-8')
                importedCount++
                
                console.log(`📄 API: Импортирован файл: ${filePath}`)
              }
            }
          }
        } catch (error) {
          console.error('❌ API: Ошибка при обработке файла:', error)
        }
      }
    }

    console.log(`✅ API: Импортировано ${importedCount} файлов`)

    return {
      success: true,
      message: `Импортировано ${importedCount} файлов`,
      importedCount
    }

  } catch (error) {
    console.error('❌ API: Ошибка при импорте:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при импорте файлов'
    })
  }
})

async function clearDirectory(dirPath: string) {
  const items = await readdir(dirPath)
  
  for (const item of items) {
    const fullPath = join(dirPath, item)
    const stats = await stat(fullPath)
    
    if (stats.isDirectory()) {
      await clearDirectory(fullPath)
      await rmdir(fullPath)
    } else {
      await unlink(fullPath)
    }
  }
} 