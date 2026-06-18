import { Link } from 'react-router-dom'
import { Fish } from 'lucide-react'

export function AuthFormShell({ title, description, children, footer }) {
  return (
    <div className="animate-slide-up">
      <div className="mb-7">
        <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-slate-400">{description}</p>
        )}
      </div>

      <div className="space-y-1">{children}</div>

      {footer && (
        <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link
          to="/farm-registration"
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          🏡 Ferma ro'yxati
        </Link>
        <Link
          to="/driver-registration"
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          🚚 Haydovchi ro'yxati
        </Link>
      </div>
    </div>
  )
}
