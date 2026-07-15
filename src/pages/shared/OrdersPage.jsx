import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { orderService, httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { OrderTimeline } from '../../components/orders/OrderTimeline.jsx'
import { Pagination } from '../../components/common/Pagination.jsx'
import { ReviewModal } from '../../components/common/ReviewModal.jsx'
import { formatCurrency } from '../../utils/formatters.js'
import { useState } from 'react'
import { Filter, CheckSquare, Square, Users, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { useT } from '../../store/i18nStore.js'

function useStatusLabels() {
  const t = useT()
  return {
    PENDING: t.statusPending,
    CONFIRMED: t.statusConfirmed,
    AWAITING_PAYMENT: t.paymentBonus,
    DRIVER_ASSIGNED: t.liveTracking,
    LOADING: t.loading,
    IN_TRANSIT: t.statusInTransit,
    DELIVERED: t.statusDelivered,
    CANCELLED: t.statusCancelled,
  }
}

const STATUS_COLORS = {
  AWAITING_PAYMENT: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200 border border-slate-200 dark:border-slate-600',
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
  DRIVER_ASSIGNED: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30',
  LOADING: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30',
  IN_TRANSIT: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
}

const STATUS_DOTS = {
  AWAITING_PAYMENT: 'bg-slate-400',
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-blue-500',
  DRIVER_ASSIGNED: 'bg-purple-500',
  LOADING: 'bg-orange-500',
  IN_TRANSIT: 'bg-cyan-500 animate-pulse',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[status] || STATUS_COLORS.PENDING}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOTS[status] || 'bg-slate-400'}`} />
      {useStatusLabels()[status] || status}
    </span>
  )
}

const PAGE_SIZE = 10

export function OrdersPage({ title = t.ordersTitle }) {
  const t = useT()
  usePageTitle(title)
  const pushToast = useToastStore((state) => state.pushToast)
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [selected, setSelected] = useState(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [taxPercent, setTaxPercent] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [checkedIds, setCheckedIds] = useState([])
  const [showBatchPanel, setShowBatchPanel] = useState(false)
  const [reviewOrder, setReviewOrder] = useState(null)

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'manager'

  const { data: ordersRaw, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, page],
    queryFn: () => orderService.list({
      ...(statusFilter ? { status: statusFilter } : {}),
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
  })
  const ordersData = ordersRaw?.data || ordersRaw || []
  const ordersTotal = ordersRaw?.total || 0

  const { data: timeline = [] } = useQuery({
    queryKey: ['order-timeline', selected?.id],
    queryFn: () => orderService.timeline(selected.id),
    enabled: !!selected?.id,
  })

  const { data: drivers = [] } = useQuery({
    queryKey: ['approved-drivers'],
    queryFn: async () => {
      const res = await httpClient.get('/drivers?status=APPROVED')
      return res?.data || res || []
    },
    enabled: isAdmin,
  })

  const assignDriverMutation = useMutation({
    mutationFn: ({ orderId, driverId, taxPercent }) =>
      httpClient.post('/finance/admin/assign-with-tax', { order_id: orderId, driver_id: driverId, tax_percent: parseInt(taxPercent) }),
    onSuccess: (data) => {
      pushToast({ title: `Biriktirildi! Soliq: ${data.tax_amount?.toLocaleString()} so'm`, variant: 'success' })
      queryClient.invalidateQueries(['orders']); setSelected(null); setSelectedDriverId(''); setTaxPercent('')
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const batchAssignMutation = useMutation({
    mutationFn: ({ orderIds, driverId }) => orderService.batchAssignDriver({ order_ids: orderIds, driver_id: driverId }),
    onSuccess: () => {
      pushToast({ title: `${checkedIds.length} ta buyurtma driverga yuborildi ✅`, variant: 'success' })
      queryClient.invalidateQueries(['orders']); setCheckedIds([]); setShowBatchPanel(false); setSelectedDriverId('')
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const resendInvoiceMutation = useMutation({
    mutationFn: ({ orderId, provider }) => httpClient.post('/payments/create-link', { order_id: orderId, provider }),
    onSuccess: (data) => { if (data?.url) window.open(data.url, '_blank'); pushToast({ title: "To'lov sahifasi ochildi ✅", variant: 'success' }) },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => orderService.updateStatus(id, { status: 'CANCELLED' }),
    onSuccess: () => { pushToast({ title: 'Buyurtma bekor qilindi', variant: 'success' }); queryClient.invalidateQueries(['orders']); setSelected(null) },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const confirmMutation = useMutation({
    mutationFn: (id) => orderService.updateStatus(id, { status: 'CONFIRMED' }),
    onSuccess: () => { pushToast({ title: 'Buyurtma tasdiqlandi ✅', variant: 'success' }); queryClient.invalidateQueries(['orders']); setSelected(null) },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => orderService.updateStatus(id, { status: 'CANCELLED' }),
    onSuccess: () => { pushToast({ title: 'Buyurtma rad etildi', variant: 'error' }); queryClient.invalidateQueries(['orders']); setSelected(null) },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const driverStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, { status }),
    onSuccess: (_, { status }) => {
      const labels = { LOADING: 'Yuklanmoqda 📦', IN_TRANSIT: "Yo'lda 🚚", DELIVERED: 'Yetkazildi ✅' }
      pushToast({ title: labels[status] || 'Status yangilandi', variant: 'success' })
      queryClient.invalidateQueries(['orders']); setSelected(null)
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const toggleCheck = (id, status) => {
    if (status !== 'CONFIRMED') { pushToast({ title: 'Faqat "Tasdiqlandi" statusidagi buyurtmalarni tanlang', variant: 'error' }); return }
    setCheckedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const renderActions = () => {
    if (!selected) return null
    const role = user?.role
    const status = selected.status

    if (role === 'farm-owner' && status === 'PENDING') return (
      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
        <button className="primary-button" onClick={() => confirmMutation.mutate(selected.id)} disabled={confirmMutation.isPending}>
          {confirmMutation.isPending ? 'Tasdiqlanmoqda...' : '✅ Tasdiqlash'}
        </button>
        <button className="danger-button" onClick={() => rejectMutation.mutate(selected.id)} disabled={rejectMutation.isPending}>
          {rejectMutation.isPending ? 'Rad etilmoqda...' : '❌ Rad etish'}
        </button>
      </div>
    )

    if (role === 'driver') {
      const driverBtns = {
        DRIVER_ASSIGNED: { label: '📦 Qabul qilish (Fermaga bordim)', next: 'LOADING', cls: '' },
        LOADING: { label: "🚚 Yo'lga chiqdim", next: 'IN_TRANSIT', cls: '!bg-cyan-600 hover:!bg-cyan-700' },
        IN_TRANSIT: { label: '✅ Yetkazildi', next: 'DELIVERED', cls: '!bg-emerald-600 hover:!bg-emerald-700' },
      }
      const btn = driverBtns[status]
      if (!btn) return null
      return (
        <div className="pt-4 border-t border-slate-200 dark:border-white/10">
          <button className={`primary-button w-full text-base py-3 ${btn.cls}`} onClick={() => driverStatusMutation.mutate({ id: selected.id, status: btn.next })} disabled={driverStatusMutation.isPending}>
            {driverStatusMutation.isPending ? "O'zgartirilmoqda..." : btn.label}
          </button>
        </div>
      )
    }

    if (role === 'customer' && status === 'AWAITING_PAYMENT') return (
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3 text-sm text-amber-700 dark:text-amber-300">
          💳 Click yoki Payme orqali to'lovni amalga oshiring. To'lov tasdiqlangach buyurtma fermerga yuboriladi.
        </div>
        <button className="primary-button w-full" onClick={() => resendInvoiceMutation.mutate({ orderId: selected.id, provider: selected.payment_method || 'click' })} disabled={resendInvoiceMutation.isPending}>
          {resendInvoiceMutation.isPending ? 'Ochilmoqda...' : "💳 To'lov sahifasini ochish"}
        </button>
        <button className="danger-button w-full" onClick={() => cancelMutation.mutate(selected.id)} disabled={cancelMutation.isPending}>
          {cancelMutation.isPending ? 'Bekor qilinmoqda...' : 'Buyurtmani bekor qilish'}
        </button>
      </div>
    )

    if (role === 'customer' && status === 'PENDING') return (
      <div className="pt-4 border-t border-slate-200 dark:border-white/10">
        <button className="danger-button" onClick={() => cancelMutation.mutate(selected.id)} disabled={cancelMutation.isPending}>
          {cancelMutation.isPending ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
        </button>
      </div>
    )

    if (role === 'customer' && status === 'IN_TRANSIT') return (
      <div className="pt-4 border-t border-slate-200 dark:border-white/10">
        <button className="primary-button w-full text-base py-3 !bg-emerald-600 hover:!bg-emerald-700" onClick={() => driverStatusMutation.mutate({ id: selected.id, status: 'DELIVERED' })} disabled={driverStatusMutation.isPending}>
          {driverStatusMutation.isPending ? 'Saqlanmoqda...' : '✅ Buyurtmani qabul qildim'}
        </button>
      </div>
    )

    if (role === 'customer' && status === 'DELIVERED') return (
      <div className="pt-4 border-t border-slate-200 dark:border-white/10">
        <button
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 font-bold py-3 transition hover:bg-amber-100 dark:hover:bg-amber-900/30"
          onClick={() => setReviewOrder(selected)}
        >
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          Baho berish
        </button>
      </div>
    )

    if (isAdmin && status === 'CONFIRMED') return (
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
        <h4 className="font-bold">🚚 Haydovchi biriktirish</h4>
        {drivers.length === 0 ? (
          <p className="text-sm text-slate-500">Tasdiqlangan haydovchi topilmadi</p>
        ) : (
          <div className="space-y-3">
            <select className="soft-input w-full" value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
              <option value="">Haydovchini tanlang...</option>
              {drivers.map((d) => <option key={d.id} value={d.user_id || d.id}>{d.firstName} {d.lastName} — {d.plateNumber} ({d.capacity} kg)</option>)}
            </select>
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Soliq foizi *</label>
              <div className="relative mt-1">
                <input type="number" min={0} max={100} className="soft-input w-full pr-10" placeholder="Masalan: 10" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">%</span>
              </div>
              {taxPercent && selected.total > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Soliq: <b className="text-rose-500">{Math.round(selected.total * taxPercent / 100).toLocaleString()} so'm</b>
                  {' '}· Fermerga: <b className="text-emerald-600">{Math.round(selected.total - selected.total * taxPercent / 100).toLocaleString()} so'm</b>
                </p>
              )}
            </div>
            <button
              className="primary-button w-full"
              onClick={() => {
                if (!selectedDriverId) { pushToast({ title: 'Haydovchini tanlang', variant: 'error' }); return }
                if (taxPercent === '' || taxPercent < 0 || taxPercent > 100) { pushToast({ title: "Soliq foizini 0-100 oralig'ida kiriting", variant: 'error' }); return }
                assignDriverMutation.mutate({ orderId: selected.id, driverId: selectedDriverId, taxPercent })
              }}
              disabled={assignDriverMutation.isPending || !selectedDriverId || taxPercent === ''}
            >
              {assignDriverMutation.isPending ? 'Biriktirilmoqda...' : 'Biriktirish'}
            </button>
          </div>
        )}
      </div>
    )
    return null
  }

  const confirmedOrders = ordersData.filter((o) => o.status === 'CONFIRMED')

  return (
    <div className="space-y-6">
      {reviewOrder && (
        <ReviewModal
          open={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          orderId={reviewOrder.id}
          farmId={reviewOrder.farm_id}
          driverId={reviewOrder.driver_id}
          orderNum={reviewOrder.id?.slice(-6)}
        />
      )}
      <section className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-black">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && confirmedOrders.length > 0 && (
            <button
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition border ${showBatchPanel ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
              onClick={() => { setShowBatchPanel((v) => !v); setCheckedIds([]) }}
            >
              <Users className="h-4 w-4" /> Ko'p buyurtma → Driver
              {showBatchPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select className="soft-input text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Barcha statuslar</option>
              {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
      </section>

      {showBatchPanel && isAdmin && (
        <div className="glass-card p-5 border-2 border-purple-300 dark:border-purple-700 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h3 className="font-black text-purple-700 dark:text-purple-300">Ko'p buyurtmani birlashtirib driverga yuborish</h3>
          </div>
          <p className="text-sm text-slate-500">"Tasdiqlandi" statusidagi buyurtmalarni belgilang va bitta driverga yuboring.</p>
          {checkedIds.length > 0 && (
            <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 text-sm font-semibold text-purple-700 dark:text-purple-300">
              ✅ {checkedIds.length} ta buyurtma tanlandi
            </div>
          )}
          {checkedIds.length >= 2 && (
            <div className="flex gap-3">
              <select className="soft-input flex-1" value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
                <option value="">Haydovchini tanlang...</option>
                {drivers.map((d) => <option key={d.id} value={d.user_id || d.id}>{d.firstName} {d.lastName} — {d.plateNumber} ({d.capacity} kg)</option>)}
              </select>
              <button className="primary-button !bg-purple-600 hover:!bg-purple-700" onClick={() => { if (!selectedDriverId) { pushToast({ title: 'Haydovchini tanlang', variant: 'error' }); return } batchAssignMutation.mutate({ orderIds: checkedIds, driverId: selectedDriverId }) }} disabled={batchAssignMutation.isPending}>
                {batchAssignMutation.isPending ? 'Yuborilmoqda...' : `${checkedIds.length} ta → Driver`}
              </button>
            </div>
          )}
        </div>
      )}

      {selected ? (
        <div className="glass-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Buyurtma #{selected.id?.slice(-6)}</h3>
            <button className="secondary-button" onClick={() => setSelected(null)}>← Orqaga</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3">
              <p className="text-xs text-slate-500 mb-1">Jami summa</p>
              <p className="font-black text-lg">{formatCurrency(selected.total)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <StatusBadge status={selected.status} />
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3">
              <p className="text-xs text-slate-500 mb-1">Sana</p>
              <p className="font-bold">{new Date(selected.created_at).toLocaleDateString('uz')}</p>
            </div>
          </div>
          {selected.customer_name && <div className="text-sm"><span className="text-slate-500">Mijoz:</span> <b>{selected.customer_name}</b></div>}
          {selected.delivery_address && <div className="text-sm"><span className="text-slate-500">Manzil:</span> <b>{selected.delivery_address}</b></div>}
          {selected.delivery_coords && <div className="text-sm font-mono text-xs text-slate-400">📍 {selected.delivery_coords}</div>}
          <OrderTimeline currentStatus={selected.status} />
          <div className="space-y-2">
            <h4 className="font-bold">Mahsulotlar:</h4>
            {selected.items?.map((item, i) => (
              <div key={i} className="flex justify-between rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm">
                <span className="font-medium">{item.fish_name}</span>
                <span className="text-slate-500">{item.quantity} {item.unit || 'kg'} × {formatCurrency(item.unit_price)} = <b className="text-slate-800 dark:text-white">{formatCurrency(item.subtotal)}</b></span>
              </div>
            ))}
          </div>
          {renderActions()}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-16 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      ) : ordersData.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-slate-500 font-medium">
            {statusFilter ? `"${useStatusLabels()[statusFilter]}" statusida buyurtma yo'q` : "Buyurtmalar hali yo'q"}
          </p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                  <tr className="text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                    {showBatchPanel && isAdmin && <th className="p-4 w-10"></th>}
                    <th className="p-4">ID</th>
                    <th className="p-4">{t.total}</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 hidden sm:table-cell">Sana</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {ordersData.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                      {showBatchPanel && isAdmin && (
                        <td className="p-4">
                          <button onClick={() => toggleCheck(order.id, order.status)} className={`transition ${order.status !== 'CONFIRMED' ? 'opacity-30 cursor-not-allowed' : 'text-purple-600'}`}>
                            {checkedIds.includes(order.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                          </button>
                        </td>
                      )}
                      <td className="p-4 font-mono text-xs text-slate-500">#{order.id?.slice(-6)}</td>
                      <td className="p-4 font-bold">{formatCurrency(order.total)}</td>
                      <td className="p-4"><StatusBadge status={order.status} /></td>
                      <td className="p-4 text-slate-500 hidden sm:table-cell text-xs">{new Date(order.created_at).toLocaleDateString('uz')}</td>
                      <td className="p-4 flex items-center gap-2">
                        <button className="secondary-button text-xs px-3 py-1.5" onClick={() => setSelected(order)}>Ko'rish →</button>
                        {user?.role === 'customer' && order.status === 'DELIVERED' && (
                          <button
                            className="flex items-center gap-1 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 text-xs font-bold px-2.5 py-1.5 hover:bg-amber-100 transition"
                            onClick={() => setReviewOrder(order)}
                          >
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            Baho
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={page} hasMore={page * PAGE_SIZE < ordersTotal} onPageChange={setPage} totalPages={ordersTotal ? Math.ceil(ordersTotal / PAGE_SIZE) : undefined} />
        </>
      )}
    </div>
  )
}
