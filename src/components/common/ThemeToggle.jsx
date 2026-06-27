import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore.js'

export function ThemeToggle() {
  const theme  = useThemeStore(s => s.theme)
  const toggle = useThemeStore(s => s.toggleTheme)
  return (
    <button onClick={toggle} aria-label="Mavzuni almashtirish"
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:border-ocean-300 dark:hover:border-ocean-600/40 hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors">
      {theme === 'dark' ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
    </button>
  )
}
