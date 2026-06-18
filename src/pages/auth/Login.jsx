import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { authService } from '../../services/api/index.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  phone: z.string().min(9, 'Telefon raqam kiriting'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
})

const ROLE_ROUTES = {
  'customer': '/customer/dashboard',
  'farm-owner': '/farm/dashboard',
  'driver': '/driver/dashboard',
  'admin': '/admin/dashboard',
  'manager': '/manager/dashboard',
  'super-admin': '/super-admin/system-statistics',
}

export function Login() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const pushToast = useToastStore((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await authService.login(data)
      const userRole = result.user?.role || result.role || 'customer'
      setSession({ user: result.user, role: userRole, token: result.token })
      pushToast({ title: 'Muvaffaqiyatli kirdingiz!', variant: 'success' })
      navigate(ROLE_ROUTES[userRole] || '/customer/dashboard')
    } catch (err) {
      pushToast({ title: err.message || "Telefon yoki parol noto'g'ri", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      title="Kirish"
      description="Telefon raqam va parol orqali platformaga kiring."
      footer={<>Akkount yo'qmi? <Link className="font-bold text-ocean-600" to="/register">Ro'yxatdan o'tish</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Telefon" placeholder="+998 90 000 00 00" {...register('phone')} error={formState.errors.phone?.message} />
        <FormInput label="Parol" type="password" placeholder="••••••••" {...register('password')} error={formState.errors.password?.message} />
        <div className="flex justify-end">
          <Link className="text-sm font-semibold text-ocean-600" to="/forgot-password">Parolni unutdingizmi?</Link>
        </div>
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? 'Kirilmoqda...' : 'Kirish'}
        </button>
      </form>
    </AuthFormShell>
  )
}
