import { readdir, stat } from 'fs/promises'
import { join } from 'path'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
}

async function scanDirectory(dirPath: string, basePath: string = ''): Promise<FileNode[]> {
  const items = await readdir(dirPath)
  const nodes: FileNode[] = []

  for (const item of items) {
    const fullPath = join(dirPath, item)
    const relativePath = join(basePath, item)
    const stats = await stat(fullPath)

    if (stats.isDirectory()) {
      const children = await scanDirectory(fullPath, relativePath)
      nodes.push({
        name: item,
        type: 'directory',
        path: relativePath,
        children
      })
    } else {
      nodes.push({
        name: item,
        type: 'file',
        path: relativePath
      })
    }
  }

  return nodes
}

export default defineEventHandler(async () => {
  try {
    const contentPath = join(process.cwd(), 'content', 'en')
    const structure = await scanDirectory(contentPath)
    
    return {
      success: true,
      data: structure
    }
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении структуры папки content/en'
    })
  }
}) 