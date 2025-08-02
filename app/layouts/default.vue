<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Переключатели языка, темы и профиль -->
          <div class="flex items-center gap-2">
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <!-- Слева: Автор -->
          <AuthorInfo />
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AuthorInfo from '~/component/common/authorInfo.vue'
import LanguageSwitch from '~/component/common/settings/languageSwitch.vue'
import ThemeSwitch from '~/component/common/settings/themeSwitch.vue'
</script>
