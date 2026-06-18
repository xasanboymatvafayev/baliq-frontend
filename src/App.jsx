import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import { ToastHost } from './components/common/ToastHost.jsx'
import { useThemeStore } from './store/themeStore.js'

export default function App() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // ✅ GPS ruxsatini sahifa ochilganda darhol so'rash
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          console.log('✅ GPS ruxsati berildi')
        },
        (error) => {
          console.warn('⚠️ GPS ruxsati rad etildi:', error.message)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }, [])

  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastHost />
    </ErrorBoundary>
  )
}


