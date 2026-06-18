import { useMemo, useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Topbar } from '../components/layout/Topbar.jsx'
import { cn } from '../utils/cn.js'

function MobileBottomNav({ navigation }) {
  const location = useLocation()
  const items = navigation.slice(0, 5)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#07101e]/95 lg:hidden">
      <div className="flex safe-area-pb">
        {items.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-3 transition-colors"
            >
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200',
                isActive
                  ? 'bg-ocean-600 text-white shadow-glow-sm scale-110'
                  : 'text-slate-400 dark:text-slate-500',
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'text-[10px] font-semibold max-w-[56px] truncate text-center',
                isActive ? 'text-ocean-600 dark:text-ocean-400' : 'text-slate-400 dark:text-slate-500',
              )}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export function DashboardLayout({ navigation, title }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const activeTitle = useMemo(
    () => navigation.find((item) => item.to === location.pathname)?.label || title,
    [location.pathname, navigation, title],
  )

  return (
    <div className="min-h-screen lg:flex bg-slate-50 dark:bg-[#07101e]">
      <Sidebar navigation={navigation} open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1 flex flex-col pb-20 lg:pb-0">
        <Topbar title={activeTitle} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav navigation={navigation} />
    </div>
  )
}
