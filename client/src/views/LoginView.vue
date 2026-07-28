<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 overflow-hidden relative font-sans selection:bg-orange-300/50 flex flex-col items-center justify-center">
    
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-300/30 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-red-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
      <div class="absolute top-[45%] left-[5%] w-[40vw] h-[40vw] bg-blue-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-[5%] left-[35%] w-[35vw] h-[35vw] bg-purple-300/20 rounded-full mix-blend-multiply blur-[90px] animate-pulse-slow" style="animation-delay: 1.5s;"></div>
      <div class="absolute bottom-[5%] left-[30%] w-[50vw] h-[50vw] bg-yellow-300/20 rounded-full mix-blend-multiply blur-[120px] animate-float-delayed" style="animation-delay: 3s;"></div>

      <div v-for="letter in floatingLetters" :key="letter.id"
        class="absolute top-0 font-black uppercase text-gray-300 select-none animate-matrix-drift opacity-50"
        :style="{
          left: letter.left + '%',
          fontSize: letter.size + 'rem',
          animationDelay: letter.delay + 's',
          animationDuration: letter.duration + 's'
        }">
        {{ letter.char }}
      </div>
    </div>

    <div class="relative z-10 w-full max-w-md p-8 md:p-10 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border-2 border-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] transform transition-all hover:shadow-[0_15px_50px_rgba(251,146,60,0.1)]">
      
      <div class="mb-8 flex flex-col items-center">
        <div class="w-16 h-16 mb-4 flex items-center justify-center transform -skew-x-12 shadow-[4px_4px_0_rgba(255,123,0,0.5)] bg-white/5 border border-white/10">
          <svg class="w-10 h-10 text-orange fill-current transform skew-x-12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <h1 class="text-4xl font-black mb-2 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-lg uppercase italic">
          Naenra
        </h1>
        <p class="text-lightBlue font-bold tracking-[0.2em] text-[10px] uppercase">
          TYPING ESPORTS ARENA
        </p>
      </div>

      <div v-if="sessionInvalidatedMessage" class="bg-red-50 border-2 border-red-100 rounded-2xl px-4 py-3 mb-6 text-red-500 text-xs font-bold text-center tracking-wider shadow-sm">
        {{ sessionInvalidatedMessage }}
      </div>

      <div v-if="successMessage" class="bg-green-50 border-2 border-green-100 rounded-2xl px-4 py-3 mb-6 text-green-600 text-xs font-bold text-center tracking-wider shadow-sm">
        {{ successMessage }}
      </div>

      <div class="flex mb-8 bg-gray-100/80 rounded-2xl p-1.5 border border-gray-200 shadow-inner">
        <button
          @click="switchMode('login')"
          :class="mode === 'login' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-400 hover:text-gray-700'"
          class="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300"
        >
          Login
        </button>
        <button
          @click="switchMode('register')"
          :class="mode === 'register' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-400 hover:text-gray-700'"
          class="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300"
        >
          Register
        </button>
      </div>

      <div v-if="mode === 'register'" class="space-y-4">
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
          <input
            v-model="form.username"
            @keyup.enter="handleRegister"
            type="text"
            placeholder="Player_One"
            class="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black text-sm placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
          />
          <p v-if="errors.username" class="text-red-500 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-wider">{{ errors.username }}</p>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
          <input
            v-model="form.email"
            @keyup.enter="mode === 'register' ? handleRegister() : handleLogin()"
            type="email"
            placeholder="player@naenra.com"
            class="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black text-sm placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
          />
          <p v-if="errors.email" class="text-red-500 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-wider">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
          <input
            v-model="form.password"
            @keyup.enter="handleRegister"
            type="password"
            placeholder="••••••••"
            class="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black text-sm placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
          />
          <p v-if="errors.password" class="text-red-500 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-wider">{{ errors.password }}</p>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            @keyup.enter="handleRegister"
            type="password"
            placeholder="••••••••"
            class="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black text-sm placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
          />
          <p v-if="errors.confirmPassword" class="text-red-500 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-wider">{{ errors.confirmPassword }}</p>
        </div>

        <button
          @click="handleRegister"
          :disabled="loading"
          class="group relative w-full mt-6 bg-gradient-to-r from-orange-400 to-red-500 text-white font-black py-4 rounded-2xl shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]"
        >
          <div class="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -translate-x-[150%] animate-shimmer"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'INITIALIZING...' : 'CREATE ACCOUNT' }}
          </span>
        </button>
      </div>

      <div v-if="mode === 'login'" class="space-y-4">
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
          <input
            v-model="form.email"
            @keyup.enter="handleLogin"
            type="email"
            placeholder="player@naenra.com"
            class="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black text-sm placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
          />
          <p v-if="errors.email" class="text-red-500 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-wider">{{ errors.email }}</p>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2 px-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
            <button
              type="button" 
              @click="router.push('/forgot-password')"
              class="text-[10px] text-orange-500 hover:text-red-500 transition-colors font-black uppercase tracking-widest"
            >
              Forgot?
            </button>
          </div>
          <input
            v-model="form.password"
            @keyup.enter="handleLogin"
            type="password"
            placeholder="••••••••"
            class="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black text-sm placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
          />
          <p v-if="errors.password" class="text-red-500 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-wider">{{ errors.password }}</p>
        </div>

        <label class="flex items-center gap-3 cursor-pointer group mt-2 px-1">
          <div class="relative">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="sr-only"
            />
            <div
              class="w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center"
              :class="rememberMe
                ? 'bg-gradient-to-br from-orange-400 to-red-500 border-transparent'
                : 'bg-white border-gray-300 group-hover:border-orange-400'"
            >
              <svg v-if="rememberMe" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span class="text-xs font-bold text-gray-400 group-hover:text-gray-800 transition-colors uppercase tracking-widest">
            Remember me
          </span>
        </label>

        <button
          @click="handleLogin"
          :disabled="loading"
          class="group relative w-full mt-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-black py-4 rounded-2xl shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]"
        >
          <div class="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -translate-x-[150%] animate-shimmer"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'AUTHENTICATING...' : 'ENTER ARENA' }}
          </span>
        </button>
      </div>

      <div class="relative flex py-8 items-center">
        <div class="flex-grow border-t border-gray-200"></div>
        <span class="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-black tracking-[0.2em] uppercase">SYSTEM OVERRIDE</span>
        <div class="flex-grow border-t border-gray-200"></div>
      </div>

      <button
        @click="handleGoogle"
        :disabled="loading"
        class="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-300 text-gray-600 text-xs font-black tracking-widest uppercase disabled:opacity-50 shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        CONNECT WITH GOOGLE
      </button>

      <p v-if="errors.general" class="text-red-500 bg-red-50 border border-red-100 rounded-xl py-2 text-[10px] font-black text-center mt-6 animate-pulse uppercase tracking-wider shadow-sm">
        >> ERROR: {{ errors.general }}
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const successMessage = ref('')
const sessionInvalidatedMessage = ref('')
const rememberMe = ref(false)

const REMEMBER_ME_KEY = 'arena_remember_me'
const SAVED_EMAIL_KEY = 'arena_saved_email'

const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const errors = reactive({ username: '', email: '', password: '', confirmPassword: '', general: '' })

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

// TẠO MẢNG ALPHABET TỪ HOMEVIEW CHUYỂN SANG
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const floatingLetters = alphabet.map((char, index) => {
  return {
    id: index,
    char: char,
    left: Math.random() * 95,
    size: 2 + Math.random() * 5,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 20
  }
})

onMounted(() => {
  // Restore remembered email if present
  const remembered = localStorage.getItem(REMEMBER_ME_KEY)
  const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY)
  if (remembered === 'true' && savedEmail) {
    form.email = savedEmail
    rememberMe.value = true
  }

  // Show banner if user was force-logged-out because their account
  // logged in from another tab/device (see fetchWithAuth in services/api.ts)
  if (route.query.reason === 'session_invalidated') {
    sessionInvalidatedMessage.value = 'Your account has been logged in from another device. You have been signed out.'
    router.replace({ query: {} })
  }
})

function switchMode(newMode: 'login' | 'register') {
  mode.value = newMode
  clearErrors()
  successMessage.value = ''
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
}

function clearErrors() {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.general = ''
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm(): boolean {
  clearErrors()
  let valid = true
  if (mode.value === 'register') {
    if (!form.username.trim()) {
      errors.username = 'Username is required'
      valid = false
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      valid = false
    }
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
    const result = await auth.loginWithEmail(form.email, form.password)
    if (!result.success) {
      errors.general = result.error || 'Login failed'
      return
    }

    // Handle remember me
    if (rememberMe.value) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true')
      localStorage.setItem(SAVED_EMAIL_KEY, form.email)
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY)
      localStorage.removeItem(SAVED_EMAIL_KEY)
    }

    router.push('/home')
  } catch {
    errors.general = 'Server error. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  loading.value = true
  await auth.loginWithGoogle()
  // Note: page will redirect; loading state doesn't need to be reset
}
</script>

<style scoped>
/* Khối màu Pastel trôi lơ lửng */
.animate-float-slow {
  animation: floatSky 12s ease-in-out infinite alternate;
}
.animate-float-delayed {
  animation: floatSky 15s ease-in-out infinite alternate-reverse;
}
.animate-pulse-slow {
  animation: pulseBlob 8s ease-in-out infinite alternate;
}

@keyframes floatSky {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, -40px) scale(1.1); }
}

@keyframes pulseBlob {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.1); opacity: 0.5; }
}

/* HIỆU ỨNG CHỮ CHẢY THẲNG ĐỨNG TỪ DƯỚI LÊN */
.animate-matrix-drift {
  animation-name: drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}

@keyframes drift {
  0% { 
    transform: translateY(110vh);
    opacity: 0; 
  }
  10% { 
    opacity: 0.2; 
  }
  90% { 
    opacity: 0.2; 
  }
  100% { 
    transform: translateY(-20vh);
    opacity: 0; 
  }
}

/* HIỆU ỨNG CHỚP SÁNG CHO BUTTONS */
.animate-shimmer {
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}
</style>