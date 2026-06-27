import { useMemo, useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Topbar } from '../components/layout/Topbar.jsx'
import { cn } from '../utils/cn.js'

function MobileBottomNav({ navigation }) {
  const location = useLocation()
  const items = navigation.slice(0, 5)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: 'rgba(8,15,30,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {items.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-all"
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200',
                  isActive ? 'scale-110' : '',
                )}
                style={isActive
                  ? { background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(14,165,233,0.1))', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }
                  : { color: 'rgba(255,255,255,0.35)' }
                }
              >
                <item.icon className="h-[18px] w-[18px]" />
              </div>
              <span
                className="text-[10px] font-semibold max-w-[52px] truncate text-center"
                style={{ color: isActive ? '#38bdf8' : 'rgba(255,255,255,0.3)' }}
              >
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
    <div className="min-h-screen lg:flex" style={{ background: '#f0f4f8' }}>
      <style>{`.dark .dashboard-bg { background: #060c17; }`}</style>
      <div className="min-h-screen lg:flex w-full dashboard-bg" style={{ background: '#f0f4f8' }}>
        <Sidebar navigation={navigation} open={open} onClose={() => setOpen(false)} />
        <div className="min-w-0 flex-1 flex flex-col pb-[68px] lg:pb-0">
          <Topbar title={activeTitle} onMenuClick={() => setOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 animate-slide-up">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav navigation={navigation} />
      </div>
    </div>
  )
}
