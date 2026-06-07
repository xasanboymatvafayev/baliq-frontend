import { ChatPage } from '../shared/ChatPage.jsx'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ProfilePage } from '../shared/ProfilePage.jsx'
import { ResourcePage } from '../shared/ResourcePage.jsx'

export function FarmDashboard() {
  return <DashboardPage title="Ferma Dashboard" subtitle="Baliq zaxirasi, ombor, buyurtmalar va mijozlar bo‘yicha operatsion panel." />
}

export function FarmFish() {
  return <ResourcePage title="Baliqlar" description="Ferma mahsulotlari, narxlar, mavjud vazn va holatlar." />
}

export function FarmAddFish() {
  return <ResourcePage title="Baliq qo‘shish" description="Yangi mahsulot kiritish uchun forma va rasm yuklash interfeysi." actionLabel="Mahsulot yaratish" />
}

export function FarmInventory() {
  return <ResourcePage title="Ombor" description="Ombordagi baliq hajmi, zaxira va rezerv qilingan mahsulotlar." />
}

export function FarmOrders() {
  return <OrdersPage title="Ferma buyurtmalari" />
}

export function FarmCustomers() {
  return <ResourcePage title="Mijozlar" description="Ferma bilan ishlagan mijozlar va buyurtma tarixi." />
}

export function FarmChat() {
  return <ChatPage title="Ferma chat" />
}

export function FarmReports() {
  return <DashboardPage title="Hisobotlar" subtitle="Sotuv, buyurtma, ombor va logistika hisobotlari." />
}

export function FarmProfile() {
  return <ProfilePage />
}
