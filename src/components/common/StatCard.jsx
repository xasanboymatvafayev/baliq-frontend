const TONES = {
  ocean:   { from:'from-sky-500',    to:'to-blue-600',     glow:'shadow-sky-500/25',    soft:'bg-sky-50 dark:bg-sky-500/10',    bar:'from-sky-500 to-blue-600' },
  emerald: { from:'from-emerald-500',to:'to-teal-600',     glow:'shadow-emerald-500/25',soft:'bg-emerald-50 dark:bg-emerald-500/10', bar:'from-emerald-500 to-teal-600' },
  amber:   { from:'from-amber-500',  to:'to-orange-500',   glow:'shadow-amber-500/25',  soft:'bg-amber-50 dark:bg-amber-500/10',  bar:'from-amber-500 to-orange-500' },
  rose:    { from:'from-rose-500',   to:'to-pink-600',     glow:'shadow-rose-500/25',   soft:'bg-rose-50 dark:bg-rose-500/10',   bar:'from-rose-500 to-pink-600' },
  purple:  { from:'from-purple-500', to:'to-violet-600',   glow:'shadow-purple-500/25', soft:'bg-purple-50 dark:bg-purple-500/10',bar:'from-purple-500 to-violet-600' },
}

export function StatCard({ title, value = '—', description, icon: Icon, tone = 'ocean', trend }) {
  const t = TONES[tone] || TONES.ocean
  return (
    <article className="glass-card p-5 select-none">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${t.from} ${t.to} text-white shadow-lg ${t.glow} transition-transform duration-200 hover:scale-110 hover:-rotate-3`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trend != null && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${t.soft}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1.5">{title}</p>
      <p className="text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">{value}</p>
      {description && <p className="mt-1.5 text-[13px] text-slate-400 dark:text-slate-600">{description}</p>}
      <div className={`mt-4 h-0.5 w-full rounded-full bg-gradient-to-r ${t.bar} opacity-30`} />
    </article>
  )
}
