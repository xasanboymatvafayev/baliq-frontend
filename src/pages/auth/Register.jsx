import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff, User, Phone, Lock, ArrowRight, Loader2, MessageSquare } from 'lucide-react'
import { useToastStore } from '../../store/toastStore.js'
import { useFirebasePhone } from '../../hooks/useFirebasePhone.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kiriting'),
  lastName:  z.string().min(2, 'Familiya kiriting'),
  phone:     z.string().min(9, 'Telefon kiriting'),
  password:  z.string().min(6, 'Parol kamida 6 ta belgi'),
})

function AuthField({ label, icon: Icon, error, type = 'text', hint, ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-white/60">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
        <input
          type={isPassword && show ? 'text' : type}
          className="h-11 w-full rounded-xl pl-10 pr-4 text-[14px] outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: `1.5px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: '#f0f6ff', fontFamily: 'inherit',
            paddingRight: isPassword ? 44 : 16,
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.background = 'rgba(255,255,255,0.1)' }}
          onBlur={e => { e.target.style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && !error && <p className="mt-1 text-[11px] text-white/30">{hint}</p>}
      {error && <p className="mt-1.5 text-[12px] font-medium text-rose-400">{error}</p>}
    </div>
  )
}

// Format phone to E.164 (+998XXXXXXXXX)
function toE164(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('998')) return `+${digits}`
  if (digits.startsWith('0'))   return `+998${digits.slice(1)}`
  if (digits.length === 9)      return `+998${digits}`
  return `+${digits}`
}

export function Register({ pendingFarm = false, pendingDriver = false }) {
  const navigate  = useNavigate()
  const pushToast = useToastStore(s => s.pushToast)
  const { sendSms, status, error: smsError } = useFirebasePhone()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const e = formState.errors

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const e164 = toE164(data.phone)

      // Send Firebase SMS
      const ok = await sendSms(e164)
      if (!ok) {
        pushToast({ title: smsError || 'SMS yuborishda xato', variant: 'error' })
        setLoading(false)
        return
      }

      pushToast({ title: `SMS yuborildi 📱 ${e164}`, variant: 'success' })
      // Navigate to OTP page with form data + E.164 phone
      navigate('/firebase-otp', {
        state: {
          formData: data,
          phone: e164,
          pendingFarm,
          pendingDriver,
        },
      })
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      title="Ro'yxatdan o'tish"
      description="SMS orqali telefon raqamingizni tasdiqlaymiz."
      footer={<>Akkountingiz bormi? <Link className="font-semibold text-sky-400 hover:text-sky-300 transition-colors" to="/login">Kirish</Link></>}
    >
      {/* Hidden recaptcha container (invisible reCAPTCHA) */}
      <div id="recaptcha-container" />

      {/* Firebase badge */}
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
        <MessageSquare className="h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-[12px] font-medium text-emerald-300">
          Ro'yxatdan o'tish uchun telefon raqamingizga SMS kod yuboriladi (Firebase, bepul)
        </p>
      </div>

      <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <AuthField label="Ism"      icon={User}  error={e.firstName?.message} {...register('firstName')} placeholder="Jasur" />
          <AuthField label="Familiya" icon={User}  error={e.lastName?.message}  {...register('lastName')}  placeholder="Karimov" />
        </div>
        <AuthField
          label="Telefon"
          icon={Phone}
          error={e.phone?.message}
          {...register('phone')}
          placeholder="+998 90 000 00 00"
          hint="Xalqaro format: +998901234567"
          inputMode="tel"
        />
        <AuthField label="Parol" icon={Lock} error={e.password?.message} {...register('password')} type="password" placeholder="••••••••" />

        <button type="submit" disabled={loading || status === 'sending'}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50 mt-1"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}
        >
          {(loading || status === 'sending')
            ? <><Loader2 className="h-4 w-4 animate-spin" /> SMS yuborilmoqda...</>
            : <>SMS kod olish <ArrowRight className="h-4 w-4" /></>
          }
        </button>
      </form>
    </AuthFormShell>
  )
}
