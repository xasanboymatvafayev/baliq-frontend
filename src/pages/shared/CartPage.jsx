import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Trash2, MapPin, Navigation, Loader2, CheckCircle2, CreditCard, Banknote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { orderService, httpClient } from '../../services/api/index.js'
import { formatCurrency, formatNumber } from '../../utils/formatters.js'

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`, { headers: { 'User-Agent': 'BaliqSavdosi/1.0' } })
    const d = await res.json()
    return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
}

function LocationPicker({ value, onChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pushToast = useToastStore((s) => s.pushToast)

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) { setError("GPS qo'llab-quvvatlanmaydi"); return }
    setLoading(true); setError('')
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
        const msgs = { 1: "GPS ruxsat berilmadi", 2: "GPS signal topilmadi", 3: "Vaqt tugadi" }
        setError(msgs[err.code] || 'GPS xato')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [onChange, pushToast])

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-bold">
        <MapPin className="h-4 w-4 text-ocean-600" />
        Yetkazish manzili <span className="text-rose-500">*</span>
      </label>
      <button type="button" onClick={getLocation} disabled={loading}
        className={`w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 font-bold transition
          ${value ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : 'border-ocean-300 bg-ocean-50/50 text-ocean-700 hover:bg-ocean-100 dark:bg-ocean-900/20'}`}>
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Aniqlanmoqda...</>
          : value ? <><CheckCircle2 className="h-5 w-5" /> Lokatsiya aniqlandi</>
          : <><Navigation className="h-5 w-5" /> Hozirgi joylashuvimni aniqlash</>}
      </button>
      {value && (
        <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 text-sm">
          <p className="font-semibold">{value.address}</p>
          <p className="font-mono text-xs text-slate-400 mt-0.5">{value.coords}</p>
          <button onClick={() => onChange(null)} className="text-xs text-rose-500 font-bold mt-1">Qayta aniqlash</button>
        </div>
      )}
      {error && <p className="text-xs text-rose-500 font-semibold">⚠️ {error}</p>}
    </div>
  )
}

export function CartPage() {
  usePageTitle('Savatcha')
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [location, setLocation] = useState(null)
  const [payMethod, setPayMethod] = useState('')   // 'cash' | 'click' | 'payme'
  const [locationError, setLocationError] = useState(false)
  const [payError, setPayError] = useState(false)

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!location) throw new Error('location')
      if (!payMethod) throw new Error('payment')
      const order = await orderService.create({
        items: items.map((i) => ({ fish_id: i.fish_id || i.id, quantity: i.quantity, unit_price: i.price })),
        delivery_address: location.address,
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        delivery_coords: location.coords,
        payment_method: payMethod,
      })
      // Karta tanlansa Telegram invoice yuborish
      if (payMethod !== 'cash') {
        try {
          await httpClient.post('/telegram-payment/send-invoice', {
            order_id: order.id,
            provider: payMethod,
          })
        } catch (_) {}
      }
      return order
    },
    onSuccess: () => {
      clearCart()
      pushToast({ title: payMethod === 'cash' ? 'Buyurtma yaratildi! 🎉' : 'Buyurtma yaratildi! Telegram ga invoice yuborildi 📱', variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      navigate('/customer/orders')
    },
    onError: (err) => {
      if (err.message === 'location') { setLocationError(true); pushToast({ title: 'Lokatsiyani aniqlang!', variant: 'error' }) }
      else if (err.message === 'payment') { setPayError(true); pushToast({ title: "To'lov usulini tanlang!", variant: 'error' }) }
      else pushToast({ title: err.message, variant: 'error' })
    },
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Savatcha</h2>
          <p className="mt-1 text-slate-500">{items.length} ta mahsulot</p>
        </div>
        <ShoppingBag className="h-10 w-10 text-ocean-600" />
      </section>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">Savatcha bo'sh</p>
          <button className="primary-button mt-4" onClick={() => navigate('/customer/fish-catalog')}>Katalogga o'tish</button>
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
                  <button
                    className="secondary-button px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, Math.max(1, (parseFloat(item.quantity) || 1) - 1))}
                  >−</button>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    className="w-16 text-center font-bold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 py-1.5 outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 dark:focus:ring-ocean-900/40"
                    value={item.quantity}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '') { updateQuantity(item.id, ''); return }
                      const num = parseFloat(v)
                      if (!isNaN(num)) updateQuantity(item.id, num)
                    }}
                    onBlur={(e) => {
                      const num = parseFloat(e.target.value)
                      if (isNaN(num) || num < 1) updateQuantity(item.id, 1)
                    }}
                  />
                  <button
                    className="secondary-button px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, (parseFloat(item.quantity) || 0) + 1)}
                  >+</button>
                </div>
                <p className="w-28 text-right font-bold shrink-0 hidden sm:block">{formatCurrency(item.price * item.quantity)}</p>
                <button className="text-rose-500" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 space-y-5">
            {/* Lokatsiya */}
            <div className={locationError && !location ? 'ring-2 ring-rose-400 rounded-2xl p-3 -m-3' : ''}>
              <LocationPicker value={location} onChange={(v) => { setLocation(v); setLocationError(false) }} />
            </div>

            {/* To'lov usuli */}
            <div className={`space-y-3 ${payError && !payMethod ? 'ring-2 ring-rose-400 rounded-2xl p-3 -m-3' : ''}`}>
              <label className="flex items-center gap-2 text-sm font-bold">
                <CreditCard className="h-4 w-4 text-ocean-600" />
                To'lov usuli <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Naqt pul — tez orada */}
                <div className="relative flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 py-4 font-bold text-sm opacity-50 cursor-not-allowed select-none">
                  <span className="text-2xl">💵</span>
                  <span className="text-slate-400">Naqt pul</span>
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-amber-900 whitespace-nowrap">Tez orada</span>
                </div>
                {[
                  { id: 'click', icon: '💳', label: 'Click' },
                  { id: 'payme', icon: '💳', label: 'Payme' },
                ].map((opt) => (
                  <button key={opt.id} type="button"
                    onClick={() => { setPayMethod(opt.id); setPayError(false) }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 font-bold text-sm transition
                      ${payMethod === opt.id
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-700 dark:bg-ocean-900/30 dark:text-ocean-300'
                        : 'border-slate-200 hover:border-ocean-300 dark:border-white/10'}`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    {opt.label}
                    <span className="text-[10px] text-slate-400">Telegram invoice</span>
                  </button>
                ))}
              </div>
              {payMethod && payMethod !== 'cash' && (
                <div className="rounded-2xl bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 p-3 text-sm text-ocean-700 dark:text-ocean-300">
                  📱 Buyurtma yaratilgach Telegram ga <b>{payMethod === 'click' ? 'Click' : 'Payme'}</b> orqali to'lov invoice yuboriladi
                </div>
              )}
            </div>

            {/* Jami va buyurtma */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <p className="text-sm text-slate-500">Jami summa</p>
                <p className="text-3xl font-black text-ocean-600">{formatCurrency(total)}</p>
              </div>
              <button className="primary-button text-lg px-8 py-3"
                onClick={() => orderMutation.mutate()}
                disabled={orderMutation.isPending}>
                {orderMutation.isPending ? 'Yuborilmoqda...' : 'Buyurtma berish'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
