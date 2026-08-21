import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

// Static imports for client-facing core gameplay and navigation
// Guarantees zero chunk-load network failures when operating offline
import HomeView from '../views/client/HomeView.vue'
import CoreSelectionView from '../views/client/CoreSelectionView.vue'
import CoreSelectionMultiView from '../views/client/CoreSelectionMultiView.vue'
import GameplayView from '../views/client/GameplayView.vue'
import GameMultiplayView from '../views/client/GameMultiplayView.vue'
import GamePureSkillMultiView from '../views/client/GamePureSkillMultiView.vue'
import ShopView from '../views/client/ShopView.vue'
import MatchEndView from '../views/client/MatchEndView.vue'
import ErrorView from '../views/client/ErrorView.vue'
import VerifyOTPView from '../views/client/VerifyOTPView.vue'
import ForgotPasswordView from '../views/client/ForgotPasswordView.vue'
import ResetPasswordView from '../views/client/ResetPasswordView.vue'
import ProfileView from '../views/client/ProfileView.vue'
import CustomRoomView from '../views/client/CustomRoomView.vue'
import MatchmakingView from '../views/client/MatchmakingView.vue'
import MatchFoundView from '../views/client/MatchFoundView.vue'
import LeaderboardView from '../views/client/LeaderboardView.vue'
import CoreLibraryView from '../views/client/CoreLibraryView.vue'
import CoreUpgradeDetailView from '../views/client/CoreUpgradeDetailView.vue'
import MissionsDashboardView from '../views/client/MissionsDashboardView.vue'
import LoginView from '../views/client/LoginView.vue'

// Admin emails that always have admin access (mirrors server/src/constants.ts)
const SUPER_ADMIN_EMAILS = new Set([
  'homge231@gmail.com',
  'baonhggcd220259@fpt.edu.vn',
  'myctgcd220094@fpt.edu.vn'
])

// Routes that guests cannot access — defined once as a Set for O(1) lookup
const GUEST_RESTRICTED = new Set([
  'matchmaking', 'CustomRoom', 'leaderboard', 'missions', 'profile',
  'admin-dashboard', 'admin-questions', 'admin-players',
  'admin-leaderboard', 'admin-matches', 'admin-cores', 'admin-ai'
])

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
      component: LoginView
    },
    {
      path: '/home',
      alias: '/lobby',
      name: 'home',
      component: HomeView
    },
    { 
      path: '/core', 
      name: 'core',
      component: CoreSelectionView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/core/multiplayer', 
      name: 'core-multiplayer',
      component: CoreSelectionMultiView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game', 
      name: 'game',
      component: GameplayView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game/multiplayer', 
      name: 'game-multiplayer',
      component: GameMultiplayView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game/pure-skill-multiplayer', 
      name: 'game-pure-skill-multiplayer',
      component: GamePureSkillMultiView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/shop', 
      name: 'shop',
      component: ShopView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/end', 
      name: 'end',
      component: MatchEndView, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/error', 
      name: 'error', 
      component: ErrorView 
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: VerifyOTPView
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/room/custom',
      name: 'CustomRoom',
      component: CustomRoomView,
      meta: { requiresAuth: true }
    },
    {
      path: '/matchmaking',
      name: 'matchmaking',
      component: MatchmakingView,
      meta: { requiresAuth: true }
    },
    {
      path: '/match-found',
      name: 'match-found',
      component: MatchFoundView,
      meta: { requiresAuth: true }
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView,
      meta: { requiresAuth: true }
    },
    {
      path:'/library',
      name: 'library',
      component: CoreLibraryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/library/core/:id',
      name: 'core-library-item',
      component: CoreUpgradeDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/missions',
      name: 'missions',
      component: MissionsDashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminHome.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'questions',
          name: 'admin-questions',
          component: () => import('../views/admin/QuestionManagementView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'players',
          name: 'admin-players',
          component: () => import('../views/admin/PlayerManagementView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'leaderboard',
          name: 'admin-leaderboard',
          component: () => import('../views/admin/AdminLeaderboardView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'matches',
          name: 'admin-matches',
          component: () => import('../views/admin/MatchAnalyticsView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'cores',
          name: 'admin-cores',
          component: () => import('../views/admin/CoreManagementView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'ai',
          name: 'admin-ai',
          component: () => import('../views/admin/AdminAIWorkspaceView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
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
  const hash = window.location.hash
  if (hash.includes('access_token') || hash.includes('type=recovery')) {
    return true
  }

  if (to.name === 'login' || to.name === 'reset-password' || to.name === 'forgot-password' || to.name === 'home') {
    return true
  }

  // Allow offline solo gameplay, core selection, library, missions & offline profile without redirection loop
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    if (to.path.startsWith('/admin') || to.path === '/matchmaking' || to.path === '/room/custom') {
      return { name: 'home' }
    }
    return true
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  const token = localStorage.getItem('arena_token')
  let isGuestToken = false
  let tokenIsAdmin = false
  let tokenEmail = ''

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      isGuestToken = !!payload.isGuest
      tokenIsAdmin = payload.is_admin === true
      tokenEmail = payload.email || ''
    } catch {}

    if (isGuestToken && (GUEST_RESTRICTED.has(String(to.name)) || to.path.startsWith('/admin'))) {
      return { name: 'login', query: { locked: '1' } }
    }

    const requiresAdmin = to.matched.some(r => r.meta.requiresAdmin) || to.path.startsWith('/admin')
    if (requiresAdmin) {
      const isManualAdmin = localStorage.getItem('arena_admin_mode') === 'true'
      const emailIsAdmin = SUPER_ADMIN_EMAILS.has(tokenEmail.toLowerCase())
      const userIsAdmin = tokenIsAdmin || isManualAdmin || emailIsAdmin

      if (!userIsAdmin) {
        return { name: 'home' }
      }
    }

    return true
  }

  // Fallback for Google OAuth users
  try {
    const { data } = await supabase.auth.getSession()
    if (data?.session) {
      const requiresAdmin = to.matched.some(r => r.meta.requiresAdmin) || to.path.startsWith('/admin')
      if (requiresAdmin) {
        const email = data.session.user.email?.toLowerCase() || ''
        const isGoogleAdmin = SUPER_ADMIN_EMAILS.has(email)
        if (!isGoogleAdmin) {
          return { name: 'home' }
        }
      }
      return true
    }
  } catch {}

  return { name: 'login' }
})

// Handle chunk load errors when deploying new versions
router.onError((error, to) => {
  console.warn('[Router Chunk Error]', error)
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    if (error.message.includes('Failed to fetch dynamically imported module') || error.name === 'ChunkLoadError') {
      window.location.href = to.fullPath
    }
  }
})

export default router