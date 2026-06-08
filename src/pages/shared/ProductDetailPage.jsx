import { ShoppingCart, ArrowLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fishService } from '../../services/api/index.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'

export function ProductDetailPage() {
  usePageTitle('Mahsulot tafsiloti')
  const { id } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const pushToast = useToastStore((state) => state.pushToast)

  const { data: fish, isLoading, error } = useQuery({
    queryKey: ['fish', id],
    queryFn: () => fishService.detail(id),
    enabled: !!id,
  })

  const handleAdd = () => {
    if (!fish) return
    addItem({ id: fish.id, name: fish.name, price: fish.price, unit: fish.unit, quantity: 1, fish_id: fish.id })
    pushToast({ title: `${fish.name} savatchaga qo'shildi`, variant: 'success' })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="glass-card grid gap-6 p-6 lg:grid-cols-[420px_1fr]">
          <div className="flex min-h-80 items-center justify-center rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-32 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
            <div className="h-10 w-64 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
            <div className="h-20 w-full rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
          </div>
        </section>
      </div>
    )
  }

  if (error || !fish) {
    return (
      <div className="space-y-6">
        <section className="glass-card p-12 text-center">
          <p className="text-slate-500">Mahsulot topilmadi yoki xatolik yuz berdi.</p>
          <button className="primary-button mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Orqaga tugma */}
      <button
        className="secondary-button inline-flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Orqaga
      </button>

      <section className="glass-card grid gap-6 p-6 lg:grid-cols-[420px_1fr]">
        {/* Rasm */}
        <div className="flex min-h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-ocean-100 to-emerald-100 dark:from-ocean-900/40 dark:to-emerald-900/20 overflow-hidden">
          {fish.image_url ? (
            <img src={fish.image_url} alt={fish.name} className="h-full w-full object-cover rounded-3xl" />
          ) : (
            <span className="text-8xl">🐟</span>
          )}
        </div>

        {/* Ma'lumotlar */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean-600">{fish.category || 'Baliq'}</p>
          <h2 className="mt-3 text-4xl font-black">{fish.name}</h2>

          {fish.description && (
            <p className="mt-4 text-slate-500">{fish.description}</p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <p className="text-xs text-slate-500">Narx</p>
              <p className="text-xl font-black text-ocean-600">{fish.price?.toLocaleString()} so'm/{fish.unit}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <p className="text-xs text-slate-500">Zaxira</p>
              <p className="font-bold">{fish.stock} {fish.unit}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <p className="text-xs text-slate-500">Kategoriya</p>
              <p className="font-bold">{fish.category || '—'}</p>
            </div>
          </div>

          <button
            className="primary-button mt-6 flex items-center gap-2"
            onClick={handleAdd}
            disabled={!fish.stock || fish.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
            {fish.stock > 0 ? "Savatchaga qo'shish" : "Zaxirada yo'q"}
          </button>
        </div>
      </section>
    </div>
  )
}
