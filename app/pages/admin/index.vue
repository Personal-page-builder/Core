<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Welcome to the administration panel
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UCard>
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center">
              <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <UIcon name="i-heroicons-users" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Views</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">45.2K</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </template>
            <div class="space-y-4">
              <UButton
                color="primary"
                variant="solid"
                icon="i-heroicons-plus"
                class="w-full justify-start"
              >
                Create New Post
              </UButton>
              <UButton
                color="secondary"
                variant="outline"
                icon="i-heroicons-user-plus"
                class="w-full justify-start"
              >
                Add User
              </UButton>
              <UButton
                color="neutral"
                variant="outline"
                icon="i-heroicons-cog-6-tooth"
                class="w-full justify-start"
              >
                Settings
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </template>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">New post published</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">User registered</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Comment added</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Admin dashboard logic can be added here
</script>

