import { DashboardPage } from '../shared/DashboardPage.jsx'
import { ResourcePage } from '../shared/ResourcePage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'

export function SystemStatistics() {
  return <DashboardPage title="Tizim statistikasi" subtitle="Platforma bo‘yicha umumiy tranzaksiya, foydalanuvchi va xizmat metrikalari." />
}

export function AdminManagement() {
  return <ResourcePage title="Admin boshqaruvi" description="Admin va menejer akkauntlarini yaratish, o‘chirish va audit qilish." />
}

export function RolesPage() {
  return <ResourcePage title="Rollar" description="Mijoz, Ferma egasi, Haydovchi, Admin, Menejer, Super Admin rollari." />
}

export function PermissionsPage() {
  return <ResourcePage title="Ruxsatlar" description="Role-based access control uchun ruxsatlar matritsasi." />
}

export function SuperAdminAuditLog() {
  return <ResourcePage title="Audit log" description="Butun tizim bo‘yicha xavfsizlik va o‘zgarishlar jurnali." />
}

export function SystemSettings() {
  return <SettingsPage title="Tizim sozlamalari" />
}
