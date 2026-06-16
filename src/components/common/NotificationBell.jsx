import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, CheckCheck, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../../hooks/useSocket.js'
import { useAuthStore } from '../../store/authStore.js'

// ─── Rington ovozi ───────────────────────────────────────────────
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

// ─── Push notification yuborish ──────────────────────────────────
async function sendPush(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg?.showNotification) {
        reg.showNotification(title, { body, icon: '/logo.png', vibrate: [200, 100, 200] })
        return
      }
    }
    new Notification(title, { body, icon: '/logo.png' })
  } catch (_) {}
}

// ─── Ruxsat so'rash ──────────────────────────────────────────────
async function askPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const res = await Notification.requestPermission()
  return res === 'granted'
}

// ─── Role ga qarab sahifa yo'li ──────────────────────────────────
function getRouteByRole(role, type, orderId) {
  const routes = {
    customer: {
      order: `/customer/orders`,
      new_order: `/customer/orders`,
      default: `/customer/dashboard`,
    },
    'farm-owner': {
      order: `/farm/orders`,
      new_order: `/farm/orders`,
      default: `/farm/dashboard`,
    },
    driver: {
      order: `/driver/orders`,
      new_order: `/driver/orders`,
      default: `/driver/dashboard`,
    },
    admin: {
      order: `/admin/orders`,
      new_order: `/admin/orders`,
      default: `/admin/dashboard`,
    },
    manager: {
      order: `/manager/orders`,
      new_order: `/manager/orders`,
      default: `/manager/dashboard`,
    },
  }
  return routes[role]?.[type] || routes[role]?.default || '/'
}

// ─── Bildirishnoma turi va matni ─────────────────────────────────
const STATUS_INFO = {
  CONFIRMED:      { icon: '✅', title: 'Buyurtma tasdiqlandi',      type: 'success', nav: 'order' },
  DRIVER_ASSIGNED:{ icon: '🚚', title: 'Haydovchi biriktirildi',    type: 'info',    nav: 'order' },
  LOADING:        { icon: '📦', title: 'Mahsulot yuklanmoqda',       type: 'info',    nav: 'order' },
  IN_TRANSIT:     { icon: '🛣️', title: "Buyurtma yo'lda",           type: 'info',    nav: 'order' },
  DELIVERED:      { icon: '🎉', title: 'Buyurtma yetkazildi!',       type: 'success', nav: 'order' },
  CANCELLED:      { icon: '❌', title: 'Buyurtma bekor qilindi',     type: 'error',   nav: 'order' },
}

const TYPE_COLORS = {
  success: 'border-l-green-500 bg-green-50/60 dark:bg-green-900/10',
  error:   'border-l-rose-500 bg-rose-50/60 dark:bg-rose-900/10',
  info:    'border-l-ocean-500 bg-ocean-50/60 dark:bg-ocean-900/10',
  warning: 'border-l-amber-500 bg-amber-50/60 dark:bg-amber-900/10',
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s oldin`
  if (diff < 3600) return `${Math.floor(diff / 60)} daq oldin`
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
  return `${Math.floor(diff / 86400)} kun oldin`
}

// ─── Asosiy komponent ────────────────────────────────────────────
export function NotificationBell() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' ? Notification?.permission : 'default'
  )
  const panelRef = useRef(null)

  // ─── Kirganida ruxsat so'rash ────────────────────────────────
  useEffect(() => {
    // SW ro'yxatdan o'tkazish
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    // 1.5 soniyada ruxsat so'rash
    if (typeof window !== 'undefined' && Notification?.permission === 'default') {
      const t = setTimeout(async () => {
        const ok = await askPermission()
        setPermission(ok ? 'granted' : 'denied')
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [])

  // ─── Tashqarida bosilsa yopish ───────────────────────────────
  useEffect(() => {
    if (!showPanel) return
    const h = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false)
    }
    document.addEventListener('mousedown', h)
    document.addEventListener('touchstart', h)
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h) }
  }, [showPanel])

  // ─── Bildirishnoma qo'shish ──────────────────────────────────
  const add = useCallback((notif) => {
    setNotifications((p) => [{ ...notif, id: Date.now() + Math.random(), read: false, createdAt: new Date().toISOString() }, ...p].slice(0, 50))
    setUnreadCount((p) => p + 1)
    if (soundOn) playChime()
    sendPush(notif.title, notif.message || notif.body || '')
  }, [soundOn])

  // ─── Socket hodisalari ───────────────────────────────────────
  useSocket('notification', (data) => {
    add({ title: data.title || 'Yangi bildirishnoma', message: data.message || '', type: data.type || 'info', navType: data.nav_type || 'default', orderId: data.order_id })
  })
  useSocket('order_status_changed', (data) => {
    const info = STATUS_INFO[data.status] || { icon: '🔔', title: 'Buyurtma yangilandi', type: 'info', nav: 'order' }
    add({ title: info.title, message: `Buyurtma #${String(data.order_id || '').slice(-6)} • ${info.icon}`, type: info.type, navType: info.nav, orderId: data.order_id })
  })
  useSocket('new_order', (data) => {
    add({ title: '🆕 Yangi buyurtma keldi!', message: `Buyurtma #${String(data.order_id || '').slice(-6)}`, type: 'info', navType: 'new_order', orderId: data.order_id })
  })
  useSocket('driver_assigned', (data) => {
    add({ title: '🚚 Haydovchi biriktirildi', message: `Buyurtma #${String(data.order_id || '').slice(-6)} uchun haydovchi tayinlandi`, type: 'info', navType: 'order', orderId: data.order_id })
  })

  const markAllRead = () => { setNotifications((p) => p.map((n) => ({ ...n, read: true }))); setUnreadCount(0) }
  const removeOne = (id) => { setNotifications((p) => p.filter((n) => n.id !== id)); setUnreadCount((p) => Math.max(0, p - 1)) }

  const handleNotifClick = (notif) => {
    // O'qildi deb belgilanadi
    setNotifications((p) => p.map((n) => n.id === notif.id ? { ...n, read: true } : n))
    setUnreadCount((p) => Math.max(0, p - 1))
    setShowPanel(false)
    // Tegishli sahifaga o'tish
    const path = getRouteByRole(role, notif.navType || 'default', notif.orderId)
    navigate(path)
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell tugmasi */}
      <button
        className="secondary-button px-3 relative"
        onClick={() => { setShowPanel((v) => !v); if (!showPanel && unreadCount > 0) markAllRead() }}
        aria-label="Bildirishnomalar"
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-ocean-600' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {permission !== 'granted' && unreadCount === 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
        )}
      </button>

      {/* Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 max-h-[80vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10 shrink-0">
            <h4 className="font-black text-base">🔔 Bildirishnomalar</h4>
            <div className="flex items-center gap-1">
              <button onClick={() => setSoundOn((v) => !v)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500" title={soundOn ? "Ovoz o'chir" : 'Ovoz yoq'}>
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
              </button>
              {notifications.length > 0 && (
                <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500" title="Hammasini o'qildi">
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setShowPanel(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ruxsat banner */}
          {permission !== 'granted' && (
            <div className="mx-3 mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2 shrink-0">
              <span>📵 Push bildirishnomalar o'chirilgan</span>
              <button className="font-bold underline whitespace-nowrap" onClick={async () => { const ok = await askPermission(); setPermission(ok ? 'granted' : 'denied') }}>
                Ruxsat berish
              </button>
            </div>
          )}

          {/* Ro'yxat */}
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
                    className={`relative flex gap-3 p-3 border-l-4 cursor-pointer transition hover:brightness-95 active:scale-[0.99] ${TYPE_COLORS[n.type] || TYPE_COLORS.info} ${!n.read ? '' : 'opacity-60'}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="h-2 w-2 rounded-full bg-ocean-500 shrink-0" />}
                        <p className={`text-sm truncate ${!n.read ? 'font-black' : 'font-semibold'}`}>{n.title}</p>
                      </div>
                      {n.message && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeOne(n.id) }}
                      className="shrink-0 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 h-6 w-6 flex items-center justify-center self-start"
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
