import { zodResolver } from '@hookform/resolvers/zod'
  import { Link, useNavigate } from 'react-router-dom'
  import { useForm } from 'react-hook-form'
  import { z } from 'zod'
  import { useState } from 'react'
  import { Loader2 } from 'lucide-react'
  import { FileUpload } from '../../components/forms/FileUpload.jsx'
  import { FormInput } from '../../components/forms/FormInput.jsx'
  import { useToastStore } from '../../store/toastStore.js'
  import { authService, fileService } from '../../services/api/index.js'

  const schema = z.object({
    firstName: z.string().min(2, 'Ism kiriting'),
    lastName: z.string().min(2, 'Familiya kiriting'),
    phone: z.string().min(9, 'Telefon kiriting'),
    password: z.string().min(6, 'Parol kamida 6 ta belgi'),
    carBrand: z.string().min(2, 'Mashina markasi kiriting'),
    plateNumber: z.string().min(4, 'Mashina raqami kiriting'),
    capacity: z.string().min(1, "Yuk sig'imi kiriting"),
    licenseImage: z.any().refine((files) => files && files.length > 0, 'Haydovchilik guvohnomasi rasmi majburiy'),
    technicalPassportImage: z.any().refine((files) => files && files.length > 0, 'Tex pasport rasmi majburiy'),
  })

  function toE164(raw) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('998')) return `+${digits}`
    if (digits.startsWith('0')) return `+998${digits.slice(1)}`
    if (digits.length === 9) return `+998${digits}`
    return `+${digits}`
  }

  export function DriverRegistration() {
    const pushToast = useToastStore((state) => state.pushToast)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

    const uploadImage = async (fileList) => {
      if (!fileList || fileList.length === 0) return null
      const formData = new FormData()
      formData.append('file', fileList[0])
      try { const r = await fileService.publicUpload(formData); return r.url || r.file_url || null } catch { return null }
    }

    const onSubmit = async (data) => {
      setLoading(true)
      try {
        const licenseImageUrl = await uploadImage(data.licenseImage)
        const technicalPassportImageUrl = await uploadImage(data.technicalPassportImage)

        localStorage.setItem('pending-driver-registration', JSON.stringify({
          carBrand: data.carBrand, plateNumber: data.plateNumber,
          capacity: data.capacity, phone: toE164(data.phone),
          licenseImage: licenseImageUrl, technicalPassportImage: technicalPassportImageUrl,
        }))

        const e164 = toE164(data.phone)
        const result = await authService.register({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: e164,
          password: data.password,
        })
        pushToast({
          title: result.linked ? "OTP kod Telegram botga yuborildi \u2705" : "Telegram botni ulab, kodni oling",
          variant: result.linked ? 'success' : 'info',
        })
        navigate('/otp-verification', {
          state: {
            phone: e164,
            userId: result.user_id,
            linked: result.linked,
            botLink: result.bot_link,
            botUsername: result.bot_username,
            pendingDriver: true,
          },
        })
      } catch (err) {
        pushToast({ title: err.message || 'Xatolik yuz berdi', variant: 'error' })
      } finally {
        setLoading(false)
      }
    }

    return (
      <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
        <section className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean-600">Driver onboarding</p>
              <h1 className="mt-2 text-4xl font-black">Haydovchi registratsiyasi</h1>
              <p className="mt-1 text-sm text-slate-500">So\u2019rovingiz yuborilgandan so\u2019ng admin tasdiqini kuting. Telegram orqali xabar olasiz.</p>
            </div>
            <Link className="secondary-button" to="/login">Kirishga qaytish</Link>
          </div>

          <form className="glass-card grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="md:col-span-2"><h3 className="font-bold text-ocean-600 mb-3">\u{1F464} Shaxsiy ma\u2019lumotlar</h3></div>
            <FormInput label="Ism" {...register('firstName')} error={formState.errors.firstName?.message} />
            <FormInput label="Familiya" {...register('lastName')} error={formState.errors.lastName?.message} />
            <FormInput label="Telefon" placeholder="+998901234567" {...register('phone')} error={formState.errors.phone?.message} />
            <FormInput label="Parol" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" {...register('password')} error={formState.errors.password?.message} />
            <div className="md:col-span-2 border-t border-slate-200 dark:border-white/10 pt-4"><h3 className="font-bold text-ocean-600 mb-3">\u{1F69A} Transport ma\u2019lumotlari</h3></div>
            <FormInput label="Mashina markasi" placeholder="Nexia, Cobalt..." {...register('carBrand')} error={formState.errors.carBrand?.message} />
            <FormInput label="Mashina raqami" placeholder="01A 123 BC" {...register('plateNumber')} error={formState.errors.plateNumber?.message} />
            <FormInput label="Yuk sig'imi (kg)" placeholder="1000" {...register('capacity')} error={formState.errors.capacity?.message} />
            <div />
            <FileUpload label="Haydovchilik guvohnomasi rasmi (majburiy)" name="licenseImage" register={register} error={formState.errors.licenseImage?.message} />
            <FileUpload label="Tex pasport rasmi (majburiy)" name="technicalPassportImage" register={register} error={formState.errors.technicalPassportImage?.message} />
            <button className="primary-button md:col-span-2" type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Yuborilmoqda...</> : "So\u2019rov yuborish"}
            </button>
          </form>
        </section>
      </main>
    )
  }
  