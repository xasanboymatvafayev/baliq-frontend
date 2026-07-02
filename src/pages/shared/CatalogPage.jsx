import { useQuery } from '@tanstack/react-query'
import { Search, Star, ShoppingCart, Eye, Package, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fishService } from '../../services/api/index.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency } from '../../utils/formatters.js'
import { CardSkeleton } from '../../components/common/LoadingSkeleton.jsx'
import { useT } from '../../store/i18nStore.js'

function StarRating({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} style={{ width: 12, height: 12 }}
          className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-200 dark:text-white/10'} />
      ))}
      <span className="text-[11px] font-medium text-slate-400 ml-0.5">
        {rating > 0 ? rating.toFixed(1) : 'Yangi'}{count > 0 && ` (${count})`}
      </span>
    </div>
  )
}

function FishCard({ fish, onAdd, onDetail }) {
  const t = useT()
  const [hovered, setHovered] = useState(false)
  const rating      = fish.farm_rating || fish.farm?.rating || 0
  const ratingCount = fish.farm_rating_count || fish.farm?.rating_count || 0
  const farmName    = fish.farm_name || fish.farm?.farmName || ''
  const inStock     = fish.stock > 0

  return (
    <div
      className="glass-card flex flex-col overflow-hidden group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDetail(fish.id)}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/10">
        {fish.image_url
          ? <img src={fish.image_url} alt={fish.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="flex h-full w-full items-center justify-center">
              <span className="text-6xl transition-transform duration-300 group-hover:scale-110">🐟</span>
            </div>
        }
        {/* Rating badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full border border-amber-200/80 dark:border-amber-700/50 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            {rating > 0 ? rating.toFixed(1) : 'Yangi'}
          </span>
        </div>
        {/* Stock badge */}
        {inStock && fish.stock <= 20 && (
          <div className="absolute top-2.5 right-2.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
            Kam: {fish.stock}{fish.unit}
          </div>
        )}
        {/* Out of stock */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[12px] font-bold text-white">{t.outOfStock}</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm transition-all duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg hover:bg-white transition-colors"
            onClick={e => { e.stopPropagation(); onDetail(fish.id) }}
          >
            <Eye className="h-4 w-4" />
          </button>
          {inStock && (
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition-colors"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}
              onClick={e => { e.stopPropagation(); onAdd(fish) }}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">{fish.category}</span>
        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">{fish.name}</h3>
        {farmName && (
          <p className="mt-0.5 text-[12px] text-slate-400 flex items-center gap-1">🏡 {farmName}</p>
        )}
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[18px] font-extrabold text-sky-600 dark:text-sky-400 leading-none">{formatCurrency(fish.price)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.per}{fish.unit}</p>
          </div>
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Package className="h-3 w-3" />{fish.stock} {fish.unit}
          </p>
        </div>
        <div className="mt-2">
          <StarRating rating={rating} count={ratingCount} />
        </div>
        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <button
            className="secondary-button flex-1 text-[13px] py-2"
            onClick={e => { e.stopPropagation(); onDetail(fish.id) }}
          >{t.detail}</button>
          <button
            className="primary-button flex-1 text-[13px] py-2"
            onClick={e => { e.stopPropagation(); onAdd(fish) }}
            disabled={!inStock}
          >
            <ShoppingCart className="h-3.5 w-3.5" /> {t.addToCart}
          </button>
        </div>
      </div>
    </div>
  )
}

const SORT_OPTIONS = [
  { value: '', labelKey: 'all' },
  { value: 'price_asc', labelKey: 'priceAsc' },
  { value: 'price_desc', labelKey: 'priceDesc' },
  { value: 'rating_desc', labelKey: 'ratingDesc' },
]

export function CatalogPage() {
  const t = useT()
  usePageTitle(t.catalog)
  const navigate  = useNavigate()
  const addItem   = useCartStore(s => s.addItem)
  const pushToast = useToastStore(s => s.pushToast)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort]         = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: ['fish', search, category],
    queryFn: () => fishService.list({ search, ...(category ? { category } : {}) }),
  })

  const rawList  = Array.isArray(data) ? data : []
  const categories = [...new Set(rawList.map(f => f.category).filter(Boolean))]

  const fishList = useMemo(() => {
    let list = [...rawList]
    // Price range
    if (minPrice !== '') list = list.filter(f => f.price >= Number(minPrice))
    if (maxPrice !== '') list = list.filter(f => f.price <= Number(maxPrice))
    // Sort
    if (sort === 'price_asc')   list.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc')  list.sort((a, b) => b.price - a.price)
    if (sort === 'rating_desc') list.sort((a, b) => (b.farm_rating || 0) - (a.farm_rating || 0))
    return list
  }, [rawList, sort, minPrice, maxPrice])

  const hasActiveFilter = sort || minPrice || maxPrice || category

  const handleAdd = fish => {
    addItem({
      id: fish.id,
      fish_id: fish.id,
      name: fish.name,
      price: fish.price,
      unit: fish.unit,
      quantity: 1,
      stock: fish.stock ?? null,
      image_url: fish.image_url || null,
    })
    pushToast({ title: `${fish.name} savatchaga qo'shildi ✅`, variant: 'success' })
  }

  const clearFilters = () => { setSort(''); setMinPrice(''); setMaxPrice(''); setCategory('') }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.catalog}</h2>
            <p className="text-[14px] text-slate-400 mt-0.5">
              {isLoading ? 'Yuklanmoqda...' : `${fishList.length} ta baliq topildi`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end min-w-0 max-w-sm">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="soft-input h-10 pl-9 w-full text-[13.5px]"
                placeholder={t.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 h-10 px-3 rounded-2xl border font-semibold text-sm transition-all ${
                showFilters || hasActiveFilter
                  ? 'bg-ocean-500 text-white border-ocean-500 shadow-md shadow-ocean-500/25'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilter && <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />}
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4 animate-fade-in">
            <div className="flex flex-wrap gap-3">
              {/* Sort */}
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> {t.sortBy}
                </label>
                <select className="soft-input h-9 text-sm w-full" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="">{t.all}</option>
                  <option value="price_asc">{t.priceAsc}</option>
                  <option value="price_desc">{t.priceDesc}</option>
                  <option value="rating_desc">{t.ratingDesc}</option>
                </select>
              </div>
              {/* Min price */}
              <div className="flex-1 min-w-[120px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">{t.minPrice}</label>
                <input
                  type="number"
                  className="soft-input h-9 text-sm w-full"
                  placeholder="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                />
              </div>
              {/* Max price */}
              <div className="flex-1 min-w-[120px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">{t.maxPrice}</label>
                <input
                  type="number"
                  className="soft-input h-9 text-sm w-full"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            {hasActiveFilter && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition">
                <X className="h-3.5 w-3.5" /> Filtrlarni tozalash
              </button>
            )}
          </div>
        )}

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                !category ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
              }`}
            >{t.all}</button>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                  category === c ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                }`}
              >{c}</button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <CardSkeleton count={8} />
      ) : fishList.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.05]">
            <span className="text-4xl">🐟</span>
          </div>
          <p className="text-[16px] font-bold text-slate-500">Baliq topilmadi</p>
          <p className="mt-1 text-[13px] text-slate-400">Boshqa kalit so'z yoki filtr bilan qidiring</p>
          <button onClick={() => { setSearch(''); clearFilters() }} className="secondary-button mt-4">
            <X className="h-4 w-4" /> Tozalash
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fishList.map(fish => (
            <FishCard key={fish.id} fish={fish} onAdd={handleAdd} onDetail={id => navigate(`/customer/product/${id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
