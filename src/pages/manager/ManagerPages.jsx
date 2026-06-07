import { ChatPage } from '../shared/ChatPage.jsx'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { GpsMonitoringPage } from '../shared/GpsMonitoringPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'

export function ManagerDashboard() {
  return <DashboardPage title="Menejer Dashboard" subtitle="Logistika, buyurtma jarayoni, KPI va statistikalar." />
}

export function ManagerGpsMonitoring() {
  return <GpsMonitoringPage />
}

export function ManagerOrders() {
  return <OrdersPage title="Menejer buyurtmalari" />
}

export function ManagerStatistics() {
  return <DashboardPage title="Statistikalar" subtitle="Bar, Pie, Line va Area chartlar orqali operatsion ko‘rsatkichlar." />
}

export function ManagerKpi() {
  return <DashboardPage title="KPI" subtitle="Yetkazib berish tezligi, bekor qilishlar va sotuv samaradorligi." />
}

export function ManagerReports() {
  return <DashboardPage title="Hisobotlar" subtitle="Menejerlar uchun eksportga tayyor analitika oynalari." />
}

export function ManagerChatMonitoring() {
  return <ChatPage title="Chat monitoring" />
}
