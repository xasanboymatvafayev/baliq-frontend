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
        <div><h2 className="text-3xl font-black">Baliqlar</h2><p className="mt-2 text-slate-500">Ferma mahsulotlari</p></div>
        <a href="/farm/add-fish" className="primary-button">+ Qo'shish</a>
      </section>
      {isLoading ? <div className="glass-card h-32 animate-pulse" /> : data.length === 0 ? <div className="glass-card p-12 text-center text-slate-500">Baliq qo'shilmagan</div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Rasm</th><th className="p-4">Nomi</th><th className="p-4">Narx</th><th className="p-4">Zaxira</th><th className="p-4">Kategoriya</th><th className="p-4">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.map((fish) => (
                <tr key={fish.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4">
                    {fish.image_url ? (
                      <img src={fish.image_url} alt={fish.name} className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">🐟</div>
                    )}
                  </td>
                  <td className="p-4 font-semibold">{fish.name}</td>
                  <td className="p-4 font-bold text-ocean-600">{fish.price?.toLocaleString()} so'm/{fish.unit}</td>
                  <td className="p-4">{fish.stock} {fish.unit}</td>
                  <td className="p-4 text-slate-500">{fish.category}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-xl text-ocean-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/20" onClick={() => setEditingFish(fish)} title="Tahrirlash">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => setDeleteTarget(fish)} title="O'chirish">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
  const { data: ordersRaw } = useQuery({ queryKey: ['orders'], queryFn: () => httpClient.get('/orders') })
  const data = ordersRaw?.data || ordersRaw || []
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
              <tr key={i}><td className="p-4 font-semibold">{c.name || "Noma'lum"}</td><td className="p-4">{c.orders} ta</td></tr>
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
export function FarmProfile() { return <ProfilePage /> }

// ===== FARM REPORTS — Soliq hisob-kitobi =====
import { formatCurrency, formatNumber, calcFarmRevenue } from '../../utils/formatters.js'

export function FarmReports() {
  usePageTitle('Hisobotlar')
  const { data: ordersRaw } = useQuery({
    queryKey: ['farm-orders-report'],
    queryFn: () => httpClient.get('/orders?limit=200'),
  })
  const orders = (ordersRaw?.data || ordersRaw || []).filter(
    (o) => o.status === 'DELIVERED'
  )

  const totals = useMemo(() => {
    const gross = orders.reduce((s, o) => s + (o.total || 0), 0)
    return calcFarmRevenue(gross)
  }, [orders])

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Hisobotlar</h2>
        <p className="mt-2 text-slate-500">Yetkazilgan buyurtmalar asosida hisob-kitob</p>
      </section>

      {/* Soliq hisob-kitobi kartasi */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-black text-lg">💰 Daromad va soliq hisob-kitobi</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-ocean-50 dark:bg-ocean-900/20 p-4">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Umumiy sotuv</p>
            <p className="text-2xl font-black text-ocean-700 dark:text-ocean-300">{formatCurrency(totals.gross)}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 p-4">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Soliq (12%)</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">− {formatCurrency(totals.tax)}</p>
          </div>
          <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-4 border-2 border-green-300 dark:border-green-700">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Sof daromad</p>
            <p className="text-2xl font-black text-green-700 dark:text-green-300">{formatCurrency(totals.net)}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          * Hisoblash: Umumiy sotuv × 12% = Soliq. Sof daromad = Umumiy sotuv − Soliq.
          Masalan: {formatCurrency(360000)} → Soliq: {formatCurrency(43200)} → Sof: {formatCurrency(316800)}
        </p>
      </div>

      {/* Buyurtmalar jadvali */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <h4 className="font-bold">Yetkazilgan buyurtmalar ({orders.length} ta)</h4>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Hali yetkazilgan buyurtma yo'q</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-bold uppercase text-slate-500">
                <th className="p-4">ID</th>
                <th className="p-4">Umumiy</th>
                <th className="p-4">Soliq (12%)</th>
                <th className="p-4">Sof</th>
                <th className="p-4 hidden sm:table-cell">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {orders.map((o) => {
                const r = calcFarmRevenue(o.total)
                return (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-4 font-mono text-xs">#{o.id?.slice(-6)}</td>
                    <td className="p-4 font-bold">{formatCurrency(r.gross)}</td>
                    <td className="p-4 text-rose-500">− {formatCurrency(r.tax)}</td>
                    <td className="p-4 font-black text-green-700 dark:text-green-400">{formatCurrency(r.net)}</td>
                    <td className="p-4 text-slate-500 hidden sm:table-cell">{new Date(o.created_at).toLocaleDateString('uz')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
