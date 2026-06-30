import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, Fish, Store, Truck, Activity } from 'lucide-react'
import { DashboardCharts } from '../../components/charts/DashboardCharts.jsx'
import { StatCard } from '../../components/common/StatCard.jsx'
import { PageSkeleton } from '../../components/common/LoadingSkeleton.jsx'
import { analyticsService } from '../../services/api/index.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useAuthStore } from '../../store/authStore.js'
import { useT, useI18nStore } from '../../store/i18nStore.js'

export function DashboardPage({ title, subtitle }) {
  usePageTitle(title)
  const user = useAuthStore(s => s.user)
  const t = useT()
  const lang = useI18nStore(s => s.lang)
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', title],
    queryFn: () => analyticsService.dashboard({ scope: title }),
    staleTime: 30_000,
    retry: 1,
  })

  const h = new Date().getHours()
  const greet = h < 5 ? t.goodEvening : h < 12 ? t.goodMorning : h < 18 ? t.goodDay : t.goodEvening

  if (isLoading) return <PageSkeleton />

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl px-7 py-7"
        style={{ background: 'linear-gradient(135deg,#0ea5e9 0%,#0284c7 55%,#0369a1 100%)', boxShadow: '0 8px 32px rgba(14,165,233,0.28)' }}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-white/[0.04]" />
        <Fish className="pointer-events-none absolute right-8 -bottom-2 h-24 w-24 text-white/[0.09]" />
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">{t.liveDashboard}</span>
          </div>
          <h2 className="text-[28px] font-black text-white tracking-tight">
            {greet}{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h2>
          <p className="mt-1 text-[14px] text-white/55 max-w-md">{subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-[13px] font-semibold text-white">
              <Activity className="h-3.5 w-3.5" /> {title}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/[0.08] px-4 py-1.5 text-[13px] text-white/60">
              {new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title={t.totalOrders}  value={(data?.ordersCount ?? 0).toLocaleString()} description={t.myOrders}    icon={ClipboardCheck} tone="ocean" trend={data?.ordersTrend} />
        <StatCard title={t.totalFish}    value={(data?.fishCount ?? 0).toLocaleString()}   description={t.fishCatalog} icon={Fish}           tone="emerald" />
        <StatCard title={t.totalFarms}   value={(data?.farmCount ?? 0).toLocaleString()}   description={t.farmList}    icon={Store}          tone="amber" />
        <StatCard title={t.totalDrivers} value={(data?.driverCount ?? 0).toLocaleString()} description={t.liveTracking} icon={Truck}         tone="rose" />
      </div>

      <DashboardCharts series={data?.series} />
    </div>
  )
}
