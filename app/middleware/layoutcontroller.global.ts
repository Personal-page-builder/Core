export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/admin/edit')) {
    setPageLayout('edit')
  }
})
