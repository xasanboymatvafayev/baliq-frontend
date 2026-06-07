import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Topbar } from '../components/layout/Topbar.jsx'

export function DashboardLayout({ navigation, title }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const activeTitle = useMemo(() => navigation.find((item) => item.to === location.pathname)?.label || title, [location.pathname, navigation, title])

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar navigation={navigation} open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <Topbar title={activeTitle} onMenuClick={() => setOpen(true)} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
