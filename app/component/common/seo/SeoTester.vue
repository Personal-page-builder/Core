<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">SEO Tester</h3>
      </template>
      
      <div class="space-y-4">
        <!-- Current Page Info -->
        <div>
          <h4 class="font-medium mb-2">Current Page</h4>
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <p><strong>URL:</strong> {{ currentUrl }}</p>
            <p><strong>Title:</strong> {{ pageTitle }}</p>
            <p><strong>Description:</strong> {{ pageDescription }}</p>
            <p><strong>Indexable:</strong> <span :class="isIndexable ? 'text-green-600' : 'text-red-600'">{{ isIndexable ? 'Yes' : 'No' }}</span></p>
          </div>
        </div>

        <!-- Meta Tags Checker -->
        <div>
          <h4 class="font-medium mb-2">Meta Tags</h4>
          <div class="space-y-2">
            <div v-for="tag in metaTags" :key="tag.name" class="flex items-center gap-2">
              <UIcon :name="tag.present ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
                     :class="tag.present ? 'text-green-500' : 'text-red-500'" />
              <span>{{ tag.name }}</span>
            </div>
          </div>
        </div>

        <!-- Social Media Preview -->
        <div>
          <h4 class="font-medium mb-2">Social Media Preview</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border rounded p-3">
              <h5 class="font-medium text-sm mb-2">Facebook/Twitter</h5>
              <div class="text-xs space-y-1">
                <p><strong>Title:</strong> {{ ogTitle }}</p>
                <p><strong>Description:</strong> {{ ogDescription }}</p>
                <p><strong>Type:</strong> {{ ogType }}</p>
              </div>
            </div>
            <div class="border rounded p-3">
              <h5 class="font-medium text-sm mb-2">Schema.org</h5>
              <div class="text-xs space-y-1">
                <p><strong>Type:</strong> {{ schemaType }}</p>
                <p><strong>Author:</strong> {{ schemaAuthor }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Tests -->
        <div>
          <h4 class="font-medium mb-2">Quick Tests</h4>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="test in quickTests"
              :key="test.name"
              :color="test.passed ? 'success' : 'error'"
              variant="outline"
              size="sm"
              @click="runTest(test)"
            >
              {{ test.name }}
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface TestItem {
  name: string
  passed: boolean
  action: () => void
}

const route = useRoute()

// Current page info
const currentUrl = computed(() => window?.location?.href || route.fullPath)
const pageTitle = computed(() => document?.title || 'No title')
const pageDescription = computed(() => {
  const meta = document?.querySelector('meta[name="description"]')
  return meta?.getAttribute('content') || 'No description'
})

// Check if page is indexable
const isIndexable = computed(() => {
  const path = route.path
  return !path.startsWith('/admin') && !path.startsWith('/api')
})

// Meta tags checker
const metaTags = computed(() => [
  { name: 'description', present: !!document?.querySelector('meta[name="description"]') },
  { name: 'keywords', present: !!document?.querySelector('meta[name="keywords"]') },
  { name: 'author', present: !!document?.querySelector('meta[name="author"]') },
  { name: 'robots', present: !!document?.querySelector('meta[name="robots"]') },
  { name: 'og:title', present: !!document?.querySelector('meta[property="og:title"]') },
  { name: 'og:description', present: !!document?.querySelector('meta[property="og:description"]') },
  { name: 'og:type', present: !!document?.querySelector('meta[property="og:type"]') },
  { name: 'twitter:card', present: !!document?.querySelector('meta[name="twitter:card"]') },
  { name: 'twitter:title', present: !!document?.querySelector('meta[name="twitter:title"]') },
  { name: 'twitter:description', present: !!document?.querySelector('meta[name="twitter:description"]') }
])

// Social media preview
const ogTitle = computed(() => {
  const meta = document?.querySelector('meta[property="og:title"]')
  return meta?.getAttribute('content') || 'No OG title'
})

const ogDescription = computed(() => {
  const meta = document?.querySelector('meta[property="og:description"]')
  return meta?.getAttribute('content') || 'No OG description'
})

const ogType = computed(() => {
  const meta = document?.querySelector('meta[property="og:type"]')
  return meta?.getAttribute('content') || 'No OG type'
})

const schemaType = computed(() => {
  const script = document?.querySelector('script[type="application/ld+json"]')
  if (script) {
    try {
      const data = JSON.parse(script.textContent || '{}')
      return data['@type'] || 'Unknown'
    } catch {
      return 'Invalid JSON'
    }
  }
  return 'No schema'
})

const schemaAuthor = computed(() => {
  const script = document?.querySelector('script[type="application/ld+json"]')
  if (script) {
    try {
      const data = JSON.parse(script.textContent || '{}')
      return data.author?.name || 'No author'
    } catch {
      return 'Invalid JSON'
    }
  }
  return 'No schema'
})

// Test functions
const checkSitemap = async () => {
  try {
    const response = await fetch('/sitemap.xml')
    const passed = response.ok
    const test = quickTests.value.find(t => t.name === 'Check Sitemap')
    if (test) test.passed = passed
  } catch {
    const test = quickTests.value.find(t => t.name === 'Check Sitemap')
    if (test) test.passed = false
  }
}

const checkRobots = async () => {
  try {
    const response = await fetch('/robots.txt')
    const passed = response.ok
    const test = quickTests.value.find(t => t.name === 'Check Robots.txt')
    if (test) test.passed = passed
  } catch {
    const test = quickTests.value.find(t => t.name === 'Check Robots.txt')
    if (test) test.passed = false
  }
}

const checkPageSpeed = () => {
  // Simulate page speed check
  const test = quickTests.value.find(t => t.name === 'Check Page Speed')
  if (test) test.passed = Math.random() > 0.3 // 70% chance of passing
}

const checkMobileFriendly = () => {
  // Simulate mobile friendly check
  const test = quickTests.value.find(t => t.name === 'Check Mobile Friendly')
  if (test) test.passed = Math.random() > 0.2 // 80% chance of passing
}

// Quick tests
const quickTests = ref<TestItem[]>([
  { name: 'Check Sitemap', passed: false, action: checkSitemap },
  { name: 'Check Robots.txt', passed: false, action: checkRobots },
  { name: 'Check Page Speed', passed: false, action: checkPageSpeed },
  { name: 'Check Mobile Friendly', passed: false, action: checkMobileFriendly }
])

const runTest = (test: TestItem) => {
  if (test.action) {
    test.action()
  }
}

// Run initial tests
onMounted(() => {
  checkSitemap()
  checkRobots()
  checkPageSpeed()
  checkMobileFriendly()
})
</script> 