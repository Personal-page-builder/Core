<template>
  <div class="image-uploader">
    <!-- Drag & Drop зона -->
    <div
      ref="dropZone"
      class="drop-zone"
      :class="{ 'drag-over': isDragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @paste="handlePaste"
    >
      <div class="upload-content">
        <UIcon name="i-lucide-upload" class="w-12 h-12 text-gray-400" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ t('gallery.upload.title') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('gallery.upload.description') }}
        </p>
        <UButton
          color="primary"
          variant="soft"
          @click="triggerFileInput"
        >
          {{ t('gallery.upload.selectFile') }}
        </UButton>
      </div>
    </div>

    <!-- Скрытый input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Прогресс загрузки -->
    <div v-if="uploading" class="mt-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
        <span class="text-sm">{{ t('gallery.upload.uploading') }}</span>
      </div>
      <UProgress :value="uploadProgress" class="mt-2" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const emit = defineEmits<{
  upload: [files: File[]]
}>()

const dropZone = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

// Обработка drag & drop
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length > 0) {
    handleFiles(imageFiles)
  }
}

// Обработка вставки
const handlePaste = (e: ClipboardEvent) => {
  const items = Array.from(e.clipboardData?.items || [])
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        handleFiles([file])
        break
      }
    }
  }
}

// Обработка выбора файлов
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  handleFiles(files)
  
  // Очищаем input
  target.value = ''
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

// Обработка файлов
const handleFiles = (files: File[]) => {
  emit('upload', files)
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.dark .drop-zone:hover,
.dark .drop-zone.drag-over {
  background-color: #1e293b;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style> 