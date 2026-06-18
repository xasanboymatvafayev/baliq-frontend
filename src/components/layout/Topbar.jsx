import { Menu, Search, UserCircle, LogOut, Bell } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '../common/ThemeToggle.jsx'
import { NotificationBell } from '../common/NotificationBell.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'

export function Topbar({ onMenuClick, title }) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const pushToast = useToastStore((s) => s.pushToast)

  const profileRoutes = {
    customer: '/customer/profile',
    'farm-owner': '/farm/profile',
    driver: '/driver/profile',
    admin: '/admin/settings',
    manager: '/manager/dashboard',
    'super-admin': '/super-admin/system-settings',
  }

  const handleLogout = () => {
    logout()
    pushToast({ title: 'Tizimdan chiqildi', variant: 'success' })
    navigate('/login')
  }

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'BS'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#07101e]/90 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobil menu */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 lg:hidden"
          onClick={onMenuClick}
          aria-label="Menyu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Sarlavha */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h1>
        </div>

        {/* Qidiruv */}
        <div className="hidden max-w-52 flex-1 md:block lg:max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition
                         focus:border-ocean-400 focus:bg-white focus:ring-2 focus:ring-ocean-100
                         dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10 dark:focus:ring-ocean-900/40"
              placeholder="Qidirish..."
            />
          </div>
        </div>

        {/* O'ng tomondagi tugmalar */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />

          {/* Avatar */}
          <Link
            to={profileRoutes[role] || '/customer/profile'}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 text-xs font-black text-white shadow-glow-sm transition hover:shadow-glow hover:scale-105"
            title={user ? `${user.firstName} ${user.lastName}` : 'Profil'}
          >
            {initials}
          </Link>

          {/* Chiqish */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
            onClick={handleLogout}
            title="Tizimdan chiqish"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
