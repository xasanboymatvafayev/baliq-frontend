import { Inbox } from 'lucide-react'

export function EmptyState({ icon, title = "Ma'lumot topilmadi", description = "Backend API ulanganda ma'lumotlar ko'rinadi.", action }) {
  return (
    <div className="glass-card flex min-h-64 flex-col items-center justify-center p-10 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.05]">
        {typeof icon === 'string'
          ? <span className="text-4xl leading-none">{icon}</span>
          : icon
            ? <span className="text-slate-400">{icon}</span>
            : <Inbox className="h-7 w-7 text-slate-400" />
        }
      </div>
      <h3 className="text-[16px] font-bold text-slate-700 dark:text-slate-300">{title}</h3>
      <p className="mt-1.5 max-w-[280px] text-[13px] leading-relaxed text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
