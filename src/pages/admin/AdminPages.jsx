import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useToastStore } from '../../store/toastStore.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { GpsMonitoringPage } from '../shared/GpsMonitoringPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'
import { httpClient } from '../../services/api/index.js'
import { useState } from 'react'
import { Trash2, AlertTriangle, X, MapPin, Phone, Building2, Truck, FileText, Eye } from 'lucide-react'

// ===== CONFIRM MODAL =====
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

// ===== FARM DETAIL MODAL =====
function FarmDetailModal({ farm, open, onClose, onApprove, onReject, approving, rejecting }) {
  if (!open || !farm) return null

  // GPS ni parse qilib, iframe map ko'rsatish
  const gps = farm.gpsLocation || ''
  const [lat, lng] = gps.split(',').map(s => s.trim())
  const hasGps = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))
  const mapUrl = hasGps ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${parseFloat(lng)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lng}` : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black">🏡 Ferma batafsil</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Ferma nomi</p>
            <p className="font-semibold text-lg">{farm.farmName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Egasi</p>
            <p className="font-semibold">{farm.owner_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Telefon</p>
            <p className="font-mono">{farm.owner_phone || farm.phone || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Building2 className="h-3 w-3" /> STIR</p>
            <p className="font-mono">{farm.stir || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Viloyat</p>
            <p className="font-semibold">{farm.region}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Tuman</p>
            <p className="font-semibold">{farm.district}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> GPS lokatsiya</p>
            <p className="font-mono text-sm">{gps || '—'}</p>
          </div>
        </div>

        {/* Map */}
        {hasGps && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
            <iframe
              title="Farm location"
              src={mapUrl}
              className="w-full h-48"
              frameBorder="0"
              scrolling="no"
            />
          </div>
        )}

        {/* Farm image */}
        {farm.farmImage && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-slate-500">Ferma rasmi</p>
            <img
              src={farm.farmImage}
              alt="Ferma rasmi"
              className="w-full max-h-64 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
            />
          </div>
        )}

        {/* Sana */}
        <div className="text-xs text-slate-500">
          So'rov yuborilgan: {farm.created_at ? new Date(farm.created_at).toLocaleString('uz') : '—'}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
          <button
            className="primary-button flex-1"
            onClick={() => onApprove(farm.id)}
            disabled={approving}
          >
            {approving ? 'Tasdiqlanmoqda...' : '✅ Tasdiqlash'}
          </button>
          <button
            className="px-5 py-2.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 flex-1"
            onClick={() => onReject(farm.id)}
            disabled={rejecting}
          >
            {rejecting ? 'Rad etilmoqda...' : '❌ Rad etish'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== DRIVER DETAIL MODAL =====
function DriverDetailModal({ driver, open, onClose, onApprove, onReject, approving, rejecting }) {
  if (!open || !driver) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black">🚚 Haydovchi batafsil</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Ism familiya</p>
            <p className="font-semibold text-lg">{driver.firstName} {driver.lastName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Telefon</p>
            <p className="font-mono">{driver.phone}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Truck className="h-3 w-3" /> Mashina markasi</p>
            <p className="font-semibold">{driver.carBrand}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Mashina raqami</p>
            <p className="font-mono font-bold text-lg">{driver.plateNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Yuk sig'imi</p>
            <p className="font-semibold">{driver.capacity} kg</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-500">Status</p>
            <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700">{driver.status}</span>
          </div>
        </div>

        {/* License image */}
        {driver.licenseImage && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><FileText className="h-3 w-3" /> Haydovchilik guvohnomasi</p>
            <img
              src={driver.licenseImage}
              alt="Haydovchilik guvohnomasi"
              className="w-full max-h-64 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
            />
          </div>
        )}

        {/* Technical passport image */}
        {driver.technicalPassportImage && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><FileText className="h-3 w-3" /> Tex pasport</p>
            <img
              src={driver.technicalPassportImage}
              alt="Tex pasport"
              className="w-full max-h-64 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
            />
          </div>
        )}

        {/* Sana */}
        <div className="text-xs text-slate-500">
          So'rov yuborilgan: {driver.created_at ? new Date(driver.created_at).toLocaleString('uz') : '—'}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
          <button
            className="primary-button flex-1"
            onClick={() => onApprove(driver.id)}
            disabled={approving}
          >
            {approving ? 'Tasdiqlanmoqda...' : '✅ Tasdiqlash'}
          </button>
          <button
            className="px-5 py-2.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 flex-1"
            onClick={() => onReject(driver.id)}
            disabled={rejecting}
          >
            {rejecting ? 'Rad etilmoqda...' : '❌ Rad etish'}
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
  const [selectedFarm, setSelectedFarm] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['farm-requests'],
    queryFn: () => httpClient.get('/farms/requests'),
  })

  const approve = useMutation({
    mutationFn: (id) => httpClient.post(`/farms/${id}/approve`),
    onSuccess: () => {
      pushToast({ title: 'Ferma tasdiqlandi. Fermerga Telegram xabar yuborildi.', variant: 'success' })
      setSelectedFarm(null)
      queryClient.invalidateQueries(['farm-requests'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })
  const reject = useMutation({
    mutationFn: (id) => httpClient.post(`/farms/${id}/reject`, { reason: 'Admin tomonidan rad etildi' }),
    onSuccess: () => {
      pushToast({ title: 'Ferma rad etildi. Fermerga xabar yuborildi.', variant: 'error' })
      setSelectedFarm(null)
      queryClient.invalidateQueries(['farm-requests'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <div className="space-y-6">
      <FarmDetailModal
        farm={selectedFarm}
        open={!!selectedFarm}
        onClose={() => setSelectedFarm(null)}
        onApprove={(id) => approve.mutate(id)}
        onReject={(id) => reject.mutate(id)}
        approving={approve.isPending}
        rejecting={reject.isPending}
      />

      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Ferma so'rovlari</h2>
        <p className="mt-2 text-slate-500">PENDING fermalarni ko'rib chiqing. Tasdiqlash/rad etish natijasi Telegram orqali fermerga yuboriladi.</p>
      </section>

      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">Kutayotgan so'rov yo'q</div>
      ) : (
        <div className="space-y-3">
          {data.map((farm) => (
            <div key={farm.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-bold text-lg">{farm.farmName}</p>
                <p className="text-sm text-slate-500">{farm.region}, {farm.district} · {farm.owner_name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {farm.created_at ? new Date(farm.created_at).toLocaleString('uz') : ''}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="secondary-button flex items-center gap-2"
                  onClick={() => setSelectedFarm(farm)}
                >
                  <Eye className="h-4 w-4" />
                  Batafsil
                </button>
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
  const [selectedDriver, setSelectedDriver] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['driver-requests'],
    queryFn: () => httpClient.get('/drivers/requests'),
  })

  const approve = useMutation({
    mutationFn: (id) => httpClient.post(`/drivers/${id}/approve`),
    onSuccess: () => {
      pushToast({ title: 'Haydovchi tasdiqlandi. Unga Telegram xabar yuborildi.', variant: 'success' })
      setSelectedDriver(null)
      queryClient.invalidateQueries(['driver-requests'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })
  const reject = useMutation({
    mutationFn: (id) => httpClient.post(`/drivers/${id}/reject`, { reason: 'Admin tomonidan rad etildi' }),
    onSuccess: () => {
      pushToast({ title: 'Rad etildi. Haydovchiga xabar yuborildi.', variant: 'error' })
      setSelectedDriver(null)
      queryClient.invalidateQueries(['driver-requests'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <div className="space-y-6">
      <DriverDetailModal
        driver={selectedDriver}
        open={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        onApprove={(id) => approve.mutate(id)}
        onReject={(id) => reject.mutate(id)}
        approving={approve.isPending}
        rejecting={reject.isPending}
      />

      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Haydovchi so'rovlari</h2>
        <p className="mt-2 text-slate-500">Tasdiqlanganda haydovchiga Telegram orqali xabar yuboriladi.</p>
      </section>

      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">Kutayotgan so'rov yo'q</div>
      ) : (
        <div className="space-y-3">
          {data.map((driver) => (
            <div key={driver.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-bold text-lg">{driver.firstName} {driver.lastName}</p>
                <p className="text-sm text-slate-500">{driver.phone} · {driver.carBrand} · {driver.plateNumber}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {driver.created_at ? new Date(driver.created_at).toLocaleString('uz') : ''}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="secondary-button flex items-center gap-2"
                  onClick={() => setSelectedDriver(driver)}
                >
                  <Eye className="h-4 w-4" />
                  Batafsil
                </button>
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

export function AdminGpsMonitoring() { return <GpsMonitoringPage /> }

