import { useMemo, useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Topbar } from '../components/layout/Topbar.jsx'

function BottomNav({ navigation }) {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/[0.06] bg-[#09101f]/95 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {navigation.slice(0, 5).map(item => {
          const active = pathname === item.to
          return (
            <NavLink key={item.to} to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 ${active ? 'bg-sky-500/20 border border-sky-500/25 scale-110' : 'border border-transparent'}`}>
                <item.icon className={`h-[18px] w-[18px] transition-colors ${active ? 'text-sky-400' : 'text-white/30'}`} />
              </div>
              <span className={`text-[10px] font-semibold truncate max-w-[54px] text-center transition-colors ${active ? 'text-sky-400' : 'text-white/25'}`}>
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
    () => navigation.find(i => i.to === location.pathname)?.label || title,
    [location.pathname, navigation, title]
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050a14] lg:flex">
      <Sidebar navigation={navigation} open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-1 min-w-0 flex-col pb-[68px] lg:pb-0">
        <Topbar title={activeTitle} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-5 lg:p-6">
          <div key={location.pathname} className="animate-fade-in h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav navigation={navigation} />
    </div>
  )
}
