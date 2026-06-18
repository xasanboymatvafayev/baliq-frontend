import { NavLink, useNavigate } from 'react-router-dom'
import { Fish, X, LogOut } from 'lucide-react'
import { cn } from '../../utils/cn.js'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'

export function Sidebar({ navigation, open, onClose }) {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const pushToast = useToastStore((s) => s.pushToast)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    pushToast({ title: 'Tizimdan chiqildi', variant: 'success' })
    navigate('/login')
    onClose?.()
  }

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'BS'

  const roleLabels = {
    customer: 'Mijoz', 'farm-owner': 'Ferma egasi', driver: 'Haydovchi',
    admin: 'Admin', manager: 'Menejer', 'super-admin': 'Super Admin',
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn('fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose}
      />

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0',
        'border-r border-white/[0.07] bg-[#07101e]',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="flex h-[72px] items-center justify-between px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 p-2.5 shadow-glow-sm">
              <Fish className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-black text-white leading-tight">Baliq Savdosi</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">Enterprise Platform</p>
            </div>
          </div>
          <button
            className="lg:hidden rounded-xl p-1.5 text-slate-500 hover:bg-white/10 hover:text-white transition"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
                isActive
                  ? 'bg-ocean-600 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                    isActive ? 'bg-white/20' : 'bg-white/[0.04]',
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User va logout */}
        <div className="px-3 pb-5 pt-3 border-t border-white/[0.06]">
          {user && (
            <div className="flex items-center gap-3 rounded-2xl px-3 py-3 mb-2 bg-white/[0.04]">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center text-xs font-black text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500 truncate">{roleLabels[role] || role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04]">
              <LogOut className="h-4 w-4" />
            </div>
            Tizimdan chiqish
          </button>
        </div>
      </aside>
    </>
  )
}
