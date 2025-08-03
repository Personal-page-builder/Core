<!-- TODO: IMPROVE FUNCTIONALITY -->
<template>
  <ClientOnly>
    <div class="gallery-page">
      <div class="container mx-auto px-4 py-8">
        <!-- Заголовок -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ t('gallery.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            {{ t('gallery.description') }}
          </p>
        </div>

        <!-- Загрузчик изображений -->
        <UCard class="mb-8">
          <template #header>
            <h3 class="text-lg font-semibold">{{ t('gallery.upload.title') }}</h3>
          </template>
          <ImageUploader
            @upload="handleUpload"
          />
        </UCard>

        <!-- Загрузка -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
            <span>{{ t('gallery.loading') }}</span>
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
            {{ t('gallery.retry') }}
          </UButton>
        </div>

        <!-- Сетка изображений -->
        <div v-else-if="images.length > 0">
          <GalleryGrid :images="images" />
        </div>

        <!-- Пустое состояние -->
        <div v-else class="text-center py-8">
          <UIcon name="i-lucide-image" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {{ t('gallery.empty.title') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('gallery.empty.description') }}
          </p>
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

// Загрузка изображений
const loadImages = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<{ success: boolean; data?: GalleryImage[]; error?: string }>('/api/gallery/list')
    
    if (response.success && response.data) {
      images.value = response.data
    } else {
      error.value = response.error || t('gallery.loadError')
    }
  } catch (err) {
    console.error('Ошибка загрузки изображений:', err)
    error.value = t('gallery.loadError')
  } finally {
    loading.value = false
  }
}

// Загрузка файлов
const handleUpload = async (files: File[]) => {
  const toast = useToast()
  const toastResult = toast.add({
    title: t('gallery.upload.title'),
    description: t('gallery.upload.uploading'),
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
      title: t('gallery.upload.success'),
      description: t('gallery.upload.successDescription'),
      color: 'success',
      icon: 'i-lucide-check'
    })

    // Перезагружаем список изображений
    await loadImages()
  } catch (err) {
    console.error('Ошибка загрузки:', err)
    toast.update(toastResult.id, {
      title: t('gallery.upload.error'),
      description: t('gallery.upload.errorDescription'),
      color: 'error',
      icon: 'i-lucide-x'
    })
  }
}

// Загружаем изображения при монтировании
onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.dark .gallery-page {
  background-color: #0f172a;
}
</style> 