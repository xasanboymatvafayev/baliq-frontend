import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { authService } from '../../services/api/index.js'

const ROLE_ROUTES = {
  'customer': '/customer/dashboard', 'farm-owner': '/farm/dashboard',
  'driver': '/driver/dashboard', 'admin': '/admin/dashboard',
  'manager': '/manager/dashboard', 'super-admin': '/super-admin/system-statistics',
}

export function TelegramLinkPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pushToast = useToastStore((s) => s.pushToast)
  const setSession = useAuthStore((s) => s.setSession)

  const phone = searchParams.get('phone') || ''
  const flow = searchParams.get('flow') || 'register'
  const firstName = searchParams.get('firstName') || ''
  const lastName = searchParams.get('lastName') || ''
  const password = searchParams.get('password') || ''

  const phoneEncoded = phone.replace('+', '').replace(/\s/g, '')
  const botLink = `https://t.me/BaliqSavdosiVerificationBot?start=${phoneEncoded}`

  const [checking, setChecking] = useState(false)
  const [notLinked, setNotLinked] = useState(false)

  const handleConfirm = async () => {
    setChecking(true)
    setNotLinked(false)
    try {
      const tg = await authService.checkTelegram(phone)
      if (!tg.linked) { setNotLinked(true); return }
      if (flow === 'register') {
        await authService.register({ firstName, lastName, phone, password })
      } else {
        await authService.forgotPassword({ phone })
      }
      pushToast({ title: 'OTP Telegram botga yuborildi!', variant: 'success' })
      navigate('/otp-verification')
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
            <svg className="h-9 w-9 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.02 9.52c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.883.701z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black">Telegram orqali tasdiqlash</h1>
          <p className="mt-2 text-sm text-slate-500">OTP kodlar Telegram bot orqali yuboriladi</p>
        </div>

        <div className="glass-card space-y-5 p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3 dark:bg-white/5">
            <span className="text-lg">📱</span>
            <div>
              <p className="text-xs text-slate-500">Telefon raqamingiz</p>
              <p className="font-bold">{phone}</p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
            <span className="mt-0.5 text-amber-500">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Telegram bot bilan bog'lanmagan</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">OTP olish uchun avval Telegram botimizga o'ting</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold">Qanday ro'yxatdan o'tish kerak:</p>
            {[
              "Quyidagi tugmani bosib botga o'ting",
              'Bot avtomatik raqamingizni ulaydi',
              'Botda "Start" tugmasini bosing',
              "Bu sahifaga qaytib \"Ro'yxatdan o'tdim\" ni bosing",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean-100 text-xs font-bold text-ocean-700 dark:bg-ocean-900/40 dark:text-ocean-300">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm text-slate-600 dark:text-slate-400">{step}</p>
              </div>
            ))}
          </div>

          <a href={botLink} target="_blank" rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-sky-500 py-3 font-bold text-white transition hover:bg-sky-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.02 9.52c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.883.701z"/>
            </svg>
            @BaliqSavdosiVerificationBot ga o'tish
          </a>

          {notLinked && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
              <span>❌</span>
              <span>Siz hali ro'yxatdan o'tmagansiz. Bot orqali boshlang.</span>
            </div>
          )}

          <button onClick={handleConfirm} disabled={checking} className="primary-button w-full">
            {checking ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Tekshirilmoqda...
              </span>
            ) : "✅ Ro'yxatdan o'tdim"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-slate-500 hover:text-ocean-600">← Kirishga qaytish</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
