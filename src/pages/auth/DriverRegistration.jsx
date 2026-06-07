import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FileUpload } from '../../components/forms/FileUpload.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kiriting'),
  lastName: z.string().min(2, 'Familiya kiriting'),
  phone: z.string().min(9, 'Telefon kiriting'),
  carBrand: z.string().min(2, 'Mashina markasi kiriting'),
  plateNumber: z.string().min(4, 'Mashina raqami kiriting'),
  capacity: z.string().min(1, 'Yuk sig‘imi kiriting'),
})

export function DriverRegistration() {
  const pushToast = useToastStore((state) => state.pushToast)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = () => {
    pushToast({ title: 'Haydovchi ro‘yxatdan o‘tish formasi tayyor', description: 'Admin tasdiqlash endpointiga ulanadi.', variant: 'success' })
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean-600">Driver onboarding</p>
            <h1 className="mt-2 text-4xl font-black">Haydovchi registratsiyasi</h1>
          </div>
          <Link className="secondary-button" to="/login">Kirishga qaytish</Link>
        </div>
        <form className="glass-card grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Ism" {...register('firstName')} error={formState.errors.firstName?.message} />
          <FormInput label="Familiya" {...register('lastName')} error={formState.errors.lastName?.message} />
          <FormInput label="Telefon" {...register('phone')} error={formState.errors.phone?.message} />
          <FormInput label="Mashina markasi" {...register('carBrand')} error={formState.errors.carBrand?.message} />
          <FormInput label="Mashina raqami" {...register('plateNumber')} error={formState.errors.plateNumber?.message} />
          <FormInput label="Yuk sig‘imi" {...register('capacity')} error={formState.errors.capacity?.message} />
          <FileUpload label="Haydovchilik guvohnomasi rasmi" name="licenseImage" register={register} />
          <FileUpload label="Tex pasport rasmi" name="technicalPassportImage" register={register} />
          <button className="primary-button md:col-span-2" type="submit">So‘rov yuborish</button>
        </form>
      </section>
    </main>
  )
}
