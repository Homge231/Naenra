// client/src/services/api.ts

/**
 * Global fetch wrapper that automatically attaches the JWT auth token
 * to all requests, ensuring secure access to backend routes.
 */

const BASE_URL = 'http://localhost:3000' // Ensure this matches your backend URL

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('arena_token')
  
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  // Optional: you could handle 401 Unauthorized globally here
  // if (response.status === 401) {
  //   localStorage.removeItem('arena_token')
  //   window.location.href = '/login'
  // }

  return response
}
