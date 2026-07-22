import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, CheckCheck, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '../../services/socketClient.js'
import { useAuthStore } from '../../store/authStore.js'
import { useT } from '../../store/i18nStore.js'

// Realtime hodisa turlariga qarab qaysi react-query keshlarini yangilash kerakligi.
// Shu orqali Orders / Bonus / Finance / Farmer / Driver / Admin sahifalari
// foydalanuvchi qo'lda "refresh" qilmasdan avtomatik yangilanadi.
const REALTIME_QUERY_KEYS = [
  ['orders'], ['order-timeline'], ['approved-drivers'],
  ['bonus-balance'], ['pending-orders-pay'],
  ['admin-balance'], ['finance-settings'], ['withdraw-requests'], ['driver-requests'],
  ['driver-orders'], ['order-detail'], ['manager-orders'],
  ['farm-balance'], ['farm-orders-report'], ['driver-locations'],
]

function invalidateForEvent(queryClient) {
  for (const key of REALTIME_QUERY_KEYS) {
    queryClient.invalidateQueries({ queryKey: key })
  }
}

// ─── Qattiq rington ovozi ────────────────────────────────────────
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // 3 ta nota — balandroq va uzoqroq
    const notes = [
      { freq: 880,  start: 0,    dur: 0.5 },
      { freq: 1100, start: 0.2,  dur: 0.5 },
      { freq: 1320, start: 0.4,  dur: 0.7 },
      { freq: 1100, start: 0.7,  dur: 0.4 },
      { freq: 880,  start: 0.95, dur: 0.5 },
    ]

    notes.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()

      // Stereo kengaytirish uchun panner
      const panner = ctx.createStereoPanner()
      panner.pan.value = 0

      osc.connect(gain)
      gain.connect(panner)
      panner.connect(ctx.destination)

      osc.frequency.value = freq
      osc.type = 'sine'

      // Gain envelope — qattiqroq (0.85 gacha)
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)

      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + dur + 0.05)
    })
  } catch (_) {}
}

// ─── Push notification (telefon/brauzer) ─────────────────────────
async function sendPush(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg?.showNotification) {
        reg.showNotification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [300, 100, 300, 100, 300],
          requireInteraction: false,
        })
        return
      }
    }
    new Notification(title, { body, icon: '/logo.png' })
  } catch (_) {}
}

// ─── Role ga qarab sahifa yo'li ──────────────────────────────────
function getRoute(role, navType) {
  const map = {
    customer:    { order: '/customer/orders',  new_order: '/customer/orders',  default: '/customer/dashboard' },
    'farm-owner':{ order: '/farm/orders',      new_order: '/farm/orders',      default: '/farm/dashboard'     },
    driver:      { order: '/driver/orders',    new_order: '/driver/orders',    default: '/driver/dashboard'   },
    admin:       { order: '/admin/orders',     new_order: '/admin/orders',     default: '/admin/dashboard'    },
    manager:     { order: '/manager/orders',   new_order: '/manager/orders',   default: '/manager/dashboard'  },
  }
  return map[role]?.[navType] || map[role]?.default || '/'
}

const STATUS_INFO_UZ = {
  PENDING:         { icon: '⏳', title: 'Buyurtma kutilmoqda',      type: 'info',    nav: 'order' },
  CONFIRMED:       { icon: '✅', title: 'Buyurtma tasdiqlandi',    type: 'success', nav: 'order' },
  DRIVER_ASSIGNED: { icon: '🚚', title: 'Haydovchi biriktirildi', type: 'info',    nav: 'order' },
  LOADING:         { icon: '📦', title: 'Mahsulot yuklanmoqda',    type: 'info',    nav: 'order' },
  IN_TRANSIT:      { icon: '🛣️', title: "Buyurtma yo'lda",        type: 'info',    nav: 'order' },
  DELIVERED:       { icon: '🎉', title: 'Buyurtma yetkazildi!',    type: 'success', nav: 'order' },
  COMPLETED:       { icon: '✅', title: 'Buyurtma yakunlandi',     type: 'success', nav: 'order' },
  CANCELLED:       { icon: '❌', title: 'Buyurtma bekor qilindi',  type: 'error',   nav: 'order' },
  REJECTED:        { icon: '🚫', title: 'Buyurtma rad etildi',    type: 'error',   nav: 'order' },
  EXPIRED:         { icon: '⏰', title: 'Buyurtma muddati tugadi', type: 'warning', nav: 'order' },
}
const STATUS_INFO_RU = {
  PENDING:         { icon: '⏳', title: 'Заказ ожидает',           type: 'info',    nav: 'order' },
  CONFIRMED:       { icon: '✅', title: 'Заказ подтверждён',    type: 'success', nav: 'order' },
  DRIVER_ASSIGNED: { icon: '🚚', title: 'Назначен водитель',     type: 'info',    nav: 'order' },
  LOADING:         { icon: '📦', title: 'Товар загружается',     type: 'info',    nav: 'order' },
  IN_TRANSIT:      { icon: '🛣️', title: 'Заказ в пути',          type: 'info',    nav: 'order' },
  DELIVERED:       { icon: '🎉', title: 'Заказ доставлен!',      type: 'success', nav: 'order' },
  COMPLETED:       { icon: '✅', title: 'Заказ завершён',        type: 'success', nav: 'order' },
  CANCELLED:       { icon: '❌', title: 'Заказ отменён',          type: 'error',   nav: 'order' },
  REJECTED:        { icon: '🚫', title: 'Заказ отклонён',        type: 'error',   nav: 'order' },
  EXPIRED:         { icon: '⏰', title: 'Срок заказа истёк',      type: 'warning', nav: 'order' },
}

const TYPE_COLORS = {
  success: 'border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-900/10',
  error:   'border-l-rose-500 bg-rose-50/70 dark:bg-rose-900/10',
  info:    'border-l-ocean-500 bg-ocean-50/70 dark:bg-ocean-900/10',
  warning: 'border-l-amber-500 bg-amber-50/70 dark:bg-amber-900/10',
}

function timeAgo(iso, lang) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (lang === 'ru') {
    if (s < 60) return `${s} сек назад`
    if (s < 3600) return `${Math.floor(s/60)} мин назад`
    if (s < 86400) return `${Math.floor(s/3600)} ч назад`
    return `${Math.floor(s/86400)} дн назад`
  }
  if (s < 60) return `${s}s oldin`
  if (s < 3600) return `${Math.floor(s/60)} daq oldin`
  if (s < 86400) return `${Math.floor(s/3600)} soat oldin`
  return `${Math.floor(s/86400)} kun oldin`
}

export function NotificationBell() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const token     = useAuthStore((s) => s.token)
  const role      = useAuthStore((s) => s.role)
  const t         = useT()
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel]         = useState(false)
  const [unreadCount, setUnreadCount]     = useState(0)
  const [soundOn, setSoundOn]             = useState(true)
  const [permission, setPermission]       = useState('default')
  const [permAsked, setPermAsked]         = useState(false)
  const panelRef  = useRef(null)
  const soundRef  = useRef(true)

  // soundRef ni sync qilib turish (closure muammosini hal qilish)
  useEffect(() => { soundRef.current = soundOn }, [soundOn])

  // ─── Permission holati ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
    // SW ro'yxatdan o'tkazish
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // ─── Ruxsat so'rash — faqat click orqali (brauzer qoidasi) ─────
  const handleAskPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    setPermAsked(true)
    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      if (res === 'granted') {
        if (soundRef.current) playChime()
        sendPush('Baliq Savdosi 🐟', t.notifEnabled)
      }
    } catch (_) {}
  }, [])

  // ─── Bildirishnoma qo'shish (barqaror ref orqali) ────────────
  const notifsRef = useRef([])
  const addNotif = useCallback((notif) => {
    const n = { ...notif, id: `${Date.now()}-${Math.random()}`, read: false, createdAt: new Date().toISOString() }
    notifsRef.current = [n, ...notifsRef.current].slice(0, 50)
    setNotifications([...notifsRef.current])
    setUnreadCount((p) => p + 1)
    if (soundRef.current) playChime()
    sendPush(notif.title, notif.message || '')
  }, [])

  // ─── Socket — to'g'ridan-to'g'ri ulash (useSocket hook bypass) ─
  useEffect(() => {
    if (!token) return
    const socket = getSocket(token)
    socket.connect()

    const STATUS_INFO = t.lang === 'ru' ? STATUS_INFO_RU : STATUS_INFO_UZ
    const handlers = {
      notification: (data) => {
        invalidateForEvent(queryClient)
        addNotif({
          title: data.title || t.notifNewNotif,
          message: data.message || '',
          type: data.type || 'info',
          navType: data.nav_type || 'default',
          orderId: data.order_id,
        })
      },
      order_status_changed: (data) => {
        invalidateForEvent(queryClient)
        const info = STATUS_INFO[data.status] || { icon: '🔔', title: t.notifOrderUpdated, type: 'info', nav: 'order' }
        addNotif({
          title: info.title,
          message: `#${String(data.order_id || '').slice(-6)} ${info.icon}`,
          type: info.type,
          navType: info.nav,
          orderId: data.order_id,
        })
      },
      new_order: (data) => {
        invalidateForEvent(queryClient)
        addNotif({
          title: t.notifNewOrder,
          message: `#${String(data.order_id || '').slice(-6)} — ${t.notifNewOrderMsg}`,
          type: 'info',
          navType: 'new_order',
          orderId: data.order_id,
        })
      },
      driver_assigned: (data) => {
        invalidateForEvent(queryClient)
        addNotif({
          title: `🚚 ${t.notifDriverAssigned}`,
          message: `#${String(data.order_id || '').slice(-6)} — ${t.notifDriverAssignedMsg}`,
          type: 'info',
          navType: 'order',
          orderId: data.order_id,
        })
      },
    }

    Object.entries(handlers).forEach(([ev, fn]) => socket.on(ev, fn))
    return () => {
      Object.entries(handlers).forEach(([ev, fn]) => socket.off(ev, fn))
    }
  }, [token, addNotif, t, queryClient])

  // ─── Panel tashqarisini click ────────────────────────────────
  useEffect(() => {
    if (!showPanel) return
    const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false) }
    document.addEventListener('mousedown', h)
    document.addEventListener('touchstart', h)
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h) }
  }, [showPanel])

  const markAllRead = () => {
    notifsRef.current = notifsRef.current.map((n) => ({ ...n, read: true }))
    setNotifications([...notifsRef.current])
    setUnreadCount(0)
  }

  const removeOne = (id) => {
    notifsRef.current = notifsRef.current.filter((n) => n.id !== id)
    setNotifications([...notifsRef.current])
    setUnreadCount((p) => Math.max(0, p - 1))
  }

  const handleClick = (notif) => {
    notifsRef.current = notifsRef.current.map((n) => n.id === notif.id ? { ...n, read: true } : n)
    setNotifications([...notifsRef.current])
    setUnreadCount((p) => Math.max(0, p - 1))
    setShowPanel(false)
    navigate(getRoute(role, notif.navType))
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* ─── Bell tugmasi ─── */}
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
        onClick={() => {
          // Ruxsat so'rash — foydalanuvchi bosganda (brauzer ruxsat beradi)
          if (permission === 'default' && !permAsked) {
            handleAskPermission()
          }
          setShowPanel((v) => !v)
          if (!showPanel && unreadCount > 0) markAllRead()
        }}
        aria-label={t.notifTitle}
      >
        <Bell className={`h-4.5 w-4.5 ${unreadCount > 0 ? 'text-ocean-600 dark:text-ocean-400' : ''}`} />
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#07101e] animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Ruxsat berilmagan dot */}
        {permission !== 'granted' && unreadCount === 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>

      {/* ─── Panel ─── */}
      {showPanel && (
        <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 max-h-[80vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-float dark:border-white/10 dark:bg-slate-900 overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-ocean-600" />
              <h4 className="font-black text-sm">{t.notifTitle}</h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setSoundOn((v) => !v) }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition"
                title={soundOn ? t.notifSoundOff : t.notifSoundOn}
              >
                {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 text-rose-400" />}
              </button>
              {notifications.length > 0 && (
                <button onClick={markAllRead} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition" title={t.notifMarkAllRead}>
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => setShowPanel(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Ruxsat banner */}
          {permission !== 'granted' && (
            <div className="mx-3 mt-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-3 flex items-center justify-between gap-2 shrink-0">
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200">{t.notifPushOff}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{t.notifPushOffDesc}</p>
              </div>
              <button
                className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-white transition hover:bg-amber-600"
                onClick={handleAskPermission}
              >
                {t.notifEnable}
              </button>
            </div>
          )}

          {/* Ro'yxat */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-5xl mb-3">🔕</div>
                <p className="text-sm font-semibold text-slate-500">{t.notifEmpty}</p>
                <p className="text-xs text-slate-400 mt-1">{t.notifEmptyDesc}</p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`relative flex gap-3 px-4 py-3 border-l-[3px] cursor-pointer transition-all
                      hover:brightness-[0.97] dark:hover:brightness-110
                      ${TYPE_COLORS[n.type] || TYPE_COLORS.info}
                      ${!n.read ? '' : 'opacity-55'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-ocean-500 shrink-0 animate-pulse" />
                        )}
                        <p className={`text-sm leading-snug ${!n.read ? 'font-black text-slate-900 dark:text-white' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                          {n.title}
                        </p>
                      </div>
                      {n.message && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2 pl-4">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 pl-4">{timeAgo(n.createdAt, t.lang)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeOne(n.id) }}
                      className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-200 hover:text-slate-500 dark:hover:bg-white/10 transition"
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
