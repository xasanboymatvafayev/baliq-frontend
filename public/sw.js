self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Baliq Savdosi', {
      body: data.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
