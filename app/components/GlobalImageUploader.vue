<template>
  <div
    v-if="isDragOver"
    class="fixed inset-0 z-50 bg-blue-500 bg-opacity-20 flex items-center justify-center"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <div class="bg-white rounded-lg p-8 text-center shadow-2xl">
      <UIcon name="i-lucide-upload" class="w-16 h-16 text-blue-500 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {{ t('gallery.upload.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('gallery.upload.dropHere') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const isDragOver = ref(false)

// Обработка drag & drop
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  // Проверяем, что курсор действительно покинул окно
  if (e.relatedTarget === null) {
    isDragOver.value = false
  }
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length > 0) {
    await uploadImages(imageFiles)
  }
}

// Загрузка изображений
const uploadImages = async (files: File[]) => {
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

    // Перенаправляем на галерею после загрузки
    await navigateTo('/gallery')
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

// Глобальные обработчики событий
onMounted(() => {
  document.addEventListener('dragover', handleDragOver)
  document.addEventListener('drop', handleDrop)
  document.addEventListener('dragleave', handleDragLeave)
})

onUnmounted(() => {
  document.removeEventListener('dragover', handleDragOver)
  document.removeEventListener('drop', handleDrop)
  document.removeEventListener('dragleave', handleDragLeave)
})
</script> 