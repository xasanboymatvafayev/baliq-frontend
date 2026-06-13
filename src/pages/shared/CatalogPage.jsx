import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Star } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fishService, httpClient } from '../../services/api/index.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency } from '../../utils/formatters.js'

// ─── Yulduz reytingi ─────────────────────────────────────────────
function StarRating({ rating = 0, count = 0, size = 14 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-${size === 14 ? 3.5 : 4} w-${size === 14 ? 3.5 : 4} ${
            s <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-slate-300'
          }`}
          style={{ width: size, height: size }}
        />
      ))}
      <span className="text-xs text-slate-500 font-medium">
        {rating > 0 ? rating.toFixed(1) : 'Yangi'}
        {count > 0 && ` (${count})`}
      </span>
    </div>
  )
}

// ─── Baliq kartasi ───────────────────────────────────────────────
function FishCard({ fish, onAdd, onDetail }) {
  const rating = fish.farm_rating || fish.farm?.rating || 0
  const ratingCount = fish.farm_rating_count || fish.farm?.rating_count || 0
  const farmName = fish.farm_name || fish.farm?.farmName || ''

  return (
    <div className="glass-card flex flex-col p-5 relative overflow-hidden">
      {/* Ferma reytingi — yuqori o'ng burchak */}
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-2 py-0.5">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="text-xs font-black text-amber-700 dark:text-amber-300">
          {rating > 0 ? rating.toFixed(1) : 'Yangi'}
        </span>
      </div>

      {/* Rasm yoki emoji */}
      <div className="mb-3 h-32 rounded-2xl bg-gradient-to-br from-ocean-100 to-emerald-100 dark:from-ocean-900/30 dark:to-emerald-900/20 flex items-center justify-center overflow-hidden">
        {fish.image_url ? (
          <img src={fish.image_url} alt={fish.name} className="h-full w-full object-cover rounded-2xl" />
        ) : (
          <span className="text-5xl">🐟</span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-ocean-600">{fish.category}</p>
        <h3 className="mt-0.5 text-lg font-black">{fish.name}</h3>

        {/* Ferma nomi — bir xil baliqlarni farqlash uchun */}
        {farmName && (
          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            🏡 {farmName}
          </p>
        )}

        <p className="mt-1 text-xl font-black text-ocean-600">
          {formatCurrency(fish.price)}/{fish.unit}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">Zaxira: {fish.stock} {fish.unit}</p>

        <div className="mt-1.5">
          <StarRating rating={rating} count={ratingCount} size={13} />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="secondary-button flex-1 text-sm"
          onClick={() => onDetail(fish.id)}
        >
          Batafsil
        </button>
        <button
          className="primary-button flex-1 text-sm"
          onClick={() => onAdd(fish)}
          disabled={!fish.stock}
        >
          Savatga
        </button>
      </div>
    </div>
  )
}

// ─── Asosiy CatalogPage ──────────────────────────────────────────
export function CatalogPage() {
  usePageTitle('Baliqlar katalogi')
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const pushToast = useToastStore((state) => state.pushToast)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['fish', search, category],
    queryFn: () => fishService.list({ search, ...(category ? { category } : {}) }),
  })

  const categories = [...new Set((Array.isArray(data) ? data : []).map((f) => f.category).filter(Boolean))]

  const handleAdd = (fish) => {
    addItem({ id: fish.id, name: fish.name, price: fish.price, unit: fish.unit, quantity: 1, fish_id: fish.id })
    pushToast({ title: `${fish.name} savatchaga qo'shildi ✅`, variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Baliqlar katalogi</h2>
        <p className="mt-2 text-slate-500">Narx, vazn va ferma bo'yicha qidiruv.</p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              className="soft-input pl-10 w-full"
              placeholder="Baliq nomi bo'yicha qidirish"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {categories.length > 0 && (
            <select
              className="soft-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="glass-card h-64 animate-pulse" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">Baliq topilmadi</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(Array.isArray(data) ? data : []).map((fish) => (
            <FishCard
              key={fish.id}
              fish={fish}
              onAdd={handleAdd}
              onDetail={(id) => navigate(`/customer/product/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
