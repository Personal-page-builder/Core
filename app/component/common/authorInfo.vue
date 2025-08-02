<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('layout.author.withLove') }}</span>
    <span class="text-lg">❤️</span>
    <UModal 
      :title="t('layout.author.contacts')"
      :description="t('layout.author.contactsDescription')"
      :ui="{ content: 'max-w-[800px] max-h-[600px] min-w-[400px] min-h-[300px]' }">
      <UButton
        :label="t('layout.author.name')"
        variant="ghost"
        icon="i-heroicons-user"
      />

      <template #body>
        <div class="flex flex-row flex-wrap gap-4 h-full w-full justify-center items-center overflow-y-auto p-4 flex-1">
          <!-- Email -->
          <UButton
            :label="`Email`"
            icon="i-logos-google-gmail"
            variant="outline"
            size="lg"
            class="justify-center text-center min-w-[250px] min-h-[80px] text-lg font-medium"
            :ui="{ leadingIcon: 'w-8 h-8' }"
            @click="openEmail('byluginnikita@gmail.com')"
          />

          <!-- Telegram -->
          <UButton
            :label="`Telegram`"
            icon="i-logos-telegram"
            variant="outline"
            size="lg"
            class="justify-center text-center min-w-[250px] min-h-[80px] text-lg font-medium"
            :ui="{ leadingIcon: 'w-8 h-8' }"
            @click="openLink('https://t.me/Bulygin_Nik')"
          />

          <!-- LinkedIn -->
          <UButton
            :label="`LinkedIn`"
            icon="i-logos-linkedin"
            variant="outline"
            size="lg"
            class="justify-center text-center min-w-[250px] min-h-[80px] text-lg font-medium"
            :ui="{ leadingIcon: 'w-8 h-8' }"
            @click="openLink('https://www.linkedin.com/in/nikbulygin/')"
          />

          <!-- GitHub -->
          <UButton
            :label="`GitHub`"
            icon="i-logos-github-icon"
            variant="outline"
            size="lg"
            class="justify-center text-center min-w-[250px] min-h-[80px] text-lg font-medium"
            :ui="{ leadingIcon: 'w-8 h-8 dark:invert' }"
            @click="openLink('https://github.com/NikBulygin')"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const openEmail = (email: string) => {
  window.open(`mailto:${email}`, '_blank')
}

const openLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
