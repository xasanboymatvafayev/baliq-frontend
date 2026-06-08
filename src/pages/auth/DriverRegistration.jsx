import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { FileUpload } from '../../components/forms/FileUpload.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { httpClient, fileService } from '../../services/api/index.js'

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

export function DriverRegistration() {
  const pushToast = useToastStore((state) => state.pushToast)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  // Rasmni serverga yuklash va URL olish
  const uploadImage = async (fileList) => {
    if (!fileList || fileList.length === 0) return null
    const formData = new FormData()
    formData.append('file', fileList[0])
    try {
      const result = await fileService.upload(formData)
      return result.url || result.file_url || null
    } catch (err) {
      console.error('Rasm yuklashda xatolik:', err)
      return null
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Rasmlarni yuklash
      const licenseImageUrl = await uploadImage(data.licenseImage)
      const technicalPassportImageUrl = await uploadImage(data.technicalPassportImage)

      // 1. Ro'yxatdan o'tamiz
      const regResult = await httpClient.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
      })
      pushToast({
        title: "Ro'yxatdan o'tdingiz!",
        description: "Telefon raqamingizni tasdiqlang, keyin haydovchi so'rovini yuboring.",
        variant: 'success',
      })
      localStorage.setItem('pending-driver-registration', JSON.stringify({
        carBrand: data.carBrand,
        plateNumber: data.plateNumber,
        capacity: data.capacity,
        phone: data.phone,
        licenseImage: licenseImageUrl,
        technicalPassportImage: technicalPassportImageUrl,
      }))
      navigate('/otp-verification', {
        state: { phone: data.phone, userId: regResult.user_id, redirect: '/driver/dashboard', pendingDriver: true }
      })
    } catch (err) {
      if (err.message?.includes('allaqachon')) {
        try {
          const loginResult = await httpClient.post('/auth/login', { phone: data.phone, password: data.password })
          setSession({ user: loginResult.user, role: loginResult.role, token: loginResult.token })

          // Rasmlarni yuklash (agar oldin yuklangan bo'lmasa)
          const licenseImageUrl = await uploadImage(data.licenseImage)
          const technicalPassportImageUrl = await uploadImage(data.technicalPassportImage)

          await httpClient.post('/drivers', {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            carBrand: data.carBrand,
            plateNumber: data.plateNumber,
            capacity: data.capacity,
            licenseImage: licenseImageUrl,
            technicalPassportImage: technicalPassportImageUrl,
          })
          pushToast({
            title: "Haydovchi so'rovi yuborildi!",
            description: 'Admin tasdiqlashini kuting. Telegram bot orqali xabar olasiz.',
            variant: 'success',
          })
          navigate('/driver/dashboard')
        } catch (e2) {
          if (e2.message?.includes('tasdiqlanmagan')) {
            pushToast({ title: 'Avval OTP orqali telefon raqamingizni tasdiqlang', variant: 'warning' })
            navigate('/otp-verification', { state: { phone: data.phone, pendingDriver: true } })
          } else {
            pushToast({ title: e2.message, variant: 'error' })
          }
        }
      } else {
        pushToast({ title: err.message, variant: 'error' })
      }
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
            <p className="mt-1 text-sm text-slate-500">So'rovingiz yuborilgandan so'ng admin tasdiqini kuting. Telegram orqali xabar olasiz.</p>
          </div>
          <Link className="secondary-button" to="/login">Kirishga qaytish</Link>
        </div>
        <form className="glass-card grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2"><h3 className="font-bold text-ocean-600 mb-3">👤 Shaxsiy ma'lumotlar</h3></div>
          <FormInput label="Ism" {...register('firstName')} error={formState.errors.firstName?.message} />
          <FormInput label="Familiya" {...register('lastName')} error={formState.errors.lastName?.message} />
          <FormInput label="Telefon" placeholder="+998901234567" {...register('phone')} error={formState.errors.phone?.message} />
          <FormInput label="Parol" type="password" placeholder="••••••••" {...register('password')} error={formState.errors.password?.message} />
          <div className="md:col-span-2 border-t border-slate-200 dark:border-white/10 pt-4"><h3 className="font-bold text-ocean-600 mb-3">🚚 Transport ma'lumotlari</h3></div>
          <FormInput label="Mashina markasi" placeholder="Nexia, Cobalt..." {...register('carBrand')} error={formState.errors.carBrand?.message} />
          <FormInput label="Mashina raqami" placeholder="01A 123 BC" {...register('plateNumber')} error={formState.errors.plateNumber?.message} />
          <FormInput label="Yuk sig'imi (kg)" placeholder="1000" {...register('capacity')} error={formState.errors.capacity?.message} />
          <div />
          <FileUpload label="Haydovchilik guvohnomasi rasmi (majburiy)" name="licenseImage" register={register} error={formState.errors.licenseImage?.message} />
          <FileUpload label="Tex pasport rasmi (majburiy)" name="technicalPassportImage" register={register} error={formState.errors.technicalPassportImage?.message} />
          <button className="primary-button md:col-span-2" type="submit" disabled={loading}>
            {loading ? 'Yuborilmoqda...' : "So'rov yuborish"}
          </button>
        </form>
      </section>
    </main>
  )
}
