<template>
  <ClientOnly>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('admin.gallery.title') }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('admin.gallery.description') }}
            </p>
          </div>

          <!-- Загрузчик изображений -->
          <UCard class="mb-8">
            <template #header>
              <h3 class="text-lg font-semibold">{{ t('admin.gallery.upload.title') }}</h3>
            </template>
            <ImageUploader
              @upload="handleUpload"
            />
          </UCard>

          <!-- Статистика -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <UCard>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ totalImages }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('admin.gallery.stats.total') }}</div>
              </div>
            </UCard>
            <UCard>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ totalSize }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('admin.gallery.stats.size') }}</div>
              </div>
            </UCard>
            <UCard>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ todayUploads }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('admin.gallery.stats.today') }}</div>
              </div>
            </UCard>
            <UCard>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">{{ averageSize }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('admin.gallery.stats.average') }}</div>
              </div>
            </UCard>
          </div>

          <!-- Загрузка -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
              <span>{{ t('admin.gallery.loading') }}</span>
            </div>
          </div>

          <!-- Ошибка -->
          <div v-else-if="error" class="text-center py-8">
            <p class="text-red-600 dark:text-red-400">{{ error }}</p>
            <UButton
              color="primary"
              variant="soft"
              class="mt-4"
              @click="loadImages"
            >
              {{ t('admin.gallery.retry') }}
            </UButton>
          </div>

          <!-- Сетка изображений -->
          <div v-else-if="images.length > 0">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold">{{ t('admin.gallery.grid.title') }}</h3>
              <div class="flex gap-2">
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  icon="i-lucide-download"
                  @click="exportGallery"
                >
                  {{ t('admin.gallery.actions.export') }}
                </UButton>
                <UButton
                  color="error"
                  variant="soft"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="clearGallery"
                >
                  {{ t('admin.gallery.actions.clear') }}
                </UButton>
              </div>
            </div>
            <GalleryGrid :images="images" :show-delete="true" @delete="handleDelete" />
          </div>

          <!-- Пустое состояние -->
          <div v-else class="text-center py-8">
            <UIcon name="i-lucide-image" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {{ t('admin.gallery.empty.title') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('admin.gallery.empty.description') }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div class="text-center">
          <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin mx-auto mb-4" />
          <p class="text-gray-600 dark:text-gray-400">Загрузка галереи...</p>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import ImageUploader from '~/component/gallery/ImageUploader.vue'
import GalleryGrid from '~/component/gallery/GalleryGrid.vue'

const { t } = useI18n()

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

const loading = ref(false)
const error = ref('')
const images = ref<GalleryImage[]>([])

// Вычисляемые свойства для статистики
const totalImages = computed(() => images.value.length)
const totalSize = computed(() => {
  const total = images.value.reduce((sum, img) => sum + img.size, 0)
  return formatFileSize(total)
})
const todayUploads = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return images.value.filter(img => {
    const uploadDate = new Date(img.uploadedAt)
    uploadDate.setHours(0, 0, 0, 0)
    return uploadDate.getTime() === today.getTime()
  }).length
})
const averageSize = computed(() => {
  if (images.value.length === 0) return '0 KB'
  const total = images.value.reduce((sum, img) => sum + img.size, 0)
  return formatFileSize(total / images.value.length)
})

const loadImages = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<{ success: boolean; data?: GalleryImage[]; error?: string }>('/api/gallery/list')
    
    if (response.success && response.data) {
      images.value = response.data
    } else {
      error.value = response.error || t('admin.gallery.loadError')
    }
  } catch (err) {
    console.error('Ошибка загрузки изображений:', err)
    error.value = t('admin.gallery.loadError')
  } finally {
    loading.value = false
  }
}

const handleUpload = async (files: File[]) => {
  const toast = useToast()
  const toastResult = toast.add({
    title: t('admin.gallery.upload.title'),
    description: t('admin.gallery.upload.uploading'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })

  try {
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      const response = await $fetch<{ success: boolean; data?: { filename: string; originalName: string; size: number; width: number; height: number }; error?: string }>('/api/gallery/upload', {
        method: 'POST',
        body: {
          image: Array.from(uint8Array),
          originalName: file.name
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Ошибка загрузки')
      }
    }

    toast.update(toastResult.id, {
      title: t('admin.gallery.upload.success'),
      description: t('admin.gallery.upload.successDescription'),
      color: 'success',
      icon: 'i-lucide-check'
    })

    await loadImages()
  } catch (err) {
    console.error('Ошибка загрузки:', err)
    toast.update(toastResult.id, {
      title: t('admin.gallery.upload.error'),
      description: t('admin.gallery.upload.errorDescription'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}

const handleDelete = async (imageId: string) => {
  const toast = useToast()
  const toastResult = toast.add({
    title: t('admin.gallery.delete.title'),
    description: t('admin.gallery.delete.deleting'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })

  try {
    const response = await $fetch<{ success: boolean; error?: string }>('/api/gallery/delete', {
      method: 'POST',
      body: { id: imageId }
    })

    if (response.success) {
      // Удаляем изображение из локального списка
      images.value = images.value.filter(img => img.id !== imageId)
      
      toast.update(toastResult.id, {
        title: t('admin.gallery.delete.success'),
        description: t('admin.gallery.delete.successDescription'),
        color: 'success',
        icon: 'i-lucide-check'
      })
    } else {
      throw new Error(response.error || 'Ошибка удаления')
    }
  } catch (err) {
    console.error('Ошибка удаления:', err)
    toast.update(toastResult.id, {
      title: t('admin.gallery.delete.error'),
      description: t('admin.gallery.delete.errorDescription'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}

const exportGallery = () => {
  const link = document.createElement('a')
  link.href = '/api/gallery/export'
  link.download = 'gallery-export.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const clearGallery = async () => {
  if (!confirm(t('admin.gallery.clear.confirm'))) return
  
  const toast = useToast()
  const toastResult = toast.add({
    title: t('admin.gallery.clear.title'),
    description: t('admin.gallery.clear.clearing'),
    color: 'info',
    icon: 'i-lucide-loader-2'
  })

  try {
    const response = await $fetch<{ success: boolean; deletedCount?: number; error?: string }>('/api/gallery/clear', {
      method: 'POST'
    })

    if (response.success) {
      images.value = []
      
      toast.update(toastResult.id, {
        title: t('admin.gallery.clear.success'),
        description: t('admin.gallery.clear.successDescription'),
        color: 'success',
        icon: 'i-lucide-check'
      })
    } else {
      throw new Error(response.error || 'Ошибка очистки')
    }
  } catch (err) {
    console.error('Ошибка очистки:', err)
    toast.update(toastResult.id, {
      title: t('admin.gallery.clear.error'),
      description: t('admin.gallery.clear.errorDescription'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}

// Форматирование размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Загружаем изображения при монтировании
onMounted(() => {
  loadImages()
})
</script> 