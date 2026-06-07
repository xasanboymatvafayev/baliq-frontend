import { useQuery } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { SettingsPage } from '../shared/SettingsPage.jsx'
import { httpClient } from '../../services/api/index.js'

export function SystemStatistics() {
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
  usePageTitle('Admin boshqaruvi')
  const { data = [] } = useQuery({
    queryKey: ['admins'],
    queryFn: () => httpClient.get('/users?role=admin'),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Admin boshqaruvi</h2></section>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-white/10">
            <tr className="text-left text-xs font-bold uppercase text-slate-500"><th className="p-4">Ism</th><th className="p-4">Telefon</th><th className="p-4">Rol</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {data.map((u) => (
              <tr key={u.id}><td className="p-4 font-semibold">{u.firstName} {u.lastName}</td><td className="p-4">{u.phone}</td><td className="p-4 text-ocean-600 font-bold">{u.role}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RolesPage() {
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
              ['Tizim sozlamalari', '✅', '❌', '❌', '❌', '❌', '❌'],
              ['Foydalanuvchi boshqarish', '✅', '✅', '❌', '❌', '❌', '❌'],
              ['Ferma tasdiqlash', '✅', '✅', '❌', '❌', '❌', '❌'],
              ['GPS ko\'rish', '✅', '✅', '✅', '❌', '✅', '❌'],
              ['Buyurtma ko\'rish', '✅', '✅', '✅', '✅', '✅', '✅'],
              ['Baliq qo\'shish', '✅', '✅', '❌', '✅', '❌', '❌'],
              ['Buyurtma berish', '❌', '❌', '❌', '❌', '❌', '✅'],
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

export function SystemSettings() { return <SettingsPage title="Tizim sozlamalari" /> }
