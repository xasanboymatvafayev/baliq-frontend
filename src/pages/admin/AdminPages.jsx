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
// ── Dark-mode-safe badge classes ──────────────────────────────────────
const ROLE_COLORS = {
  'super-admin': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  admin:         'bg-red-100   text-red-700   dark:bg-red-500/20   dark:text-red-300',
  manager:       'bg-blue-100  text-blue-700  dark:bg-blue-500/20  dark:text-blue-300',
  'farm-owner':  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  driver:        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  customer:      'bg-slate-100 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300',
}

const STATUS_BADGE = {
  ACTIVE:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  INACTIVE: 'bg-rose-100   text-rose-700   dark:bg-rose-500/20   dark:text-rose-300',
  PENDING:  'bg-amber-100  text-amber-700  dark:bg-amber-500/20  dark:text-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  REJECTED: 'bg-rose-100   text-rose-700   dark:bg-rose-500/20   dark:text-rose-300',
}

// ── Skeleton helpers ──────────────────────────────────────────────────
function TableSkeleton({ cols = 4, rows = 5 }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-slate-200 dark:border-white/10 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse flex-1" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, col) => (
              <div
                key={col}
                className="h-4 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse flex-1"
                style={{ animationDelay: `${(row * cols + col) * 40}ms`, opacity: 1 - row * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CardListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 flex items-center justify-between gap-4 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded-lg bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-72 rounded-lg bg-slate-100 dark:bg-white/[0.06]" />
            <div className="h-3 w-32 rounded-lg bg-slate-100 dark:bg-white/[0.06]" />
          </div>
          <div className="h-9 w-24 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ── Confirm modal (dark-mode-safe) ────────────────────────────────────
function ConfirmModal({ open, title, description, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card max-w-md w-full p-6 space-y-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
        <div className="flex gap-3 justify-end pt-1">
          <button className="secondary-button" onClick={onCancel} disabled={loading}>Bekor qilish</button>
          <button className="danger-button" onClick={onConfirm} disabled={loading}>
            {loading ? "O'chirilmoqda..." : "Ha, o'chirish"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail Modal base ─────────────────────────────────────────────────
function DetailModal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="glass-card w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl p-6 space-y-5 sm:my-8 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

// ── Farm Detail Modal ─────────────────────────────────────────────────
function FarmDetailModal({ farm, open, onClose, onApprove, onReject, approving, rejecting }) {
  if (!farm) return null
  const gps = farm.gpsLocation || ''
  const [lat, lng] = gps.split(',').map(s => s.trim())
  const hasGps = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))
  const mapUrl = hasGps
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.01},${parseFloat(lat)-0.01},${parseFloat(lng)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lng}`
    : null

  return (
    <DetailModal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">🏡 Ferma batafsil</h3>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Ferma nomi', value: farm.farmName, big: true },
          { label: 'Egasi', value: farm.owner_name },
          { icon: Phone, label: 'Telefon', value: farm.owner_phone || farm.phone || '—', mono: true },
          { icon: Building2, label: 'STIR', value: farm.stir || '—', mono: true },
          { label: 'Viloyat', value: farm.region },
          { label: 'Tuman', value: farm.district },
        ].map(({ label, value, big, mono, icon: Icon }) => (
          <div key={label} className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
              {Icon && <Icon className="h-3 w-3" />} {label}
            </p>
            <p className={`${big ? 'text-lg' : ''} font-semibold ${mono ? 'font-mono' : ''}`}>{value}</p>
          </div>
        ))}
        <div className="space-y-1 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> GPS</p>
          <p className="font-mono text-sm text-slate-500">{gps || '—'}</p>
        </div>
      </div>
      {hasGps && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
          <iframe title="Farm location" src={mapUrl} className="w-full h-48" frameBorder="0" scrolling="no" />
        </div>
      )}
      {farm.farmImage && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-slate-400">Ferma rasmi</p>
          <img src={farm.farmImage} alt="Ferma" className="w-full max-h-56 object-cover rounded-2xl border border-slate-200 dark:border-white/10" />
        </div>
      )}
      <p className="text-xs text-slate-400">
        So'rov: {farm.created_at ? new Date(farm.created_at).toLocaleString('uz') : '—'}
      </p>
      <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
        <button className="primary-button flex-1" onClick={() => onApprove(farm.id)} disabled={approving}>
          {approving ? 'Tasdiqlanmoqda...' : '✅ Tasdiqlash'}
        </button>
        <button className="danger-button flex-1" onClick={() => onReject(farm.id)} disabled={rejecting}>
          {rejecting ? 'Rad etilmoqda...' : '❌ Rad etish'}
        </button>
      </div>
    </DetailModal>
  )
}

// ── Driver Detail Modal ───────────────────────────────────────────────
function DriverDetailModal({ driver, open, onClose, onApprove, onReject, approving, rejecting }) {
  if (!driver) return null
  return (
    <DetailModal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">🚚 Haydovchi batafsil</h3>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Ism familiya', value: `${driver.firstName} ${driver.lastName}`, big: true },
          { icon: Phone, label: 'Telefon', value: driver.phone, mono: true },
          { icon: Truck, label: 'Mashina markasi', value: driver.carBrand },
          { label: 'Mashina raqami', value: driver.plateNumber, mono: true, big: true },
          { label: 'Yuk sig\'imi', value: `${driver.capacity} kg` },
          { label: 'Status', badge: true, status: driver.status },
        ].map(({ label, value, big, mono, icon: Icon, badge, status }) => (
          <div key={label} className="space-y-1">
            <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
              {Icon && <Icon className="h-3 w-3" />} {label}
            </p>
            {badge
              ? <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_BADGE[status] || STATUS_BADGE.PENDING}`}>{status}</span>
              : <p className={`${big ? 'text-lg' : ''} font-semibold ${mono ? 'font-mono' : ''}`}>{value}</p>}
          </div>
        ))}
      </div>
      {[
        { src: driver.licenseImage, label: 'Haydovchilik guvohnomasi' },
        { src: driver.technicalPassportImage, label: 'Tex pasport' },
      ].filter(d => d.src).map(({ src, label }) => (
        <div key={label} className="space-y-2">
          <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1"><FileText className="h-3 w-3" /> {label}</p>
          <img src={src} alt={label} className="w-full max-h-56 object-cover rounded-2xl border border-slate-200 dark:border-white/10" />
        </div>
      ))}
      <p className="text-xs text-slate-400">
        So'rov: {driver.created_at ? new Date(driver.created_at).toLocaleString('uz') : '—'}
      </p>
      <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
        <button className="primary-button flex-1" onClick={() => onApprove(driver.id)} disabled={approving}>
          {approving ? 'Tasdiqlanmoqda...' : '✅ Tasdiqlash'}
        </button>
        <button className="danger-button flex-1" onClick={() => onReject(driver.id)} disabled={rejecting}>
          {rejecting ? 'Rad etilmoqda...' : '❌ Rad etish'}
        </button>
      </div>
    </DetailModal>
  )
}

// ── Farm Requests ─────────────────────────────────────────────────────
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
        <p className="mt-2 text-slate-500 text-sm">PENDING fermalarni ko'rib chiqing. Natija Telegram orqali fermerga yuboriladi.</p>
      </section>
      {isLoading ? <CardListSkeleton count={3} /> : data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🏡</div>
          <p className="text-slate-500 font-medium">Kutayotgan ferma so'rovi yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((farm) => (
            <div key={farm.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-5 hover:shadow-md transition-shadow">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-lg">{farm.farmName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_BADGE.PENDING}`}>Kutilmoqda</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{farm.region}, {farm.district} · {farm.owner_name}</p>
                <p className="text-xs text-slate-400 mt-1">{farm.created_at ? new Date(farm.created_at).toLocaleString('uz') : ''}</p>
              </div>
              <button className="secondary-button flex items-center gap-2 shrink-0" onClick={() => setSelectedFarm(farm)}>
                <Eye className="h-4 w-4" /> Batafsil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Driver Requests ───────────────────────────────────────────────────
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
      pushToast({ title: 'Haydovchi tasdiqlandi. Telegram xabar yuborildi.', variant: 'success' })
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
        <p className="mt-2 text-slate-500 text-sm">Tasdiqlanganda haydovchiga Telegram orqali xabar yuboriladi.</p>
      </section>
      {isLoading ? <CardListSkeleton count={3} /> : data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🚚</div>
          <p className="text-slate-500 font-medium">Kutayotgan haydovchi so'rovi yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((driver) => (
            <div key={driver.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-5 hover:shadow-md transition-shadow">
              <div className="min-w-0">
                <p className="font-bold text-lg">{driver.firstName} {driver.lastName}</p>
                <p className="text-sm text-slate-500 mt-0.5">{driver.phone} · {driver.carBrand} · <span className="font-mono">{driver.plateNumber}</span></p>
                <p className="text-xs text-slate-400 mt-1">{driver.created_at ? new Date(driver.created_at).toLocaleString('uz') : ''}</p>
              </div>
              <button className="secondary-button flex items-center gap-2 shrink-0" onClick={() => setSelectedDriver(driver)}>
                <Eye className="h-4 w-4" /> Batafsil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Users ─────────────────────────────────────────────────────────────
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
      <section className="glass-card p-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-3xl font-black">Foydalanuvchilar</h2>
          <p className="mt-1 text-slate-500 text-sm">Jami: {data.length} ta</p>
        </div>
      </section>

      {isLoading ? (
        <TableSkeleton cols={5} rows={6} />
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Mobile: scrollable */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="p-4">Ism</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-semibold whitespace-nowrap">{u.firstName} {u.lastName}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs whitespace-nowrap">{u.phone}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${ROLE_COLORS[u.role] || ROLE_COLORS.customer}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_BADGE[u.status] || STATUS_BADGE.PENDING}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.role !== 'super-admin' && (
                        <button
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
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
        </div>
      )}
    </div>
  )
}

// ── Audit Log ─────────────────────────────────────────────────────────
export function AdminAuditLog() {
  usePageTitle('Audit log')
  const { data = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => httpClient.get('/audit/logs'),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Audit log</h2>
        <p className="mt-1 text-slate-500 text-sm">Tizimda bajarilgan barcha amallar tarixi</p>
      </section>

      {isLoading ? (
        <TableSkeleton cols={3} rows={8} />
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500 font-medium">Audit yozuvlari yo'q</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="p-4">Amal</th>
                  <th className="p-4">Foydalanuvchi</th>
                  <th className="p-4">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-ocean-600 dark:text-ocean-400 whitespace-nowrap">{log.action}</td>
                    <td className="p-4 text-slate-500 text-xs font-mono whitespace-nowrap">{log.user_id?.slice(-8)}</td>
                    <td className="p-4 text-slate-500 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString('uz')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminDashboard() {
  return <DashboardPage title="Admin Dashboard" subtitle="Ferma va haydovchi so'rovlari, foydalanuvchilar va audit monitoring." />
}
export function AdminOrders() { return <OrdersPage title="Admin buyurtmalar" /> }
export function AdminChatMonitoring() { return <ChatPage title="Chat monitoring" /> }
export function AdminSettings() { return <SettingsPage /> }
export function AdminGpsMonitoring() { return <GpsMonitoringPage /> }
