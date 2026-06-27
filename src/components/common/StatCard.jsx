import { TrendingUp } from 'lucide-react'

const toneStyles = {
  ocean: {
    bg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    glow: 'rgba(14,165,233,0.25)',
    soft: 'rgba(14,165,233,0.08)',
    softText: '#0ea5e9',
    softBorder: 'rgba(14,165,233,0.15)',
  },
  emerald: {
    bg: 'linear-gradient(135deg, #10b981, #059669)',
    glow: 'rgba(16,185,129,0.25)',
    soft: 'rgba(16,185,129,0.08)',
    softText: '#10b981',
    softBorder: 'rgba(16,185,129,0.15)',
  },
  amber: {
    bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: 'rgba(245,158,11,0.25)',
    soft: 'rgba(245,158,11,0.08)',
    softText: '#f59e0b',
    softBorder: 'rgba(245,158,11,0.15)',
  },
  rose: {
    bg: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    glow: 'rgba(244,63,94,0.25)',
    soft: 'rgba(244,63,94,0.08)',
    softText: '#f43f5e',
    softBorder: 'rgba(244,63,94,0.15)',
  },
  purple: {
    bg: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    glow: 'rgba(168,85,247,0.25)',
    soft: 'rgba(168,85,247,0.08)',
    softText: '#a855f7',
    softBorder: 'rgba(168,85,247,0.15)',
  },
}

export function StatCard({ title, value = '—', description, icon: Icon, tone = 'ocean', trend }) {
  const t = toneStyles[tone] || toneStyles.ocean

  return (
    <article
      className="glass-card p-5 group cursor-default select-none"
      style={{ transition: 'all 0.2s ease' }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110"
          style={{ background: t.bg, boxShadow: `0 4px 12px ${t.glow}` }}
        >
          {Icon ? <Icon className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
        </div>

        {/* Trend badge */}
        {trend != null && (
          <div
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: t.soft, color: t.softText, border: `1px solid ${t.softBorder}` }}
          >
            <TrendingUp className="h-3 w-3" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
        <p className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
        {description && (
          <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-500">{description}</p>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="mt-4 h-0.5 w-full rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: t.bg }}
      />
    </article>
  )
}
