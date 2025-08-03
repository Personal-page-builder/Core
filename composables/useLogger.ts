export const useLogger = () => {
  const logAction = async (action: string, target: string, metadata?: Record<string, unknown>) => {
    try {
      await $fetch('/api/logger/log', {
        method: 'POST',
        body: {
          action,
          target,
          url: window.location.href,
          metadata
        }
      })
    } catch (error) {
      console.error('Ошибка логирования:', error)
    }
  }

  const logButtonClick = (buttonText: string, metadata?: Record<string, unknown>) => {
    logAction('button_click', buttonText, metadata)
  }

  const logLinkClick = (linkText: string, linkUrl: string, metadata?: Record<string, unknown>) => {
    logAction('link_click', linkText, { ...metadata, linkUrl })
  }

  const logImageLoad = (imageSrc: string, metadata?: Record<string, unknown>) => {
    logAction('image_load', imageSrc, metadata)
  }

  return {
    logAction,
    logButtonClick,
    logLinkClick,
    logImageLoad
  }
} 