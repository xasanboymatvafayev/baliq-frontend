import { Bell, Menu, Search, UserCircle } from 'lucide-react'
import { ThemeToggle } from '../common/ThemeToggle.jsx'

export function Topbar({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:px-6">
      <div className="flex items-center gap-4">
        <button className="secondary-button px-3 lg:hidden" onClick={onMenuClick} aria-label="Menyuni ochish">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">Boshqaruv paneli</p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{title}</h1>
        </div>
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input className="soft-input pl-10" placeholder="Qidirish..." />
          </div>
        </div>
        <ThemeToggle />
        <button className="secondary-button px-3" aria-label="Bildirishnomalar">
          <Bell className="h-5 w-5" />
        </button>
        <button className="secondary-button px-3" aria-label="Profil">
          <UserCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
