<template>
  <div class="min-h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans flex flex-col items-center justify-center">
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <div class="relative z-10 w-full max-w-md p-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">

      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="router.push('/home')" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">
          Profile
        </h1>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <svg class="animate-spin w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else>
        <!-- Avatar -->
        <div class="flex flex-col items-center mb-8">
          <div class="relative group">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue to-lightBlue p-0.5">
              <img
                :src="displayAvatar"
                :alt="form.username"
                class="w-full h-full rounded-full object-cover bg-darkNavy"
                @error="(e) => (e.target as HTMLImageElement).src = fallbackAvatar"
              />
            </div>
            <div
              v-if="editMode"
              class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="triggerFileInput"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p v-if="editMode" class="text-xs text-gray-500 mt-2 uppercase tracking-widest">
            Click avatar to change
          </p>
          <p v-if="editMode && uploadedBase64" class="text-xs text-success mt-1 font-semibold">
            ✓ New image selected
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">ELO</p>
            <p class="text-2xl font-black text-orange">{{ profile.elo }}</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Rank</p>
            <p class="text-lg font-black text-lightBlue uppercase">{{ profile.rank }}</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Wins</p>
            <p class="text-xl font-black text-success">{{ profile.wins }}</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Losses</p>
            <p class="text-xl font-black text-hexred">{{ profile.losses }}</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Matches</p>
            <p class="text-xl font-black text-white">{{ profile.total_matches }}</p>
          </div>
        </div>

        <!-- View mode -->
        <div v-if="!editMode" class="space-y-3">
          <div class="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Username</p>
            <p class="text-white font-bold">{{ profile.username }}</p>
          </div>
          <button
            @click="enterEditMode"
            class="w-full mt-4 bg-white/5 border border-white/10 text-white font-black py-3.5 rounded-xl hover:bg-white/10 hover:border-orange transition-all duration-300 uppercase tracking-widest text-sm group relative overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
            <span class="relative z-10">Edit Profile</span>
          </button>
        </div>

        <!-- Edit mode -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
            <input
              v-model="form.username"
              type="text"
              maxlength="30"
              placeholder="Your username"
              class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-colors"
            />
          </div>

          <p v-if="errorMsg" class="text-hexred text-xs font-bold text-center uppercase tracking-wider">{{ errorMsg }}</p>
          <p v-if="successMsg" class="text-success text-xs font-bold text-center uppercase tracking-wider">{{ successMsg }}</p>

          <div class="flex gap-3 mt-2">
            <button
              @click="cancelEdit"
              class="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              :disabled="saving"
              class="flex-1 py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl hover:border-orange transition-all duration-300 uppercase tracking-widest text-sm group relative overflow-hidden disabled:opacity-50"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
              <span class="relative z-10">{{ saving ? 'Saving...' : 'Save' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

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

// Removed local fetchProfile in favor of authStore.fetchProfile()

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

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    errorMsg.value = 'Image must be under 2MB'
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    uploadedBase64.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
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
  // If profile isn't loaded globally yet, try to load it
  if (!authStore.profile) {
    await authStore.fetchProfile()
  }
  form.value.username = profile.value.username
  loading.value = false
})
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>