import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { FileUpload } from '../../components/forms/FileUpload.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kiriting'),
  lastName: z.string().min(2, 'Familiya kiriting'),
  phone: z.string().min(9, 'Telefon kiriting'),
  password: z.string().min(6, 'Parol kiriting'),
  farmName: z.string().min(2, 'Ferma nomi kiriting'),
  region: z.string().min(2, 'Viloyat kiriting'),
  district: z.string().min(2, 'Tuman kiriting'),
  gpsLocation: z.string().min(3, 'GPS lokatsiya kiriting'),
  stir: z.string().min(9, 'STIR kiriting'),
})

export function FarmRegistration() {
  const pushToast = useToastStore((state) => state.pushToast)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = () => {
    pushToast({
      title: 'Ferma ro‘yxatdan o‘tish formasi tayyor',
      description: 'Status: PENDING. Admin tasdiqlagach APPROVED yoki REJECTED bo‘ladi.',
      variant: 'success',
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean-600">PENDING · APPROVED · REJECTED</p>
            <h1 className="mt-2 text-4xl font-black">Ferma registratsiyasi</h1>
          </div>
          <Link className="secondary-button" to="/login">Kirishga qaytish</Link>
        </div>
        <form className="glass-card grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <FormInput label="Ism" {...register('firstName')} error={formState.errors.firstName?.message} />
          <FormInput label="Familiya" {...register('lastName')} error={formState.errors.lastName?.message} />
          <FormInput label="Telefon" {...register('phone')} error={formState.errors.phone?.message} />
          <FormInput label="Parol" type="password" {...register('password')} error={formState.errors.password?.message} />
          <FormInput label="Ferma nomi" {...register('farmName')} error={formState.errors.farmName?.message} />
          <FormInput label="STIR" {...register('stir')} error={formState.errors.stir?.message} />
          <FormInput label="Viloyat" {...register('region')} error={formState.errors.region?.message} />
          <FormInput label="Tuman" {...register('district')} error={formState.errors.district?.message} />
          <label className="block md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-ocean-600" />
              GPS lokatsiya
            </span>
            <input className="soft-input" placeholder="41.311081, 69.240562" {...register('gpsLocation')} />
            {formState.errors.gpsLocation ? <span className="mt-2 block text-xs font-medium text-rose-500">{formState.errors.gpsLocation.message}</span> : null}
          </label>
          <FileUpload label="Ferma rasmi" name="farmImage" register={register} />
          <div className="flex items-end">
            <button className="primary-button w-full" type="submit">PENDING so‘rov yuborish</button>
          </div>
        </form>
      </section>
    </main>
  )
}
