import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useErrorStore } from './errorStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const profile = ref<any>(null)
  const loading = ref(true)
  const errors = useErrorStore()

  const isLoggedIn = computed(() => !!user.value)

  async function init() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      user.value = session?.user ?? null
      if (user.value) await fetchProfile()
      loading.value = false
    } catch (error) {
      errors.handleError(error, 'Failed to initialize auth session')
      loading.value = false
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      try {
        user.value = session?.user ?? null
        if (event === 'SIGNED_IN' && user.value) {
          await fetchProfile()
          window.location.href = '/lobby'
        }
        if (event === 'SIGNED_OUT') {
          profile.value = null
          window.location.href = '/'
        }
      } catch (error) {
        errors.handleError(error, 'Auth state change failed')
      }
    })
  }

  async function loginWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      user.value = data.user
      await fetchProfile()
      return { success: true }
    } catch (error: any) {
      errors.addError({
        type: 'error',
        message: 'Login Failed',
        description: 'Wrong email or password'
      })
      return { success: false, error }
    }
  }

  async function loginWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/lobby`
        }
      })
      if (error) throw error
    } catch (error: any) {
      const message = error?.message || 'Google login failed'
      errors.addError({
        type: 'error',
        message: 'Google Login Failed',
        description: message,
        duration: 6000
      })
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      profile.value = null
      errors.addError({
        type: 'success',
        message: 'Logged out successfully',
        duration: 3000
      })
    } catch (error) {
      errors.handleError(error, 'Logout failed')
    }
  }

  async function fetchProfile() {
    if (!user.value) return
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.value.id)
        .single()
      if (error) throw error
      profile.value = data
    } catch (error: any) {
      console.warn('Profile fetch error:', error)
      // Don't show error to user for profile fetch - it's non-critical
    }
  }

  return {
    user, profile, loading, isLoggedIn,
    init, loginWithEmail, loginWithGoogle, logout, fetchProfile
  }
})
