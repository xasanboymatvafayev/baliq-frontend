import { Inbox } from 'lucide-react'

export function EmptyState({
  icon = null,
  title = "Ma'lumot topilmadi",
  description = 'Backend API ulanganda ma\'lumotlar ko\'rinadi.',
  action = null,
}) {
  return (
    <div className="glass-card flex min-h-64 flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="rounded-3xl bg-ocean-50 p-4 text-ocean-600 dark:bg-ocean-500/10">
        {icon ? <span className="text-4xl leading-none">{icon}</span> : <Inbox className="h-10 w-10" />}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
