<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('layout.author.withLove') }}</span>
    <span class="text-lg">❤️</span>
    <UModal 
    :title="t('layout.author.contacts')"
    :description="t('layout.author.contactsDescription')"
    :ui="{ content: 'min-w-[90vw] min-h-[90vh]' }">

    <UButton
      :label="t('layout.author.name')"
      variant="ghost"
      size="sm"
    />

    <template #body>
      <div class="flex flex-col gap-6 h-full w-full justify-center items-center overflow-y-auto p-8 flex-1">
        <!-- Email -->
        <div class="flex flex-col items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[300px]">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-envelope" class="w-8 h-8 text-primary-500" />
            <span class="text-lg font-medium">Email</span>
          </div>
          <span class="text-gray-700 dark:text-gray-300">byluginniktia@gmail.com</span>
          <UButton
            :label="t('layout.author.copy')"
            variant="outline"
            size="sm"
            icon="i-heroicons-clipboard-document"
            @click="copyToClipboard('byluginniktia@gmail.com')"
          />
        </div>

        <!-- Telegram -->
        <div class="flex flex-col items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[300px]">
          <div class="flex items-center gap-3">
            <UIcon name="i-simple-icons-telegram" class="w-8 h-8 text-blue-500" />
            <span class="text-lg font-medium">Telegram</span>
          </div>
          <span class="text-gray-700 dark:text-gray-300">@Bulygin_Nik</span>
          <UButton
            :label="t('layout.author.copy')"
            variant="outline"
            size="sm"
            icon="i-heroicons-clipboard-document"
            @click="copyToClipboard('@Bulygin_Nik')"
          />
        </div>

        <!-- LinkedIn -->
        <div class="flex flex-col items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[300px]">
          <div class="flex items-center gap-3">
            <UIcon name="i-simple-icons-linkedin" class="w-8 h-8 text-blue-600" />
            <span class="text-lg font-medium">LinkedIn</span>
          </div>
          <span class="text-gray-700 dark:text-gray-300">nikbulygin</span>
          <UButton
            :label="t('layout.author.copy')"
            variant="outline"
            size="sm"
            icon="i-heroicons-clipboard-document"
            @click="copyToClipboard('nikbulygin')"
          />
        </div>

        <!-- GitHub -->
        <div class="flex flex-col items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[300px]">
          <div class="flex items-center gap-3">
            <UIcon name="i-simple-icons-github" class="w-8 h-8 text-gray-800 dark:text-gray-200" />
            <span class="text-lg font-medium">GitHub</span>
          </div>
          <span class="text-gray-700 dark:text-gray-300">NikBulygin</span>
          <UButton
            :label="t('layout.author.copy')"
            variant="outline"
            size="sm"
            icon="i-heroicons-clipboard-document"
            @click="copyToClipboard('https://github.com/NikBulygin')"
          />
        </div>
      </div>
    </template>
  </UModal>

  </div>

</template>

<script setup lang="ts">
const { t } = useI18n()

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}
</script>
