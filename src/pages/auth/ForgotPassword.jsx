import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { authService } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({ phone: z.string().min(9, 'Telefon raqam kiriting') })

export function ForgotPassword() {
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const tg = await authService.checkTelegram(data.phone)
      if (!tg.linked) {
        navigate(`/telegram-link?phone=${encodeURIComponent(data.phone)}&flow=forgot-password`)
        return
      }
      const result = await authService.forgotPassword({ phone: data.phone })
      pushToast({ title: 'OTP Telegram botga yuborildi!', variant: 'success' })
      navigate('/otp-verification', { state: { phone: data.phone, userId: result.user_id, linked: true } })
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      title="Parolni tiklash"
      description="Telegram bot orqali OTP kod yuboriladi."
      footer={<Link className="font-bold text-ocean-600" to="/login">Kirishga qaytish</Link>}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Telefon" placeholder="+998 90 000 00 00" {...register('phone')} error={formState.errors.phone?.message} />
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? 'Tekshirilmoqda...' : 'OTP yuborish'}
        </button>
      </form>
    </AuthFormShell>
  )
}
