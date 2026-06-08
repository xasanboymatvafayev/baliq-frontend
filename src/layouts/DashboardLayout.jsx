import { useMemo, useState, useEffect } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Topbar } from '../components/layout/Topbar.jsx'

// Mobil bottom navigation — faqat 5 ta asosiy element
function MobileBottomNav({ navigation }) {
  const location = useLocation()
  const items = navigation.slice(0, 5)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
      <div className="flex">
        {items.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
                isActive ? 'text-ocean-600 dark:text-ocean-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="max-w-[60px] truncate text-center">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

// Push bildirishnomalar so'rash
function usePushPermission() {
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      // 3 soniyadan keyin so'raymiz (foydalanuvchi sahifaga o'rganib olsin)
      const t = setTimeout(() => {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification('Baliq Savdosi', {
              body: "Bildirishnomalar yoqildi! Yangi buyurtmalar haqida xabar olasiz.",
              icon: '/favicon.ico',
            })
          }
        })
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [])
}

export function DashboardLayout({ navigation, title }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const activeTitle = useMemo(
    () => navigation.find((item) => item.to === location.pathname)?.label || title,
    [location.pathname, navigation, title],
  )

  usePushPermission()

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar navigation={navigation} open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Topbar title={activeTitle} onMenuClick={() => setOpen(true)} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav navigation={navigation} />
    </div>
  )
}
