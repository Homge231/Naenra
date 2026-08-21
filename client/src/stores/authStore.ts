import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { fetchWithAuth } from '../services/api'
import { useMissionsStore } from './missionsStore'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const SESSION_POLL_INTERVAL_MS = 20000

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const profile = ref<any>(null)
  const loading = ref(true)
  let sessionPollTimer: ReturnType<typeof setInterval> | null = null

  // ── Realtime session-kick state ─────────────────────────────────────────
  const currentSessionVersion = ref<number | null>(null)
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  // Flag to suppress the Supabase SIGNED_OUT side-effect triggered by the
  // explicit supabase.auth.signOut() we call inside loginWithEmail before
  // establishing the new email session.
  let isLoggingInWithEmail = false

  const isGuest = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isFirstPlay = computed(() => profile.value?.is_first_play ?? false)

  const isAdmin = computed(() => {
    if (localStorage.getItem('arena_admin_mode') === 'true') return true
    if (profile.value?.is_admin === true) return true
    return false
  })

  function toggleAdminMode() {
    const current = localStorage.getItem('arena_admin_mode') === 'true'
    localStorage.setItem('arena_admin_mode', String(!current))
    location.reload()
  }

  function cleanOAuthUrlFragment() {
    if (window.location.hash.includes('access_token')) {
      const cleanUrl = window.location.pathname + window.location.search
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }

  function startSessionPolling() {
    stopSessionPolling()
    sessionPollTimer = setInterval(() => {
      if (localStorage.getItem('arena_token')) {
        fetchProfile()
      } else {
        stopSessionPolling()
      }
    }, SESSION_POLL_INTERVAL_MS)
  }

  function stopSessionPolling() {
    if (sessionPollTimer) {
      clearInterval(sessionPollTimer)
      sessionPollTimer = null
    }
  }

  // ── Realtime subscription (Broadcast): instant kick when a new login happens ──
  // Uses Broadcast instead of postgres_changes because postgres_changes requires
  // a valid Supabase Auth session on the client to pass RLS (auth.uid() = id).
  // Email/password login users never get a Supabase Auth session (they only
  // hold the custom arena_token JWT), so postgres_changes silently never fires
  // for them. Broadcast has no such dependency — the server pushes the event
  // directly using the service_role key.
  function subscribeToSessionChanges(userId: string) {
    unsubscribeSessionChanges()

    realtimeChannel = supabase
      .channel(`session-kick:${userId}`)
      .on('broadcast', { event: 'session_invalidated' }, (payload: any) => {
        if (isLoggingInWithEmail || isExchanging) return
        const newVersion = payload.payload?.session_version
        if (
          typeof newVersion === 'number' &&
          currentSessionVersion.value !== null &&
          newVersion !== currentSessionVersion.value
        ) {
          forceLogoutDueToNewSession()
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[Realtime] session-kick channel failed:', status)
        }
      })
  }

  function unsubscribeSessionChanges() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  /**
   * Store the session version and subscribe to real-time session-kick events.
   * Called after every successful login (email or OAuth).
   */
  function _activateSession(token: string, userId: string, sessionVersion?: number) {
    const version = sessionVersion ?? extractSessionVersionFromToken(token)
    if (version !== null) {
      currentSessionVersion.value = version
      subscribeToSessionChanges(userId)
    }
    useMissionsStore().loadUserMissions()
  }

  function forceLogoutDueToNewSession() {
    stopSessionPolling()
    unsubscribeSessionChanges()

    // Smart token removal: check the version embedded in the stored token
    // before deciding whether to remove it.
    //
    // • Same version as ours  → this is our own (now-invalidated) token, e.g.
    //   we're on a different device/browser. Safe to remove — nobody else owns it.
    //
    // • Different version     → a new login from another tab in the SAME browser
    //   has already stored its fresh token here. Do NOT remove it (that would
    //   kick the new session too). Instead, use a tab-scoped sessionStorage flag
    //   so init() on this tab skips auto-restore on the next page load.
    const storedToken = localStorage.getItem('arena_token')
    if (storedToken) {
      const storedVersion = extractSessionVersionFromToken(storedToken)
      if (storedVersion === currentSessionVersion.value) {
        localStorage.removeItem('arena_token')
      } else {
        sessionStorage.setItem('arena_force_logged_out', '1')
      }
    } else {
      // No token at all — nothing to preserve, nothing to flag.
    }

    user.value = null
    profile.value = null
    currentSessionVersion.value = null

    try {
      supabase.auth.signOut()
    } catch {}

    window.location.href = '/login?reason=session_invalidated'
  }

  /** Decode sessionVersion out of the arena JWT payload without verifying signature. */
  function extractSessionVersionFromToken(token: string): number | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      return typeof payload.sessionVersion === 'number' ? payload.sessionVersion : null
    } catch {
      return null
    }
  }

  async function skipTutorial() {
    if (profile.value) {
      profile.value.is_first_play = false
    }
    const token = localStorage.getItem('arena_token')
    if (!token) return

    try {
      await fetchWithAuth('/auth/skip-tutorial', { method: 'POST' })
    } catch (err) {
      console.error('Failed to skip tutorial:', err)
    }
  }

  let isExchanging = false

  function hasNonGuestArenaToken(): boolean {
    const token = localStorage.getItem('arena_token')
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return !payload.isGuest
    } catch {
      return false
    }
  }

  async function init() {
    // If this tab was force-kicked by a new login on another tab/device,
    // do not auto-restore the session from localStorage — the token stored
    // there now belongs to the new session and is not ours to use.
    if (sessionStorage.getItem('arena_force_logged_out') || window.location.search.includes('reason=session_invalidated')) {
      sessionStorage.removeItem('arena_force_logged_out')
      try {
        await supabase.auth.signOut()
      } catch {}
      user.value = null
      profile.value = null
      loading.value = false
      return
    }

    const token = localStorage.getItem('arena_token')

    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null

    const isFreshOAuthRedirect = window.location.hash.includes('access_token')

    if (session?.access_token) {
      // Only exchange the Supabase token for an arena token when:
      // 1. This is a fresh OAuth redirect (hash contains access_token), OR
      // 2. We have no valid non-guest arena_token yet (e.g. guest token or first-time Google login).
      const hasRealToken = hasNonGuestArenaToken()
      if ((isFreshOAuthRedirect || !hasRealToken) && !isExchanging) {
        isExchanging = true
        try {
          await exchangeTokenAfterOAuth()
          cleanOAuthUrlFragment()
        } finally {
          isExchanging = false
        }
      }
    }

    // Email or Guest login users have no Supabase session — restore from arena JWT
    if (!user.value && token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(base64))
        
        if (payload.isGuest && (typeof payload.id === 'string' && payload.id.startsWith('guest_'))) {
          // Stale non-UUID guest token detected — auto-reissue a fresh UUID guest session
          localStorage.removeItem('arena_token')
          await loginAsGuest()
        } else {
          user.value = { id: payload.id, email: payload.email, isGuest: !!payload.isGuest }
          if (payload.isGuest) {
            isGuest.value = true
            profile.value = {
              id: payload.id,
              username: payload.username,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.username)}`,
              elo: 0,
              isGuest: true
            }
          }
        }
      } catch {}
    }

    if (!isGuest.value && (user.value || localStorage.getItem('arena_token'))) {
      try {
        await fetchProfile()
      } catch {}
    }

    // Offline auto-fallback if no user/profile exists
    if (!user.value || !profile.value) {
      const offlineId = 'offline_player_' + Math.floor(Math.random() * 10000)
      user.value = { id: offlineId, email: 'offline@naenra.xyz', isGuest: true }
      profile.value = {
        id: offlineId,
        username: 'Offline Player',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=OfflinePlayer`,
        elo: 0,
        isGuest: true,
        unlocked_core_ids: []
      }
      isGuest.value = true
    }

    // Restore session_version tracking + realtime subscription on page reload
    const currentToken = localStorage.getItem('arena_token')
    if (currentToken && user.value?.id && navigator.onLine) {
      const version = extractSessionVersionFromToken(currentToken)
      if (version !== null) {
        currentSessionVersion.value = version
        subscribeToSessionChanges(user.value.id)
      }
    }

    loading.value = false

    if (localStorage.getItem('arena_token')) {
      startSessionPolling()
      useMissionsStore().loadUserMissions()
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null
      if (event === 'SIGNED_IN' && user.value) {
        const isFreshOAuthRedirect = window.location.hash.includes('access_token')
        const hasRealToken = hasNonGuestArenaToken()
        if ((isFreshOAuthRedirect || !hasRealToken) && !isExchanging) {
          isExchanging = true
          try {
            await exchangeTokenAfterOAuth()
            cleanOAuthUrlFragment()
            await fetchProfile()
            startSessionPolling()
          } finally {
            isExchanging = false
          }
        }
      }
      if (event === 'SIGNED_OUT') {
        // Suppress the SIGNED_OUT fired by the intentional supabase.auth.signOut()
        // we call at the start of loginWithEmail — that's not a real logout.
        if (isLoggingInWithEmail) return
        // Only clear if no arena token — email login users keep their session
        if (!localStorage.getItem('arena_token')) {
          profile.value = null
          stopSessionPolling()
          unsubscribeSessionChanges()
          currentSessionVersion.value = null
        }
      }
    })
  }

  async function loginWithGoogle() {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/home`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    })
  }

  // Not routed through fetchWithAuth: no arena_token exists yet at this point,
  // this call is what produces the token in the first place.
  async function exchangeTokenAfterOAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    // Drop any existing realtime subscription before the server-side kick
    // broadcast fires (same race-condition guard as loginWithEmail).
    unsubscribeSessionChanges()
    currentSessionVersion.value = null

    try {
      const res = await fetch(`${SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabase_token: session.access_token })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('arena_token', data.token)
        isGuest.value = false
        await fetchProfile()

        if (user.value?.id) {
          _activateSession(data.token, user.value.id, data.user?.session_version)
        }
      }
    } catch (err) {
      console.error('exchangeTokenAfterOAuth failed', err)
    }
  }

  // Not routed through fetchWithAuth: pre-auth endpoint, no token to attach.
  async function registerWithEmail(email: string, password: string, username: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  // Not routed through fetchWithAuth: pre-auth endpoint, no token to attach.
  async function loginWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    // Drop any existing realtime subscription + clear session version BEFORE
    // the login request fires. The server broadcasts session_invalidated
    // (to kick old sessions) before it sends the login response. If this tab
    // still has an old channel subscription alive during that window, it
    // would hear its own kick event and log itself out immediately.
    unsubscribeSessionChanges()
    currentSessionVersion.value = null

    // Sign out any active Supabase Auth session (e.g. a Google OAuth session).
    // Without this, a user logged in via Google who then logs in with the same
    // email via email/password ends up with two concurrent identities:
    // the Supabase OAuth session stays alive in the browser and the
    // onAuthStateChange listener can re-assert the old profile, bypassing
    // the new session's kick logic.
    // The isLoggingInWithEmail flag suppresses the SIGNED_OUT side-effect
    // that would otherwise clear our in-memory state mid-login.
    isLoggingInWithEmail = true
    await supabase.auth.signOut()
    isLoggingInWithEmail = false
    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error }
      localStorage.setItem('arena_token', data.token)
      isGuest.value = false
      user.value = { id: data.user.id, email: data.user.email }
      await fetchProfile()
      startSessionPolling()

      _activateSession(data.token, data.user.id, data.user?.session_version)

      return { success: true }
    } catch {
      return { success: false, error: 'Server error' }
    }
  }

  async function loginAsGuest(): Promise<{ success: boolean }> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${SERVER_URL}/auth/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('arena_token', data.token)
          user.value = { id: data.user.id, email: data.user.email, isGuest: true }
          profile.value = {
            id: data.user.id,
            username: data.user.username,
            avatar_url: data.user.avatar_url,
            elo: data.user.elo,
            isGuest: true
          }
          isGuest.value = true
          useMissionsStore().loadUserMissions()
          return { success: true }
        }
      }
    } catch (err) {
      console.warn('loginAsGuest network failed, fallback to local offline guest:', err)
    }

    // Offline Guest Session Fallback
    const offlineId = 'offline_player_' + Math.floor(Math.random() * 10000)
    user.value = { id: offlineId, email: 'offline@naenra.xyz', isGuest: true }
    profile.value = {
      id: offlineId,
      username: 'Offline Player',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=OfflinePlayer`,
      elo: 0,
      isGuest: true,
      unlocked_core_ids: []
    }
    isGuest.value = true
    return { success: true }
  }

  async function logout() {
    stopSessionPolling()
    unsubscribeSessionChanges()
    currentSessionVersion.value = null
    await supabase.auth.signOut()
    localStorage.removeItem('arena_token')
    user.value = null
    profile.value = null
    isGuest.value = false
    useMissionsStore().resetToInitial()
  }

  async function fetchProfile() {
    const token = localStorage.getItem('arena_token')
    if (!token) return

    let tokenIsGuest = false
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      tokenIsGuest = !!JSON.parse(atob(base64)).isGuest
    } catch {}

    try {
      // fetchWithAuth handles 401 (including SessionInvalidated) globally
      const res = await fetchWithAuth('/api/user/profile')
      if (!res.ok) return
      const data = await res.json()
      profile.value = {
        ...data,
        isGuest: tokenIsGuest
      }
      isGuest.value = tokenIsGuest
    } catch (err) {
      console.error('fetchProfile error:', err)
    }
  }

  return {
    user, profile, loading, isLoggedIn, isFirstPlay, isGuest, isAdmin,
    init, loginWithGoogle, loginWithEmail, loginAsGuest,
    registerWithEmail, logout, fetchProfile,
    exchangeTokenAfterOAuth, skipTutorial, toggleAdminMode
  }
})