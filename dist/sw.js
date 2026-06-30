const CACHE_NAME = 'baliq-savdosi-v3'
const OFFLINE_URL = '/offline.html'

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ── Install ───────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache core assets; ignore failures (missing icons etc.)
      await Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {})))
      // Cache an offline fallback page
      const offlineHtml = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Internet yo'q — Baliq Savdosi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #07101e; color: #e2e8f0; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; text-align: center; padding: 24px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px; padding: 48px 32px; max-width: 400px; }
    .emoji { font-size: 64px; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 900; margin-bottom: 12px; color: #f1f5f9; }
    p  { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    button { background: #0b93cc; color: white; border: none; border-radius: 16px;
             padding: 14px 32px; font-size: 15px; font-weight: 700; cursor: pointer;
             transition: opacity .15s; }
    button:hover { opacity: .85; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🌊</div>
    <h1>Internet yo'q</h1>
    <p>Baliq Savdosi ga ulanish uchun internet kerak.<br>Iltimos, ulanishingizni tekshiring va qayta urinib ko'ring.</p>
    <button onclick="location.reload()">🔄 Qayta urinish</button>
  </div>
</body>
</html>`
      return cache.put(OFFLINE_URL, new Response(offlineHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
    })
  )
})

// ── Activate ──────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
    ])
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, chrome-extension, non-http
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return
  if (!url.protocol.startsWith('http')) return

  // API requests: network-only, no cache
  if (url.pathname.startsWith('/api') || url.hostname.includes('nominatim') || url.hostname.includes('openstreetmap')) {
    return
  }

  // Navigation (HTML pages): network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          // Return offline page
          return caches.match(OFFLINE_URL) || caches.match('/index.html')
        })
    )
    return
  }

  // Static assets (.js, .css, images, fonts): stale-while-revalidate
  const isStatic = /\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|svg|ico|webp|gif)$/i.test(url.pathname)
  if (isStatic) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request)
        const networkPromise = fetch(request).then((res) => {
          if (res.ok) cache.put(request, res.clone())
          return res
        }).catch(() => cached)
        return cached || networkPromise
      })
    )
    return
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// ── Push notifications ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload
  try { payload = event.data.json() }
  catch { payload = { title: 'Baliq Savdosi', body: event.data.text() } }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Baliq Savdosi', {
      body: payload.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: payload.tag || 'default',
      renotify: true,
      data: { url: payload.url || '/' },
      actions: payload.actions || [],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
