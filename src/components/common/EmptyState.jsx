import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Ma’lumot topilmadi', description = 'Backend API ulanganda ma’lumotlar ko‘rinadi.' }) {
  return (
    <div className="glass-card flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <div className="rounded-3xl bg-ocean-50 p-4 text-ocean-600 dark:bg-ocean-500/10">
        <Inbox className="h-10 w-10" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}
