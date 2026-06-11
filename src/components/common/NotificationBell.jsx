import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, CheckCheck, Volume2, VolumeX } from 'lucide-react'
import { useSocket } from '../../hooks/useSocket.js'

// ─── Rington ovozi uchun AudioContext ───────────────────────────
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const freqs = [880, 1100, 1320]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18)
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + i * 0.18 + 0.05)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.18 + 0.3)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.35)
    })
  } catch (_) {}
}

// ─── Browser push notification ──────────────────────────────────
async function sendPushNotification(title, body, icon = '/logo.png') {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    // Service Worker orqali (mobil ham qo'llab-quvvatlaydi)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg?.showNotification) {
        reg.showNotification(title, { body, icon, badge: '/logo.png', vibrate: [200, 100, 200] })
        return
      }
    }
    new Notification(title, { body, icon })
  } catch (_) {}
}

// ─── Ruxsat so'rash ─────────────────────────────────────────────
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ─── Service Worker ro'yxatdan o'tkazish ────────────────────────
async function registerSW() {
  if (!('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch (_) {}
}

const STATUS_LABELS = {
  CONFIRMED: 'Buyurtmangiz tasdiqlandi ✅',
  DRIVER_ASSIGNED: 'Haydovchi biriktirildi 🚚',
  LOADING: 'Buyurtma yuklanmoqda 📦',
  IN_TRANSIT: "Buyurtma yo'lda 🚛",
  DELIVERED: 'Buyurtma yetkazildi ✅',
  CANCELLED: 'Buyurtma bekor qilindi ❌',
}
const TYPE_COLORS = {
  success: 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10',
  error: 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10',
  info: 'border-l-ocean-500 bg-ocean-50/50 dark:bg-ocean-900/10',
  warning: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
}
const TYPE_ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== 'undefined' && Notification?.permission === 'granted'
  )
  const panelRef = useRef(null)

  // ─── Birinchi kirishda ruxsat so'rash ────────────────────────
  useEffect(() => {
    registerSW()
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      // Sahifa yuklangandan 2 soniya keyin so'raymiz — qo'pol ko'rinmasin
      const t = setTimeout(async () => {
        const granted = await requestNotificationPermission()
        setPermissionGranted(granted)
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [])

  // ─── Tashqarida bosilsa panel yopilsin ───────────────────────
  useEffect(() => {
    if (!showPanel) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [showPanel])

  // ─── Bildirishnoma qo'shish ──────────────────────────────────
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 50))
    setUnreadCount((prev) => prev + 1)
    if (soundEnabled) playChime()
    sendPushNotification(notif.title, notif.message)
  }, [soundEnabled])

  // ─── Socket hodisalari ───────────────────────────────────────
  useSocket('notification', (data) => {
    addNotification({
      id: Date.now(),
      title: data.title || 'Yangi bildirishnoma',
      message: data.message || '',
      type: data.type || 'info',
      read: false,
      createdAt: new Date().toISOString(),
    })
  })

  useSocket('order_status_changed', (data) => {
    addNotification({
      id: Date.now(),
      title: 'Buyurtma yangilandi',
      message: STATUS_LABELS[data.status] || `Status: ${data.status}`,
      type: data.status === 'CANCELLED' ? 'error' : 'success',
      read: false,
      createdAt: new Date().toISOString(),
    })
  })

  useSocket('new_order', (data) => {
    addNotification({
      id: Date.now(),
      title: '🆕 Yangi buyurtma!',
      message: `Buyurtma #${data.order_id?.slice(-6)} keldi`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    })
  })

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const removeOne = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
    if (diff < 60) return `${diff} soniya oldin`
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
    return `${Math.floor(diff / 86400)} kun oldin`
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell tugmasi */}
      <button
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
        onClick={() => {
          setShowPanel((v) => !v)
          if (!showPanel) markAllRead()
        }}
        aria-label="Bildirishnomalar"
      >
        <Bell className={`h-5 w-5 transition ${unreadCount > 0 ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] max-h-[32rem] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10 shrink-0">
            <h4 className="font-black text-base">🔔 Bildirishnomalar</h4>
            <div className="flex items-center gap-1">
              {/* Ovoz tugmasi */}
              <button
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
                onClick={() => setSoundEnabled((v) => !v)}
                title={soundEnabled ? "Ovozni o'chirish" : 'Ovozni yoqish'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
              </button>
              {/* Hammasini o'qildi */}
              {notifications.length > 0 && (
                <button
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
                  onClick={markAllRead}
                  title="Hammasini o'qildi deb belgilash"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ruxsat yo'q bo'lsa banner */}
          {!permissionGranted && (
            <div className="mx-3 mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2 shrink-0">
              <span>📵 Push bildirishnomalar o'chirilgan</span>
              <button
                className="font-bold underline whitespace-nowrap"
                onClick={async () => {
                  const ok = await requestNotificationPermission()
                  setPermissionGranted(ok)
                }}
              >
                Ruxsat berish
              </button>
            </div>
          )}

          {/* Bildirishnomalar ro'yxati */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                <div className="text-4xl mb-2">🔕</div>
                Bildirishnomalar yo'q
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`relative flex gap-3 p-3 border-l-4 transition ${TYPE_COLORS[n.type] || TYPE_COLORS.info} ${!n.read ? 'font-semibold' : 'opacity-70'}`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => removeOne(n.id)}
                      className="shrink-0 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 h-6 w-6 flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
