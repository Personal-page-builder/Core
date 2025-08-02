import type { AuthorConfig, SiteConfig } from '~/types/runtime'

export const useAuthor = () => {
  const config = useRuntimeConfig()
  
  const author = computed(() => config.author as AuthorConfig)
  const site = computed(() => config.site as SiteConfig)
  
  // Helper functions for social links
  const getSocialLink = (platform: string, username: string) => {
    const socialLinks: Record<string, string> = {
      telegram: `https://t.me/${username.replace('@', '')}`,
      twitter: `https://twitter.com/${username.replace('@', '')}`,
      discord: `https://discord.com/users/${username}`,
      github: `https://github.com/${username}`,
      gitlab: `https://gitlab.com/${username}`,
      linkedin: `https://linkedin.com/in/${username}`,
      stackoverflow: `https://stackoverflow.com/users/${username}`,
      medium: `https://medium.com/${username.replace('@', '')}`,
      devto: `https://dev.to/${username}`,
      hashnode: `https://hashnode.com/@${username.replace('@', '')}`,
      reddit: `https://reddit.com/user/${username}`,
      youtube: `https://youtube.com/${username}`,
      twitch: `https://twitch.tv/${username}`,
      instagram: `https://instagram.com/${username.replace('@', '')}`,
      facebook: `https://facebook.com/${username}`,
      vk: `https://vk.com/${username}`
    }
    
    return socialLinks[platform] || username
  }
  
  // Get all social links
  const socialLinks = computed(() => {
    const links: Record<string, { url: string, username: string }> = {}
    const authorData = author.value
    
    // Define social platforms
    const socialPlatforms = [
      'telegram', 'twitter', 'discord', 'github', 'gitlab', 'matrix',
      'linkedin', 'stackoverflow', 'medium', 'devto', 'hashnode',
      'reddit', 'youtube', 'twitch', 'instagram', 'facebook', 'vk'
    ]
    
    socialPlatforms.forEach(platform => {
      const value = authorData[platform as keyof AuthorConfig]
      if (value && typeof value === 'string') {
        links[platform] = {
          url: getSocialLink(platform, value),
          username: value
        }
      }
    })
    
    return links
  })
  
  // Get contact information
  const contactInfo = computed(() => ({
    email: author.value.email,
    phone: author.value.phone,
    whatsapp: author.value.whatsapp
  }))
  
  // Get technologies as array
  const technologies = computed(() => author.value.technologies)
  
  // Get skills as array
  const skills = computed(() => author.value.skills)
  
  return {
    author,
    site,
    socialLinks,
    contactInfo,
    technologies,
    skills,
    getSocialLink
  }
} 