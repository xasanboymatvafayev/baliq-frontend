import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useFirebasePhone } from '../../hooks/useFirebasePhone.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/httpClient.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { Loader2, KeyRound, RefreshCw, Send } from 'lucide-react'

export function FirebaseForgotOtpPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const pushToast = useToastStore(s => s.pushToast)
  const { confirmCode, sendSms, status, error, clearError } = useFirebasePhone()
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)

  const rawPhone = location.state?.phone || ''

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await confirmCode(code)
      if (!result) { setLoading(false); return }

      const res = await httpClient.post('/auth/firebase-forgot-password', {
        firebase_token: result.custom_token || result.idToken || 'backend_verified',
        phone: rawPhone,
      })
      pushToast({ title: 'Telefon tasdiqlandi!', variant: 'success' })
      navigate('/reset-password', { state: { reset_token: res.reset_token } })
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
    <AuthFormShell title="Parolni tiklash" description={`${rawPhone} ga yuborilgan kodni kiriting`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
          <Send className="h-5 w-5 text-sky-400 flex-shrink-0" />
          <p className="text-[13px] text-sky-300">Tasdiqlash kodi Telegram bot orqali yuborildi</p>
        </div>
        {error && <p className="text-[13px] text-rose-400 rounded-xl p-3" style={{ background: 'rgba(248,113,113,0.1)' }}>{error}</p>}
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" maxLength={6} placeholder="000000"
            className="h-14 w-full rounded-2xl text-center text-[28px] font-black tracking-[0.5em] outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#f0f6ff', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button type="submit" disabled={loading || code.length < 4}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Tekshirilmoqda...</> : <><KeyRound className="h-4 w-4" /> Tasdiqlash</>}
          </button>
        </form>
        <button onClick={handleResend} disabled={status === 'sending'}
          className="flex w-full items-center justify-center gap-2 text-[13px] text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${status === 'sending' ? 'animate-spin' : ''}`} />
          Qayta yuborish
        </button>
      </div>
    </AuthFormShell>
  )
}
