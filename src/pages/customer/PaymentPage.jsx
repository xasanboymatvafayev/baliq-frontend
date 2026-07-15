import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency, formatNumber } from '../../utils/formatters.js'
import {
  CreditCard, Gift, Tag, Star, ExternalLink, CheckCircle2,
  Send, TrendingUp, Wallet, Sparkles, ChevronRight, Info,
  ArrowUpRight, ArrowDownLeft, Clock,
} from 'lucide-react'
import { useT } from '../../store/i18nStore.js'

function EmptyPayment({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 mb-4">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="font-bold text-slate-600 dark:text-slate-400">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
    </div>
  )
}

export function PaymentPage() {
  const t = useT()
  usePageTitle("To'lov va bonuslar")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [promoCode, setPromoCode] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [activeTab, setActiveTab] = useState('payment')

  const { data: bonusRaw } = useQuery({
    queryKey: ['bonus-balance'],
    queryFn: () => httpClient.get('/payments/bonus/balance'),
  })
  const bonus = bonusRaw || { balance: 0, history: [] }

  const { data: ordersRaw } = useQuery({
    queryKey: ['pending-orders-pay'],
    queryFn: () => httpClient.get('/orders?status=PENDING&limit=10'),
  })
  const orders = Array.isArray(ordersRaw) ? ordersRaw : (ordersRaw?.data || [])

  const payMutation = useMutation({
    mutationFn: async ({ orderId, provider }) => {
      // To'g'ridan-to'g'ri Telegram invoice yuborish
      await telegramPayMutation.mutateAsync({ orderId, provider })
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const promoMutation = useMutation({
    mutationFn: () => httpClient.post('/payments/promo/apply', { code: promoCode, order_id: selectedOrderId }),
    onSuccess: (data) => {
      pushToast({ title: data.message, variant: 'success' })
      setPromoCode('')
      queryClient.invalidateQueries(['pending-orders-pay'])
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Promo-kod xato', variant: 'error' }),
  })

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
    { id: 'bonus', label: 'Bonuslar', icon: Star },
    { id: 'promo', label: 'Promo-kod', icon: Tag },
  ]

  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  return (
    <div className="space-y-6 pb-8">
      {/* Hero header */}
      <div className="glass-card overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-600/10 via-transparent to-amber-500/5 pointer-events-none" />
        <div className="p-6 flex flex-wrap items-center gap-5 relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-ocean-500 to-ocean-700 text-white shadow-glow-sm flex-shrink-0">
            <Wallet className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-black">To'lov & Bonuslar</h2>
            <p className="mt-1 text-slate-500 text-sm">Click, Payme orqali to'lang — har buyurtmadan 2% bonus ball!</p>
          </div>
          {/* Bonus bal card */}
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-yellow-50 px-5 py-3 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-yellow-900/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Bonus</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatNumber(bonus.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/60">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200
              ${activeTab === id
                ? 'bg-white text-ocean-600 shadow-sm dark:bg-slate-700 dark:text-ocean-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── To'lov ── */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="glass-card">
              <EmptyPayment icon={CheckCircle2} title="To'lov kutayotgan buyurtma yo'q" desc="Yangi buyurtma berganingizda shu yerda ko'rinadi" />
            </div>
          ) : orders.map((order) => (
            <div key={order.id} className="glass-card overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-white/5">
                <div>
                  <p className="font-black text-lg">Buyurtma #{order.id?.slice(-6)}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t.total}</p>
                  <p className="text-2xl font-black text-ocean-600">{formatCurrency(order.total)}</p>
                </div>
              </div>

              {/* Payment buttons */}
              <div className="p-5 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">To'lov usulini tanlang</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Click */}
                  <button
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[#00AAFF]/30 bg-[#00AAFF]/5 p-4 font-bold text-[#00AAFF] transition hover:border-[#00AAFF]/60 hover:bg-[#00AAFF]/10 active:scale-95 dark:border-[#00AAFF]/20 dark:bg-[#00AAFF]/10"
                    onClick={() => payMutation.mutate({ orderId: order.id, provider: 'click' })}
                    disabled={payMutation.isPending}
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span className="text-sm">Click Invoice</span>
                  </button>
                  {/* Payme */}
                  <button
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-4 font-bold text-blue-600 transition hover:border-blue-500/60 hover:bg-blue-500/10 active:scale-95 dark:border-blue-400/20 dark:text-blue-400"
                    onClick={() => payMutation.mutate({ orderId: order.id, provider: 'payme' })}
                    disabled={payMutation.isPending}
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span className="text-sm">Payme Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bonuslar ── */}
      {activeTab === 'bonus' && (
        <div className="space-y-4">
          {/* Bal card */}
          <div className="glass-card overflow-hidden">
            <div className="relative bg-gradient-to-br from-amber-500 to-amber-700 p-6 text-white">
              <div className="absolute right-4 top-4 opacity-20">
                <Star className="h-24 w-24" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-amber-100">Bonus hisobingiz</p>
              <p className="mt-2 text-5xl font-black">{formatNumber(bonus.balance)}</p>
              <p className="mt-1 text-sm text-amber-200">ball mavjud</p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 w-fit">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-bold">Har buyurtmadan 2% yig'iladi</span>
              </div>
            </div>

            {/* Bonus sarflash */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <p className="font-black">Bonus sarflash</p>
              </div>

              {bonus.balance < 1000 ? (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <b>{1000 - bonus.balance}</b> ball to'plangandan keyin sarflash mumkin.
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-amber-200 dark:bg-amber-800">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${Math.min(100, (bonus.balance / 1000) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-amber-600">{bonus.balance} / 1000</p>
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-slate-500">To'lov kutayotgan buyurtma yo'q</p>
              ) : (
                <div className="space-y-3">
                  <select className="soft-input w-full" value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)}>
                    <option value="">Buyurtma tanlang...</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>#{o.id?.slice(-6)} — {formatCurrency(o.total)}</option>
                    ))}
                  </select>
                  {selectedOrder && (
                    <button
                      onClick={() => bonusMutation.mutate({
                        orderId: selectedOrderId,
                        amount: Math.min(bonus.balance, selectedOrder.total || 0),
                      })}
                      disabled={bonusMutation.isPending}
                      className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 font-bold text-white transition hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      {formatNumber(Math.min(bonus.balance, selectedOrder.total || 0))} ball sarfla
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tarix */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-slate-100 dark:border-white/5 px-5 py-4">
              <h4 className="font-black">Bonus tarixi</h4>
            </div>
            {!bonus.history?.length ? (
              <EmptyPayment icon={Star} title="Hali ball yig'ilmagan" desc="Birinchi buyurtmadan keyin ball ko'rinadi" />
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                {bonus.history.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl ${
                      h.type === 'EARNED' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
                    }`}>
                      {h.type === 'EARNED'
                        ? <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        : <ArrowDownLeft className="h-4 w-4 text-rose-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{h.description}</p>
                      <p className="text-xs text-slate-400">{new Date(h.date).toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <p className={`font-black text-sm flex-shrink-0 ${
                      h.type === 'EARNED' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {h.type === 'EARNED' ? '+' : ''}{formatNumber(h.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Promo-kod ── */}
      {activeTab === 'promo' && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/25">
                <Tag className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-black">Promo-kod</h3>
                <p className="text-sm text-slate-500">Chegirma kodini kiriting va tejang</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-bold">Buyurtma tanlang</label>
                <select
                  className="soft-input w-full"
                  value={selectedOrderId}
                  onChange={e => setSelectedOrderId(e.target.value)}
                >
                  <option value="">Buyurtma tanlang...</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>#{o.id?.slice(-6)} — {formatCurrency(o.total)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Promo kod</label>
                <div className="flex gap-2">
                  <input
                    className="soft-input flex-1 font-mono uppercase tracking-widest text-lg"
                    placeholder="MASALAN: SUMMER25"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                  <button
                    className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 px-5 font-bold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-600 hover:to-purple-800 active:scale-95 disabled:opacity-50"
                    onClick={() => promoMutation.mutate()}
                    disabled={!promoCode || !selectedOrderId || promoMutation.isPending}
                  >
                    {promoMutation.isPending ? '...' : "Qo'llash"}
                  </button>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200/60 dark:border-purple-800/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Qanday ishlaydi?</p>
              </div>
              <div className="space-y-1.5">
                {[
                  'Promo-kodni buyurtmangizga qo\'llang',
                  'Chegirma darhol buyurtma summasidan ayiriladi',
                  'Har bir kod bir marta ishlatilishi mumkin',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-600 dark:text-purple-400">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
