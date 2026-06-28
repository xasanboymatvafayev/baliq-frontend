import { useState, useEffect, useCallback } from 'react'
import { httpClient } from '../services/api/index.js'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [status, setStatus] = useState('idle') // idle | loading | granted | denied | unsupported
  const [subscription, setSubscription] = useState(null)

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window

  useEffect(() => {
    if (!isSupported) { setStatus('unsupported'); return }
    // Check existing permission
    if (Notification.permission === 'granted') setStatus('granted')
    else if (Notification.permission === 'denied') setStatus('denied')
  }, [isSupported])

  const subscribe = useCallback(async () => {
    if (!isSupported) return
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        const options = { userVisibleOnly: true }
        if (VAPID_PUBLIC_KEY) {
          try { options.applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) } catch {}
        }
        sub = await reg.pushManager.subscribe(options)
      }

      setSubscription(sub)
      setStatus('granted')

      // Save to backend
      try {
        await httpClient.post('/notifications/subscribe', {
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
            auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
          },
        })
      } catch (_) {}
    } catch (_) {
      setStatus('denied')
    }
  }, [isSupported])

  // Local fallback: show notification via SW if no VAPID
  const showLocal = useCallback((title, body, url = '/') => {
    if (!isSupported || Notification.permission !== 'granted') return
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: { url },
      })
    })
  }, [isSupported])

  return { status, subscription, subscribe, showLocal, isSupported }
}
