import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useSocket } from '../../hooks/useSocket.js'

export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Socket orqali bildirishnomalar tinglash
  useSocket('notification', (data) => {
    const notification = {
      id: Date.now(),
      title: data.title || 'Yangi bildirishnoma',
      message: data.message || '',
      type: data.type || 'info',
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [notification, ...prev].slice(0, 50))
    setUnreadCount((prev) => prev + 1)

    // Browser notification (agar ruxsat berilgan bo'lsa)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, { body: notification.message })
    }
  })

  // Buyurtma status o'zgarganda
  useSocket('order_status_changed', (data) => {
    const statusLabels = {
      CONFIRMED: 'Buyurtmangiz tasdiqlandi ✅',
      DRIVER_ASSIGNED: 'Haydovchi biriktirildi 🚚',
      LOADING: 'Buyurtma yuklanmoqda 📦',
      IN_TRANSIT: "Buyurtma yo'lda 🚛",
      DELIVERED: 'Buyurtma yetkazildi ✅',
      CANCELLED: 'Buyurtma bekor qilindi ❌',
    }
    const notification = {
      id: Date.now(),
      title: 'Buyurtma yangilandi',
      message: statusLabels[data.status] || `Status: ${data.status}`,
      type: data.status === 'CANCELLED' ? 'error' : 'success',
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [notification, ...prev].slice(0, 50))
    setUnreadCount((prev) => prev + 1)

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, { body: notification.message })
    }
  })

  // Browser notification ruxsat so'rash
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const TYPE_COLORS = {
    success: 'border-l-green-500',
    error: 'border-l-rose-500',
    info: 'border-l-ocean-500',
  }

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
        onClick={() => { setShowPanel(!showPanel); if (!showPanel) markAllRead() }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
            <h4 className="font-bold">Bildirishnomalar</h4>
            <button onClick={() => setShowPanel(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Bildirishnomalar yo'q
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 border-l-4 ${TYPE_COLORS[n.type] || TYPE_COLORS.info} ${!n.read ? 'bg-slate-50 dark:bg-white/5' : ''}`}>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
