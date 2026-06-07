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

  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastHost />
    </ErrorBoundary>
  )
}
