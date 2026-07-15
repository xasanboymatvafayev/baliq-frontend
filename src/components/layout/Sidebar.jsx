import { NavLink, useNavigate } from 'react-router-dom'
import { Fish, X, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { useT } from '../../store/i18nStore.js'

const ROLE_CFG = {
  customer:     { label:'Mijoz',         from:'from-sky-500',    to:'to-blue-600',     ring:'shadow-sky-500/30' },
  'farm-owner': { label:'Ferma egasi',   from:'from-emerald-500',to:'to-teal-600',     ring:'shadow-emerald-500/30' },
  driver:       { label:'Haydovchi',     from:'from-amber-500',  to:'to-orange-600',   ring:'shadow-amber-500/30' },
  admin:        { label:'Administrator', from:'from-purple-500', to:'to-violet-600',   ring:'shadow-purple-500/30' },
  manager:      { label:'Menejer',       from:'from-rose-500',   to:'to-pink-600',     ring:'shadow-rose-500/30' },
  'super-admin':{ label:'Super Admin',   from:'from-red-500',    to:'to-orange-500',   ring:'shadow-red-500/30' },
}

export function Sidebar({ navigation, open, onClose }) {
  const logout    = useAuthStore(s => s.logout)
  const user      = useAuthStore(s => s.user)
  const role      = useAuthStore(s => s.role)
  const pushToast = useToastStore(s => s.pushToast)
  const navigate  = useNavigate()

  const cfg = ROLE_CFG[role] || ROLE_CFG.customer
  const t = useT()
  const initials = user ? `${user.firstName?.[0]||''}${user.lastName?.[0]||''}`.toUpperCase() : 'BS'
  const roleLabels = {
    customer: t.roleCustomer, 'farm-owner': t.roleFarmOwner, driver: t.roleDriver,
    admin: t.roleAdmin, manager: t.roleManager, 'super-admin': t.roleSuperAdmin,
  }

  const handleLogout = () => {
    logout()
    pushToast({ title: t.loggedOut, variant: 'success' })
    navigate('/login')
    onClose?.()
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col lg:static lg:translate-x-0 transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: 256,
          background: 'linear-gradient(180deg, #09101f 0%, #060b16 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 62, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.from} ${cfg.to} shadow-lg ${cfg.ring}`}>
              <Fish className="h-[18px] w-[18px] text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#09101f] animate-pulse-soft" />
            </div>
            <div>
              <p className="text-[14px] font-bold leading-tight" style={{ color: '#f0f6ff' }}>Baliq Savdosi</p>
              <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navigation.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 border
                 ${isActive
                   ? `bg-white/[0.07] border-white/[0.08] text-white`
                   : `border-transparent hover:bg-white/[0.04] hover:border-white/[0.05]`
                 }`
              }
              style={({ isActive }) => ({ color: isActive ? '#fff' : 'rgba(255,255,255,0.42)' })}
            >
              {({ isActive }) => (
                <>
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all ${isActive ? `bg-gradient-to-br ${cfg.from} ${cfg.to}` : 'bg-white/[0.06] group-hover:bg-white/[0.09]'}`}>
                    <item.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="flex-1 truncate">{item.key && t[item.key] ? t[item.key] : item.label}</span>
                  {isActive && <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${cfg.from} ${cfg.to} flex-shrink-0`} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {user && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.from} ${cfg.to} text-[11px] font-bold text-white`}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold" style={{ color: '#f0f6ff' }}>{user.firstName} {user.lastName}</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{roleLabels[role] || cfg.label}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 border border-transparent hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 group"
            style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'inherit', cursor: 'pointer', background: 'transparent' }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] group-hover:bg-rose-500/15 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            {t.logout}
          </button>
        </div>
      </aside>
    </>
  )
}
