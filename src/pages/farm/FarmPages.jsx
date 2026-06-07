import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ProfilePage } from '../shared/ProfilePage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { httpClient, fishService } from '../../services/api/index.js'
import { useState } from 'react'

// ===== FARM FISH LIST =====
export function FarmFish() {
  usePageTitle('Baliqlar')
  const { data = [], isLoading } = useQuery({
    queryKey: ['farm-fish'],
    queryFn: () => fishService.list(),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 flex justify-between items-center">
        <div><h2 className="text-3xl font-black">Baliqlar</h2><p className="mt-2 text-slate-500">Ferma mahsulotlari</p></div>
        <a href="/farm/add-fish" className="primary-button">+ Qo'shish</a>
      </section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? <div className="glass-card p-12 text-center text-slate-500">Baliq qo'shilmagan</div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Nomi</th><th className="p-4">Narx</th><th className="p-4">Zaxira</th><th className="p-4">Kategoriya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.map((fish) => (
                <tr key={fish.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-semibold">{fish.name}</td>
                  <td className="p-4 font-bold text-ocean-600">{fish.price?.toLocaleString()} so'm/{fish.unit}</td>
                  <td className="p-4">{fish.stock} {fish.unit}</td>
                  <td className="p-4 text-slate-500">{fish.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ===== ADD FISH =====
export function FarmAddFish() {
  usePageTitle("Baliq qo'shish")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState } = useForm()

  const mutation = useMutation({
    mutationFn: (data) => fishService.create({ ...data, price: Number(data.price), stock: Number(data.stock) }),
    onSuccess: () => {
      pushToast({ title: "Baliq qo'shildi", variant: 'success' })
      reset()
      queryClient.invalidateQueries(['farm-fish'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Baliq qo'shish</h2></section>
      <form className="glass-card grid gap-4 p-6 sm:grid-cols-2" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div><label className="block text-sm font-semibold mb-2">Nomi</label><input className="soft-input w-full" {...register('name', { required: true })} /></div>
        <div><label className="block text-sm font-semibold mb-2">Kategoriya</label>
          <select className="soft-input w-full" {...register('category')}>
            <option>Daryo baliqlari</option><option>Dengiz baliqlari</option><option>Ferma baliqlari</option><option>Premium baliqlar</option>
          </select>
        </div>
        <div><label className="block text-sm font-semibold mb-2">Narx (so'm/kg)</label><input className="soft-input w-full" type="number" {...register('price', { required: true })} /></div>
        <div><label className="block text-sm font-semibold mb-2">Zaxira (kg)</label><input className="soft-input w-full" type="number" {...register('stock', { required: true })} /></div>
        <div><label className="block text-sm font-semibold mb-2">Birlik</label>
          <select className="soft-input w-full" {...register('unit')}>
            <option value="kg">kg</option><option value="dona">dona</option>
          </select>
        </div>
        <div><label className="block text-sm font-semibold mb-2">Tavsif</label><input className="soft-input w-full" {...register('description')} /></div>
        <div className="sm:col-span-2">
          <button className="primary-button" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saqlanmoqda...' : "Qo'shish"}
          </button>
        </div>
      </form>
    </div>
  )
}

// ===== INVENTORY =====
export function FarmInventory() {
  usePageTitle('Ombor')
  const { data = [] } = useQuery({ queryKey: ['farm-fish'], queryFn: () => fishService.list() })
  const totalStock = data.reduce((s, f) => s + (f.stock || 0), 0)

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 flex gap-6">
        <div><h2 className="text-3xl font-black">Ombor</h2></div>
        <div className="ml-auto text-right"><p className="text-sm text-slate-500">Umumiy zaxira</p><p className="text-2xl font-black text-ocean-600">{totalStock} kg</p></div>
      </section>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-white/10">
            <tr className="text-left text-xs font-bold uppercase text-slate-500">
              <th className="p-4">Baliq</th><th className="p-4">Zaxira</th><th className="p-4">Narx</th><th className="p-4">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {data.map((fish) => (
              <tr key={fish.id}>
                <td className="p-4 font-semibold">{fish.name}</td>
                <td className="p-4">{fish.stock} {fish.unit}</td>
                <td className="p-4">{fish.price?.toLocaleString()} so'm</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${fish.stock > 50 ? 'bg-green-100 text-green-700' : fish.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {fish.stock > 50 ? 'Yetarli' : fish.stock > 0 ? 'Kam' : 'Tugagan'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===== FARM CUSTOMERS =====
export function FarmCustomers() {
  usePageTitle('Mijozlar')
  const { data = [] } = useQuery({ queryKey: ['orders'], queryFn: () => httpClient.get('/orders') })
  const customers = [...new Map(data.map((o) => [o.customer_id, { name: o.customer_name, orders: data.filter((x) => x.customer_id === o.customer_id).length }])).values()]

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">Mijozlar</h2><p className="mt-2 text-slate-500">Jami: {customers.length} ta</p></section>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-white/10">
            <tr className="text-left text-xs font-bold uppercase text-slate-500"><th className="p-4">Mijoz</th><th className="p-4">Buyurtmalar</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {customers.map((c, i) => (
              <tr key={i}><td className="p-4 font-semibold">{c.name || 'Noma\'lum'}</td><td className="p-4">{c.orders} ta</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FarmDashboard() { return <DashboardPage title="Ferma Dashboard" subtitle="Baliq zaxirasi, ombor, buyurtmalar va mijozlar bo'yicha operatsion panel." /> }
export function FarmOrders() { return <OrdersPage title="Ferma buyurtmalari" /> }
export function FarmChat() { return <ChatPage title="Ferma chat" /> }
export function FarmReports() { return <DashboardPage title="Hisobotlar" subtitle="Sotuv, buyurtma, ombor va logistika hisobotlari." /> }
export function FarmProfile() { return <ProfilePage /> }
