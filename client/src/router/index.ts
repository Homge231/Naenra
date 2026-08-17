import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', 
      redirect: '/home'
    },
    {
      path: '/login', 
      name: 'login',
      component: () => import('../views/client/LoginView.vue')
    },
    {
      path: '/home',
      alias: '/lobby',
      name: 'home',
      component: () => import('../views/client/HomeView.vue')
    },
    { 
      path: '/core', 
      component: () => import('../views/client/CoreSelectionView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/core/multiplayer', 
      component: () => import('../views/client/CoreSelectionMultiView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game', 
      component: () => import('../views/client/GameplayView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game/multiplayer', 
      component: () => import('../views/client/GameMultiplayView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game/pure-skill-multiplayer', 
      component: () => import('../views/client/GamePureSkillMultiView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/shop', 
      component: () => import('../views/client/ShopView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/end', 
      component: () => import('../views/client/MatchEndView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/error', 
      name: 'error', 
      component: () => import('../views/client/ErrorView.vue') 
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: () => import('../views/client/VerifyOTPView.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/client/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/client/ResetPasswordView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/client/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/room/custom',
      name: 'CustomRoom',
      component: () => import('../views/client/CustomRoomView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/matchmaking',
      name: 'matchmaking',
      component: () => import('../views/client/MatchmakingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/match-found',
      name: 'match-found',
      component: () => import('../views/client/MatchFoundView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('../views/client/LeaderboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path:'/library',
      name: 'library',
      component: () => import('../views/client/CoreLibraryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/library/core/:id',
      name: 'core-library-item',
      component: () => import('../views/client/CoreUpgradeDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/missions',
      name: 'missions',
      component: () => import('../views/client/MissionsDashboardView.vue'),
      meta: { requiresAuth: true }
    },
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
    // Catch-all MUST be at the very end
    {
      path: '/:pathMatch(.*)*',
      redirect: '/' 
    }
  ]
})

router.beforeEach(async (to) => {
  const hash = window.location.hash;
  if (hash.includes('access_token') || hash.includes('type=recovery')) {
    return true;
  }

  if (to.name === 'login' || to.name === 'reset-password' || to.name === 'forgot-password' || to.name === 'home') {
    return true
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  const token = localStorage.getItem('arena_token')
  let isGuestToken = false

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      isGuestToken = !!payload.isGuest
    } catch {}

    const guestRestrictedRoutes = ['matchmaking', 'CustomRoom', 'leaderboard', 'missions', 'profile']
    if (isGuestToken && guestRestrictedRoutes.includes(String(to.name))) {
      return { name: 'login', query: { locked: '1' } }
    }
    return true
  }

  // Fallback for Google OAuth users
  try {
    const { data } = await supabase.auth.getSession()
    if (data?.session) return true
  } catch {}

  return { name: 'login' }
})

// Handle chunk load errors when deploying new versions
router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module') || error.name === 'ChunkLoadError') {
    window.location.href = to.fullPath
  }
})

export default router