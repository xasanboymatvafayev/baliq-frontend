import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Trash2, MapPin, Navigation, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { orderService } from '../../services/api/index.js'
import { formatCurrency, formatNumber } from '../../utils/formatters.js'

// ─── Koordinatdan manzil nomini olish (reverse geocode) ──────────
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`,
      { headers: { 'User-Agent': 'BaliqSavdosi/1.0' } }
    )
    const data = await res.json()
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

// ─── GPS lokatsiya komponenti ────────────────────────────────────
function LocationPicker({ value, onChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pushToast = useToastStore((s) => s.pushToast)

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Qurilmangiz GPS ni qo\'llab-quvvatlamaydi')
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const address = await reverseGeocode(lat, lng)
        onChange({ lat, lng, address, coords: `${lat.toFixed(6)},${lng.toFixed(6)}` })
        setLoading(false)
        pushToast({ title: 'Lokatsiya aniqlandi ✅', variant: 'success' })
      },
      (err) => {
        setLoading(false)
        const msgs = {
          1: "Lokatsiyaga ruxsat berilmadi. Telefon sozlamalaridan ruxsat bering.",
          2: "GPS signal topilmadi. Ko'chaga chiqing yoki WiFi yoqing.",
          3: "Vaqt tugadi. Qaytadan urinib ko'ring.",
        }
        setError(msgs[err.code] || 'GPS xato')
        pushToast({ title: msgs[err.code] || 'GPS xato', variant: 'error' })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [onChange, pushToast])

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold">
        <MapPin className="h-4 w-4 text-ocean-600" />
        Yetkazish manzili <span className="text-rose-500">*</span>
      </label>

      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 font-semibold transition
          ${value ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'border-ocean-300 bg-ocean-50/50 text-ocean-700 dark:bg-ocean-900/20 dark:text-ocean-300 hover:bg-ocean-100 dark:hover:bg-ocean-900/30'}`}
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> GPS aniqlanmoqda...</>
        ) : value ? (
          <><CheckCircle2 className="h-5 w-5" /> Lokatsiya aniqlandi</>
        ) : (
          <><Navigation className="h-5 w-5" /> Hozirgi joylashuvimni aniqlash</>
        )}
      </button>

      {value && (
        <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 text-sm space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300 leading-snug">{value.address}</p>
          <p className="font-mono text-xs text-slate-400">{value.coords}</p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
          >
            Qayta aniqlash
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 p-3 text-sm text-rose-700 dark:text-rose-300">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}

// ─── Asosiy CartPage ─────────────────────────────────────────────
export function CartPage() {
  usePageTitle('Savatcha')
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(false)

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const orderMutation = useMutation({
    mutationFn: () => {
      if (!location) {
        throw new Error('Yetkazish lokatsiyasini aniqlang!')
      }
      return orderService.create({
        items: items.map((i) => ({ fish_id: i.fish_id || i.id, quantity: i.quantity, unit_price: i.price })),
        delivery_address: location.address,
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        delivery_coords: location.coords,
      })
    },
    onSuccess: () => {
      clearCart()
      pushToast({ title: 'Buyurtma yaratildi! 🎉', variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      navigate('/customer/orders')
    },
    onError: (err) => {
      if (err.message?.includes('lokatsiya')) setLocationError(true)
      pushToast({ title: err.message, variant: 'error' })
    },
  })

  const handleOrder = () => {
    if (!location) {
      setLocationError(true)
      pushToast({ title: 'Avval lokatsiyangizni aniqlang!', variant: 'error' })
      return
    }
    setLocationError(false)
    orderMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <section className="glass-card flex items-center justify-between p-6">
        <div>
          <h2 className="text-3xl font-black">Savatcha</h2>
          <p className="mt-2 text-slate-500">{items.length} ta mahsulot</p>
        </div>
        <ShoppingBag className="h-10 w-10 text-ocean-600" />
      </section>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">Savatcha bo'sh</p>
          <button className="primary-button mt-4" onClick={() => navigate('/customer/fish-catalog')}>
            Katalogga o'tish
          </button>
        </div>
      ) : (
        <>
          <div className="glass-card divide-y divide-slate-100 dark:divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{item.name}</p>
                  <p className="text-sm text-ocean-600">{formatNumber(item.price)} so'm/{item.unit || 'kg'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="secondary-button px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</button>
                  <span className="w-10 text-center font-bold">{formatNumber(item.quantity)}</span>
                  <button className="secondary-button px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <p className="w-32 text-right font-bold shrink-0 hidden sm:block">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <button className="text-rose-500 hover:text-rose-600 shrink-0" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 space-y-5">
            {/* GPS lokatsiya */}
            <div className={locationError && !location ? 'ring-2 ring-rose-400 rounded-2xl p-3 -m-3' : ''}>
              <LocationPicker value={location} onChange={(v) => { setLocation(v); setLocationError(false) }} />
              {locationError && !location && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">⚠️ Buyurtma berish uchun lokatsiya majburiy!</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <p className="text-sm text-slate-500">Jami summa</p>
                <p className="text-3xl font-black text-ocean-600">{formatCurrency(total)}</p>
              </div>
              <button
                className="primary-button text-lg px-8 py-3"
                onClick={handleOrder}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? 'Yuborilmoqda...' : 'Buyurtma berish'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
