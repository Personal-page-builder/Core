import { readdir, stat, readFile, mkdir } from 'fs/promises'
import { existsSync, createWriteStream, createReadStream } from 'fs'
import { join } from 'path'
import archiver from 'archiver'

interface MarkdownFile {
  path: string
  content: string
  locale: string
  mtime: Date
}

async function scanMarkdownFiles(dirPath: string, basePath: string = '', locale: string): Promise<MarkdownFile[]> {
  const items = await readdir(dirPath)
  const files: MarkdownFile[] = []

  for (const item of items) {
    const fullPath = join(dirPath, item)
    const relativePath = join(basePath, item)
    const stats = await stat(fullPath)

    if (stats.isDirectory()) {
      const children = await scanMarkdownFiles(fullPath, relativePath, locale)
      files.push(...children)
    } else if (item.endsWith('.md')) {
      const content = await readFile(fullPath, 'utf-8')
      files.push({
        path: relativePath,
        content,
        locale,
        mtime: stats.mtime
      })
    }
  }

  return files
}

async function shouldRebuildArchive(): Promise<boolean> {
  const exportPath = join(process.cwd(), '.data', 'export_md.zip')
  
  // Если файл не существует, нужно создать
  if (!existsSync(exportPath)) {
    return true
  }

  try {
    const archiveStats = await stat(exportPath)
    const contentPath = join(process.cwd(), 'content')
    const locales = ['en', 'ru']

    // Проверяем все markdown файлы на изменения
    for (const locale of locales) {
      const localePath = join(contentPath, locale)
      if (existsSync(localePath)) {
        const files = await scanMarkdownFiles(localePath, '', locale)
        
        for (const file of files) {
          // Если файл был изменен после создания архива, нужно пересобрать
          if (file.mtime > archiveStats.mtime) {
            console.log(`📦 API: Файл ${file.path} изменен, пересобираем архив`)
            return true
          }
        }
      }
    }

    return false
  } catch (error) {
    console.error('❌ API: Ошибка при проверке изменений:', error)
    return true
  }
}

async function buildArchive(): Promise<void> {
  console.log('📦 API: Создаем архив markdown файлов')
  
  const contentPath = join(process.cwd(), 'content')
  const exportDir = join(process.cwd(), '.data')
  const exportPath = join(exportDir, 'export_md.zip')
  
  // Создаем папку .data если не существует
  if (!existsSync(exportDir)) {
    await mkdir(exportDir, { recursive: true })
  }

  const locales = ['en', 'ru']
  const allFiles: MarkdownFile[] = []

  // Сканируем все локали
  for (const locale of locales) {
    const localePath = join(contentPath, locale)
    if (existsSync(localePath)) {
      const files = await scanMarkdownFiles(localePath, '', locale)
      allFiles.push(...files)
    }
  }

  console.log(`📦 API: Найдено ${allFiles.length} markdown файлов`)

  // Создаем архив
  const archive = archiver('zip', {
    zlib: { level: 9 }
  })

  // Создаем поток для записи файла
  const output = createWriteStream(exportPath)
  
  // Подключаем архив к потоку
  archive.pipe(output)

  // Добавляем файлы в архив
  for (const file of allFiles) {
    const archivePath = `${file.locale}/${file.path}`
    archive.append(file.content, { name: archivePath })
  }

  // Ждем завершения записи
  await new Promise<void>((resolve, reject) => {
    output.on('close', () => {
      console.log('✅ API: Архив создан успешно')
      resolve()
    })
    
    archive.on('error', (err) => {
      console.error('❌ API: Ошибка при создании архива:', err)
      reject(err)
    })
    
    archive.finalize()
  })
}

export default defineEventHandler(async (event) => {
  try {
    console.log('📦 API: Проверяем необходимость пересборки архива')
    
    // Проверяем нужно ли пересобрать архив
    const needsRebuild = await shouldRebuildArchive()
    
    if (needsRebuild) {
      await buildArchive()
    } else {
      console.log('📦 API: Архив актуален, используем существующий')
    }

    const exportPath = join(process.cwd(), '.data', 'export_md.zip')
    
    // Проверяем что файл существует
    if (!existsSync(exportPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Архив не найден'
      })
    }

    // Устанавливаем заголовки для скачивания
    setHeader(event, 'Content-Type', 'application/zip')
    setHeader(event, 'Content-Disposition', 'attachment; filename="markdown-export.zip"')

    // Отправляем файл
    return sendStream(event, createReadStream(exportPath))

  } catch (error) {
    console.error('❌ API: Ошибка при экспорте:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при создании архива'
    })
  }
}) 