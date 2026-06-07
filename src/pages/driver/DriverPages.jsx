import { ChatPage } from '../shared/ChatPage.jsx'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { GpsMonitoringPage } from '../shared/GpsMonitoringPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ProfilePage } from '../shared/ProfilePage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'

export function DriverDashboard() {
  return <DashboardPage title="Haydovchi Dashboard" subtitle="Biriktirilgan buyurtmalar, jonli tracking va mijoz/ferma chatlari." />
}

export function DriverOrders() {
  return <OrdersPage title="Haydovchi buyurtmalari" />
}

export function DriverLiveTracking() {
  return <GpsMonitoringPage />
}

export function DriverChat() {
  return <ChatPage title="Haydovchi chat" />
}

export function DriverProfile() {
  return <ProfilePage />
}

export function DriverSettings() {
  return <SettingsPage />
}
