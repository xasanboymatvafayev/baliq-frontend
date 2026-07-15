import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff, Phone, Lock, ArrowRight, Loader2, Check } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { authService } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'
import { useT } from '../../store/i18nStore.js'

const schema = z.object({
  phone:    z.string().min(9, 'Telefon raqam kiriting'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
})

const ROLE_ROUTES = {
  customer: '/customer/dashboard', 'farm-owner': '/farm/dashboard',
  driver: '/driver/dashboard', admin: '/admin/dashboard',
  manager: '/manager/dashboard', 'super-admin': '/super-admin/system-statistics',
}

export function Login() {
  const navigate   = useNavigate()
  const setSession = useAuthStore(s => s.setSession)
  const pushToast  = useToastStore(s => s.pushToast)
  const t = useT()
  const [loading, setLoading]     = useState(false)
  const [showPwd, setShowPwd]     = useState(false)
  const [remember, setRemember]   = useState(true)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result   = await authService.login(data)

      // Yangi qurilma / shubhali login aniqlansa backend bu maydonni qaytaradi
      if (result.suspicious_login || result.new_device) {
        pushToast({
          title: '🔐 Yangi qurilmadan kirish aniqlandi',
          description: 'Tasdiqlash uchun Telegram botga xabar yuborildi. Agar bu siz bo\'lmasangiz, hisobingiz xavfsizligini tekshiring.',
          variant: 'info',
        })
        navigate('/otp-verification', {
          state: {
            phone: data.phone,
            userId: result.user_id,
            securityCheck: true,
            rememberMe: remember,
          },
        })
        return
      }

      const userRole = result.user?.role || result.role || 'customer'
      setSession({ user: result.user, role: userRole, token: result.token, rememberMe: remember })
      pushToast({ title: 'Xush kelibsiz! 👋', variant: 'success' })
      navigate(ROLE_ROUTES[userRole] || '/customer/dashboard')
    } catch (err) {
      pushToast({ title: err.message || "Telefon yoki parol noto'g'ri", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      title={`${t.welcomeBack} 👋`}
      description={t.enterCredentials}
      footer={<>{t.noAccount} <Link className="font-semibold text-sky-400 hover:text-sky-300 transition-colors" to="/register">{t.registerNow}</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-white/60">{t.phone}</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <input
              {...register('phone')}
              placeholder={t.enterPhone}
              className="h-11 w-full rounded-xl pl-10 pr-4 text-[14px] outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${formState.errors.phone ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: '#f0f6ff',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.background = 'rgba(255,255,255,0.1)' }}
              onBlur={e => { e.target.style.borderColor = formState.errors.phone ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
            />
          </div>
          {formState.errors.phone && <p className="mt-1.5 text-[12px] font-medium text-rose-400">{formState.errors.phone.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-white/60">{t.password}</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <input
              {...register('password')}
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl pl-10 pr-11 text-[14px] outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${formState.errors.password ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: '#f0f6ff',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; e.target.style.background = 'rgba(255,255,255,0.1)' }}
              onBlur={e => { e.target.style.borderColor = formState.errors.password ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formState.errors.password && <p className="mt-1.5 text-[12px] font-medium text-rose-400">{formState.errors.password.message}</p>}
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <button
              type="button"
              onClick={() => setRemember(v => !v)}
              className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md border-[1.5px] transition-all"
              style={{
                background: remember ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'rgba(255,255,255,0.06)',
                borderColor: remember ? '#0ea5e9' : 'rgba(255,255,255,0.18)',
              }}
            >
              {remember && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </button>
            <span className="text-[13px] font-medium text-white/55 group-hover:text-white/75 transition-colors">
              {t.rememberMe}
            </span>
          </label>
          <Link className="text-[13px] font-semibold text-sky-400 hover:text-sky-300 transition-colors" to="/forgot-password">
            {t.forgotPassword}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50"
          style={{
            background: loading ? 'rgba(14,165,233,0.6)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(14,165,233,0.35)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg,#38bdf8,#0ea5e9)' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.loggingIn}</>
            : <>{t.login} <ArrowRight className="h-4 w-4" /></>
          }
        </button>
      </form>
    </AuthFormShell>
  )
}
