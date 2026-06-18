import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { authService } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kiriting'),
  lastName: z.string().min(2, 'Familiya kiriting'),
  phone: z.string().min(9, 'Telefon kiriting'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
})

export function Register() {
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // 1. Ro'yxatdan o'tamiz — backend linked/not_linked qaytaradi
      const result = await authService.register(data)

      if (result.linked === false) {
        // Telegram ulanmagan — OTP sahifasiga o'tamiz, u yerda bot yo'riqnomasi chiqadi
        pushToast({ title: 'Telegram bot bilan ulanishingiz kerak', variant: 'info' })
        navigate('/otp-verification', {
          state: {
            phone: data.phone,
            userId: result.user_id,
            linked: false,
            botLink: result.bot_link,
            botUsername: result.bot_username,
          }
        })
      } else {
        // Telegram ulangan — OTP yuborildi
        pushToast({ title: 'OTP Telegram botga yuborildi!', variant: 'success' })
        navigate('/otp-verification', {
          state: { phone: data.phone, userId: result.user_id, linked: true }
        })
      }
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      title="Ro'yxatdan o'tish"
      description="Mijoz sifatida yangi akkount yarating."
      footer={<Link className="font-bold text-ocean-600" to="/login">Kirish sahifasiga qaytish</Link>}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Ism" {...register('firstName')} error={formState.errors.firstName?.message} />
          <FormInput label="Familiya" {...register('lastName')} error={formState.errors.lastName?.message} />
        </div>
        <FormInput label="Telefon" placeholder="+998 90 000 00 00" {...register('phone')} error={formState.errors.phone?.message} />
        <FormInput label="Parol" type="password" {...register('password')} error={formState.errors.password?.message} />
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? 'Tekshirilmoqda...' : 'Davom etish'}
        </button>
      </form>
    </AuthFormShell>
  )
}
