import { CatalogPage } from '../shared/CatalogPage.jsx'
import { CartPage } from '../shared/CartPage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ProductDetailPage } from '../shared/ProductDetailPage.jsx'
import { ProfilePage } from '../shared/ProfilePage.jsx'
import { ResourcePage } from '../shared/ResourcePage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'

export function CustomerDashboard() {
  return <DashboardPage title="Mijoz Dashboard" subtitle="Katalog, savatcha, buyurtmalar va chat holatini bitta oynada kuzating." />
}

export function CustomerFishCatalog() {
  return <CatalogPage />
}

export function CustomerFarms() {
  return <ResourcePage title="Ferma ro‘yxati" description="Tasdiqlangan fermalar, reyting va lokatsiya bo‘yicha ro‘yxat." actionLabel="Ferma tanlash" />
}

export function CustomerProductDetail() {
  return <ProductDetailPage />
}

export function CustomerCart() {
  return <CartPage />
}

export function CustomerOrders() {
  return <OrdersPage title="Buyurtmalarim" />
}

export function CustomerChat() {
  return <ChatPage title="Mijoz chat" />
}

export function CustomerProfile() {
  return <ProfilePage />
}

export function CustomerSettings() {
  return <SettingsPage />
}
