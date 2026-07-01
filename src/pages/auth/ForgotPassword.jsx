import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { Phone, ArrowRight, Loader2 } from 'lucide-react'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/httpClient.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  phone: z.string().min(9, 'Telefon raqam kiriting'),
})

function toE164(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('998')) return `+${digits}`
  if (digits.startsWith('0')) return `+998${digits.slice(1)}`
  if (digits.length === 9) return `+998${digits}`
  return `+${digits}`
}

export function ForgotPassword() {
  const navigate  = useNavigate()
  const pushToast = useToastStore(s => s.pushToast)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const e = formState.errors

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const phone = toE164(data.phone)
      await httpClient.post('/auth/forgot-password', { phone })
      pushToast({ title: `Tasdiqlash kodi Telegram ga yuborildi 📱`, variant: 'success' })
      navigate('/firebase-forgot-otp', { state: { phone } })
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      title="Parolni tiklash"
      description="Telefon raqamingizni kiriting — Telegram orqali kod yuboramiz."
      footer={
        <Link className="font-semibold text-sky-400 hover:text-sky-300 transition-colors" to="/login">
          Kirishga qaytish
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-white/60">Telefon</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <input
              type="tel" inputMode="tel" placeholder="+998 90 000 00 00"
              className="h-11 w-full rounded-xl pl-10 pr-4 text-[14px] outline-none transition-all"
              style={{ background:'rgba(255,255,255,0.07)', border:`1.5px solid ${e.phone?'rgba(248,113,113,0.5)':'rgba(255,255,255,0.1)'}`, color:'#f0f6ff', fontFamily:'inherit' }}
              onFocus={ev=>{ev.target.style.borderColor='rgba(56,189,248,0.5)';ev.target.style.background='rgba(255,255,255,0.1)'}}
              onBlur={ev=>{ev.target.style.borderColor=e.phone?'rgba(248,113,113,0.5)':'rgba(255,255,255,0.1)';ev.target.style.background='rgba(255,255,255,0.07)'}}
              {...register('phone')}
            />
          </div>
          {e.phone && <p className="mt-1.5 text-[12px] font-medium text-rose-400">{e.phone.message}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50"
          style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow:'0 4px 20px rgba(14,165,233,0.35)' }}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Yuborilmoqda...</> : <>Kod olish <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </AuthFormShell>
  )
}
