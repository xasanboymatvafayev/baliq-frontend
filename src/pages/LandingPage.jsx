import { useT } from '../store/i18nStore.js'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Fish, Truck, ShieldCheck, ArrowRight, Star, CheckCircle2, Zap, BarChart3, MessageSquare, MapPin } from 'lucide-react'
import { ThemeToggle } from '../components/common/ThemeToggle.jsx'

const STATS = [
  { value: '500+', label: 'Faol ferma' },
  { value: '12,000+', label: 'Yetkazilgan buyurtma' },
  { value: '98%', label: 'Muvaffaqiyatli yetkazish' },
  { value: '4.8 ★', label: "O'rtacha reyting" },
]

const FEATURES = [
  { icon: Fish, color: 'from-ocean-500 to-cyan-600', title: 'Keng baliq katalogi', desc: "O'zbekiston bo'ylab 50+ baliq turi. Narx, og'irlik, ferma reytingi bilan filtrlash." },
  { icon: Truck, color: 'from-violet-500 to-purple-700', title: 'Real-time GPS kuzatuv', desc: "Haydovchi qayerdaligini xaritada ko'ring. Yetkazish vaqtini aniq biling." },
  { icon: ShieldCheck, color: 'from-emerald-500 to-green-700', title: "Xavfsiz to'lov", desc: "Click va Payme orqali onlayn to'lov. Telegram orqali invoice — bir bosish." },
  { icon: MessageSquare, color: 'from-amber-500 to-orange-600', title: 'Jonli chat', desc: "Ferma, haydovchi va mijoz real-vaqtda muloqot qiladi. Hech narsa yo'qolmaydi." },
  { icon: BarChart3, color: 'from-rose-500 to-pink-700', title: 'Kuchli analitika', desc: "Sotuv, daromad, mijozlar statistikasi — barchasi bir joyda." },
  { icon: MapPin, color: 'from-sky-500 to-blue-700', title: "O'zbekiston bo'ylab", desc: "Toshkent, Samarqand, Buxoro va boshqa viloyatlardagi fermalar bilan bog'laning." },
]

const HOW = [
  { step: '01', title: "Ro'yxatdan o'ting", desc: "Mijoz, fermer yoki haydovchi sifatida tizimga kirish." },
  { step: '02', title: 'Mahsulot tanlang', desc: "Katalogdan baliq tanlang, ferma reytingini ko'ring." },
  { step: '03', title: 'Buyurtma bering', desc: "Click yoki Payme orqali xavfsiz to'lov qiling." },
  { step: '04', title: 'Eshigingizga yetkaziladi', desc: "GPS bilan kuzating, vaqtida oling." },
]

function useRoles() {
  const t = useT()
  return [
  { emoji: '🧑‍💼', title: 'Mijoz', color: 'border-ocean-400', bg: 'bg-ocean-50 dark:bg-ocean-950/40', items: ['Baliq katalogi', 'Onlayn buyurtma', 'GPS kuzatuv', 'Chat & support'] },
  { emoji: '🏡', title: 'Fermer', color: 'border-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', items: ['Mahsulot boshqaruv', 'Buyurtmalar paneli', "Balans & to'lovlar", 'Hisobotlar'] },
  { emoji: '🚚', title: 'Haydovchi', color: 'border-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40', items: ["Buyurtmalar ro'yxati", 'GPS navigatsiya', 'Status yangilash', 'Daromad hisobi'] },
]
}


function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function AnimSection({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export function LandingPage() {
  const t = useT()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">

      {/* ── Header ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-white/10' : 'bg-white/70 dark:bg-transparent border-b border-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 font-black text-lg">
            <span className="rounded-2xl bg-ocean-600 p-2.5 text-white shadow-glow">
              <Fish className="h-5 w-5" />
            </span>
            Baliq Savdosi
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="secondary-button hidden sm:inline-flex">{t.login}</Link>
            <Link to="/login" className="primary-button">
              Boshlash <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-7xl px-5 pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-ocean-400/20 blur-3xl animate-pulse-soft" />
          <div className="absolute top-10 right-1/4 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl animate-float" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div
          style={{
            opacity: 1,
            animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-ocean-200 dark:border-ocean-800 bg-ocean-50 dark:bg-ocean-950/60 px-4 py-1.5 text-sm font-bold text-ocean-700 dark:text-ocean-300 mb-6">
            <Zap className="h-3.5 w-3.5" /> O'zbekistoning #1 baliq savdo platformasi
          </span>

          <h1 className="text-5xl sm:text-7xl font-black leading-tight max-w-4xl mx-auto">
            Toza baliq —{' '}
            <span className="bg-gradient-to-r from-ocean-600 to-cyan-500 bg-clip-text text-transparent">fermadan</span>{' '}
            to eshigingizga
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Fermerlar, haydovchilar va mijozlarni bir platformada birlashtiruvchi zamonaviy tizim.
            GPS kuzatuv, onlayn to'lov va real-vaqt chat.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="primary-button text-base px-8 py-3.5 shadow-xl shadow-ocean-500/30 hover:shadow-ocean-500/50 hover:scale-105 transition-all"
            >
              Bepul boshlash <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/farm-registration"
              className="secondary-button text-base px-8 py-3.5 hover:scale-105 transition-all"
            >
              🏡 Ferma qo'shish
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Bepul ro'yxatdan o'tish</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Xavfsiz to'lov</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 24/7 qo'llab-quvvatlash</span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <AnimSection className="mx-auto max-w-5xl px-5 pb-16">
        <div className="glass-card grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 dark:divide-white/10 overflow-hidden rounded-3xl">
          {STATS.map(({ value, label }, i) => (
            <AnimSection key={label} delay={i * 80} className="flex flex-col items-center py-8 px-4">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-ocean-600 to-cyan-500 bg-clip-text text-transparent">{value}</span>
              <span className="mt-1 text-sm text-slate-500 text-center">{label}</span>
            </AnimSection>
          ))}
        </div>
      </AnimSection>

      {/* ── Features ── */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <AnimSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black">Nima uchun Baliq Savdosi?</h2>
          <p className="mt-3 text-slate-500">Hamma narsani bir joyda boshqaring</p>
        </AnimSection>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <AnimSection key={title} delay={i * 60}>
              <div className="glass-card p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white dark:bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <AnimSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black">Qanday ishlaydi?</h2>
            <p className="mt-3 text-slate-500">4 qadamda toza baliq eshigingizga</p>
          </AnimSection>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
            {HOW.map(({ step, title, desc }, i) => (
              <AnimSection key={step} delay={i * 100} className="relative text-center">
                {i < HOW.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-[-50%] h-0.5 bg-gradient-to-r from-ocean-300 to-slate-200 dark:from-ocean-700 dark:to-slate-700" />
                )}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 text-white font-black text-xl shadow-xl shadow-ocean-500/30 hover:scale-110 transition-transform">
                  {step}
                </div>
                <h3 className="font-black text-lg">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{desc}</p>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <AnimSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black">Kimlar foydalanadi?</h2>
          <p className="mt-3 text-slate-500">Har bir foydalanuvchi uchun alohida panel</p>
        </AnimSection>
        <div className="grid gap-6 sm:grid-cols-3">
          {useRoles().map(({ emoji, title, color, bg, items }, i) => (
            <AnimSection key={title} delay={i * 100}>
              <div className={`rounded-3xl border-2 ${color} ${bg} p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="text-4xl mb-3 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{emoji}</div>
                <h3 className="text-xl font-black mb-4 text-slate-900 dark:text-white">{title}</h3>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <AnimSection className="mx-auto max-w-7xl px-5 pb-20">
        <div className="glass-card relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-ocean-400/20 blur-3xl -z-10 animate-pulse-soft" />
          <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-violet-400/15 blur-3xl -z-10 animate-float" />
          <div className="text-5xl mb-4 animate-float">🐟</div>
          <h2 className="text-3xl sm:text-4xl font-black">Bugun boshlang</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto leading-relaxed">
            Ferma sifatida ro'yxatdan o'ting yoki mijoz sifatida birinchi buyurtmangizni bering.
            Ro'yxatdan o'tish bepul va 2 daqiqa oladi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/login" className="primary-button text-base px-10 py-3.5 shadow-xl shadow-ocean-500/30 hover:scale-105 transition-all">
              Hoziroq kirish <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/farm-registration" className="secondary-button text-base px-8 py-3.5 hover:scale-105 transition-all">
              Ferma bo'lib qo'shiling
            </Link>
          </div>
        </div>
      </AnimSection>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-black text-sm">
            <span className="rounded-xl bg-ocean-600 p-2 text-white">
              <Fish className="h-4 w-4" />
            </span>
            Baliq Savdosi
          </Link>
          <p className="text-xs text-slate-400">© 2026 Baliq Savdosi. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>O'zbekiston, 2026</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
