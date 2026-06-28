import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react'
import { useFirebasePhone } from '../../hooks/useFirebasePhone.js'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const RESEND_COOLDOWN = 60

export function FirebaseOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore(s => s.setSession)
  const pushToast = useToastStore(s => s.pushToast)
  const { confirmCode, sendSms, status, error, clearError } = useFirebasePhone()

  const formData   = location.state?.formData   // {firstName, lastName, phone, password}
  const rawPhone   = location.state?.phone      // E.164 format
  const pendingFarm   = location.state?.pendingFarm
  const pendingDriver = location.state?.pendingDriver

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const [resending, setResending] = useState(false)
  const timerRef = useRef(null)

  // Redirect if no state
  useEffect(() => {
    if (!rawPhone || !formData) navigate('/register', { replace: true })
  }, [rawPhone, formData, navigate])

  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(timerRef.current); return 0 }
        return p - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    startCountdown()
    return () => clearInterval(timerRef.current)
  }, [startCountdown])

  const handleResend = async () => {
    setResending(true)
    clearError()
    const ok = await sendSms(rawPhone)
    if (ok) { pushToast({ title: 'SMS qayta yuborildi ✅', variant: 'success' }); startCountdown() }
    else pushToast({ title: error || 'SMS yuborishda xato', variant: 'error' })
    setResending(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) { pushToast({ title: '6 xonali kod kiriting', variant: 'error' }); return }
    setSubmitting(true)
    try {
      // 1. Confirm Firebase code → get ID token
      const result = await confirmCode(code)
      if (!result) { pushToast({ title: error || "Kod noto'g'ri", variant: 'error' }); setSubmitting(false); return }

      // 2. Send to backend → create user + return JWT
      const res = await httpClient.post('/auth/firebase-verify', {
        firebase_token: result.idToken,
        firstName: formData.firstName,
        lastName:  formData.lastName,
        phone:     rawPhone,
        password:  formData.password,
      })

      if (res.token) {
        const role = res.user?.role || 'customer'

        // Pending farm registration
        if (pendingFarm) {
          setSession({ user: res.user, role, token: res.token })
          const farmData = JSON.parse(localStorage.getItem('pending-farm-registration') || '{}')
          if (farmData.farmName) {
            try { await httpClient.post('/farms', farmData); localStorage.removeItem('pending-farm-registration') } catch {}
          }
          pushToast({ title: "So'rovingiz adminga yuborildi!", variant: 'success' })
          useAuthStore.getState().logout()
          navigate('/login')
          return
        }

        // Pending driver registration
        if (pendingDriver) {
          setSession({ user: res.user, role, token: res.token })
          const driverData = JSON.parse(localStorage.getItem('pending-driver-registration') || '{}')
          if (driverData.carBrand) {
            try {
              await httpClient.post('/drivers', { ...driverData, firstName: formData.firstName, lastName: formData.lastName, phone: rawPhone })
              localStorage.removeItem('pending-driver-registration')
            } catch {}
          }
          pushToast({ title: "So'rovingiz adminga yuborildi!", variant: 'success' })
          useAuthStore.getState().logout()
          navigate('/login')
          return
        }

        setSession({ user: res.user, role, token: res.token })
        pushToast({ title: "Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉", variant: 'success' })
        navigate('/customer/dashboard')
      }
    } catch (err) {
      pushToast({ title: err?.response?.data?.detail || err.message || 'Xato', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // OTP input cells
  const cells = Array.from({ length: 6 })
  const inputRef = useRef(null)

  return (
    <AuthFormShell
      title="SMS kod"
      description={`+${rawPhone?.replace(/^\+/, '')} raqamiga yuborilgan 6 xonali kodni kiriting`}
    >
      <div id="recaptcha-container" />

      {/* Phone badge */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-white/40 font-medium">SMS yuborildi</p>
          <p className="text-sm font-bold text-white/80">{rawPhone}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Big OTP input */}
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-white/60">SMS kod</label>
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            value={code}
            onChange={e => { clearError(); setCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }}
            placeholder="000000"
            autoFocus
            className="h-14 w-full rounded-2xl text-center text-3xl font-black tracking-[0.5em] outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: `2px solid ${error ? 'rgba(248,113,113,0.5)' : code.length === 6 ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.12)'}`,
              color: '#f0f6ff',
              fontFamily: 'inherit',
              letterSpacing: '0.4em',
            }}
          />
          {error && <p className="mt-1.5 text-[12px] font-medium text-rose-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting || code.length !== 6}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
        >
          {submitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Tekshirilmoqda...</>
            : <><ShieldCheck className="h-4 w-4" /> Tasdiqlash</>
          }
        </button>
      </form>

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-white/40">
            Qayta yuborish: <span className="font-bold text-white/60">{countdown} sek</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-2 mx-auto text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
            SMS qayta yuborish
          </button>
        )}
      </div>

      <button
        onClick={() => navigate('/register')}
        className="flex items-center gap-1.5 mx-auto text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Ro'yxatga qaytish
      </button>
    </AuthFormShell>
  )
}
