import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { useState } from 'react'
import { Trash2, UserPlus, AlertTriangle } from 'lucide-react'

// Tasdiqlash modali
function ConfirmModal({ open, title, description, danger, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${danger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
        <div className="flex gap-3 justify-end">
          <button className="secondary-button" onClick={onCancel}>Bekor qilish</button>
          <button
            className={`px-5 py-2.5 rounded-2xl font-bold text-white ${danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'}`}
            onClick={onConfirm}
          >
            Ha, davom etish
          </button>
        </div>
      </div>
    </div>
  )
}

export function SystemStatistics() {
  const t = useT()
  usePageTitle('Tizim statistikasi')
  const { data } = useQuery({ queryKey: ['system-stats'], queryFn: () => httpClient.get('/analytics/system') })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Tizim statistikasi</h2></section>
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Foydalanuvchilar", value: data.totalUsers },
            { label: "Fermalar (jami)", value: data.totalFarms },
            { label: "Tasdiqlangan fermalar", value: data.approvedFarms },
            { label: "Kutayotgan fermalar", value: data.pendingFarms },
            { label: "Haydovchilar", value: data.totalDrivers },
            { label: "Tasdiqlangan haydovchilar", value: data.approvedDrivers },
            { label: "Baliq turlari", value: data.totalFish },
            { label: "Buyurtmalar", value: data.totalOrders },
          ].map((item) => (
            <div key={item.label} className="glass-card p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 text-3xl font-black text-ocean-600">{item.value ?? '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminManagement() {
  const t = useT()
  usePageTitle('Hodimlar boshqaruvi')
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', password: '', role: 'admin' })

  const { data: admins = [] } = useQuery({
    queryKey: ['staff-users'],
    queryFn: () => httpClient.get('/users?role=admin'),
  })
  const { data: managers = [] } = useQuery({
    queryKey: ['manager-users'],
    queryFn: () => httpClient.get('/users?role=manager'),
  })
  const allStaff = [...admins, ...managers]

  const createMutation = useMutation({
    mutationFn: (payload) => httpClient.post('/users/create-staff', payload),
    onSuccess: (res) => {
      pushToast({ title: res.message, variant: 'success' })
      setShowForm(false)
      setForm({ firstName: '', lastName: '', phone: '', password: '', role: 'admin' })
      queryClient.invalidateQueries(['staff-users'])
      queryClient.invalidateQueries(['manager-users'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => httpClient.delete(`/users/${id}`),
    onSuccess: (res) => {
      pushToast({ title: res.message, variant: 'success' })
      setDeleteTarget(null)
      queryClient.invalidateQueries(['staff-users'])
      queryClient.invalidateQueries(['manager-users'])
    },
    onError: (err) => { pushToast({ title: err.message, variant: 'error' }); setDeleteTarget(null) },
  })

  const ROLE_COLORS = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    'super-admin': 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={!!deleteTarget}
        title="Foydalanuvchini o'chirish"
        description={`"${deleteTarget?.firstName} ${deleteTarget?.lastName}" ni o'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo'lmaydi.`}
        danger
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
      <section className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">Hodimlar boshqaruvi</h2>
          <p className="mt-1 text-slate-500">Admin va menejerlarni yaratish, ko'rish va o'chirish</p>
        </div>
        <button className="primary-button flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <UserPlus className="h-4 w-4" />
          Yangi hodim
        </button>
      </section>

      {showForm && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Yangi hodim yaratish</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1">Ism</label>
              <input className="soft-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Ism" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Familiya</label>
              <input className="soft-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Familiya" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Telefon</label>
              <input className="soft-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Parol</label>
              <input className="soft-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Kamida 6 ta belgi" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Rol</label>
              <select className="soft-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="manager">Menejer</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              className="primary-button"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate(form)}
            >
              {createMutation.isPending ? 'Yaratilmoqda...' : 'Yaratish'}
            </button>
            <button className="secondary-button" onClick={() => setShowForm(false)}>Bekor qilish</button>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-white/10">
            <tr className="text-left text-xs font-bold uppercase text-slate-500">
              <th className="p-4">Ism</th><th className="p-4">Telefon</th><th className="p-4">Rol</th><th className="p-4">Status</th><th className="p-4">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {allStaff.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Hodimlar yo'q</td></tr>
            ) : allStaff.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4 font-semibold">{u.firstName} {u.lastName}</td>
                <td className="p-4 text-slate-500">{u.phone}</td>
                <td className="p-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ROLE_COLORS[u.role] || 'bg-slate-100'}`}>{u.role}</span></td>
                <td className="p-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{u.status}</span></td>
                <td className="p-4">
                  <button
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    onClick={() => setDeleteTarget(u)}
                    title="O'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RolesPage() {
  const t = useT()
  usePageTitle('Rollar')
  const roles = [
    { name: 'super-admin', label: 'Super Admin', desc: "To'liq tizim nazorati" },
    { name: 'admin', label: 'Admin', desc: 'Ferma/haydovchi tasdiqlash, buyurtmalar' },
    { name: 'manager', label: 'Menejer', desc: 'GPS, hisobotlar, statistika' },
    { name: 'farm-owner', label: 'Ferma egasi', desc: 'Ferma va baliq boshqaruvi' },
    { name: 'driver', label: 'Haydovchi', desc: 'Yetkazib berish, GPS' },
    { name: 'customer', label: 'Mijoz', desc: 'Buyurtma berish, katalog' },
  ]

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Rollar</h2></section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <div key={r.name} className="glass-card p-5">
            <p className="font-mono text-sm font-bold text-ocean-600">{r.name}</p>
            <p className="mt-1 text-lg font-black">{r.label}</p>
            <p className="mt-1 text-sm text-slate-500">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PermissionsPage() {
  const t = useT()
  usePageTitle('Ruxsatlar')
  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Ruxsatlar</h2><p className="mt-2 text-slate-500">Role-based access control matritsasi</p></section>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="p-3 text-left">Ruxsat</th>
              {['Super Admin', 'Admin', 'Menejer', 'Ferma', 'Haydovchi', 'Mijoz'].map((r) => <th key={r} className="p-3">{r}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {[
              ["Tizim sozlamalari", '✅', '❌', '❌', '❌', '❌', '❌'],
              ["Bazani tozalash", '✅', '❌', '❌', '❌', '❌', '❌'],
              ["Foydalanuvchi boshqarish", '✅', '✅', '❌', '❌', '❌', '❌'],
              ["Ferma tasdiqlash", '✅', '✅', '❌', '❌', '❌', '❌'],
              ["GPS ko'rish", '✅', '✅', '✅', '❌', '✅', '❌'],
              ["Buyurtma ko'rish", '✅', '✅', '✅', '✅', '✅', '✅'],
              ["Baliq qo'shish", '✅', '✅', '❌', '✅', '❌', '❌'],
              ["Buyurtma berish", '❌', '❌', '❌', '❌', '❌', '✅'],
            ].map(([perm, ...vals]) => (
              <tr key={perm}>
                <td className="p-3 font-semibold">{perm}</td>
                {vals.map((v, i) => <td key={i} className="p-3 text-center">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SuperAdminAuditLog() {
  const t = useT()
  const { data = [] } = useQuery({ queryKey: ['audit-logs'], queryFn: () => httpClient.get('/audit/logs?limit=100') })
  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Audit log</h2></section>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-white/10">
            <tr className="text-left text-xs font-bold uppercase text-slate-500"><th className="p-4">Amal</th><th className="p-4">Foydalanuvchi</th><th className="p-4">Sana</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {data.map((log) => (
              <tr key={log.id}><td className="p-4 font-mono text-xs font-bold text-ocean-600">{log.action}</td><td className="p-4 text-xs text-slate-500">{log.user_id?.slice(-8)}</td><td className="p-4 text-xs text-slate-500">{new Date(log.created_at).toLocaleString('uz')}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SystemSettings() {
  const t = useT()
  usePageTitle('Tizim sozlamalari')
  const pushToast = useToastStore((s) => s.pushToast)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleClearDatabase = async () => {
    setClearing(true)
    try {
      const res = await httpClient.delete('/settings/clear-database')
      pushToast({ title: res.message || 'Baza tozalandi!', variant: 'success' })
      setShowClearConfirm(false)
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={showClearConfirm}
        title="Bazani tozalash"
        description="DIQQAT! Bu amal barcha ferma, haydovchi, buyurtma va foydalanuvchi ma'lumotlarini o'chirib yuboradi. Faqat Super-Admin akkaunti saqlanib qoladi. Bu amalni BEKOR QILIB BO'LMAYDI!"
        danger
        onConfirm={handleClearDatabase}
        onCancel={() => setShowClearConfirm(false)}
      />
      <SettingsPage title="Tizim sozlamalari" />
      <div className="glass-card border border-rose-200 dark:border-rose-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Xavfli zona
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Barcha ma'lumotlarni o'chirish. Super-admin akkaunti saqlanib qoladi.
            </p>
          </div>
          <button
            className="px-5 py-2.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 flex items-center gap-2"
            onClick={() => setShowClearConfirm(true)}
            disabled={clearing}
          >
            <Trash2 className="h-4 w-4" />
            {clearing ? 'Tozalanmoqda...' : 'Bazani tozalash'}
          </button>
        </div>
      </div>
    </div>
  )
}
