import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, X, Loader2 } from 'lucide-react'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { useT } from '../../store/i18nStore.js'

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`h-9 w-9 transition-colors ${
              s <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-slate-200 dark:text-white/10'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-bold text-slate-500">
        {value === 5 ? '⭐ A\'lo!' : value === 4 ? '😊 Yaxshi' : value === 3 ? '😐 O\'rtacha' : value === 2 ? '😕 Yomon' : value === 1 ? '😞 Juda yomon' : ''}
      </span>
    </div>
  )
}

export function ReviewModal({ open, onClose, orderId, farmId, driverId, orderNum }) {
  const t = useT()
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [farmRating, setFarmRating] = useState(0)
  const [driverRating, setDriverRating] = useState(0)
  const [comment, setComment] = useState('')

  const mutation = useMutation({
    mutationFn: () => httpClient.post('/reviews', {
      order_id: orderId,
      farm_id: farmId,
      driver_id: driverId,
      farm_rating: farmId ? farmRating : undefined,
      driver_rating: driverId ? driverRating : undefined,
      comment: comment.trim() || undefined,
    }),
    onSuccess: () => {
      pushToast({ title: t.reviewSuccess, variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      queryClient.invalidateQueries(['fish'])
      onClose()
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const canSubmit = (farmId ? farmRating > 0 : true) && (driverId ? driverRating > 0 : true)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="glass-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">{t.reviewTitle}</h3>
            {orderNum && <p className="text-sm text-slate-400 mt-0.5">#{orderNum}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {farmId && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              🏡 {t.farmRating}
            </p>
            <StarPicker value={farmRating} onChange={setFarmRating} />
          </div>
        )}

        {driverId && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              🚚 {t.driverRating}
            </p>
            <StarPicker value={driverRating} onChange={setDriverRating} />
          </div>
        )}

        <div className="space-y-2">
          <textarea
            className="soft-input w-full resize-none min-h-[80px]"
            placeholder={t.reviewPlaceholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-slate-400 text-right">{comment.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button className="secondary-button flex-1" onClick={onClose} disabled={mutation.isPending}>
            Bekor qilish
          </button>
          <button
            className="primary-button flex-1 flex items-center justify-center gap-2"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            {t.reviewSubmit}
          </button>
        </div>
      </div>
    </div>
  )
}
