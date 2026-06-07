import { useQuery } from '@tanstack/react-query'
import { CatalogPage } from '../shared/CatalogPage.jsx'
import { CartPage } from '../shared/CartPage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ProductDetailPage } from '../shared/ProductDetailPage.jsx'
import { ProfilePage } from '../shared/ProfilePage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'
import { httpClient } from '../../services/api/index.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function CustomerDashboard() { return <DashboardPage title="Mijoz Dashboard" subtitle="Katalog, savatcha, buyurtmalar va chat holatini bitta oynada kuzating." /> }
export function CustomerFishCatalog() { return <CatalogPage /> }
export function CustomerProductDetail() { return <ProductDetailPage /> }
export function CustomerCart() { return <CartPage /> }
export function CustomerOrders() { return <OrdersPage title="Buyurtmalarim" /> }
export function CustomerChat() { return <ChatPage title="Mijoz chat" /> }
export function CustomerProfile() { return <ProfilePage /> }
export function CustomerSettings() { return <SettingsPage /> }

export function CustomerFarms() {
  usePageTitle("Fermalar ro'yxati")
  const { data = [], isLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: () => httpClient.get('/farms?status=APPROVED'),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Fermalar</h2><p className="mt-2 text-slate-500">Tasdiqlangan fermalar</p></section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? <div className="glass-card p-12 text-center text-slate-500">Ferma topilmadi</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((farm) => (
            <div key={farm.id} className="glass-card p-5">
              <h3 className="text-lg font-black">{farm.farmName}</h3>
              <p className="mt-1 text-sm text-slate-500">{farm.region}, {farm.district}</p>
              <p className="mt-1 text-xs text-ocean-600">{farm.gpsLocation}</p>
              <span className="mt-3 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">APPROVED</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
