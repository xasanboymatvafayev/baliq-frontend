import { ShoppingCart, ArrowLeft, Star, MapPin, Phone, CheckCircle2 } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fishService, httpClient } from '../../services/api/index.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { formatCurrency } from '../../utils/formatters.js'

// ─── Yulduz reyting input ────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition"
        >
          <Star
            className="h-7 w-7 transition"
            style={{
              fill: s <= (hover || value) ? '#f59e0b' : 'transparent',
              color: s <= (hover || value) ? '#f59e0b' : '#cbd5e1',
            }}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Yulduz ko'rsatish ───────────────────────────────────────────
function StarDisplay({ rating = 0, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{
            width: size, height: size,
            fill: s <= Math.round(rating) ? '#f59e0b' : 'transparent',
            color: s <= Math.round(rating) ? '#f59e0b' : '#cbd5e1',
          }}
        />
      ))}
    </div>
  )
}

// ─── Asosiy sahifa ───────────────────────────────────────────────
export function ProductDetailPage() {
  usePageTitle('Mahsulot tafsiloti')
  const { id } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const pushToast = useToastStore((s) => s.pushToast)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const queryClient = useQueryClient()
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [reviewSent, setReviewSent] = useState(false)

  const { data: fish, isLoading, error } = useQuery({
    queryKey: ['fish', id],
    queryFn: () => fishService.detail(id),
    enabled: !!id,
  })

  // Sharhlar
  const { data: reviews = [] } = useQuery({
    queryKey: ['fish-reviews', id],
    queryFn: () => httpClient.get(`/fish/${id}/reviews`),
    enabled: !!id,
  })

  // Ferma ma'lumotlari
  const farmId = fish?.farm_id || fish?.farm?.id
  const { data: farm } = useQuery({
    queryKey: ['farm-detail', farmId],
    queryFn: () => httpClient.get(`/farms/${farmId}`),
    enabled: !!farmId,
  })

  // Sharh yuborish
  const reviewMutation = useMutation({
    mutationFn: () => httpClient.post(`/fish/${id}/reviews`, {
      rating: myRating,
      comment: myComment,
    }),
    onSuccess: () => {
      setReviewSent(true)
      setMyRating(0)
      setMyComment('')
      pushToast({ title: 'Reytingiz qabul qilindi ✅', variant: 'success' })
      queryClient.invalidateQueries(['fish-reviews', id])
      queryClient.invalidateQueries(['fish', id])
    },
    onError: (err) => pushToast({ title: err?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const handleAdd = () => {
    if (!fish) return
    addItem({ id: fish.id, name: fish.name, price: fish.price, unit: fish.unit, quantity: 1, fish_id: fish.id })
    pushToast({ title: `${fish.name} savatchaga qo'shildi ✅`, variant: 'success' })
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length)
    : (fish?.farm_rating || 0)

  if (isLoading) return (
    <div className="space-y-6">
      <div className="glass-card h-96 animate-pulse" />
      <div className="glass-card h-48 animate-pulse" />
    </div>
  )

  if (error || !fish) return (
    <div className="glass-card p-12 text-center">
      <p className="text-slate-500">Mahsulot topilmadi.</p>
      <button className="primary-button mt-4" onClick={() => navigate(-1)}>Orqaga</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <button className="secondary-button inline-flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Orqaga
      </button>

      {/* ─── Baliq ma'lumotlari ─── */}
      <section className="glass-card grid gap-6 p-6 lg:grid-cols-[380px_1fr]">
        {/* Rasm */}
        <div className="flex min-h-72 items-center justify-center rounded-3xl bg-gradient-to-br from-ocean-100 to-emerald-100 dark:from-ocean-900/40 dark:to-emerald-900/20 overflow-hidden">
          {fish.image_url ? (
            <img src={fish.image_url} alt={fish.name} className="h-full w-full object-cover rounded-3xl" />
          ) : (
            <span className="text-9xl">🐟</span>
          )}
        </div>

        {/* Malumotlar */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ocean-600">{fish.category || 'Baliq'}</p>
            <h2 className="mt-2 text-4xl font-black">{fish.name}</h2>
            {(fish.farm_name || farm?.farmName) && (
              <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                🏡 {fish.farm_name || farm?.farmName}
              </p>
            )}
          </div>

          {/* Reyting */}
          <div className="flex items-center gap-3">
            <StarDisplay rating={avgRating} size={20} />
            <span className="font-black text-lg text-amber-500">
              {avgRating > 0 ? avgRating.toFixed(1) : 'Yangi'}
            </span>
            <span className="text-sm text-slate-500">
              {reviews.length > 0 ? `${reviews.length} ta sharh` : 'Hali sharh yo\'q'}
            </span>
          </div>

          {fish.description && (
            <p className="text-slate-500 leading-relaxed">{fish.description}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <p className="text-xs text-slate-500">Narx</p>
              <p className="text-xl font-black text-ocean-600">{formatCurrency(fish.price)}/{fish.unit}</p>
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
            className="primary-button flex items-center gap-2 text-lg px-8 py-3"
            onClick={handleAdd}
            disabled={!fish.stock || fish.stock <= 0}
          >
            <ShoppingCart className="h-5 w-5" />
            {fish.stock > 0 ? "Savatchaga qo'shish" : "Zaxirada yo'q"}
          </button>
        </div>
      </section>

      {/* ─── Ferma haqida ─── */}
      {(farm || fish.farm) && (
        <section className="glass-card p-6 space-y-4">
          <h3 className="text-xl font-black">🏡 Ferma haqida</h3>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            {/* Ferma rasmlari */}
            <div className="flex gap-2 flex-wrap">
              {(() => {
                // farmImage (tekshirish tartibi): images -> image_urls -> farmImage (yakka rasm)
                const farmImgs = farm?.images || farm?.image_urls ||
                  (farm?.farmImage ? [farm.farmImage] : [])
                return farmImgs.slice(0, 3).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Ferma"
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ))
              })()}
              {!((farm?.images || farm?.image_urls || (farm?.farmImage ? [farm.farmImage] : [])).length) && (
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/20 flex items-center justify-center text-4xl">
                  🏡
                </div>
              )}
            </div>

            {/* Ferma ma'lumotlari */}
            <div className="space-y-2">
              <h4 className="text-lg font-black">{farm?.farmName || fish.farm?.farmName || '—'}</h4>

              {(farm?.farmAddress || farm?.location) && (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {farm?.farmAddress || farm?.location}
                </p>
              )}

              {(farm?.phone || farm?.owner_phone) && (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="h-4 w-4 shrink-0" />
                  {farm?.phone || farm?.owner_phone}
                </p>
              )}

              {farm?.description && (
                <p className="text-sm text-slate-500 leading-relaxed">{farm.description}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <StarDisplay rating={avgRating} size={15} />
                <span className="text-sm font-bold text-amber-500">
                  {avgRating > 0 ? avgRating.toFixed(1) : 'Yangi ferma'}
                </span>
                <span className="text-xs text-slate-400">• {reviews.length} ta sharh</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Sharhlar ─── */}
      <section className="glass-card p-6 space-y-5">
        <h3 className="text-xl font-black">💬 Sharhlar va reyting</h3>

        {/* Sharh yozish (faqat customer) */}
        {(role === 'customer' || role === 'farm-owner') && !reviewSent && (
          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 space-y-3 border border-slate-200 dark:border-white/10">
            <p className="font-bold text-sm">Ferma reytingini qo'ying:</p>
            <StarInput value={myRating} onChange={setMyRating} />
            <textarea
              className="soft-input w-full resize-none"
              rows={3}
              placeholder="Izohlangiz (ixtiyoriy)..."
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
            />
            <button
              className="primary-button"
              onClick={() => reviewMutation.mutate()}
              disabled={!myRating || reviewMutation.isPending}
            >
              {reviewMutation.isPending ? 'Yuborilmoqda...' : '⭐ Reyting qo\'yish'}
            </button>
          </div>
        )}

        {reviewSent && (
          <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">Reytingiz qabul qilindi!</p>
          </div>
        )}

        {/* Sharhlar ro'yxati */}
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <div className="text-4xl mb-2">💬</div>
            Hali sharh yo'q. Birinchi bo'ling!
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center text-sm font-black text-ocean-700">
                      {(r.user_name || r.firstName || 'M').slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm">{r.user_name || r.firstName || 'Mijoz'}</span>
                  </div>
                  <StarDisplay rating={r.rating} size={14} />
                </div>
                {r.comment && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 pl-10">{r.comment}</p>
                )}
                <p className="text-xs text-slate-400 pl-10">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('uz') : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
