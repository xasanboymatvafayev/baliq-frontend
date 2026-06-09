import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { useState, useEffect, useRef, useCallback } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { authService, httpClient } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { ExternalLink, RefreshCw } from 'lucide-react'

const schema = z.object({ otp: z.string().length(6, '6 xonali OTP kod kiriting') })

const OTP_DURATION = 30 // 30 soniya

export function OtpVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const pushToast = useToastStore((s) => s.pushToast)
  const setSession = useAuthStore((s) => s.setSession)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(true)
  const [telegramLinked, setTelegramLinked] = useState(true)
  const [botLink, setBotLink] = useState('')
  const [botUsername, setBotUsername] = useState('BaliqSavdosiVerificationBot')
  const [countdown, setCountdown] = useState(OTP_DURATION)
  const timerRef = useRef(null)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  // State dan kelgan ma'lumotlar
  const phone = location.state?.phone
  const userId = location.state?.userId
  const stateLinked = location.state?.linked
  const stateBotLink = location.state?.botLink

  // Countdown timer
  const startCountdown = useCallback(() => {
    setCountdown(OTP_DURATION)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    if (typeof stateLinked === 'boolean') {
      setTelegramLinked(stateLinked)
      if (stateBotLink) setBotLink(stateBotLink)
      setChecking(false)
      if (stateLinked) startCountdown()
      return
    }
    if (phone) {
      httpClient.get(`/auth/check-telegram?phone=${encodeURIComponent(phone)}`)
        .then((data) => {
          setTelegramLinked(data.linked)
          setBotLink(data.bot_link || '')
          setBotUsername(data.bot_username || 'BaliqSavdosiVerificationBot')
          if (data.linked) startCountdown()
        })
        .catch(() => setTelegramLinked(false))
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [phone, stateLinked, stateBotLink, startCountdown])

  const checkAgain = async () => {
    if (!phone) return
    setChecking(true)
    try {
      const data = await httpClient.get(`/auth/check-telegram?phone=${encodeURIComponent(phone)}`)
      setTelegramLinked(data.linked)
      setBotLink(data.bot_link || '')
      if (data.linked) {
        // Telegram ulandi — OTP yuborish
        try {
          await httpClient.post('/auth/resend-otp', { phone })
        } catch { /* ignore */ }
        pushToast({ title: "Telegram ulandi! OTP yuborildi.", variant: 'success' })
        startCountdown()
      }
    } catch { /* ignore */ }
    finally { setChecking(false) }
  }

  const resendOtp = async () => {
    if (!phone) return
    setResending(true)
    try {
      await httpClient.post('/auth/resend-otp', { phone })
      pushToast({ title: 'Yangi OTP kod yuborildi!', variant: 'success' })
      startCountdown()
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally {
      setResending(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await authService.verifyOtp({ user_id: userId, code: data.otp })
      if (result.token) {
        const userRole = result.user?.role || result.role || 'customer'
        setSession({ user: result.user, role: userRole, token: result.token })

        // Pending farm so'rovi
        if (location.state?.pendingFarm) {
          const farmData = JSON.parse(localStorage.getItem('pending-farm-registration') || '{}')
          if (farmData.farmName) {
            try {
              await httpClient.post('/farms', farmData)
              localStorage.removeItem('pending-farm-registration')
            } catch { /* ignore */ }
          }
          // Fermer uchun — admin tasdiqlashini kuting, login sahifasiga yo'naltiramiz
          pushToast({
            title: "So'rovingiz adminga yuborildi!",
            description: "Admin tasdiqlashi bilan Telegram orqali xabar olasiz. Shundan keyin tizimga kirishingiz mumkin.",
            variant: 'success',
          })
          // Logout qilamiz chunki hali admin tasdiqlamagan
          useAuthStore.getState().logout()
          navigate('/login')
          return
        }

        // Pending driver so'rovi
        if (location.state?.pendingDriver) {
          const driverData = JSON.parse(localStorage.getItem('pending-driver-registration') || '{}')
          if (driverData.carBrand) {
            try {
              const u = result.user
              await httpClient.post('/drivers', { ...driverData, firstName: u.firstName, lastName: u.lastName, phone: u.phone })
              localStorage.removeItem('pending-driver-registration')
            } catch { /* ignore */ }
          }
          // Driver uchun ham — admin tasdiqlashini kuting
          pushToast({
            title: "So'rovingiz adminga yuborildi!",
            description: "Admin tasdiqlashi bilan Telegram orqali xabar olasiz. Shundan keyin tizimga kirishingiz mumkin.",
            variant: 'success',
          })
          useAuthStore.getState().logout()
          navigate('/login')
          return
        }

        // Oddiy customer — dashboardga
        pushToast({ title: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", variant: 'success' })
        navigate('/customer/dashboard')
      } else if (result.reset_token) {
        pushToast({ title: 'OTP tasdiqlandi', variant: 'success' })
        navigate('/reset-password', { state: { reset_token: result.reset_token } })
      }
    } catch (err) {
      pushToast({ title: err.message || "OTP noto'g'ri yoki muddati o'tgan", variant: 'error' })
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

  // Telegram ulanmagan — yo'riqnoma
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
              <li className="flex gap-2"><span className="font-bold shrink-0">2.</span> Botda <b>"START"</b> tugmasini bosing</li>
              <li className="flex gap-2"><span className="font-bold shrink-0">3.</span> Qaytib keling va "Tekshirish" tugmasini bosing</li>
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

      {/* Countdown timer */}
      <div className="mb-4 text-center">
        {countdown > 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Kod amal qilish muddati: <span className="font-bold text-ocean-600">{countdown} soniya</span>
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-rose-500 font-semibold">⏱ Kod muddati tugadi!</p>
            <button
              type="button"
              className="secondary-button flex items-center justify-center gap-2 mx-auto"
              onClick={resendOtp}
              disabled={resending}
            >
              <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Yuborilmoqda...' : 'Qayta yuborish'}
            </button>
          </div>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="OTP kod" inputMode="numeric" maxLength="6" placeholder="000000"
          {...register('otp')} error={formState.errors.otp?.message} />
        <button className="primary-button w-full" type="submit" disabled={loading || countdown === 0}>
          {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
        </button>
      </form>
    </AuthFormShell>
  )
}
