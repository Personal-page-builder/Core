export interface AuthorConfig {
  name: string
  jobTitle: string
  bio: string
  location: string
  timezone: string
  experienceYears: number
  technologies: string[]
  skills: string[]
  email: string
  phone: string
  whatsapp: string
  telegram: string
  twitter: string
  discord: string
  github: string
  gitlab: string
  matrix: string
  linkedin: string
  stackoverflow: string
  medium: string
  devto: string
  hashnode: string
  reddit: string
  youtube: string
  twitch: string
  instagram: string
  facebook: string
  vk: string
}

export interface SiteConfig {
  name: string
  description: string
  keywords: string[]
  url: string
  language: string
  timezone: string
  author: string
  twitterCreator: string
  ogLocale: string
}

export interface DatabaseConfig {
  type: 'sqlite' | 'postgres'
  sqlite: {
    filename: string
  }
  postgres: {
    url?: string
    host?: string
    port: number
    database?: string
    username?: string
    password?: string
    ssl: boolean
  }
}

export interface RuntimeConfig {
  database: DatabaseConfig
  author: AuthorConfig
  site: SiteConfig
} 