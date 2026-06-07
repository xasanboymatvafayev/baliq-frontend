import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  phone: z.string().min(9, 'Telefon raqam kiriting'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
})

export function Login() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const pushToast = useToastStore((state) => state.pushToast)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = (payload) => {
    setSession({
      user: { firstName: 'Frontend', lastName: 'User', phone: payload.phone },
      role: 'customer',
      token: null,
    })
    pushToast({ title: 'Frontend sessiya tayyor', description: 'Backend ulanganda real token saqlanadi.', variant: 'success' })
    navigate('/customer/dashboard')
  }

  return (
    <AuthFormShell
      title="Kirish"
      description="Telefon raqam va parol orqali platformaga kiring."
      footer={
        <>
          Akkount yo‘qmi?{' '}
          <Link className="font-bold text-ocean-600" to="/register">
            Ro‘yxatdan o‘tish
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Telefon" placeholder="+998 90 000 00 00" {...register('phone')} error={formState.errors.phone?.message} />
        <FormInput label="Parol" type="password" placeholder="••••••••" {...register('password')} error={formState.errors.password?.message} />
        <div className="flex justify-end">
          <Link className="text-sm font-semibold text-ocean-600" to="/forgot-password">
            Parolni unutdingizmi?
          </Link>
        </div>
        <button className="primary-button w-full" type="submit">
          Kirish
        </button>
      </form>
    </AuthFormShell>
  )
}
