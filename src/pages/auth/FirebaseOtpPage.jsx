import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useFirebasePhone } from '../../hooks/useFirebasePhone.js'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/httpClient.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { Loader2, KeyRound, RefreshCw, Send } from 'lucide-react'

const ROLE_ROUTES = {
  customer: '/customer/dashboard', 'farm-owner': '/farm/dashboard',
  driver: '/driver/dashboard', admin: '/admin/dashboard',
  manager: '/manager/dashboard', 'super-admin': '/super-admin/system-statistics',
}

export function FirebaseOtpPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const setSession = useAuthStore(s => s.setSession)
  const pushToast  = useToastStore(s => s.pushToast)
  const { confirmCode, sendSms, status, error, botLink, clearError } = useFirebasePhone()
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)

  const rawPhone   = location.state?.phone || ''
  const firstName  = location.state?.firstName || ''
  const lastName   = location.state?.lastName  || ''
  const password   = location.state?.password  || ''
  const rememberMe = location.state?.rememberMe ?? true

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.length < 4) { pushToast({ title: 'Kodni kiriting', variant: 'error' }); return }
    setLoading(true)
    try {
      const result = await confirmCode(code)
      if (!result) { setLoading(false); return }

      // Backend: firebase-verify endpoint ga custom_token yuboramiz
      const res = await httpClient.post('/auth/firebase-verify', {
        firebase_token: result.custom_token || result.idToken || 'backend_verified',
        firstName, lastName, phone: rawPhone, password,
      })
      const userRole = res.user?.role || res.role || 'customer'
      setSession({ user: res.user, role: userRole, token: res.token, rememberMe })
      pushToast({ title: "Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉", variant: 'success' })
      navigate(ROLE_ROUTES[userRole] || '/customer/dashboard')
    } catch (err) {
      pushToast({ title: err?.message || 'Xatolik', variant: 'error' })
    }
    setLoading(false)
  }

  const handleResend = async () => {
    clearError()
    await sendSms(rawPhone)
    pushToast({ title: 'Yangi kod yuborildi!', variant: 'success' })
  }

  return (
    <AuthFormShell title="SMS kod" description={`${rawPhone} raqamiga yuborilgan kodni kiriting`}>
      <div className="space-y-4">
        {/* Telegram info */}
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
          <Send className="h-5 w-5 text-sky-400 flex-shrink-0" />
          <p className="text-[13px] text-sky-300">Tasdiqlash kodi Telegram bot orqali yuborildi</p>
        </div>

        {error && (
          <div className="rounded-xl p-3 text-[13px] text-rose-400" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
            {botLink && <a href={botLink} target="_blank" rel="noreferrer" className="block mt-1 font-bold underline">Telegram botni ulash →</a>}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-white/60">Tasdiqlash kodi</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="h-14 w-full rounded-2xl text-center text-[28px] font-black tracking-[0.5em] outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#f0f6ff', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <button type="submit" disabled={loading || code.length < 4}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Tekshirilmoqda...</> : <><KeyRound className="h-4 w-4" /> Tasdiqlash</>}
          </button>
        </form>

        <button onClick={handleResend} disabled={status === 'sending'}
          className="flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${status === 'sending' ? 'animate-spin' : ''}`} />
          Qayta yuborish
        </button>
      </div>
    </AuthFormShell>
  )
}
