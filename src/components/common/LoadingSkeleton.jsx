import { cn } from '../../utils/cn.js'

export function LoadingSkeleton({ className }) {
  return <div className={cn('skeleton', className)} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero skeleton */}
      <div className="skeleton h-[148px] rounded-2xl" />
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="skeleton h-11 w-11 rounded-2xl" />
              <div className="skeleton h-6 w-14 rounded-full" />
            </div>
            <div className="skeleton h-3 w-20 rounded mb-2" />
            <div className="skeleton h-8 w-28 rounded" />
            <div className="skeleton mt-4 h-0.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="skeleton h-80 rounded-2xl" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="skeleton h-5 w-40 rounded" />
      </div>
      <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className={`skeleton h-4 rounded flex-1 ${j === 0 ? 'max-w-[80px]' : ''}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <div className="skeleton h-36 rounded-xl" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-5 w-1/2 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-9 flex-1 rounded-xl" />
            <div className="skeleton h-9 flex-1 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
