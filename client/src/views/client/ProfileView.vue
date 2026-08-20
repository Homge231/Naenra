<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange-300/50 flex flex-col">
    
    <!-- Background Ambient Blobs -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-300/30 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-red-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
      <div class="absolute top-[45%] left-[5%] w-[40vw] h-[40vw] bg-blue-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-[5%] left-[35%] w-[35vw] h-[35vw] bg-purple-300/20 rounded-full mix-blend-multiply blur-[90px] animate-pulse-slow" style="animation-delay: 1.5s;"></div>
      <div class="absolute bottom-[5%] left-[30%] w-[50vw] h-[50vw] bg-yellow-300/20 rounded-full mix-blend-multiply blur-[120px] animate-float-delayed" style="animation-delay: 3s;"></div>

      <div v-for="letter in floatingLetters" :key="letter.id"
        class="absolute top-0 font-black uppercase text-gray-300 select-none animate-matrix-drift"
        :style="{
          left: letter.left + '%',
          fontSize: letter.size + 'rem',
          animationDelay: letter.delay + 's',
          animationDuration: letter.duration + 's'
        }">
        {{ letter.char }}
      </div>
    </div>

    <!-- Header Navigation -->
    <header class="relative z-20 flex justify-between items-center p-3 sm:p-4 lg:px-8">
      <div class="flex items-center gap-2 sm:gap-3 cursor-pointer bg-white/70 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-white/60 active:scale-95 transition-transform"
        @click="router.push('/home')">
        <button class="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-gray-700 rounded-full shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900">Back to Home</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60">
          Player Profile
        </span>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="relative z-10 flex-1 w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto px-4 py-2 sm:py-6 flex flex-col justify-center">

      <div class="w-full bg-white/85 backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] border-2 border-white p-5 sm:p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

        <div v-if="loading" class="flex justify-center py-12">
          <svg class="animate-spin w-10 h-10 text-gray-900" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else>
          <!-- User Avatar & Identity Header -->
          <div class="flex flex-col items-center mb-6 sm:mb-8 relative">
            <div class="relative group cursor-pointer" :class="{ 'cursor-default': !editMode }">
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-[3px] shadow-lg">
                <img
                  :key="displayAvatar"
                  :src="displayAvatar"
                  :alt="form.username"
                  class="w-full h-full rounded-full object-cover bg-white border-2 border-white"
                  @error="(e) => (e.target as HTMLImageElement).src = fallbackAvatar"
                />
              </div>
              
              <div
                v-if="editMode"
                class="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-[3px] border-transparent"
                @click="triggerFileInput"
              >
                <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
            </div>
            
            <div v-if="!editMode" class="mt-3 sm:mt-4 text-center">
              <h2 class="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{{ profile.username }}</h2>
            </div>

            <p v-if="editMode" class="text-xs font-bold text-gray-600 mt-3 uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
              Click avatar to change
            </p>
            <p v-if="editMode && uploadedBase64" class="text-xs text-green-600 mt-2 font-bold animate-pulse">
              ✓ New image selected
            </p>
          </div>

          <!-- ELO Rating & Rank Grid -->
          <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div class="bg-gradient-to-br from-orange-50 to-orange-100/80 border border-orange-200/80 rounded-2xl p-3.5 sm:p-5 text-center shadow-sm">
              <p class="text-[10px] sm:text-xs font-bold text-orange-600/70 uppercase tracking-widest mb-0.5 sm:mb-1">ELO Rating</p>
              <p class="text-2xl sm:text-3xl font-black text-orange-600">{{ profile.elo }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/80 rounded-2xl p-3.5 sm:p-5 text-center shadow-sm flex flex-col justify-center">
              <p class="text-[10px] sm:text-xs font-bold text-blue-600/70 uppercase tracking-widest mb-0.5 sm:mb-1">Rank</p>
              <p class="text-lg sm:text-xl font-black text-blue-600 uppercase">{{ profile.rank }}</p>
            </div>
          </div>
          
          <!-- Match Statistics Bar -->
          <div class="bg-gray-50/90 border border-gray-200/60 rounded-2xl py-3.5 sm:py-4 flex items-center shadow-inner mb-6 sm:mb-8">
            <div class="flex-1 text-center border-r border-gray-200">
              <p class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Wins</p>
              <p class="text-lg sm:text-xl font-black text-green-500">{{ profile.wins }}</p>
            </div>
            <div class="flex-1 text-center border-r border-gray-200">
              <p class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Losses</p>
              <p class="text-lg sm:text-xl font-black text-red-500">{{ profile.losses }}</p>
            </div>
            <div class="flex-1 text-center">
              <p class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Matches</p>
              <p class="text-lg sm:text-xl font-black text-gray-800">{{ profile.total_matches }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="!editMode" class="space-y-3">
            <button
              @click="enterEditMode"
              class="group relative w-full h-12 sm:h-14 bg-gray-900 text-white font-black text-xs sm:text-sm tracking-widest uppercase rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:bg-black transition-all duration-300 overflow-hidden active:scale-[0.98] cursor-pointer"
            >
              <div class="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full -translate-x-[150%] animate-shimmer"></div>
              <span class="relative z-10 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Edit Profile
              </span>
            </button>
            
            <button
              @click="handleReplayTutorial"
              class="w-full bg-white border-2 border-gray-200 text-gray-600 font-black h-11 sm:h-12 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reset Tutorial
            </button>

            <p v-if="successMsg" class="text-green-600 text-xs font-bold text-center uppercase tracking-wider bg-green-50 py-2.5 rounded-xl border border-green-100 animate-fade-in mt-3">{{ successMsg }}</p>
          </div>

          <div v-else class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input
                v-model="form.username"
                type="text"
                maxlength="30"
                placeholder="Your username"
                class="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-3.5 sm:py-4 text-gray-900 font-black text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm text-center"
              />
            </div>

            <p v-if="errorMsg" class="text-red-500 text-xs font-bold text-center uppercase tracking-wider bg-red-50 py-2.5 rounded-xl border border-red-100">{{ errorMsg }}</p>
            <p v-if="successMsg" class="text-green-600 text-xs font-bold text-center uppercase tracking-wider bg-green-50 py-2.5 rounded-xl border border-green-100">{{ successMsg }}</p>

            <div class="flex gap-3 mt-6">
              <button
                @click="cancelEdit"
                class="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-500 font-black rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-widest text-xs active:scale-[0.98] shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="handleSave"
                :disabled="saving"
                class="group relative flex-1 py-3.5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300 uppercase tracking-widest text-xs overflow-hidden disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                <div class="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full -translate-x-[150%] animate-shimmer"></div>
                <span class="relative z-10 flex items-center justify-center gap-2">
                  <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  <svg v-else class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ saving ? 'Saving...' : 'Save' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useTutorial } from '../../composables/useTutorial'

const router = useRouter()
const authStore = useAuthStore()
const tutorial = useTutorial()

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const uploadedBase64 = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const profile = computed(() => authStore.profile || {
  username: '',
  avatar_url: '',
  elo: 0,
  rank: 'Bronze',
  wins: 0,
  losses: 0,
  total_matches: 0
})

const form = ref({
  username: ''
})

const fallbackAvatar = computed(() =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.value.username || 'Player'}`
)

const displayAvatar = computed(() => {
  if (uploadedBase64.value) return uploadedBase64.value
  if (profile.value.avatar_url) return profile.value.avatar_url
  return fallbackAvatar.value
})

// MẢNG ALPHABET TỪ HOMEVIEW CHUYỂN SANG
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

function handleReplayTutorial() {
  tutorial.resetTutorial()
  errorMsg.value = ''
  successMsg.value = '✓ Tutorial reset! It will show again on your next match.'
  setTimeout(() => {
    successMsg.value = ''
  }, 4000)
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function enterEditMode() {
  form.value.username = profile.value.username
  uploadedBase64.value = ''
  errorMsg.value = ''
  successMsg.value = ''
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
  uploadedBase64.value = ''
  errorMsg.value = ''
  successMsg.value = ''
}

function compressImage(file: File, maxWidth = 512, maxHeight = 512, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const compressed = canvas.toDataURL(mimeType, quality)
        resolve(compressed)
      }
      img.onerror = () => reject(new Error('Failed to parse image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Allow up to 10MB raw photos from user device
  if (file.size > 10 * 1024 * 1024) {
    errorMsg.value = 'Image must be under 10MB'
    return
  }

  errorMsg.value = ''
  try {
    const compressed = await compressImage(file, 512, 512, 0.88)
    uploadedBase64.value = compressed
  } catch (err) {
    console.warn('Image compression fallback to raw data URL:', err)
    const reader = new FileReader()
    reader.onload = (ev) => {
      uploadedBase64.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function handleSave() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.value.username.trim()) {
    errorMsg.value = 'Username cannot be empty'
    return
  }

  const finalAvatarUrl = uploadedBase64.value || profile.value.avatar_url

  saving.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        username: form.value.username.trim(),
        avatar_url: finalAvatarUrl
      })
    })
    const data = await res.json()
    if (!res.ok) {
      errorMsg.value = data.error || 'Update failed'
      return
    }

    if (authStore.profile) {
      authStore.profile.username = data.profile.username
      authStore.profile.avatar_url = data.profile.avatar_url || ''
      authStore.profile.elo = data.profile.elo ?? authStore.profile.elo
      authStore.profile.rank = data.profile.rank || authStore.profile.rank
      authStore.profile.wins = data.profile.wins ?? authStore.profile.wins
      authStore.profile.losses = data.profile.losses ?? authStore.profile.losses
      authStore.profile.total_matches = data.profile.total_matches ?? authStore.profile.total_matches
    }
    
    uploadedBase64.value = ''

    successMsg.value = 'Profile updated!'
    editMode.value = false
  } catch (err) {
    errorMsg.value = 'Server error. Please try again.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!authStore.profile) {
    await authStore.fetchProfile()
  }
  form.value.username = profile.value.username
  loading.value = false
})

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

/* HIỆU ỨNG CHỮ CHẢY THẲNG ĐỨNG TỪ DƯỚI LÊN (Bê từ Home qua) */
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