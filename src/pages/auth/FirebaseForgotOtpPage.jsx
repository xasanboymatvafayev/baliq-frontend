import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/httpClient.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { Loader2, KeyRound, RefreshCw, Send } from 'lucide-react'
import { useT } from '../../store/i18nStore.js'

export function FirebaseForgotOtpPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const t = useT()
  const pushToast = useToastStore(s => s.pushToast)
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const rawPhone  = location.state?.phone      || ''
  const userId    = location.state?.userId     || ''
  const resetToken = location.state?.resetToken || ''

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.length < 4) { pushToast({ title: 'Kodni kiriting', variant: 'error' }); return }
    if (!userId) {
      pushToast({ title: "Sessiya xatosi. Qaytadan harakat qiling.", variant: 'error' })
      navigate('/forgot-password')
      return
    }
    setLoading(true)
    try {
      // user_id bilan verify-otp chaqiramiz (avval phone yuborilardi → 422 edi)
      await httpClient.post('/auth/verify-otp', {
        user_id: userId,
        code,
      })
      pushToast({ title: 'Telefon tasdiqlandi!', variant: 'success' })
      if (!resetToken) {
        // reset_token yo'q bo'lsa — qaytadan forgot-password dan o'tkazamiz
        pushToast({ title: "Sessiya muddati tugagan. Qaytadan harakat qiling.", variant: 'error' })
        navigate('/forgot-password')
        return
      }
      // reset_token forgot-password dan kelgan (verify-otp dan emas)
      navigate('/reset-password', { state: { reset_token: resetToken } })
    } catch (err) {
      pushToast({ title: err?.message || "Kod noto'g'ri yoki muddati tugagan", variant: 'error' })
    }
    setLoading(false)
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await httpClient.post('/auth/forgot-password', { phone: rawPhone })
      // yangi reset_token ni ham saqlaymiz
      if (res?.reset_token) {
        navigate('.', {
          replace: true,
          state: { phone: rawPhone, userId: res.user_id || userId, resetToken: res.reset_token },
        })
      }
      pushToast({ title: 'Yangi kod yuborildi!', variant: 'success' })
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    }
    setResending(false)
  }

  return (
    <AuthFormShell title={t.forgotTitle} description={`${rawPhone} ga yuborilgan kodni kiriting`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.15)' }}>
          <Send className="h-5 w-5 text-sky-400 flex-shrink-0" />
          <p className="text-[13px] text-sky-300">Tasdiqlash kodi Telegram bot orqali yuborildi</p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
            inputMode="numeric" maxLength={6} placeholder="000000"
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
