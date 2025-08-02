<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="max-w-md mx-auto text-center px-4">
      <!-- Error Icon -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <UIcon 
            :name="errorIcon" 
            class="w-12 h-12 text-red-600 dark:text-red-400" 
          />
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
        {{ errorCode }}
      </h1>

      <!-- Error Title -->
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {{ errorTitle }}
      </h2>

      <!-- Error Message -->
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        {{ errorMessage }}
      </p>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <UButton
          color="primary"
          variant="solid"
          size="lg"
          @click="handleError"
        >
          {{ $t('error.tryAgain') }}
        </UButton>
        
        <div class="flex gap-4 justify-center">
          <UButton
            color="neutral"
            variant="outline"
            @click="goHome"
          >
            {{ $t('error.goHome') }}
          </UButton>
          
          <UButton
            color="neutral"
            variant="outline"
            @click="goBack"
          >
            {{ $t('error.goBack') }}
          </UButton>
        </div>
      </div>

      <!-- Additional Info for 418 -->
      <div v-if="error?.statusCode === 418" class="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          {{ $t('error.teapotMessage') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = useError()
const { t } = useI18n()

// Error handling based on status code
const errorCode = computed(() => error.value?.statusCode || '500')
const errorIcon = computed(() => {
  switch (error.value?.statusCode) {
    case 404:
      return 'i-heroicons-magnifying-glass'
    case 418:
      return 'i-heroicons-mug-hot'
    case 403:
      return 'i-heroicons-shield-exclamation'
    case 500:
      return 'i-heroicons-exclamation-triangle'
    default:
      return 'i-heroicons-exclamation-circle'
  }
})

const errorTitle = computed(() => {
  const statusCode = error.value?.statusCode
  if (statusCode && [404, 418, 403, 500].includes(statusCode)) {
    return t(`error.titles.${statusCode}`)
  }
  return t('error.titles.default')
})

const errorMessage = computed(() => {
  const statusCode = error.value?.statusCode
  if (statusCode && [404, 418, 403, 500].includes(statusCode)) {
    return t(`error.messages.${statusCode}`)
  }
  return t('error.messages.default')
})

// Navigation functions
const router = useRouter()

const handleError = () => {
  clearError()
}

const goHome = () => {
  clearError()
  router.push('/')
}

const goBack = () => {
  clearError()
  router.back()
}
</script> 