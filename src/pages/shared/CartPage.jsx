import { useState, useCallback, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Trash2, MapPin, Navigation, Loader2, CheckCircle2, CreditCard, Tag, X, Minus, Plus, Send, RefreshCw, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { orderService, httpClient } from '../../services/api/index.js'
import { formatCurrency, formatNumber } from '../../utils/formatters.js'
import { ConfirmModal } from '../../components/common/ConfirmModal.jsx'
import { useT } from '../../store/i18nStore.js'

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`, { headers: { 'User-Agent': 'BaliqSavdosi/1.0' } })
    const d = await res.json()
    return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
}

function LocationPicker({ value, onChange, t }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pushToast = useToastStore((s) => s.pushToast)

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) { setError(t.lang === 'ru' ? 'GPS не поддерживается' : "GPS qo'llab-quvvatlanmaydi"); return }
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const address = await reverseGeocode(lat, lng)
        onChange({ lat, lng, address, coords: `${lat.toFixed(6)},${lng.toFixed(6)}` })
        setLoading(false)
        pushToast({ title: t.lang === 'ru' ? 'Местоположение определено ✅' : 'Lokatsiya aniqlandi ✅', variant: 'success' })
      },
      (err) => {
        setLoading(false)
        const msgs = t.lang === 'ru'
          ? { 1: "GPS: доступ запрещён", 2: "GPS сигнал не найден", 3: "Время ожидания истекло" }
          : { 1: "GPS ruxsat berilmadi", 2: "GPS signal topilmadi", 3: "Vaqt tugadi" }
        setError(msgs[err.code] || 'GPS xato')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [onChange, pushToast, t])

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-bold">
        <MapPin className="h-4 w-4 text-ocean-600" />
        {t.cartDeliveryAddress} <span className="text-rose-500">*</span>
      </label>
      <button type="button" onClick={getLocation} disabled={loading}
        className={`w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 font-bold transition
          ${value ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
            : 'border-ocean-300 bg-ocean-50/50 dark:bg-ocean-900/20 text-ocean-700 dark:text-ocean-300 hover:bg-ocean-100 dark:hover:bg-ocean-900/30'}`}>
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> {t.cartDetecting}</>
          : value ? <><CheckCircle2 className="h-5 w-5" /> {t.cartLocationDetected}</>
          : <><Navigation className="h-5 w-5" /> {t.cartGetLocation}</>}
      </button>
      {value && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/50 p-3 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{value.address}</p>
              <p className="font-mono text-xs text-slate-400 mt-0.5">{value.coords}</p>
            </div>
            <button onClick={() => onChange(null)} className="text-slate-400 hover:text-rose-500 transition shrink-0 mt-0.5">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">⚠️ {error}</p>}
    </div>
  )
}

function PromoCodeInput({ onApply, appliedPromo, t }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const pushToast = useToastStore((s) => s.pushToast)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await httpClient.post('/promo/validate', { code: code.trim().toUpperCase() })
      onApply(res)
      pushToast({ title: `${t.lang === 'ru' ? 'Промокод применён!' : "Promo-kod qo'llandi!"} ${res.discount_percent}% ${t.lang === 'ru' ? 'скидка ✅' : 'chegirma ✅'}`, variant: 'success' })
    } catch (err) {
      pushToast({ title: err?.response?.data?.detail || (t.lang === 'ru' ? 'Промокод неверный' : "Promo-kod noto'g'ri"), variant: 'error' })
    } finally { setLoading(false) }
  }

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {appliedPromo.code} — {appliedPromo.discount_percent}% {t.lang === 'ru' ? 'скидка' : 'chegirma'}
          </span>
        </div>
        <button onClick={() => onApply(null)} className="text-slate-400 hover:text-rose-500 transition">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-bold">
        <Tag className="h-4 w-4 text-ocean-600" />
        {t.cartPromoCode}
      </label>
      <div className="flex gap-2">
        <input
          className="soft-input flex-1 font-mono uppercase tracking-widest"
          placeholder="BALIQ2026"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={20}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="secondary-button shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.cartPromoApply}
        </button>
      </div>
    </div>
  )
}

// ─── To'lov kutish ekrani ───────────────────────────────────────────
function WaitingPaymentScreen({ orderId, provider, onPaid, onCancel, t }) {
  const [checking, setChecking] = useState(false)
  const [paid, setPaid] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 daqiqa = 600 sekund
  const intervalRef = useRef(null)
  const timerRef = useRef(null)

  const checkStatus = useCallback(async () => {
    if (paid) return
    setChecking(true)
    try {
      const data = await httpClient.get(`/telegram-payment/status/${orderId}`)
      if (data.paid) {
        setPaid(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
        onPaid()
      }
    } catch { /* ignore */ } finally {
      setChecking(false)
    }
  }, [orderId, paid, onPaid])

  useEffect(() => {
    intervalRef.current = setInterval(checkStatus, 5000)
    // 10 daqiqalik taymer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          clearInterval(intervalRef.current)
          // Muddati tugagan — avtomatik bekor qilish
          setTimeout(() => onCancel(), 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [checkStatus, onCancel])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="glass-card p-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ocean-100 dark:bg-ocean-900/30">
          <Send className="h-10 w-10 text-ocean-500 animate-pulse" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black">{t.waitingPaymentTitle}</h3>
        <p className="mt-2 text-slate-500">{t.waitingPaymentDesc}</p>
      </div>

      <div className="rounded-2xl bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-700/50 p-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-ocean-700 dark:text-ocean-300">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="text-sm font-semibold">
            {t.lang === 'ru' ? 'Проверяем оплату каждые 5 сек...' : 'Har 5 soniyada to\'lov tekshirilmoqda...'}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {t.lang === 'ru' ? `Провайдер: ${provider === 'click' ? 'Click' : 'Payme'}` : `Provayder: ${provider === 'click' ? 'Click' : 'Payme'}`}
        </p>
        <div className={`flex items-center justify-center gap-2 font-bold text-sm ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : timeLeft < 180 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
          ⏱ {t.lang === 'ru' ? `Осталось: ${formatTime(timeLeft)}` : `Qolgan vaqt: ${formatTime(timeLeft)}`}
        </div>
        {timeLeft < 120 && timeLeft > 0 && (
          <p className="text-xs text-rose-400 font-semibold text-center">
            {t.lang === 'ru' ? '⚠️ Заказ скоро будет отменён!' : '⚠️ Buyurtma yaqinda bekor qilinadi!'}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={checkStatus}
          disabled={checking}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm transition"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: 'white', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? t.waitingPaymentChecking : t.waitingPaymentCheck}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3 font-bold text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-white/5"
        >
          {t.waitingPaymentCancel}
        </button>
      </div>
    </div>
  )
}

export function CartPage() {
  usePageTitle('Savatcha')
  const t = useT()
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [location, setLocation] = useState(null)
  const [payMethod, setPayMethod] = useState('')
  const [locationError, setLocationError] = useState(false)
  const [payError, setPayError] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [pendingOrderId, setPendingOrderId] = useState(null)

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.discount_percent / 100) : 0
  const total = subtotal - discount

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!location) throw new Error('location')
      if (!payMethod) throw new Error('payment')

      // 1-qadam: Kutuvchi to'lov yaratish (buyurtma hali yaratilmaydi)
      const pending = await httpClient.post('/telegram-payment/create-pending', {
        items: items.map((i) => ({
          fish_id: i.fish_id || i.id,
          fish_name: i.name || 'Baliq',
          quantity: i.quantity,
          unit_price: i.price,
          unit: i.unit || 'kg',
        })),
        delivery_address: location.address,
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        provider: payMethod,
      })

      // 2-qadam: Telegram invoice yuborish (to'g'ri field nomi: pending_payment_id)
      await httpClient.post('/telegram-payment/send-invoice', {
        pending_payment_id: pending.pending_payment_id,
        provider: payMethod,
      })

      return pending
    },
    onSuccess: (pending) => {
      clearCart()
      queryClient.invalidateQueries(['orders'])
      setPendingOrderId(pending.pending_payment_id)
      pushToast({
        title: t.lang === 'ru'
          ? `✅ Invoice отправлен в Telegram! Оплатите через ${payMethod === 'click' ? 'Click' : 'Payme'}`
          : `✅ Invoice Telegram ga yuborildi! ${payMethod === 'click' ? 'Click' : 'Payme'} orqali to'lang`,
        variant: 'success',
      })
    },
    onError: (err) => {
      if (err.message === 'location') { setLocationError(true); pushToast({ title: t.lang === 'ru' ? 'Укажите адрес доставки!' : 'Lokatsiyani aniqlang!', variant: 'error' }) }
      else if (err.message === 'payment') { setPayError(true); pushToast({ title: t.lang === 'ru' ? 'Выберите способ оплаты!' : "To'lov usulini tanlang!", variant: 'error' }) }
      else pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' })
    },
  })

  const handlePaid = () => {
    pushToast({ title: t.waitingPaymentSuccess, variant: 'success' })
    queryClient.invalidateQueries(['orders'])
    navigate('/customer/orders')
  }

  const handleCancelWaiting = () => {
    setPendingOrderId(null)
    navigate('/customer/orders')
  }

  // Waiting for payment screen
  if (pendingOrderId) {
    return (
      <div className="space-y-5">
        <section className="glass-card p-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{t.waitingPaymentTitle}</h2>
            <p className="text-sm text-slate-500 mt-0.5">#{pendingOrderId.slice(-6)}</p>
          </div>
        </section>
        <WaitingPaymentScreen
          orderId={pendingOrderId}
          provider={payMethod}
          onPaid={handlePaid}
          onCancel={handleCancelWaiting}
          t={t}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ConfirmModal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => { removeItem(confirmRemove); setConfirmRemove(null) }}
        title={t.cartRemoveTitle}
        description={t.cartRemoveDesc}
        confirmText={t.cartConfirm}
        cancelText={t.cartCancel}
      />

      <section className="glass-card p-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">{t.cartTitle}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} {t.cartItems}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center">
          <ShoppingBag className="h-6 w-6 text-ocean-600 dark:text-ocean-400" />
        </div>
      </section>

      {items.length === 0 ? (
        <div className="glass-card p-14 text-center space-y-4">
          <div className="text-5xl">🛒</div>
          <p className="text-slate-500 font-medium">{t.cartEmpty}</p>
          <button className="primary-button" onClick={() => navigate('/customer/fish-catalog')}>{t.cartGoToCatalog}</button>
        </div>
      ) : (
        <>
          {/* Items list */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wide">{t.cartProducts}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                  <div className="h-14 w-14 rounded-2xl shrink-0 overflow-hidden shadow-sm">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full bg-gradient-to-br from-ocean-100 to-cyan-100 dark:from-ocean-900/30 dark:to-cyan-900/30 flex items-center justify-center text-2xl">🐟</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{item.name}</p>
                    <p className="text-sm text-ocean-600 dark:text-ocean-400 font-semibold">{formatNumber(item.price)} {t.somPrice}/{item.unit || 'kg'}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-white/5 rounded-2xl p-1">
                    <button
                      className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-white/10 flex items-center justify-center transition text-slate-600 dark:text-slate-300 font-bold"
                      onClick={() => updateQuantity(item.id, Math.max(1, (parseFloat(item.quantity) || 1) - 1))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={item.stock ?? undefined}
                      className="w-14 text-center font-bold text-sm bg-transparent outline-none text-slate-800 dark:text-white"
                      value={item.quantity}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === '') { updateQuantity(item.id, ''); return }
                        const num = parseFloat(v)
                        const maxQty = item.stock ?? Infinity
                        if (!isNaN(num)) updateQuantity(item.id, Math.min(num, maxQty))
                      }}
                      onBlur={(e) => {
                        const num = parseFloat(e.target.value)
                        const maxQty = item.stock ?? Infinity
                        if (isNaN(num) || num < 1) updateQuantity(item.id, 1)
                        else if (num > maxQty) updateQuantity(item.id, maxQty)
                      }}
                    />
                    <button
                      className={`h-8 w-8 rounded-xl flex items-center justify-center transition font-bold ${
                        item.stock != null && (parseFloat(item.quantity) || 0) >= item.stock
                          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                      }`}
                      onClick={() => {
                        const maxQty = item.stock ?? Infinity
                        const cur = parseFloat(item.quantity) || 0
                        if (cur < maxQty) updateQuantity(item.id, cur + 1)
                      }}
                      disabled={item.stock != null && (parseFloat(item.quantity) || 0) >= item.stock}
                      title={item.stock != null ? `Omborda: ${item.stock} ${item.unit || 'kg'}` : undefined}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {item.stock != null && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 text-right w-full">
                      Ombor: {item.stock} {item.unit || 'kg'}
                    </p>
                  )}
                  <p className="w-28 text-right font-black shrink-0 hidden sm:block text-sm">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition shrink-0"
                    onClick={() => setConfirmRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout form */}
          <div className="glass-card p-6 space-y-6">
            <div className={locationError && !location ? 'ring-2 ring-rose-400 rounded-2xl p-3 -m-3' : ''}>
              <LocationPicker value={location} onChange={(v) => { setLocation(v); setLocationError(false) }} t={t} />
            </div>

            <PromoCodeInput onApply={setAppliedPromo} appliedPromo={appliedPromo} t={t} />

            {/* To'lov usuli */}
            <div className={`space-y-3 ${payError && !payMethod ? 'ring-2 ring-rose-400 rounded-2xl p-3 -m-3' : ''}`}>
              <label className="flex items-center gap-2 text-sm font-bold">
                <CreditCard className="h-4 w-4 text-ocean-600" />
                {t.cartPayMethod} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 py-4 font-bold text-sm opacity-40 cursor-not-allowed select-none">
                  <span className="text-2xl">💵</span>
                  <span className="text-slate-400 text-xs">{t.cartCash}</span>
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-amber-900 whitespace-nowrap">{t.cartComingSoon}</span>
                </div>
                {[
                  { id: 'click', icon: '💳', label: 'Click', sub: t.cartTelegramInvoice },
                  { id: 'payme', icon: '💳', label: 'Payme', sub: t.cartTelegramInvoice },
                ].map((opt) => (
                  <button key={opt.id} type="button"
                    onClick={() => { setPayMethod(opt.id); setPayError(false) }}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-4 font-bold text-sm transition-all
                      ${payMethod === opt.id
                        ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300 shadow-md shadow-ocean-500/10'
                        : 'border-slate-200 dark:border-white/10 hover:border-ocean-300 dark:hover:border-ocean-700'}`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    {opt.label}
                    <span className="text-[10px] text-slate-400 font-normal">{opt.sub}</span>
                  </button>
                ))}
              </div>

              {payMethod && (
                <div className="rounded-2xl bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 p-3 text-sm text-ocean-700 dark:text-ocean-300 flex items-start gap-2">
                  <Send className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    {t.lang === 'ru'
                      ? `📱 После оформления заказа в Telegram придёт invoice от ${payMethod === 'click' ? 'Click' : 'Payme'}. Заказ будет создан только после успешной оплаты.`
                      : `📱 Buyurtma berilgach Telegram ga ${payMethod === 'click' ? 'Click' : 'Payme'} invoice yuboriladi. Buyurtma faqat to'lov muvaffaqiyatli bo'lganda yaratiladi.`}
                  </span>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t.cartSubtotal} ({items.length} {t.lang === 'ru' ? 'шт.' : 'ta'})</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-semibold">{t.cartDiscount} ({appliedPromo?.discount_percent}%)</span>
                  <span className="font-bold text-emerald-600">−{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="pt-2.5 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span className="font-bold">{t.cartTotal}</span>
                <span className="text-2xl font-black text-ocean-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              className="primary-button w-full text-base py-3.5 shadow-xl shadow-ocean-500/25"
              onClick={() => orderMutation.mutate()}
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending
                ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {t.cartPlacing}</>
                : `🎉 ${t.cartPlaceOrder}`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
