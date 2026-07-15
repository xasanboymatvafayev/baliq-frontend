import { useT } from '../../store/i18nStore.js'
import { Link } from 'react-router-dom'

export function AuthFormShell({ title, description, children, footer }) {
  const t = useT()
  return (
    <div className="animate-scale-in">
      <div className="mb-6">
        <h2 className="text-[22px] font-black text-white tracking-tight">{title}</h2>
        {description && <p className="mt-1.5 text-[14px] leading-relaxed text-white/40">{description}</p>}
      </div>
      {children}
      {footer && <div className="mt-5 text-center text-[13.5px] text-white/35">{footer}</div>}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[
          { to: '/farm-registration',   e: '🏡', l: t.farmList },
          { to: '/driver-registration', e: '🚚', l: t.driverList },
        ].map(({ to, e, l }) => (
          <Link key={to} to={to}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] font-semibold text-white/35 transition-all hover:border-sky-500/25 hover:bg-sky-500/[0.07] hover:text-white/65">
            {e} {l}
          </Link>
        ))}
      </div>
    </div>
  )
}
