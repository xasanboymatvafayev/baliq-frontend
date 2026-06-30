import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { authService, httpClient } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { ExternalLink, RefreshCw, ShieldAlert, Send, Loader2, KeyRound } from 'lucide-react'

const schema = z.object({ otp: z.string().length(6, '6 xonali kod kiriting') })
const OTP_DURATION = 60

function OtpInput({ register, error }) {
  return (
    <div>
      <input
        {...register('otp')}
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        placeholder="000000"
        className="h-14 w-full rounded-2xl text-center text-[28px] font-black tracking-[0.5em] outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: `1.5px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: '#f0f6ff',
          fontFamily: 'inherit',
          paddingLeft: 0,
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.background = 'rgba(255,255,255,0.1)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
      />
      {error && <p className="mt-1.5 text-center text-[12px] font-medium text-rose-400">{error}</p>}
    </div>
  )
}

export function OtpVerification() {
  const navigate    = useNavigate()
  const location     = useLocation()
  const pushToast    = useToastStore(s => s.pushToast)
  const setSession   = useAuthStore(s => s.setSession)
  const [loading, setLoading]       = useState(false)
  const [resending, setResending]   = useState(false)
  const [checking, setChecking]     = useState(true)
  const [telegramLinked, setTelegramLinked] = useState(true)
  const [botLink, setBotLink]       = useState('')
  const [botUsername, setBotUsername] = useState('BaliqSavdosiVerificationBot')
  const [countdown, setCountdown]   = useState(OTP_DURATION)
  const timerRef = useRef(null)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const phone        = location.state?.phone
  const userId       = location.state?.userId
  const stateLinked  = location.state?.linked
  const stateBotLink = location.state?.botLink
  const securityCheck = location.state?.securityCheck // shubhali login holati
  const rememberMe    = location.state?.rememberMe ?? true

  const startCountdown = useCallback(() => {
    setCountdown(OTP_DURATION)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

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
        .then(data => {
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
        try { await httpClient.post('/auth/resend-otp', { phone }) } catch { /* ignore */ }
        pushToast({ title: 'Telegram ulandi! Kod yuborildi.', variant: 'success' })
        startCountdown()
      }
    } catch { /* ignore */ } finally { setChecking(false) }
  }

  const resendOtp = async () => {
    if (!phone) return
    setResending(true)
    try {
      await httpClient.post('/auth/resend-otp', { phone })
      pushToast({ title: 'Yangi kod yuborildi!', variant: 'success' })
      startCountdown()
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally { setResending(false) }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await authService.verifyOtp({ user_id: userId, code: data.otp, security_check: securityCheck })
      if (result.token) {
        const userRole = result.user?.role || result.role || 'customer'
        setSession({ user: result.user, role: userRole, token: result.token, rememberMe })

        if (location.state?.pendingFarm) {
          const farmData = JSON.parse(localStorage.getItem('pending-farm-registration') || '{}')
          if (farmData.farmName) {
            try { await httpClient.post('/farms', farmData); localStorage.removeItem('pending-farm-registration') } catch { /* ignore */ }
          }
          pushToast({ title: "So'rovingiz adminga yuborildi!", description: 'Admin tasdiqlashi bilan Telegram orqali xabar olasiz.', variant: 'success' })
          useAuthStore.getState().logout()
          navigate('/login')
          return
        }

        if (location.state?.pendingDriver) {
          const driverData = JSON.parse(localStorage.getItem('pending-driver-registration') || '{}')
          if (driverData.carBrand) {
            try {
              const u = result.user
              await httpClient.post('/drivers', { ...driverData, firstName: u.firstName, lastName: u.lastName, phone: u.phone })
              localStorage.removeItem('pending-driver-registration')
            } catch { /* ignore */ }
          }
          pushToast({ title: "So'rovingiz adminga yuborildi!", description: 'Admin tasdiqlashi bilan Telegram orqali xabar olasiz.', variant: 'success' })
          useAuthStore.getState().logout()
          navigate('/login')
          return
        }

        pushToast({ title: securityCheck ? 'Kirish tasdiqlandi ✅' : "Muvaffaqiyatli ro'yxatdan o'tdingiz!", variant: 'success' })
        const ROLE_ROUTES = {
          customer: '/customer/dashboard', 'farm-owner': '/farm/dashboard',
          driver: '/driver/dashboard', admin: '/admin/dashboard',
          manager: '/manager/dashboard', 'super-admin': '/super-admin/system-statistics',
        }
        navigate(ROLE_ROUTES[userRole] || '/customer/dashboard')
      } else if (result.reset_token) {
        pushToast({ title: 'Kod tasdiqlandi', variant: 'success' })
        navigate('/reset-password', { state: { reset_token: result.reset_token } })
      }
    } catch (err) {
      pushToast({ title: err.message || "Kod noto'g'ri yoki muddati o'tgan", variant: 'error' })
    } finally { setLoading(false) }
  }

  /* ── Loading ── */
  if (checking) {
    return (
      <AuthFormShell title="Tekshirilmoqda" description="Telegram bog'lanishi tekshirilmoqda...">
        <div className="flex justify-center py-10">
          <div className="h-9 w-9 rounded-full border-[3px] border-sky-500 border-t-transparent animate-spin" />
        </div>
      </AuthFormShell>
    )
  }

  /* ── Telegram ulanmagan ── */
  if (!telegramLinked) {
    return (
      <AuthFormShell title="Telegram bilan ulaning" description="Tasdiqlash kodini olish uchun Telegram botimizga ulanishingiz kerak.">
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="mb-3 text-[13px] font-bold text-amber-400">📱 Qanday ulash kerak?</p>
            <ol className="space-y-2">
              {[
                'Quyidagi tugmani bosing va Telegram oching',
                'Botda "START" tugmasini bosing',
                'Qaytib keling va "Tekshirish" tugmasini bosing',
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-amber-300/80">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <a
            href={botLink || `https://t.me/${botUsername}`}
            target="_blank" rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}
          >
            <ExternalLink className="h-4 w-4" /> Telegram botni ochish
          </a>

          <button
            onClick={checkAgain}
            disabled={checking}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> Ulanishni tekshirish
          </button>

          <p className="text-center text-[12px] text-white/30">@{botUsername}</p>
        </div>
      </AuthFormShell>
    )
  }

  /* ── OTP kiritish ── */
  return (
    <AuthFormShell
      title={securityCheck ? 'Xavfsizlik tekshiruvi' : 'Tasdiqlash kodi'}
      description={securityCheck
        ? 'Yangi qurilmadan kirish aniqlandi. Telegram botga yuborilgan kodni kiriting.'
        : 'Telegram botga yuborilgan 6 xonali kodni kiriting.'}
    >
      {/* Security warning banner */}
      {securityCheck && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl p-4" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <p className="text-[12.5px] leading-relaxed text-rose-300/90">
            Hisobingizga yangi qurilma/joydan kirishga urinish qilindi. Agar bu siz bo'lmasangiz, kodni kiritmang va darhol parolingizni almashtiring.
          </p>
        </div>
      )}

      {/* Telegram info */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(14,165,233,0.15)' }}>
          <Send className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-sky-300">Kod Telegram botga yuborildi</p>
          <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-sky-400/70 hover:text-sky-400 transition-colors underline">
            @{botUsername} ni oching
          </a>
        </div>
      </div>

      {/* Countdown */}
      <div className="mb-4 text-center">
        {countdown > 0 ? (
          <p className="text-[13px] text-white/45">
            Kod amal qilish muddati: <span className="font-bold text-sky-400">{countdown} soniya</span>
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-rose-400">⏱ Kod muddati tugadi</p>
            <button
              type="button"
              onClick={resendOtp}
              disabled={resending}
              className="mx-auto flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Yuborilmoqda...' : 'Qayta yuborish'}
            </button>
          </div>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <OtpInput register={register} error={formState.errors.otp?.message} />
        <button
          type="submit"
          disabled={loading || countdown === 0}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Tekshirilmoqda...</>
            : <><KeyRound className="h-4 w-4" /> Tasdiqlash</>
          }
        </button>
      </form>
    </AuthFormShell>
  )
}
