<template>
  <div style="display: none;">
    <!-- SEO component - not visible -->
  </div>
</template>

<script setup lang="ts">
interface SeoProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

const props = withDefaults(defineProps<SeoProps>(), {
  title: 'Personal Page Builder',
  description: 'Build and customize your personal page with ease',
  keywords: () => ['personal website', 'portfolio', 'blog', 'developer'],
  type: 'website',
  author: 'Nik Bulygin'
})

// Get current route
const route = useRoute()

// Check if current page should be indexed
const isIndexable = computed(() => {
  const path = route.path
  return !path.startsWith('/admin') && !path.startsWith('/api')
})

// Generate meta tags
useHead(() => {
  if (!isIndexable.value) {
    return {
      // Noindex for admin pages
      robots: 'noindex, nofollow'
    }
  }

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'http://localhost:3000'

  return {
    title: props.title,
    meta: [
      { name: 'description', content: props.description },
      { name: 'keywords', content: props.keywords.join(', ') },
      { name: 'author', content: props.author },
      
      // Open Graph
      { property: 'og:title', content: props.title },
      { property: 'og:description', content: props.description },
      { property: 'og:type', content: props.type },
      { property: 'og:url', content: `${baseUrl}${route.path}` },
      { property: 'og:site_name', content: 'Personal Page Builder' },
      { property: 'og:locale', content: 'ru_RU' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: props.title },
      { name: 'twitter:description', content: props.description },
      { name: 'twitter:creator', content: '@NikBulygin' },
      
      // Article specific meta
      ...(props.type === 'article' ? [
        { property: 'article:author', content: props.author },
        { property: 'article:published_time', content: props.publishedTime },
        { property: 'article:modified_time', content: props.modifiedTime },
        { property: 'article:section', content: props.section },
        ...(props.tags?.map(tag => ({ property: 'article:tag', content: tag })) || [])
      ] : [])
    ],
    
    // Schema.org structured data
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': props.type === 'article' ? 'Article' : 'WebPage',
          name: props.title,
          description: props.description,
          url: `${baseUrl}${route.path}`,
          author: {
            '@type': 'Person',
            name: props.author
          },
          publisher: {
            '@type': 'Organization',
            name: 'Personal Page Builder',
            url: baseUrl
          },
          ...(props.type === 'article' ? {
            datePublished: props.publishedTime,
            dateModified: props.modifiedTime,
            articleSection: props.section,
            keywords: props.keywords.join(', ')
          } : {})
        })
      }
    ]
  }
})
</script> 