import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/httpClient.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { Loader2, KeyRound, RefreshCw, Send, ExternalLink, CheckCircle2 } from 'lucide-react'
import { useT } from '../../store/i18nStore.js'

const ROLE_ROUTES = {
  customer: '/customer/dashboard', 'farm-owner': '/farm/dashboard',
  driver: '/driver/dashboard', admin: '/admin/dashboard',
  manager: '/manager/dashboard', 'super-admin': '/super-admin/system-statistics',
}

export function FirebaseOtpPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const t = useT()
  const setSession = useAuthStore(s => s.setSession)
  const pushToast  = useToastStore(s => s.pushToast)

  const {
    phone: rawPhone,
    userId,
    linked,
    botLink,
    firstName,
    lastName,
    password,
    rememberMe = true,
    pendingFarm   = false,
    pendingDriver = false,
  } = location.state || {}

  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [isLinked, setIsLinked] = useState(!!linked)
  const [checking, setChecking] = useState(false)

  // Telegram ulanganligini tekshirish
  const checkLink = async () => {
    setChecking(true)
    try {
      const res = await httpClient.get(`/auth/check-telegram?phone=${encodeURIComponent(rawPhone)}`)
      if (res.linked) {
        setIsLinked(true)
        // OTP yuborish
        await httpClient.post('/auth/resend-otp', { phone: rawPhone, user_id: userId })
        pushToast({ title: 'Telegram ulandi! Kod yuborildi ✅', variant: 'success' })
      } else {
        pushToast({ title: "Hali ulanmagan. Botda /start bosing", variant: 'error' })
      }
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    }
    setChecking(false)
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await httpClient.post('/auth/resend-otp', { phone: rawPhone, user_id: userId })
      pushToast({ title: 'Yangi kod yuborildi!', variant: 'success' })
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    }
    setResending(false)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.length < 4) { pushToast({ title: 'Kodni kiriting', variant: 'error' }); return }
    setLoading(true)
    try {
      const res = await httpClient.post('/auth/verify-otp', {
        user_id: userId,
        code,
        type: 'register',
      })

      const userRole = res.user?.role || 'customer'
      setSession({ user: res.user, role: userRole, token: res.token, rememberMe })

      if (pendingFarm) {
        const farmData = JSON.parse(localStorage.getItem('pending-farm-registration') || '{}')
        if (farmData.farmName) {
          try { await httpClient.post('/farms', farmData); localStorage.removeItem('pending-farm-registration') } catch {}
        }
        pushToast({ title: "Ferma so'rovi yuborildi! Admin tasdiqlagach xabar olasiz.", variant: 'success' })
        setSession({ user: null, role: 'customer', token: null })
        navigate('/login')
        return
      }
      if (pendingDriver) {
        const driverData = JSON.parse(localStorage.getItem('pending-driver-registration') || '{}')
        if (driverData.carBrand) {
          try {
            await httpClient.post('/drivers', { ...driverData, firstName, lastName, phone: rawPhone })
            localStorage.removeItem('pending-driver-registration')
          } catch {}
        }
        pushToast({ title: "Haydovchi so'rovi yuborildi! Admin tasdiqlagach xabar olasiz.", variant: 'success' })
        setSession({ user: null, role: 'customer', token: null })
        navigate('/login')
        return
      }

      pushToast({ title: "Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉", variant: 'success' })
      navigate(ROLE_ROUTES[userRole] || '/customer/dashboard')
    } catch (err) {
      pushToast({ title: err?.message || "Kod noto'g'ri yoki muddati tugagan", variant: 'error' })
    }
    setLoading(false)
  }

  // Telegram ulanmagan holat
  if (!isLinked) {
    return (
      <AuthFormShell title={t.telegramTitle} description={t.telegramDesc}>
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
            <p className="mb-3 text-[13px] font-bold text-amber-400">📱 Qanday ulash kerak?</p>
            <ol className="space-y-2">
              {[
                'Quyidagi tugmani bosib Telegram botni oching',
                'Botda "START" tugmasini bosing',
                'Qaytib kelib "Tekshirish" tugmasini bosing',
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-amber-300/80">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <a href={botLink || 'https://t.me/BaliqSavdosiVerificationBot'} target="_blank" rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white"
            style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow:'0 4px 20px rgba(14,165,233,0.35)' }}>
            <ExternalLink className="h-4 w-4" /> Telegram botni ochish
          </a>

          <button onClick={checkLink} disabled={checking}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold transition-all"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)' }}>
            <CheckCircle2 className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Tekshirilmoqda...' : 'Ulanishni tekshirish'}
          </button>

          <Link to="/login" className="block text-center text-[13px] text-white/30 hover:text-white/60 transition-colors">
            {t.backToLogin}
          </Link>
        </div>
      </AuthFormShell>
    )
  }

  // OTP kiritish holati
  return (
    <AuthFormShell title={t.otpTitle} description={`${rawPhone} ga yuborilgan 6 xonali kodni kiriting`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.15)' }}>
          <Send className="h-5 w-5 text-sky-400 flex-shrink-0" />
          <p className="text-[13px] text-sky-300">Kod Telegram botga yuborildi</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
            inputMode="numeric" maxLength={6} placeholder="000000" autoComplete="one-time-code"
            className="h-14 w-full rounded-2xl text-center text-[28px] font-black tracking-[0.5em] outline-none"
            style={{ background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.1)', color:'#f0f6ff', fontFamily:'inherit' }}
            onFocus={e=>e.target.style.borderColor='rgba(56,189,248,0.5)'}
            onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
          />
          <button type="submit" disabled={loading||code.length<4}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50"
            style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow:'0 4px 20px rgba(14,165,233,0.35)' }}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Tekshirilmoqda...</> : <><KeyRound className="h-4 w-4" />{t.confirm}</>}
          </button>
        </form>

        <button onClick={handleResend} disabled={resending}
          className="flex w-full items-center justify-center gap-2 text-[13px] text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${resending?'animate-spin':''}`} />
          Qayta yuborish
        </button>
      </div>
    </AuthFormShell>
  )
}
