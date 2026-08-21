import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()
const auth = useAuthStore(pinia)

app.use(pinia)
app.use(router)

auth.init().finally(() => {
  router.isReady().then(() => {
    app.mount('#app')

    // Register PWA Service Worker for offline asset caching
    if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.protocol === 'https:')) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('[PWA] Service Worker registered:', reg.scope)
        reg.update()
      }).catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err)
      })
    }
  })
})