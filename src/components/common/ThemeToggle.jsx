import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore.js'

export function ThemeToggle() {
  const theme = useThemeStore(s=>s.theme)
  const toggle = useThemeStore(s=>s.toggleTheme)
  return (
    <button
      onClick={toggle}
      aria-label="Mavzuni almashtirish"
      style={{
        width:36, height:36, borderRadius:10,
        border:'1.5px solid var(--border)',
        background:'var(--surface)',
        color:'var(--text-2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', transition:'all 0.15s', flexShrink:0,
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(14,165,233,0.35)';e.currentTarget.style.color='var(--brand)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-2)'}}
    >
      {theme==='dark'
        ? <Sun  style={{ width:16, height:16 }}/>
        : <Moon style={{ width:16, height:16 }}/>}
    </button>
  )
}
