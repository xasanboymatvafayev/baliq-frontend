import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { authService } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
  confirmPassword: z.string().min(6, 'Parolni qayta kiriting'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parollar mos emas',
  path: ['confirmPassword'],
})

export function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const pushToast = useToastStore((state) => state.pushToast)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const resetToken = location.state?.reset_token

  const onSubmit = async (data) => {
    if (!resetToken) {
      pushToast({ title: 'Token topilmadi. Qayta urinib ko\'ring.', variant: 'error' })
      navigate('/forgot-password')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword({ token: resetToken, new_password: data.password })
      pushToast({ title: 'Parol muvaffaqiyatli yangilandi!', variant: 'success' })
      navigate('/login')
    } catch (err) {
      pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell title="Reset Password" description="Yangi parolni kiriting.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Yangi parol" type="password" {...register('password')} error={formState.errors.password?.message} />
        <FormInput label="Parolni tasdiqlash" type="password" {...register('confirmPassword')} error={formState.errors.confirmPassword?.message} />
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>
    </AuthFormShell>
  )
}
