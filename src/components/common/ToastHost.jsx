import { useEffect } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToastStore } from '../../store/toastStore.js'
import { cn } from '../../utils/cn.js'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => dismissToast(toast.id), 4200))
    return () => timers.forEach(window.clearTimeout)
  }, [dismissToast, toasts])

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant] || Info
        return (
          <div
            key={toast.id}
            className={cn(
              'rounded-2xl border bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-slate-900',
              toast.variant === 'success' && 'border-emerald-200',
              toast.variant === 'error' && 'border-rose-200',
            )}
          >
            <div className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 text-ocean-600" />
              <div className="flex-1">
                <p className="font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-slate-500">{toast.description}</p> : null}
              </div>
              <button onClick={() => dismissToast(toast.id)} aria-label="Yopish">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
