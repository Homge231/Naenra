import { useErrorStore } from '../stores/errorStore'

export function useErrorBoundary() {
  const errorStore = useErrorStore()

  function handleError(error: unknown, context = 'An error occurred') {
    console.error(context, error)
    return errorStore.handleError(error, context)
  }

  function captureError(callback: () => void, context = 'An error occurred') {
    try {
      callback()
    } catch (error) {
      handleError(error, context)
    }
  }

  async function captureAsyncError<T>(
    asyncFn: () => Promise<T>,
    context = 'An error occurred'
  ): Promise<T | null> {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }

  return {
    handleError,
    captureError,
    captureAsyncError
  }
}
