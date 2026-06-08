import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { ChatPage } from '../shared/ChatPage.jsx'
import { GpsMonitoringPage } from '../shared/GpsMonitoringPage.jsx'
import { httpClient } from '../../services/api/index.js'

// Animatsiyali raqam komponenti
function AnimatedNumber({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (!value) return
    const target = Number(value) || 0
    const start = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}

export function ManagerDashboard() {
  usePageTitle('Menejer Dashboard')
  const { data } = useQuery({
    queryKey: ['analytics-dashboard-manager'],
    queryFn: () => httpClient.get('/analytics/dashboard'),
    refetchInterval: 30000,
  })

  const cards = data ? [
    { label: 'Jami buyurtmalar', value: data.ordersCount, color: 'text-ocean-600', bg: 'bg-ocean-50 dark:bg-ocean-900/20' },
    { label: 'Baliq turlari', value: data.fishCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Fermalar', value: data.farmCount, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Haydovchilar', value: data.driverCount, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ] : []

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-ocean-600">Menejer paneli</p>
        <h2 className="mt-2 text-4xl font-black">Umumiy ko'rinish</h2>
        <p className="mt-2 text-slate-500">Barcha jarayonlar, statistika va GPS monitoring</p>
      </section>

      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className={`glass-card p-6 ${c.bg}`}>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className={`mt-2 text-4xl font-black ${c.color}`}>
                <AnimatedNumber value={c.value} duration={1200} />
              </p>
            </div>
          ))}
        </div>
      )}

      {data?.series && (
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">Oylik buyurtmalar</h3>
          <div className="flex items-end gap-2 h-32">
            {data.series.map((s, i) => {
              const max = Math.max(...data.series.map((x) => x.orders), 1)
              const h = Math.max((s.orders / max) * 100, 4)
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-ocean-600">{s.orders}</span>
                  <div className="w-full rounded-t-lg bg-ocean-400 dark:bg-ocean-600 transition-all duration-1000" style={{ height: `${h}%` }} />
                  <span className="text-xs text-slate-500">{s.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function ManagerGpsMonitoring() { return <GpsMonitoringPage /> }
export function ManagerChatMonitoring() { return <ChatPage title="Chat monitoring" /> }

export function ManagerOrders() {
  usePageTitle('Buyurtmalar (ko\'rish)')
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['manager-orders'],
    queryFn: () => httpClient.get('/orders'),
    refetchInterval: 15000,
  })

  const STATUS_LABELS = {
    PENDING: 'Kutilmoqda', CONFIRMED: 'Tasdiqlandi', DRIVER_ASSIGNED: 'Haydovchi biriktirildi',
    LOADING: 'Yuklanmoqda', IN_TRANSIT: "Yo'lda", DELIVERED: 'Yetkazildi', CANCELLED: 'Bekor qilindi',
  }
  const STATUS_COLORS = {
    PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-blue-100 text-blue-700',
    DRIVER_ASSIGNED: 'bg-purple-100 text-purple-700', LOADING: 'bg-orange-100 text-orange-700',
    IN_TRANSIT: 'bg-cyan-100 text-cyan-700', DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Buyurtmalar</h2>
        <p className="mt-2 text-slate-500 text-sm">Faqat ko'rish rejimi · {orders.length} ta buyurtma</p>
      </section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-3">ID</th><th className="p-3">Mijoz</th><th className="p-3">Jami</th><th className="p-3">Status</th><th className="p-3">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-3 font-mono text-xs">#{o.id?.slice(-6)}</td>
                  <td className="p-3">{o.customer_name || '—'}</td>
                  <td className="p-3 font-bold">{o.total?.toLocaleString()} so'm</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td className="p-3 text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString('uz')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function ManagerStatistics() {
  usePageTitle('Statistikalar')
  const { data = [], isLoading } = useQuery({
    queryKey: ['analytics-sales'],
    queryFn: () => httpClient.get('/analytics/sales'),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Statistikalar</h2>
        <p className="mt-2 text-slate-500">Sotuv va buyurtmalar dinamikasi</p>
      </section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Davr</th><th className="p-4">Buyurtmalar</th><th className="p-4">Sotuv (so'm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-mono text-xs">{row.period}</td>
                  <td className="p-4">{row.orders} ta</td>
                  <td className="p-4 font-bold text-ocean-600">{row.sales?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function ManagerKpi() {
  usePageTitle('KPI')
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-kpi'],
    queryFn: () => httpClient.get('/analytics/kpi'),
  })

  const metrics = data ? [
    { label: 'Jami buyurtmalar', value: data.totalOrders, color: 'text-ocean-600' },
    { label: 'Yetkazildi', value: data.delivered, color: 'text-green-600' },
    { label: 'Bekor qilindi', value: data.cancelled, color: 'text-rose-600' },
    { label: 'Kutilmoqda', value: data.pending, color: 'text-amber-600' },
    { label: 'Yetkazish %', value: `${data.deliveryRate}%`, color: 'text-green-600' },
    { label: 'Bekor %', value: `${data.cancelRate}%`, color: 'text-rose-600' },
    { label: 'Jami daromad', value: data.totalRevenue, color: 'text-ocean-600', isMoney: true },
  ] : []

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">KPI</h2>
        <p className="mt-2 text-slate-500">Asosiy samaradorlik ko'rsatkichlari</p>
      </section>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(7)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((item) => (
            <div key={item.label} className="glass-card p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={`mt-2 text-2xl font-black ${item.color}`}>
                {item.isMoney ? <><AnimatedNumber value={item.value} /> so'm</> :
                 typeof item.value === 'number' ? <AnimatedNumber value={item.value} /> : item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ManagerReports() {
  usePageTitle('Hisobotlar')
  const { data: kpi } = useQuery({ queryKey: ['analytics-kpi'], queryFn: () => httpClient.get('/analytics/kpi') })
  const { data: system } = useQuery({ queryKey: ['system-stats'], queryFn: () => httpClient.get('/analytics/system') })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Hisobotlar</h2>
        <p className="mt-2 text-slate-500">Umumiy tizim hisoboti</p>
      </section>
      {kpi && system && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-bold">Buyurtmalar hisoboti</h3>
            {[
              ['Jami buyurtmalar', kpi.totalOrders],
              ['Yetkazildi', kpi.delivered],
              ['Kutilmoqda', kpi.pending],
              ['Bekor qilindi', kpi.cancelled],
              ['Yetkazish foizi', `${kpi.deliveryRate}%`],
              ['Jami daromad', `${kpi.totalRevenue?.toLocaleString()} so'm`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-500 text-sm">{k}</span>
                <span className="font-bold text-sm">{v}</span>
              </div>
            ))}
          </div>
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-bold">Tizim hisoboti</h3>
            {[
              ['Foydalanuvchilar', system.totalUsers],
              ['Fermalar', system.approvedFarms],
              ['Haydovchilar', system.approvedDrivers],
              ['Baliq turlari', system.totalFish],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-slate-500 text-sm">{k}</span>
                <span className="font-bold text-sm">{v ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
