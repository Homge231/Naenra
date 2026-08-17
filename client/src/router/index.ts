import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', 
      redirect: '/home',
    },
    {
      path: '/signup', 
      name: 'signup',
      component: () => import('../views/SignupView.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/core', 
      component: () => import('../views/CoreSelectionView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game', 
      component: () => import('../views/GameplayView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/shop', 
      component: () => import('../views/ShopView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/end', 
      component: () => import('../views/MatchEndView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/error', 
      name: 'error', 
      component: () => import('../views/ErrorView.vue') 
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: () => import('../views/VerifyOTPView.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    // ==========================================
    // KHU VỰC ADMIN ROUTES BẮT ĐẦU TỪ ĐÂY
    // ==========================================
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminHome.vue')
        },
        {
          path: 'questions',
          name: 'admin-questions',
          component: () => import('../views/admin/QuestionManagementView.vue')
        },
        {
          path: 'players',
          name: 'admin-players',
          component: () => import('../views/admin/AdminPlaceholderView.vue')
        },
        {
          path: 'leaderboard',
          name: 'admin-leaderboard',
          component: () => import('../views/admin/AdminPlaceholderView.vue')
        },
        {
          path: 'matches',
          name: 'admin-matches',
          component: () => import('../views/admin/AdminPlaceholderView.vue')
        },
        {
          path: 'cores',
          name: 'admin-cores',
          component: () => import('../views/admin/AdminPlaceholderView.vue')
        },
        {
          path: 'ai',
          name: 'admin-ai',
          component: () => import('../views/admin/AdminPlaceholderView.vue')
        }
      ]
    },
    // ==========================================
    // CATCH-ALL ROUTE (LUÔN PHẢI ĐỂ Ở CUỐI CÙNG)
    // ==========================================
    {
      path: '/:pathMatch(.*)*',
      redirect: '/' 
    }
  ]
})

// Navigation guard đã sửa: dùng return thay vì next()
router.beforeEach(async (to) => {
  // 1. Kiểm tra xem URL có chứa token phục hồi của Supabase không
  // Dấu hiệu: URL có #access_token hoặc type=recovery
  const hash = window.location.hash;
  if (hash.includes('access_token') || hash.includes('type=recovery')) {
    return true; // Cho phép tải trang reset-password để Supabase xử lý token
  }

  // 2. Các route ngoại lệ đã định nghĩa
  if (to.name === 'reset-password' || to.name === 'forgot-password') {
    return true
  }

  // 3. Logic Auth của bạn
  if (!to.meta.requiresAuth) {
    return true
  }

  const token = localStorage.getItem('arena_token')
  const { data: { session } } = await supabase.auth.getSession()

  if (!token && !session) {
    return { name: 'login' } 
  }

  return true
})

export default router