import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { ChatPage } from '../shared/ChatPage.jsx'
import { GpsMonitoringPage } from '../shared/GpsMonitoringPage.jsx'
import { httpClient } from '../../services/api/index.js'

// ── Dark-mode-safe STATUS_COLORS ─────────────────────────────────────
const STATUS_COLORS = {
  PENDING:         'bg-amber-100  text-amber-800  dark:bg-amber-500/20  dark:text-amber-300  border border-amber-200  dark:border-amber-500/30',
  CONFIRMED:       'bg-blue-100   text-blue-800   dark:bg-blue-500/20   dark:text-blue-300   border border-blue-200   dark:border-blue-500/30',
  DRIVER_ASSIGNED: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30',
  LOADING:         'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30',
  IN_TRANSIT:      'bg-cyan-100   text-cyan-800   dark:bg-cyan-500/20   dark:text-cyan-300   border border-cyan-200   dark:border-cyan-500/30',
  DELIVERED:       'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
  CANCELLED:       'bg-rose-100   text-rose-800   dark:bg-rose-500/20   dark:text-rose-300   border border-rose-200   dark:border-rose-500/30',
  AWAITING_PAYMENT:'bg-slate-100  text-slate-700  dark:bg-slate-600/30  dark:text-slate-300  border border-slate-200  dark:border-slate-600/50',
}
const STATUS_DOTS = {
  PENDING: 'bg-amber-400', CONFIRMED: 'bg-blue-500', DRIVER_ASSIGNED: 'bg-purple-500',
  LOADING: 'bg-orange-500', IN_TRANSIT: 'bg-cyan-500 animate-pulse', DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500', AWAITING_PAYMENT: 'bg-slate-400',
}
const STATUS_LABELS = {
  PENDING: 'Kutilmoqda', CONFIRMED: 'Tasdiqlandi', DRIVER_ASSIGNED: 'Haydovchi',
  LOADING: 'Yuklanmoqda', IN_TRANSIT: "Yo'lda", DELIVERED: 'Yetkazildi',
  CANCELLED: 'Bekor', AWAITING_PAYMENT: "To'lov kutilmoqda",
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${STATUS_COLORS[status] || STATUS_COLORS.PENDING}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOTS[status] || 'bg-slate-400'}`} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}

// ── Animated counter ─────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0)
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

// ── Skeleton helpers ─────────────────────────────────────────────────
function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 space-y-3 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="h-3 w-24 rounded-lg bg-slate-200 dark:bg-white/10" />
          <div className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-white/10" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ cols = 5, rows = 6 }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-slate-200 dark:border-white/10 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse flex-1" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, col) => (
              <div
                key={col}
                className="h-4 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse flex-1"
                style={{ animationDelay: `${(row * cols + col) * 40}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Manager Dashboard ─────────────────────────────────────────────────
export function ManagerDashboard() {
  usePageTitle('Menejer Dashboard')
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard-manager'],
    queryFn: () => httpClient.get('/analytics/dashboard'),
    refetchInterval: 30000,
  })

  const cards = data ? [
    { label: 'Jami buyurtmalar', value: data.ordersCount,  emoji: '📦', color: 'text-ocean-600 dark:text-ocean-400',   bg: 'bg-ocean-50   dark:bg-ocean-900/20',   border: 'border-ocean-200   dark:border-ocean-800/50' },
    { label: 'Baliq turlari',    value: data.fishCount,    emoji: '🐟', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/50' },
    { label: 'Fermalar',         value: data.farmCount,    emoji: '🏡', color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50   dark:bg-amber-900/20',   border: 'border-amber-200   dark:border-amber-800/50' },
    { label: 'Haydovchilar',     value: data.driverCount,  emoji: '🚚', color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50    dark:bg-rose-900/20',    border: 'border-rose-200    dark:border-rose-800/50' },
  ] : []

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-ocean-600 dark:text-ocean-400">Menejer paneli</p>
        <h2 className="mt-2 text-4xl font-black">Umumiy ko'rinish</h2>
        <p className="mt-2 text-slate-500">Barcha jarayonlar, statistika va GPS monitoring</p>
      </section>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c, i) => (
            <div
              key={c.label}
              className={`glass-card p-6 border ${c.border} ${c.bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{c.label}</p>
                <span className="text-2xl">{c.emoji}</span>
              </div>
              <p className={`text-4xl font-black ${c.color}`}>
                <AnimatedNumber value={c.value} duration={1200} />
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {data?.series && (
        <div className="glass-card p-6">
          <h3 className="font-black mb-5">Oylik buyurtmalar</h3>
          <div className="flex items-end gap-2 h-36">
            {data.series.map((s, i) => {
              const max = Math.max(...data.series.map((x) => x.value), 1)
              const h = Math.max((s.value / max) * 100, 4)
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1 group">
                  <span className="text-xs font-bold text-ocean-600 dark:text-ocean-400 opacity-0 group-hover:opacity-100 transition-opacity">{s.value}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-ocean-500 to-ocean-400 dark:from-ocean-600 dark:to-ocean-500 transition-all duration-1000 cursor-pointer hover:opacity-80"
                    style={{ height: `${h}%` }}
                    title={`${s.name}: ${s.value}`}
                  />
                  <span className="text-[10px] text-slate-400 truncate w-full text-center">{s.name}</span>
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

// ── Manager Orders ────────────────────────────────────────────────────
export function ManagerOrders() {
  usePageTitle("Buyurtmalar (ko'rish)")
  const { data: ordersRaw, isLoading } = useQuery({
    queryKey: ['manager-orders'],
    queryFn: () => httpClient.get('/orders'),
    refetchInterval: 15000,
  })
  const orders = ordersRaw?.data || ordersRaw || []

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-3xl font-black">Buyurtmalar</h2>
          <p className="mt-1 text-slate-500 text-sm">Faqat ko'rish rejimi · {orders.length} ta buyurtma</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Real-vaqt yangilanish
        </div>
      </section>

      {isLoading ? (
        <TableSkeleton cols={5} rows={7} />
      ) : orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500 font-medium">Buyurtmalar yo'q</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="p-4">ID</th>
                  <th className="p-4">Mijoz</th>
                  <th className="p-4">Jami</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden sm:table-cell">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-400 whitespace-nowrap">#{o.id?.slice(-6)}</td>
                    <td className="p-4 font-medium whitespace-nowrap">{o.customer_name || '—'}</td>
                    <td className="p-4 font-bold whitespace-nowrap">{o.total?.toLocaleString()} so'm</td>
                    <td className="p-4"><StatusBadge status={o.status} /></td>
                    <td className="p-4 text-xs text-slate-500 hidden sm:table-cell whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('uz')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Manager Statistics ────────────────────────────────────────────────
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
        <p className="mt-1 text-slate-500 text-sm">Sotuv va buyurtmalar dinamikasi</p>
      </section>

      {isLoading ? (
        <TableSkeleton cols={3} rows={8} />
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-500 font-medium">Statistika ma'lumotlari yo'q</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="p-4">Davr</th>
                  <th className="p-4">Buyurtmalar</th>
                  <th className="p-4">Sotuv (so'm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500">{row.period}</td>
                    <td className="p-4 font-semibold">{row.orders} ta</td>
                    <td className="p-4 font-bold text-ocean-600 dark:text-ocean-400">{row.sales?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Manager KPI ───────────────────────────────────────────────────────
export function ManagerKpi() {
  usePageTitle('KPI')
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-kpi'],
    queryFn: () => httpClient.get('/analytics/kpi'),
  })

  const metrics = data ? [
    { label: 'Jami buyurtmalar', value: data.totalOrders,   color: 'text-ocean-600 dark:text-ocean-400',     bg: 'bg-ocean-50 dark:bg-ocean-900/20' },
    { label: 'Yetkazildi',       value: data.delivered,     color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Bekor qilindi',    value: data.cancelled,     color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Kutilmoqda',       value: data.pending,       color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Yetkazish %',      value: `${data.deliveryRate}%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', isStr: true },
    { label: 'Bekor %',          value: `${data.cancelRate}%`,   color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-900/20',   isStr: true },
    { label: 'Jami daromad',     value: data.totalRevenue,  color: 'text-ocean-600 dark:text-ocean-400',     bg: 'bg-ocean-50 dark:bg-ocean-900/20',  isMoney: true },
  ] : []

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">KPI</h2>
        <p className="mt-1 text-slate-500 text-sm">Asosiy samaradorlik ko'rsatkichlari</p>
      </section>

      {isLoading ? (
        <CardGridSkeleton count={7} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((item, i) => (
            <div
              key={item.label}
              className={`glass-card p-5 ${item.bg} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className={`mt-2 text-2xl font-black ${item.color}`}>
                {item.isMoney
                  ? <><AnimatedNumber value={item.value} /> so'm</>
                  : item.isStr
                    ? item.value
                    : typeof item.value === 'number'
                      ? <AnimatedNumber value={item.value} />
                      : item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Manager Reports ───────────────────────────────────────────────────
export function ManagerReports() {
  usePageTitle('Hisobotlar')
  const { data: kpi } = useQuery({ queryKey: ['analytics-kpi'], queryFn: () => httpClient.get('/analytics/kpi') })
  const { data: system } = useQuery({ queryKey: ['system-stats'], queryFn: () => httpClient.get('/analytics/system') })

  const kpiRows = kpi ? [
    ['Jami buyurtmalar', kpi.totalOrders],
    ['Yetkazildi', kpi.delivered],
    ['Kutilmoqda', kpi.pending],
    ['Bekor qilindi', kpi.cancelled],
    ['Yetkazish foizi', `${kpi.deliveryRate}%`],
    ['Jami daromad', `${kpi.totalRevenue?.toLocaleString()} so'm`],
  ] : []

  const sysRows = system ? [
    ['Foydalanuvchilar', system.totalUsers],
    ['Fermalar', system.approvedFarms],
    ['Haydovchilar', system.approvedDrivers],
    ['Baliq turlari', system.totalFish],
  ] : []

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Hisobotlar</h2>
        <p className="mt-1 text-slate-500 text-sm">Umumiy tizim hisoboti</p>
      </section>

      {!kpi && !system ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="glass-card p-6 space-y-3 animate-pulse">
              <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-white/10" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                  <div className="h-3.5 w-32 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                  <div className="h-3.5 w-16 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-black text-lg">📦 Buyurtmalar hisoboti</h3>
            {kpiRows.map(([k, v]) => (
              <div key={k} className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2.5">
                <span className="text-slate-500 text-sm">{k}</span>
                <span className="font-bold text-sm">{v ?? '—'}</span>
              </div>
            ))}
          </div>
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-black text-lg">🏗️ Tizim hisoboti</h3>
            {sysRows.map(([k, v]) => (
              <div key={k} className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2.5">
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
