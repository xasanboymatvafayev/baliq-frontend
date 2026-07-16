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
import { useState } from 'react'
import { X, MapPin } from 'lucide-react'

export function CustomerDashboard() {
  return <DashboardPage title="Mijoz Dashboard" subtitle="Katalog, savatcha, buyurtmalar va chat holatini bitta oynada kuzating." /> }
export function CustomerFishCatalog() { return <CatalogPage /> }
export function CustomerProductDetail() { return <ProductDetailPage /> }
export function CustomerCart() { return <CartPage /> }
export function CustomerOrders() { return <OrdersPage title="Buyurtmalarim" /> }
export function CustomerChat() { return <ChatPage title="Mijoz chat" /> }
export function CustomerProfile() { return <ProfilePage /> }
export function CustomerSettings() { return <SettingsPage /> }

export function CustomerFarms() {
  usePageTitle("Fermalar ro'yxati")
  const [selectedFarm, setSelectedFarm] = useState(null)
  const { data: farmsRaw, isLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: () => httpClient.get('/farms?status=APPROVED'),
  })
  const data = farmsRaw?.data || farmsRaw || []

  return (
    <div className="space-y-6">
      {/* Farm Detail Modal */}
      {selectedFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">🏡 {selectedFarm.farmName}</h3>
              <button onClick={() => setSelectedFarm(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Ferma rasmi */}
            {selectedFarm.farmImage && (
              <img
                src={selectedFarm.farmImage}
                alt={selectedFarm.farmName}
                className="w-full max-h-64 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Viloyat</p>
                <p className="font-semibold">{selectedFarm.region}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Tuman</p>
                <p className="font-semibold">{selectedFarm.district}</p>
              </div>
              {selectedFarm.gpsLocation && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> GPS</p>
                  <p className="font-mono text-sm">{selectedFarm.gpsLocation}</p>
                </div>
              )}
            </div>
            {selectedFarm.owner_name && (
              <div className="text-sm text-slate-500">Egasi: <b className="text-slate-700 dark:text-slate-300">{selectedFarm.owner_name}</b></div>
            )}
          </div>
        </div>
      )}

      <section className="glass-card p-6"><h2 className="text-3xl font-black">Fermalar</h2><p className="mt-2 text-slate-500">Tasdiqlangan fermalar</p></section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? <div className="glass-card p-12 text-center text-slate-500">Ferma topilmadi</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((farm) => (
            <div
              key={farm.id}
              className="glass-card p-5 cursor-pointer hover:ring-2 hover:ring-ocean-300 transition"
              onClick={() => setSelectedFarm(farm)}
            >
              {farm.farmImage && (
                <img src={farm.farmImage} alt={farm.farmName} className="w-full h-32 object-cover rounded-xl mb-3" />
              )}
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
