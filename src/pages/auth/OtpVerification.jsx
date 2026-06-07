import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { AuthFormShell } from './AuthFormShell.jsx'

const schema = z.object({ otp: z.string().length(6, '6 xonali OTP kod kiriting') })

export function OtpVerification() {
  const navigate = useNavigate()
  const pushToast = useToastStore((state) => state.pushToast)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = () => {
    pushToast({ title: 'OTP tekshiruv endpointi tayyor', variant: 'success' })
    navigate('/reset-password')
  }

  return (
    <AuthFormShell title="OTP Verification" description="Telefoningizga kelgan 6 xonali kodni kiriting.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="OTP kod" inputMode="numeric" maxLength="6" {...register('otp')} error={formState.errors.otp?.message} />
        <button className="primary-button w-full" type="submit">Tasdiqlash</button>
      </form>
    </AuthFormShell>
  )
}
