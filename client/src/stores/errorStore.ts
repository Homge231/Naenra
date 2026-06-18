import { defineStore } from 'pinia'
import { ref } from 'vue'

interface AppError {
  id: number
  type: 'error' | 'success' | 'warning'
  message: string
  duration?: number
}

export const useErrorStore = defineStore('error', () => {
  const errors = ref<AppError[]>([])
  let nextId = 0

  function addError(error: Omit<AppError, 'id'>) {
    const id = nextId++
    errors.value.push({ ...error, id })
    if (error.duration) {
      setTimeout(() => removeError(id), error.duration)
    }
  }

  function removeError(id: number) {
    errors.value = errors.value.filter(e => e.id !== id)
  }

  return { errors, addError, removeError }
})
