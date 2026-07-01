import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Trash2, MapPin, Navigation, Loader2, CheckCircle2,
         CreditCard, Plus, Minus, ArrowRight, Package, Send, Clock, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/index.js'
import { formatCurrency } from '../../utils/formatters.js'

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`,
      { headers: { 'User-Agent': 'BaliqSavdosi/1.0' } }
    )
    const d = await res.json()
    return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
}

function LocationPicker({ value, onChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const pushToast = useToastStore(s => s.pushToast)

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) { setError("GPS qo'llab-quvvatlanmaydi"); return }
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const address = await reverseGeocode(lat, lng)
        onChange({ lat, lng, address })
        setLoading(false)
        pushToast({ title: 'Lokatsiya aniqlandi ✅', variant: 'success' })
      },
      (err) => {
        setLoading(false)
        setError({ 1: "GPS ruxsat berilmadi", 2: "GPS signal topilmadi", 3: "Vaqt tugadi" }[err.code] || 'GPS xato')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [onChange, pushToast])

  if (value) return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">Lokatsiya aniqlandi</p>
          <p className="text-[12px] text-emerald-600/80 mt-0.5 line-clamp-2">{value.address}</p>
        </div>
        <button onClick={() => onChange(null)} className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors flex-shrink-0">
          O'zgartirish
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-2">
      <button type="button" onClick={getLocation} disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.1] py-5 text-[14px] font-semibold text-slate-500 dark:text-slate-400 transition-all hover:border-sky-300 dark:hover:border-sky-600/40 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 disabled:opacity-50">
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Aniqlanmoqda...</> : <><Navigation className="h-5 w-5" /> Hozirgi joylashuvimni aniqlash</>}
      </button>
      {error && <p className="text-[12px] font-medium text-rose-500">⚠️ {error}</p>}
    </div>
  )
}

const PAY_OPTIONS = [
  { id: 'click', label: 'Click', icon: '💳', from: 'from-blue-500', to: 'to-blue-600', ring: 'border-blue-400 dark:border-blue-500/40', soft: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'payme', label: 'Payme', icon: '💳', from: 'from-indigo-500', to: 'to-violet-600', ring: 'border-indigo-400 dark:border-indigo-500/40', soft: 'bg-indigo-50 dark:bg-indigo-500/10' },
]

function PaymentWaiting({ pendingId, onSuccess, onCancel }) {
  const pushToast = useToastStore(s => s.pushToast)
  const [count, setCount] = useState(0)

  const { data: status } = useQuery({
    queryKey: ['payment-status', pendingId],
    queryFn: () => httpClient.get(`/telegram-payment/status/${pendingId}`),
    refetchInterval: 3000,
    enabled: !!pendingId,
    onSuccess: (data) => {
      if (data?.paid || data?.status === 'PAID') {
        pushToast({ title: '✅ To\'lov tasdiqlandi! Buyurtma yaratildi.', variant: 'success' })
        onSuccess(data.order_id)
      }
    },
  })

  const isPaid = status?.paid || status?.status === 'PAID'

  return (
    <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
      {isPaid ? (
        <>
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600">To'lov muvaffaqiyatli!</p>
          <p className="text-slate-400 text-sm">Buyurtma yaratildi, Telegram ga tasdiq yuborildi.</p>
        </>
      ) : (
        <>
          <div className="h-16 w-16 rounded-full bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center">
            <Clock className="h-7 w-7 text-sky-500 animate-pulse" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-800 dark:text-white">To'lov kutilmoqda...</p>
            <p className="text-[14px] text-slate-400 mt-1">Telegram botni oching va to'lovni yakunlang.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Har 3 soniyada yangilanmoqda
          </div>
          <button onClick={onCancel} className="secondary-button text-sm">
            Bekor qilish
          </button>
        </>
      )}
    </div>
  )
}

export function CartPage() {
  usePageTitle('Savatcha')
  const navigate     = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const pushToast    = useToastStore(s => s.pushToast)
  const [location, setLocation]   = useState(null)
  const [payMethod, setPayMethod] = useState('')
  const [locErr, setLocErr]       = useState(false)
  const [payErr, setPayErr]       = useState(false)
  const [pendingId, setPendingId] = useState(null)

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  const sendInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!location) throw new Error('location')
      if (!payMethod) throw new Error('payment')

      // 1. Pending payment yaratish
      const pending = await httpClient.post('/telegram-payment/create-pending', {
        items: items.map(i => ({
          fish_id: i.fish_id || i.id,
          fish_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
          unit: i.unit || 'kg',
        })),
        delivery_address: location.address,
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        provider: payMethod,
      })

      // 2. Telegram invoice yuborish
      await httpClient.post('/telegram-payment/send-invoice', {
        pending_payment_id: pending.pending_payment_id,
        provider: payMethod,
      })

      return pending.pending_payment_id
    },
    onSuccess: (id) => {
      setPendingId(id)
      pushToast({ title: 'Invoice Telegram ga yuborildi! 📱', variant: 'success' })
    },
    onError: (err) => {
      if (err.message === 'location') { setLocErr(true); pushToast({ title: 'Lokatsiyani aniqlang!', variant: 'error' }) }
      else if (err.message === 'payment') { setPayErr(true); pushToast({ title: "To'lov usulini tanlang!", variant: 'error' }) }
      else pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' })
    },
  })

  const handlePaymentSuccess = (orderId) => {
    clearCart()
    setTimeout(() => navigate('/customer/orders'), 1500)
  }

  // ── To'lov kutilmoqda holati ──
  if (pendingId) {
    return (
      <div className="space-y-4 animate-fade-in max-w-md mx-auto">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
            <Send className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">To'lov</h2>
            <p className="text-[14px] text-slate-400">Telegram botda to'lovni yakunlang</p>
          </div>
        </div>
        <PaymentWaiting
          pendingId={pendingId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPendingId(null)}
        />
      </div>
    )
  }

  // ── Bo'sh savatcha ──
  if (items.length === 0) return (
    <div className="space-y-5 animate-fade-in">
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Savatcha</h2>
          <p className="text-[14px] text-slate-400">Hozircha bo'sh</p>
        </div>
      </div>
      <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.05]">
          <ShoppingBag className="h-9 w-9 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-[17px] font-bold text-slate-600 dark:text-slate-400">Savatcha bo'sh</p>
        <p className="mt-1.5 text-[14px] text-slate-400 max-w-xs">Katalogdan baliq tanlang va savatchaga qo'shing</p>
        <button className="primary-button mt-6" onClick={() => navigate('/customer/fish-catalog')}>
          Katalogga o'tish <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Savatcha</h2>
            <p className="text-[14px] text-slate-400">{items.length} xil · {itemCount} kg</p>
          </div>
        </div>
        <button onClick={clearCart} className="text-[13px] font-semibold text-rose-400 hover:text-rose-500 transition-colors flex items-center gap-1.5">
          <Trash2 className="h-4 w-4" /> Tozalash
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Mahsulotlar */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.04]">
            <p className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Mahsulotlar</p>
          </div>
          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/10 text-2xl">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full rounded-xl object-cover" /> : '🐟'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[13px] text-sky-600 dark:text-sky-400">{formatCurrency(item.price)}/{item.unit || 'kg'}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, (parseFloat(item.quantity)||1) - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:border-sky-300 hover:text-sky-600 dark:hover:border-sky-600/40 dark:hover:text-sky-400 transition-all text-slate-600 dark:text-slate-400">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input type="number" inputMode="decimal" min={1} value={item.quantity}
                    onChange={e => { const v = e.target.value; const n = parseFloat(v); if (!isNaN(n)) updateQuantity(item.id, n) }}
                    onBlur={e => { const n = parseFloat(e.target.value); if (isNaN(n) || n < 1) updateQuantity(item.id, 1) }}
                    className="w-14 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] py-1.5 text-center text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-sky-400 transition-colors"
                    style={{ fontFamily: 'inherit' }}
                  />
                  <button onClick={() => updateQuantity(item.id, (parseFloat(item.quantity)||0) + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:border-sky-300 hover:text-sky-600 dark:hover:border-sky-600/40 dark:hover:text-sky-400 transition-all text-slate-600 dark:text-slate-400">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="w-24 text-right text-[14px] font-bold text-slate-800 dark:text-white hidden sm:block flex-shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <button onClick={() => removeItem(item.id)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary panel */}
        <div className="space-y-4">
          {/* Lokatsiya */}
          <div className={`glass-card p-5 space-y-3 transition-all ${locErr && !location ? 'ring-2 ring-rose-400/50' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/15">
                <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-white">Yetkazish manzili <span className="text-rose-400">*</span></p>
            </div>
            <LocationPicker value={location} onChange={v => { setLocation(v); setLocErr(false) }} />
          </div>

          {/* To'lov usuli */}
          <div className={`glass-card p-5 space-y-3 transition-all ${payErr && !payMethod ? 'ring-2 ring-rose-400/50' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/15">
                <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-white">To'lov usuli <span className="text-rose-400">*</span></p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {PAY_OPTIONS.map(opt => (
                <button key={opt.id} type="button" onClick={() => { setPayMethod(opt.id); setPayErr(false) }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-[13px] font-semibold transition-all ${payMethod === opt.id ? `${opt.ring} ${opt.soft} scale-[1.02]` : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300'}`}>
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-slate-800 dark:text-white">{opt.label}</span>
                  <span className="text-[10px] text-slate-400">Telegram invoice</span>
                  {payMethod === opt.id && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 p-3">
              <Send className="h-4 w-4 text-sky-500 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-sky-700 dark:text-sky-400 leading-relaxed">
                To'lov Telegram invoice orqali amalga oshiriladi. <b>To'lov tasdiqlangandan keyingina buyurtma yaratiladi.</b>
              </p>
            </div>
          </div>

          {/* Jami */}
          <div className="glass-card p-5 space-y-4">
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500 truncate max-w-[170px]">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
                <span className="text-[15px] font-bold text-slate-800 dark:text-white">Jami</span>
                <span className="text-[22px] font-extrabold text-sky-600 dark:text-sky-400">{formatCurrency(total)}</span>
              </div>
            </div>
            <button
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-[15px] font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.3)' }}
              onClick={() => sendInvoiceMutation.mutate()}
              disabled={sendInvoiceMutation.isPending}
              onMouseEnter={e => { if (!sendInvoiceMutation.isPending) e.currentTarget.style.background = 'linear-gradient(135deg,#38bdf8,#0ea5e9)' }}
              onMouseLeave={e => { if (!sendInvoiceMutation.isPending) e.currentTarget.style.background = 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}
            >
              {sendInvoiceMutation.isPending
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Yuborilmoqda...</>
                : <><Send className="h-5 w-5" /> Telegram invoice yuborish</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
