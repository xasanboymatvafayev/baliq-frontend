import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { orderService, httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { OrderTimeline } from '../../components/orders/OrderTimeline.jsx'
import { useState } from 'react'

const STATUS_LABELS = {
  PENDING: 'Kutilmoqda', CONFIRMED: 'Tasdiqlandi', DRIVER_ASSIGNED: 'Haydovchi biriktirildi',
  LOADING: 'Yuklanmoqda', IN_TRANSIT: 'Yo\'lda', DELIVERED: 'Yetkazildi', CANCELLED: 'Bekor qilindi',
}
const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  DRIVER_ASSIGNED: 'bg-purple-100 text-purple-700', LOADING: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-cyan-100 text-cyan-700', DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

export function OrdersPage({ title = 'Buyurtmalar' }) {
  usePageTitle(title)
  const pushToast = useToastStore((state) => state.pushToast)
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [selected, setSelected] = useState(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.list(),
  })

  const { data: timeline = [] } = useQuery({
    queryKey: ['order-timeline', selected?.id],
    queryFn: () => orderService.timeline(selected.id),
    enabled: !!selected?.id,
  })

  // Admin uchun tasdiqlangan haydovchilar ro'yxati
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin'
  const { data: drivers = [] } = useQuery({
    queryKey: ['approved-drivers'],
    queryFn: () => httpClient.get('/drivers?status=APPROVED'),
    enabled: isAdmin && !!selected && selected.status === 'CONFIRMED',
  })

  const assignDriverMutation = useMutation({
    mutationFn: ({ orderId, driverId }) => orderService.assignDriver(orderId, { driver_id: driverId }),
    onSuccess: () => {
      pushToast({ title: 'Haydovchi biriktirildi ✅', variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      setSelected(null)
      setSelectedDriverId('')
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => orderService.updateStatus(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      pushToast({ title: 'Buyurtma bekor qilindi', variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      setSelected(null)
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const confirmMutation = useMutation({
    mutationFn: (id) => orderService.updateStatus(id, { status: 'CONFIRMED' }),
    onSuccess: () => {
      pushToast({ title: 'Buyurtma tasdiqlandi ✅', variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      setSelected(null)
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => orderService.updateStatus(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      pushToast({ title: 'Buyurtma rad etildi', variant: 'error' })
      queryClient.invalidateQueries(['orders'])
      setSelected(null)
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const driverStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, { status }),
    onSuccess: (_, variables) => {
      const labels = { LOADING: 'Yuklanmoqda 📦', IN_TRANSIT: "Yo'lda 🚚", DELIVERED: 'Yetkazildi ✅' }
      pushToast({ title: labels[variables.status] || 'Status yangilandi', variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      setSelected(null)
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || err.message, variant: 'error' }),
  })

  const renderActions = () => {
    if (!selected) return null
    const role = user?.role
    const status = selected.status

    // Farm owner actions
    if (role === 'farm-owner' && status === 'PENDING') {
      return (
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            className="primary-button"
            onClick={() => confirmMutation.mutate(selected.id)}
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? 'Tasdiqlanmoqda...' : '✅ Tasdiqlash'}
          </button>
          <button
            className="secondary-button text-rose-500"
            onClick={() => rejectMutation.mutate(selected.id)}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? 'Rad etilmoqda...' : '❌ Rad etish'}
          </button>
        </div>
      )
    }

    // Driver actions
    if (role === 'driver') {
      if (status === 'DRIVER_ASSIGNED') {
        return (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              className="primary-button w-full text-lg py-3"
              onClick={() => driverStatusMutation.mutate({ id: selected.id, status: 'LOADING' })}
              disabled={driverStatusMutation.isPending}
            >
              {driverStatusMutation.isPending ? 'Yuklanmoqda...' : '📦 Qabul qilish (Fermaga bordim)'}
            </button>
          </div>
        )
      }
      if (status === 'LOADING') {
        return (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              className="primary-button w-full text-lg py-3 !bg-cyan-600 hover:!bg-cyan-700"
              onClick={() => driverStatusMutation.mutate({ id: selected.id, status: 'IN_TRANSIT' })}
              disabled={driverStatusMutation.isPending}
            >
              {driverStatusMutation.isPending ? "O'zgartirilmoqda..." : "🚚 Yo'lga chiqdim"}
            </button>
          </div>
        )
      }
      if (status === 'IN_TRANSIT') {
        return (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              className="primary-button w-full text-lg py-3 !bg-green-600 hover:!bg-green-700"
              onClick={() => driverStatusMutation.mutate({ id: selected.id, status: 'DELIVERED' })}
              disabled={driverStatusMutation.isPending}
            >
              {driverStatusMutation.isPending ? "O'zgartirilmoqda..." : '✅ Yetkazildi'}
            </button>
          </div>
        )
      }
      return null
    }

    // Customer actions
    if (role === 'customer' && status === 'PENDING') {
      return (
        <div className="pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            className="secondary-button text-rose-500"
            onClick={() => cancelMutation.mutate(selected.id)}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
          </button>
        </div>
      )
    }

    // Admin/Super-admin: haydovchi biriktirish (CONFIRMED buyurtmalar uchun)
    if ((role === 'admin' || role === 'super-admin') && status === 'CONFIRMED') {
      return (
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="font-bold">🚚 Haydovchi biriktirish</h4>
          {drivers.length === 0 ? (
            <p className="text-sm text-slate-500">Tasdiqlangan haydovchi topilmadi</p>
          ) : (
            <div className="flex gap-3">
              <select
                className="soft-input flex-1"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">Haydovchini tanlang...</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.user_id || d.id}>
                    {d.firstName} {d.lastName} — {d.plateNumber} ({d.capacity} kg)
                  </option>
                ))}
              </select>
              <button
                className="primary-button"
                onClick={() => {
                  if (!selectedDriverId) { pushToast({ title: 'Haydovchini tanlang', variant: 'error' }); return }
                  assignDriverMutation.mutate({ orderId: selected.id, driverId: selectedDriverId })
                }}
                disabled={assignDriverMutation.isPending || !selectedDriverId}
              >
                {assignDriverMutation.isPending ? 'Biriktirilmoqda...' : 'Biriktirish'}
              </button>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">{title}</h2>
      </section>

      {selected ? (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Buyurtma #{selected.id?.slice(-6)}</h3>
            <button className="secondary-button" onClick={() => setSelected(null)}>← Orqaga</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div><span className="text-slate-500">Jami:</span> <b>{selected.total?.toLocaleString()} so'm</b></div>
            <div><span className="text-slate-500">Status:</span> <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[selected.status]}`}>{STATUS_LABELS[selected.status]}</span></div>
            <div><span className="text-slate-500">Sana:</span> {new Date(selected.created_at).toLocaleDateString('uz')}</div>
          </div>
          {selected.customer_name && (
            <div className="text-sm"><span className="text-slate-500">Mijoz:</span> <b>{selected.customer_name}</b></div>
          )}
          <OrderTimeline currentStatus={selected.status} />
          <div className="space-y-2">
            <h4 className="font-bold">Mahsulotlar:</h4>
            {selected.items?.map((item, i) => (
              <div key={i} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-2 dark:bg-white/5 text-sm">
                <span>{item.fish_name}</span>
                <span>{item.quantity} {item.unit || 'kg'} × {item.unit_price?.toLocaleString()} = <b>{item.subtotal?.toLocaleString()} so'm</b></span>
              </div>
            ))}
          </div>
          {renderActions()}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="glass-card h-16 animate-pulse" />)}</div>
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">Buyurtmalar hali yo'q</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-4">ID</th><th className="p-4">Jami</th><th className="p-4">Status</th><th className="p-4">Sana</th><th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-mono text-xs">#{order.id?.slice(-6)}</td>
                  <td className="p-4 font-bold">{order.total?.toLocaleString()} so'm</td>
                  <td className="p-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span></td>
                  <td className="p-4 text-slate-500">{new Date(order.created_at).toLocaleDateString('uz')}</td>
                  <td className="p-4"><button className="secondary-button text-xs" onClick={() => setSelected(order)}>Ko'rish</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
