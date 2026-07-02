import { zodResolver } from '@hookform/resolvers/zod'
  import { useForm } from 'react-hook-form'
  import { Link, useNavigate } from 'react-router-dom'
  import { z } from 'zod'
  import { useState } from 'react'
  import { Eye, EyeOff, User, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react'
  import { useToastStore } from '../../store/toastStore.js'
  import { authService } from '../../services/api/index.js'
  import { AuthFormShell } from './AuthFormShell.jsx'
  import { useT } from '../../store/i18nStore.js'

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
    const t = useT()
    const [loading, setLoading] = useState(false)

    const schema = z.object({
      firstName: z.string().min(2, t.firstName + ' ' + (t.lang === 'ru' ? '\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e' : 'kiriting')),
      lastName:  z.string().min(2, t.lastName + ' ' + (t.lang === 'ru' ? '\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e' : 'kiriting')),
      phone:     z.string().min(9, t.phone + ' ' + (t.lang === 'ru' ? '\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e' : 'kiriting')),
      password:  z.string().min(6, t.lang === 'ru' ? '\u041f\u0430\u0440\u043e\u043b\u044c \u043c\u0438\u043d\u0438\u043c\u0443\u043c 6 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432' : 'Parol kamida 6 ta belgi'),
    })

    const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
    const e = formState.errors

    const onSubmit = async (data) => {
      setLoading(true)
      try {
        const e164 = toE164(data.phone)
        const result = await authService.register({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: e164,
          password: data.password,
        })
        pushToast({
          title: result.linked
            ? (t.lang === 'ru' ? 'OTP kod Telegram botga yuborildi ✅' : 'OTP kod Telegram botga yuborildi ✅')
            : (t.lang === 'ru' ? 'Telegram botni ulab, kodni oling' : 'Telegram botni ulab, kodni oling'),
          variant: result.linked ? 'success' : 'info',
        })
        navigate('/otp-verification', {
          state: {
            phone: e164,
            userId: result.user_id,
            linked: result.linked,
            botLink: result.bot_link,
            botUsername: result.bot_username,
            pendingFarm,
            pendingDriver,
          },
        })
      } catch (err) {
        pushToast({ title: err.message || (t.lang === 'ru' ? '\u041e\u0448\u0438\u0431\u043a\u0430' : 'Xatolik yuz berdi'), variant: 'error' })
      } finally {
        setLoading(false)
      }
    }

    return (
      <AuthFormShell
        title={t.registerTitle}
        description={t.registerDesc}
        footer={<>{t.haveAccount} <Link className="font-semibold text-sky-400 hover:text-sky-300 transition-colors" to="/login">{t.login}</Link></>}
      >
        <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <AuthField label={t.firstName} icon={User}  error={e.firstName?.message} {...register('firstName')} placeholder={t.lang === 'ru' ? '\u0418\u0432\u0430\u043d' : 'Jasur'} />
            <AuthField label={t.lastName}  icon={User}  error={e.lastName?.message}  {...register('lastName')}  placeholder={t.lang === 'ru' ? '\u0418\u0432\u0430\u043d\u043e\u0432' : 'Karimov'} />
          </div>
          <AuthField
            label={t.phone}
            icon={Phone}
            error={e.phone?.message}
            {...register('phone')}
            placeholder={t.phonePlaceholder}
            hint={t.phoneHint}
            inputMode="tel"
          />
          <AuthField label={t.password} icon={Lock} error={e.password?.message} {...register('password')} type="password" placeholder={t.passwordPlaceholder} />

          <button type="submit" disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50 mt-1"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.lang === 'ru' ? '\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430...' : 'Yuborilmoqda...'}</>
              : <>{t.smsCodeBtn} <ArrowRight className="h-4 w-4" /></>
            }
          </button>
        </form>
      </AuthFormShell>
    )
  }
  