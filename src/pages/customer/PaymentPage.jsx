import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency, formatNumber } from '../../utils/formatters.js'
import { CreditCard, Gift, Tag, Star, ExternalLink, CheckCircle2, Clock, Send } from 'lucide-react'

// ─── To'lov sahifasi ─────────────────────────────────────────────
export function PaymentPage() {
  usePageTitle("To'lov va bonuslar")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [promoCode, setPromoCode] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [activeTab, setActiveTab] = useState('payment')

  // Bonus balans
  const { data: bonus = { balance: 0, history: [] } } = useQuery({
    queryKey: ['bonus-balance'],
    queryFn: () => httpClient.get('/payments/bonus/balance'),
  })

  // Kutilayotgan buyurtmalar
  const { data: ordersRaw } = useQuery({
    queryKey: ['pending-orders-pay'],
    queryFn: () => httpClient.get('/orders?status=PENDING&limit=10'),
  })
  const orders = ordersRaw?.data || ordersRaw || []

  // Telegram invoice
  const telegramPayMutation = useMutation({
    mutationFn: ({ orderId, provider }) =>
      httpClient.post('/telegram-payment/send-invoice', { order_id: orderId, provider }),
    onSuccess: (data) => pushToast({ title: data.message, variant: 'success' }),
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Telegram ulanmagan bo\'lishi mumkin', variant: 'error' }),
  })

  // To'lov havolasi
  const payMutation = useMutation({
    mutationFn: ({ orderId, provider }) =>
      httpClient.post('/payments/create-link', { order_id: orderId, provider }),
    onSuccess: (data) => {
      window.open(data.url, '_blank')
      pushToast({ title: `${data.provider === 'click' ? 'Click' : 'Payme'} to'lov sahifasi ochildi`, variant: 'success' })
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  // Promo-kod
  const promoMutation = useMutation({
    mutationFn: () => httpClient.post('/payments/promo/apply', { code: promoCode, order_id: selectedOrderId }),
    onSuccess: (data) => {
      pushToast({ title: data.message, variant: 'success' })
      setPromoCode('')
      queryClient.invalidateQueries(['pending-orders-pay'])
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Promo-kod xato', variant: 'error' }),
  })

  // Bonus sarflash
  const bonusMutation = useMutation({
    mutationFn: ({ orderId, amount }) =>
      httpClient.post('/payments/bonus/use', { order_id: orderId, amount }),
    onSuccess: (data) => {
      pushToast({ title: data.message, variant: 'success' })
      queryClient.invalidateQueries(['bonus-balance'])
      queryClient.invalidateQueries(['pending-orders-pay'])
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const tabs = [
    { id: 'payment', label: "To'lov", icon: CreditCard },
    { id: 'bonus',   label: 'Bonuslar', icon: Star },
    { id: 'promo',   label: 'Promo-kod', icon: Tag },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">💳 To'lov va bonuslar</h2>
          <p className="text-slate-500 mt-1">Click, Payme orqali to'lash. Bonus ball yig'ish.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Bonus balans</p>
          <p className="text-2xl font-black text-amber-500">⭐ {formatNumber(bonus.balance)}</p>
        </div>
      </div>

      {/* Tablar */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all
              ${activeTab === id ? 'bg-white dark:bg-slate-700 shadow-sm text-ocean-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* To'lov */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="glass-card p-10 text-center text-slate-500">
              <div className="text-4xl mb-2">✅</div>
              Kutilayotgan buyurtmalar yo'q
            </div>
          ) : orders.map((order) => (
            <div key={order.id} className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black">Buyurtma #{order.id?.slice(-6)}</p>
                  <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString('uz')}</p>
                </div>
                <p className="text-xl font-black text-ocean-600">{formatCurrency(order.total)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="primary-button gap-2 text-sm"
                  onClick={() => telegramPayMutation.mutate({ orderId: order.id, provider: 'click' })}
                  disabled={telegramPayMutation.isPending}>
                  <Send className="h-4 w-4" /> Telegram Click
                </button>
                <button className="primary-button gap-2 text-sm !bg-gradient-to-r !from-blue-600 !to-blue-800"
                  onClick={() => telegramPayMutation.mutate({ orderId: order.id, provider: 'payme' })}
                  disabled={telegramPayMutation.isPending}>
                  <Send className="h-4 w-4" /> Telegram Payme
                </button>
                <button className="secondary-button gap-2 text-sm"
                  onClick={() => payMutation.mutate({ orderId: order.id, provider: 'click' })}
                  disabled={payMutation.isPending}>
                  <ExternalLink className="h-4 w-4" /> Click (web)
                </button>
                <button className="secondary-button gap-2 text-sm"
                  onClick={() => payMutation.mutate({ orderId: order.id, provider: 'payme' })}
                  disabled={payMutation.isPending}>
                  <ExternalLink className="h-4 w-4" /> Payme (web)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bonus */}
      {activeTab === 'bonus' && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl">
                ⭐
              </div>
              <div>
                <p className="text-sm text-slate-500">Mavjud bonus ball</p>
                <p className="text-4xl font-black text-amber-500">{formatNumber(bonus.balance)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Har buyurtmadan 2% ball yig'iladi</p>
              </div>
            </div>

            {/* Bonus sarflash */}
            {bonus.balance >= 1000 && orders.length > 0 && (
              <div className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-4">
                <p className="font-bold text-sm">Bonus ball sarflash:</p>
                <select
                  className="soft-input w-full"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                >
                  <option value="">Buyurtma tanlang...</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>#{o.id?.slice(-6)} — {formatCurrency(o.total)}</option>
                  ))}
                </select>
                {selectedOrderId && (
                  <button
                    className="primary-button w-full !bg-gradient-to-r !from-amber-500 !to-amber-600"
                    onClick={() => bonusMutation.mutate({ orderId: selectedOrderId, amount: Math.min(bonus.balance, orders.find(o => o.id === selectedOrderId)?.total || 0) })}
                    disabled={bonusMutation.isPending}
                  >
                    ⭐ {formatNumber(Math.min(bonus.balance, orders.find(o => o.id === selectedOrderId)?.total || 0))} ball sarfla
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bonus tarixi */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10">
              <h4 className="font-black">Bonus tarixi</h4>
            </div>
            {bonus.history?.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Hali ball yig'ilmagan</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {bonus.history?.map((h, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm
                        ${h.type === 'EARNED' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                        {h.type === 'EARNED' ? '⬆️' : '⬇️'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{h.description}</p>
                        <p className="text-xs text-slate-400">{new Date(h.date).toLocaleDateString('uz')}</p>
                      </div>
                    </div>
                    <p className={`font-black ${h.type === 'EARNED' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {h.type === 'EARNED' ? '+' : ''}{formatNumber(h.amount)} ⭐
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Promo-kod */}
      {activeTab === 'promo' && (
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl">
              🏷️
            </div>
            <div>
              <h3 className="font-black">Promo-kod</h3>
              <p className="text-sm text-slate-500">Chegirma kodini kiriting va tejang</p>
            </div>
          </div>

          <div className="space-y-3">
            <select className="soft-input w-full" value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
              <option value="">Buyurtma tanlang...</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>#{o.id?.slice(-6)} — {formatCurrency(o.total)}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <input
                className="soft-input flex-1 uppercase font-mono tracking-widest"
                placeholder="PROMO2025"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                maxLength={20}
              />
              <button
                className="primary-button !bg-purple-600 hover:!bg-purple-700 px-6"
                onClick={() => promoMutation.mutate()}
                disabled={!promoCode || !selectedOrderId || promoMutation.isPending}
              >
                {promoMutation.isPending ? 'Tekshirilmoqda...' : 'Qo\'llash'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 text-sm text-purple-700 dark:text-purple-300">
            <p className="font-bold mb-1">💡 Qanday ishlaydi?</p>
            <ul className="space-y-1 text-xs list-disc list-inside text-purple-600 dark:text-purple-400">
              <li>Promo-kodni buyurtmangizga qo'llang</li>
              <li>Chegirma darhol buyurtma summasidan ayiriladi</li>
              <li>Har bir kod bir marta ishlatilishi mumkin</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
