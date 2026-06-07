import { CheckCircle2, Circle, Truck } from 'lucide-react'
import { ORDER_STATUSES } from '../../types/entities.js'
import { cn } from '../../utils/cn.js'

const statusLabels = {
  PENDING: 'Kutilmoqda',
  CONFIRMED: 'Tasdiqlandi',
  DRIVER_ASSIGNED: 'Haydovchi biriktirildi',
  LOADING: 'Yuklanmoqda',
  IN_TRANSIT: 'Yo‘lda',
  DELIVERED: 'Yetkazildi',
  CANCELLED: 'Bekor qilindi',
}

export function OrderTimeline({ currentStatus = 'PENDING' }) {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus)

  return (
    <div className="glass-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-2xl bg-ocean-50 p-3 text-ocean-700 dark:bg-ocean-500/10">
          <Truck className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-lg font-bold">Buyurtma status timeline</h3>
          <p className="text-sm text-slate-500">PENDING → DELIVERED jarayoni professional ko‘rinishda</p>
        </div>
      </div>
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ORDER_STATUSES.map((status, index) => {
          const isDone = index <= currentIndex && currentStatus !== 'CANCELLED'
          const isCurrent = status === currentStatus
          return (
            <li
              key={status}
              className={cn(
                'rounded-3xl border p-4 transition',
                isCurrent
                  ? 'border-ocean-300 bg-ocean-50 shadow-glow dark:border-ocean-500/40 dark:bg-ocean-500/10'
                  : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/5',
              )}
            >
              <div className="flex items-start gap-3">
                {isDone || isCurrent ? (
                  <CheckCircle2 className="h-6 w-6 text-ocean-600" />
                ) : (
                  <Circle className="h-6 w-6 text-slate-300" />
                )}
                <div>
                  <p className="font-bold">{statusLabels[status]}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{status}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
