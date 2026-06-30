import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import { ToastHost } from './components/common/ToastHost.jsx'
import { useThemeStore } from './store/themeStore.js'
import { PwaInstallBanner } from './components/common/PwaInstallBanner.jsx'
import { OfflineBanner } from './components/common/OfflineBanner.jsx'
import { useI18nStore } from './store/i18nStore.js'
import { startKeepAlive, stopKeepAlive } from './services/api/keepAlive.js'

export default function App() {
  const theme = useThemeStore((state) => state.theme)
  const lang = useI18nStore((state) => state.lang)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    startKeepAlive()
    return () => stopKeepAlive()
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }, [])

  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastHost />
      <PwaInstallBanner />
      <OfflineBanner />
    </ErrorBoundary>
  )
}
