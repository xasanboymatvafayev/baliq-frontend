import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore.js'

const CFG = {
  success: { Icon: CheckCircle2, ring: 'border-emerald-200 dark:border-emerald-500/20', iconCls: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
  error:   { Icon: XCircle,      ring: 'border-rose-200 dark:border-rose-500/20',    iconCls: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' },
  info:    { Icon: Info,         ring: 'border-sky-200 dark:border-sky-500/20',      iconCls: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10' },
}

export function ToastHost() {
  const toasts  = useToastStore(s => s.toasts)
  const dismiss = useToastStore(s => s.dismissToast)
  useEffect(() => {
    const ts = toasts.map(t => window.setTimeout(() => dismiss(t.id), 4200))
    return () => ts.forEach(window.clearTimeout)
  }, [toasts, dismiss])

  return (
    <div className="fixed right-4 top-4 z-[999] flex w-[340px] max-w-[calc(100vw-32px)] flex-col gap-2.5">
      {toasts.map(toast => {
        const c = CFG[toast.variant] || CFG.info
        return (
          <div key={toast.id}
            className={`animate-toast-in flex items-start gap-3 rounded-2xl border bg-white dark:bg-[#0d1829] p-4 shadow-float ${c.ring}`}>
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${c.iconCls}`}>
              <c.Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-[13px] text-slate-500">{toast.description}</p>}
            </div>
            <button onClick={() => dismiss(toast.id)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
