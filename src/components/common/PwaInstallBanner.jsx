import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export function PwaInstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Check if prompt was already deferred
    if (window.__pwaInstallPrompt) setPrompt(window.__pwaInstallPrompt)

    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed || dismissed || !prompt) return null

  const handleInstall = async () => {
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') setInstalled(true)
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="glass-card p-4 shadow-xl border border-ocean-200/50 dark:border-ocean-800/50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 text-white">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Ilovani o'rnating</p>
            <p className="mt-0.5 text-xs text-slate-500">Telefon ekraniga qo'shing va offline ishlating</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setDismissed(true)} className="secondary-button flex-1 text-xs py-2">
            Keyinroq
          </button>
          <button onClick={handleInstall} className="primary-button flex-1 text-xs py-2">
            <Download className="h-3.5 w-3.5" /> O'rnatish
          </button>
        </div>
      </div>
    </div>
  )
}
