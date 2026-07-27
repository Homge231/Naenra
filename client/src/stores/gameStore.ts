import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const playerName     = ref<string>('')
  const gameState      = ref<string>('home')
  const activeCoreId   = ref<string | null>(localStorage.getItem('naenra_active_core_id') || null)
  const activeCoreName = ref<string | null>(localStorage.getItem('naenra_active_core_name') || null)
  const coreHistory    = ref<{ id: string, name: string, icon: string }[]>([])
  const sessionId      = ref<string | null>(localStorage.getItem('naenra_session_id') || null)

  function setActiveCore(id: string, name: string) {
    activeCoreId.value = id
    activeCoreName.value = name
    localStorage.setItem('naenra_active_core_id', id)
    localStorage.setItem('naenra_active_core_name', name)
  }

  function setSessionId(id: string | null) {
    sessionId.value = id
    if (id) {
      localStorage.setItem('naenra_session_id', id)
    } else {
      localStorage.removeItem('naenra_session_id')
    }
  }

  return {
    playerName,
    gameState,
    activeCoreId, activeCoreName, coreHistory, sessionId,
    setActiveCore, setSessionId
  }
})