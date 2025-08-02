import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin(({ $pinia }) => {
  const pinia = $pinia as { use: (plugin: any) => void }
  pinia.use(createPersistedState({
    storage: localStorage,
    key: prefix => `nfactorial_${prefix}`
  }))
}) 