import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, Fish, Store, Truck, ArrowUpRight, Activity } from 'lucide-react'
import { DashboardCharts } from '../../components/charts/DashboardCharts.jsx'
import { StatCard } from '../../components/common/StatCard.jsx'
import { analyticsService } from '../../services/api/index.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useAuthStore } from '../../store/authStore.js'

export function DashboardPage({ title, subtitle }) {
  usePageTitle(title)
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', title],
    queryFn: () => analyticsService.dashboard({ scope: title }),
    staleTime: 30_000,
    retry: 2,
    onError: () => {},
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 17 ? 'Xayrli kun' : 'Xayrli kech'

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl p-7"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
          boxShadow: '0 8px 32px rgba(14,165,233,0.3)',
        }}
      >
        {/* BG decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="absolute -bottom-12 left-1/2 h-64 w-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="absolute right-12 bottom-0 opacity-10">
            <Fish className="h-32 w-32 text-white" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[12px] font-semibold text-white/70 uppercase tracking-widest">Jonli panel</p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {greeting}{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h2>
          <p className="mt-1.5 text-white/60 text-[14px]">{subtitle}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-semibold" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <Activity className="h-4 w-4 text-white" />
              <span className="text-white">{title}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-semibold text-white/70" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Buyurtmalar"
          value={isLoading ? '—' : (data?.ordersCount ?? 0).toLocaleString()}
          description="Jami buyurtmalar soni"
          icon={ClipboardCheck}
          tone="ocean"
          trend={data?.ordersTrend}
        />
        <StatCard
          title="Baliqlar"
          value={isLoading ? '—' : (data?.fishCount ?? 0).toLocaleString()}
          description="Katalog va ombordagi baliqlar"
          icon={Fish}
          tone="emerald"
          trend={data?.fishTrend}
        />
        <StatCard
          title="Fermalar"
          value={isLoading ? '—' : (data?.farmCount ?? 0).toLocaleString()}
          description="Tasdiqlangan fermalar"
          icon={Store}
          tone="amber"
        />
        <StatCard
          title="Haydovchilar"
          value={isLoading ? '—' : (data?.driverCount ?? 0).toLocaleString()}
          description="Faol haydovchilar"
          icon={Truck}
          tone="rose"
        />
      </section>

      {/* Charts */}
      <DashboardCharts series={data?.series} />
    </div>
  )
}
