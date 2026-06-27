import { useEffect, useState } from 'react'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [showBack, setShowBack] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setVisible(true)
      setShowBack(false)
    } else if (visible) {
      setShowBack(true)
      setTimeout(() => {
        setShowBack(false)
        setVisible(false)
      }, 3000)
    }
  }, [isOnline])

  if (!visible) return null

  if (showBack) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[998] animate-toast-in">
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-600 text-white px-5 py-3 shadow-float text-sm font-semibold">
          <Wifi className="h-4 w-4 shrink-0" />
          Internet qayta ulandi ✅
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[998] animate-toast-in w-[calc(100vw-2rem)] max-w-sm">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 shadow-float">
        <div className="flex items-center gap-2.5 min-w-0">
          <WifiOff className="h-4 w-4 shrink-0 text-rose-400 dark:text-rose-600" />
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">Internet yo'q</p>
            <p className="text-xs opacity-60 leading-tight">Ulanishni tekshiring</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 px-3 py-1.5 text-xs font-bold shrink-0 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Qayta urinish
        </button>
      </div>
    </div>
  )
}
