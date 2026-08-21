const CACHE_NAME = 'naenra-app-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.webmanifest'
]

// 1. Install Event: Cache core shell immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err)
      })
    })
  )
  self.skipWaiting()
})

// 2. Activate Event: Take control and prune old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Pruning old cache:', key)
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// 3. Fetch Event: Cache first for assets, network first with fallback for navigation & API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET, WebSockets, or browser extensions
  if (event.request.method !== 'GET' || url.protocol.startsWith('ws') || url.protocol === 'chrome-extension:') {
    return
  }

  // API Requests: Network first, return offline JSON fallback if disconnected
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, message: 'Offline Mode Active' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Navigation requests (HTML pages): Network first, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/')
        })
    )
    return
  }

  // Static Assets (JS, CSS, Images, Fonts): Cache-first with background revalidation & caching
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background fetch to keep cache fresh
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse))
          }
        }).catch(() => {})
        return cachedResponse
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return networkResponse
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/favicon.svg')
        }
      })
    })
  )
})
