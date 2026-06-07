import { ThemeToggle } from '../../components/common/ThemeToggle.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function SettingsPage({ title = 'Sozlamalar' }) {
  usePageTitle(title)
  return (
    <section className="glass-card max-w-3xl p-6">
      <h2 className="text-3xl font-black">{title}</h2>
      <p className="mt-2 text-slate-500">Dark/Light mode, bildirishnomalar va tizim sozlamalari.</p>
      <div className="mt-6 flex items-center justify-between rounded-3xl bg-slate-100 p-4 dark:bg-white/5">
        <div>
          <p className="font-bold">Interfeys mavzusi</p>
          <p className="text-sm text-slate-500">Light yoki Dark mode tanlang</p>
        </div>
        <ThemeToggle />
      </div>
    </section>
  )
}
