import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { authService, httpClient } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { ExternalLink, RefreshCw } from 'lucide-react'

const schema = z.object({ otp: z.string().length(6, '6 xonali OTP kod kiriting') })

const ROLE_ROUTES = {
  'customer': '/customer/dashboard',
  'farm-owner': '/farm/dashboard',
  'driver': '/driver/dashboard',
  'admin': '/admin/dashboard',
  'manager': '/manager/dashboard',
  'super-admin': '/super-admin/system-statistics',
}

export function OtpVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const pushToast = useToastStore((s) => s.pushToast)
  const setSession = useAuthStore((s) => s.setSession)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [telegramLinked, setTelegramLinked] = useState(true)
  const [botLink, setBotLink] = useState('')
  const [botUsername, setBotUsername] = useState('BaliqSavdosiVerificationBot')
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  // State dan kelgan ma'lumotlar (ro'yxatdan o'tish paytida)
  const phone = location.state?.phone
  const via = location.state?.via
  const stateLinked = location.state?.linked
  const stateBotLink = location.state?.botLink

  useEffect(() => {
    // Agar state da linked ma'lumot kelgan bo'lsa, shuni ishlatamiz
    if (typeof stateLinked === 'boolean') {
      setTelegramLinked(stateLinked)
      if (stateBotLink) setBotLink(stateBotLink)
      setChecking(false)
      return
    }
    // Aks holda tekshiramiz
    if (phone) {
      httpClient.get(`/auth/check-telegram?phone=${encodeURIComponent(phone)}`)
        .then((data) => {
          setTelegramLinked(data.linked)
          setBotLink(data.bot_link || '')
          setBotUsername(data.bot_username || 'BaliqSavdosiVerificationBot')
        })
        .catch(() => setTelegramLinked(false))
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [phone, stateLinked, stateBotLink])

  const checkAgain = async () => {
    if (!phone) return
    setChecking(true)
    try {
      const data = await httpClient.get(`/auth/check-telegram?phone=${encodeURIComponent(phone)}`)
      setTelegramLinked(data.linked)
      setBotLink(data.bot_link || '')
      if (data.linked) {
        pushToast({ title: "Telegram ulandi! Endi OTP so'rashingiz mumkin.", variant: 'success' })
      }
    } catch { /* ignore */ }
    finally { setChecking(false) }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await authService.verifyOtp({ otp: data.otp, phone })
      if (result.token) {
        setSession({ user: result.user, role: result.role, token: result.token })
        // Pending farm yoki driver ro'yxatdan o'tish bor bo'lsa yuboramiz
        if (location.state?.pendingFarm) {
          const farmData = JSON.parse(localStorage.getItem('pending-farm-registration') || '{}')
          if (farmData.farmName) {
            try {
              await httpClient.post('/farms', farmData)
              localStorage.removeItem('pending-farm-registration')
              pushToast({ title: "Ferma so'rovi yuborildi! Admin tasdiqlashini kuting.", variant: 'success' })
            } catch { /* ignore farm error */ }
          }
        }
        if (location.state?.pendingDriver) {
          const driverData = JSON.parse(localStorage.getItem('pending-driver-registration') || '{}')
          if (driverData.carBrand) {
            try {
              const u = result.user
              await httpClient.post('/drivers', { ...driverData, firstName: u.firstName, lastName: u.lastName, phone: u.phone })
              localStorage.removeItem('pending-driver-registration')
              pushToast({ title: "Haydovchi so'rovi yuborildi! Admin tasdiqlashini kuting.", variant: 'success' })
            } catch { /* ignore */ }
          }
        }
        const redirect = location.state?.redirect
        pushToast({ title: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", variant: 'success' })
        navigate(redirect || ROLE_ROUTES[result.role] || '/customer/dashboard')
      } else if (result.reset_token) {
        pushToast({ title: 'OTP tasdiqlandi', variant: 'success' })
        navigate('/reset-password', { state: { reset_token: result.reset_token } })
      }
    } catch (err) {
      pushToast({ title: err.message || "OTP noto'g'ri", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <AuthFormShell title="OTP Tasdiqlash" description="Telegram tekshirilmoqda...">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent" />
        </div>
      </AuthFormShell>
    )
  }

  // Telegram ulanmagan — yo'riqnoma ko'rsatamiz
  if (!telegramLinked) {
    return (
      <AuthFormShell
        title="Telegram bilan ulaning"
        description="OTP kodni qabul qilish uchun Telegram botimizni ishga tushirishingiz kerak."
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3">📱 Qanday ulash kerak?</p>
            <ol className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
              <li className="flex gap-2"><span className="font-bold shrink-0">1.</span> Quyidagi tugmani bosing va Telegram oching</li>
              <li className="flex gap-2"><span className="font-bold shrink-0">2.</span> Botda "START" tugmasini bosing</li>
              <li className="flex gap-2"><span className="font-bold shrink-0">3.</span> Botga <b>Start</b> bosgandan so'ng qaytib keling</li>
              <li className="flex gap-2"><span className="font-bold shrink-0">4.</span> "Tekshirish" tugmasini bosing</li>
            </ol>
          </div>

          <a
            href={botLink || `https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button w-full flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Telegram botni ochish (@{botUsername})
          </a>

          <button
            className="secondary-button w-full flex items-center justify-center gap-2"
            onClick={checkAgain}
            disabled={checking}
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            Ulanishni tekshirish
          </button>

          <p className="text-center text-xs text-slate-500">
            Botni ishga tushirgandan so'ng "Tekshirish" tugmasini bosing
          </p>
        </div>
      </AuthFormShell>
    )
  }

  // Telegram ulangan — OTP kiritish
  return (
    <AuthFormShell title="OTP Tasdiqlash" description="Telegram botga yuborilgan 6 xonali kodni kiriting.">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/30">
        <svg className="h-8 w-8 shrink-0 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.02 9.52c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.883.701z"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">OTP Telegram botga yuborildi</p>
          <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer"
            className="text-xs text-sky-600 underline dark:text-sky-400">
            @{botUsername} ni oching
          </a>
        </div>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="OTP kod" inputMode="numeric" maxLength="6" placeholder="000000"
          {...register('otp')} error={formState.errors.otp?.message} />
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
        </button>
      </form>
    </AuthFormShell>
  )
}
