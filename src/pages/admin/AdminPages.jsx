import { ChatPage } from '../shared/ChatPage.jsx'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ResourcePage } from '../shared/ResourcePage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'

export function AdminDashboard() {
  return <DashboardPage title="Admin Dashboard" subtitle="Ferma va haydovchi so‘rovlari, foydalanuvchilar va audit monitoring." />
}

export function AdminFarmRequests() {
  return <ResourcePage title="Ferma so‘rovlari" description="PENDING fermalarni APPROVED yoki REJECTED qilish paneli." actionLabel="Tasdiqlash" />
}

export function AdminDriverRequests() {
  return <ResourcePage title="Haydovchi so‘rovlari" description="Haydovchilik guvohnomasi, tex pasport va mashina ma’lumotlarini ko‘rib chiqish." />
}

export function AdminOrders() {
  return <OrdersPage title="Admin buyurtmalar" />
}

export function AdminUsers() {
  return <ResourcePage title="Foydalanuvchilar" description="Mijoz, ferma egasi, haydovchi, admin va menejerlar." />
}

export function AdminChatMonitoring() {
  return <ChatPage title="Chat monitoring" />
}

export function AdminAuditLog() {
  return <ResourcePage title="Audit log" description="Tizimdagi muhim amallar va xavfsizlik hodisalari." />
}

export function AdminSettings() {
  return <SettingsPage />
}
