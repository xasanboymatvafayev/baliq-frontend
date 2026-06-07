import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../utils/cn.js'

export function StatCard({ title, value = '—', description, icon: Icon, tone = 'ocean' }) {
  const tones = {
    ocean: 'bg-ocean-50 text-ocean-700 dark:bg-ocean-500/10 dark:text-ocean-200',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200',
  }

  return (
    <article className="glass-card p-5 transition hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <span className={cn('rounded-2xl p-3', tones[tone])}>{Icon ? <Icon className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}</span>
      </div>
      {description ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
    </article>
  )
}
