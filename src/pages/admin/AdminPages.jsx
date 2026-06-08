import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useToastStore } from '../../store/toastStore.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'
import { httpClient } from '../../services/api/index.js'
import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

// Tasdiqlash modali
function ConfirmModal({ open, title, description, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
        <div className="flex gap-3 justify-end">
          <button className="secondary-button" onClick={onCancel} disabled={loading}>Bekor qilish</button>
          <button
            className="px-5 py-2.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "O'chirilmoqda..." : "Ha, o'chirish"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== FARM REQUESTS =====
export function AdminFarmRequests() {
  usePageTitle("Ferma so'rovlari")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['farm-requests'],
    queryFn: () => httpClient.get('/farms/requests'),
  })

  const approve = useMutation({
    mutationFn: (id) => httpClient.post(`/farms/${id}/approve`),
    onSuccess: () => { pushToast({ title: 'Ferma tasdiqlandi. Fermerga Telegram xabar yuborildi.', variant: 'success' }); queryClient.invalidateQueries(['farm-requests']) },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })
  const reject = useMutation({
    mutationFn: (id) => httpClient.post(`/farms/${id}/reject`, { reason: 'Admin tomonidan rad etildi' }),
    onSuccess: () => { pushToast({ title: 'Ferma rad etildi. Fermerga xabar yuborildi.', variant: 'error' }); queryClient.invalidateQueries(['farm-requests']) },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Ferma so'rovlari</h2><p className="mt-2 text-slate-500">PENDING fermalarni tasdiqlash yoki rad etish. Fermerga Telegram orqali xabar yuboriladi.</p></section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? <div className="glass-card p-12 text-center text-slate-500">Kutayotgan so'rov yo'q</div> : (
        <div className="space-y-3">
          {data.map((farm) => (
            <div key={farm.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-bold text-lg">{farm.farmName}</p>
                <p className="text-sm text-slate-500">{farm.region}, {farm.district} · {farm.owner_name}</p>
                <p className="text-sm text-slate-500">STIR: {farm.stir} · GPS: {farm.gpsLocation}</p>
              </div>
              <div className="flex gap-3">
                <button className="primary-button" onClick={() => approve.mutate(farm.id)} disabled={approve.isPending}>Tasdiqlash</button>
                <button className="secondary-button text-rose-500" onClick={() => reject.mutate(farm.id)} disabled={reject.isPending}>Rad etish</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== DRIVER REQUESTS =====
export function AdminDriverRequests() {
  usePageTitle("Haydovchi so'rovlari")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['driver-requests'],
    queryFn: () => httpClient.get('/drivers/requests'),
  })

  const approve = useMutation({
    mutationFn: (id) => httpClient.post(`/drivers/${id}/approve`),
    onSuccess: () => { pushToast({ title: 'Haydovchi tasdiqlandi. Unga Telegram xabar yuborildi.', variant: 'success' }); queryClient.invalidateQueries(['driver-requests']) },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })
  const reject = useMutation({
    mutationFn: (id) => httpClient.post(`/drivers/${id}/reject`, { reason: 'Admin tomonidan rad etildi' }),
    onSuccess: () => { pushToast({ title: 'Rad etildi. Haydovchiga xabar yuborildi.', variant: 'error' }); queryClient.invalidateQueries(['driver-requests']) },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Haydovchi so'rovlari</h2><p className="mt-2 text-slate-500">Tasdiqlanganda haydovchiga Telegram orqali xabar yuboriladi.</p></section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? <div className="glass-card p-12 text-center text-slate-500">Kutayotgan so'rov yo'q</div> : (
        <div className="space-y-3">
          {data.map((driver) => (
            <div key={driver.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-bold text-lg">{driver.firstName} {driver.lastName}</p>
                <p className="text-sm text-slate-500">{driver.phone} · {driver.carBrand} · {driver.plateNumber}</p>
                <p className="text-sm text-slate-500">Yuk sig'imi: {driver.capacity} kg</p>
              </div>
              <div className="flex gap-3">
                <button className="primary-button" onClick={() => approve.mutate(driver.id)} disabled={approve.isPending}>Tasdiqlash</button>
                <button className="secondary-button text-rose-500" onClick={() => reject.mutate(driver.id)} disabled={reject.isPending}>Rad etish</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== USERS =====
export function AdminUsers() {
  usePageTitle('Foydalanuvchilar')
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => httpClient.get('/users'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => httpClient.delete(`/users/${id}`),
    onSuccess: (res) => {
      pushToast({ title: res.message, variant: 'success' })
      setDeleteTarget(null)
      queryClient.invalidateQueries(['users'])
    },
    onError: (err) => { pushToast({ title: err.message, variant: 'error' }); setDeleteTarget(null) },
  })

  const ROLE_COLORS = {
    'super-admin': 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    'farm-owner': 'bg-green-100 text-green-700',
    driver: 'bg-amber-100 text-amber-700',
    customer: 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={!!deleteTarget}
        title="Foydalanuvchini o'chirish"
        description={`"${deleteTarget?.firstName} ${deleteTarget?.lastName}" (${deleteTarget?.phone}) ni o'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo'lmaydi.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Foydalanuvchilar</h2><p className="mt-2 text-slate-500">Jami: {data.length} ta</p></section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Ism</th><th className="p-4">Telefon</th><th className="p-4">Rol</th><th className="p-4">Status</th><th className="p-4">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-semibold">{u.firstName} {u.lastName}</td>
                  <td className="p-4 text-slate-500">{u.phone}</td>
                  <td className="p-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ROLE_COLORS[u.role] || 'bg-slate-100'}`}>{u.role}</span></td>
                  <td className="p-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{u.status}</span></td>
                  <td className="p-4">
                    {u.role !== 'super-admin' && (
                      <button
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        onClick={() => setDeleteTarget(u)}
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ===== AUDIT LOG =====
export function AdminAuditLog() {
  usePageTitle('Audit log')
  const { data = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => httpClient.get('/audit/logs'),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Audit log</h2></section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Amal</th><th className="p-4">Foydalanuvchi</th><th className="p-4">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.map((log) => (
                <tr key={log.id}>
                  <td className="p-4 font-mono text-xs font-bold text-ocean-600">{log.action}</td>
                  <td className="p-4 text-slate-500 text-xs">{log.user_id?.slice(-8)}</td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(log.created_at).toLocaleString('uz')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function AdminDashboard() { return <DashboardPage title="Admin Dashboard" subtitle="Ferma va haydovchi so'rovlari, foydalanuvchilar va audit monitoring." /> }
export function AdminOrders() { return <OrdersPage title="Admin buyurtmalar" /> }
export function AdminChatMonitoring() { return <ChatPage title="Chat monitoring" /> }
export function AdminSettings() { return <SettingsPage /> }
