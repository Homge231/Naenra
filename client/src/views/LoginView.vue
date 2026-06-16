<template>
  <div class="flex items-center justify-center min-h-screen bg-background px-4">
    <div class="w-full max-w-sm">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-fixed tracking-widest uppercase">
          ARENA.ENG
        </h1>
        <p class="text-on-surface-variant text-sm mt-2">
          English battle. Real-time. Two players.
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="bg-tertiary/10 border border-tertiary-fixed rounded-lg px-4 py-3 mb-4 text-tertiary-fixed text-sm text-center"
      >
        {{ successMessage }}
      </div>

      <div class="bg-surface-container rounded-xl border border-outline-variant p-8">

        <!-- Tabs -->
        <div class="flex mb-6 bg-surface-container-high rounded-lg p-1">
          <button
            @click="switchMode('login')"
            :class="mode === 'login'
              ? 'bg-primary-fixed text-on-primary'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="flex-1 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-all duration-200"
          >
            Login
          </button>
          <button
            @click="switchMode('register')"
            :class="mode === 'register'
              ? 'bg-primary-fixed text-on-primary'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="flex-1 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-all duration-200"
          >
            Register
          </button>
        </div>

        <!-- Register Form -->
        <div v-if="mode === 'register'" class="space-y-4">
          <div>
            <label class="text-on-surface-variant text-xs uppercase tracking-widest mb-1 block">Username</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="Enter username..."
              class="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:border-primary-fixed focus:outline-none transition-colors"
            />
            <p v-if="errors.username" class="text-error text-xs mt-1">{{ errors.username }}</p>
          </div>

          <div>
            <label class="text-on-surface-variant text-xs uppercase tracking-widest mb-1 block">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter email..."
              class="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:border-primary-fixed focus:outline-none transition-colors"
            />
            <p v-if="errors.email" class="text-error text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="text-on-surface-variant text-xs uppercase tracking-widest mb-1 block">Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Min 6 characters..."
              class="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:border-primary-fixed focus:outline-none transition-colors"
            />
            <p v-if="errors.password" class="text-error text-xs mt-1">{{ errors.password }}</p>
          </div>

          <button
            @click="handleRegister"
            :disabled="loading"
            class="w-full py-3 bg-primary-fixed text-on-primary font-bold rounded-lg hover:opacity-90 transition uppercase tracking-widest disabled:opacity-50"
          >
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </div>

        <!-- Login Form -->
        <div v-if="mode === 'login'" class="space-y-4">
          <div>
            <label class="text-on-surface-variant text-xs uppercase tracking-widest mb-1 block">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter email..."
              class="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:border-primary-fixed focus:outline-none transition-colors"
            />
            <p v-if="errors.email" class="text-error text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="text-on-surface-variant text-xs uppercase tracking-widest mb-1 block">Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Enter password..."
              class="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:border-primary-fixed focus:outline-none transition-colors"
            />
            <p v-if="errors.password" class="text-error text-xs mt-1">{{ errors.password }}</p>
          </div>

          <button
            @click="handleLogin"
            :disabled="loading"
            class="w-full py-3 bg-primary-fixed text-on-primary font-bold rounded-lg hover:opacity-90 transition uppercase tracking-widest disabled:opacity-50"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-outline-variant"></div>
          <span class="text-on-surface-variant text-xs uppercase tracking-widest">or</span>
          <div class="flex-1 h-px bg-outline-variant"></div>
        </div>

        <!-- Google — user must click manually -->
        <button
          @click="handleGoogle"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-3 py-3 bg-surface-container-high border border-outline-variant rounded-lg hover:border-primary-fixed transition-all duration-200 text-on-surface font-bold disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p v-if="errors.general" class="text-error text-sm text-center mt-4">{{ errors.general }}</p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()
const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const successMessage = ref('')

const form = reactive({ username: '', email: '', password: '' })
const errors = reactive({ username: '', email: '', password: '', general: '' })

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

function switchMode(newMode: 'login' | 'register') {
  mode.value = newMode
  clearErrors()
  successMessage.value = ''
  form.username = ''
  form.email = ''
  form.password = ''
}

function clearErrors() {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.general = ''
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm(): boolean {
  clearErrors()
  let valid = true
  if (mode.value === 'register' && !form.username.trim()) {
    errors.username = 'Username is required'
    valid = false
  }
  if (!form.email || !validateEmail(form.email)) {
    errors.email = 'Invalid email format'
    valid = false
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }
  return valid
}

async function handleRegister() {
  if (!validateForm()) return
  loading.value = true
  try {
    const res = await fetch(`${SERVER_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        username: form.username
      })
    })
    const data = await res.json()
    if (!res.ok) {
      errors.general = data.error || 'Registration failed'
      return
    }
    // Redirect to OTP page
    router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`)
  } catch {
    errors.general = 'Server error. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  if (!validateForm()) return
  loading.value = true
  try {
    const res = await fetch(`${SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password })
    })
    const data = await res.json()
    if (!res.ok) {
      errors.general = data.error || 'Login failed'
      return
    }
    localStorage.setItem('arena_token', data.token)
    auth.user = data.user
    router.push('/lobby')
  } catch {
    errors.general = 'Server error. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  loading.value = true
  await auth.loginWithGoogle()
}
</script>
