import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({ phone: z.string().min(9, 'Telefon raqam kiriting') })

export function ForgotPassword() {
  const navigate = useNavigate()
  const pushToast = useToastStore((state) => state.pushToast)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = () => {
    pushToast({ title: 'OTP yuborish endpointi tayyor', variant: 'info' })
    navigate('/otp-verification')
  }

  return (
    <AuthFormShell title="Parolni tiklash" description="Telefon raqamingizga OTP kod yuboriladi." footer={<Link className="font-bold text-ocean-600" to="/login">Kirish</Link>}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Telefon" {...register('phone')} error={formState.errors.phone?.message} />
        <button className="primary-button w-full" type="submit">OTP yuborish</button>
      </form>
    </AuthFormShell>
  )
}
