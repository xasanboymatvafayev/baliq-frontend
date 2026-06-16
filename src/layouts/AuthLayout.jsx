import { Link, Outlet } from 'react-router-dom'
import { Fish, Waves, Shield, Zap, TrendingUp } from 'lucide-react'
import { ThemeToggle } from '../components/common/ThemeToggle.jsx'

const FEATURES = [
  { icon: Zap,         text: 'Real-time buyurtma kuzatuvi' },
  { icon: Shield,      text: 'Xavfsiz to\'lovlar va ma\'lumotlar' },
  { icon: TrendingUp,  text: 'Analitika va hisobot paneli' },
  { icon: Waves,       text: 'GPS navigatsiya va yetkazish' },
]

export function AuthLayout() {
  return (
    <main className="auth-bg dot-pattern relative min-h-screen overflow-hidden text-white">
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1fr_520px]">

        {/* ─── Chap panel ─── */}
        <section className="hidden lg:flex flex-col justify-between p-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 p-3 shadow-glow">
              <Fish className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">Baliq Savdosi</p>
              <p className="text-xs text-slate-400 font-medium">Enterprise Platform</p>
            </div>
          </Link>

          {/* Sarlavha */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-ocean-500/30 bg-ocean-500/10 px-4 py-1.5 text-xs font-bold text-ocean-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-ocean-400 animate-pulse-soft" />
              Ishonchli savdo platformasi
            </div>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
              Ferma, logistika{' '}
              <span className="bg-gradient-to-r from-ocean-400 to-emerald-400 bg-clip-text text-transparent">
                va savdoni
              </span>{' '}
              bitta panelda.
            </h1>
            <p className="mt-5 text-base text-slate-400 leading-relaxed">
              Mijoz, Fermer, Haydovchi va Admin rollari uchun professional boshqaruv tizimi.
            </p>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3.5">
                  <div className="rounded-xl bg-ocean-500/15 p-2">
                    <Icon className="h-4 w-4 text-ocean-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">© 2025 Baliq Savdosi. Barcha huquqlar himoyalangan.</p>
            <div className="flex gap-2 text-xs text-slate-600">
              <span>React 19</span><span>·</span>
              <span>FastAPI</span><span>·</span>
              <span>MongoDB</span>
            </div>
          </div>
        </section>

        {/* ─── O'ng panel (forma) ─── */}
        <section className="flex min-h-screen flex-col items-center justify-center bg-white/[0.03] backdrop-blur-2xl border-l border-white/[0.06] p-6">
          {/* Mobil logo */}
          <div className="mb-6 flex w-full max-w-md items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-xl bg-ocean-600 p-2">
                <Fish className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-white">Baliq Savdosi</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Forma kartasi */}
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-float backdrop-blur-xl">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
