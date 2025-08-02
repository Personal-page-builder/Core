<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            SEO Testing Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Test and monitor your website's SEO performance
          </p>
        </div>

        <!-- SEO Tester Component -->
        <SeoTester />

        <!-- Additional SEO Tools -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <!-- Sitemap Generator -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Sitemap Generator</h3>
            </template>
            <div class="space-y-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Generate and validate your sitemap.xml
              </p>
              <UButton
                color="primary"
                variant="solid"
                @click="generateSitemap"
                :loading="generatingSitemap"
              >
                Generate Sitemap
              </UButton>
              <div v-if="sitemapResult" class="text-sm">
                <p><strong>Status:</strong> {{ sitemapResult.status }}</p>
                <p><strong>URLs:</strong> {{ sitemapResult.urls }}</p>
              </div>
            </div>
          </UCard>

          <!-- Robots.txt Editor -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Robots.txt Editor</h3>
            </template>
            <div class="space-y-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                View and edit your robots.txt file
              </p>
              <UTextarea
                v-model="robotsContent"
                placeholder="Enter robots.txt content..."
                :rows="8"
              />
              <UButton
                color="primary"
                variant="solid"
                @click="saveRobots"
                :loading="savingRobots"
              >
                Save Robots.txt
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO testing page
const generatingSitemap = ref(false)
const savingRobots = ref(false)
const sitemapResult = ref<{ status: string; urls: number } | null>(null)
const robotsContent = ref(`User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin
Disallow: /admin/*

# Disallow API routes
Disallow: /api
Disallow: /api/*

# Allow specific content types
Allow: /cv
Allow: /portfolio
Allow: /blog
Allow: /store

# Sitemap
Sitemap: http://localhost:3000/sitemap.xml`)

const generateSitemap = async () => {
  generatingSitemap.value = true
  try {
    // Simulate sitemap generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    sitemapResult.value = {
      status: 'Generated successfully',
      urls: 24
    }
  } catch (error) {
    console.error('Sitemap generation failed:', error)
    sitemapResult.value = {
      status: 'Generation failed',
      urls: 0
    }
  } finally {
    generatingSitemap.value = false
  }
}

const saveRobots = async () => {
  savingRobots.value = true
  try {
    // Simulate saving robots.txt
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Here you would actually save the robots.txt file
    console.log('Robots.txt saved:', robotsContent.value)
  } catch (error) {
    console.error('Failed to save robots.txt:', error)
  } finally {
    savingRobots.value = false
  }
}
</script> 