import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { formatCurrency } from '../../utils/formatters.js'
import { Navigation, Package, User, RefreshCw, X, MapPin } from 'lucide-react'

// ─── Leaflet lazy import (SSR safe) ─────────────────────────────
let L = null
async function getLeaflet() {
  if (L) return L
  L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')
  // Default marker icon fix
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
  return L
}

// ─── Haydovchi mashina ikonkasi ──────────────────────────────────
function makeDriverIcon(Leaflet, isSelected, ordersCount) {
  const color = isSelected ? '#7c3aed' : ordersCount > 0 ? '#0891b2' : '#64748b'
  const size = isSelected ? 48 : 40
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="${color}" stroke="white" stroke-width="3" opacity="0.95"/>
      <text x="24" y="29" text-anchor="middle" font-size="20">🚚</text>
      ${ordersCount > 0 ? `
        <circle cx="36" cy="10" r="9" fill="#ef4444" stroke="white" stroke-width="2"/>
        <text x="36" y="14" text-anchor="middle" font-size="9" font-weight="bold" fill="white">${ordersCount > 9 ? '9+' : ordersCount}</text>
      ` : ''}
    </svg>
  `
  return Leaflet.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// ─── Mijoz manzil ikonkasi ───────────────────────────────────────
function makeDestIcon(Leaflet) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10 16 24 16 24S32 26 32 16C32 7.16 24.84 0 16 0z" fill="#10b981"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
      <text x="16" y="20" text-anchor="middle" font-size="11">📍</text>
    </svg>
  `
  return Leaflet.divIcon({ html: svg, className: '', iconSize: [32, 40], iconAnchor: [16, 40] })
}

// ─── Asosiy komponent ────────────────────────────────────────────
export function GpsMonitoringPage() {
  usePageTitle('GPS Monitoring')
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const routeLayerRef = useRef(null)
  const containerRef = useRef(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [leafletReady, setLeafletReady] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  // ─── API: driverlar lokatsiyasi ───────────────────────────────
  const { data: driversRaw = [], isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['driver-locations'],
    queryFn: () => httpClient.get('/drivers/locations'),
    refetchInterval: 10000,
  })

  // React Query v5 da onSuccess olib tashlangan - useEffect orqali kuzatamiz
  useEffect(() => {
    if (dataUpdatedAt) setLastUpdate(new Date(dataUpdatedAt))
  }, [dataUpdatedAt])

  const drivers = (Array.isArray(driversRaw) ? driversRaw : driversRaw?.data || []).filter(
    (d) => d.lat && d.lng
  )

  // ─── Leaflet yuklash ──────────────────────────────────────────
  useEffect(() => {
    let destroyed = false
    getLeaflet().then((Lf) => {
      if (destroyed || !mapRef.current || mapInstanceRef.current) return

      mapInstanceRef.current = Lf.map(mapRef.current, {
        center: [41.311, 69.24],
        zoom: 10,
        zoomControl: true,
      })

      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)

      setLeafletReady(true)
    })

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = {}
        setLeafletReady(false)
      }
    }
  }, [])

  // ─── Markerlarni yangilash ────────────────────────────────────
  const updateMarkers = useCallback(async () => {
    const Lf = await getLeaflet()
    const map = mapInstanceRef.current
    if (!map || !Lf) return

    const currentIds = new Set(drivers.map((d) => d.id))

    // Yo'qolgan driverlar markerini o'chirish
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(markersRef.current[id])
        delete markersRef.current[id]
      }
    })

    // Mavjud va yangi driverlar
    drivers.forEach((driver) => {
      const pos = [driver.lat, driver.lng]
      const isSelected = selectedDriver?.id === driver.id
      const ordersCount = driver.active_orders || 0
      const icon = makeDriverIcon(Lf, isSelected, ordersCount)

      if (markersRef.current[driver.id]) {
        markersRef.current[driver.id].setLatLng(pos).setIcon(icon)
      } else {
        const marker = Lf.marker(pos, { icon })
          .addTo(map)
          .bindTooltip(
            `<b>${driver.name || driver.firstName + ' ' + driver.lastName}</b><br/>📦 ${ordersCount} ta buyurtma`,
            { permanent: false, direction: 'top' }
          )
        marker.on('click', () => setSelectedDriver(driver))
        markersRef.current[driver.id] = marker
      }
    })
  }, [drivers, selectedDriver])

  useEffect(() => {
    if (leafletReady) updateMarkers()
  }, [leafletReady, updateMarkers])

  // ─── Tanlangan driver yo'nalishini chizish ────────────────────
  useEffect(() => {
    const draw = async () => {
      const Lf = await getLeaflet()
      const map = mapInstanceRef.current
      if (!map || !Lf) return

      // Eski yo'l va destinatsiya markerini o'chirish
      if (routeLayerRef.current) {
        routeLayerRef.current.forEach((l) => map.removeLayer(l))
        routeLayerRef.current = null
      }

      if (!selectedDriver) return

      const driverPos = [selectedDriver.lat, selectedDriver.lng]
      const layers = []

      // Driverga zoom
      map.flyTo(driverPos, 13, { animate: true, duration: 1.2 })

      // Agar mijoz lokatsiyasi bo'lsa yo'nalish chizish
      const dest = selectedDriver.delivery_lat && selectedDriver.delivery_lng
        ? [selectedDriver.delivery_lat, selectedDriver.delivery_lng]
        : null

      if (dest) {
        // Straight-line yo'l (real routing API siz)
        const line = Lf.polyline([driverPos, dest], {
          color: '#7c3aed',
          weight: 3,
          opacity: 0.8,
          dashArray: '8, 6',
        }).addTo(map)
        layers.push(line)

        // Destinatsiya markeri
        const destMarker = Lf.marker(dest, { icon: makeDestIcon(Lf) })
          .addTo(map)
          .bindPopup(`<b>Yetkazish manzili</b><br/>${selectedDriver.delivery_address || ''}`)
          .openPopup()
        layers.push(destMarker)
      }

      routeLayerRef.current = layers
    }
    draw()
  }, [selectedDriver])

  const activeDriving = drivers.filter((d) => (d.active_orders || 0) > 0)
  const idle = drivers.filter((d) => (d.active_orders || 0) === 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="glass-card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">🗺️ Jonli GPS Monitoring</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {drivers.length} ta faol haydovchi ·
            <span className="text-cyan-600 font-semibold"> {activeDriving.length} ta yuk bilan</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-slate-400">
              Yangilandi: {lastUpdate.toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            10 soniyada yangilanadi
          </span>
          <button
            className="secondary-button flex items-center gap-1 text-xs"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Yangilash
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Xarita */}
        <div className="glass-card overflow-hidden">
          <div
            ref={mapRef}
            className="w-full"
            style={{ height: '520px' }}
          />
          {!leafletReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <div className="text-slate-500 animate-pulse">Xarita yuklanmoqda...</div>
            </div>
          )}
        </div>

        {/* Driver paneli */}
        <div className="space-y-3">
          {/* Tanlangan driver detali */}
          {selectedDriver && (
            <div className="glass-card p-4 border-2 border-purple-300 dark:border-purple-700 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-purple-700 dark:text-purple-300">Driver detali</h3>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">
                  🚚
                </div>
                <div>
                  <p className="font-black">
                    {selectedDriver.name || `${selectedDriver.firstName || ''} ${selectedDriver.lastName || ''}`.trim()}
                  </p>
                  <p className="text-sm text-slate-500">{selectedDriver.phone || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-2">
                  <p className="text-xs text-slate-500">Avtomobil</p>
                  <p className="font-bold">{selectedDriver.plateNumber || '—'}</p>
                </div>
                <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/20 p-2">
                  <p className="text-xs text-slate-500">Faol buyurtma</p>
                  <p className="font-black text-cyan-700 dark:text-cyan-300">
                    {selectedDriver.active_orders || 0} ta
                  </p>
                </div>
              </div>

              {/* Qayerga ketayotgani */}
              {selectedDriver.delivery_address ? (
                <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-3 space-y-1">
                  <p className="text-xs font-bold text-purple-600 flex items-center gap-1">
                    <Navigation className="h-3 w-3" /> Qayerga ketayapti
                  </p>
                  <p className="text-sm font-semibold">{selectedDriver.delivery_address}</p>
                  {selectedDriver.customer_name && (
                    <p className="text-xs text-slate-500">Mijoz: {selectedDriver.customer_name}</p>
                  )}
                  {selectedDriver.delivery_lat && selectedDriver.delivery_lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDriver.delivery_lat},${selectedDriver.delivery_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 font-semibold underline"
                    >
                      Google Maps da ko'rish ↗
                    </a>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 text-sm text-slate-500">
                  Hozirda yuk yo'q yoki manzil ma'lum emas
                </div>
              )}

              {/* Buyurtmalar ro'yxati */}
              {selectedDriver.orders?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase">Buyurtmalar</p>
                  {selectedDriver.orders.map((o, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs">
                      <span className="font-mono">#{o.id?.slice(-6)}</span>
                      <span className="text-slate-500 ml-2">{o.delivery_address?.slice(0, 30)}...</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Koordinat: {selectedDriver.lat?.toFixed(5)}, {selectedDriver.lng?.toFixed(5)}
                {selectedDriver.last_seen && ` · ${new Date(selectedDriver.last_seen).toLocaleTimeString('uz')}`}
              </p>
            </div>
          )}

          {/* Driverlar ro'yxati */}
          <div className="glass-card overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-white/10">
              <h4 className="font-bold text-sm">Haydovchilar ro'yxati</h4>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />)}
              </div>
            ) : drivers.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                <div className="text-3xl mb-2">🚫</div>
                GPS yoqqan haydovchi yo'q
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                {drivers.map((driver) => {
                  const name = driver.name || `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Driver'
                  const orders = driver.active_orders || 0
                  const isActive = orders > 0
                  const isSel = selectedDriver?.id === driver.id

                  return (
                    <button
                      key={driver.id}
                      className={`w-full flex items-center gap-3 p-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/5
                        ${isSel ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                      onClick={() => setSelectedDriver(isSel ? null : driver)}
                    >
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0
                        ${isActive ? 'bg-cyan-100 dark:bg-cyan-900/30' : 'bg-slate-100 dark:bg-white/10'}`}>
                        🚚
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{name}</p>
                        <p className="text-xs text-slate-500">{driver.plateNumber || '—'}</p>
                      </div>
                      {orders > 0 && (
                        <span className="shrink-0 rounded-full bg-cyan-500 text-white text-[10px] font-black px-2 py-0.5">
                          {orders} ta
                        </span>
                      )}
                      {!isActive && (
                        <span className="shrink-0 text-[10px] text-slate-400">Bo'sh</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Statistika */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-black text-cyan-600">{activeDriving.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Yuk bilan</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-black text-slate-500">{idle.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Bo'sh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
