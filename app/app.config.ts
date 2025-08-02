export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'red',
      accent: 'green',
      error: 'red',
      success: 'green',
      warning: 'yellow',
      info: 'blue',
      neutral: 'zinc'
    }
  },

  // SEO Configuration - will be overridden by runtime config
  seo: {
    // Basic SEO settings
    title: 'Personal Page Builder',
    description: 'Build and customize your personal page with ease',
    keywords: ['personal website', 'portfolio', 'blog', 'developer', 'web development'],
    author: 'Nik Bulygin',
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: 'Personal Page Builder'
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      creator: '@NikBulygin'
    }
  },

  // Robots configuration
  robots: {
    rules: [
      // Allow all pages by default
      { UserAgent: '*' },
      { Allow: '/' },
      
      // Disallow admin pages
      { Disallow: '/admin' },
      { Disallow: '/admin/*' },
      
      // Disallow API routes
      { Disallow: '/api' },
      { Disallow: '/api/*' },
      
      // Allow specific content types
      { Allow: '/cv' },
      { Allow: '/portfolio' },
      { Allow: '/blog' },
      { Allow: '/store' }
    ],
    
    // Sitemap configuration
    sitemap: {
      hostname: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://localhost:3000',
      gzip: true,
      exclude: [
        '/admin',
        '/admin/**',
        '/api',
        '/api/**'
      ]
    }
  }
})
  