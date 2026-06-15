import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppError {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  description?: string
  duration?: number // ms, 0 = persistent
  action?: {
    label: string
    callback: () => void
  }
}

export const useErrorStore = defineStore('error', () => {
  const errors = ref<AppError[]>([])
  const lastError = ref<AppError | null>(null)

  function addError(error: Omit<AppError, 'id'>) {
    const id = `${Date.now()}-${Math.random()}`
    const appError: AppError = {
      ...error,
      id,
      duration: error.duration ?? 5000
    }
    errors.value.push(appError)
    lastError.value = appError

    // Auto-remove after duration if set
    if ((appError.duration ?? 0) > 0) {
      setTimeout(() => removeError(id), appError.duration as number)
    }

    return id
  }

  function removeError(id: string) {
    const idx = errors.value.findIndex(e => e.id === id)
    if (idx !== -1) errors.value.splice(idx, 1)
  }

  function clearErrors() {
    errors.value = []
    lastError.value = null
  }

  function handleError(error: unknown, defaultMessage = 'An error occurred') {
    let message = defaultMessage
    let description = ''

    if (error instanceof Error) {
      message = error.message || defaultMessage
      description = error.stack ? error.stack.split('\n')[1] : ''
    } else if (typeof error === 'string') {
      message = error
    }

    console.error('App Error:', { message, description, originalError: error })

    return addError({
      type: 'error',
      message,
      description
    })
  }

  return {
    errors,
    lastError,
    addError,
    removeError,
    clearErrors,
    handleError
  }
})
