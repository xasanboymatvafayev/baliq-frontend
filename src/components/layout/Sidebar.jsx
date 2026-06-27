import { NavLink, useNavigate } from 'react-router-dom'
import { Fish, X, LogOut, ChevronRight } from 'lucide-react'
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
    customer: 'Mijoz',
    'farm-owner': 'Ferma egasi',
    driver: 'Haydovchi',
    admin: 'Administrator',
    manager: 'Menejer',
    'super-admin': 'Super Admin',
  }

  const roleColors = {
    customer: 'from-sky-500 to-blue-600',
    'farm-owner': 'from-emerald-500 to-teal-600',
    driver: 'from-orange-500 to-amber-600',
    admin: 'from-purple-500 to-violet-600',
    manager: 'from-rose-500 to-pink-600',
    'super-admin': 'from-red-500 to-orange-600',
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 lg:hidden transition-all duration-300',
          open ? 'bg-black/50 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0',
        'w-[260px]',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
        style={{ background: 'linear-gradient(180deg, #080f1e 0%, #060c17 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >

        {/* Logo */}
        <div className="flex h-[68px] items-center justify-between px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 12px rgba(14,165,233,0.4)' }}>
              <Fish className="h-4.5 w-4.5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#080f1e]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white leading-tight tracking-tight">Baliq Savdosi</p>
              <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Platform</p>
            </div>
          </div>
          <button
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-xl transition"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
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
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'text-white'
                  : 'hover:text-white',
              )}
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.08))', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }
                : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all"
                    style={isActive
                      ? { background: 'rgba(14,165,233,0.25)', color: '#38bdf8' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
                    }
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {user && (
            <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[11px] font-bold text-white ${roleColors[role] || 'from-sky-500 to-blue-600'}`}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white leading-tight">{user.firstName} {user.lastName}</p>
                <p className="truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{roleLabels[role] || role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 hover:text-rose-400"
            style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <LogOut className="h-3.5 w-3.5" />
            </div>
            Tizimdan chiqish
          </button>
        </div>
      </aside>
    </>
  )
}
