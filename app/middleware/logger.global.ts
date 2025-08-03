export default defineNuxtRouteMiddleware((to, _from) => {
  // Логируем только на клиенте
  if (import.meta.client) {
    // Логируем просмотр страницы
    $fetch('/api/logger/log', {
      method: 'POST',
      body: {
        action: 'page_view',
        target: to.path,
        url: to.fullPath
      }
    }).catch(console.error)
  }
}) 