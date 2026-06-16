import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',           component: () => import('../views/LoginView.vue') },
    { path: '/verify-otp', component: () => import('../views/VerifyOTPView.vue') },
    { path: '/lobby',      component: () => import('../views/LobbyView.vue'),         meta: { requiresAuth: true } },
    { path: '/core',       component: () => import('../views/CoreSelectionView.vue'),  meta: { requiresAuth: true } },
    { path: '/game',       component: () => import('../views/GameplayView.vue'),       meta: { requiresAuth: true } },
    { path: '/shop',       component: () => import('../views/ShopView.vue'),           meta: { requiresAuth: true } },
    { path: '/end',        component: () => import('../views/MatchEndView.vue'),       meta: { requiresAuth: true } },
  ]
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true
  const token = localStorage.getItem('arena_token')
  if (!token) return '/'
  return true
})

export default router
