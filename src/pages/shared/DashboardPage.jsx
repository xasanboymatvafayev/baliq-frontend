import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, Fish, Store, Truck, Activity } from 'lucide-react'
import { DashboardCharts } from '../../components/charts/DashboardCharts.jsx'
import { StatCard } from '../../components/common/StatCard.jsx'
import { analyticsService } from '../../services/api/index.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useAuthStore } from '../../store/authStore.js'

export function DashboardPage({ title, subtitle }) {
  usePageTitle(title)
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', title],
    queryFn: () => analyticsService.dashboard({ scope: title }),
    staleTime: 30_000, retry: 2, onError: () => {},
  })

  const h = new Date().getHours()
  const greet = h < 5 ? 'Xayrli kech' : h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech'

  return (
    <div className="space-y-5">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl p-7"
        style={{ background: 'linear-gradient(135deg,#0ea5e9 0%,#0284c7 55%,#0369a1 100%)', boxShadow: '0 8px 32px rgba(14,165,233,0.28)' }}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-80 w-80 rounded-full bg-white/[0.04]" />
        <Fish className="pointer-events-none absolute right-6 bottom-0 h-28 w-28 text-white/[0.08]" />

        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Jonli panel</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {greet}{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h2>
          <p className="mt-1.5 text-[14px] text-white/55 max-w-lg">{subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-[13px] font-semibold text-white">
              <Activity className="h-3.5 w-3.5" /> {title}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/[0.08] px-4 py-1.5 text-[13px] text-white/60">
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title="Buyurtmalar" value={isLoading ? '—' : (data?.ordersCount ?? 0).toLocaleString()} description="Jami buyurtmalar" icon={ClipboardCheck} tone="ocean"   trend={data?.ordersTrend} />
        <StatCard title="Baliqlar"    value={isLoading ? '—' : (data?.fishCount ?? 0).toLocaleString()}   description="Katalog va ombor"   icon={Fish}           tone="emerald" />
        <StatCard title="Fermalar"    value={isLoading ? '—' : (data?.farmCount ?? 0).toLocaleString()}   description="Tasdiqlangan"      icon={Store}          tone="amber" />
        <StatCard title="Haydovchilar"value={isLoading ? '—' : (data?.driverCount ?? 0).toLocaleString()} description="Faol haydovchilar" icon={Truck}           tone="rose" />
      </div>

      <DashboardCharts series={data?.series} />
    </div>
  )
}
