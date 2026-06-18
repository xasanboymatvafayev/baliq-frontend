import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore.js'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <button className="secondary-button px-3" onClick={toggleTheme} aria-label="Mavzuni almashtirish">
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
