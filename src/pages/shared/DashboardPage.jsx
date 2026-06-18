import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, Fish, Store, Truck } from 'lucide-react'
import { DashboardCharts } from '../../components/charts/DashboardCharts.jsx'
import { StatCard } from '../../components/common/StatCard.jsx'
import { analyticsService } from '../../services/api/index.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function DashboardPage({ title, subtitle }) {
  usePageTitle(title)

  // apiEnabled tekshiruvi olib tashlandi — har doim so'rov yuboriladi
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', title],
    queryFn: () => analyticsService.dashboard({ scope: title }),
    staleTime: 30_000,       // 30 soniya kesh
    retry: 2,
    onError: () => {},       // konsol xato chiqarmasin
  })

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden p-6">
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean-600">Baliq Savdosi Platformasi</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">{title}</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Buyurtmalar"
          value={isLoading ? '...' : (data?.ordersCount ?? 0)}
          description="Jami buyurtmalar"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Baliqlar"
          value={isLoading ? '...' : (data?.fishCount ?? 0)}
          description="Katalog va ombor"
          icon={Fish}
          tone="emerald"
        />
        <StatCard
          title="Fermalar"
          value={isLoading ? '...' : (data?.farmCount ?? 0)}
          description="Tasdiqlangan fermalar"
          icon={Store}
          tone="amber"
        />
        <StatCard
          title="Haydovchilar"
          value={isLoading ? '...' : (data?.driverCount ?? 0)}
          description="Faol haydovchilar"
          icon={Truck}
          tone="rose"
        />
      </section>

      <DashboardCharts series={data?.series} />
    </div>
  )
}
