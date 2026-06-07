import { Link, Outlet } from 'react-router-dom'
import { Fish } from 'lucide-react'
import { ThemeToggle } from '../components/common/ThemeToggle.jsx'

export function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_35%)]" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1fr_560px]">
        <section className="hidden flex-col justify-between p-10 lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <span className="rounded-2xl bg-ocean-500 p-3 shadow-glow">
              <Fish className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xl font-extrabold">Baliq Savdosi Platformasi</p>
              <p className="text-sm text-slate-300">Professional enterprise web platforma</p>
            </div>
          </Link>
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-ocean-200">SaaS Dashboard</p>
            <h1 className="mt-5 text-6xl font-black leading-tight">Ferma, logistika va savdoni bitta panelda boshqaring.</h1>
            <p className="mt-6 text-lg text-slate-300">
              Mijoz, Ferma egasi, Haydovchi, Admin, Menejer va Super Admin rollari uchun responsive frontend.
            </p>
          </div>
          <p className="text-sm text-slate-400">React 19 · Vite · TailwindCSS · Zustand · TanStack Query · Leaflet · Recharts</p>
        </section>
        <section className="flex min-h-screen items-center justify-center bg-white p-5 text-slate-950 dark:bg-slate-950 dark:text-white">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-2 font-extrabold">
                <Fish className="h-6 w-6 text-ocean-500" />
                Baliq Savdosi
              </Link>
              <ThemeToggle />
            </div>
            <div className="glass-card p-6 sm:p-8">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
