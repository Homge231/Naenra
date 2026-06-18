<template>
  <div class="min-h-screen flex items-center justify-center bg-darkNavy text-white relative overflow-hidden">
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-md p-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      
      <div class="mb-8 text-center">
        <h1 class="text-6xl font-black mb-2 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-lg">
          NAENRA
        </h1>
        <p class="text-lightBlue font-semibold tracking-[0.2em] text-sm uppercase">
          Create Account
        </p>
      </div>

      <div v-if="isLoading" class="mb-6 flex items-center justify-center space-x-2 text-lightOrange">
        <svg class="animate-spin h-5 w-5 text-lightOrange" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Processing...</span>
      </div>

      <form @submit.prevent="handleSignUp" class="space-y-4">
        
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input 
            :value="email" 
            @input="e => onEmailInput((e.target as HTMLInputElement).value)"
            type="email" 
            placeholder="player@naenra.com"
            :class="['w-full bg-darkNavy/50 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors', emailError ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-blue']"
          />
          <p v-if="emailError" class="text-red-400 text-xs mt-1">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input 
            :value="password" 
            @input="e => onPasswordInput((e.target as HTMLInputElement).value)"
            type="password" 
            placeholder="••••••••"
            :class="['w-full bg-darkNavy/50 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors', passwordError ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-blue']"
          />
          <p v-if="passwordError" class="text-red-400 text-xs mt-1">{{ passwordError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
          <input 
            :value="confirmPassword" 
            @input="e => onConfirmPasswordInput((e.target as HTMLInputElement).value)"
            type="password" 
            placeholder="••••••••"
            :class="['w-full bg-darkNavy/50 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors', confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-blue']"
          />
          <p v-if="confirmPasswordError" class="text-red-400 text-xs mt-1">{{ confirmPasswordError }}</p>
        </div>

        <button 
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="w-full bg-gradient-to-r from-orange to-hexred text-white font-bold py-3.5 px-4 rounded-xl mt-4 hover:shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Account
        </button>
      </form>

      <div class="relative flex py-6 items-center">
        <div class="flex-grow border-t border-white/10"></div>
        <span class="flex-shrink-0 mx-4 text-gray-500 text-xs font-semibold uppercase">OR</span>
        <div class="flex-grow border-t border-white/10"></div>
      </div>

      <button 
        @click="handleGoogleLogin"
        :disabled="isLoading"
        class="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </button>

      <p class="mt-6 text-center text-sm text-gray-400">
        Already have an account? 
        <button @click="router.push('/login')" class="text-lightOrange hover:text-orange font-semibold transition-colors">
          Login here
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useErrorStore } from '../stores/errorStore'

// --- Setup ---
const router = useRouter()
const auth = useAuthStore()
const errorStore = useErrorStore()

// --- State ---
const isLoading = ref<boolean>(false)
const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')

// --- Errors ---
const emailError = ref<string>('')
const passwordError = ref<string>('')
const confirmPasswordError = ref<string>('')

// --- Computed ---
const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         confirmPassword.value && 
         !emailError.value && 
         !passwordError.value && 
         !confirmPasswordError.value
})

// --- Validation Logic ---
const validateEmail = (val: string) => {
  if (!val) return 'Required'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'Invalid email'
}

const validatePassword = (val: string) => {
  if (!val) return 'Required'
  return val.length >= 6 ? '' : 'Min 6 chars'
}

const validateConfirmPassword = (val: string) => {
  if (!val) return 'Required'
  return val === password.value ? '' : 'Mismatch'
}

// --- Input Handlers ---
const onEmailInput = (val: string) => {
  email.value = val
  emailError.value = validateEmail(val)
}

const onPasswordInput = (val: string) => {
  password.value = val
  passwordError.value = validatePassword(val)
  if (confirmPassword.value) confirmPasswordError.value = validateConfirmPassword(confirmPassword.value)
}

const onConfirmPasswordInput = (val: string) => {
  confirmPassword.value = val
  confirmPasswordError.value = validateConfirmPassword(val)
}

// --- Submit Handlers ---
const handleSignUp = async () => {
  // Final check
  emailError.value = validateEmail(email.value)
  passwordError.value = validatePassword(password.value)
  confirmPasswordError.value = validateConfirmPassword(confirmPassword.value)

  if (!isFormValid.value) return

  isLoading.value = true
  try {
    const res = await auth.registerWithEmail(email.value, password.value) // Ensure name matches your store
    if (res.success) {
      errorStore.addError({ type: 'success', message: 'Account created! Please login.', duration: 3000 })
      router.push('/login')
    }
  } catch (err) {
    errorStore.addError({ type: 'error', message: 'Signup failed', duration: 3000 })
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  isLoading.value = true
  try {
    await auth.loginWithGoogle()
  } finally {
    isLoading.value = false
  }
}
</script>