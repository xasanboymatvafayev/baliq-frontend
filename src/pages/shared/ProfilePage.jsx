import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { httpClient } from '../../services/api/index.js'
import { Trash2, AlertTriangle, Send, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

// === O'chirish modali ===
function DeleteAccountModal({ open, onClose }) {
  const pushToast = useToastStore((s) => s.pushToast)
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // request | verify
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const resetAndClose = () => {
    setStep('request')
    setOtp('')
    onClose()
  }

  const requestOtp = async () => {
    setLoading(true)
    try {
      await httpClient.post('/auth/request-delete-otp')
      setStep('verify')
      pushToast({ title: 'Tasdiqlash kodi Telegram orqali yuborildi', variant: 'success' })
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!otp || otp.length < 4) {
      pushToast({ title: "Tasdiqlash kodini kiriting", variant: 'error' })
      return
    }
    setLoading(true)
    try {
      await httpClient.delete('/auth/delete-account', { data: { otp, phone: user?.phone } })
      pushToast({ title: "Akkauntingiz o'chirildi", variant: 'success' })
      logout()
      navigate('/login')
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div className="glass-card max-w-md w-full p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-rose-600">Akkauntni o'chirish</h3>
            <p className="text-sm text-slate-500">Bu amalni bekor qilib bo'lmaydi</p>
          </div>
        </div>

        {step === 'request' ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Akkauntingizni o'chirishni tasdiqlash uchun Telegram botga tasdiqlash kodi yuboriladi.
              Barcha ma'lumotlaringiz (fermalar, buyurtmalar, profil) to'liq o'chiriladi.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="secondary-button" onClick={resetAndClose} disabled={loading}>Bekor qilish</button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600"
                onClick={requestOtp}
                disabled={loading}
              >
                <Send className="h-4 w-4" />
                {loading ? 'Yuborilmoqda...' : 'Telegram kodi yuborish'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Telegram botga yuborilgan 6 xonali kodni kiriting:
            </p>
            <input
              className="soft-input text-center text-2xl tracking-widest font-mono w-full"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button className="secondary-button" onClick={resetAndClose} disabled={loading}>Bekor qilish</button>
              <button
                className="px-5 py-2.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600"
                onClick={confirmDelete}
                disabled={loading || otp.length < 4}
              >
                {loading ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


// === Parolni o'zgartirish ===
function ChangePasswordSection() {
  const pushToast = useToastStore((s) => s.pushToast)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [success, setSuccess] = useState(false)

  const mutation = useMutation({
    mutationFn: () => httpClient.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
    onSuccess: () => {
      pushToast({ title: 'Parol muvaffaqiyatli o\'zgartirildi ✅', variant: 'success' })
      setOldPassword(''); setNewPassword(''); setConfirmPassword('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  const canSubmit = oldPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) {
      if (newPassword.length > 0 && newPassword.length < 6) {
        pushToast({ title: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak', variant: 'error' })
      } else if (newPassword !== confirmPassword) {
        pushToast({ title: 'Yangi parollar mos kelmadi', variant: 'error' })
      }
      return
    }
    mutation.mutate()
  }

  return (
    <section className="glass-card p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-ocean-100 text-ocean-600 dark:bg-ocean-900/30 dark:text-ocean-400">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-black">Parolni o'zgartirish</h3>
      </div>
      <p className="mt-1 mb-5 text-sm text-slate-500">Xavfsizlik uchun vaqti-vaqti bilan parolingizni yangilang.</p>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Parol yangilandi!
        </div>
      )}

      <form className="space-y-4 max-w-md" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Joriy parol</label>
          <div className="relative mt-1">
            <input
              type={showOld ? 'text' : 'password'}
              className="soft-input w-full pr-10"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Joriy parolingiz"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowOld((v) => !v)}>
              {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Yangi parol</label>
          <div className="relative mt-1">
            <input
              type={showNew ? 'text' : 'password'}
              className="soft-input w-full pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowNew((v) => !v)}>
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Yangi parolni tasdiqlang</label>
          <input
            type={showNew ? 'text' : 'password'}
            className="soft-input w-full mt-1"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Yangi parolni qayta kiriting"
          />
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <p className="text-xs text-rose-500 mt-1">Parollar mos kelmadi</p>
          )}
        </div>

        <button className="primary-button" type="submit" disabled={mutation.isPending || !canSubmit}>
          {mutation.isPending ? 'Yangilanmoqda...' : 'Parolni yangilash'}
        </button>
      </form>
    </section>
  )
}

export function ProfilePage() {
  usePageTitle('Profil')
  const pushToast = useToastStore((state) => state.pushToast)
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => httpClient.get('/settings/profile'),
  })

  useEffect(() => {
    if (profile) reset(profile)
  }, [profile, reset])

  const mutation = useMutation({
    mutationFn: (data) => httpClient.put('/settings/profile', data),
    onSuccess: () => {
      pushToast({ title: 'Profil muvaffaqiyatli yangilandi', variant: 'success' })
      queryClient.invalidateQueries(['profile'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <>
      <DeleteAccountModal open={showDelete} onClose={() => setShowDelete(false)} />
      <div className="space-y-6 max-w-3xl">
        <section className="glass-card p-6">
          <h2 className="text-3xl font-black">Profil</h2>
          <p className="mt-2 text-slate-500">Shaxsiy ma'lumotlaringizni tahrirlang.</p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <FormInput label="Ism" {...register('firstName')} />
            <FormInput label="Familiya" {...register('lastName')} />
            <FormInput label="Telefon" {...register('phone')} />
            <FormInput label="Email" {...register('email')} />
            <div className="sm:col-span-2">
              <button className="primary-button" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </section>

        <ChangePasswordSection />

        {/* Xavfli zona */}
        <section className="glass-card border border-rose-200 dark:border-rose-900/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-rose-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Akkauntni o'chirish
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Barcha ma'lumotlar to'liq o'chiriladi. Telegram tasdiqlovi talab qilinadi.
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-rose-600 border border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Akkauntni o'chirish
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
