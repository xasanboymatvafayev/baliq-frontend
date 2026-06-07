import { NavLink } from 'react-router-dom'
import { Fish, X } from 'lucide-react'
import { cn } from '../../utils/cn.js'

export function Sidebar({ navigation, open, onClose }) {
  return (
    <>
      <div className={cn('fixed inset-0 z-30 bg-slate-950/50 lg:hidden', open ? 'block' : 'hidden')} onClick={onClose} />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-slate-950 text-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-ocean-500 p-3 shadow-glow">
              <Fish className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-extrabold">Baliq Savdosi</p>
              <p className="text-xs text-slate-400">Enterprise SaaS</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="Menyuni yopish">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition',
                  isActive ? 'bg-white text-slate-950 shadow-glow' : 'hover:bg-white/10 hover:text-white',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
