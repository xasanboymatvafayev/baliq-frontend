import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff, User, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useToastStore } from '../../store/toastStore.js'
import { authService } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kiriting'),
  lastName:  z.string().min(2, 'Familiya kiriting'),
  phone:     z.string().min(9, 'Telefon kiriting'),
  password:  z.string().min(6, 'Parol kamida 6 ta belgi'),
})

function AuthField({ label, icon: Icon, error, type = 'text', ...props }) {
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
      {error && <p className="mt-1.5 text-[12px] font-medium text-rose-400">{error}</p>}
    </div>
  )
}

export function Register() {
  const navigate  = useNavigate()
  const pushToast = useToastStore(s => s.pushToast)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const e = formState.errors

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await authService.register(data)
      // Backend OTP yuboradi (Telegram orqali) va user_id qaytaradi
      pushToast({ title: 'Tasdiqlash kodi yuborildi 📱', variant: 'success' })
      navigate('/otp-verification', {
        state: {
          phone: data.phone,
          userId: result.user_id || result.id,
          linked: result.telegram_linked,
          botLink: result.bot_link,
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
      description="Platformadan foydalanish uchun akkount yarating."
      footer={<>Akkountingiz bormi? <Link className="font-semibold text-sky-400 hover:text-sky-300 transition-colors" to="/login">Kirish</Link></>}
    >
      <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <AuthField label="Ism"      icon={User}  error={e.firstName?.message} {...register('firstName')} placeholder="Jasur" />
          <AuthField label="Familiya" icon={User}  error={e.lastName?.message}  {...register('lastName')}  placeholder="Karimov" />
        </div>
        <AuthField label="Telefon" icon={Phone} error={e.phone?.message}    {...register('phone')}    placeholder="+998 90 000 00 00" />
        <AuthField label="Parol"   icon={Lock}  error={e.password?.message} {...register('password')} type="password" placeholder="••••••••" />

        <div className="rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed text-sky-300/80" style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.15)' }}>
          📱 Ro'yxatdan o'tgach Telegram orqali tasdiqlash kodi yuboriladi.
        </div>

        <button type="submit" disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50 mt-1"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}
          onMouseEnter={ev => { if (!loading) ev.currentTarget.style.background = 'linear-gradient(135deg,#38bdf8,#0ea5e9)' }}
          onMouseLeave={ev => { if (!loading) ev.currentTarget.style.background = 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Yaratilmoqda...</>
            : <>Akkount yaratish <ArrowRight className="h-4 w-4" /></>
          }
        </button>
      </form>
    </AuthFormShell>
  )
}
