import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia() 

app.use(pinia) 
app.use(router)

// Đợi router sẵn sàng rồi mới mount để tránh lỗi render
router.isReady().then(() => {
  app.mount('#app')
})

const auth = useAuthStore(pinia)

// Chỉ cập nhật state, không trigger điều hướng ở đây
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    auth.user = session.user
    await auth.fetchProfile()
  }
  if (event === 'SIGNED_OUT') {
    auth.user = null
    // Chỉ cần cập nhật state, router.beforeEach sẽ tự redirect
  }
})

// Kiểm tra session ban đầu
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    auth.user = session.user
    auth.fetchProfile()
  }
})