import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppError {
  id: number
  type: 'error' | 'success' | 'warning'
  message: string
  duration?: number
  description?: string
  action?: { label: string; callback: () => void }
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

  function clearErrors() {
    errors.value = []
  }

  function handleError(error: unknown, context = 'An error occurred') {
    const message = error instanceof Error ? error.message : context
    addError({ type: 'error', message, duration: 5000 })
  }

  return { errors, addError, removeError, clearErrors, handleError }
})