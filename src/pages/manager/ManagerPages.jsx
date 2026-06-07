import { useQuery } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { GpsMonitoringPage } from '../shared/GpsMonitoringPage.jsx'
import { httpClient } from '../../services/api/index.js'

export function ManagerDashboard() { return <DashboardPage title="Menejer Dashboard" subtitle="Logistika, buyurtma jarayoni, KPI va statistikalar." /> }
export function ManagerGpsMonitoring() { return <GpsMonitoringPage /> }
export function ManagerOrders() { return <OrdersPage title="Menejer buyurtmalari" /> }
export function ManagerChatMonitoring() { return <ChatPage title="Chat monitoring" /> }

export function ManagerStatistics() {
  usePageTitle('Statistikalar')
  const { data } = useQuery({ queryKey: ['analytics-sales'], queryFn: () => httpClient.get('/analytics/sales') })
  return <DashboardPage title="Statistikalar" subtitle="Bar, Pie, Line va Area chartlar orqali operatsion ko'rsatkichlar." />
}

export function ManagerKpi() {
  usePageTitle('KPI')
  const { data } = useQuery({ queryKey: ['analytics-kpi'], queryFn: () => httpClient.get('/analytics/kpi') })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">KPI</h2></section>
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Jami buyurtmalar", value: data.totalOrders, color: "text-ocean-600" },
            { label: "Yetkazildi", value: data.delivered, color: "text-green-600" },
            { label: "Bekor qilindi", value: data.cancelled, color: "text-rose-600" },
            { label: "Yetkazish %", value: `${data.deliveryRate}%`, color: "text-amber-600" },
            { label: "Bekor %", value: `${data.cancelRate}%`, color: "text-rose-600" },
            { label: "Jami daromad", value: `${data.totalRevenue?.toLocaleString()} so'm`, color: "text-ocean-600" },
          ].map((item) => (
            <div key={item.label} className="glass-card p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={`mt-1 text-2xl font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ManagerReports() { return <DashboardPage title="Hisobotlar" subtitle="Menejerlar uchun eksportga tayyor analitika oynalari." /> }
