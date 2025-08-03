<template>
  <ClientOnly>
  <div class="gallery-grid">
    <!-- Сетка изображений -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="image in images"
        :key="image.id"
        class="gallery-item group relative"
      >
        <!-- Превью изображения -->
        <img
          :src="image.thumbnail"
          :alt="image.originalName"
          class="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
          @click="openModal(image)"
        />
        
        <!-- Оверлей с кнопками -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton
              color="neutral"
              variant="solid"
              size="sm"
              icon="i-lucide-external-link"
              :title="t('gallery.actions.view')"
              @click="openModal(image)"
            />
            <UButton
              color="neutral"
              variant="solid"
              size="sm"
              icon="i-lucide-copy"
              :title="t('gallery.actions.copy')"
              @click="copyImageUrl(image)"
            />
            <UButton
              color="error"
              variant="solid"
              size="sm"
              icon="i-lucide-trash-2"
              :title="t('gallery.actions.delete')"
              @click="deleteImage(image.id)"
              v-if="showDelete"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для просмотра -->
    <UModal v-model="showModal">
      <div class="p-4 max-w-7xl">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-medium">{{ selectedImage?.originalName }}</h3>
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              icon="i-lucide-copy"
              @click="copyImageUrl(selectedImage!)"
            >
              {{ t('gallery.actions.copy') }}
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-x"
              @click="showModal = false"
            />
          </div>
        </div>
        
        <div class="image-viewer">
          <img
            v-if="selectedImage"
            :src="selectedImage.filename"
            :alt="selectedImage.originalName"
            class="max-w-full max-h-[70vh] object-contain mx-auto"
          />
        </div>
        
        <div v-if="selectedImage" class="mt-4 text-sm text-gray-500">
          <p>{{ t('gallery.info.size') }}: {{ formatFileSize(selectedImage.size) }}</p>
          <p>{{ t('gallery.info.dimensions') }}: {{ selectedImage.width }}x{{ selectedImage.height }}</p>
          <p>{{ t('gallery.info.uploaded') }}: {{ formatDate(selectedImage.uploadedAt) }}</p>
        </div>
      </div>
    </UModal>
  </div>
</ClientOnly>
</template>

<script setup lang="ts">
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

defineProps<{
  images: GalleryImage[]
  showDelete?: boolean
}>()

const emit = defineEmits<{
  delete: [imageId: string]
}>()

const showModal = ref(false)
const selectedImage = ref<GalleryImage | null>(null)

// Открытие модального окна
const openModal = (image: GalleryImage) => {
  selectedImage.value = image
  showModal.value = true
}

// Удаление изображения
const deleteImage = (imageId: string) => {
  emit('delete', imageId)
}

// Копирование ссылки на изображение
const copyImageUrl = async (image: GalleryImage) => {
  try {
    await navigator.clipboard.writeText(image.filename)
    
    const toast = useToast()
    toast.add({
      title: t('gallery.copy.success'),
      description: t('gallery.copy.description'),
      color: 'success',
      icon: 'i-lucide-check'
    })
  } catch (error) {
    console.error('Ошибка копирования:', error)
    
    const toast = useToast()
    toast.add({
      title: t('gallery.copy.error'),
      description: t('gallery.copy.errorDescription'),
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

// Форматирование даты
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    // Проверяем, что дата валидна
    if (!date || isNaN(date.getTime())) {
      return 'Неизвестная дата'
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('Ошибка форматирования даты:', error)
    return 'Неизвестная дата'
  }
}
</script>

<style scoped>
.gallery-grid {
  width: 100%;
}

.gallery-item {
  position: relative;
  overflow: hidden;
}

.image-viewer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style> 