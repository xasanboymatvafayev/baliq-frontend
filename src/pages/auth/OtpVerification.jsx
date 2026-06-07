import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { authService } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({ otp: z.string().length(6, '6 xonali OTP kod kiriting') })

const ROLE_ROUTES = {
  'customer': '/customer/dashboard',
  'farm-owner': '/farm/dashboard',
  'driver': '/driver/dashboard',
  'admin': '/admin/dashboard',
  'manager': '/manager/dashboard',
  'super-admin': '/super-admin/system-statistics',
}

export function OtpVerification() {
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.pushToast)
  const setSession = useAuthStore((s) => s.setSession)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await authService.verifyOtp({ otp: data.otp })
      if (result.token) {
        setSession({ user: result.user, role: result.role, token: result.token })
        pushToast({ title: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", variant: 'success' })
        navigate(ROLE_ROUTES[result.role] || '/customer/dashboard')
      } else if (result.reset_token) {
        pushToast({ title: 'OTP tasdiqlandi', variant: 'success' })
        navigate('/reset-password', { state: { reset_token: result.reset_token } })
      }
    } catch (err) {
      pushToast({ title: err.message || "OTP noto'g'ri", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell title="OTP Tasdiqlash" description="Telegram botga yuborilgan 6 xonali kodni kiriting.">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/30">
        <svg className="h-8 w-8 shrink-0 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.02 9.52c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.883.701z"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">OTP Telegram botga yuborildi</p>
          <a href="https://t.me/BaliqSavdosiVerificationBot" target="_blank" rel="noopener noreferrer"
            className="text-xs text-sky-600 underline dark:text-sky-400">
            @BaliqSavdosiVerificationBot ni oching
          </a>
        </div>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="OTP kod" inputMode="numeric" maxLength="6" placeholder="000000"
          {...register('otp')} error={formState.errors.otp?.message} />
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
        </button>
      </form>
    </AuthFormShell>
  )
}
