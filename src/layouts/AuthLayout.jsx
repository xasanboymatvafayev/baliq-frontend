import { Link, Outlet } from 'react-router-dom'
import { Fish, Zap, Shield, TrendingUp, Waves, Star } from 'lucide-react'
import { ThemeToggle } from '../components/common/ThemeToggle.jsx'

const FEATURES = [
  { icon: Zap, label: 'Real-vaqt', text: 'Buyurtmalarni jonli kuzating' },
  { icon: Shield, label: 'Xavfsiz', text: "To'lovlar va ma'lumotlar himoyasi" },
  { icon: TrendingUp, label: 'Analitika', text: 'Kuchli hisobot va statistika' },
  { icon: Waves, label: 'GPS', text: 'Navigatsiya va yetkazib berish' },
]

const STATS = [
  { value: '500+', label: 'Fermalar' },
  { value: '12K+', label: 'Mijozlar' },
  { value: '98%', label: 'Mamnunlik' },
]

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #05090f 0%, #080f1e 50%, #060c15 100%)' }}>

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1fr_480px]">

        {/* LEFT PANEL */}
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.4)' }}
            >
              <Fish className="h-5 w-5 text-white" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#05090f] animate-pulse" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">Baliq Savdosi</p>
              <p className="text-[10px] font-medium tracking-widest uppercase text-white/30">Enterprise Platform</p>
            </div>
          </Link>

          {/* Hero */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              O'zbekistonning №1 baliq savdo platformasi
            </div>

            <h1 className="text-[52px] font-black leading-[1.05] tracking-tight text-white xl:text-[60px]">
              Ferma, logistika{' '}
              <span style={{ background: 'linear-gradient(135deg, #38bdf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                va savdoni
              </span>
              {' '}bitta panelda.
            </h1>

            <p className="mt-5 text-[15px] leading-relaxed text-white/40">
              Mijoz, Fermer, Haydovchi va Admin rollari uchun professional boshqaruv tizimi. Real-vaqt kuzatuv, GPS logistika va kuchli analitika.
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center gap-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[11px] font-medium text-white/35">{s.label}</p>
                </div>
              ))}
              <div className="h-10 w-px bg-white/10" />
              <div className="flex -space-x-2">
                {['#0ea5e9','#10b981','#f59e0b','#a855f7'].map((c, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[#05090f] flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}>
                    {['A','F','H','M'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
            </div>

            {/* Features grid */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, label, text }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(14,165,233,0.12)', color: '#38bdf8' }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">{label}</p>
                    <p className="text-[11px] text-white/35">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-white/20">© 2025 Baliq Savdosi. Barcha huquqlar himoyalangan.</p>
            <div className="flex items-center gap-2 text-[11px] text-white/20">
              <span>React 19</span><span>·</span><span>FastAPI</span><span>·</span><span>MongoDB</span>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL — Form */}
        <section
          className="flex min-h-screen flex-col items-center justify-center p-5"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(40px)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Mobile logo */}
          <div className="mb-6 flex w-full max-w-[400px] items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                <Fish className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-[15px]">Baliq Savdosi</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Card */}
          <div className="w-full max-w-[400px]">
            <div
              className="rounded-3xl p-8"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
              }}
            >
              <Outlet />
            </div>

            <p className="mt-5 text-center text-[11px] text-white/20">
              Platformaga kirib, <span className="underline cursor-pointer text-white/30">foydalanish shartlari</span>ga rozilik bildirasiz.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
