import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kiriting'),
  lastName: z.string().min(2, 'Familiya kiriting'),
  phone: z.string().min(9, 'Telefon kiriting'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
})

export function Register() {
  const navigate = useNavigate()
  const pushToast = useToastStore((state) => state.pushToast)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = () => {
    pushToast({ title: 'Ro‘yxatdan o‘tish so‘rovi tayyor', description: 'API ulanganda OTP yuboriladi.', variant: 'success' })
    navigate('/otp-verification')
  }

  return (
    <AuthFormShell title="Ro‘yxatdan o‘tish" description="Mijoz sifatida yangi akkount yarating." footer={<Link className="font-bold text-ocean-600" to="/login">Kirish sahifasiga qaytish</Link>}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Ism" {...register('firstName')} error={formState.errors.firstName?.message} />
          <FormInput label="Familiya" {...register('lastName')} error={formState.errors.lastName?.message} />
        </div>
        <FormInput label="Telefon" {...register('phone')} error={formState.errors.phone?.message} />
        <FormInput label="Parol" type="password" {...register('password')} error={formState.errors.password?.message} />
        <button className="primary-button w-full" type="submit">Davom etish</button>
      </form>
    </AuthFormShell>
  )
}
