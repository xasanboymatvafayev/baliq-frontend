import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { ProfilePage } from '../shared/ProfilePage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { GpsMonitoringPage } from '../shared/GpsMonitoringPage.jsx'
import { orderService, httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { OrderTimeline } from '../../components/orders/OrderTimeline.jsx'
import { formatCurrency } from '../../utils/formatters.js'
import { Navigation, MapPin, Package, CheckCircle2, Loader2, ChevronRight, ArrowLeft, Truck, Users } from 'lucide-react'
import { useSocketEmit } from '../../hooks/useSocket.js'
import { MapboxNavigator } from '../../components/common/MapboxNavigator.jsx'

export function DriverDashboard() {
  return <DashboardPage title="Haydovchi Dashboard" subtitle="Biriktirilgan buyurtmalar, jonli tracking va mijoz/ferma chatlari." />
}
export function DriverLiveTracking() { return <GpsMonitoringPage /> }
export function DriverChat() { return <ChatPage title="Haydovchi chat" /> }
export function DriverProfile() { return <ProfilePage /> }
export function DriverSettings() { return <SettingsPage /> }

// ─── Haversine masofasi (km) ─────────────────────────────────────
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Google Maps navigatsiya ─────────────────────────────────────
function openNavigation(lat, lng, label = '') {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  // MapboxNavigator state orqali ochiladi
  // Bu funksiya DriverActions dan chaqiriladi
}

// ─── Koordinatni parse qilish ────────────────────────────────────
function parseCoords(coords) {
  if (!coords) return null
  const parts = String(coords).split(',').map(Number)
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] }
  }
  return null
}

// ─── Status badge ────────────────────────────────────────────────
const STATUS_LABELS = {
  PENDING: 'Kutilmoqda', CONFIRMED: 'Tasdiqlandi',
  DRIVER_ASSIGNED: 'Haydovchi biriktirildi',
  LOADING: 'Yuklanmoqda', IN_TRANSIT: "Yo'lda",
  DELIVERED: 'Yetkazildi', CANCELLED: 'Bekor qilindi',
}
const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  DRIVER_ASSIGNED: 'bg-purple-100 text-purple-700', LOADING: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-cyan-100 text-cyan-700', DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

// ─── Bir buyurtma kartasi (ro'yxatda) ───────────────────────────
function OrderCard({ order, onClick, isGroup }) {
  return (
    <div
      className="glass-card p-4 cursor-pointer hover:ring-2 hover:ring-ocean-300 transition flex items-center justify-between gap-3"
      onClick={() => onClick(order)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {isGroup && (
            <span className="flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
              <Users className="h-3 w-3" /> {order.items?.length || '?'} buyurtma
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="font-black mt-1">#{order.id?.slice(-6)}</p>
        {order.delivery_address && (
          <p className="text-sm text-slate-500 truncate mt-0.5">📍 {order.delivery_address}</p>
        )}
        <p className="text-sm font-bold text-ocean-600 mt-0.5">{formatCurrency(order.total)}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
    </div>
  )
}

// ─── Buyurtma detali ichidagi harakat tugmalari ──────────────────
function DriverActions({ order, orders, onStatusChange, loading, myPosition, onOpenNav }) {
  const status = order.status
  // Ko'p buyurtmali ish oqimi uchun: orders massivi berish mumkin
  const allOrders = orders || [order]
  const isGroup = allOrders.length > 1

  // Ferma koordinatalarini olish (birinchi buyurtmadagi ferma)
  const farmCoords = parseCoords(order.farm_gps || order.farm?.gpsLocation)
  // Mijoz koordinatasi
  const deliveryCoords = parseCoords(order.delivery_coords)

  // ─── Fermaga yaqinlashgan (100m) avto status ─────────────────
  useEffect(() => {
    if (status !== 'DRIVER_ASSIGNED' || !farmCoords || !myPosition) return
    const dist = distanceKm(myPosition.lat, myPosition.lng, farmCoords.lat, farmCoords.lng)
    if (dist <= 0.1) {
      // 100 metr yaqin → LOADING ga o'tkazamiz
      onStatusChange(allOrders.map((o) => o.id), 'LOADING')
    }
  }, [myPosition, farmCoords, status])

  if (status === 'DRIVER_ASSIGNED') {
    return (
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Fermaga boring va yukni oling. Fermaga 100m yaqinlashganda status avtomatik yangilanadi.
        </p>
        {farmCoords && onOpenNav && (
          <button
            className="primary-button w-full flex items-center justify-center gap-2"
            onClick={() => onOpenNav(farmCoords.lat, farmCoords.lng, order.farm?.farmName || 'Ferma')}
          >
            <Navigation className="h-4 w-4" />
            🚜 Fermaga navigatsiya
          </button>
        )}
      </div>
    )
  }

  if (status === 'LOADING') {
    return (
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="rounded-2xl bg-orange-50 dark:bg-orange-900/20 p-3 text-sm text-orange-700 dark:text-orange-300">
          📦 Yukni yuklang. Tayyor bo'lgach "Yo'lga chiqdim" ni bosing.
        </div>
        <button
          className="primary-button w-full !bg-cyan-600 hover:!bg-cyan-700 flex items-center justify-center gap-2"
          onClick={() => onStatusChange(allOrders.map((o) => o.id), 'IN_TRANSIT')}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
          🚚 Yo'lga chiqdim
        </button>
      </div>
    )
  }

  if (status === 'IN_TRANSIT') {
    // Ko'p buyurtmali bo'lsa — birinchi eng yaqin mijozga yo'l ko'rsatish
    const targetCoords = deliveryCoords

    return (
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
        {isGroup && (
          <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 text-sm text-purple-700 dark:text-purple-300">
            <b>Ko'p buyurtmali yetkazish:</b> Quyidagi mijoz manziliga boring. Har bir buyurtmani yetkazgach keyingisiga o'tiladi.
          </div>
        )}
        {targetCoords && onOpenNav && (
          <button
            className="primary-button w-full flex items-center justify-center gap-2"
            onClick={() => onOpenNav(targetCoords.lat, targetCoords.lng, order.delivery_address)}
          >
            <Navigation className="h-4 w-4" />
            📍 Mijozga navigatsiya
          </button>
        )}
        <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 text-sm">
          <p className="font-semibold">Yetkazish manzili:</p>
          <p className="text-slate-600 dark:text-slate-400">{order.delivery_address || '—'}</p>
          {order.customer_name && <p className="text-slate-500 text-xs mt-1">Mijoz: {order.customer_name}</p>}
        </div>
        <p className="text-xs text-slate-500 text-center">Mijoz buyurtmani qabul qilganidan so'ng buyurtma yakunlanadi</p>
      </div>
    )
  }

  return null
}

// ─── Asosiy Driver Orders sahifasi ──────────────────────────────
export function DriverOrders() {
  usePageTitle("Haydovchi buyurtmalari")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [navTarget, setNavTarget] = useState(null) // { lat, lng, address }
  const [myPosition, setMyPosition] = useState(null)
  const watchRef = useRef(null)

  const emit = useSocketEmit()

  // ─── Doimiy GPS kuzatish + backendga yuborish ─────────────────
  useEffect(() => {
    if (!navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPosition(coords)
        // Socket orqali real-time lokatsiyani backendga yuboramiz
        emit('driver_location_update', coords)
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [emit])

  const { data: ordersRaw = [], isLoading } = useQuery({
    queryKey: ['driver-orders'],
    queryFn: () => orderService.list({ limit: 50 }),
    refetchInterval: 15000,
  })

  const orders = (ordersRaw?.data || ordersRaw || []).filter(
    (o) => ['DRIVER_ASSIGNED', 'LOADING', 'IN_TRANSIT'].includes(o.status)
  )

  const statusMutation = useMutation({
    mutationFn: async ({ ids, status }) => {
      await Promise.all(ids.map((id) => orderService.updateStatus(id, { status })))
    },
    onSuccess: (_, { status }) => {
      const labels = {
        LOADING: '📦 Fermaga yetdingiz! Yuklanmoqda...',
        IN_TRANSIT: "🚚 Yo'lga chiqdingiz!",
        DELIVERED: '✅ Yetkazildi!',
      }
      pushToast({ title: labels[status] || 'Status yangilandi', variant: 'success' })
      queryClient.invalidateQueries(['driver-orders'])
      setSelected(null)
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  const handleStatusChange = useCallback((ids, status) => {
    statusMutation.mutate({ ids, status })
  }, [statusMutation])

  // Ko'p buyurtmali paket — bir xil deliver_address guruhlanadi
  const grouped = orders.reduce((acc, o) => {
    const key = o.batch_id || o.id
    if (!acc[key]) acc[key] = []
    acc[key].push(o)
    return acc
  }, {})
  const displayOrders = Object.values(grouped).map((group) =>
    group.length === 1
      ? group[0]
      : { ...group[0], items: group, _isGroup: true, id: group[0].batch_id || group[0].id }
  )

  return (
    <div className="space-y-6">
      {navTarget && (
        <MapboxNavigator
          toLat={navTarget.lat}
          toLng={navTarget.lng}
          toAddress={navTarget.address}
          onClose={() => setNavTarget(null)}
        />
      )}
      <section className="glass-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Buyurtmalarim</h2>
          <p className="mt-1 text-slate-500">{orders.length} ta faol buyurtma</p>
        </div>
        {myPosition && (
          <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
            GPS faol
          </div>
        )}
      </section>

      {selected ? (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <button className="secondary-button flex items-center gap-1" onClick={() => setSelected(null)}>
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </button>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[selected.status]}`}>
              {STATUS_LABELS[selected.status]}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black">Buyurtma #{selected.id?.slice(-6)}</h3>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div><span className="text-slate-500">Jami:</span> <b>{formatCurrency(selected.total)}</b></div>
              <div><span className="text-slate-500">Mijoz:</span> <b>{selected.customer_name || '—'}</b></div>
            </div>
            {selected.delivery_address && (
              <div className="text-sm"><span className="text-slate-500">Manzil:</span> <b>{selected.delivery_address}</b></div>
            )}
          </div>

          {/* Ko'p buyurtmali bo'lsa ichida ro'yxat */}
          {selected._isGroup && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm">Buyurtmalar ({selected.items?.length} ta):</h4>
              {selected.items?.map((o, i) => (
                <div key={o.id} className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 text-sm">
                  <p className="font-bold">#{i + 1} — #{o.id?.slice(-6)}</p>
                  <p className="text-slate-500">{o.delivery_address}</p>
                  <p className="text-ocean-600 font-semibold">{formatCurrency(o.total)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Mahsulotlar */}
          {!selected._isGroup && selected.items?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm">Mahsulotlar:</h4>
              {selected.items.map((item, i) => (
                <div key={i} className="flex justify-between rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-2 text-sm">
                  <span>{item.fish_name}</span>
                  <span>{item.quantity} {item.unit || 'kg'} × {formatCurrency(item.unit_price)}</span>
                </div>
              ))}
            </div>
          )}

          <OrderTimeline currentStatus={selected.status} />

          <DriverActions
            order={selected}
            orders={selected._isGroup ? selected.items : [selected]}
            onStatusChange={handleStatusChange}
            loading={statusMutation.isPending}
            myPosition={myPosition}
            onOpenNav={(lat, lng, address) => setNavTarget({ lat, lng, address })}
          />
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="glass-card h-20 animate-pulse" />)}</div>
      ) : displayOrders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-3">🚚</div>
          <p className="text-slate-500">Hozircha buyurtma yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={setSelected}
              isGroup={order._isGroup}
            />
          ))}
        </div>
      )}
    </div>
  )
}
