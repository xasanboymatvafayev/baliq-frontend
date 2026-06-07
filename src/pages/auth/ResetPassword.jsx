import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
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
  const pushToast = useToastStore((state) => state.pushToast)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = () => {
    pushToast({ title: 'Parol tiklash endpointi tayyor', variant: 'success' })
    navigate('/login')
  }

  return (
    <AuthFormShell title="Reset Password" description="Yangi parolni kiriting.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Yangi parol" type="password" {...register('password')} error={formState.errors.password?.message} />
        <FormInput label="Parolni tasdiqlash" type="password" {...register('confirmPassword')} error={formState.errors.confirmPassword?.message} />
        <button className="primary-button w-full" type="submit">Saqlash</button>
      </form>
    </AuthFormShell>
  )
}
