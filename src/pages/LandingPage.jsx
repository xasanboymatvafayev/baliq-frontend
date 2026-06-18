import { Link } from 'react-router-dom'
import { createElement } from 'react'
import { ArrowRight, Fish, ShieldCheck, Truck } from 'lucide-react'
import { ThemeToggle } from '../components/common/ThemeToggle.jsx'

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between p-5">
        <Link to="/" className="flex items-center gap-3 font-black">
          <span className="rounded-2xl bg-ocean-600 p-3 text-white shadow-glow">
            <Fish className="h-6 w-6" />
          </span>
          Baliq Savdosi
        </Link>
        <div className="flex gap-3">
          <ThemeToggle />
          <Link className="primary-button" to="/login">Kirish</Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-ocean-600">Enterprise frontend</p>
          <h1 className="mt-5 text-5xl font-black leading-tight sm:text-7xl">Baliq savdosi uchun zamonaviy SaaS platforma.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-500">
            React 19, Vite, TailwindCSS, Zustand, TanStack Query, Socket.io, Leaflet va Recharts bilan professional frontend.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="primary-button" to="/customer/dashboard">
              Dashboardni ko‘rish <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="secondary-button" to="/farm-registration">Ferma registratsiyasi</Link>
          </div>
        </div>
        <div className="glass-card relative min-h-[520px] overflow-hidden p-6">
          <div className="absolute right-10 top-10 h-36 w-36 rounded-full bg-ocean-400/30 blur-3xl" />
          <div className="grid gap-4">
            {[
              ['Mijoz paneli', Fish, 'Katalog, savatcha, buyurtmalar'],
              ['GPS monitoring', Truck, 'Haydovchilarni xaritada kuzatish'],
              ['Admin nazorat', ShieldCheck, 'So‘rovlar, audit va rollar'],
            ].map(([title, icon, text]) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                {createElement(icon, { className: 'h-8 w-8 text-ocean-600' })}
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
