import { Link, Outlet } from 'react-router-dom'
import { Fish, Zap, Shield, TrendingUp, Waves, Star } from 'lucide-react'

const FEATURES = [
  { icon: Zap,        title: 'Real-vaqt',  desc: "Buyurtmalarni jonli kuzating" },
  { icon: Shield,     title: 'Xavfsiz',    desc: "To'lovlar 256-bit himoyalangan" },
  { icon: TrendingUp, title: 'Analitika',  desc: 'Kuchli hisobot paneli' },
  { icon: Waves,      title: 'GPS',        desc: 'Navigatsiya va yetkazib berish' },
]

export function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(145deg,#040810 0%,#071220 60%,#050c18 100%)' }}>

      {/* BG glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle,#0ea5e9,transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-24 h-[500px] w-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#10b981,transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_460px]">

        {/* ── LEFT ── */}
        <section className="hidden lg:flex flex-col justify-between px-14 py-12">

          <Link to="/" className="inline-flex items-center gap-3 group w-fit">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30 transition-transform group-hover:scale-105">
              <Fish className="h-5 w-5 text-white" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#040810] animate-pulse-soft" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white/90">Baliq Savdosi</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">Enterprise Platform</p>
            </div>
          </Link>

          <div className="max-w-[520px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-[12px] font-semibold text-sky-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              O'zbekistonning №1 baliq savdo platformasi
            </div>

            <h1 className="text-[52px] font-black leading-[1.04] tracking-tight text-white">
              Ferma, logistika{' '}
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">va savdoni</span>
              {' '}bitta panelda.
            </h1>

            <p className="mt-5 text-[15px] leading-[1.7] text-white/38">
              Mijoz, Fermer, Haydovchi va Admin rollari uchun professional boshqaruv. Real-vaqt kuzatuv, GPS logistika, kuchli analitika.
            </p>

            <div className="mt-8 flex items-center gap-8">
              {[{v:'500+',l:'Fermalar'},{v:'12K+',l:'Mijozlar'},{v:'98%',l:'Mamnunlik'}].map(s => (
                <div key={s.l}>
                  <p className="text-2xl font-black text-white">{s.v}</p>
                  <p className="text-[11px] font-medium text-white/28 mt-0.5">{s.l}</p>
                </div>
              ))}
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-200 hover:border-sky-500/20 hover:bg-sky-500/[0.05] cursor-default">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                    <Icon className="h-4 w-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/80">{title}</p>
                    <p className="text-[11px] text-white/30">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-white/18">© 2025 Baliq Savdosi · React 19 · FastAPI · MongoDB</p>
        </section>

        {/* ── RIGHT ── */}
        <section
          className="flex min-h-screen flex-col items-center justify-center p-6"
          style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(32px)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>

          <div className="lg:hidden flex items-center gap-3 mb-8 self-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600">
              <Fish className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-white/90">Baliq Savdosi</span>
          </div>

          <div className="w-full max-w-[390px]">
            <div className="rounded-[24px] p-8"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
              <Outlet />
            </div>
            <p className="mt-5 text-center text-[12px] text-white/20">
              Kirib, foydalanish shartlariga rozilik bildirasiz
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
