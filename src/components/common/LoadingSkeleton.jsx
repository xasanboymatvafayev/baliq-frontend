import { cn } from '../../utils/cn.js'

export function LoadingSkeleton({ className }) {
  return <div className={cn('animate-pulse-soft rounded-2xl bg-slate-200 dark:bg-white/10', className)} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-28" />
      <div className="grid gap-4 md:grid-cols-4">
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
      </div>
      <LoadingSkeleton className="h-96" />
    </div>
  )
}
