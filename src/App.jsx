import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import { ToastHost } from './components/common/ToastHost.jsx'
import { useThemeStore } from './store/themeStore.js'
import { PwaInstallBanner } from './components/common/PwaInstallBanner.jsx'

export default function App() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        (error) => console.warn('GPS:', error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }, [])

  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastHost />
      <PwaInstallBanner />
    </ErrorBoundary>
  )
}
