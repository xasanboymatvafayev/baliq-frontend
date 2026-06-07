import { Link } from 'react-router-dom'

export function AuthFormShell({ title, description, children, footer }) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-7">{children}</div>
      {footer ? <div className="mt-6 text-center text-sm text-slate-500">{footer}</div> : null}
      <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs font-semibold">
        <Link className="rounded-2xl bg-slate-100 px-3 py-2 hover:text-ocean-700 dark:bg-white/10" to="/farm-registration">
          Ferma ro‘yxati
        </Link>
        <Link className="rounded-2xl bg-slate-100 px-3 py-2 hover:text-ocean-700 dark:bg-white/10" to="/driver-registration">
          Haydovchi ro‘yxati
        </Link>
      </div>
    </div>
  )
}
