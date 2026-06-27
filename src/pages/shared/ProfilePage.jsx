import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { httpClient } from '../../services/api/index.js'
import { Trash2, AlertTriangle, Send, Lock, Eye, EyeOff, CheckCircle2, Camera, User, Upload } from 'lucide-react'

// === Avatar Upload ===
function AvatarUpload({ profile, onUpload }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const pushToast = useToastStore((s) => s.pushToast)

  const initials = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || '?'

  const avatarUrl = preview || profile?.avatar_url

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      pushToast({ title: "Faqat rasm faylini tanlang", variant: 'error' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast({ title: "Rasm 5MB dan oshmasligi kerak", variant: 'error' })
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await httpClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await onUpload(res.url || res.file_url || res)
      pushToast({ title: 'Avatar yangilandi ✅', variant: 'success' })
    } catch {
      pushToast({ title: 'Rasmni yuklashda xatolik', variant: 'error' })
      setPreview(null)
    } finally {
      setUploading(false)
    }
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 mb-6">
      <div className="relative group">
        <div className="h-24 w-24 rounded-3xl overflow-hidden bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shrink-0 shadow-xl shadow-ocean-500/20">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-white">{initials}</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
              <span className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-2xl bg-ocean-600 text-white flex items-center justify-center shadow-lg hover:bg-ocean-500 transition-all hover:scale-110 disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <div>
        <p className="font-black text-lg">{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Foydalanuvchi'}</p>
        <p className="text-sm text-slate-500">{profile?.phone || ''}</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ocean-600 hover:text-ocean-500 transition-colors disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Yuklanmoqda...' : "Rasmni o'zgartirish"}
        </button>
        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, max 5MB</p>
      </div>
    </div>
  )
}

// === O'chirish modali ===
function DeleteAccountModal({ open, onClose }) {
  const pushToast = useToastStore((s) => s.pushToast)
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [step, setStep] = useState('request')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const resetAndClose = () => { setStep('request'); setOtp(''); onClose() }

  const requestOtp = async () => {
    setLoading(true)
    try {
      await httpClient.post('/auth/request-delete-otp')
      setStep('verify')
      pushToast({ title: 'Tasdiqlash kodi Telegram orqali yuborildi', variant: 'success' })
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    } finally { setLoading(false) }
  }

  const confirmDelete = async () => {
    if (!otp || otp.length < 4) { pushToast({ title: "Tasdiqlash kodini kiriting", variant: 'error' }); return }
    setLoading(true)
    try {
      await httpClient.delete('/auth/delete-account', { data: { otp, phone: user?.phone } })
      pushToast({ title: "Akkauntingiz o'chirildi", variant: 'success' })
      logout(); navigate('/login')
    } catch (err) {
      pushToast({ title: err.message, variant: 'error' })
    } finally { setLoading(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="glass-card max-w-md w-full p-6 space-y-5 animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-900/30">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
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
              Barcha ma'lumotlaringiz to'liq o'chiriladi.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="secondary-button" onClick={resetAndClose} disabled={loading}>Bekor qilish</button>
              <button className="danger-button flex items-center gap-2" onClick={requestOtp} disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? 'Yuborilmoqda...' : 'Telegram kodi yuborish'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">Telegram botga yuborilgan 6 xonali kodni kiriting:</p>
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
              <button className="danger-button" onClick={confirmDelete} disabled={loading || otp.length < 4}>
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
    mutationFn: () => httpClient.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword }),
    onSuccess: () => {
      pushToast({ title: "Parol muvaffaqiyatli o'zgartirildi ✅", variant: 'success' })
      setOldPassword(''); setNewPassword(''); setConfirmPassword('')
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  const canSubmit = oldPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) {
      if (newPassword.length > 0 && newPassword.length < 6) pushToast({ title: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak", variant: 'error' })
      else if (newPassword !== confirmPassword) pushToast({ title: "Yangi parollar mos kelmadi", variant: 'error' })
      return
    }
    mutation.mutate()
  }

  return (
    <section className="glass-card p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400">
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
            <input type={showOld ? 'text' : 'password'} className="soft-input w-full pr-10" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Joriy parolingiz" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowOld((v) => !v)}>
              {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Yangi parol</label>
          <div className="relative mt-1">
            <input type={showNew ? 'text' : 'password'} className="soft-input w-full pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Kamida 6 ta belgi" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowNew((v) => !v)}>
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword.length > 0 && (
            <div className="mt-1.5 flex gap-1">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${newPassword.length >= i * 2 ? (newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200 dark:bg-white/10'}`} />
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Yangi parolni tasdiqlang</label>
          <input type={showNew ? 'text' : 'password'} className="soft-input w-full mt-1" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Yangi parolni qayta kiriting" />
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <p className="text-xs text-rose-500 mt-1">⚠️ Parollar mos kelmadi</p>
          )}
          {confirmPassword.length > 0 && newPassword === confirmPassword && (
            <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Parollar mos keldi</p>
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

  const { data: profile, isLoading } = useQuery({
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

  const avatarMutation = useMutation({
    mutationFn: (avatar_url) => httpClient.put('/settings/profile', { ...profile, avatar_url }),
    onSuccess: () => queryClient.invalidateQueries(['profile']),
  })

  return (
    <>
      <DeleteAccountModal open={showDelete} onClose={() => setShowDelete(false)} />
      <div className="space-y-6 max-w-3xl">
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Profil</h2>
              <p className="text-sm text-slate-500">Shaxsiy ma'lumotlaringizni tahrirlang</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="h-24 w-24 rounded-3xl bg-slate-200 dark:bg-white/10 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-36 rounded-lg bg-slate-200 dark:bg-white/10" />
                  <div className="h-4 w-28 rounded-lg bg-slate-200 dark:bg-white/10" />
                  <div className="h-3 w-24 rounded-lg bg-slate-200 dark:bg-white/10" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-11 rounded-xl bg-slate-200 dark:bg-white/10" />)}
              </div>
            </div>
          ) : (
            <>
              <AvatarUpload profile={profile} onUpload={avatarMutation.mutateAsync} />
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
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
            </>
          )}
        </section>

        <ChangePasswordSection />

        <section className="glass-card border border-rose-200 dark:border-rose-900/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-rose-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Akkauntni o'chirish
              </h3>
              <p className="mt-1 text-sm text-slate-500">Barcha ma'lumotlar to'liq o'chiriladi. Telegram tasdiqlovi talab qilinadi.</p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-rose-600 border border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
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
