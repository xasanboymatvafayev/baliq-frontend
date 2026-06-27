import { AlertTriangle, Trash2, X } from 'lucide-react'

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Ishonchingiz komilmi?',
  description = 'Bu amalni bekor qilib bo\'lmaydi.',
  confirmText = 'Ha, tasdiqlash',
  cancelText = 'Bekor qilish',
  variant = 'danger',
  loading = false,
}) {
  if (!open) return null

  const isDestructive = variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-card w-full max-w-sm p-6 space-y-5 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-2xl shrink-0 ${isDestructive ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
            {isDestructive
              ? <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              : <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-lg">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="secondary-button"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 shadow-lg shadow-rose-500/25'
                : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/25'
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Kutilmoqda...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
