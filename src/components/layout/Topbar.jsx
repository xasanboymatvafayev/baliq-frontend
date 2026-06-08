import { Bell, Menu, Search, UserCircle, LogOut } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '../common/ThemeToggle.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { useState } from 'react'

// Bildirishnomalar tugmasi — real push notification
function NotificationBtn() {
  const [active, setActive] = useState(false)

  const toggle = () => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      setActive(!active)
    } else {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') {
          setActive(true)
          new Notification('Baliq Savdosi', { body: 'Bildirishnomalar yoqildi!' })
        }
      })
    }
  }

  return (
    <button
      className={`secondary-button px-3 relative ${active ? 'text-ocean-600' : ''}`}
      aria-label="Bildirishnomalar"
      onClick={toggle}
      title={Notification?.permission === 'granted' ? 'Bildirishnomalar yoqiq' : 'Bildirishnomalarni yoqish'}
    >
      <Bell className="h-5 w-5" />
      {Notification?.permission !== 'granted' && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
      )}
    </button>
  )
}

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
    pushToast({ title: "Tizimdan chiqildi", variant: 'success' })
    navigate('/login')
  }

  const profilePath = profileRoutes[role] || '/customer/profile'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="secondary-button px-3 lg:hidden" onClick={onMenuClick} aria-label="Menyuni ochish">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">Boshqaruv paneli</p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{title}</h1>
        </div>
        <div className="hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input className="soft-input pl-10" placeholder="Qidirish..." />
          </div>
        </div>
        <ThemeToggle />
        <NotificationBtn />
        <Link to={profilePath} className="secondary-button px-3" aria-label="Profil" title={user ? `${user.firstName} ${user.lastName}` : 'Profil'}>
          <UserCircle className="h-5 w-5" />
        </Link>
        <button className="secondary-button px-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={handleLogout} aria-label="Chiqish" title="Tizimdan chiqish">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
