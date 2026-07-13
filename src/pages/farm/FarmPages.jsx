import { formatCurrency, formatNumber, calcFarmRevenue } from '../../utils/formatters.js'
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { TrendingUp, DollarSign, Receipt, PiggyBank, ArrowUpRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { DashboardPage } from '../shared/DashboardPage.jsx'
import { OrdersPage } from '../shared/OrdersPage.jsx'
import { ProfilePage } from '../shared/ProfilePage.jsx'
import { ChatPage } from '../shared/ChatPage.jsx'
import { httpClient, fishService, fileService } from '../../services/api/index.js'
import { useState, useRef, useMemo } from 'react'
import { Pencil, Trash2, X, ImageUp } from 'lucide-react'

// ===== FARM FISH LIST (with Edit/Delete) =====
export function FarmFish() {
  const t = useT()
  usePageTitle('Baliqlar')
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [editingFish, setEditingFish] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['farm-fish'],
    queryFn: () => fishService.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fishService.remove(id),
    onSuccess: () => {
      pushToast({ title: "Baliq o'chirildi", variant: 'success' })
      queryClient.invalidateQueries(['farm-fish'])
      setDeleteTarget(null)
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => fishService.update(id, data),
    onSuccess: () => {
      pushToast({ title: 'Baliq yangilandi', variant: 'success' })
      queryClient.invalidateQueries(['farm-fish'])
      setEditingFish(null)
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <div className="space-y-6">
      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-black">O'chirishni tasdiqlang</h3>
            <p className="text-slate-600 dark:text-slate-400">"{deleteTarget.name}" baliqni o'chirishni xohlaysizmi?</p>
            <div className="flex gap-3 justify-end">
              <button className="secondary-button" onClick={() => setDeleteTarget(null)}>Bekor qilish</button>
              <button className="px-5 py-2.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600" onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingFish && (
        <EditFishModal
          fish={editingFish}
          onClose={() => setEditingFish(null)}
          onSave={(data) => updateMutation.mutate({ id: editingFish.id, data })}
          saving={updateMutation.isPending}
        />
      )}

      <section className="glass-card p-6 flex justify-between items-center">
        <div><h2 className="text-3xl font-black">{t.fish}</h2><p className="mt-2 text-slate-500">Ferma mahsulotlari</p></div>
        <a href="/farm/add-fish" className="primary-button">+ Qo'shish</a>
      </section>
      {isLoading ? (
        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-200 dark:border-white/10 px-4 py-3 flex gap-4">
            {['w-10','flex-1','w-24','w-20','w-28','w-16'].map((w,i) => (
              <div key={i} className={`h-3 ${w} rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse`} style={{ animationDelay: `${i*50}ms` }} />
            ))}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {Array.from({length: 5}).map((_,row) => (
              <div key={row} className="flex items-center gap-4 px-4 py-3" style={{ animationDelay: `${row*80}ms` }}>
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] animate-pulse shrink-0" />
                <div className="h-4 flex-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                <div className="h-4 w-24 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                <div className="h-4 w-16 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
                <div className="h-4 w-28 rounded-lg bg-slate-100 dark:bg-white/[0.06] animate-pulse hidden sm:block" />
                <div className="h-8 w-16 rounded-xl bg-slate-100 dark:bg-white/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🐟</div>
          <p className="text-slate-500 font-medium">Baliq qo'shilmagan</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="p-4">Rasm</th><th className="p-4">Nomi</th><th className="p-4">Narx</th><th className="p-4">Zaxira</th><th className="p-4 hidden sm:table-cell">Kategoriya</th><th className="p-4">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.map((fish) => (
                  <tr key={fish.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-4">
                      {fish.image_url ? (
                        <img src={fish.image_url} alt={fish.name} className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-ocean-100 to-cyan-100 dark:from-ocean-900/30 dark:to-cyan-900/30 flex items-center justify-center text-lg">🐟</div>
                      )}
                    </td>
                    <td className="p-4 font-semibold whitespace-nowrap">{fish.name}</td>
                    <td className="p-4 font-bold text-ocean-600 dark:text-ocean-400 whitespace-nowrap">{fish.price?.toLocaleString()} so'm/{fish.unit}</td>
                    <td className="p-4 whitespace-nowrap">{fish.stock} {fish.unit}</td>
                    <td className="p-4 text-slate-500 hidden sm:table-cell">{fish.category}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-xl text-ocean-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition" onClick={() => setEditingFish(fish)} title={t.editProfile}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition" onClick={() => setDeleteTarget(fish)} title="O'chirish">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

// ===== EDIT FISH MODAL =====
function EditFishModal({ fish, onClose, onSave, saving }) {
  const [name, setName] = useState(fish.name || '')
  const [price, setPrice] = useState(fish.price || '')
  const [stock, setStock] = useState(fish.stock || '')
  const [category, setCategory] = useState(fish.category || '')
  const [description, setDescription] = useState(fish.description || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-card max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black">Baliqni tahrirlash</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-semibold mb-1">Nomi</label><input className="soft-input w-full" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="block text-sm font-semibold mb-1">Kategoriya</label>
            <select className="soft-input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Daryo baliqlari</option><option>Dengiz baliqlari</option><option>Ferma baliqlari</option><option>Premium baliqlar</option>
            </select>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Narx (so'm)</label><input className="soft-input w-full" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div><label className="block text-sm font-semibold mb-1">Zaxira</label><input className="soft-input w-full" type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Tavsif</label><input className="soft-input w-full" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button className="secondary-button" onClick={onClose}>Bekor qilish</button>
          <button className="primary-button" onClick={() => onSave({ name, price: Number(price), stock: Number(stock), category, description })} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== ADD FISH (with image upload) =====
export function FarmAddFish() {
  const t = useT()
  usePageTitle("Baliq qo'shish")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState } = useForm()
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const mutation = useMutation({
    mutationFn: async (data) => {
      let image_url = null
      // Rasmni yuklash
      if (imageFile) {
        setUploading(true)
        try {
          const formData = new FormData()
          formData.append('file', imageFile)
          const uploadResult = await fileService.upload(formData)
          image_url = uploadResult.url || uploadResult.file_url
        } catch (err) {
          pushToast({ title: 'Rasm yuklashda xatolik: ' + err.message, variant: 'error' })
        }
        setUploading(false)
      }
      return fishService.create({ ...data, price: Number(data.price), stock: Number(data.stock), image_url })
    },
    onSuccess: () => {
      pushToast({ title: "Baliq qo'shildi", variant: 'success' })
      reset()
      setImageFile(null)
      setImagePreview(null)
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
        {/* Rasm yuklash */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-2">Baliq rasmi</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-ocean-400 dark:border-white/10 dark:bg-white/5 flex-1">
              <ImageUp className="mx-auto h-8 w-8 text-ocean-600" />
              <span className="mt-2 block text-sm font-semibold">{imageFile ? imageFile.name : 'Rasm tanlang'}</span>
              <span className="mt-1 block text-xs text-slate-500">PNG, JPG yoki WebP</span>
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover" />
                <button type="button" className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1" onClick={() => { setImageFile(null); setImagePreview(null) }}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <button className="primary-button" type="submit" disabled={mutation.isPending || uploading}>
            {uploading ? 'Rasm yuklanmoqda...' : mutation.isPending ? 'Saqlanmoqda...' : "Qo'shish"}
          </button>
        </div>
      </form>
    </div>
  )
}

// ===== INVENTORY =====
export function FarmInventory() {
  const t = useT()
  usePageTitle('Ombor')
  const { data = [] } = useQuery({ queryKey: ['farm-fish'], queryFn: () => fishService.list() })
  const totalStock = data.reduce((s, f) => s + (f.stock || 0), 0)

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 flex gap-6">
        <div><h2 className="text-3xl font-black">{t.inventory}</h2></div>
        <div className="ml-auto text-right"><p className="text-sm text-slate-500">Umumiy zaxira</p><p className="text-2xl font-black text-ocean-600">{totalStock} kg</p></div>
      </section>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="p-4">Baliq</th><th className="p-4">Zaxira</th><th className="p-4">Narx</th><th className="p-4">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {data.map((fish) => (
              <tr key={fish.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                <td className="p-4 font-semibold whitespace-nowrap">{fish.name}</td>
                <td className="p-4 whitespace-nowrap">{fish.stock} {fish.unit}</td>
                <td className="p-4 whitespace-nowrap">{fish.price?.toLocaleString()} so'm</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    fish.stock > 50
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : fish.stock > 0
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}>
                    {fish.stock > 50 ? 'Yetarli' : fish.stock > 0 ? 'Kam' : 'Tugagan'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

// ===== FARM CUSTOMERS =====
export function FarmCustomers() {
  const t = useT()
  usePageTitle('Mijozlar')
  const { data: ordersRaw } = useQuery({ queryKey: ['orders'], queryFn: () => httpClient.get('/orders') })
  const data = ordersRaw?.data || ordersRaw || []
  const customers = [...new Map(data.map((o) => [o.customer_id, { name: o.customer_name, orders: data.filter((x) => x.customer_id === o.customer_id).length }])).values()]

  return (
    <div className="space-y-6">
      <section className="glass-card p-6"><h2 className="text-3xl font-black">{t.customers}</h2><p className="mt-2 text-slate-500">Jami: {customers.length} ta</p></section>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-white/10">
            <tr className="text-left text-xs font-bold uppercase text-slate-500"><th className="p-4">Mijoz</th><th className="p-4">{t.orders}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {customers.map((c, i) => (
              <tr key={i}><td className="p-4 font-semibold">{c.name || "Noma'lum"}</td><td className="p-4">{c.orders} ta</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FarmDashboard() {
  const t = useT()
  return <DashboardPage title="Ferma Dashboard" subtitle="Baliq zaxirasi, ombor, buyurtmalar va mijozlar bo'yicha operatsion panel." /> }
export function FarmOrders() {
  const t = useT()
  return <OrdersPage title="Ferma buyurtmalari" /> }
export function FarmChat() {
  const t = useT()
  return <ChatPage title="Ferma chat" /> }
export function FarmProfile() {
  const t = useT()
  return <ProfilePage /> }

// ===== FARM REPORTS — PRO darajada hisobotlar =====

const fmtM = v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v

function ReportTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#0d1829] p-3 shadow-float text-[13px]">
      <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="flex items-center gap-2 mt-0.5">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function FarmReports() {
  const t = useT()
  usePageTitle('Hisobotlar')
  const { data: ordersRaw, isLoading } = useQuery({
    queryKey: ['farm-orders-report'],
    queryFn: () => httpClient.get('/orders?limit=200'),
  })
  const orders = (ordersRaw?.data || ordersRaw || []).filter(o => o.status === 'DELIVERED')

  const totals = useMemo(() => {
    const gross = orders.reduce((s, o) => s + (o.total || 0), 0)
    return calcFarmRevenue(gross)
  }, [orders])

  // Oylik statistika
  const monthly = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      const d = new Date(o.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const label = d.toLocaleDateString('uz-UZ', { month: 'short', year: '2-digit' })
      if (!map[key]) map[key] = { name: label, gross: 0, net: 0, count: 0 }
      const r = calcFarmRevenue(o.total || 0)
      map[key].gross += r.gross
      map[key].net   += r.net
      map[key].count += 1
    })
    return Object.values(map).slice(-6)
  }, [orders])

  const STATS = [
    { label: 'Umumiy sotuv',  value: totals.gross, icon: DollarSign, tone: 'from-sky-500 to-blue-600',       glow: 'rgba(14,165,233,0.2)',  soft: 'bg-sky-50 dark:bg-sky-500/10',      text: 'text-sky-600 dark:text-sky-400' },
    { label: 'Soliq (12%)',   value: totals.tax,   icon: Receipt,    tone: 'from-rose-500 to-pink-600',       glow: 'rgba(244,63,94,0.2)',   soft: 'bg-rose-50 dark:bg-rose-500/10',    text: 'text-rose-600 dark:text-rose-400' },
    { label: 'Sof daromad',   value: totals.net,   icon: PiggyBank,  tone: 'from-emerald-500 to-teal-600',   glow: 'rgba(16,185,129,0.2)',  soft: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Buyurtmalar',   value: orders.length, icon: TrendingUp, tone: 'from-amber-500 to-orange-500',  glow: 'rgba(245,158,11,0.2)',  soft: 'bg-amber-50 dark:bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400', count: true },
  ]

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
          <TrendingUp className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Moliyaviy hisobot</h2>
          <p className="text-[14px] text-slate-400 mt-0.5">Yetkazilgan buyurtmalar asosida daromad va soliq hisob-kitobi</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass-card p-5">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-lg mb-4`} style={{ boxShadow: `0 4px 14px ${s.glow}` }}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1">{s.label}</p>
              <p className="text-[24px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                {s.count ? s.value.toLocaleString() : formatCurrency(s.value)}
              </p>
              <div className={`mt-3 h-0.5 w-full rounded-full bg-gradient-to-r ${s.tone} opacity-30`} />
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 xl:grid-cols-2">

        {/* Area chart — oylik daromad */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Oylik daromad</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Umumiy sotuv va sof daromad taqqoslama</p>
          </div>
          {monthly.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-[13px] text-slate-400">Ma'lumot yetarli emas</p>
            </div>
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtM} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ReportTooltip />} />
                  <Area type="monotone" dataKey="gross" name="Umumiy sotuv" stroke="#0ea5e9" strokeWidth={2} fill="url(#gGross)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="net"   name={t.netProfit}  stroke="#10b981" strokeWidth={2} fill="url(#gNet)"   dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar chart — oylik buyurtmalar */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Oylik buyurtmalar</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Har oyda yetkazilgan buyurtmalar soni</p>
          </div>
          {monthly.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-[13px] text-slate-400">Ma'lumot yetarli emas</p>
            </div>
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => [v, 'Buyurtmalar']} contentStyle={{ borderRadius: 14, fontSize: 13 }} />
                  <Bar dataKey="count" name="Buyurtmalar" radius={[8, 8, 0, 0]}>
                    {monthly.map((_, i) => (
                      <Cell key={i} fill={`rgba(14,165,233,${0.5 + (i / monthly.length) * 0.5})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.04]">
          <div>
            <h4 className="text-[15px] font-bold text-slate-800 dark:text-white">Buyurtmalar ro'yxati</h4>
            <p className="text-[12px] text-slate-400 mt-0.5">{orders.length} ta yetkazilgan buyurtma</p>
          </div>
          <span className="badge badge-green">{orders.length} ta</span>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.05] mb-4">
              <Receipt className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-[15px] font-semibold text-slate-500">Hali yetkazilgan buyurtma yo'q</p>
            <p className="text-[13px] text-slate-400 mt-1">Buyurtmalar yetkazilganidan keyin bu yerda ko'rinadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Umumiy sotuv</th>
                  <th>Soliq (12%)</th>
                  <th>Sof daromad</th>
                  <th className="hidden sm:table-cell">Sana</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const r = calcFarmRevenue(o.total)
                  return (
                    <tr key={o.id}>
                      <td><span className="font-mono text-[12px] font-semibold text-slate-500">#{o.id?.slice(-6)}</span></td>
                      <td><span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(r.gross)}</span></td>
                      <td><span className="text-rose-500 font-medium">−{formatCurrency(r.tax)}</span></td>
                      <td><span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.net)}</span></td>
                      <td className="hidden sm:table-cell"><span className="text-slate-400 text-[13px]">{new Date(o.created_at).toLocaleDateString('uz-UZ')}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formula note */}
      <div className="glass-card px-5 py-4 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
          <Receipt className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-[13px] text-slate-500 dark:text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700 dark:text-slate-400">Soliq formulasi:</span>{' '}
          Umumiy sotuv × 12% = Soliq · Sof daromad = Umumiy sotuv − Soliq.
          Masalan: {formatCurrency(360_000)} → Soliq: {formatCurrency(43_200)} → Sof: {formatCurrency(316_800)}
        </p>
      </div>
    </div>
  )
}
